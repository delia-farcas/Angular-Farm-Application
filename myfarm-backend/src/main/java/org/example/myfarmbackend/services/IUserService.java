package org.example.myfarmbackend.services;

import org.example.myfarmbackend.models.User;
import java.util.List;
import java.util.Optional;

/** * Service interface for User management and authentication logic.
 * Bridges the security/account layer with the RAM storage.
 */
public interface IUserService {

    /** Registers a new user after checking for email uniqueness. */
    User registerUser(User user);

    /** Finds a user by their email (useful for login). */
    Optional<User> getUserByEmail(String email);

    /** Retrieves a user by their unique ID. */
    Optional<User> getUserById(long id);

    /** Returns all registered users. */
    List<User> getAllUsers();

    /** Updates user profile information. */
    Optional<User> updateUser(long id, User userData);

    /** Deletes a user account from the system. */
    boolean deleteUser(long id);
}