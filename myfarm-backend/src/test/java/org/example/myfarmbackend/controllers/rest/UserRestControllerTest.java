package org.example.myfarmbackend.controllers.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.myfarmbackend.config.JwtTokenProvider;
import org.example.myfarmbackend.dto.LoginRequest;
import org.example.myfarmbackend.dto.UserDTO;
import org.example.myfarmbackend.dto.UserListItemDTO;
import org.example.myfarmbackend.exceptions.GlobalExceptionHandler;
import org.example.myfarmbackend.models.Role;
import org.example.myfarmbackend.models.User;
import org.example.myfarmbackend.services.IUserService;
import org.example.myfarmbackend.services.MonitoringService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
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

    @MockBean
    private JwtTokenProvider tokenProvider;

    @BeforeEach
    void setUpSecurityContext() {
        SecurityContextHolder.getContext()
                .setAuthentication(new TestingAuthenticationToken("admin@farm.ro", null, "ROLE_ADMIN"));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void register_ShouldReturnCreatedUser_WhenValid() throws Exception {
        UserDTO payload = validUserDto();
        Role role = role("ROLE_USER");
        User savedUser = User.builder()
                .userId(10L)
                .email("ana@farm.ro")
                .username("AnaFarm")
                .password("encoded-secret")
                .roles(Set.of(role))
                .build();
        when(userService.registerUser(any(UserDTO.class))).thenReturn(CompletableFuture.completedFuture(savedUser));

        mockMvc.perform(
                        post("/api/users/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(10))
                .andExpect(jsonPath("$.email").value("ana@farm.ro"))
                .andExpect(jsonPath("$.username").value("AnaFarm"))
                .andExpect(jsonPath("$.password").value("encoded-secret"))
                .andExpect(jsonPath("$.roles[0].name").value("ROLE_USER"));

        verify(monitoringService).logAction(eq(10L), eq("USER"), eq("REGISTER_SUCCESS"), eq(201), any());
    }

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
    void register_ShouldReturn400_WhenEmailAlreadyExists() throws Exception {
        UserDTO payload = validUserDto();
        when(userService.registerUser(any(UserDTO.class)))
                .thenReturn(CompletableFuture.failedFuture(new RuntimeException("Email already in use: ana@farm.ro")));

        mockMvc.perform(
                        post("/api/users/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email already in use: ana@farm.ro"));
    }

    @Test
    void login_ShouldReturnTokenAndPublicUser_WhenCredentialsValid() throws Exception {
        Role adminRole = role("ROLE_ADMIN");
        User user = User.builder()
                .userId(7L)
                .email("admin@farm.ro")
                .username("AdminFarm")
                .password("encoded-password")
                .roles(Set.of(adminRole))
                .build();
        LoginRequest body = new LoginRequest("admin@farm.ro", "correct-password");
        when(userService.authenticate("admin@farm.ro", "correct-password"))
                .thenReturn(CompletableFuture.completedFuture(Optional.of(user)));
        when(tokenProvider.generateToken("admin@farm.ro", List.of("ROLE_ADMIN"))).thenReturn("jwt-token");

        mockMvc.perform(
                        post("/api/users/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.user.userId").value(7))
                .andExpect(jsonPath("$.user.email").value("admin@farm.ro"))
                .andExpect(jsonPath("$.user.username").value("AdminFarm"))
                .andExpect(jsonPath("$.user.role").value("ROLE_ADMIN"))
                .andExpect(jsonPath("$.user.password").doesNotExist());

        verify(monitoringService).logAction(eq(7L), eq("ROLE_ADMIN"), eq("LOGIN_SUCCESS"), eq(200), any());
    }

    @Test
    void login_ShouldUseDefaultUserRole_WhenUserHasNoRoles() throws Exception {
        User user = User.builder()
                .userId(8L)
                .email("user@farm.ro")
                .username("UserFarm")
                .password("encoded-password")
                .roles(Set.of())
                .build();
        LoginRequest body = new LoginRequest("user@farm.ro", "correct-password");
        when(userService.authenticate("user@farm.ro", "correct-password"))
                .thenReturn(CompletableFuture.completedFuture(Optional.of(user)));
        when(tokenProvider.generateToken("user@farm.ro", List.of())).thenReturn("jwt-token");

        mockMvc.perform(
                        post("/api/users/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.user.role").value("ROLE_USER"));

        verify(monitoringService).logAction(eq(8L), eq("ROLE_USER"), eq("LOGIN_SUCCESS"), eq(200), any());
    }

    @Test
    void login_ShouldReturn401_WhenCredentialsInvalid() throws Exception {
        LoginRequest body = new LoginRequest("x@x.com", "wrong");
        when(userService.authenticate("x@x.com", "wrong"))
                .thenReturn(CompletableFuture.completedFuture(Optional.empty()));

        mockMvc.perform(
                        post("/api/users/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized());

        verify(monitoringService).logAction(eq(null), eq("GUEST"), eq("FAILED_LOGIN"), eq(401), any());
    }

    @Test
    void login_ShouldReturn400_WhenPayloadInvalid() throws Exception {
        LoginRequest body = new LoginRequest("not-an-email", "");

        mockMvc.perform(
                        post("/api/users/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.email").exists())
                .andExpect(jsonPath("$.password").exists());
    }

    @Test
    void getById_ShouldReturn404_WhenMissing() throws Exception {
        when(userService.getUserById(5L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/users/5")).andExpect(status().isNotFound());
    }

    @Test
    void list_ShouldPaginateInController() throws Exception {
        when(userService.getAllUsersPaginated(0, 1))
                .thenReturn(
                        List.of(
                                User.builder().userId(1L).email("a@a.com").username("a").password("p").build(),
                                User.builder().userId(2L).email("b@b.com").username("b").password("p").build()));

        mockMvc.perform(
                        get("/api/users")
                                .queryParam("page", "0")
                                .queryParam("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(1));
    }

    @Test
    void summary_ShouldReturnRows_WhenRequesterIsAdmin() throws Exception {
        when(userService.getUsersWithAnimalCounts(0, 15))
                .thenReturn(CompletableFuture.completedFuture(List.of(new UserListItemDTO(2L, "user", "user@farm.ro", 3))));

        mockMvc.perform(get("/api/users/summary"))
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

        when(userService.updateUser(eq(99L), any(UserDTO.class)))
                .thenReturn(CompletableFuture.completedFuture(Optional.empty()));

        mockMvc.perform(
                        put("/api/users/99")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isNotFound());
    }

    private UserDTO validUserDto() {
        UserDTO dto = new UserDTO();
        dto.setEmail("ana@farm.ro");
        dto.setUsername("AnaFarm");
        dto.setPassword("secret123");
        return dto;
    }

    private Role role(String name) {
        Role role = new Role();
        role.setName(name);
        return role;
    }
}
