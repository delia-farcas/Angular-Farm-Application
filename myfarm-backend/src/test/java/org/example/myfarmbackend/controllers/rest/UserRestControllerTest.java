package org.example.myfarmbackend.controllers.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.myfarmbackend.exceptions.GlobalExceptionHandler;
import org.example.myfarmbackend.models.User;
import org.example.myfarmbackend.services.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = UserRestController.class)
@Import(GlobalExceptionHandler.class)
class UserRestControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private UserService userService;

    @Test
    void register_ShouldReturn400_WhenInvalid() throws Exception {
        User invalid = new User();
        invalid.setEmail("not-an-email");
        invalid.setUsername("");
        invalid.setPassword("");

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.email").exists());
    }

    @Test
    void login_ShouldReturn401_WhenNotFound() throws Exception {
        when(userService.getUserByEmail("x@x.com")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/users/login").queryParam("email", "x@x.com"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getById_ShouldReturn404_WhenMissing() throws Exception {
        when(userService.getUserById(5L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/users/5"))
                .andExpect(status().isNotFound());
    }

    @Test
    void list_ShouldPaginateInController() throws Exception {
        when(userService.getAllUsers()).thenReturn(List.of(
                User.builder().userId(1).email("a@a.com").username("a").password("p").build(),
                User.builder().userId(2).email("b@b.com").username("b").password("p").build()
        ));

        mockMvc.perform(get("/api/users")
                        .queryParam("page", "0")
                        .queryParam("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(1));
    }

    @Test
    void update_ShouldReturn404_WhenServiceReturnsEmpty() throws Exception {
        User payload = User.builder()
                .userId(99L)
                .email("valid@email.com")
                .username("user-valid")
                .password("parola123")
                .build();

        when(userService.updateUser(eq(99L), any(User.class))).thenReturn(Optional.empty());


        mockMvc.perform(put("/api/users/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andDo(print())
                .andExpect(status().isNotFound());
    }
}

