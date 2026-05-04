package org.example.myfarmbackend.repositories;

import org.example.myfarmbackend.models.Animal;
import org.springframework.stereotype.Repository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class AnimalRepository implements IAnimalRepository {
    private final List<Animal> allAnimals = new ArrayList<>();

    private final AtomicLong idGenerator = new AtomicLong(1);

    public AnimalRepository() {

        String[] types = {"vaca", "capra", "gaina", "oaie", "porc", "cal"};
        String[] statuses = {"Sanatos", "In tratament", "Productiv", "Repaus"};

        for (int i = 0; i < 50; i++) {
            Animal a = new Animal();
            a.setId(idGenerator.getAndIncrement());
            a.setOwnerId(1L); // Setăm ownerId 1 pentru a fi vizibile după login
            a.setName("Animal " + a.getId());
            a.setType(types[i % types.length]);
            a.setSex(i % 2 == 0 ? "mascul" : "femela");
            a.setAge(1 + (i % 10));
            a.setStatus(statuses[i % statuses.length]);
            a.setLocation("Sector " + ((i % 5) + 1));
            a.setObservations("Generat pentru testare Gold/Bronze");

            allAnimals.add(a);
        }
    }

    @Override
    public Animal save(Animal animal) {
        if (animal.getId() == null || animal.getId() == 0) {
            animal.setId(idGenerator.getAndIncrement());
            allAnimals.add(animal);
        } else {
            boolean exists = allAnimals.stream().anyMatch(a -> a.getId().equals(animal.getId()));
            if (!exists) {
                // New animal with ID provided by frontend
                allAnimals.add(animal);
            } else {
                // Updating existing animal
                allAnimals.removeIf(a -> a.getId().equals(animal.getId()));
                allAnimals.add(animal);
            }
        }

        System.out.println("Salvat/Actualizat animalul: " + animal.getName() +
                " cu ID: " + animal.getId() +
                " pentru OwnerID: " + animal.getOwnerId());

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
