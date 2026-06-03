package org.example.myfarmbackend.services;

import jakarta.transaction.Transactional;
import org.example.myfarmbackend.dto.AnimalDTO;
import org.example.myfarmbackend.models.Animal;
import org.example.myfarmbackend.models.User;
import org.example.myfarmbackend.repositories.AnimalRepository;
import org.example.myfarmbackend.repositories.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
public class AnimalService implements IAnimalService {

    private final AnimalRepository animalRepository;
    private final UserRepository userRepository;

    public AnimalService(AnimalRepository animalRepository, UserRepository userRepository) {
        this.animalRepository = animalRepository;
        this.userRepository = userRepository;
    }

    @Async
    @Override
    @Transactional
    public CompletableFuture<Animal> addAnimal(AnimalDTO dto) {
        User owner = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("Owner not found with ID: " + dto.getUserId()));
        Animal animal = new Animal();
        mapDtoToEntity(dto, animal);
        animal.setOwner(owner);
        return CompletableFuture.completedFuture(animalRepository.save(animal));
    }

    @Async
    @Override
    @Transactional
    public CompletableFuture<Animal> updateAnimal(long id, AnimalDTO dto) {
        Animal updated = animalRepository.findById(id)
                .map(existingAnimal -> {
                    mapDtoToEntity(dto, existingAnimal);

                    if (dto.getUserId() != null) {
                        Long currentOwnerId =
                                existingAnimal.getOwner() != null
                                        ? existingAnimal.getOwner().getUserId()
                                        : null;
                        if (!Objects.equals(currentOwnerId, dto.getUserId())) {
                            User newOwner =
                                    userRepository
                                            .findById(dto.getUserId())
                                            .orElseThrow(
                                                    () ->
                                                            new RuntimeException(
                                                                    "New owner not found"));
                            existingAnimal.setOwner(newOwner);
                        }
                    }

                    return animalRepository.save(existingAnimal);
                }).orElse(null);
        return CompletableFuture.completedFuture(updated);
    }

    private void mapDtoToEntity(AnimalDTO dto, Animal animal) {
        animal.setName(dto.getName());
        animal.setType(dto.getType());
        animal.setSex(dto.getSex());
        animal.setAge(dto.getAge());
        animal.setStatus(dto.getStatus());
        animal.setLocation(dto.getLocation());
        animal.setObservations(dto.getObservations());
    }

    @Async
    @Override
    @Transactional
    public CompletableFuture<Boolean> deleteAnimal(long id) {
        boolean deleted = false;
        if (animalRepository.existsById(id)) {
            animalRepository.deleteById(id);
            deleted = true;
        }
        return CompletableFuture.completedFuture(deleted);
    }

    @Async
    @Override
    @Transactional()
    public CompletableFuture<Optional<Animal>> getAnimalById(long id) {
        return CompletableFuture.completedFuture(animalRepository.findById(id));
    }

    @Async
    @Override
    @Transactional
    public CompletableFuture<List<Animal>> getUserAnimals(long ownerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return CompletableFuture.completedFuture(
                animalRepository.findByOwnerUserId(ownerId, pageable).getContent());
    }

    @Override
    public long getTotalAnimalsCount(long ownerId) {
        return animalRepository.countByOwnerUserId(ownerId);
    }
}
