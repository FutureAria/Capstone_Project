package com.musiccuration.backend.rate_limit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.musiccuration.backend.common.ErrorCode;
import com.musiccuration.backend.common.ErrorResponse;
import com.musiccuration.backend.config.RateLimitProperties;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {
    private final RateLimitProperties properties;
    private final ObjectMapper objectMapper;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public RateLimitInterceptor(RateLimitProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws IOException {
        String key = clientKey(request);
        long now = Instant.now().getEpochSecond();
        Bucket bucket = buckets.compute(key, (ignored, previous) -> {
            if (previous == null || now >= previous.resetAt()) {
                return new Bucket(now + properties.windowSeconds(), new AtomicInteger(1));
            }
            previous.count().incrementAndGet();
            return previous;
        });

        if (bucket.count().get() <= properties.maxRequests()) {
            return true;
        }

        response.setStatus(429);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), ErrorResponse.of(
                ErrorCode.RATE_LIMIT_EXCEEDED,
                "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
                429
        ));
        return false;
    }

    private String clientKey(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private record Bucket(long resetAt, AtomicInteger count) {
    }
}
