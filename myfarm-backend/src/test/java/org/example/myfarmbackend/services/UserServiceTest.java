package org.example.myfarmbackend.services;

import org.example.myfarmbackend.dto.UserDTO;
import org.example.myfarmbackend.models.User;
import org.example.myfarmbackend.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private UserDTO testDto;

    @BeforeEach
    void setUp() {
        testUser =
                User.builder()
                        .userId(1L)
                        .username("GeorgeP")
                        .email("george@farm.ro")
                        .password("parola123")
                        .build();

        testDto = new UserDTO();
        testDto.setUsername("GeorgeP");
        testDto.setEmail("george@farm.ro");
        testDto.setPassword("parola123");
    }

    @Test
    void registerUser_ShouldSucceed_WhenEmailIsUnique() {
        when(userRepository.findByEmail(testDto.getEmail())).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        User result = userService.registerUser(testDto);

        assertNotNull(result);
        assertEquals("george@farm.ro", result.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void registerUser_ShouldThrowException_WhenEmailAlreadyExists() {
        when(userRepository.findByEmail(testDto.getEmail())).thenReturn(Optional.of(testUser));

        assertThrows(RuntimeException.class, () -> userService.registerUser(testDto));
        verify(userRepository, never()).save(any());
    }

    @Test
    void authenticate_ShouldReturnUser_WhenPasswordMatches() {
        when(userRepository.findByEmail("george@farm.ro")).thenReturn(Optional.of(testUser));

        Optional<User> result = userService.authenticate("george@farm.ro", "parola123");

        assertTrue(result.isPresent());
        assertEquals("GeorgeP", result.get().getUsername());
    }

    @Test
    void authenticate_ShouldReturnEmpty_WhenPasswordWrong() {
        when(userRepository.findByEmail("george@farm.ro")).thenReturn(Optional.of(testUser));

        Optional<User> result = userService.authenticate("george@farm.ro", "wrong");

        assertTrue(result.isEmpty());
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
        when(userRepository.save(any(User.class)))
                .thenAnswer(
                        inv -> {
                            User u = inv.getArgument(0);
                            u.setUsername("NewName");
                            return u;
                        });

        Optional<User> result = userService.updateUser(1L, updatedData);

        assertTrue(result.isPresent());
        assertEquals("NewName", result.get().getUsername());
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

        assertThrows(RuntimeException.class, () -> userService.updateUser(1L, updatedData));
        verify(userRepository, never()).save(any());
    }

    @Test
    void updateUser_ShouldReturnEmpty_WhenUserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        Optional<User> result = userService.updateUser(1L, testDto);

        assertTrue(result.isEmpty());
        verify(userRepository, never()).save(any());
    }

    @Test
    void deleteUser_ShouldReturnTrue_WhenExists() {
        when(userRepository.existsById(1L)).thenReturn(true);
        doNothing().when(userRepository).deleteById(1L);

        boolean result = userService.deleteUser(1L);

        assertTrue(result);
        verify(userRepository).deleteById(1L);
    }

    @Test
    void deleteUser_ShouldReturnFalse_WhenMissing() {
        when(userRepository.existsById(1L)).thenReturn(false);

        boolean result = userService.deleteUser(1L);

        assertFalse(result);
        verify(userRepository, never()).deleteById(anyLong());
    }
}
