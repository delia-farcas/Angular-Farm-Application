package org.example.myfarmbackend.services;

import org.example.myfarmbackend.models.Animal;
import org.example.myfarmbackend.repositories.IAnimalRepository;
import org.example.myfarmbackend.repositories.IUserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AnimalService implements IAnimalService {

    private final IAnimalRepository animalRepository;
    private final IUserRepository userRepository;

    public AnimalService(IAnimalRepository animalRepository, IUserRepository userRepository) {
        this.animalRepository = animalRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Animal addAnimal(Animal animal) {
        userRepository.findById(animal.getOwnerId())
                .orElseThrow(() -> new RuntimeException("Owner not found with ID: " + animal.getOwnerId()));

        return animalRepository.save(animal);
    }

    @Override
    public Optional<Animal> updateAnimal(long id, Animal animalData) {
        return animalRepository.findById(id).map(existingAnimal -> {
            existingAnimal.setName(animalData.getName());
            existingAnimal.setType(animalData.getType());
            existingAnimal.setSex(animalData.getSex());
            existingAnimal.setAge(animalData.getAge());
            existingAnimal.setStatus(animalData.getStatus());
            existingAnimal.setLocation(animalData.getLocation());
            existingAnimal.setObservations(animalData.getObservations());

            return animalRepository.save(existingAnimal);
        });
    }

    @Override
    public boolean deleteAnimal(long id) {
        return animalRepository.delete(id);
    }

    @Override
    public Optional<Animal> getAnimalById(long id) {
        return animalRepository.findById(id);
    }

    @Override
    public List<Animal> getUserAnimals(long ownerId, int page, int size) {
        return animalRepository.findByOwnerIdPaginated(ownerId, page, size);
    }

    @Override
    public long getTotalAnimalsCount(long ownerId) {
        return animalRepository.countByOwnerId(ownerId);
    }
}