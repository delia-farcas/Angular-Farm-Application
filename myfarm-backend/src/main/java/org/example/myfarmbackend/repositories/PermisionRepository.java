package org.example.myfarmbackend.repositories;

import org.example.myfarmbackend.models.Permision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PermisionRepository extends JpaRepository<Permision, Long> {
    Optional<Permision> findByName(String name);
}