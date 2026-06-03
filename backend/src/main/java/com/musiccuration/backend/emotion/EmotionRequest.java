package com.musiccuration.backend.emotion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EmotionRequest(@NotBlank @Size(max = 500) String text) {
}
