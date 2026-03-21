package com.eduai.backend;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EduaiBackendApplication {
    private static final Logger log = LoggerFactory.getLogger(EduaiBackendApplication.class);

    public static void main(String[] args) {
        log.info("========================================");
        log.info("Starting EduAI Backend Application");
        log.info("========================================");
        SpringApplication.run(EduaiBackendApplication.class, args);
        log.info("EduAI Backend Application started successfully");
    }
}
