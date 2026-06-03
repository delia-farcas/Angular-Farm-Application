package org.example.myfarmbackend.services;

import org.example.myfarmbackend.dto.AnimalDTO;
import org.example.myfarmbackend.models.Animal;
import org.example.myfarmbackend.models.User;
import org.example.myfarmbackend.repositories.AnimalRepository;
import org.example.myfarmbackend.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnimalServiceTest {

    @Mock
    private AnimalRepository animalRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AnimalService animalService;

    private AnimalDTO testDto;
    private User owner;

    @BeforeEach
    void setUp() {
        owner = User.builder().userId(10L).email("o@o.com").username("Owner").password("p").build();

        testDto = new AnimalDTO();
        testDto.setUserId(10L);
        testDto.setName("Zuzu");
        testDto.setType("vaca");
        testDto.setSex("femela");
        testDto.setAge(2);
        testDto.setStatus("activ");
        testDto.setLocation("Stână");
        testDto.setObservations("ok");
    }

    @Test
    void addAnimal_ShouldSucceed_WhenOwnerExists() {
        Animal saved = new Animal();
        saved.setId(1L);
        saved.setName("Zuzu");
        saved.setOwner(owner);

        when(userRepository.findById(10L)).thenReturn(Optional.of(owner));
        when(animalRepository.save(any(Animal.class))).thenReturn(saved);

        Animal result = animalService.addAnimal(testDto).join();

        assertNotNull(result);
        assertEquals("Zuzu", result.getName());
        verify(animalRepository, times(1)).save(any(Animal.class));
    }

    @Test
    void addAnimal_ShouldThrowException_WhenOwnerDoesNotExist() {
        when(userRepository.findById(10L)).thenReturn(Optional.empty());

        ExecutionException exception =
                assertThrows(ExecutionException.class, () -> animalService.addAnimal(testDto).get());

        assertEquals("Owner not found with ID: 10", exception.getCause().getMessage());
        verify(animalRepository, never()).save(any());
    }

    @Test
    void deleteAnimal_ShouldReturnTrue_WhenAnimalExists() {
        when(animalRepository.existsById(1L)).thenReturn(true);
        doNothing().when(animalRepository).deleteById(1L);

        boolean result = animalService.deleteAnimal(1L).join();

        assertTrue(result);
    }

    @Test
    void deleteAnimal_ShouldReturnFalse_WhenAnimalDoesNotExist() {
        when(animalRepository.existsById(1L)).thenReturn(false);

        boolean result = animalService.deleteAnimal(1L).join();

        assertFalse(result);
    }

    @Test
    void updateAnimal_ShouldUpdateAndReturnAnimal_WhenExists() {
        Animal existing = new Animal();
        existing.setId(1L);
        existing.setName("Old");
        existing.setType("vaca");
        existing.setSex("femela");
        existing.setAge(1);
        existing.setStatus("activ");
        existing.setLocation("A");
        existing.setOwner(owner);

        AnimalDTO patch = new AnimalDTO();
        patch.setName("NewName");
        patch.setType("vaca");
        patch.setSex("femela");
        patch.setAge(3);
        patch.setStatus("activ");
        patch.setLocation("Sector 1");
        patch.setObservations("Obs");
        patch.setUserId(10L);

        when(animalRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(animalRepository.save(any(Animal.class))).thenAnswer(inv -> inv.getArgument(0));

        Animal updated = animalService.updateAnimal(1L, patch).join();

        assertNotNull(updated);
        assertEquals("NewName", updated.getName());
        assertEquals("vaca", updated.getType());
        assertEquals(3, updated.getAge());
        verify(animalRepository).findById(1L);
        verify(animalRepository).save(any(Animal.class));
    }

    @Test
    void updateAnimal_ShouldReturnNull_WhenNotFound() {
        when(animalRepository.findById(1L)).thenReturn(Optional.empty());

        Animal result = animalService.updateAnimal(1L, testDto).join();

        assertNull(result);
        verify(animalRepository, never()).save(any());
    }

    @Test
    void getAnimalById_ShouldDelegateToRepository() {
        Animal a = new Animal();
        a.setId(1L);
        a.setName("Zuzu");
        a.setOwner(owner);

        when(animalRepository.findById(1L)).thenReturn(Optional.of(a));

        Optional<Animal> result = animalService.getAnimalById(1L).join();

        assertTrue(result.isPresent());
        assertEquals("Zuzu", result.get().getName());
        verify(animalRepository).findById(1L);
    }

    @Test
    void getUserAnimals_ShouldReturnPaginatedList() {
        Animal a = new Animal();
        a.setId(1L);
        a.setName("Zuzu");
        a.setOwner(owner);

        when(animalRepository.findByOwnerUserId(eq(10L), eq(PageRequest.of(0, 5))))
                .thenReturn(new PageImpl<>(List.of(a)));

        List<Animal> result = animalService.getUserAnimals(10L, 0, 5).join();

        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }

    @Test
    void getTotalAnimalsCount_ShouldDelegateToRepository() {
        when(animalRepository.countByOwnerUserId(10L)).thenReturn(7L);

        long count = animalService.getTotalAnimalsCount(10L);

        assertEquals(7L, count);
        verify(animalRepository).countByOwnerUserId(10L);
    }
}
