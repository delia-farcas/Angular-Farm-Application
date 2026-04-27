package org.example.myfarmbackend.services;

import org.example.myfarmbackend.models.ProductionLog;
import java.util.Map;

/** * Service interface for daily farm production logging and statistics.
 * Handles resource aggregation and period-based reporting.
 */
public interface IProductionLogService {

    /** Saves a new daily log or updates existing entries by summing values. */
    ProductionLog saveOrUpdateLog(ProductionLog log);

    /** * Generates a summarized report for a specific resource and period.
     * Returns weekly data if month is provided, or annual data if month is null.
     */
    Map<String, Double> getReport(long userId, int year, Integer month, String resourceField);
}