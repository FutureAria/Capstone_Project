package com.musiccuration.backend.external.youtube;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.musiccuration.backend.common.SongResponse;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class YouTubeMapperTest {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final YouTubeMapper mapper = new YouTubeMapper();

    @Test
    void mapsSearchAndFiltersNoise() throws Exception {
        JsonNode response = objectMapper.readTree("""
                {
                  "items": [
                    {
                      "id": {"videoId": "live1"},
                      "snippet": {
                        "title": "IU 밤편지 LIVE",
                        "channelTitle": "IU Official",
                        "thumbnails": {"medium": {"url": "live.jpg"}}
                      }
                    },
                    {
                      "id": {"videoId": "ok1"},
                      "snippet": {
                        "title": "[Official Audio] IU - 밤편지",
                        "channelTitle": "IU - Topic",
                        "thumbnails": {"medium": {"url": "ok.jpg"}}
                      }
                    }
                  ]
                }
                """);

        List<SongResponse> songs = mapper.mapSearch(response, 10);

        assertThat(songs).hasSize(1);
        assertThat(songs.get(0).videoId()).isEqualTo("ok1");
        assertThat(songs.get(0).artist()).isEqualTo("IU");
        assertThat(songs.get(0).cover()).isEqualTo("ok.jpg");
    }
}
