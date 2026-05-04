package org.example.myfarmbackend.repositories;

import org.example.myfarmbackend.models.User;
import org.springframework.stereotype.Repository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class UserRepository implements IUserRepository {
    private final List<User> users = new ArrayList<>();
    private final AtomicLong idGenerator = new AtomicLong(1);

    public UserRepository() {
        User defaultUser = new User();
        defaultUser.setUserId(idGenerator.getAndIncrement());
        defaultUser.setEmail("default@example.com");
        defaultUser.setUsername("Default User");
        defaultUser.setPassword("password");
        users.add(defaultUser);
    }

    @Override
    public List<User> findAll() {
        return new ArrayList<>(users);
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
        if (user.getUserId() == 0) {
            user.setUserId(idGenerator.getAndIncrement());
            users.add(user);
        } else {
            users.removeIf(u -> u.getUserId() == user.getUserId());
            users.add(user);
        }
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