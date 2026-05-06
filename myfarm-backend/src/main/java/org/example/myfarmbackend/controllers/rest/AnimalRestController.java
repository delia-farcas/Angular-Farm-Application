package org.example.myfarmbackend.controllers.rest;

import jakarta.servlet.http.HttpServletRequest;
import org.example.myfarmbackend.dto.AnimalDTO;
import org.example.myfarmbackend.models.Animal;
import org.example.myfarmbackend.services.AnimalService;
import org.example.myfarmbackend.services.MonitoringService;
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
    private final MonitoringService monitoringService;

    public AnimalRestController(AnimalService animalService, MonitoringService monitoringService) {
        this.animalService = animalService;
        this.monitoringService = monitoringService;
    }

    @GetMapping("/owner/{ownerId}")
    public List<AnimalDTO> getAnimalsByOwner(
            @PathVariable Long ownerId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "5") @Min(1) int size,
            HttpServletRequest request) {

        List<Animal> animals = animalService.getUserAnimals(ownerId, page, size);

        monitoringService.logAction(ownerId, "USER", "FETCH_OWNED_ANIMALS", 200, request.getRemoteAddr());

        return animals.stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnimalDTO> getAnimalById(@PathVariable long id, HttpServletRequest request) {
        return animalService.getAnimalById(id)
                .map(animal -> {
                    monitoringService.logAction(animal.getOwner().getUserId(), "USER", "VIEW_ANIMAL_DETAILS_ID: " + id, 200, request.getRemoteAddr());
                    return ResponseEntity.ok(mapEntityToDto(animal));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/owner/{ownerId}/count")
    public ResponseEntity<Long> getAnimalsCountByOwner(@PathVariable long ownerId) {
        return ResponseEntity.ok(animalService.getTotalAnimalsCount(ownerId));
    }

    @PostMapping
    public ResponseEntity<AnimalDTO> addAnimal(@Valid @RequestBody AnimalDTO dto, HttpServletRequest request) {
        Animal savedAnimal = animalService.addAnimal(dto);

        monitoringService.logAction(dto.getUserId(), "USER", "ADD_NEW_ANIMAL: " + dto.getName(), 201, request.getRemoteAddr());

        return ResponseEntity.ok(mapEntityToDto(savedAnimal));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Animal> updateAnimal(@PathVariable Long id, @Valid @RequestBody AnimalDTO animalDto, HttpServletRequest request) {
        Animal updated = animalService.updateAnimal(id, animalDto);
        if (updated != null) {
            monitoringService.logAction(animalDto.getUserId(), "USER", "UPDATE_ANIMAL_ID: " + id, 200, request.getRemoteAddr());
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnimal(@PathVariable Long id, HttpServletRequest request) {
        // Obținem animalul înainte de ștergere pentru a știi cine era proprietarul în log
        Optional<Animal> animal = animalService.getAnimalById(id);
        Long ownerId = animal.isPresent() ? animal.get().getOwner().getUserId() : null;

        if (animalService.deleteAnimal(id)) {
            monitoringService.logAction(ownerId, "USER", "DELETE_ANIMAL_ID: " + id, 204, request.getRemoteAddr());
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
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
}