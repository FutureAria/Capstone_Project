package com.musiccuration.backend.emotion;

import java.util.Arrays;

public enum EmotionType {
    기쁨, 슬픔, 분노, 불안, 평온, 설렘, 피로, 집중;

    public static String normalize(String value) {
        return Arrays.stream(values())
                .map(Enum::name)
                .filter(name -> name.equals(value))
                .findFirst()
                .orElse("기쁨");
    }
}
