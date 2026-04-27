package org.example.myfarmbackend.services;

import org.example.myfarmbackend.models.User;
import org.example.myfarmbackend.repositories.IUserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService implements IUserService {

    private final IUserRepository userRepository;

    public UserService(IUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use: " + user.getEmail());
        }
        return userRepository.save(user);
    }

    @Override
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
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
    public Optional<User> updateUser(long id, User userData) {
        return userRepository.findById(id).map(existingUser -> {
            Optional<User> userWithSameEmail = userRepository.findByEmail(userData.getEmail());
            if (userWithSameEmail.isPresent() && userWithSameEmail.get().getUserId() != id) {
                throw new RuntimeException("Email-ul este deja utilizat de alt cont!");
            }

            existingUser.setUsername(userData.getUsername());
            existingUser.setEmail(userData.getEmail());
            existingUser.setPassword(userData.getPassword());

            return userRepository.save(existingUser);
        });
    }

    @Override
    public boolean deleteUser(long id) {
        return userRepository.delete(id);
    }
}