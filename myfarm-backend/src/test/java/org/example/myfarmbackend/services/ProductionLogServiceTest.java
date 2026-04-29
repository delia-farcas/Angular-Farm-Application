package org.example.myfarmbackend.services;

import org.example.myfarmbackend.models.ProductionLog;
import org.example.myfarmbackend.repositories.IProductionLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.doReturn;

@ExtendWith(MockitoExtension.class)
class ProductionLogServiceTest {

    @Mock
    private IProductionLogRepository logRepository;

    @InjectMocks
    private ProductionLogService productionLogService;

    @Test
    void getReport_ShouldCalculateWeeklySumsCorrecty() {
        // REPARAȚIE: Constructor cu ID-uri tratate explicit ca Long folosind constructorul de obiecte
        ProductionLog log1 = new ProductionLog(Long.valueOf(1), LocalDate.of(2024, 5, 2), 10.0, 0, 0, 0, 0, 0, Long.valueOf(100));
        ProductionLog log2 = new ProductionLog(Long.valueOf(2), LocalDate.of(2024, 5, 5), 5.0, 0, 0, 0, 0, 0, Long.valueOf(100));

        // REPARAȚIE: Folosim doReturn pentru a evita problemele de generic types ale method chaining-ului 'when'
        doReturn(List.of(log1, log2)).when(logRepository).findAll();

        // Act: Cerem raportul pentru luna Mai (5), resursa "lapte"
        Map<String, Double> report = productionLogService.getReport(100L, 2024, Integer.valueOf(5), "lapte");

        // Assert
        assertNotNull(report);
        assertEquals(15.0, report.get("1-7"));
        assertEquals(15.0, report.get("Total"));
        assertEquals(0.0, report.get("8-14"));
    }

    @Test
    void getReport_ShouldCalculateAnnualSumsCorrectly() {
        ProductionLog logIan = new ProductionLog(Long.valueOf(1), LocalDate.of(2024, 1, 10), 100.0, 0, 0, 0, 0, 0, Long.valueOf(100));
        ProductionLog logFeb = new ProductionLog(Long.valueOf(2), LocalDate.of(2024, 2, 15), 50.0, 0, 0, 0, 0, 0, Long.valueOf(100));

        doReturn(List.of(logIan, logFeb)).when(logRepository).findAll();

        Map<String, Double> report = productionLogService.getReport(100L, 2024, null, "lapte");

        assertEquals(100.0, report.get("Ianuarie"));
        assertEquals(50.0, report.get("Februarie"));
        assertEquals(0.0, report.get("Martie"));
    }
}