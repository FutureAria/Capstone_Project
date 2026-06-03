package com.musiccuration.backend.emotion;

public record EmotionResponse(String emotion, Double confidence, String provider, boolean cached) {
}
