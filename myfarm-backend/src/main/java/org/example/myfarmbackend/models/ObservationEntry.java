package org.example.myfarmbackend.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "observation_list")
@Data
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class ObservationEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "violation_type", length = 100)
    private String violationType;

    @Column(name = "risk_level", length = 20)
    private String riskLevel = "MEDIUM"; // Default conform SQL

    @Column(name = "is_resolved")
    private Boolean isResolved = false; // Mapare pentru BIT

    @Column(name = "detected_at", updatable = false)
    private LocalDateTime detectedAt;

    @PrePersist
    void onCreate() {
        if (detectedAt == null) {
            detectedAt = LocalDateTime.now();
        }
    }
}
