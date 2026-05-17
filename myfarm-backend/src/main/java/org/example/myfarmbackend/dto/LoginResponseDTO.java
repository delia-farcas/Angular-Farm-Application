package org.example.myfarmbackend.dto;

public record LoginResponseDTO(
        String token,
        UserDTO user
) {}
