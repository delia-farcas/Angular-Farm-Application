package org.example.myfarmbackend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AnimalDTO {
    private Long id;

    @NotBlank(message = "Numele este obligatoriu")
    @Size(min = 2, max = 100, message = "Numele trebuie să aibă între 2 și 100 de caractere")
    private String name;

    @NotBlank(message = "Tipul este obligatoriu")
    @Size(min = 2, max = 100)
    private String type;

    @NotBlank(message = "Sexul este obligatoriu")
    @Size(min = 2, max = 100)
    private String sex;

    @NotNull(message = "Vârsta este obligatorie")
    @Min(value = 0, message = "Vârsta nu poate fi negativă")
    private int age;

    @NotBlank(message = "Statusul este obligatoriu")
    private String status;

    @NotBlank(message = "Locația este obligatorie")
    private String location;

    @Size(max = 500, message = "Observațiile nu pot depăși 500 de caractere")
    private String observations;

    @NotNull(message = "ID-ul proprietarului este obligatoriu")
    private Long userId;
}
