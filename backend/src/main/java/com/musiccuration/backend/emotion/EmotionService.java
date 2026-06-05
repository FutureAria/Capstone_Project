package com.musiccuration.backend.emotion;

import com.fasterxml.jackson.databind.JsonNode;
import com.musiccuration.backend.common.CacheService;
import com.musiccuration.backend.external.claude.ClaudeApiClient;
import com.musiccuration.backend.external.claude.ClaudePromptFactory;
import org.springframework.stereotype.Service;

@Service
public class EmotionService {
    private final ClaudeApiClient claudeApiClient;
    private final ClaudePromptFactory promptFactory;
    private final CacheService cacheService;

    public EmotionService(ClaudeApiClient claudeApiClient, ClaudePromptFactory promptFactory, CacheService cacheService) {
        this.claudeApiClient = claudeApiClient;
        this.promptFactory = promptFactory;
        this.cacheService = cacheService;
    }

    public EmotionResponse analyze(String text) {
        String key = "emotion:" + text.toLowerCase().trim();
        CacheService.CachedValue<String> cached = cacheService.ai(key, () -> {
            JsonNode json = claudeApiClient.generateJson(promptFactory.emotionPrompt(text));
            return EmotionType.normalize(json.path("emotion").asText(""));
        });
        return new EmotionResponse(cached.value(), null, "claude", cached.cached());
    }
}
