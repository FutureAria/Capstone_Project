package com.musiccuration.backend.external.youtube;

import com.fasterxml.jackson.databind.JsonNode;
import com.musiccuration.backend.common.ApiException;
import com.musiccuration.backend.common.ErrorCode;
import com.musiccuration.backend.config.YouTubeProperties;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class YouTubeApiClient {
    private final RestClient restClient;
    private final YouTubeProperties properties;

    public YouTubeApiClient(RestClient restClient, YouTubeProperties properties) {
        this.restClient = restClient;
        this.properties = properties;
    }

    public JsonNode mostPopular(String regionCode, int maxResults) {
        ensureApiKey();
        String url = properties.baseUrl()
                + "/videos?part=snippet,statistics&chart=mostPopular&videoCategoryId=10"
                + "&regionCode=" + encode(regionCode)
                + "&maxResults=" + maxResults
                + "&key=" + encode(properties.apiKey());
        return get(url);
    }

    public JsonNode search(String query, int maxResults) {
        ensureApiKey();
        String url = properties.baseUrl()
                + "/search?part=snippet&type=video&videoCategoryId=10"
                + "&q=" + encode(query)
                + "&maxResults=" + maxResults
                + "&key=" + encode(properties.apiKey());
        return get(url);
    }

    public JsonNode videoDetails(String ids) {
        ensureApiKey();
        String url = properties.baseUrl()
                + "/videos?part=contentDetails&id=" + encode(ids)
                + "&key=" + encode(properties.apiKey());
        return get(url);
    }

    private JsonNode get(String url) {
        try {
            JsonNode response = restClient.get().uri(url).retrieve().body(JsonNode.class);
            if (response == null) {
                throw new ApiException(ErrorCode.YOUTUBE_API_ERROR, "YouTube API 응답이 비어 있습니다.");
            }
            JsonNode error = response.path("error");
            if (!error.isMissingNode()) {
                String message = error.path("message").asText("YouTube API 오류가 발생했습니다.");
                if (message.toLowerCase().contains("quota")) {
                    throw new ApiException(ErrorCode.YOUTUBE_QUOTA_EXCEEDED, "YouTube API 요청 한도를 초과했습니다.", HttpStatus.TOO_MANY_REQUESTS);
                }
                throw new ApiException(ErrorCode.YOUTUBE_API_ERROR, message);
            }
            return response;
        } catch (ApiException ex) {
            throw ex;
        } catch (RestClientException ex) {
            throw new ApiException(ErrorCode.YOUTUBE_API_ERROR, "YouTube API 호출에 실패했습니다.");
        }
    }

    private void ensureApiKey() {
        if (properties.apiKey() == null || properties.apiKey().isBlank()) {
            throw new ApiException(ErrorCode.MISSING_API_KEY, "백엔드 YOUTUBE_API_KEY가 설정되어 있지 않습니다.");
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }
}
