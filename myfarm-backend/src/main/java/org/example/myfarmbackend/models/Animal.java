package org.example.myfarmbackend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "Animals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Animal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "Numele este obligatoriu")
    @Size(min = 2, max = 100)
    private String name;

    @Column(nullable = false)
    @NotBlank(message = "Tipul este obligatoriu")
    @Size(min = 2, max = 100)
    private String type;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "Sexul este obligatoriu")
    @Size(min = 2, max = 100)
    private String sex;

    @Column(nullable = false)
    @NotNull(message = "Vârsta este obligatorie")
    @Min(0)
    private int age;

    @Column(nullable = false)
    @NotBlank(message = "Statusul este obligatoriu")
    @Size(min = 2, max = 100)
    private String status;

    @Column(nullable = false)
    @NotBlank(message = "Locația este obligatorie")
    @Size(min = 2, max = 100)
    private String location;

    @Column(nullable = true)
    @Size(max = 500)
    private String observations;

    @ManyToOne
    @JoinColumn(name = "userId")
    @NotNull(message = "Owner ID este obligatoriu")
    private User owner;
}