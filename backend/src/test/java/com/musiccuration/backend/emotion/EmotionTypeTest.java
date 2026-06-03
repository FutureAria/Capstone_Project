package com.musiccuration.backend.emotion;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class EmotionTypeTest {
    @Test
    void normalizesKnownEmotion() {
        assertThat(EmotionType.normalize("슬픔")).isEqualTo("슬픔");
    }

    @Test
    void fallsBackForUnknownEmotion() {
        assertThat(EmotionType.normalize("낯선감정")).isEqualTo("기쁨");
    }
}
