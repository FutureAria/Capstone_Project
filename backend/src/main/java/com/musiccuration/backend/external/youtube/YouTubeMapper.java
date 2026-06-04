package com.musiccuration.backend.external.youtube;

import com.fasterxml.jackson.databind.JsonNode;
import com.musiccuration.backend.common.SongResponse;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

@Component
public class YouTubeMapper {
    private static final Pattern BRACKETS = Pattern.compile("\\[.*?]|\\(.*?\\)");
    private static final Pattern OFFICIAL = Pattern.compile("official\\s*(mv|audio|video|music video)?|\\bM/V\\b|\\bMV\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern LABELS = Pattern.compile("HYBE LABELS|Stone Music Entertainment|1theK.*|SMTOWN|YG Entertainment|JYP Entertainment|Big Hit Labels|VEVO|Big Hit|LLOUD|Warner Music|Sony Music|Universal Music|Kakao|Melon|Genie", Pattern.CASE_INSENSITIVE);
    private static final Pattern NOISE = Pattern.compile(
            "live|라이브|방송|뉴스|reaction|cover|dance practice|직캠|fancam|shorts|karaoke|노래방|mr제거|instrumental|remix|sped up|slowed|1 hour|10 hours|loop|extended|teaser|trailer|behind|making film",
            Pattern.CASE_INSENSITIVE
    );

    public List<SongResponse> mapSearch(JsonNode response, int limit) {
        List<SongResponse> songs = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (JsonNode item : response.path("items")) {
            SongResponse song = mapItem(item, null);
            if (song.videoId() == null || isNoise(song) || !seen.add(normalize(song))) {
                continue;
            }
            songs.add(song);
            if (songs.size() >= limit) break;
        }
        return songs;
    }

    public List<SongResponse> mapChart(JsonNode response, int limit) {
        List<SongResponse> songs = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (JsonNode item : response.path("items")) {
            SongResponse song = mapItem(item, item.path("id").asText(null));
            if (song.videoId() == null || isNoise(song) || !seen.add(normalize(song))) {
                continue;
            }
            songs.add(song.withRank(songs.size() + 1));
            if (songs.size() >= limit) break;
        }
        return songs;
    }

    public Integer durationSeconds(JsonNode item) {
        String iso = item.path("contentDetails").path("duration").asText("");
        if (iso.isBlank()) return null;
        try {
            return (int) Duration.parse(iso).toSeconds();
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    private SongResponse mapItem(JsonNode item, String directVideoId) {
        JsonNode snippet = item.path("snippet");
        String rawTitle = cleanText(snippet.path("title").asText(""));
        String rawChannel = cleanText(snippet.path("channelTitle").asText(""));
        String title = OFFICIAL.matcher(BRACKETS.matcher(rawTitle).replaceAll("")).replaceAll("")
                .replaceAll("(?i)feat\\.?\\s+[^,]+", "")
                .replaceAll("^[-–|'\" ]+|[-–|'\" ]+$", "")
                .trim();
        if (title.isBlank()) title = rawTitle;

        String artist = LABELS.matcher(rawChannel).replaceAll("")
                .replaceAll("(?i)- Topic$", "")
                .replaceAll("(?i)Official.*$", "")
                .replaceAll("(?i)OFFICIAL$", "")
                .trim();
        if (artist.isBlank()) {
            String[] parts = rawTitle.split("\\s*[-–|]\\s*", 2);
            artist = parts.length > 1 ? parts[0].trim() : rawChannel;
        }

        String videoId = directVideoId != null ? directVideoId : item.path("id").path("videoId").asText(null);
        String cover = snippet.path("thumbnails").path("medium").path("url").asText("");
        String query = title + " " + artist + " official audio";
        return SongResponse.of(null, title, artist, query, videoId, cover);
    }

    private boolean isNoise(SongResponse song) {
        String haystack = (song.title() + " " + song.artist() + " " + song.youtubeQuery()).toLowerCase();
        return NOISE.matcher(haystack).find();
    }

    private String normalize(SongResponse song) {
        return (song.title() + ":" + song.artist()).toLowerCase().replaceAll("\\s+", "");
    }

    private String cleanText(String value) {
        return value
                .replace("&amp;", "&")
                .replace("&quot;", "\"")
                .replace("&#39;", "'")
                .replace("&lt;", "<")
                .replace("&gt;", ">");
    }
}
