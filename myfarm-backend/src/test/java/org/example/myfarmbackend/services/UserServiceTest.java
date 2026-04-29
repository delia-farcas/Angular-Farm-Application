package org.example.myfarmbackend.services;

import org.example.myfarmbackend.models.User;
import org.example.myfarmbackend.repositories.IUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
        // Arrange
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.empty());
        when(userRepository.save(testUser)).thenReturn(testUser);

        // Act
        User result = userService.registerUser(testUser);

        // Assert
        assertNotNull(result);
        assertEquals("george@farm.ro", result.getEmail());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void registerUser_ShouldThrowException_WhenEmailAlreadyExists() {
        // Arrange (Testăm validarea server-side pentru date unice)
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> userService.registerUser(testUser));
        verify(userRepository, never()).save(any());
    }
}