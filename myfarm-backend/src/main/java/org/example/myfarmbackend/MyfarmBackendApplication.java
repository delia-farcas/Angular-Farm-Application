package org.example.myfarmbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class MyfarmBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(MyfarmBackendApplication.class, args);
    }

}
