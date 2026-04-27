package org.example.myfarmbackend.services;

import org.example.myfarmbackend.models.ProductionLog;
import org.example.myfarmbackend.repositories.IProductionLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class ProductionLogService implements IProductionLogService {

    private final IProductionLogRepository logRepository;

    public ProductionLogService(IProductionLogRepository logRepository) {
        this.logRepository = logRepository;
    }

    @Override
    public ProductionLog saveOrUpdateLog(ProductionLog newLog) {
        return logRepository.findByDateAndUserId(newLog.getReportDate(), newLog.getUserId())
                .map(existing -> updateExistingLog(existing, newLog))
                .orElseGet(() -> logRepository.save(newLog));
    }

    private ProductionLog updateExistingLog(ProductionLog existing, ProductionLog newLog) {
        existing.setMilkLitersCow(existing.getMilkLitersCow() + newLog.getMilkLitersCow());
        existing.setMilkLitersSheep(existing.getMilkLitersSheep() + newLog.getMilkLitersSheep());
        existing.setMeatKg(existing.getMeatKg() + newLog.getMeatKg());
        existing.setEggsCount(existing.getEggsCount() + newLog.getEggsCount());
        existing.setWoolKg(existing.getWoolKg() + newLog.getWoolKg());
        existing.setWorkHours(existing.getWorkHours() + newLog.getWorkHours());
        return logRepository.save(existing);
    }


    @Override
    public Map<String, Double> getReport(long userId, int year, Integer month, String resourceField) {
        List<ProductionLog> filteredLogs = getFilteredLogs(userId, year);

        if (month != null) {
            return calculateWeeklyReport(filteredLogs, month, resourceField);
        }
        return calculateAnnualReport(filteredLogs, resourceField);
    }

    private List<ProductionLog> getFilteredLogs(long userId, int year) {
        return logRepository.findAll().stream()
                .filter(l -> l.getUserId().equals(userId))
                .filter(l -> l.getReportDate().getYear() == year)
                .toList();
    }


    private Map<String, Double> calculateWeeklyReport(List<ProductionLog> logs, int month, String field) {
        List<ProductionLog> monthlyLogs = logs.stream()
                .filter(l -> l.getReportDate().getMonthValue() == month)
                .toList();

        Map<String, Double> report = new LinkedHashMap<>();
        report.put("1-7", sumForRange(monthlyLogs, 1, 7, field));
        report.put("8-14", sumForRange(monthlyLogs, 8, 14, field));
        report.put("15-21", sumForRange(monthlyLogs, 15, 21, field));
        report.put("22-31", sumForRange(monthlyLogs, 22, 31, field));

        report.put("Total", report.values().stream().mapToDouble(d -> d).sum());
        return report;
    }


    private Map<String, Double> calculateAnnualReport(List<ProductionLog> logs, String field) {
        Map<String, Double> report = new LinkedHashMap<>();
        String[] monthNames = {"Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
                "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"};

        for (int i = 1; i <= 12; i++) {
            final int m = i;
            double sum = logs.stream()
                    .filter(l -> l.getReportDate().getMonthValue() == m)
                    .mapToDouble(l -> getValueByField(l, field))
                    .sum();
            report.put(monthNames[i-1], sum);
        }
        return report;
    }
    

    private double sumForRange(List<ProductionLog> logs, int start, int end, String field) {
        return logs.stream()
                .filter(l -> l.getReportDate().getDayOfMonth() >= start && l.getReportDate().getDayOfMonth() <= end)
                .mapToDouble(l -> getValueByField(l, field))
                .sum();
    }

    private double getValueByField(ProductionLog log, String field) {
        return switch (field.toLowerCase()) {
            case "lapte" -> log.getMilkLitersCow();
            case "carne" -> log.getMeatKg();
            case "ouă" -> log.getEggsCount();
            case "lână" -> log.getWoolKg();
            case "ore" -> log.getWorkHours();
            default -> 0.0;
        };
    }
}