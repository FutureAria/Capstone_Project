package com.musiccuration.backend.recommendation;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RecommendationRequest(
        @NotBlank @Size(max = 500) String text,
        @Size(max = 20) String emotion,
        @Min(1) @Max(20) Integer limit
) {
    public int safeLimit() {
        return limit == null ? 8 : limit;
    }
}
