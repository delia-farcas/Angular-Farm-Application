package org.example.myfarmbackend.models;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Animal {
    private Long id;

    @NotBlank(message = "Numele este obligatoriu")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank(message = "Tipul este obligatoriu")
    @Size(min = 2, max = 100)
    private String type;

    @NotBlank(message = "Sexul este obligatoriu")
    @Size(min = 2, max = 100)
    private String sex;

    @NotNull(message = "Vârsta este obligatorie")
    @Min(0)
    private int age;

    @NotBlank(message = "Statusul este obligatoriu")
    @Size(min = 2, max = 100)
    private String status;

    @NotBlank(message = "Locația este obligatorie")
    @Size(min = 2, max = 100)
    private String location;

    @Size(max = 500)
    private String observations;

    @NotNull(message = "Owner ID este obligatoriu")
    private Long ownerId;
}