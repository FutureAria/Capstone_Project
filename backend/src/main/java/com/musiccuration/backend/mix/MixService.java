package com.musiccuration.backend.mix;

import com.fasterxml.jackson.databind.JsonNode;
import com.musiccuration.backend.common.CacheService;
import com.musiccuration.backend.common.SongResponse;
import com.musiccuration.backend.external.claude.ClaudeApiClient;
import com.musiccuration.backend.external.claude.ClaudePromptFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class MixService {
    private final ClaudeApiClient claudeApiClient;
    private final ClaudePromptFactory promptFactory;
    private final CacheService cacheService;

    public MixService(ClaudeApiClient claudeApiClient, ClaudePromptFactory promptFactory, CacheService cacheService) {
        this.claudeApiClient = claudeApiClient;
        this.promptFactory = promptFactory;
        this.cacheService = cacheService;
    }

    public MixResponse mix(MixRequest request) {
        int limit = request.safeLimit();
        String key = "mix:%s:%s:%s:%d".formatted(request.likedSongs(), request.albumSongs(), request.recentEmotions(), limit);
        CacheService.CachedValue<List<SongResponse>> cached = cacheService.ai(key, () -> {
            JsonNode json = claudeApiClient.generateJson(promptFactory.mixPrompt(request.likedSongs(), request.albumSongs(), request.recentEmotions(), limit));
            return mapSongs(json, limit);
        });
        return new MixResponse(cached.value(), "claude", cached.cached());
    }

    public SongResponse similar(SongResponse song) {
        String key = "similar:%s:%s".formatted(song.title(), song.artist()).toLowerCase();
        return cacheService.ai(key, () -> {
            JsonNode json = claudeApiClient.generateJson(promptFactory.similarSongPrompt(song));
            return new SongResponse(
                    null,
                    json.path("title").asText(""),
                    json.path("artist").asText(""),
                    json.path("youtubeQuery").asText(json.path("title").asText("") + " " + json.path("artist").asText("")),
                    "",
                    "",
                    json.path("mood").asText(""),
                    null
            );
        }).value();
    }

    public ThemedMixResponse themedMixes(ThemedMixRequest request) {
        List<SongResponse> likedSongs = request.likedSongs() == null ? List.of() : request.likedSongs();
        List<String> albumNames = request.albums() == null ? List.of() : request.albums().stream()
                .map(AlbumSummary::name)
                .filter(Objects::nonNull)
                .filter(name -> !name.isBlank())
                .toList();
        List<String> recentEmotions = request.historyList() == null ? List.of() : request.historyList().stream()
                .map(HistorySummary::emotion)
                .filter(Objects::nonNull)
                .filter(emotion -> !emotion.isBlank())
                .limit(20)
                .toList();

        String key = "mixes:%s:%s:%s".formatted(likedSongs, albumNames, recentEmotions);
        CacheService.CachedValue<JsonNode> cached = cacheService.ai(key, () -> {
            JsonNode json = claudeApiClient.generateJson(promptFactory.themedMixesPrompt(likedSongs, albumNames, recentEmotions));
            return json.path("mixes");
        });
        return new ThemedMixResponse(cached.value(), "claude", cached.cached());
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
                fallback("밤편지", "IU", "새벽 감성"),
                fallback("Ditto", "NewJeans", "몽글한 추억"),
                fallback("Event Horizon", "윤하", "벅찬 회복"),
                fallback("Love Wins All", "IU", "따뜻한 위로"),
                fallback("Supernova", "aespa", "강한 에너지"),
                fallback("Hype Boy", "NewJeans", "기분전환"),
                fallback("To. X", "태연", "차분한 몰입"),
                fallback("Dynamite", "BTS", "밝은 활력")
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
