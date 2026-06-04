package com.musiccuration.backend.recommendation;

import com.fasterxml.jackson.databind.JsonNode;
import com.musiccuration.backend.common.CacheService;
import com.musiccuration.backend.common.SongResponse;
import com.musiccuration.backend.emotion.EmotionType;
import com.musiccuration.backend.external.gemini.GeminiApiClient;
import com.musiccuration.backend.external.gemini.GeminiPromptFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RecommendationService {
    private final GeminiApiClient geminiApiClient;
    private final GeminiPromptFactory promptFactory;
    private final CacheService cacheService;

    public RecommendationService(GeminiApiClient geminiApiClient, GeminiPromptFactory promptFactory, CacheService cacheService) {
        this.geminiApiClient = geminiApiClient;
        this.promptFactory = promptFactory;
        this.cacheService = cacheService;
    }

    public RecommendationResponse recommend(RecommendationRequest request) {
        String emotion = EmotionType.normalize(request.emotion());
        int limit = request.safeLimit();
        String key = "recommend:%s:%s:%d".formatted(request.text().toLowerCase().trim(), emotion, limit);
        CacheService.CachedValue<RecommendationPayload> cached = cacheService.ai(key, () -> {
            JsonNode json = geminiApiClient.generateJson(promptFactory.recommendPrompt(request.text(), emotion, limit));
            return new RecommendationPayload(mapEmotions(json.path("emotions")), mapSongs(json.path("songs"), limit));
        });
        return new RecommendationResponse(cached.value().emotions(), cached.value().songs(), "gemini", cached.cached());
    }

    private List<EmotionBreakdown> mapEmotions(JsonNode node) {
        List<EmotionBreakdown> emotions = new ArrayList<>();
        for (JsonNode item : node) {
            emotions.add(new EmotionBreakdown(
                    item.path("name").asText("기쁨"),
                    item.path("percent").asInt(0),
                    item.path("color").asText("#FFD700")
            ));
        }
        if (emotions.isEmpty()) {
            emotions.add(new EmotionBreakdown("기쁨", 100, "#FFD700"));
        }
        return emotions;
    }

    private List<SongResponse> mapSongs(JsonNode node, int limit) {
        List<SongResponse> songs = new ArrayList<>();
        for (JsonNode item : node) {
            songs.add(new SongResponse(
                    null,
                    item.path("title").asText(""),
                    item.path("artist").asText(""),
                    item.path("youtubeQuery").asText(item.path("title").asText("") + " " + item.path("artist").asText("")),
                    item.path("videoId").asText(""),
                    item.path("cover").asText(""),
                    item.path("mood").asText(""),
                    null
            ));
            if (songs.size() >= limit) break;
        }
        fillFallbackSongs(songs, limit);
        return songs;
    }

    private void fillFallbackSongs(List<SongResponse> songs, int limit) {
        List<SongResponse> fallback = List.of(
                fallback("밤편지", "IU", "잔잔한 위로"),
                fallback("Hype Boy", "NewJeans", "산뜻한 설렘"),
                fallback("Love Wins All", "IU", "따뜻한 감성"),
                fallback("Supernova", "aespa", "강렬한 에너지"),
                fallback("Dynamite", "BTS", "밝은 기분전환"),
                fallback("Event Horizon", "윤하", "벅찬 회복"),
                fallback("To. X", "태연", "도시적 감성"),
                fallback("Ditto", "NewJeans", "몽글한 추억")
        );
        for (SongResponse song : fallback) {
            if (songs.size() >= limit) return;
            boolean exists = songs.stream().anyMatch(s -> s.title().equalsIgnoreCase(song.title()) && s.artist().equalsIgnoreCase(song.artist()));
            if (!exists) songs.add(song);
        }
    }

    private SongResponse fallback(String title, String artist, String mood) {
        return new SongResponse(null, title, artist, title + " " + artist, "", "", mood, null);
    }

    private record RecommendationPayload(List<EmotionBreakdown> emotions, List<SongResponse> songs) {
    }
}
