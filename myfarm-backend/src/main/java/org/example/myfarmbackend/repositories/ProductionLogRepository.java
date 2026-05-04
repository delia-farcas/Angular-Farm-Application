package org.example.myfarmbackend.repositories;

import org.example.myfarmbackend.models.ProductionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;


@Repository
public interface ProductionLogRepository extends JpaRepository<ProductionLog, Long> {

    Optional<ProductionLog> findByReportDateAndUserUserId(LocalDate reportDate, Long userId);
    List<ProductionLog> findByUserUserIdAndReportDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
}