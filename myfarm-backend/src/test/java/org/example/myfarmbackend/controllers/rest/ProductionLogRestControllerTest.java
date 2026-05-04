package org.example.myfarmbackend.controllers.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.myfarmbackend.exceptions.GlobalExceptionHandler;
import org.example.myfarmbackend.models.ProductionLog;
import org.example.myfarmbackend.services.ProductionLogService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ProductionLogRestController.class)
@Import(GlobalExceptionHandler.class)
class ProductionLogRestControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private ProductionLogService productionLogService;

    @Test
    void post_ShouldReturn400_WhenMissingRequiredFields() throws Exception {
        ProductionLog invalid = new ProductionLog();
        invalid.setUserId(null);
        invalid.setReportDate(null);

        mockMvc.perform(post("/api/logs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void report_ShouldReturnOk() throws Exception {
        when(productionLogService.getReport(1L, 2024, null, "lapte"))
                .thenReturn(Map.of("Ianuarie", 10.0));

        mockMvc.perform(get("/api/logs/report")
                        .queryParam("userId", "1")
                        .queryParam("year", "2024")
                        .queryParam("resourceField", "lapte"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Ianuarie").value(10.0));
    }

    @Test
    void history_ShouldReturn400_WhenDateParseFails() throws Exception {
        mockMvc.perform(get("/api/logs/history/1")
                        .queryParam("startDate", "not-a-date")
                        .queryParam("endDate", "2024-01-31"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void history_ShouldPaginateListInController() throws Exception {
        List<ProductionLog> logs = List.of(
                new ProductionLog(1L, LocalDate.of(2024, 1, 1), 1.0, 0, 0, 0, 0, 0, 1L),
                new ProductionLog(2L, LocalDate.of(2024, 1, 2), 1.0, 0, 0, 0, 0, 0, 1L)
        );
        when(productionLogService.getLogsByUserAndDateRange(1L, "2024-01-01", "2024-01-31"))
                .thenReturn(logs);

        mockMvc.perform(get("/api/logs/history/1")
                        .queryParam("startDate", "2024-01-01")
                        .queryParam("endDate", "2024-01-31")
                        .queryParam("page", "0")
                        .queryParam("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }
}

