package com.musiccuration.backend.mix;

import com.fasterxml.jackson.databind.JsonNode;
import com.musiccuration.backend.analytics.AnalyticsService;
import com.musiccuration.backend.common.SongResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MixController {
    private final MixService mixService;
    private final AnalyticsService analyticsService;

    public MixController(MixService mixService, AnalyticsService analyticsService) {
        this.mixService = mixService;
        this.analyticsService = analyticsService;
    }

    @PostMapping("/api/mix")
    public MixResponse mix(@Valid @RequestBody MixRequest request) {
        MixResponse response = mixService.mix(request);
        analyticsService.logRecommendationEvent("/api/mix", null, response.songs().size(), response.provider(), response.cached());
        return response;
    }

    @PostMapping("/api/similar-song")
    public SongResponse similarSong(@Valid @RequestBody SongResponse song) {
        return mixService.similar(song);
    }

    @PostMapping("/api/mixes")
    public ThemedMixResponse mixes(@Valid @RequestBody ThemedMixRequest request) {
        ThemedMixResponse response = mixService.themedMixes(request);
        int songCount = 0;
        for (JsonNode mix : response.mixes()) {
            songCount += mix.path("songs").size();
        }
        analyticsService.logRecommendationEvent("/api/mixes", null, songCount, response.provider(), response.cached());
        return response;
    }
}
