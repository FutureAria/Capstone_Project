package com.musiccuration.backend.external.claude;

import com.musiccuration.backend.common.SongResponse;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ClaudePromptFactory {
    public String emotionPrompt(String text) {
        return """
                아래 텍스트의 감정을 분석해줘. JSON만 반환해줘. 마크다운 쓰지 마.
                {"emotion": "기쁨/슬픔/분노/불안/평온/설렘/피로/집중 중 하나만"}
                텍스트: "%s"
                """.formatted(text);
    }

    public String recommendPrompt(String text, String emotion, int limit) {
        return """
                아래 텍스트와 감정을 분석해서 어울리는 한국 노래를 추천해줘.
                JSON만 반환해줘. 마크다운 코드블록 쓰지 마. 다른 말 하지 마.
                {
                  "emotions": [
                    {"name": "감정이름", "percent": 숫자, "color": "#헥스컬러"}
                  ],
                  "songs": [
                    {
                      "title": "노래제목",
                      "artist": "아티스트명",
                      "mood": "분위기 2~3단어",
                      "youtubeQuery": "유튜브 검색어 (제목 + 아티스트)"
                    }
                  ]
                }
                emotions는 2~4개, songs는 %d개로 채워줘.
                대표 감정: "%s"
                텍스트: "%s"
                """.formatted(limit, emotion, text);
    }

    public String mixPrompt(List<SongResponse> likedSongs, List<SongResponse> albumSongs, List<String> recentEmotions, int limit) {
        return """
                사용자의 좋아요 곡, 앨범 곡, 최근 감정을 바탕으로 한국 노래 맞춤 믹스를 만들어줘.
                JSON 배열만 반환해줘. 마크다운 쓰지 마.
                [{"title":"노래제목","artist":"아티스트명","mood":"분위기 2~3단어","youtubeQuery":"제목 아티스트"}]
                songs는 %d개.
                좋아요 곡: %s
                앨범 곡: %s
                최근 감정: %s
                """.formatted(limit, summarizeSongs(likedSongs), summarizeSongs(albumSongs), recentEmotions);
    }

    public String themedMixesPrompt(List<SongResponse> likedSongs, List<String> albumNames, List<String> recentEmotions) {
        return """
                너는 음악 큐레이터야. 아래 사용자 데이터를 바탕으로 "테마가 다른 믹스 4개"를 만들어줘.
                JSON만 반환해. 마크다운 코드블록 쓰지 마. 다른 말 하지 마.

                [좋아요한 곡] %s
                [만든 앨범] %s
                [최근 감정] %s

                규칙:
                - 믹스 4개, 각 믹스는 서로 다른 테마(예: 출근길, 집중, 새벽 감성, 기분전환 등).
                - 각 믹스는 한국 노래 6곡으로 구성.
                - 좋아요/감정 데이터가 있으면 취향을 반영하고, 없으면 대중적인 인기곡으로 채워줘.
                - 좋아요한 곡을 그대로 넣지 말고 "비슷한 새로운 곡"을 추천해줘.

                반환 형식:
                {
                  "mixes": [
                    {
                      "title": "믹스 이름",
                      "description": "한 줄 설명",
                      "emoji": "이모지 1개",
                      "songs": [
                        {"title":"노래제목","artist":"아티스트명","mood":"분위기 2~3단어","youtubeQuery":"제목 아티스트"}
                      ]
                    }
                  ]
                }
                """.formatted(summarizeSongs(likedSongs), albumNames, recentEmotions);
    }

    public String tastePrompt(List<String> genres, List<String> artists, int limit) {
        return """
                사용자가 좋아하는 장르와 아티스트를 바탕으로 한국 노래를 추천해줘.
                JSON 배열만 반환해줘. 마크다운 쓰지 마.
                [{"title":"노래제목","artist":"아티스트명","genre":"장르","youtubeQuery":"유튜브검색어","mood":"분위기 한 단어"}]
                songs는 %d개.
                선호 장르: %s
                선호 아티스트: %s
                """.formatted(limit, genres, artists);
    }

    public String similarSongPrompt(SongResponse song) {
        return """
                방금 재생한 곡: %s - %s
                이 곡과 비슷한 분위기의 한국 노래 1곡만 추천해줘.
                JSON만 반환해. 마크다운 쓰지 마.
                {"title":"노래제목","artist":"아티스트명","youtubeQuery":"유튜브검색어"}
                """.formatted(song.title(), song.artist());
    }

    private String summarizeSongs(List<SongResponse> songs) {
        if (songs == null || songs.isEmpty()) return "[]";
        return songs.stream()
                .limit(20)
                .map(song -> "%s - %s".formatted(song.title(), song.artist()))
                .collect(Collectors.joining(", "));
    }
}
