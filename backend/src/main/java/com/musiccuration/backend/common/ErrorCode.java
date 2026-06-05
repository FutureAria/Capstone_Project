package com.musiccuration.backend.common;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    INVALID_REQUEST(HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED),
    MISSING_API_KEY(HttpStatus.INTERNAL_SERVER_ERROR),
    YOUTUBE_API_ERROR(HttpStatus.BAD_GATEWAY),
    YOUTUBE_QUOTA_EXCEEDED(HttpStatus.TOO_MANY_REQUESTS),
    CLAUDE_API_ERROR(HttpStatus.BAD_GATEWAY),
    AI_RESPONSE_PARSE_FAILED(HttpStatus.BAD_GATEWAY),
    RATE_LIMIT_EXCEEDED(HttpStatus.TOO_MANY_REQUESTS),
    UPSTREAM_TIMEOUT(HttpStatus.GATEWAY_TIMEOUT),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR);

    private final HttpStatus defaultStatus;

    ErrorCode(HttpStatus defaultStatus) {
        this.defaultStatus = defaultStatus;
    }

    public HttpStatus defaultStatus() {
        return defaultStatus;
    }
}
