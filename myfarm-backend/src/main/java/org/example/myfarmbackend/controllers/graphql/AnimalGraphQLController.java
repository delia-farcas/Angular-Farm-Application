package org.example.myfarmbackend.controllers.graphql;

import org.example.myfarmbackend.models.Animal;
import org.example.myfarmbackend.services.AnimalService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class AnimalGraphQLController {

    private final AnimalService animalService;

    public AnimalGraphQLController(AnimalService animalService) {
        this.animalService = animalService;
    }

    // Oglindește GET-ul din REST
    @QueryMapping
    public List<Animal> getAnimalsByOwner(
            @Argument Long ownerId,
            @Argument int page,
            @Argument int size) {
        return animalService.getUserAnimals(ownerId, page, size);
    }

    // Oglindește POST-ul din REST (Mutations sunt pentru scriere)
    @MutationMapping
    public Animal addAnimal(@Argument String name, @Argument String type, @Argument Long ownerId) {
        Animal animal = new Animal();
        animal.setName(name);
        animal.setType(type);
        animal.setOwnerId(ownerId);
        return animalService.addAnimal(animal);
    }

    // Oglindește DELETE-ul din REST
    @MutationMapping
    public Boolean deleteAnimal(@Argument Long id) {
        return animalService.deleteAnimal(id);
    }
}