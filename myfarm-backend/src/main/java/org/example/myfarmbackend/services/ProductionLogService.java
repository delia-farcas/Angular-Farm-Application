package org.example.myfarmbackend.services;

import jakarta.transaction.Transactional;
import org.example.myfarmbackend.dto.ProductionLogDTO;
import org.example.myfarmbackend.models.ProductionLog;
import org.example.myfarmbackend.models.User;
import org.example.myfarmbackend.repositories.AnimalRepository;
import org.example.myfarmbackend.repositories.ProductionLogRepository;
import org.example.myfarmbackend.repositories.UserRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
public class ProductionLogService implements IProductionLogService {

    private final ProductionLogRepository logRepository;
    private final AnimalRepository animalRepository;
    private final UserRepository userRepository;

    public ProductionLogService(ProductionLogRepository logRepository, AnimalRepository animalRepository, UserRepository userRepository) {
        this.logRepository = logRepository;
        this.animalRepository = animalRepository;
        this.userRepository = userRepository;
    }

    @Async
    @Override
    @Transactional
    public CompletableFuture<ProductionLog> saveOrUpdateLog(ProductionLogDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + dto.getUserId()));

        ProductionLog saved = logRepository.findByReportDateAndUserUserId(dto.getReportDate(), dto.getUserId())
                .map(existingLog -> {
                    updateLogFields(existingLog, dto);
                    return logRepository.save(existingLog);
                })
                .orElseGet(() -> {
                    ProductionLog newLog = new ProductionLog();
                    newLog.setUser(user);
                    updateLogFields(newLog, dto);
                    return logRepository.save(newLog);
                });
        return CompletableFuture.completedFuture(saved);
    }

    private void updateLogFields(ProductionLog log, ProductionLogDTO dto) {
        log.setReportDate(dto.getReportDate());
        log.setMilkLitersCow(dto.getMilkLitersCow());
        log.setMeatKg(dto.getMeatKg());
        log.setEggsCount(dto.getEggsCount());
        log.setMilkLitersSheep(dto.getMilkLitersSheep());
        log.setWoolKg(dto.getWoolKg());
        log.setMilkLitersGoat(dto.getMilkLitersGoat());
        log.setWorkHours(dto.getWorkHours());
    }

    private void validateLogAgainstAnimals(ProductionLog log) {
        Long userId = log.getUser().getUserId();
        if (userId == null) {
            throw new RuntimeException("UserId is required.");
        }

        if (log.getMilkLitersCow() > 0 && animalRepository.countByOwnerUserIdAndTypeIgnoreCase(userId, "vaca") <= 0) {
            throw new RuntimeException("Nu poți salva lapte de vacă fără cel puțin o vacă în fermă.");
        }

        // Sheep+goat milk is stored in milkLitersSheep in this backend.
        if (log.getMilkLitersSheep() > 0) {
            long sheep = animalRepository.countByOwnerUserIdAndTypeIgnoreCase(userId, "oaie");
            long goat = animalRepository.countByOwnerUserIdAndTypeIgnoreCase(userId, "capra");
            if (sheep + goat <= 0) {
                throw new RuntimeException("Nu poți salva lapte (oaie/capră) fără cel puțin o oaie sau o capră în fermă.");
            }
        }

        if (log.getEggsCount() > 0 && animalRepository.countByOwnerUserIdAndTypeIgnoreCase(userId, "gaina") <= 0) {
            throw new RuntimeException("Nu poți salva ouă fără cel puțin o găină în fermă.");
        }

        if (log.getWoolKg() > 0 && animalRepository.countByOwnerUserIdAndTypeIgnoreCase(userId, "oaie") <= 0) {
            throw new RuntimeException("Nu poți salva lână fără cel puțin o oaie în fermă.");
        }

        if (log.getMeatKg() > 0 && animalRepository.countByOwnerUserIdAndTypeIgnoreCase(userId, "porc") <= 0) {
            throw new RuntimeException("Nu poți salva carne fără cel puțin un porc în fermă.");
        }
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


    @Async
    @Override
    public CompletableFuture<Map<String, Double>> getReport(long userId, int year, Integer month, String resourceField) {
        List<ProductionLog> filteredLogs = getFilteredLogs(userId, year);

        Map<String, Double> report;
        if (month != null) {
            report = calculateWeeklyReport(filteredLogs, month, resourceField);
        } else {
            report = calculateAnnualReport(filteredLogs, resourceField);
        }
        return CompletableFuture.completedFuture(report);
    }

    private List<ProductionLog> getFilteredLogs(long userId, int year) {
        return logRepository.findAll().stream()
                .filter(l -> l.getUser().getUserId() == userId)
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
            case "lapte" -> log.getMilkLitersCow() + log.getMilkLitersSheep() + log.getMilkLitersGoat();
            case "carne" -> log.getMeatKg();
            case "ouă" -> log.getEggsCount();
            case "lână" -> log.getWoolKg();
            case "ore" -> log.getWorkHours();
            default -> 0.0;
        };
    }

    @Async
    @Override
    public CompletableFuture<List<ProductionLog>> getLogsByUserAndDateRange(Long userId, String startDate, String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        return CompletableFuture.completedFuture(
                logRepository.findByUserUserIdAndReportDateBetween(userId, start, end));
    }
}