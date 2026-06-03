package com.musiccuration.backend.common;

public record SongResponse(
        Integer rank,
        String title,
        String artist,
        String youtubeQuery,
        String videoId,
        String cover,
        String mood,
        Integer durationSeconds
) {
    public static SongResponse of(Integer rank, String title, String artist, String youtubeQuery, String videoId, String cover) {
        return new SongResponse(rank, title, artist, youtubeQuery, videoId, cover, null, null);
    }

    public SongResponse withRank(int rank) {
        return new SongResponse(rank, title, artist, youtubeQuery, videoId, cover, mood, durationSeconds);
    }
}
