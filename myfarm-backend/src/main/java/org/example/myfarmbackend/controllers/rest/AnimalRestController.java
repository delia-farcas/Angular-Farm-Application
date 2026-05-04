package org.example.myfarmbackend.controllers.rest;

import org.example.myfarmbackend.models.Animal;
import org.example.myfarmbackend.services.AnimalService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/animals")
@CrossOrigin(origins = "http://localhost:4200")
@Validated
public class AnimalRestController {

    private final AnimalService animalService;

    public AnimalRestController(AnimalService animalService) {
        this.animalService = animalService;
    }

    @GetMapping("/owner/{ownerId}")
    public List<Animal> getAnimalsByOwner(
            @PathVariable Long ownerId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "5") @Min(1) int size) {
        return animalService.getUserAnimals(ownerId, page, size);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Animal> getAnimalById(@PathVariable long id) {
        return animalService.getAnimalById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/owner/{ownerId}/count")
    public ResponseEntity<Long> getAnimalsCountByOwner(@PathVariable long ownerId) {
        return ResponseEntity.ok(animalService.getTotalAnimalsCount(ownerId));
    }

    @PostMapping
    public ResponseEntity<Animal> addAnimal(@Valid @RequestBody Animal animal) {
        return ResponseEntity.ok(animalService.addAnimal(animal));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Animal> updateAnimal(@PathVariable Long id, @Valid @RequestBody Animal animal) {
        Animal updated = animalService.updateAnimal(id, animal);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnimal(@PathVariable Long id) {
        if (animalService.deleteAnimal(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}