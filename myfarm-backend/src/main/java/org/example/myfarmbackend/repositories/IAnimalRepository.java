package org.example.myfarmbackend.repositories;

import org.example.myfarmbackend.models.Animal;

import java.util.List;
import java.util.Optional;

/**
 * Interface defining the contract for Animal storage operations.
 * Adheres to the "separate endpoints from implementation" requirement.
 */
public interface IAnimalRepository {
    /** Saves or updates an animal in the RAM collection. */
    Animal save(Animal animal);

    /**Deletes animal form the collection. */
    Boolean delete(long animalId);

    /** Searches animal in colection by id*/
    Optional<Animal> findById(long animalId);

    /** Returns a paginated list of animals for a specific owner.*/
    List<Animal> findByOwnerIdPaginated(long ownerId, int page, int size);

    /** Returns the total number of animals for a specific owner (for pagination metadata). */
    long countByOwnerId(long ownerId);

    /** Returns the total number of animals in the system. */
    long count();

}
