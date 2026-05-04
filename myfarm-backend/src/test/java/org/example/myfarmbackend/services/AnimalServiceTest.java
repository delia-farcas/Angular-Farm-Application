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

import java.util.List;
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

    @Test
    void deleteAnimal_ShouldReturnFalse_WhenAnimalDoesNotExist() {
        when(animalRepository.delete(1L)).thenReturn(false);

        boolean result = animalService.deleteAnimal(1L);

        assertFalse(result);
    }

    @Test
    void updateAnimal_ShouldUpdateAndReturnAnimal_WhenExists() {
        Animal existing = new Animal();
        existing.setId(1L);
        existing.setName("Old");
        existing.setOwnerId(10L);

        Animal patch = new Animal();
        patch.setName("NewName");
        patch.setType("cow");
        patch.setSex("female");
        patch.setAge(3);
        patch.setStatus("Healthy");
        patch.setLocation("Sector 1");
        patch.setObservations("Obs");
        patch.setOwnerId(10L);

        when(animalRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(animalRepository.save(any(Animal.class))).thenAnswer(inv -> inv.getArgument(0));

        Animal updated = animalService.updateAnimal(1L, patch);

        assertNotNull(updated);
        assertEquals("NewName", updated.getName());
        assertEquals("cow", updated.getType());
        assertEquals(3, updated.getAge());
        verify(animalRepository).findById(1L);
        verify(animalRepository).save(any(Animal.class));
    }

    @Test
    void updateAnimal_ShouldReturnNull_WhenNotFound() {
        when(animalRepository.findById(1L)).thenReturn(Optional.empty());

        Animal result = animalService.updateAnimal(1L, new Animal());

        assertNull(result);
        verify(animalRepository, never()).save(any());
    }

    @Test
    void getAnimalById_ShouldDelegateToRepository() {
        when(animalRepository.findById(1L)).thenReturn(Optional.of(testAnimal));

        Optional<Animal> result = animalService.getAnimalById(1L);

        assertTrue(result.isPresent());
        assertEquals("Zuzu", result.get().getName());
        verify(animalRepository).findById(1L);
    }

    @Test
    void getUserAnimals_ShouldReturnPaginatedList() {
        when(animalRepository.findByOwnerIdPaginated(10L, 0, 5)).thenReturn(List.of(testAnimal));

        List<Animal> result = animalService.getUserAnimals(10L, 0, 5);

        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
        verify(animalRepository).findByOwnerIdPaginated(10L, 0, 5);
    }

    @Test
    void getTotalAnimalsCount_ShouldDelegateToRepository() {
        when(animalRepository.countByOwnerId(10L)).thenReturn(7L);

        long count = animalService.getTotalAnimalsCount(10L);

        assertEquals(7L, count);
        verify(animalRepository).countByOwnerId(10L);
    }
}