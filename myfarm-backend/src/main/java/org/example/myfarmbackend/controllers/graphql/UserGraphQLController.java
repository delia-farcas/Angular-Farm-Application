package org.example.myfarmbackend.controllers.graphql;

import org.example.myfarmbackend.models.User;
import org.example.myfarmbackend.services.UserService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.Optional;

@Controller
public class UserGraphQLController {

    private final UserService userService;

    public UserGraphQLController(UserService userService) {
        this.userService = userService;
    }

    // Oglindește GET /login din REST
    @QueryMapping
    public User getUserByEmail(@Argument String email) {
        return userService.getUserByEmail(email).orElse(null);
    }

    // Oglindește POST /register din REST
    @MutationMapping
    public User registerUser(@Argument String username, @Argument String email, @Argument String password) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password);
        return userService.registerUser(user);
    }
}