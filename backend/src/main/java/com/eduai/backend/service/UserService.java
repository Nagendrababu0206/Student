package com.eduai.backend.service;

import com.eduai.backend.model.LoginRequest;
import com.eduai.backend.model.RegisterRequest;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserService {
    private final Map<String, UserRecord> usersByEmail = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Path usersFile;

    public UserService() {
        String filePath = System.getenv().getOrDefault("USERS_FILE", "/tmp/eduai-users.json");
        this.usersFile = Paths.get(filePath);

        loadUsers();

        usersByEmail.putIfAbsent(
                "student@eduai.com",
                new UserRecord("Student", "9999999999", "student@eduai.com", "Password1")
        );
        saveUsers();
    }

    public boolean register(RegisterRequest request) {
        String key = request.email().trim().toLowerCase();
        if (usersByEmail.containsKey(key)) {
            return false;
        }

        usersByEmail.put(key, new UserRecord(
                request.name().trim(),
                request.phone().trim(),
                key,
                request.password()
        ));
        saveUsers();
        return true;
    }

    public boolean login(LoginRequest request) {
        String key = request.username().trim().toLowerCase();
        UserRecord user = usersByEmail.get(key);
        return user != null && user.password().equals(request.password());
    }

    private synchronized void loadUsers() {
        if (!Files.exists(usersFile)) {
            return;
        }
        try {
            Map<String, UserRecord> loaded = objectMapper.readValue(
                    usersFile.toFile(),
                    new TypeReference<Map<String, UserRecord>>() {}
            );
            if (loaded != null) {
                usersByEmail.putAll(loaded);
            }
        } catch (IOException ignored) {
            // Fallback to in-memory defaults if file cannot be read.
        }
    }

    private synchronized void saveUsers() {
        try {
            Path parent = usersFile.getParent();
            if (parent != null) {
                Files.createDirectories(parent);
            }
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(usersFile.toFile(), usersByEmail);
        } catch (IOException ignored) {
            // Keep service running even if persistence write fails.
        }
    }

    private record UserRecord(String name, String phone, String email, String password) {}
}
