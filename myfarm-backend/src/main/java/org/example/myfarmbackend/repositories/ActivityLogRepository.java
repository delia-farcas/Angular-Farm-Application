package org.example.myfarmbackend.repositories;

import org.example.myfarmbackend.models.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Integer> {

    // Numărăm log-urile cu status 401
    @Query("SELECT COUNT(a) FROM ActivityLog a WHERE a.ipAddress = :ip " +
            "AND a.statusCode = 401 AND a.actionInfo = 'FAILED_LOGIN' " +
            "AND a.createdAt >= :since")
    long countRecentFailedLogins(@Param("ip") String ip, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(a) FROM ActivityLog a WHERE a.userId = :userId " +
            "AND a.statusCode = 401 AND a.createdAt >= :since")
    long countFailedLoginsByUser(@Param("userId") Long userId, @Param("since") LocalDateTime since);
}