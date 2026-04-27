package org.example.myfarmbackend.repositories;

import org.example.myfarmbackend.models.User;
import java.util.List;
import java.util.Optional;

/**
 * Interface for managing User data storage.
 * Supports authentication and the 1-to-many relationship structure.
 */
public interface IUserRepository {
    /** Returns all registered users in the system. */
    List<User> findAll();

    /** Retrieves a user by their unique email. Returns Optional to handle missing users safely. */
    Optional<User> findByEmail(String email);

    /** Retrieves a user by their unique ID. Returns Optional to handle missing users safely. */
    Optional<User> findById(long id);

    /** Adds a new user or updates an existing one in the RAM storage. */
    User save(User user);

    /** Deletes a user from the storage */
    Boolean delete(long id);
}