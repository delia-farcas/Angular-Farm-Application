package org.example.myfarmbackend.controllers.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.myfarmbackend.dto.LoginRequest;
import org.example.myfarmbackend.dto.UserDTO;
import org.example.myfarmbackend.dto.UserListItemDTO;
import org.example.myfarmbackend.exceptions.GlobalExceptionHandler;
import org.example.myfarmbackend.models.User;
import org.example.myfarmbackend.services.IUserService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

@WebMvcTest(controllers = UserRestController.class)
@Import(GlobalExceptionHandler.class)
@AutoConfigureMockMvc(addFilters = false)
class UserRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IUserService userService;

    @MockBean
    private MonitoringService monitoringService;

    @Test
    void register_ShouldReturn400_WhenInvalid() throws Exception {
        UserDTO invalid = new UserDTO();
        invalid.setEmail("not-an-email");
        invalid.setUsername("");
        invalid.setPassword("");

        mockMvc.perform(
                        post("/api/users/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.email").exists());
    }

    @Test
    void login_ShouldReturn401_WhenCredentialsInvalid() throws Exception {
        LoginRequest body = new LoginRequest("x@x.com", "wrong");
        when(userService.authenticate("x@x.com", "wrong")).thenReturn(Optional.empty());

        mockMvc.perform(
                        post("/api/users/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getById_ShouldReturn404_WhenMissing() throws Exception {
        when(userService.getUserById(5L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/users/5")).andExpect(status().isNotFound());
    }

    @Test
    void list_ShouldPaginateInController() throws Exception {
        when(userService.isAdmin(1L)).thenReturn(true);
        when(userService.getAllUsersPaginated(0, 1))
                .thenReturn(
                        List.of(
                                User.builder().userId(1L).email("a@a.com").username("a").password("p").build(),
                                User.builder().userId(2L).email("b@b.com").username("b").password("p").build()));

        mockMvc.perform(
                        get("/api/users")
                                .queryParam("requesterId", "1")
                                .queryParam("page", "0")
                                .queryParam("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(1));
    }

    @Test
    void list_ShouldReturn403_WhenRequesterIsNotAdmin() throws Exception {
        when(userService.isAdmin(2L)).thenReturn(false);

        mockMvc.perform(get("/api/users").queryParam("requesterId", "2"))
                .andExpect(status().isForbidden());
    }

    @Test
    void summary_ShouldReturn403_WhenRequesterIsNotAdmin() throws Exception {
        when(userService.isAdmin(2L)).thenReturn(false);

        mockMvc.perform(get("/api/users/summary").queryParam("requesterId", "2"))
                .andExpect(status().isForbidden());
    }

    @Test
    void summary_ShouldReturnRows_WhenRequesterIsAdmin() throws Exception {
        when(userService.isAdmin(1L)).thenReturn(true);
        when(userService.getUsersWithAnimalCounts(0, 15))
                .thenReturn(List.of(new UserListItemDTO(2L, "user", "user@farm.ro", 3)));

        mockMvc.perform(get("/api/users/summary").queryParam("requesterId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(2))
                .andExpect(jsonPath("$[0].animalCount").value(3));
    }

    @Test
    void update_ShouldReturn404_WhenServiceReturnsEmpty() throws Exception {
        UserDTO payload = new UserDTO();
        payload.setEmail("valid@email.com");
        payload.setUsername("user-valid");
        payload.setPassword("parola123");

        when(userService.updateUser(eq(99L), any(UserDTO.class))).thenReturn(Optional.empty());

        mockMvc.perform(
                        put("/api/users/99")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(payload)))
                .andDo(print())
                .andExpect(status().isNotFound());
    }
}
