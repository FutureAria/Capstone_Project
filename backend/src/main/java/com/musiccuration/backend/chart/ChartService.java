package com.musiccuration.backend.chart;

import com.musiccuration.backend.common.CacheService;
import com.musiccuration.backend.common.SongResponse;
import com.musiccuration.backend.external.youtube.YouTubeApiClient;
import com.musiccuration.backend.external.youtube.YouTubeMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChartService {
    private final YouTubeApiClient youTubeApiClient;
    private final YouTubeMapper youTubeMapper;
    private final CacheService cacheService;

    public ChartService(YouTubeApiClient youTubeApiClient, YouTubeMapper youTubeMapper, CacheService cacheService) {
        this.youTubeApiClient = youTubeApiClient;
        this.youTubeMapper = youTubeMapper;
        this.cacheService = cacheService;
    }

    public ChartResponse chart(String regionCode, int maxResults) {
        String key = "chart:%s:%d".formatted(regionCode, maxResults);
        CacheService.CachedValue<List<SongResponse>> cached = cacheService.chart(key, () ->
                youTubeMapper.mapChart(youTubeApiClient.mostPopular(regionCode, Math.max(maxResults * 4, 20)), maxResults)
        );
        return new ChartResponse(cached.value(), "youtube", cached.cached());
    }
}
