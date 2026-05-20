package org.example.myfarmbackend.repositories;

import org.example.myfarmbackend.models.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.TestPropertySource;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:user-repository-test;DB_CLOSE_DELAY=-1;MODE=LEGACY;NON_KEYWORDS=USER,USERS",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.data.mongodb.repositories.enabled=false"
})
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void saveAndFindByEmail() {
        User u = new User();
        u.setEmail("alice@farm.test");
        u.setUsername("Alice");
        u.setPassword("secret");
        userRepository.save(u);

        Optional<User> found = userRepository.findByEmail("alice@farm.test");
        assertTrue(found.isPresent());
        assertEquals("Alice", found.get().getUsername());
    }

    @Test
    void existsById_and_deleteById() {
        User u = new User();
        u.setEmail("bob@farm.test");
        u.setUsername("Bob");
        u.setPassword("secret");
        User saved = userRepository.saveAndFlush(u);
        entityManager.clear();

        assertTrue(userRepository.existsById(saved.getUserId()));
        userRepository.deleteById(saved.getUserId());
        userRepository.flush();
        entityManager.clear();

        assertTrue(userRepository.findById(saved.getUserId()).isEmpty());
    }
}
