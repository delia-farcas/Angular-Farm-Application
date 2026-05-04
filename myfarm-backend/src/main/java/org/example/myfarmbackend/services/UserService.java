package org.example.myfarmbackend.services;

import org.example.myfarmbackend.dto.UserDTO;
import org.example.myfarmbackend.dto.UserListItemDTO;
import org.example.myfarmbackend.models.User;
import org.example.myfarmbackend.repositories.AnimalRepository;
import org.example.myfarmbackend.repositories.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService implements IUserService {

    private final UserRepository userRepository;
    private final AnimalRepository animalRepository;

    public UserService(UserRepository userRepository, AnimalRepository animalRepository) {
        this.userRepository = userRepository;
        this.animalRepository = animalRepository;
    }

    @Override
    public User registerUser(UserDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use: " + dto.getEmail());
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());

        return userRepository.save(user);
    }

    @Override
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public Optional<User> authenticate(String email, String password) {
        return userRepository
                .findByEmail(email)
                .filter(u -> u.getPassword().equals(password));
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

    @Override
    public List<UserListItemDTO> getUsersWithAnimalCounts(int page, int size) {
        List<User> users = userRepository.findAll(PageRequest.of(page, size)).getContent();
        List<UserListItemDTO> rows = new ArrayList<>(users.size());
        for (User u : users) {
            long count = animalRepository.countByOwnerUserId(u.getUserId());
            rows.add(new UserListItemDTO(u.getUserId(), u.getUsername(), u.getEmail(), count));
        }
        return rows;
    }

    @Override
    public Optional<User> updateUser(long id, UserDTO dto) {
        return userRepository.findById(id).map(existingUser -> {
            Optional<User> userWithSameEmail = userRepository.findByEmail(dto.getEmail());
            if (userWithSameEmail.isPresent() && userWithSameEmail.get().getUserId() != id) {
                throw new RuntimeException("Email-ul este deja utilizat de alt cont!");
            }

            existingUser.setUsername(dto.getUsername());
            existingUser.setEmail(dto.getEmail());
            existingUser.setPassword(dto.getPassword());

            return userRepository.save(existingUser);
        });
    }

    @Override
    public boolean deleteUser(long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }
}