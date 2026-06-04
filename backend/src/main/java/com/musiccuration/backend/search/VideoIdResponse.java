package com.musiccuration.backend.search;

public record VideoIdResponse(String query, String videoId, boolean cached) {
}
