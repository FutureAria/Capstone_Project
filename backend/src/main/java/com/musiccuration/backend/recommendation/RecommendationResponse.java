package com.musiccuration.backend.recommendation;

import com.musiccuration.backend.common.SongResponse;

import java.util.List;

public record RecommendationResponse(
        List<EmotionBreakdown> emotions,
        List<SongResponse> songs,
        String provider,
        boolean cached
) {
}
