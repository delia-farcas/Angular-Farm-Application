package org.example.myfarmbackend.services;

import org.example.myfarmbackend.dto.ProductionLogDTO;
import org.example.myfarmbackend.models.ProductionLog;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/** * Service interface for daily farm production logging and statistics.
 * Handles resource aggregation and period-based reporting.
 */
public interface IProductionLogService {

    /** Saves a new daily log or updates existing entries by summing values. */
    CompletableFuture<ProductionLog> saveOrUpdateLog(ProductionLogDTO dto);

    /** * Generates a summarized report for a specific resource and period.
     * Returns weekly data if month is provided, or annual data if month is null.
     */
    CompletableFuture<Map<String, Double>> getReport(long userId, int year, Integer month, String resourceField);

    CompletableFuture<List<ProductionLog>> getLogsByUserAndDateRange(Long userId, String startDate, String endDate);
}
