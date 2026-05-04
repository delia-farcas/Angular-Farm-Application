package org.example.myfarmbackend.controllers.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.example.myfarmbackend.models.ProductionLog;
import org.example.myfarmbackend.services.ProductionLogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "http://localhost:4200")
@Validated
public class ProductionLogRestController {

    private final ProductionLogService logService;

    public ProductionLogRestController(ProductionLogService logService) {
        this.logService = logService;
    }

    @PostMapping
    public ResponseEntity<ProductionLog> createOrUpdateLog(@Valid @RequestBody ProductionLog log) {
        ProductionLog savedLog = logService.saveOrUpdateLog(log);
        return new ResponseEntity<>(savedLog, HttpStatus.CREATED);
    }

    @GetMapping("/report")
    public ResponseEntity<Map<String, Double>> getReport(
            @RequestParam long userId,
            @RequestParam int year,
            @RequestParam(required = false) Integer month,
            @RequestParam String resourceField) {

        Map<String, Double> report = logService.getReport(userId, year, month, resourceField);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<?>> getHistory(
            @PathVariable Long userId,
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size
    ) {
        try {
            LocalDate.parse(startDate);
            LocalDate.parse(endDate);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().build();
        }
        Object historyRaw = logService.getLogsByUserAndDateRange(userId, startDate, endDate);
        if (!(historyRaw instanceof List<?> historyList)) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        int totalElements = historyList.size();
        int start = page * size;
        if (start >= totalElements) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        int end = Math.min(start + size, totalElements);

        List<?> paginatedList = historyList.subList(start, end);

        return ResponseEntity.ok(paginatedList);
    }
}