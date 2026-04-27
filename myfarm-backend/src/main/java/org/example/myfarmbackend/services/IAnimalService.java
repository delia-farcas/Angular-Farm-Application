package org.example.myfarmbackend.services;

import org.example.myfarmbackend.models.Animal;
import java.util.List;
import java.util.Optional;

/** * Service interface for managing animal-related business logic.
 * Connects the API layer with the in-memory storage.
 */
public interface IAnimalService {

    /** Validates and saves a new animal. */
    Animal addAnimal(Animal animal);

    /** Updates an existing animal's details. */
    Optional<Animal> updateAnimal(long id, Animal animalData);

    /** Removes an animal by ID and returns success status. */
    boolean deleteAnimal(long id);

    /** Finds a specific animal by its unique ID. */
    Optional<Animal> getAnimalById(long id);

    /** Returns a paginated list of animals for a specific owner. */
    List<Animal> getUserAnimals(long ownerId, int page, int size);

    /** Gets the total number of animals owned by a user. */
    long getTotalAnimalsCount(long ownerId);

}