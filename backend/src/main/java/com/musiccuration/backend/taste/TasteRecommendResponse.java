package com.musiccuration.backend.taste;

import com.musiccuration.backend.common.SongResponse;

import java.util.List;

public record TasteRecommendResponse(List<SongResponse> songs, String provider, boolean cached) {
}
