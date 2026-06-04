package com.musiccuration.backend.common;

import org.junit.jupiter.api.Test;

import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

class CacheServiceTest {
    @Test
    void returnsCachedValueOnSecondCall() {
        CacheService cacheService = new CacheService();
        AtomicInteger calls = new AtomicInteger();

        CacheService.CachedValue<String> first = cacheService.videoId("song", () -> {
            calls.incrementAndGet();
            return "abc123";
        });
        CacheService.CachedValue<String> second = cacheService.videoId("song", () -> {
            calls.incrementAndGet();
            return "different";
        });

        assertThat(first.value()).isEqualTo("abc123");
        assertThat(first.cached()).isFalse();
        assertThat(second.value()).isEqualTo("abc123");
        assertThat(second.cached()).isTrue();
        assertThat(calls.get()).isEqualTo(1);
    }
}
