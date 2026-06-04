package com.musiccuration.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "music.firebase-auth")
public record FirebaseAuthProperties(
        boolean enabled,
        String projectId,
        long certCacheSeconds
) {
    public FirebaseAuthProperties {
        if (certCacheSeconds <= 0) {
            certCacheSeconds = 3600;
        }
    }
}
