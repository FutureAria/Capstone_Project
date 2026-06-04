package com.musiccuration.backend.taste;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.util.List;

public record TasteRecommendRequest(
        List<@Size(max = 30) String> genres,
        List<@Size(max = 60) String> artists,
        @Min(1) @Max(20) Integer limit
) {
    public int safeLimit() {
        return limit == null ? 10 : limit;
    }
}
