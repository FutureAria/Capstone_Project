package com.musiccuration.backend.mix;

import com.musiccuration.backend.common.SongResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.util.List;

public record MixRequest(
        List<@Valid SongResponse> likedSongs,
        List<@Valid SongResponse> albumSongs,
        List<@Size(max = 20) String> recentEmotions,
        @Min(1) @Max(20) Integer limit
) {
    public int safeLimit() {
        return limit == null ? 10 : limit;
    }
}
