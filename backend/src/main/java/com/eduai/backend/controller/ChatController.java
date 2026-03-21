package com.eduai.backend.controller;

import com.eduai.backend.model.ChatRequest;
import com.eduai.backend.model.ChatResponse;
import com.eduai.backend.service.RecommendationChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api")
public class ChatController {
    private static final Logger log = LoggerFactory.getLogger(ChatController.class);
    private final RecommendationChatService recommendationChatService;

    public ChatController(RecommendationChatService recommendationChatService) {
        this.recommendationChatService = recommendationChatService;
    }

    @PostMapping("/recommend-chat")
    public ChatResponse recommendChat(@RequestBody ChatRequest request) {
        log.info("Chat request received with scope: {}", request != null ? request.scope() : "null");
        
        if (request == null || request.message() == null || request.message().isBlank()) {
            log.warn("Invalid chat request - returning default response");
            return new ChatResponse("I'm here to help with your studies. What would you like to learn about?");
        }
        
        log.debug("Processing message: {}", request.message());
        String reply = recommendationChatService.generateReply(request);
        log.info("Chat response generated successfully");
        return new ChatResponse(reply);
    }
}
