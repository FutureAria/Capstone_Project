package com.musiccuration.backend.analytics;

import java.util.List;
import java.util.Map;

public record AnalyticsSummary(
        int totalRequests,
        int totalRecommendationEvents,
        List<Map<String, Object>> topEndpoints,
        List<Map<String, Object>> statusCounts,
        List<Map<String, Object>> emotionCounts
) {
}
