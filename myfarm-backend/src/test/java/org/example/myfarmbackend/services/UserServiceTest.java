package org.example.myfarmbackend.services;

import org.example.myfarmbackend.models.User;
import org.example.myfarmbackend.repositories.IUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private IUserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .userId(1L)
                .username("GeorgeP")
                .email("george@farm.ro")
                .password("parola123")
                .build();
    }

    @Test
    void registerUser_ShouldSucceed_WhenEmailIsUnique() {
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.empty());
        when(userRepository.save(testUser)).thenReturn(testUser);

        User result = userService.registerUser(testUser);

        assertNotNull(result);
        assertEquals("george@farm.ro", result.getEmail());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void registerUser_ShouldThrowException_WhenEmailAlreadyExists() {
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));

        assertThrows(RuntimeException.class, () -> userService.registerUser(testUser));
        verify(userRepository, never()).save(any());
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
        when(userRepository.findAll()).thenReturn(Arrays.asList(testUser));
        List<User> result = userService.getAllUsers();
        assertEquals(1, result.size());
    }

    @Test
    void updateUser_ShouldSucceed_WhenValid() {
        User updatedData = User.builder().userId(1L).email("new@farm.ro").username("NewName").password("pass").build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.findByEmail("new@farm.ro")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(updatedData);

        Optional<User> result = userService.updateUser(1L, updatedData);

        assertTrue(result.isPresent());
        assertEquals("NewName", result.get().getUsername());
    }

    @Test
    void deleteUser_ShouldReturnTrue_WhenExists() {
        when(userRepository.delete(1L)).thenReturn(true);
        boolean result = userService.deleteUser(1L);
        assertTrue(result);
    }
}