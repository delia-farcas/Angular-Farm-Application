package org.example.myfarmbackend.controllers.rest;

import org.example.myfarmbackend.controllers.rest.ProductionLogRestController;
import org.example.myfarmbackend.exceptions.GlobalExceptionHandler;
import org.example.myfarmbackend.models.ProductionLog;
import org.example.myfarmbackend.models.User;
import org.example.myfarmbackend.services.MonitoringService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

@WebMvcTest(controllers = ProductionLogRestController.class)
@Import(GlobalExceptionHandler.class)
@AutoConfigureMockMvc(addFilters = false)
class ProductionLogRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductionLogService productionLogService;

    @MockBean
    private MonitoringService monitoringService;

    @Test
    void post_ShouldReturn400_WhenMissingRequiredFields() throws Exception {
        mockMvc.perform(
                        post("/api/logs")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void report_ShouldReturnOk() throws Exception {
        when(productionLogService.getReport(1L, 2024, null, "lapte"))
                .thenReturn(Map.of("Ianuarie", 10.0));

        mockMvc.perform(
                        get("/api/logs/report")
                                .queryParam("userId", "1")
                                .queryParam("year", "2024")
                                .queryParam("resourceField", "lapte"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Ianuarie").value(10.0));
    }

    @Test
    void history_ShouldReturn400_WhenDateParseFails() throws Exception {
        mockMvc.perform(
                        get("/api/logs/history/1")
                                .queryParam("startDate", "not-a-date")
                                .queryParam("endDate", "2024-01-31"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void history_ShouldPaginateListInController() throws Exception {
        User u = User.builder().userId(1L).email("a@a.com").username("a").password("p").build();

        ProductionLog log1 = new ProductionLog();
        log1.setId(1L);
        log1.setReportDate(LocalDate.of(2024, 1, 1));
        log1.setMilkLitersCow(1.0);
        log1.setUser(u);

        ProductionLog log2 = new ProductionLog();
        log2.setId(2L);
        log2.setReportDate(LocalDate.of(2024, 1, 2));
        log2.setMilkLitersCow(1.0);
        log2.setUser(u);

        when(productionLogService.getLogsByUserAndDateRange(1L, "2024-01-01", "2024-01-31"))
                .thenReturn(List.of(log1, log2));

        mockMvc.perform(
                        get("/api/logs/history/1")
                                .queryParam("startDate", "2024-01-01")
                                .queryParam("endDate", "2024-01-31")
                                .queryParam("page", "0")
                                .queryParam("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }
}
