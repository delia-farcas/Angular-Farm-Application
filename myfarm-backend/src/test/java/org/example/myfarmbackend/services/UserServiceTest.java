package org.example.myfarmbackend.services;

import org.example.myfarmbackend.dto.UserDTO;
import org.example.myfarmbackend.models.Role;
import org.example.myfarmbackend.models.User;
import org.example.myfarmbackend.repositories.AnimalRepository;
import org.example.myfarmbackend.repositories.PermisionRepository;
import org.example.myfarmbackend.repositories.RoleRepository;
import org.example.myfarmbackend.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AnimalRepository animalRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PermisionRepository permisionRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserService userService;

    private User testUser;
    private UserDTO testDto;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, animalRepository, roleRepository, permisionRepository);
        ReflectionTestUtils.setField(userService, "passwordEncoder", passwordEncoder);

        testUser =
                User.builder()
                        .userId(1L)
                        .username("GeorgeP")
                        .email("george@farm.ro")
                        .password("parola123")
                        .roles(new HashSet<>())
                        .build();

        testDto = new UserDTO();
        testDto.setUsername("GeorgeP");
        testDto.setEmail("george@farm.ro");
        testDto.setPassword("parola123");
    }

    @Test
    void registerUser_ShouldSucceed_WhenEmailIsUnique() {
        Role defaultRole = new Role();
        defaultRole.setName("ROLE_USER");
        when(userRepository.findByEmail(testDto.getEmail())).thenReturn(Optional.empty());
        when(roleRepository.findByName("ROLE_USER")).thenReturn(Optional.of(defaultRole));
        when(passwordEncoder.encode("parola123")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        User result = userService.registerUser(testDto).join();

        assertNotNull(result);
        assertEquals("george@farm.ro", result.getEmail());
        assertEquals("encoded-password", result.getPassword());
        assertTrue(result.getRoles().contains(defaultRole));
        verify(passwordEncoder).encode("parola123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerUser_ShouldThrowException_WhenEmailAlreadyExists() {
        when(userRepository.findByEmail(testDto.getEmail())).thenReturn(Optional.of(testUser));

        assertThrows(ExecutionException.class, () -> userService.registerUser(testDto).get());
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any());
    }

    @Test
    void registerUser_ShouldThrowException_WhenDefaultRoleMissing() {
        when(userRepository.findByEmail(testDto.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode("parola123")).thenReturn("encoded-password");
        when(roleRepository.findByName("ROLE_USER")).thenReturn(Optional.empty());

        ExecutionException exception = assertThrows(ExecutionException.class, () -> userService.registerUser(testDto).get());
        assertTrue(exception.getCause() instanceof RuntimeException);
        assertTrue(exception.getCause().getMessage().contains("ROLE_USER"));

        verify(userRepository, never()).save(any());
    }

    @Test
    void authenticate_ShouldReturnUser_WhenPasswordMatches() {
        when(userRepository.findByEmail("george@farm.ro")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("parola123", "parola123")).thenReturn(true);

        Optional<User> result = userService.authenticate("george@farm.ro", "parola123").join();

        assertTrue(result.isPresent());
        assertEquals("GeorgeP", result.get().getUsername());
        verify(passwordEncoder).matches("parola123", "parola123");
    }

    @Test
    void authenticate_ShouldReturnEmpty_WhenPasswordWrong() {
        when(userRepository.findByEmail("george@farm.ro")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrong", "parola123")).thenReturn(false);

        Optional<User> result = userService.authenticate("george@farm.ro", "wrong").join();

        assertTrue(result.isEmpty());
    }

    @Test
    void authenticate_ShouldReturnEmpty_WhenEmailMissing() {
        when(userRepository.findByEmail("missing@farm.ro")).thenReturn(Optional.empty());

        Optional<User> result = userService.authenticate("missing@farm.ro", "parola123").join();

        assertTrue(result.isEmpty());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    void getUserByEmail_ShouldReturnUser_WhenExists() {
        when(userRepository.findByEmail("george@farm.ro")).thenReturn(Optional.of(testUser));
        Optional<User> result = userService.getUserByEmail("george@farm.ro");
        assertTrue(result.isPresent());
        assertEquals("GeorgeP", result.get().getUsername());
    }

    @Test
    void getUserById_ShouldReturnUser_WhenExists() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        Optional<User> result = userService.getUserById(1L);
        assertTrue(result.isPresent());
        assertEquals(1L, result.get().getUserId());
    }

    @Test
    void getAllUsers_ShouldReturnList() {
        when(userRepository.findAll()).thenReturn(List.of(testUser));
        List<User> result = userService.getAllUsers();
        assertEquals(1, result.size());
    }

    @Test
    void updateUser_ShouldSucceed_WhenValid() {
        UserDTO updatedData = new UserDTO();
        updatedData.setEmail("new@farm.ro");
        updatedData.setUsername("NewName");
        updatedData.setPassword("pass");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.findByEmail("new@farm.ro")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("pass")).thenReturn("encoded-pass");
        when(userRepository.save(any(User.class)))
                .thenAnswer(
                        inv -> {
                            User u = inv.getArgument(0);
                            u.setUsername("NewName");
                            return u;
                        });

        Optional<User> result = userService.updateUser(1L, updatedData).join();

        assertTrue(result.isPresent());
        assertEquals("NewName", result.get().getUsername());
        assertEquals("encoded-pass", result.get().getPassword());
    }

    @Test
    void updateUser_ShouldThrow_WhenEmailUsedByAnotherUser() {
        User existingOther =
                User.builder().userId(2L).email("dup@farm.ro").username("Other").password("x").build();
        UserDTO updatedData = new UserDTO();
        updatedData.setEmail("dup@farm.ro");
        updatedData.setUsername("NewName");
        updatedData.setPassword("pass");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.findByEmail("dup@farm.ro")).thenReturn(Optional.of(existingOther));

        assertThrows(ExecutionException.class, () -> userService.updateUser(1L, updatedData).get());
        verify(userRepository, never()).save(any());
    }

    @Test
    void updateUser_ShouldReturnEmpty_WhenUserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        Optional<User> result = userService.updateUser(1L, testDto).join();

        assertTrue(result.isEmpty());
        verify(userRepository, never()).save(any());
    }

    @Test
    void deleteUser_ShouldReturnTrue_WhenExists() {
        Role role = new Role();
        role.setName("ROLE_USER");
        testUser.getRoles().add(role);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        boolean result = userService.deleteUser(1L).join();

        assertTrue(result);
        assertTrue(testUser.getRoles().isEmpty());
        verify(userRepository).save(testUser);
        verify(userRepository).delete(testUser);
    }

    @Test
    void deleteUser_ShouldReturnFalse_WhenMissing() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        boolean result = userService.deleteUser(1L).join();

        assertFalse(result);
        verify(userRepository, never()).delete(any());
    }
}
