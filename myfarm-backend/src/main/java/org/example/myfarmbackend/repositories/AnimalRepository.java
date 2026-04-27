package org.example.myfarmbackend.repositories;

import org.example.myfarmbackend.models.Animal;
import org.springframework.stereotype.Repository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class AnimalRepository implements IAnimalRepository {
    private final List<Animal> allAnimals = new ArrayList<>();

    @Override
    public Animal save(Animal animal) {
        allAnimals.add(animal);
        return animal;
    }

    @Override
    public Boolean delete(long animalId) {
        boolean exists = allAnimals.stream().anyMatch(a -> a.getId().equals(animalId));
        if (!exists) {
            return false;
        }
        return allAnimals.removeIf(animal -> animal.getId().equals(animalId));
    }

    @Override
    public Optional<Animal> findById(long animalId) {
        return allAnimals.stream()
                .filter(a -> a.getId() == animalId)
                .findFirst();
        // Nu mai punem .get(), returnăm direct Optional-ul
    }

    @Override
    public List<Animal> findByOwnerIdPaginated(long ownerId, int page, int size) {
        List<Animal> userAnimals = allAnimals.stream()
                .filter(animal -> animal.getOwnerId().equals(ownerId))
                .toList();

        int start = page * size;
        int end = Math.min((start + size), userAnimals.size());

        if (start > userAnimals.size()) {
            return new ArrayList<>();
        }

        return userAnimals.subList(start, end);
    }

    @Override
    public long countByOwnerId(long ownerId){
        List<Animal> userAnimals = allAnimals.stream()
                .filter(animal -> animal.getOwnerId().equals(ownerId))
                .toList();
        return userAnimals.size();
    }

    @Override
    public long count() {
        return allAnimals.size();
    }
}
