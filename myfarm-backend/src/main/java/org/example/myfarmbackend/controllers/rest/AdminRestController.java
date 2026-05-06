package org.example.myfarmbackend.controllers.rest;

import org.example.myfarmbackend.models.ActivityLog;
import org.example.myfarmbackend.models.ObservationEntry;
import org.example.myfarmbackend.repositories.ActivityLogRepository;
import org.example.myfarmbackend.repositories.ObservationListRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminRestController {

    private final ActivityLogRepository activityLogRepository;
    private final ObservationListRepository observationListRepository;

    public AdminRestController(ActivityLogRepository activityLogRepository,
                               ObservationListRepository observationListRepository) {
        this.activityLogRepository = activityLogRepository;
        this.observationListRepository = observationListRepository;
    }

    @GetMapping("/logs")
    public List<ActivityLog> getAllLogs() {
        return activityLogRepository.findAll();
    }

    @GetMapping("/observations")
    public List<ObservationEntry> getActiveObservations() {
        return observationListRepository.findAllByIsResolvedFalse();
    }

    @PutMapping("/observations/{id}/resolve")
    public ResponseEntity<Void> resolveObservation(@PathVariable Integer id) {
        return observationListRepository.findById(id)
                .map(entry -> {
                    entry.setIsResolved(true);
                    observationListRepository.save(entry);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}