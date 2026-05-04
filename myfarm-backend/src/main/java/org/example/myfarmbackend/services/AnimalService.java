package org.example.myfarmbackend.services;

import jakarta.transaction.Transactional;
import org.example.myfarmbackend.dto.AnimalDTO;
import org.example.myfarmbackend.models.Animal;
import org.example.myfarmbackend.models.User;
import org.example.myfarmbackend.repositories.AnimalRepository;
import org.example.myfarmbackend.repositories.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class AnimalService implements IAnimalService {

    private final AnimalRepository animalRepository;
    private final UserRepository userRepository;

    public AnimalService(AnimalRepository animalRepository, UserRepository userRepository) {
        this.animalRepository = animalRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Animal addAnimal(AnimalDTO dto) {
        User owner = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("Owner not found with ID: " + dto.getUserId()));
        Animal animal = new Animal();
        mapDtoToEntity(dto, animal);

        animal.setOwner(owner);

        return animalRepository.save(animal);
    }

    @Override
    public Animal updateAnimal(long id, AnimalDTO dto) { // Schimbăm în DTO
        return animalRepository.findById(id)
                .map(existingAnimal -> {
                    mapDtoToEntity(dto, existingAnimal);

                    // Reîncarcă proprietarul doar dacă ID-ul din DTO diferă de cel curent (evită apel inutil și erori când frontend trimite același userId).
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

    @Override
    @Transactional
    public boolean deleteAnimal(long id) {
        if (animalRepository.existsById(id)) {
            animalRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public Optional<Animal> getAnimalById(long id) {
        return animalRepository.findById(id);
    }

    @Override
    @Transactional
    public List<Animal> getUserAnimals(long ownerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        return animalRepository.findByOwnerUserId(ownerId, pageable).getContent();
    }

    @Override
    public long getTotalAnimalsCount(long ownerId) {
        return animalRepository.countByOwnerUserId(ownerId);
    }
}