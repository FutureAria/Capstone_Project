package com.musiccuration.backend.recommendation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.musiccuration.backend.common.CacheService;
import com.musiccuration.backend.config.GeminiProperties;
import com.musiccuration.backend.external.gemini.GeminiApiClient;
import com.musiccuration.backend.external.gemini.GeminiPromptFactory;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;

class RecommendationServiceTest {
    @Test
    void fillsFallbackSongsWhenAiReturnsEmptySongs() {
        RecommendationService service = new RecommendationService(
                new EmptyJsonGeminiClient(),
                new GeminiPromptFactory(),
                new CacheService()
        );

        RecommendationResponse response = service.recommend(new RecommendationRequest("기분이 좋아", "기쁨", 5));

        assertThat(response.songs()).hasSize(5);
        assertThat(response.songs().get(0).title()).isNotBlank();
        assertThat(response.emotions()).isNotEmpty();
    }

    private static class EmptyJsonGeminiClient extends GeminiApiClient {
        EmptyJsonGeminiClient() {
            super(RestClient.create(), new GeminiProperties("", "gemini-test", "http://localhost"), new ObjectMapper());
        }

        @Override
        public JsonNode generateJson(String prompt) {
            ObjectNode root = new ObjectMapper().createObjectNode();
            root.putArray("emotions")
                    .addObject()
                    .put("name", "기쁨")
                    .put("percent", 100)
                    .put("color", "#FFD700");
            root.putArray("songs");
            return root;
        }
    }
}
