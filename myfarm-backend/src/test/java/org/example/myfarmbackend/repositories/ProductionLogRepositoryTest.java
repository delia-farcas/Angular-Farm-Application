package org.example.myfarmbackend.repositories;

import org.example.myfarmbackend.models.ProductionLog;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class ProductionLogRepositoryTest {

    @Test
    void save_ShouldAssignId_WhenIdIsNull() {
        ProductionLogRepository repo = new ProductionLogRepository();
        ProductionLog log = new ProductionLog(null, LocalDate.of(2024, 1, 1), 1.0, 0, 0, 0, 0, 0, 10L);

        ProductionLog saved = repo.save(log);

        assertNotNull(saved.getId());
        assertTrue(saved.getId() > 0);
        assertEquals(1, repo.findAll().size());
    }

    @Test
    void save_ShouldAssignId_WhenIdIsZero() {
        ProductionLogRepository repo = new ProductionLogRepository();
        ProductionLog log = new ProductionLog(0L, LocalDate.of(2024, 1, 1), 1.0, 0, 0, 0, 0, 0, 10L);

        ProductionLog saved = repo.save(log);

        assertNotNull(saved.getId());
        assertNotEquals(0L, saved.getId());
        assertEquals(1, repo.findAll().size());
    }

    @Test
    void save_ShouldUpdateExisting_WhenIdMatches() {
        ProductionLogRepository repo = new ProductionLogRepository();
        ProductionLog first = new ProductionLog(null, LocalDate.of(2024, 1, 1), 1.0, 0, 0, 0, 0, 0, 10L);
        repo.save(first);

        Long id = repo.findAll().get(0).getId();
        ProductionLog updated = new ProductionLog(id, LocalDate.of(2024, 1, 1), 5.0, 0, 0, 0, 0, 0, 10L);

        repo.save(updated);

        List<ProductionLog> all = repo.findAll();
        assertEquals(1, all.size());
        assertEquals(5.0, all.get(0).getMilkLitersCow());
    }

    @Test
    void save_ShouldAddNew_WhenIdNotFound() {
        ProductionLogRepository repo = new ProductionLogRepository();
        repo.save(new ProductionLog(null, LocalDate.of(2024, 1, 1), 1.0, 0, 0, 0, 0, 0, 10L));

        repo.save(new ProductionLog(999L, LocalDate.of(2024, 1, 2), 2.0, 0, 0, 0, 0, 0, 10L));

        assertEquals(2, repo.findAll().size());
    }

    @Test
    void findByDateAndUserId_ShouldFindMatchingLog() {
        ProductionLogRepository repo = new ProductionLogRepository();
        LocalDate date = LocalDate.of(2024, 2, 2);
        repo.save(new ProductionLog(null, date, 1.0, 0, 0, 0, 0, 0, 10L));

        Optional<ProductionLog> found = repo.findByDateAndUserId(date, 10L);

        assertTrue(found.isPresent());
        assertEquals(date, found.get().getReportDate());
        assertEquals(10L, found.get().getUserId());
    }

    @Test
    void findByDateAndUserId_ShouldReturnEmpty_WhenNoMatch() {
        ProductionLogRepository repo = new ProductionLogRepository();
        repo.save(new ProductionLog(null, LocalDate.of(2024, 2, 2), 1.0, 0, 0, 0, 0, 0, 10L));

        Optional<ProductionLog> found = repo.findByDateAndUserId(LocalDate.of(2024, 2, 3), 10L);

        assertTrue(found.isEmpty());
    }

    @Test
    void findByUserAndPeriod_ShouldFilterByUserAndDateInclusive() {
        ProductionLogRepository repo = new ProductionLogRepository();
        repo.save(new ProductionLog(null, LocalDate.of(2024, 1, 1), 1.0, 0, 0, 0, 0, 0, 10L));
        repo.save(new ProductionLog(null, LocalDate.of(2024, 1, 15), 2.0, 0, 0, 0, 0, 0, 10L));
        repo.save(new ProductionLog(null, LocalDate.of(2024, 2, 1), 3.0, 0, 0, 0, 0, 0, 10L));
        repo.save(new ProductionLog(null, LocalDate.of(2024, 1, 10), 4.0, 0, 0, 0, 0, 0, 99L));

        List<ProductionLog> result = repo.findByUserAndPeriod(
                10L,
                LocalDate.of(2024, 1, 1),
                LocalDate.of(2024, 1, 31)
        );

        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(l -> l.getUserId().equals(10L)));
        assertTrue(result.stream().allMatch(l -> !l.getReportDate().isBefore(LocalDate.of(2024, 1, 1))));
        assertTrue(result.stream().allMatch(l -> !l.getReportDate().isAfter(LocalDate.of(2024, 1, 31))));
    }

    @Test
    void findAll_ShouldReturnCopy_NotBackedByInternalList() {
        ProductionLogRepository repo = new ProductionLogRepository();
        repo.save(new ProductionLog(null, LocalDate.of(2024, 1, 1), 1.0, 0, 0, 0, 0, 0, 10L));

        List<ProductionLog> all = repo.findAll();
        all.clear();

        assertEquals(1, repo.findAll().size());
    }
}

