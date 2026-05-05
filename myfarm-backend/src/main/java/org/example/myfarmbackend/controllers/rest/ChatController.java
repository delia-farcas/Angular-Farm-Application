package org.example.myfarmbackend.controllers.rest;

import org.example.myfarmbackend.dto.UserDTO;
import org.example.myfarmbackend.models.ChatMessage;
import org.example.myfarmbackend.repositories.ChatMessageRepository;
import org.example.myfarmbackend.repositories.UserRepository;
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

    public ChatController(
            SimpMessagingTemplate messagingTemplate,
            ChatMessageRepository chatMessageRepository,
            UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        chatMessage.setTimestamp(LocalDateTime.now());
        chatMessageRepository.save(chatMessage);

        messagingTemplate.convertAndSend("/topic/chat/" + chatMessage.getReceiverId(), chatMessage);
        messagingTemplate.convertAndSend("/topic/chat/" + chatMessage.getSenderId(), chatMessage);
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChatMessage>> getChatHistory(
            @RequestParam Long user1,
            @RequestParam Long user2) {

        List<ChatMessage> history = chatMessageRepository
                .findAllBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByTimestampAsc(
                        user1, user2, user2, user1
                );

        return ResponseEntity.ok(history);
    }

    @GetMapping("/contacts")
    public ResponseEntity<List<UserDTO>> getContacts(@RequestParam(defaultValue = "0") Long requesterId) {
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

        return ResponseEntity.ok(contacts);
    }
}
