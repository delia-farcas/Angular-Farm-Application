package org.example.myfarmbackend.repositories;

import org.example.myfarmbackend.models.ProductionLog;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Interface for managing daily production data (gestiune).
 * Handles the logic for aggregating farm resources on a daily basis.
 */
public interface IProductionLogRepository {
    /** Retrieves the complete history of production logs. */
    List<ProductionLog> findAll();

    /** * Finds a specific daily report for a user.
     * Used to implement the 'add to existing' logic for same-day entries.
     */
    Optional<ProductionLog> findByDateAndUserId(LocalDate date, Long userId);

    /** Stores a daily production report in memory. */
    ProductionLog save(ProductionLog report);

    /** * Filters logs between two dates.
     * Essential for generating Gold Challenge statistics (Weekly/Monthly reports).
     */
    List<ProductionLog> findByPeriod(LocalDate start, LocalDate end);
}