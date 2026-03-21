package com.eduai.backend.service;

import com.eduai.backend.entity.UserEntity;
import com.eduai.backend.model.LoginRequest;
import com.eduai.backend.model.RegisterRequest;
import com.eduai.backend.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Locale;

@Service
public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    @Transactional
    public void ensureDefaultUser() {
        String defaultEmail = "student@eduai.com";
        log.info("Checking for default user: {}", defaultEmail);
        if (userRepository.existsByEmail(defaultEmail)) {
            log.info("Default user already exists");
            return;
        }

        UserEntity user = new UserEntity();
        user.setName("Student");
        user.setPhone("9999999999");
        user.setEmail(defaultEmail);
        user.setPasswordHash(passwordEncoder.encode("Password1"));
        userRepository.save(user);
        log.info("Default user created successfully");
    }

    @Transactional
    public boolean register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        log.debug("Attempting to register user: {}", email);
        if (userRepository.existsByEmail(email)) {
            log.warn("Registration failed - user already exists: {}", email);
            return false;
        }

        UserEntity user = new UserEntity();
        user.setName(request.name().trim());
        user.setPhone(request.phone().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        userRepository.save(user);
        log.info("User registered successfully: {}", email);
        return true;
    }

    @Transactional(readOnly = true)
    public boolean login(LoginRequest request) {
        String email = request.username().trim().toLowerCase(Locale.ROOT);
        log.debug("Attempting login for user: {}", email);
        boolean authenticated = userRepository.findByEmail(email)
                .map(user -> passwordEncoder.matches(request.password(), user.getPasswordHash()))
                .orElse(false);
        if (authenticated) {
            log.info("User authenticated successfully: {}", email);
        } else {
            log.warn("User authentication failed for: {}", email);
        }
        return authenticated;
    }
}
