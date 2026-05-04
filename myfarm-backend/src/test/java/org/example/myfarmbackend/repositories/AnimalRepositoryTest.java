package org.example.myfarmbackend.repositories;

import org.example.myfarmbackend.models.Animal;
import org.example.myfarmbackend.models.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class AnimalRepositoryTest {

    @Autowired
    private AnimalRepository animalRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void findByOwnerUserId_returnsPage() {
        User owner = new User();
        owner.setEmail("owner-animals@farm.test");
        owner.setUsername("OwnerAnimals");
        owner.setPassword("secret");
        owner = userRepository.save(owner);

        Animal a = new Animal();
        a.setName("Bessie");
        a.setType("vaca");
        a.setSex("femela");
        a.setAge(3);
        a.setStatus("activ");
        a.setLocation("Stână 1");
        a.setOwner(owner);
        animalRepository.save(a);

        Page<Animal> page = animalRepository.findByOwnerUserId(owner.getUserId(), PageRequest.of(0, 10));

        assertEquals(1, page.getTotalElements());
        assertEquals("Bessie", page.getContent().get(0).getName());
    }

    @Test
    void countByOwnerUserIdAndTypeIgnoreCase_works() {
        User owner = new User();
        owner.setEmail("owner-count@farm.test");
        owner.setUsername("OwnerCount");
        owner.setPassword("secret");
        owner = userRepository.save(owner);

        Animal a = new Animal();
        a.setName("Zuzu");
        a.setType("vaca");
        a.setSex("femela");
        a.setAge(2);
        a.setStatus("activ");
        a.setLocation("Stână");
        a.setOwner(owner);
        animalRepository.save(a);

        assertEquals(1L, animalRepository.countByOwnerUserId(owner.getUserId()));
        assertEquals(1L, animalRepository.countByOwnerUserIdAndTypeIgnoreCase(owner.getUserId(), "VACA"));
    }
}
