package com.musiccuration.backend;

import com.musiccuration.backend.config.GeminiProperties;
import com.musiccuration.backend.config.FirebaseAuthProperties;
import com.musiccuration.backend.config.MusicProperties;
import com.musiccuration.backend.config.RateLimitProperties;
import com.musiccuration.backend.config.YouTubeProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({
        MusicProperties.class,
        FirebaseAuthProperties.class,
        YouTubeProperties.class,
        GeminiProperties.class,
        RateLimitProperties.class
})
public class MusicCurationBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(MusicCurationBackendApplication.class, args);
    }
}
