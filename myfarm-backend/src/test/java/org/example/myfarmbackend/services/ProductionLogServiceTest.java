package org.example.myfarmbackend.services;

import org.example.myfarmbackend.models.ProductionLog;
import org.example.myfarmbackend.repositories.IAnimalRepository;
import org.example.myfarmbackend.repositories.IProductionLogRepository;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ProductionLogServiceTest {

    @Mock
    private IProductionLogRepository logRepository;

    @Mock
    private IAnimalRepository animalRepository;

    @InjectMocks
    private ProductionLogService productionLogService;

    @Test
    void getReport_ShouldCalculateWeeklySumsCorrectly() {
        ProductionLog log1 = new ProductionLog(1L, LocalDate.of(2024, 5, 2), 10.0, 0, 0, 0, 0, 0, 100L);
        ProductionLog log2 = new ProductionLog(2L, LocalDate.of(2024, 5, 5), 5.0, 0, 0, 0, 0, 0, 100L);

        doReturn(List.of(log1, log2)).when(logRepository).findAll();

        Map<String, Double> report = productionLogService.getReport(100L, 2024, 5, "lapte");

        assertNotNull(report);
        assertEquals(15.0, report.get("1-7"));
        assertEquals(15.0, report.get("Total"));
    }

    @Test
    void getReport_ShouldCalculateAnnualSumsCorrectly() {
        ProductionLog logIan = new ProductionLog(1L, LocalDate.of(2024, 1, 10), 100.0, 0, 0, 0, 0, 0, 100L);
        ProductionLog logFeb = new ProductionLog(2L, LocalDate.of(2024, 2, 15), 50.0, 0, 0, 0, 0, 0, 100L);

        doReturn(List.of(logIan, logFeb)).when(logRepository).findAll();

        Map<String, Double> report = productionLogService.getReport(100L, 2024, null, "lapte");

        assertEquals(100.0, report.get("Ianuarie"));
        assertEquals(50.0, report.get("Februarie"));
    }

    @Test
    void saveOrUpdateLog_ShouldSave_WhenNotExists() {
        ProductionLog newLog = new ProductionLog(1L, LocalDate.of(2024, 5, 2), 10.0, 0, 0, 0, 0, 0, 100L);
        when(animalRepository.countByOwnerIdAndType(100L, "vaca")).thenReturn(1L);
        doReturn(Optional.empty()).when(logRepository).findByDateAndUserId(any(), anyLong());
        doReturn(newLog).when(logRepository).save(any());

        ProductionLog saved = productionLogService.saveOrUpdateLog(newLog);

        assertNotNull(saved);
        assertEquals(10.0, saved.getMilkLitersCow());
    }

    @Test
    void saveOrUpdateLog_ShouldUpdate_WhenExists() {
        ProductionLog existing = new ProductionLog(1L, LocalDate.of(2024, 5, 2), 10.0, 0, 0, 0, 0, 0, 100L);
        ProductionLog newLog = new ProductionLog(2L, LocalDate.of(2024, 5, 2), 5.0, 0, 0, 0, 0, 0, 100L);

        when(animalRepository.countByOwnerIdAndType(100L, "vaca")).thenReturn(1L);
        doReturn(Optional.of(existing)).when(logRepository).findByDateAndUserId(any(), anyLong());
        doReturn(existing).when(logRepository).save(any());

        ProductionLog updated = productionLogService.saveOrUpdateLog(newLog);

        assertEquals(15.0, updated.getMilkLitersCow());
    }

    @Test
    void saveOrUpdateLog_ShouldSumAllFields_WhenUpdatingExisting() {
        ProductionLog existing = new ProductionLog(1L, LocalDate.of(2024, 5, 2), 10.0, 2.0, 3, 4, 5.0, 6.0, 100L);
        ProductionLog delta = new ProductionLog(2L, LocalDate.of(2024, 5, 2), 1.5, 1.0, 2, 1, 0.5, 2.0, 100L);

        when(animalRepository.countByOwnerIdAndType(100L, "vaca")).thenReturn(1L);
        when(animalRepository.countByOwnerIdAndType(100L, "porc")).thenReturn(1L);
        when(animalRepository.countByOwnerIdAndType(100L, "gaina")).thenReturn(1L);
        when(animalRepository.countByOwnerIdAndType(100L, "oaie")).thenReturn(1L);
        when(animalRepository.countByOwnerIdAndType(100L, "capra")).thenReturn(0L); // LIPSĂ REZOLVATĂ

        doReturn(Optional.of(existing)).when(logRepository).findByDateAndUserId(any(), anyLong());
        doReturn(existing).when(logRepository).save(any());

        ProductionLog updated = productionLogService.saveOrUpdateLog(delta);

        assertEquals(11.5, updated.getMilkLitersCow());
        assertEquals(3.0, updated.getMeatKg());
        assertEquals(5, updated.getEggsCount());
        assertEquals(5, updated.getMilkLitersSheep());
        assertEquals(5.5, updated.getWoolKg());
        assertEquals(8.0, updated.getWorkHours());
    }

    @Test
    void saveOrUpdateLog_ShouldThrowException_WhenUserIdIsNull() {
        ProductionLog log = new ProductionLog();
        log.setMilkLitersCow(10.0);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> productionLogService.saveOrUpdateLog(log));
        assertEquals("UserId is required.", ex.getMessage());
    }

    @Test
    void saveOrUpdateLog_ShouldRejectCowMilk_WhenNoCows() {
        ProductionLog log = new ProductionLog(1L, LocalDate.of(2024, 5, 2), 10.0, 0, 0, 0, 0, 0, 100L);
        when(animalRepository.countByOwnerIdAndType(100L, "vaca")).thenReturn(0L);

        assertThrows(RuntimeException.class, () -> productionLogService.saveOrUpdateLog(log));
    }

    @Test
    void saveOrUpdateLog_ShouldRejectSheepMilk_WhenNoSheepOrGoats() {
        ProductionLog log = new ProductionLog(1L, LocalDate.of(2024, 5, 2), 0.0, 0.0, 5, 0, 0, 0, 100L);
        when(animalRepository.countByOwnerIdAndType(100L, "oaie")).thenReturn(0L);
        when(animalRepository.countByOwnerIdAndType(100L, "capra")).thenReturn(0L);

        assertThrows(RuntimeException.class, () -> productionLogService.saveOrUpdateLog(log));
    }

    @Test
    void saveOrUpdateLog_ShouldRejectEggs_WhenNoChickens() {
        ProductionLog log = new ProductionLog(1L, LocalDate.of(2024, 5, 2), 0.0, 0.0, 0, 10, 0, 0, 100L);
        when(animalRepository.countByOwnerIdAndType(100L, "gaina")).thenReturn(0L);

        assertThrows(RuntimeException.class, () -> productionLogService.saveOrUpdateLog(log));
    }

    @Test
    void saveOrUpdateLog_ShouldRejectWool_WhenNoSheep() {
        ProductionLog log = new ProductionLog(1L, LocalDate.of(2024, 5, 2), 0.0, 0.0, 0, 0, 5.0, 0, 100L);
        when(animalRepository.countByOwnerIdAndType(100L, "oaie")).thenReturn(0L);

        assertThrows(RuntimeException.class, () -> productionLogService.saveOrUpdateLog(log));
    }

    @Test
    void saveOrUpdateLog_ShouldRejectMeat_WhenNoPigs() {
        ProductionLog log = new ProductionLog(1L, LocalDate.of(2024, 5, 2), 0.0, 10.0, 0, 0, 0, 0, 100L);
        when(animalRepository.countByOwnerIdAndType(100L, "porc")).thenReturn(0L);

        assertThrows(RuntimeException.class, () -> productionLogService.saveOrUpdateLog(log));
    }

    @Test
    void getReport_ShouldHandleUnknownField() {
        ProductionLog log = new ProductionLog(1L, LocalDate.of(2024, 5, 2), 10.0, 0, 0, 0, 0, 0, 100L);
        doReturn(List.of(log)).when(logRepository).findAll();

        Map<String, Double> report = productionLogService.getReport(100L, 2024, null, "invalid");

        assertEquals(0.0, report.get("Ianuarie"));
    }

    @Test
    void getLogsByUserAndDateRange_ShouldWork() {
        doReturn(List.of()).when(logRepository).findByUserAndPeriod(anyLong(), any(), any());

        List<ProductionLog> result = productionLogService.getLogsByUserAndDateRange(100L, "2024-01-01", "2024-01-31");

        assertNotNull(result);
        verify(logRepository).findByUserAndPeriod(eq(100L), any(), any());
    }
}