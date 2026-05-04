package org.example.myfarmbackend.repositories;

import org.example.myfarmbackend.models.Animal;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AnimalRepositoryTest {

    @Test
    void constructor_ShouldSeedAnimals() {
        AnimalRepository repo = new AnimalRepository();

        assertEquals(50, repo.count());
        assertEquals(50, repo.countByOwnerId(1L));
        assertEquals(50, repo.countByOwnerIdAndType(1L, "vaca") + repo.countByOwnerIdAndType(1L, "capra")
                + repo.countByOwnerIdAndType(1L, "gaina") + repo.countByOwnerIdAndType(1L, "oaie")
                + repo.countByOwnerIdAndType(1L, "porc") + repo.countByOwnerIdAndType(1L, "cal"));
    }

    @Test
    void save_ShouldAssignId_WhenMissing() {
        AnimalRepository repo = new AnimalRepository();

        Animal a = new Animal();
        a.setId(null);
        a.setOwnerId(2L);
        a.setName("Bessie");
        a.setType("cow");
        a.setSex("female");
        a.setAge(3);
        a.setStatus("Healthy");
        a.setLocation("Sector 1");

        Animal saved = repo.save(a);

        assertNotNull(saved.getId());
        assertTrue(saved.getId() > 0);
        assertEquals(51, repo.count());
        assertEquals(1, repo.countByOwnerId(2L));
    }

    @Test
    void save_ShouldUpdateExisting_WhenIdMatches() {
        AnimalRepository repo = new AnimalRepository();

        Animal existing = repo.findById(1L).orElseThrow();
        existing.setName("Updated");

        repo.save(existing);

        Animal reloaded = repo.findById(1L).orElseThrow();
        assertEquals("Updated", reloaded.getName());
    }

    @Test
    void save_ShouldAddNew_WhenIdNotFound() {
        AnimalRepository repo = new AnimalRepository();

        Animal a = new Animal();
        a.setId(9999L);
        a.setOwnerId(3L);
        a.setName("New Animal");
        a.setType("cow");
        a.setSex("female");
        a.setAge(1);
        a.setStatus("Healthy");
        a.setLocation("Sector 1");

        repo.save(a);

        assertTrue(repo.findById(9999L).isPresent());
        assertEquals(51, repo.count());
    }

    @Test
    void delete_ShouldReturnFalse_WhenMissing() {
        AnimalRepository repo = new AnimalRepository();
        assertFalse(repo.delete(9999L));
    }

    @Test
    void delete_ShouldRemoveAndReturnTrue_WhenExists() {
        AnimalRepository repo = new AnimalRepository();

        assertTrue(repo.delete(1L));
        assertTrue(repo.findById(1L).isEmpty());
        assertEquals(49, repo.count());
    }

    @Test
    void findByOwnerIdPaginated_ShouldReturnCorrectPage() {
        AnimalRepository repo = new AnimalRepository();

        List<Animal> firstPage = repo.findByOwnerIdPaginated(1L, 0, 5);
        List<Animal> secondPage = repo.findByOwnerIdPaginated(1L, 1, 5);

        assertEquals(5, firstPage.size());
        assertEquals(5, secondPage.size());
        assertNotEquals(firstPage.get(0).getId(), secondPage.get(0).getId());
    }

    @Test
    void findByOwnerIdPaginated_ShouldReturnEmpty_WhenOutOfRange() {
        AnimalRepository repo = new AnimalRepository();

        List<Animal> empty = repo.findByOwnerIdPaginated(1L, 999, 5);

        assertTrue(empty.isEmpty());
    }
}

