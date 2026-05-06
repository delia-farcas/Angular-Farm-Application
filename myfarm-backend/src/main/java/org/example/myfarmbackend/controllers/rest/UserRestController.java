package org.example.myfarmbackend.controllers.rest;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.example.myfarmbackend.dto.LoginRequest;
import org.example.myfarmbackend.dto.UserDTO;
import org.example.myfarmbackend.dto.UserListItemDTO;
import org.example.myfarmbackend.models.User;
import org.example.myfarmbackend.services.IUserService;
import org.example.myfarmbackend.services.MonitoringService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@Validated
public class UserRestController {

    private final IUserService userService;
    private final MonitoringService monitoringService;

    public UserRestController(IUserService userService, MonitoringService monitoringService) {
        this.userService = userService;
        this.monitoringService = monitoringService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody UserDTO userDto, HttpServletRequest request) {
        User savedUser = userService.registerUser(userDto);
        monitoringService.logAction(savedUser.getUserId(), "USER", "REGISTER_SUCCESS", 201, request.getRemoteAddr());
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<UserDTO> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        Optional<User> authUser = userService.authenticate(loginRequest.email(), loginRequest.password());

        if (authUser.isPresent()) {
            User user = authUser.get();
            String role = user.getRoles() != null && !user.getRoles().isEmpty() ?
                    user.getRoles().iterator().next().getName() : "USER";

            monitoringService.logAction(user.getUserId(), role, "LOGIN_SUCCESS", 200, request.getRemoteAddr());
            return ResponseEntity.ok(toPublicUserDto(user));
        } else {
            monitoringService.logAction(null, "GUEST", "FAILED_LOGIN", 401, request.getRemoteAddr());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<List<UserListItemDTO>> listUsersWithAnimalCounts(
            @RequestParam Long requesterId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "15") @Min(1) int size,
            HttpServletRequest request) {

        if (!userService.isAdmin(requesterId)) {
            monitoringService.logAction(requesterId, "USER", "UNAUTHORIZED_SUMMARY_ACCESS", 403, request.getRemoteAddr());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(userService.getUsersWithAnimalCounts(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getById(@PathVariable Long id, HttpServletRequest request) {
        return userService.getUserById(id)
                .map(user -> {
                    return ResponseEntity.ok(toPublicUserDto(user));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<User>> list(
            @RequestParam Long requesterId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size,
            HttpServletRequest request
    ) {
        if (userService.isAdmin(requesterId)) {
            List<User> users = userService.getAllUsersPaginated(page, size);
            monitoringService.logAction(requesterId, "ADMIN", "LIST_USERS_ACCESS", 200, request.getRemoteAddr());
            return ResponseEntity.ok(users);
        }

        monitoringService.logAction(requesterId, "USER", "UNAUTHORIZED_LIST_ACCESS_ATTEMPT", 403, request.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
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
    public ResponseEntity<Void> delete(@PathVariable Long id, @RequestParam Long requesterId, HttpServletRequest request) {
        if (!userService.isAdmin(requesterId)) {
            monitoringService.logAction(requesterId, "USER", "FORBIDDEN_DELETE_USER_ATTEMPT", 403, request.getRemoteAddr());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (userService.deleteUser(id)) {
            monitoringService.logAction(requesterId, "ADMIN", "DELETE_USER_SUCCESS_ID: " + id, 204, request.getRemoteAddr());
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
}