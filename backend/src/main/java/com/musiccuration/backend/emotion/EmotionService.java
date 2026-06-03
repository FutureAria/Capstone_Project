package com.musiccuration.backend.emotion;

import com.fasterxml.jackson.databind.JsonNode;
import com.musiccuration.backend.common.CacheService;
import com.musiccuration.backend.external.gemini.GeminiApiClient;
import com.musiccuration.backend.external.gemini.GeminiPromptFactory;
import org.springframework.stereotype.Service;

@Service
public class EmotionService {
    private final GeminiApiClient geminiApiClient;
    private final GeminiPromptFactory promptFactory;
    private final CacheService cacheService;

    public EmotionService(GeminiApiClient geminiApiClient, GeminiPromptFactory promptFactory, CacheService cacheService) {
        this.geminiApiClient = geminiApiClient;
        this.promptFactory = promptFactory;
        this.cacheService = cacheService;
    }

    public EmotionResponse analyze(String text) {
        String key = "emotion:" + text.toLowerCase().trim();
        CacheService.CachedValue<String> cached = cacheService.ai(key, () -> {
            JsonNode json = geminiApiClient.generateJson(promptFactory.emotionPrompt(text));
            return EmotionType.normalize(json.path("emotion").asText(""));
        });
        return new EmotionResponse(cached.value(), null, "gemini", cached.cached());
    }
}
