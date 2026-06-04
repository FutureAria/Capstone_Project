package com.musiccuration.backend.common;

public record ErrorResponse(ErrorBody error) {
    public static ErrorResponse of(ErrorCode code, String message, int status) {
        return new ErrorResponse(new ErrorBody(code.name(), message, status));
    }

    public record ErrorBody(String code, String message, int status) {
    }
}
