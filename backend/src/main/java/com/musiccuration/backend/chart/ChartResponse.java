package com.musiccuration.backend.chart;

import com.musiccuration.backend.common.SongResponse;

import java.util.List;

public record ChartResponse(List<SongResponse> songs, String source, boolean cached) {
}
