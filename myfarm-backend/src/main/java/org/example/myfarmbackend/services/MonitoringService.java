package org.example.myfarmbackend.services;

import org.example.myfarmbackend.models.ActivityLog;
import org.example.myfarmbackend.models.ObservationEntry;
import org.example.myfarmbackend.repositories.ActivityLogRepository;
import org.example.myfarmbackend.repositories.ObservationListRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;

@Service
public class MonitoringService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private ObservationListRepository observationListRepository;

    @Async
    public CompletableFuture<Void> logAction(Long userId, String groupId, String action, int statusCode, String ip) {
        ActivityLog log = new ActivityLog();
        log.setUserId(userId);
        log.setGroupId(groupId);
        log.setActionInfo(action);
        log.setStatusCode(statusCode);
        log.setIpAddress(ip);
        activityLogRepository.save(log);

        if (statusCode == 401) {
            checkBruteForce(userId, ip);
        }

        if (statusCode == 403 && userId != null) {
            flagUser(userId, ip, "UNAUTHORIZED_ACCESS_ATTEMPT", "HIGH");
        }

        return CompletableFuture.completedFuture(null);
    }

    private void checkBruteForce(Long userId, String ip) {
        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
        long failedAttempts = activityLogRepository.countRecentFailedLogins(ip, fiveMinutesAgo);

        if (failedAttempts >= 3) {
            flagUser(userId, ip, "SUSPICIOUS_LOGIN_ATTEMPTS", "MEDIUM");
        }
    }

    private void flagUser(Long userId, String ip, String type, String risk) {
        if (hasActiveObservation(userId, ip, type)) {
            return;
        }

        ObservationEntry entry = new ObservationEntry();
        entry.setUserId(userId);
        entry.setIpAddress(ip);
        entry.setViolationType(type);
        entry.setRiskLevel(risk);
        entry.setIsResolved(false);
        observationListRepository.save(entry);
    }

    private boolean hasActiveObservation(Long userId, String ip, String type) {
        if (userId != null) {
            return observationListRepository.existsByUserIdAndViolationTypeAndIsResolvedFalse(userId, type);
        }

        if (ip != null && !ip.isBlank()) {
            return observationListRepository.existsByIpAddressAndViolationTypeAndIsResolvedFalse(ip, type);
        }

        return true;
    }
}
