package com.musiccuration.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "music.claude")
public record ClaudeProperties(String apiKey, String model, String baseUrl, String apiVersion, int maxTokens) {
    public String resolvedApiVersion() {
        return apiVersion == null || apiVersion.isBlank() ? "2023-06-01" : apiVersion;
    }

    public int resolvedMaxTokens() {
        return maxTokens <= 0 ? 2048 : maxTokens;
    }
}
