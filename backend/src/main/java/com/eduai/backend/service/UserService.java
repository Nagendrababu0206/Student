package com.eduai.backend.service;

import com.eduai.backend.model.LoginRequest;
import com.eduai.backend.model.RegisterRequest;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserService {
    private final Map<String, UserRecord> usersByEmail = new ConcurrentHashMap<>();

    public UserService() {
        usersByEmail.put("student@eduai.com", new UserRecord("Student", "9999999999", "student@eduai.com", "Password1"));
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
        return true;
    }

    public boolean login(LoginRequest request) {
        String key = request.username().trim().toLowerCase();
        UserRecord user = usersByEmail.get(key);
        return user != null && user.password().equals(request.password());
    }

    private record UserRecord(String name, String phone, String email, String password) {}
}
