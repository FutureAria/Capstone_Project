package com.musiccuration.backend.external.claude;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.musiccuration.backend.common.ApiException;
import com.musiccuration.backend.common.ErrorCode;
import com.musiccuration.backend.config.ClaudeProperties;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;

@Component
public class ClaudeApiClient {
    private final RestClient restClient;
    private final ClaudeProperties properties;
    private final ObjectMapper objectMapper;

    public ClaudeApiClient(RestClient restClient, ClaudeProperties properties, ObjectMapper objectMapper) {
        this.restClient = restClient;
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    public String generateText(String prompt) {
        ensureApiKey();
        Map<String, Object> body = Map.of(
                "model", properties.model(),
                "max_tokens", properties.resolvedMaxTokens(),
                "messages", List.of(Map.of(
                        "role", "user",
                        "content", prompt
                ))
        );

        try {
            JsonNode response = restClient.post()
                    .uri(properties.baseUrl() + "/v1/messages")
                    .header("x-api-key", properties.apiKey())
                    .header("anthropic-version", properties.resolvedApiVersion())
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);
            if (response == null) {
                throw new ApiException(ErrorCode.CLAUDE_API_ERROR, "Claude API 응답이 비어 있습니다.");
            }
            JsonNode error = response.path("error");
            if (!error.isMissingNode()) {
                String message = error.path("message").asText("Claude API 오류가 발생했습니다.");
                String type = error.path("type").asText("");
                HttpStatus status = "rate_limit_error".equals(type) ? HttpStatus.TOO_MANY_REQUESTS : HttpStatus.BAD_GATEWAY;
                throw new ApiException(ErrorCode.CLAUDE_API_ERROR, message, status);
            }
            String text = response.path("content").path(0).path("text").asText("");
            if (text.isBlank()) {
                throw new ApiException(ErrorCode.CLAUDE_API_ERROR, "Claude API 텍스트 응답이 비어 있습니다.");
            }
            return text;
        } catch (ApiException ex) {
            throw ex;
        } catch (RestClientException ex) {
            throw new ApiException(ErrorCode.CLAUDE_API_ERROR, "Claude API 호출에 실패했습니다.");
        }
    }

    public JsonNode generateJson(String prompt) {
        String raw = generateText(prompt);
        String json = raw.replaceAll("(?i)```json", "").replace("```", "").trim();
        int objectStart = json.indexOf('{');
        int arrayStart = json.indexOf('[');
        int start;
        if (objectStart < 0) start = arrayStart;
        else if (arrayStart < 0) start = objectStart;
        else start = Math.min(objectStart, arrayStart);
        int end = Math.max(json.lastIndexOf('}'), json.lastIndexOf(']'));
        if (start >= 0 && end >= start) {
            json = json.substring(start, end + 1);
        }
        try {
            return objectMapper.readTree(json);
        } catch (Exception ex) {
            throw new ApiException(ErrorCode.AI_RESPONSE_PARSE_FAILED, "AI 응답 JSON 파싱에 실패했습니다.");
        }
    }

    private void ensureApiKey() {
        if (properties.apiKey() == null || properties.apiKey().isBlank()) {
            throw new ApiException(ErrorCode.MISSING_API_KEY, "백엔드 ANTHROPIC_API_KEY가 설정되어 있지 않습니다.");
        }
    }
}
