package org.example.myfarmbackend.controllers.rest;

import org.example.myfarmbackend.dto.AnimalDTO;
import org.example.myfarmbackend.models.Animal;
import org.example.myfarmbackend.services.AnimalService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/animals")
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
@Validated
public class AnimalRestController {

    private final AnimalService animalService;

    public AnimalRestController(AnimalService animalService) {
        this.animalService = animalService;
    }

    @GetMapping("/owner/{ownerId}")
    public List<AnimalDTO> getAnimalsByOwner(
            @PathVariable Long ownerId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "5") @Min(1) int size) {
        List<Animal> animals = animalService.getUserAnimals(ownerId, page, size);
        List<AnimalDTO> animalDtos = animals.stream()
                .map(this::mapEntityToDto) // Aici chemăm funcția de conversie pentru fiecare animal
                .collect(Collectors.toList());
        return animalDtos;
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnimalDTO> getAnimalById(@PathVariable long id) {
        return animalService
                .getAnimalById(id)
                .map(this::mapEntityToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/owner/{ownerId}/count")
    public ResponseEntity<Long> getAnimalsCountByOwner(@PathVariable long ownerId) {
        return ResponseEntity.ok(animalService.getTotalAnimalsCount(ownerId));
    }

    @PostMapping
    public ResponseEntity<AnimalDTO> addAnimal(@Valid @RequestBody AnimalDTO dto) {

        Animal savedAnimal = animalService.addAnimal(dto);
        AnimalDTO responseDTO = mapEntityToDto(savedAnimal);

        return ResponseEntity.ok(responseDTO);
    }

    private AnimalDTO mapEntityToDto(Animal animal) {
        AnimalDTO dto = new AnimalDTO();

        dto.setId(animal.getId());
        dto.setName(animal.getName());
        dto.setType(animal.getType());
        dto.setSex(animal.getSex());
        dto.setAge(animal.getAge());
        dto.setStatus(animal.getStatus());
        dto.setLocation(animal.getLocation());
        dto.setObservations(animal.getObservations());

        if (animal.getOwner() != null) {
            dto.setUserId(animal.getOwner().getUserId());
        }

        return dto;
    }
    @PutMapping("/{id}")
    public ResponseEntity<Animal> updateAnimal(@PathVariable Long id, @Valid @RequestBody AnimalDTO animalDto) {
        Animal updated = animalService.updateAnimal(id, animalDto);
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