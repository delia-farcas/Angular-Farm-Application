package org.example.myfarmbackend.repositories;

import org.example.myfarmbackend.models.User;
import org.springframework.stereotype.Repository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class UserRepository implements IUserRepository {
    private final List<User> users = new ArrayList<>();

    @Override
    public List<User> findAll() {
        return users;
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return users.stream().filter(u -> u.getEmail().equals(email)).findFirst();
    }

    @Override
    public Optional<User> findById(long id) {
        return users.stream().filter(u -> u.getUserId() == id).findFirst();
    }

    @Override
    public User save(User user) {
        users.add(user);
        return user;
    }

    @Override
    public Boolean delete(long id) {
        boolean exists = users.stream().anyMatch(a -> a.getUserId() == id);
        if (!exists) {
            return false;
        }
        return users.removeIf(user -> user.getUserId() == id);
    }
}