package org.example.myfarmbackend.controllers.rest;

import jakarta.servlet.http.HttpServletRequest;
import org.example.myfarmbackend.dto.UserDTO;
import org.example.myfarmbackend.models.ChatMessage;
import org.example.myfarmbackend.repositories.ChatMessageRepository;
import org.example.myfarmbackend.repositories.UserRepository;
import org.example.myfarmbackend.services.MonitoringService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final MonitoringService monitoringService;

    public ChatController(
            SimpMessagingTemplate messagingTemplate,
            ChatMessageRepository chatMessageRepository,
            UserRepository userRepository,
            MonitoringService monitoringService) {
        this.messagingTemplate = messagingTemplate;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.monitoringService = monitoringService;
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        chatMessage.setTimestamp(LocalDateTime.now());
        chatMessageRepository.save(chatMessage);

        // Notă: În context de WebSocket, IP-ul este mai greu de obținut direct, punem "WS_SESSION"
        monitoringService.logAction(
                chatMessage.getSenderId(),
                "USER",
                "SEND_MESSAGE_TO_USER: " + chatMessage.getReceiverId(),
                200,
                "WebSocket"
        );

        messagingTemplate.convertAndSend("/topic/chat/" + chatMessage.getReceiverId(), chatMessage);
        messagingTemplate.convertAndSend("/topic/chat/" + chatMessage.getSenderId(), chatMessage);
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChatMessage>> getChatHistory(
            @RequestParam Long user1,
            @RequestParam Long user2,
            HttpServletRequest request) {

        List<ChatMessage> history = chatMessageRepository
                .findAllBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByTimestampAsc(
                        user1, user2, user2, user1
                );

        monitoringService.logAction(user1, "USER", "VIEW_CHAT_HISTORY_WITH: " + user2, 200, request.getRemoteAddr());

        return ResponseEntity.ok(history);
    }

    @GetMapping("/contacts")
    public ResponseEntity<List<UserDTO>> getContacts(@RequestParam(defaultValue = "0") Long requesterId, HttpServletRequest request) {
        List<UserDTO> contacts = userRepository.findAll().stream()
                .filter(user -> requesterId <= 0 || !user.getUserId().equals(requesterId))
                .map(user -> {
                    UserDTO dto = new UserDTO();
                    dto.setUserId(user.getUserId());
                    dto.setUsername(user.getUsername());
                    dto.setEmail(user.getEmail());
                    return dto;
                })
                .collect(Collectors.toList());

        if (requesterId > 0) {
            monitoringService.logAction(requesterId, "USER", "FETCH_CHAT_CONTACTS", 200, request.getRemoteAddr());
        }

        return ResponseEntity.ok(contacts);
    }
}