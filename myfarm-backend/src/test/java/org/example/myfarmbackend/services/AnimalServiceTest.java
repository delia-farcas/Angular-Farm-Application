package org.example.myfarmbackend.services;

import org.example.myfarmbackend.models.Animal;
import org.example.myfarmbackend.models.User;
import org.example.myfarmbackend.repositories.IAnimalRepository;
import org.example.myfarmbackend.repositories.IUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnimalServiceTest {

    @Mock
    private IAnimalRepository animalRepository;

    @Mock
    private IUserRepository userRepository;

    @InjectMocks
    private AnimalService animalService;

    private Animal testAnimal;

    @BeforeEach
    void setUp() {
        testAnimal = new Animal();
        testAnimal.setId(1L);
        testAnimal.setName("Zuzu");
        testAnimal.setOwnerId(10L);
    }

    @Test
    void addAnimal_ShouldSucceed_WhenOwnerExists() {
        // Arrange
        when(userRepository.findById(10L)).thenReturn(Optional.of(new User()));
        when(animalRepository.save(any(Animal.class))).thenReturn(testAnimal);

        // Act
        Animal savedAnimal = animalService.addAnimal(testAnimal);

        // Assert
        assertNotNull(savedAnimal);
        assertEquals("Zuzu", savedAnimal.getName());
        verify(animalRepository, times(1)).save(testAnimal);
    }

    @Test
    void addAnimal_ShouldThrowException_WhenOwnerDoesNotExist() {
        // Arrange (Mandatory Bronze: Server-side validation)
        when(userRepository.findById(10L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            animalService.addAnimal(testAnimal);
        });

        assertEquals("Owner not found with ID: 10", exception.getMessage());
        verify(animalRepository, never()).save(any());
    }

    @Test
    void deleteAnimal_ShouldReturnTrue_WhenAnimalExists() {
        // Arrange
        when(animalRepository.delete(1L)).thenReturn(true);

        // Act
        boolean result = animalService.deleteAnimal(1L);

        // Assert
        assertTrue(result);
    }
}