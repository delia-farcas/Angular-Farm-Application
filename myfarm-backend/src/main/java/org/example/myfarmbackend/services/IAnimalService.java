package org.example.myfarmbackend.services;

import org.example.myfarmbackend.dto.AnimalDTO;
import org.example.myfarmbackend.models.Animal;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

/** * Service interface for managing animal-related business logic.
 * Connects the API layer with the in-memory storage.
 */
public interface IAnimalService {

    /** Validates and saves a new animal. */
    CompletableFuture<Animal> addAnimal(AnimalDTO animalDTO);

    /** Updates an existing animal's details. */
    CompletableFuture<Animal> updateAnimal(long id, AnimalDTO animalData);

    /** Removes an animal by ID and returns success status. */
    CompletableFuture<Boolean> deleteAnimal(long id);

    /** Finds a specific animal by its unique ID. */
    CompletableFuture<Optional<Animal>> getAnimalById(long id);

    /** Returns a paginated list of animals for a specific owner. */
    CompletableFuture<List<Animal>> getUserAnimals(long ownerId, int page, int size);

    /** Gets the total number of animals owned by a user. */
    long getTotalAnimalsCount(long ownerId);
}
