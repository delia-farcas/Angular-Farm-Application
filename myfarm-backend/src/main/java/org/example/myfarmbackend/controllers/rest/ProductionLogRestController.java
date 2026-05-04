package org.example.myfarmbackend.controllers.rest;

import jakarta.validation.Valid;
import org.example.myfarmbackend.models.ProductionLog;
import org.example.myfarmbackend.services.ProductionLogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "http://localhost:4200")
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
    public ResponseEntity<?> getHistory(
            @PathVariable Long userId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        var history = logService.getLogsByUserAndDateRange(userId, startDate, endDate);

        return ResponseEntity.ok(history);
    }
}