package com.eduai.backend.controller;

import com.eduai.backend.model.LoginRequest;
import com.eduai.backend.model.LoginResponse;
import com.eduai.backend.model.RegisterRequest;
import com.eduai.backend.model.RegisterResponse;
import com.eduai.backend.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registration attempt for email: {}", request.email());
        boolean created = userService.register(request);
        if (!created) {
            log.warn("Registration failed - user already exists: {}", request.email());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new RegisterResponse(false, "User already exists"));
        }
        log.info("Registration successful for email: {}", request.email());
        return ResponseEntity.ok(new RegisterResponse(true, "Registration successful"));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login attempt for username: {}", request.username());
        boolean ok = userService.login(request);
        if (!ok) {
            log.warn("Login failed - invalid credentials for username: {}", request.username());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse(false, "Invalid credentials", request.username()));
        }
        log.info("Login successful for username: {}", request.username());
        return ResponseEntity.ok(new LoginResponse(true, "Login successful", request.username()));
    }
}
