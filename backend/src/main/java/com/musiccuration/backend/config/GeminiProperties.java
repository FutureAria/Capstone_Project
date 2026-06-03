package com.musiccuration.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "music.gemini")
public record GeminiProperties(String apiKey, String model, String baseUrl) {
}
