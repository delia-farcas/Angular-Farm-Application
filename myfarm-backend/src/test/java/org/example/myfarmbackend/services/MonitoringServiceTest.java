package org.example.myfarmbackend.services;

import org.example.myfarmbackend.models.ObservationEntry;
import org.example.myfarmbackend.repositories.ActivityLogRepository;
import org.example.myfarmbackend.repositories.ObservationListRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MonitoringServiceTest {

    @Mock
    private ActivityLogRepository activityLogRepository;

    @Mock
    private ObservationListRepository observationListRepository;

    @InjectMocks
    private MonitoringService monitoringService;

    @Test
    void logAction_ShouldSaveIpObservation_WhenSuspiciousLoginHasNoUser() {
        when(activityLogRepository.countRecentFailedLogins(eq("127.0.0.1"), any(LocalDateTime.class)))
                .thenReturn(3L);
        when(observationListRepository.existsByIpAddressAndViolationTypeAndIsResolvedFalse(
                        "127.0.0.1", "SUSPICIOUS_LOGIN_ATTEMPTS"))
                .thenReturn(false);

        monitoringService.logAction(null, "GUEST", "FAILED_LOGIN", 401, "127.0.0.1");

        ArgumentCaptor<ObservationEntry> captor = ArgumentCaptor.forClass(ObservationEntry.class);
        verify(observationListRepository).save(captor.capture());
        ObservationEntry entry = captor.getValue();
        assertNull(entry.getUserId());
        assertEquals("127.0.0.1", entry.getIpAddress());
        assertEquals("SUSPICIOUS_LOGIN_ATTEMPTS", entry.getViolationType());
        assertEquals("MEDIUM", entry.getRiskLevel());
        assertFalse(entry.getIsResolved());
    }

    @Test
    void logAction_ShouldNotSaveDuplicateIpObservation() {
        when(activityLogRepository.countRecentFailedLogins(eq("127.0.0.1"), any(LocalDateTime.class)))
                .thenReturn(3L);
        when(observationListRepository.existsByIpAddressAndViolationTypeAndIsResolvedFalse(
                        "127.0.0.1", "SUSPICIOUS_LOGIN_ATTEMPTS"))
                .thenReturn(true);

        monitoringService.logAction(null, "GUEST", "FAILED_LOGIN", 401, "127.0.0.1");

        verify(observationListRepository, never()).save(any(ObservationEntry.class));
    }
}
