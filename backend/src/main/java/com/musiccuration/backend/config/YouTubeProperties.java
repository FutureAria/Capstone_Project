package com.musiccuration.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "music.youtube")
public record YouTubeProperties(String apiKey, String baseUrl) {
}
