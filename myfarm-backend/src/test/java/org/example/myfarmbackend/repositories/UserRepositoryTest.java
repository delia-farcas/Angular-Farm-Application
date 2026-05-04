package org.example.myfarmbackend.repositories;

import org.example.myfarmbackend.models.User;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class UserRepositoryTest {

    @Test
    void constructor_ShouldCreateDefaultUser() {
        UserRepository repo = new UserRepository();

        List<User> users = repo.findAll();

        assertEquals(1, users.size());
        assertEquals("default@example.com", users.get(0).getEmail());
        assertEquals(1L, users.get(0).getUserId());
    }

    @Test
    void findAll_ShouldReturnCopy_NotBackedByInternalList() {
        UserRepository repo = new UserRepository();

        List<User> users = repo.findAll();
        users.clear();

        assertEquals(1, repo.findAll().size());
    }

    @Test
    void save_ShouldAssignId_WhenUserIdIsZero() {
        UserRepository repo = new UserRepository();
        User u = new User();
        u.setUserId(0);
        u.setEmail("a@a.com");
        u.setUsername("Aaa");
        u.setPassword("pass");

        User saved = repo.save(u);

        assertTrue(saved.getUserId() > 0);
        assertTrue(repo.findByEmail("a@a.com").isPresent());
    }

    @Test
    void save_ShouldUpdate_WhenUserIdExists() {
        UserRepository repo = new UserRepository();

        User u = new User();
        u.setUserId(0);
        u.setEmail("a@a.com");
        u.setUsername("Aaa");
        u.setPassword("pass");
        repo.save(u);

        long id = repo.findByEmail("a@a.com").orElseThrow().getUserId();

        User updated = new User();
        updated.setUserId(id);
        updated.setEmail("a@a.com");
        updated.setUsername("NewName");
        updated.setPassword("newPass");

        repo.save(updated);

        User loaded = repo.findById(id).orElseThrow();
        assertEquals("NewName", loaded.getUsername());
        assertEquals("newPass", loaded.getPassword());
        assertEquals(2, repo.findAll().size()); // default + saved user
    }

    @Test
    void findById_ShouldReturnEmpty_WhenMissing() {
        UserRepository repo = new UserRepository();
        assertTrue(repo.findById(999).isEmpty());
    }

    @Test
    void delete_ShouldReturnFalse_WhenMissing() {
        UserRepository repo = new UserRepository();
        assertFalse(repo.delete(999));
    }

    @Test
    void delete_ShouldRemoveAndReturnTrue_WhenExists() {
        UserRepository repo = new UserRepository();

        User u = new User();
        u.setUserId(0);
        u.setEmail("a@a.com");
        u.setUsername("Aaa");
        u.setPassword("pass");
        repo.save(u);

        long id = repo.findByEmail("a@a.com").orElseThrow().getUserId();
        assertTrue(repo.delete(id));
        assertTrue(repo.findById(id).isEmpty());
    }
}

