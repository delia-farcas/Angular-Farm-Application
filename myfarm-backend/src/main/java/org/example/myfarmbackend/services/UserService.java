package org.example.myfarmbackend.services;

import org.example.myfarmbackend.dto.UserDTO;
import org.example.myfarmbackend.dto.UserListItemDTO;
import org.example.myfarmbackend.models.Role;
import org.example.myfarmbackend.models.User;
import org.example.myfarmbackend.repositories.AnimalRepository;
import org.example.myfarmbackend.repositories.PermisionRepository;
import org.example.myfarmbackend.repositories.RoleRepository;
import org.example.myfarmbackend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
@Transactional
public class UserService implements IUserService {

    private final UserRepository userRepository;
    private final AnimalRepository animalRepository;
    private final RoleRepository roleRepository;
    private final PermisionRepository permisionRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       AnimalRepository animalRepository,
                       RoleRepository roleRepository,
                       PermisionRepository permisionRepository) {
        this.userRepository = userRepository;
        this.animalRepository = animalRepository;
        this.roleRepository = roleRepository;
        this.permisionRepository = permisionRepository;
    }

    @Async
    @Override
    @Transactional
    public CompletableFuture<User> registerUser(UserDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use: " + dto.getEmail());
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        String encodedPassword = passwordEncoder.encode(dto.getPassword());
        user.setPassword(encodedPassword);
        Role defaultRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Error: Role ROLE_USER not found in DB."));
        user.getRoles().add(defaultRole);
        return CompletableFuture.completedFuture(userRepository.save(user));
    }

    @Override
    public boolean isAdmin(long userId) {
        return userRepository.findById(userId)
                .map(user -> user.getRoles() != null
                        && user.getRoles().stream()
                        .anyMatch(role -> "ROLE_ADMIN".equals(role.getName())))
                .orElse(false);
    }

    @Override
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Async
    @Override
    @Transactional(readOnly = true)
    public CompletableFuture<Optional<User>> authenticate(String email, String password) {
        Optional<User> authenticated = userRepository
                .findByEmail(email)
                .filter(u -> passwordEncoder.matches(password, u.getPassword()));
        return CompletableFuture.completedFuture(authenticated);
    }

    @Override
    public Optional<User> getUserById(long id) {
        return userRepository.findById(id);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public List<User> getAllUsersPaginated(int page, int size) {
        return userRepository.findAll(PageRequest.of(page, size)).getContent();
    }

    @Async
    @Override
    @Transactional(readOnly = true)
    public CompletableFuture<List<UserListItemDTO>> getUsersWithAnimalCounts(int page, int size) {
        List<User> users = userRepository.findAll(PageRequest.of(page, size)).getContent();
        List<UserListItemDTO> rows = new ArrayList<>(users.size());
        for (User u : users) {
            long count = animalRepository.countByOwnerUserId(u.getUserId());
            rows.add(new UserListItemDTO(u.getUserId(), u.getUsername(), u.getEmail(), count));
        }
        return CompletableFuture.completedFuture(rows);
    }

    @Async
    @Override
    @Transactional
    public CompletableFuture<Optional<User>> updateUser(long id, UserDTO dto) {
        Optional<User> updated = userRepository.findById(id).map(existingUser -> {
            Optional<User> userWithSameEmail = userRepository.findByEmail(dto.getEmail());
            if (userWithSameEmail.isPresent() && userWithSameEmail.get().getUserId() != id) {
                throw new RuntimeException("Email-ul este deja utilizat de alt cont!");
            }

            existingUser.setUsername(dto.getUsername());
            existingUser.setEmail(dto.getEmail());
            String encodedPassword = passwordEncoder.encode(dto.getPassword());
            existingUser.setPassword(encodedPassword);

            return userRepository.save(existingUser);
        });
        return CompletableFuture.completedFuture(updated);
    }

    @Async
    @Override
    @Transactional
    public CompletableFuture<Boolean> deleteUser(long id) {
        boolean deleted = userRepository.findById(id).map(user -> {
            user.getRoles().clear();
            userRepository.save(user);
            userRepository.delete(user);
            return true;
        }).orElse(false);
        return CompletableFuture.completedFuture(deleted);
    }
}
