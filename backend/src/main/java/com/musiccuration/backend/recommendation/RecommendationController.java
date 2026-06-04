package com.musiccuration.backend.recommendation;

import com.musiccuration.backend.analytics.AnalyticsService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RecommendationController {
    private final RecommendationService recommendationService;
    private final AnalyticsService analyticsService;

    public RecommendationController(RecommendationService recommendationService, AnalyticsService analyticsService) {
        this.recommendationService = recommendationService;
        this.analyticsService = analyticsService;
    }

    @PostMapping("/api/recommend")
    public RecommendationResponse recommend(@Valid @RequestBody RecommendationRequest request) {
        RecommendationResponse response = recommendationService.recommend(request);
        String emotion = response.emotions().isEmpty() ? request.emotion() : response.emotions().get(0).name();
        analyticsService.logRecommendationEvent("/api/recommend", emotion, response.songs().size(), response.provider(), response.cached());
        return response;
    }
}
