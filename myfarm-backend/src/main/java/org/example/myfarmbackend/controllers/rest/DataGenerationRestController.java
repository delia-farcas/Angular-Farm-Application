package org.example.myfarmbackend.controllers.rest;

import org.example.myfarmbackend.services.DataGenerationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/generate")
@CrossOrigin(origins = "http://localhost:4200")
public class DataGenerationRestController {

    private final DataGenerationService dataGenerationService;

    public DataGenerationRestController(DataGenerationService dataGenerationService) {
        this.dataGenerationService = dataGenerationService;
    }

    @PostMapping("/start")
    public ResponseEntity<java.util.Map<String, String>> startGenerating(@RequestParam long ownerId) {
        dataGenerationService.startGenerating(ownerId);
        return ResponseEntity.ok(java.util.Map.of("message", "Generarea datelor a început pentru utilizatorul: " + ownerId));
    }

    @PostMapping("/stop")
    public ResponseEntity<java.util.Map<String, String>> stopGenerating() {
        dataGenerationService.stopGenerating();
        return ResponseEntity.ok(java.util.Map.of("message", "Generarea datelor a fost oprită."));
    }
}
