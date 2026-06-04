package com.musiccuration.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "music.rate-limit")
public record RateLimitProperties(int windowSeconds, int maxRequests) {
}
