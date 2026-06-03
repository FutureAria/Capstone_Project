package com.musiccuration.backend.common;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.function.Supplier;

@Service
public class CacheService {
    private final Cache<String, Object> chartCache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(30))
            .maximumSize(50)
            .build();
    private final Cache<String, Object> searchCache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofHours(6))
            .maximumSize(1_000)
            .build();
    private final Cache<String, Object> videoIdCache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofHours(24))
            .maximumSize(5_000)
            .build();
    private final Cache<String, Object> aiCache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(10))
            .maximumSize(500)
            .build();

    public <T> CachedValue<T> chart(String key, Supplier<T> supplier) {
        return get(chartCache, key, supplier);
    }

    public <T> CachedValue<T> search(String key, Supplier<T> supplier) {
        return get(searchCache, key, supplier);
    }

    public <T> CachedValue<T> videoId(String key, Supplier<T> supplier) {
        return get(videoIdCache, key, supplier);
    }

    public <T> CachedValue<T> ai(String key, Supplier<T> supplier) {
        return get(aiCache, key, supplier);
    }

    @SuppressWarnings("unchecked")
    private <T> CachedValue<T> get(Cache<String, Object> cache, String key, Supplier<T> supplier) {
        Object existing = cache.getIfPresent(key);
        if (existing != null) {
            return new CachedValue<>((T) existing, true);
        }
        T value = supplier.get();
        cache.put(key, value);
        return new CachedValue<>(value, false);
    }

    public record CachedValue<T>(T value, boolean cached) {
    }
}
