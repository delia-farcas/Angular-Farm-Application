package org.example.myfarmbackend.controllers.rest;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.example.myfarmbackend.config.JwtTokenProvider;
import org.example.myfarmbackend.dto.LoginRequest;
import org.example.myfarmbackend.dto.LoginResponseDTO;
import org.example.myfarmbackend.dto.UserDTO;
import org.example.myfarmbackend.dto.UserListItemDTO;
import org.example.myfarmbackend.models.User;
import org.example.myfarmbackend.models.Role;
import org.example.myfarmbackend.services.IUserService;
import org.example.myfarmbackend.services.MonitoringService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder; // Import nou pentru context
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@Validated
public class UserRestController {

    private final IUserService userService;
    private final MonitoringService monitoringService;
    private final JwtTokenProvider tokenProvider;

    public UserRestController(IUserService userService, MonitoringService monitoringService, JwtTokenProvider tokenProvider) {
        this.userService = userService;
        this.monitoringService = monitoringService;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody UserDTO userDto, HttpServletRequest request) {
        User savedUser = userService.registerUser(userDto);
        monitoringService.logAction(savedUser.getUserId(), "USER", "REGISTER_SUCCESS", 201, request.getRemoteAddr());
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        Optional<User> authUser = userService.authenticate(loginRequest.email(), loginRequest.password());

        if (authUser.isPresent()) {
            User user = authUser.get();
            List<String> roles = user.getRoles().stream()
                    .map(Role::getName)
                    .collect(Collectors.toList());

            String primaryRole = roles.isEmpty() ? "ROLE_USER" : roles.get(0);
            String token = tokenProvider.generateToken(user.getEmail(), roles);

            monitoringService.logAction(user.getUserId(), primaryRole, "LOGIN_SUCCESS", 200, request.getRemoteAddr());

            UserDTO userDto = toPublicUserDto(user);
            return ResponseEntity.ok(new LoginResponseDTO(token, userDto));
        } else {
            monitoringService.logAction(null, "GUEST", "FAILED_LOGIN", 401, request.getRemoteAddr());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<List<UserListItemDTO>> listUsersWithAnimalCounts(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "15") @Min(1) int size) {

        return ResponseEntity.ok(userService.getUsersWithAnimalCounts(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok(toPublicUserDto(user)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<User>> list(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size,
            HttpServletRequest request
    ) {
        List<User> users = userService.getAllUsersPaginated(page, size);
        monitoringService.logAction(null, "ADMIN", "LIST_USERS_ACCESS BY: " + getAuthenticatedUserEmail(), 200, request.getRemoteAddr());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable Long id, @RequestBody @Valid UserDTO userDto, HttpServletRequest request) {
        return userService.updateUser(id, userDto)
                .map(user -> {
                    monitoringService.logAction(user.getUserId(), "USER", "UPDATE_USER_DATA", 200, request.getRemoteAddr());
                    return ResponseEntity.ok(user);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        if (userService.deleteUser(id)) {
            monitoringService.logAction(null, "ADMIN", "DELETE_USER_SUCCESS_ID: " + id + " BY: " + getAuthenticatedUserEmail(), 204, request.getRemoteAddr());
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    private UserDTO toPublicUserDto(User user) {
        UserDTO dto = new UserDTO();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());

        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            String roleName = user.getRoles().iterator().next().getName();
            dto.setRole(roleName);
        } else {
            dto.setRole("ROLE_USER");
        }
        return dto;
    }

    private String getAuthenticatedUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal != null ? principal.toString() : "UNKNOWN";
    }
}