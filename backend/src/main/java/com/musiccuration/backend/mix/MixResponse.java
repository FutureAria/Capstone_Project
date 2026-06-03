package com.musiccuration.backend.mix;

import com.musiccuration.backend.common.SongResponse;

import java.util.List;

public record MixResponse(List<SongResponse> songs, String provider, boolean cached) {
}
