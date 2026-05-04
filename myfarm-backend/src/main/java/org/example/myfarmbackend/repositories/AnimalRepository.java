package org.example.myfarmbackend.repositories;

import org.example.myfarmbackend.models.Animal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnimalRepository extends JpaRepository<Animal, Long> {

    Page<Animal> findByOwnerUserId(Long userId, Pageable pageable);

    long countByOwnerUserId(Long userId);

    long countByOwnerUserIdAndTypeIgnoreCase(Long userId, String type);

    List<Animal> findByLocation(String location);
}
