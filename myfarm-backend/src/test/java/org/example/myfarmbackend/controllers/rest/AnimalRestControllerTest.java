package org.example.myfarmbackend.controllers.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.myfarmbackend.config.JwtAuthenticationFilter;
import org.example.myfarmbackend.config.JwtTokenProvider;
import org.example.myfarmbackend.controllers.rest.AnimalRestController;
import org.example.myfarmbackend.dto.AnimalDTO;
import org.example.myfarmbackend.exceptions.GlobalExceptionHandler;
import org.example.myfarmbackend.models.Animal;
import org.example.myfarmbackend.models.User;
import org.example.myfarmbackend.services.AnimalService;
import org.example.myfarmbackend.services.MonitoringService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

@WebMvcTest(controllers = AnimalRestController.class)
@Import(GlobalExceptionHandler.class)
@AutoConfigureMockMvc(addFilters = false)
class AnimalRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AnimalService animalService;

    @MockBean
    private MonitoringService monitoringService;

    @MockBean
    private JwtTokenProvider tokenProvider;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void post_ShouldReturn400_WhenValidationFails() throws Exception {
        AnimalDTO invalid = new AnimalDTO();
        invalid.setUserId(1L);
        invalid.setName("");
        invalid.setType("vaca");
        invalid.setSex("femela");
        invalid.setAge(1);
        invalid.setStatus("activ");
        invalid.setLocation("loc");

        mockMvc.perform(
                        post("/api/animals")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.name").exists());
    }

    @Test
    void getById_ShouldReturn404_WhenMissing() throws Exception {
        when(animalService.getAnimalById(99L)).thenReturn(CompletableFuture.completedFuture(Optional.empty()));

        mockMvc.perform(get("/api/animals/99")).andExpect(status().isNotFound());
    }

    @Test
    void getOwnerAnimals_ShouldValidatePaginationParams() throws Exception {
        mockMvc.perform(
                        get("/api/animals/owner/1")
                                .queryParam("page", "-1")
                                .queryParam("size", "5"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getOwnerAnimals_ShouldReturnList() throws Exception {
        User owner = User.builder().userId(1L).email("a@a.com").username("a").password("p").build();
        Animal a = new Animal();
        a.setId(1L);
        a.setName("Bessie");
        a.setType("vaca");
        a.setSex("femela");
        a.setAge(2);
        a.setStatus("activ");
        a.setLocation("stână");
        a.setOwner(owner);

        when(animalService.getUserAnimals(1L, 0, 5)).thenReturn(CompletableFuture.completedFuture(List.of(a)));

        mockMvc.perform(get("/api/animals/owner/1").queryParam("page", "0").queryParam("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Bessie"));
    }

    @Test
    void put_ShouldReturn404_WhenUpdateReturnsNull() throws Exception {
        when(animalService.updateAnimal(anyLong(), any(AnimalDTO.class)))
                .thenReturn(CompletableFuture.completedFuture(null));

        AnimalDTO payload = new AnimalDTO();
        payload.setUserId(1L);
        payload.setName("Animal");
        payload.setType("vaca");
        payload.setSex("femela");
        payload.setAge(1);
        payload.setStatus("activ");
        payload.setLocation("sector 1");

        mockMvc.perform(
                        put("/api/animals/99")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isNotFound());
    }
}
