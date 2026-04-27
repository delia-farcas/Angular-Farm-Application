package org.example.myfarmbackend.repositories;

import org.example.myfarmbackend.models.ProductionLog;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class ProductionLogRepository implements IProductionLogRepository {
    private final List<ProductionLog> reports = new ArrayList<>();
    private final AtomicLong idGenerator = new AtomicLong(1);

    @Override
    public List<ProductionLog> findAll() {
        return new ArrayList<>(reports);
    }

    @Override
    public Optional<ProductionLog> findByDateAndUserId(LocalDate date, Long userId) {
        return reports.stream()
                .filter(r -> r.getReportDate().equals(date) && r.getUserId().equals(userId))
                .findFirst();
    }

    @Override
    public ProductionLog save(ProductionLog report) {
        if (report.getId() == null) {
            report.setId(idGenerator.getAndIncrement());
            reports.add(report);
        }
        return report;
    }

    @Override
    public List<ProductionLog> findByPeriod(LocalDate start, LocalDate end) {
        return reports.stream()
                .filter(r -> !r.getReportDate().isBefore(start) && !r.getReportDate().isAfter(end))
                .toList();
    }
}