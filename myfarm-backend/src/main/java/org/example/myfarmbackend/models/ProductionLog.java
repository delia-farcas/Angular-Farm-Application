package org.example.myfarmbackend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Entity
@Table(name = "ProductionLogs")
@Getter
@Setter
@NoArgsConstructor @AllArgsConstructor
public class ProductionLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotNull(message = "Data este obligatorie")
    private LocalDate reportDate;

    @Column(nullable = true)
    private double milkLitersCow;

    @Column(nullable = true)
    private double meatKg;

    @Column(nullable = true)
    private int eggsCount;

    @Column(nullable = true)
    private int milkLitersSheep;

    @Column(nullable = true)
    private double woolKg;

    @Column(nullable = true)
    private double milkLitersGoat;

    @Column(nullable = true)
    private double workHours;

    @ManyToOne
    @JoinColumn(name = "userId")
    @NotNull
    @JsonIgnore
    private User user;
}