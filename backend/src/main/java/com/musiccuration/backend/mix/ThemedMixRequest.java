package com.musiccuration.backend.mix;

import com.musiccuration.backend.common.SongResponse;
import jakarta.validation.Valid;

import java.util.List;

public record ThemedMixRequest(
        List<@Valid SongResponse> likedSongs,
        List<@Valid AlbumSummary> albums,
        List<@Valid HistorySummary> historyList
) {
}
