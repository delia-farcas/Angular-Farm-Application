package org.example.myfarmbackend.controllers.rest;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.example.myfarmbackend.dto.ProductionLogDTO;
import org.example.myfarmbackend.models.ProductionLog;
import org.example.myfarmbackend.services.IProductionLogService;
import org.example.myfarmbackend.services.MonitoringService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "*")
@Validated
public class ProductionLogRestController {

    private final IProductionLogService logService;
    private final MonitoringService monitoringService;

    public ProductionLogRestController(IProductionLogService logService, MonitoringService monitoringService) {
        this.logService = logService;
        this.monitoringService = monitoringService;
    }

    @PostMapping
    public CompletableFuture<ResponseEntity<ProductionLogDTO>> createOrUpdateLog(@Valid @RequestBody ProductionLogDTO logDTO, HttpServletRequest request) {
        return logService.saveOrUpdateLog(logDTO)
                .thenApply(savedLog -> {
                    monitoringService.logAction(
                            logDTO.getUserId(),
                            "USER",
                            "PRODUCTION_DATA_SAVE: " + logDTO.getReportDate(),
                            201,
                            request.getRemoteAddr()
                    );
                    return new ResponseEntity<>(mapToDTO(savedLog), HttpStatus.CREATED);
                });
    }

    @GetMapping("/report")
    public CompletableFuture<ResponseEntity<Map<String, Double>>> getReport(
            @RequestParam long userId,
            @RequestParam int year,
            @RequestParam(required = false) Integer month,
            @RequestParam String resourceField,
            HttpServletRequest request) {

        return logService.getReport(userId, year, month, resourceField)
                .thenApply(report -> {
                    monitoringService.logAction(
                            userId,
                            "USER",
                            "VIEW_PRODUCTION_REPORT: " + resourceField,
                            200,
                            request.getRemoteAddr()
                    );
                    return ResponseEntity.ok(report);
                });
    }

    @GetMapping("/history/{userId}")
    public CompletableFuture<ResponseEntity<List<ProductionLogDTO>>> getHistory(
            @PathVariable Long userId,
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "400") @Min(1) int size,
            HttpServletRequest request
    ) {
        try {
            LocalDate.parse(startDate);
            LocalDate.parse(endDate);
        } catch (DateTimeParseException e) {
            return CompletableFuture.completedFuture(ResponseEntity.badRequest().build());
        }

        return logService.getLogsByUserAndDateRange(userId, startDate, endDate)
                .thenApply(logs -> {
                    List<ProductionLogDTO> dtoList = logs.stream()
                            .map(this::mapToDTO)
                            .collect(Collectors.toList());

                    monitoringService.logAction(
                            userId,
                            "USER",
                            "VIEW_PRODUCTION_HISTORY: " + startDate + " to " + endDate,
                            200,
                            request.getRemoteAddr()
                    );

                    int totalElements = dtoList.size();
                    int start = page * size;

                    if (start >= totalElements) {
                        return ResponseEntity.ok(Collections.<ProductionLogDTO>emptyList());
                    }

                    int end = Math.min(start + size, totalElements);
                    return ResponseEntity.ok(dtoList.subList(start, end));
                });
    }

    private ProductionLogDTO mapToDTO(ProductionLog log) {
        ProductionLogDTO dto = new ProductionLogDTO();
        dto.setId(log.getId());
        dto.setReportDate(log.getReportDate());
        dto.setMilkLitersCow(log.getMilkLitersCow());
        dto.setMeatKg(log.getMeatKg());
        dto.setEggsCount(log.getEggsCount());
        dto.setMilkLitersSheep(log.getMilkLitersSheep());
        dto.setWoolKg(log.getWoolKg());
        dto.setMilkLitersGoat(log.getMilkLitersGoat());
        dto.setWorkHours(log.getWorkHours());
        if (log.getUser() != null) {
            dto.setUserId(log.getUser().getUserId());
        }
        return dto;
    }
}
