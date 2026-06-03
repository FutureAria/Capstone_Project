package com.musiccuration.backend.search;

import com.musiccuration.backend.common.CacheService;
import com.musiccuration.backend.common.SongResponse;
import com.musiccuration.backend.external.youtube.YouTubeApiClient;
import com.musiccuration.backend.external.youtube.YouTubeMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SearchService {
    private final YouTubeApiClient youTubeApiClient;
    private final YouTubeMapper youTubeMapper;
    private final CacheService cacheService;

    public SearchService(YouTubeApiClient youTubeApiClient, YouTubeMapper youTubeMapper, CacheService cacheService) {
        this.youTubeApiClient = youTubeApiClient;
        this.youTubeMapper = youTubeMapper;
        this.cacheService = cacheService;
    }

    public SearchResponse search(String query, int maxResults) {
        String normalized = normalize(query);
        String key = "search:%s:%d".formatted(normalized, maxResults);
        CacheService.CachedValue<List<SongResponse>> cached = cacheService.search(key, () ->
                youTubeMapper.mapSearch(youTubeApiClient.search(query, Math.max(maxResults * 2, 20)), maxResults)
        );
        return new SearchResponse(query, cached.value(), cached.cached());
    }

    public VideoIdResponse videoId(String query) {
        String normalized = normalize(query);
        CacheService.CachedValue<String> cached = cacheService.videoId("video-id:" + normalized, () -> {
            List<SongResponse> songs = youTubeMapper.mapSearch(youTubeApiClient.search(query, 5), 1);
            return songs.isEmpty() ? "" : songs.get(0).videoId();
        });
        return new VideoIdResponse(query, cached.value(), cached.cached());
    }

    private String normalize(String query) {
        return query == null ? "" : query.toLowerCase().trim().replaceAll("\\s+", " ");
    }
}
