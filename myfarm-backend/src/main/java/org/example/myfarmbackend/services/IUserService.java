package org.example.myfarmbackend.services;

import org.example.myfarmbackend.dto.UserDTO;
import org.example.myfarmbackend.dto.UserListItemDTO;
import org.example.myfarmbackend.models.User;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

/** * Service interface for User management and authentication logic.
 * Bridges the security/account layer with the RAM storage.
 */
public interface IUserService {

    /** Registers a new user after checking for email uniqueness. */
    CompletableFuture<User> registerUser(UserDTO user);

    boolean isAdmin(long userId);

    /** Finds a user by their email (useful for login). */
    Optional<User> getUserByEmail(String email);

    /** Validates email and password and returns the user when they match. */
    CompletableFuture<Optional<User>> authenticate(String email, String password);

    List<User> getAllUsersPaginated(int page, int size);

    /** Paginated users with how many animals each user owns. */
    CompletableFuture<List<UserListItemDTO>> getUsersWithAnimalCounts(int page, int size);

    /** Retrieves a user by their unique ID. */
    Optional<User> getUserById(long id);

    /** Returns all registered users. */
    List<User> getAllUsers();

    /** Updates user profile information. */
    CompletableFuture<Optional<User>> updateUser(long id, UserDTO userData);

    /** Deletes a user account from the system. */
    CompletableFuture<Boolean> deleteUser(long id);
}
