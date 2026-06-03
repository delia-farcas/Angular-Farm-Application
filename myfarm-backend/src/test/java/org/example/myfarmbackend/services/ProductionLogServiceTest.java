package org.example.myfarmbackend.services;

import org.example.myfarmbackend.dto.ProductionLogDTO;
import org.example.myfarmbackend.models.ProductionLog;
import org.example.myfarmbackend.models.User;
import org.example.myfarmbackend.repositories.AnimalRepository;
import org.example.myfarmbackend.repositories.ProductionLogRepository;
import org.example.myfarmbackend.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ProductionLogServiceTest {

    @Mock
    private ProductionLogRepository logRepository;

    @Mock
    private AnimalRepository animalRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProductionLogService productionLogService;

    private User user(long id) {
        return User.builder().userId(id).email("u" + id + "@t.com").username("u" + id).password("p").build();
    }

    private ProductionLog logForUser(User u, LocalDate date, double cow, int eggs) {
        ProductionLog log = new ProductionLog();
        log.setId(null);
        log.setReportDate(date);
        log.setMilkLitersCow(cow);
        log.setMilkLitersGoat(0);
        log.setMilkLitersSheep(0);
        log.setEggsCount(eggs);
        log.setMeatKg(0);
        log.setWoolKg(0);
        log.setWorkHours(0);
        log.setUser(u);
        return log;
    }

    @Test
    void getReport_ShouldCalculateWeeklySumsCorrectly() {
        User u = user(100L);
        ProductionLog log1 = logForUser(u, LocalDate.of(2024, 5, 2), 10.0, 0);
        ProductionLog log2 = logForUser(u, LocalDate.of(2024, 5, 5), 5.0, 0);

        when(logRepository.findAll()).thenReturn(List.of(log1, log2));

        Map<String, Double> report = productionLogService.getReport(100L, 2024, 5, "lapte").join();

        assertNotNull(report);
        assertEquals(15.0, report.get("1-7"));
        assertEquals(15.0, report.get("Total"));
    }

    @Test
    void getReport_ShouldCalculateAnnualSumsCorrectly() {
        User u = user(100L);
        ProductionLog logIan = logForUser(u, LocalDate.of(2024, 1, 10), 100.0, 0);
        ProductionLog logFeb = logForUser(u, LocalDate.of(2024, 2, 15), 50.0, 0);

        when(logRepository.findAll()).thenReturn(List.of(logIan, logFeb));

        Map<String, Double> report = productionLogService.getReport(100L, 2024, null, "lapte").join();

        assertEquals(100.0, report.get("Ianuarie"));
        assertEquals(50.0, report.get("Februarie"));
    }

    @Test
    void saveOrUpdateLog_ShouldSave_WhenNotExists() {
        User u = user(10L);
        ProductionLogDTO dto = new ProductionLogDTO();
        dto.setReportDate(LocalDate.of(2024, 5, 2));
        dto.setUserId(10L);
        dto.setMilkLitersCow(10.0);
        dto.setMilkLitersGoat(0);
        dto.setMilkLitersSheep(0);
        dto.setEggsCount(0);
        dto.setMeatKg(0);
        dto.setWoolKg(0);
        dto.setWorkHours(0);

        ProductionLog saved = new ProductionLog();
        saved.setId(1L);
        saved.setReportDate(dto.getReportDate());
        saved.setMilkLitersCow(10.0);
        saved.setUser(u);

        when(userRepository.findById(10L)).thenReturn(Optional.of(u));
        when(logRepository.findByReportDateAndUserUserId(dto.getReportDate(), 10L))
                .thenReturn(Optional.empty());
        when(logRepository.save(any(ProductionLog.class))).thenReturn(saved);

        ProductionLog result = productionLogService.saveOrUpdateLog(dto).join();

        assertNotNull(result);
        assertEquals(10.0, result.getMilkLitersCow());
        verify(logRepository).save(any(ProductionLog.class));
    }

    @Test
    void saveOrUpdateLog_ShouldReplaceFields_WhenExists() {
        User u = user(10L);
        ProductionLog existing = new ProductionLog();
        existing.setId(1L);
        existing.setReportDate(LocalDate.of(2024, 5, 2));
        existing.setMilkLitersCow(10.0);
        existing.setUser(u);

        ProductionLogDTO dto = new ProductionLogDTO();
        dto.setReportDate(LocalDate.of(2024, 5, 2));
        dto.setUserId(10L);
        dto.setMilkLitersCow(5.0);
        dto.setMilkLitersGoat(0);
        dto.setMilkLitersSheep(0);
        dto.setEggsCount(0);
        dto.setMeatKg(0);
        dto.setWoolKg(0);
        dto.setWorkHours(0);

        when(userRepository.findById(10L)).thenReturn(Optional.of(u));
        when(logRepository.findByReportDateAndUserUserId(dto.getReportDate(), 10L))
                .thenReturn(Optional.of(existing));
        when(logRepository.save(any(ProductionLog.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductionLog updated = productionLogService.saveOrUpdateLog(dto).join();

        assertEquals(5.0, updated.getMilkLitersCow());
    }

    @Test
    void saveOrUpdateLog_ShouldThrow_WhenUserNotFound() {
        ProductionLogDTO dto = new ProductionLogDTO();
        dto.setReportDate(LocalDate.of(2024, 5, 2));
        dto.setUserId(99L);
        dto.setMilkLitersCow(1.0);
        dto.setMilkLitersGoat(0);
        dto.setMilkLitersSheep(0);
        dto.setEggsCount(0);
        dto.setMeatKg(0);
        dto.setWoolKg(0);
        dto.setWorkHours(0);

        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        ExecutionException ex =
                assertThrows(ExecutionException.class, () -> productionLogService.saveOrUpdateLog(dto).get());
        assertTrue(ex.getCause().getMessage().contains("User not found"));
    }

    @Test
    void getReport_ShouldHandleUnknownField() {
        User u = user(100L);
        ProductionLog log = logForUser(u, LocalDate.of(2024, 5, 2), 10.0, 0);
        when(logRepository.findAll()).thenReturn(List.of(log));

        Map<String, Double> report = productionLogService.getReport(100L, 2024, null, "invalid").join();

        assertEquals(0.0, report.get("Ianuarie"));
    }

    @Test
    void getLogsByUserAndDateRange_ShouldDelegateToRepository() {
        when(logRepository.findByUserUserIdAndReportDateBetween(eq(100L), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of());

        List<ProductionLog> result =
                productionLogService.getLogsByUserAndDateRange(100L, "2024-01-01", "2024-01-31").join();

        assertNotNull(result);
        verify(logRepository).findByUserUserIdAndReportDateBetween(eq(100L), any(), any());
    }
}
