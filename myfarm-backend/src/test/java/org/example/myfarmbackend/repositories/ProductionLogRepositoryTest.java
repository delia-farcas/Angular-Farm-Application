package org.example.myfarmbackend.repositories;

import org.example.myfarmbackend.models.ProductionLog;
import org.example.myfarmbackend.models.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:production-log-repository-test;DB_CLOSE_DELAY=-1;MODE=LEGACY;NON_KEYWORDS=USER,USERS",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.data.mongodb.repositories.enabled=false"
})
class ProductionLogRepositoryTest {

    @Autowired
    private ProductionLogRepository productionLogRepository;

    @Autowired
    private UserRepository userRepository;

    private User persistUser(String email) {
        User u = new User();
        u.setEmail(email);
        u.setUsername("u-" + email);
        u.setPassword("secret");
        return userRepository.save(u);
    }

    @Test
    void findByReportDateAndUserUserId_findsSavedLog() {
        User u = persistUser("owner1@farm.test");
        LocalDate date = LocalDate.of(2024, 2, 2);

        ProductionLog log = new ProductionLog();
        log.setReportDate(date);
        log.setMilkLitersCow(1.0);
        log.setUser(u);
        productionLogRepository.save(log);

        Optional<ProductionLog> found =
                productionLogRepository.findByReportDateAndUserUserId(date, u.getUserId());

        assertTrue(found.isPresent());
        assertEquals(date, found.get().getReportDate());
        assertEquals(1.0, found.get().getMilkLitersCow());
    }

    @Test
    void findByUserUserIdAndReportDateBetween_filtersByRange() {
        User u10 = persistUser("u10@farm.test");
        User u99 = persistUser("u99@farm.test");

        productionLogRepository.save(buildLog(u10, LocalDate.of(2024, 1, 1), 1.0));
        productionLogRepository.save(buildLog(u10, LocalDate.of(2024, 1, 15), 2.0));
        productionLogRepository.save(buildLog(u10, LocalDate.of(2024, 2, 1), 3.0));
        productionLogRepository.save(buildLog(u99, LocalDate.of(2024, 1, 10), 9.0));

        List<ProductionLog> result =
                productionLogRepository.findByUserUserIdAndReportDateBetween(
                        u10.getUserId(), LocalDate.of(2024, 1, 1), LocalDate.of(2024, 1, 31));

        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(l -> l.getUser().getUserId().equals(u10.getUserId())));
    }

    private ProductionLog buildLog(User owner, LocalDate date, double milkCow) {
        ProductionLog log = new ProductionLog();
        log.setReportDate(date);
        log.setMilkLitersCow(milkCow);
        log.setUser(owner);
        return log;
    }
}
