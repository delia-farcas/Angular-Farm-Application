package org.example.myfarmbackend.repositories;

import org.example.myfarmbackend.models.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void saveAndFindByEmail() {
        User u = new User();
        u.setEmail("alice@farm.test");
        u.setUsername("Alice");
        u.setPassword("secret");
        userRepository.save(u);

        Optional<User> found = userRepository.findByEmail("alice@farm.test");
        assertTrue(found.isPresent());
        assertEquals("Alice", found.get().getUsername());
    }

    @Test
    void existsById_and_deleteById() {
        User u = new User();
        u.setEmail("bob@farm.test");
        u.setUsername("Bob");
        u.setPassword("secret");
        User saved = userRepository.save(u);

        assertTrue(userRepository.existsById(saved.getUserId()));
        userRepository.deleteById(saved.getUserId());
        assertFalse(userRepository.existsById(saved.getUserId()));
    }
}
