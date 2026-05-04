package org.example.myfarmbackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDTO {
    private Long userId;

    @NotBlank
    @Email
    private String email;

    @NotBlank @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    private String password;
}
