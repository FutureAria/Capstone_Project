package com.musiccuration.backend.taste;

import com.fasterxml.jackson.databind.JsonNode;
import com.musiccuration.backend.common.CacheService;
import com.musiccuration.backend.common.SongResponse;
import com.musiccuration.backend.external.claude.ClaudeApiClient;
import com.musiccuration.backend.external.claude.ClaudePromptFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TasteRecommendService {
    private final ClaudeApiClient claudeApiClient;
    private final ClaudePromptFactory promptFactory;
    private final CacheService cacheService;

    public TasteRecommendService(ClaudeApiClient claudeApiClient, ClaudePromptFactory promptFactory, CacheService cacheService) {
        this.claudeApiClient = claudeApiClient;
        this.promptFactory = promptFactory;
        this.cacheService = cacheService;
    }

    public TasteRecommendResponse recommend(TasteRecommendRequest request) {
        int limit = request.safeLimit();
        String key = "taste:%s:%s:%d".formatted(request.genres(), request.artists(), limit);
        CacheService.CachedValue<List<SongResponse>> cached = cacheService.ai(key, () -> {
            JsonNode json = claudeApiClient.generateJson(promptFactory.tastePrompt(request.genres(), request.artists(), limit));
            return mapSongs(json, limit);
        });
        return new TasteRecommendResponse(cached.value(), "claude", cached.cached());
    }

    private List<SongResponse> mapSongs(JsonNode node, int limit) {
        List<SongResponse> songs = new ArrayList<>();
        JsonNode array = node.isArray() ? node : node.path("songs");
        for (JsonNode item : array) {
            songs.add(new SongResponse(
                    null,
                    item.path("title").asText(""),
                    item.path("artist").asText(""),
                    item.path("youtubeQuery").asText(item.path("title").asText("") + " " + item.path("artist").asText("")),
                    item.path("videoId").asText(""),
                    item.path("cover").asText(""),
                    item.path("mood").asText(item.path("genre").asText("")),
                    null
            ));
            if (songs.size() >= limit) break;
        }
        fillFallbackSongs(songs, limit);
        return songs;
    }

    private void fillFallbackSongs(List<SongResponse> songs, int limit) {
        List<SongResponse> fallback = List.of(
                fallback("밤편지", "IU", "발라드"),
                fallback("Hype Boy", "NewJeans", "K-POP"),
                fallback("Love Wins All", "IU", "발라드"),
                fallback("Supernova", "aespa", "K-POP"),
                fallback("Ditto", "NewJeans", "K-POP"),
                fallback("Event Horizon", "윤하", "록발라드"),
                fallback("To. X", "태연", "R&B"),
                fallback("Dynamite", "BTS", "댄스")
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
}
