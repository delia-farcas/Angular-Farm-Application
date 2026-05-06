package org.example.myfarmbackend.repositories;

import org.example.myfarmbackend.models.ObservationEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ObservationListRepository extends JpaRepository<ObservationEntry, Integer> {

    List<ObservationEntry> findAllByIsResolvedFalse();

    boolean existsByUserIdAndIsResolvedFalse(Long userId);

    boolean existsByUserIdAndViolationTypeAndIsResolvedFalse(Long userId, String violationType);

    boolean existsByIpAddressAndViolationTypeAndIsResolvedFalse(String ipAddress, String violationType);

    ObservationEntry findByUserIdAndIsResolvedFalse(Long userId);
}
