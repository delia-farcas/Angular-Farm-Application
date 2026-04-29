package org.example.myfarmbackend.controllers.graphql;

import org.example.myfarmbackend.models.ProductionLog;
import org.example.myfarmbackend.services.ProductionLogService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

@Controller
public class ProductionLogGraphQLController {

    private final ProductionLogService logService;

    public ProductionLogGraphQLController(ProductionLogService logService) {
        this.logService = logService;
    }

    // Query pentru rapoarte (Gold Challenge)
    @QueryMapping
    public List<ReportEntry> getProductionReport(
            @Argument long userId,
            @Argument int year,
            @Argument Integer month,
            @Argument String resourceField) {

        Map<String, Double> reportData = logService.getReport(userId, year, month, resourceField);

        return reportData.entrySet().stream()
                .map(entry -> new ReportEntry(entry.getKey(), entry.getValue()))
                .toList();
    }

    // Mutation pentru a oglindi saveOrUpdateLog
    @MutationMapping
    public ProductionLog saveProductionLog(@Argument ProductionLog input) {
        // În GraphQL, input-ul va trebui mapat corect în schema.graphqls
        return logService.saveOrUpdateLog(input);
    }
}

// Record pentru a structura răspunsul în GraphQL
record ReportEntry(String label, Double value) {}