package com.musiccuration.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "music")
public record MusicProperties(String frontendOrigin) {
}
