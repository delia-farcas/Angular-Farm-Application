package org.example.myfarmbackend.controllers.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.example.myfarmbackend.dto.ProductionLogDTO;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
@Validated
public class ProductionLogRestController {

    private final ProductionLogService logService;

    public ProductionLogRestController(ProductionLogService logService) {
        this.logService = logService;
    }

    @PostMapping
    public ResponseEntity<ProductionLogDTO> createOrUpdateLog(@Valid @RequestBody ProductionLogDTO logDTO) {
        ProductionLog savedLog = logService.saveOrUpdateLog(logDTO);
        return new ResponseEntity<>(mapToDTO(savedLog), HttpStatus.CREATED);
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
    public ResponseEntity<List<ProductionLogDTO>> getHistory(
            @PathVariable Long userId,
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "400") @Min(1) int size
    ) {
        try {
            LocalDate.parse(startDate);
            LocalDate.parse(endDate);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().build();
        }

        Object historyRaw = logService.getLogsByUserAndDateRange(userId, startDate, endDate);

        if (!(historyRaw instanceof List<?> rawList)) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

        List<ProductionLogDTO> dtoList = rawList.stream()
                .filter(ProductionLog.class::isInstance)
                .map(obj -> mapToDTO((ProductionLog) obj))
                .collect(Collectors.toList());

        int totalElements = dtoList.size();
        int start = page * size;

        if (start >= totalElements) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        int end = Math.min(start + size, totalElements);
        return ResponseEntity.ok(dtoList.subList(start, end));
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