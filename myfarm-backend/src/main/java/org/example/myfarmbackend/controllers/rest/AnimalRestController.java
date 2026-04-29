package org.example.myfarmbackend.controllers.rest;

import org.example.myfarmbackend.models.Animal;
import org.example.myfarmbackend.services.AnimalService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/animals")
@CrossOrigin(origins = "*")
public class AnimalRestController {

    private final AnimalService animalService;

    public AnimalRestController(AnimalService animalService) {
        this.animalService = animalService;
    }

    @GetMapping("/owner/{ownerId}")
    public List<Animal> getAnimalsByOwner(
            @PathVariable Long ownerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        // Implementăm paginarea server-side cerută
        return animalService.getUserAnimals(ownerId, page, size);
    }

    @PostMapping
    public ResponseEntity<Animal> addAnimal(@Valid @RequestBody Animal animal) {
        // @Valid asigură Server-side validation
        return ResponseEntity.ok(animalService.addAnimal(animal));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnimal(@PathVariable Long id) {
        if (animalService.deleteAnimal(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}