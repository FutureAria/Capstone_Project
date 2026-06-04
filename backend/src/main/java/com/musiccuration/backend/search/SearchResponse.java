package com.musiccuration.backend.search;

import com.musiccuration.backend.common.SongResponse;

import java.util.List;

public record SearchResponse(String query, List<SongResponse> songs, boolean cached) {
}
