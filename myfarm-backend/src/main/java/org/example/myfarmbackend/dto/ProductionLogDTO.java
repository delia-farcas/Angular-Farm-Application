package org.example.myfarmbackend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
public class ProductionLogDTO {

    private Long id;

    @NotNull(message = "Data este obligatorie")
    private LocalDate reportDate;

    private double milkLitersCow;

    private double meatKg;

    private int eggsCount;

    private int milkLitersSheep;

    private double woolKg;

    private double milkLitersGoat;

    private double workHours;

    @NotNull
    private long userId;
}
