package org.example.myfarmbackend.models;

import lombok.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    private long userId;

    @NotBlank(message = "Email is mandatory")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Username is mandatory")
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank(message = "Password is mandatory")
    private String password;

    private List<Animal> ownedAnimals = new ArrayList<>();
}