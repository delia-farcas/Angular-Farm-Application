package org.example.myfarmbackend.models;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor @AllArgsConstructor
public class ProductionLog {
    private Long id;

    @NotNull(message = "Data este obligatorie")
    private LocalDate reportDate;


    private double milkLitersCow;
    private double meatKg;
    private int eggsCount;
    private int milkLitersSheep;
    private double woolKg;
    private double workHours;

    @NotNull
    private Long userId;
}