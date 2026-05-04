package org.example.myfarmbackend.controllers.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.myfarmbackend.models.Animal;
import org.example.myfarmbackend.services.AnimalService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.example.myfarmbackend.exceptions.GlobalExceptionHandler;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AnimalRestController.class)
@Import(GlobalExceptionHandler.class)
class AnimalRestControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private AnimalService animalService;

    @Test
    void post_ShouldReturn400_WhenValidationFails() throws Exception {
        Animal invalid = new Animal();
        invalid.setOwnerId(null);
        invalid.setName("");

        mockMvc.perform(post("/api/animals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.name").exists());
    }

    @Test
    void getById_ShouldReturn404_WhenMissing() throws Exception {
        when(animalService.getAnimalById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/animals/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getOwnerAnimals_ShouldValidatePaginationParams() throws Exception {
        mockMvc.perform(get("/api/animals/owner/1")
                        .queryParam("page", "-1")
                        .queryParam("size", "5"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getOwnerAnimals_ShouldReturnList() throws Exception {
        when(animalService.getUserAnimals(1L, 0, 5)).thenReturn(List.of(new Animal()));

        mockMvc.perform(get("/api/animals/owner/1")
                        .queryParam("page", "0")
                        .queryParam("size", "5"))
                .andExpect(status().isOk());
    }

    @Test
    void put_ShouldReturn404_WhenUpdateReturnsNull() throws Exception {
        when(animalService.updateAnimal(anyLong(), any(Animal.class))).thenReturn(null);

        Animal payload = new Animal();
        payload.setOwnerId(1L);
        payload.setName("Animal");
        payload.setType("cow");
        payload.setSex("female");
        payload.setAge(1);
        payload.setStatus("healthy");
        payload.setLocation("sector 1");

        mockMvc.perform(put("/api/animals/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isNotFound());
    }
}

