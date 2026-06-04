package com.musiccuration.backend.analytics;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.musiccuration.backend.auth.FirebaseAuthInterceptor;
import com.musiccuration.backend.auth.FirebaseUser;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;

@Component
@ConditionalOnBean(AnalyticsService.class)
public class ApiRequestLoggingFilter extends OncePerRequestFilter {
    private final AnalyticsService analyticsService;
    private final ObjectMapper objectMapper;

    public ApiRequestLoggingFilter(AnalyticsService analyticsService, ObjectMapper objectMapper) {
        this.analyticsService = analyticsService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return !uri.contains("/api/") || uri.endsWith("/api/health");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        long started = System.nanoTime();
        ContentCachingResponseWrapper wrapped = new ContentCachingResponseWrapper(response);
        try {
            filterChain.doFilter(request, wrapped);
        } finally {
            long latencyMs = (System.nanoTime() - started) / 1_000_000L;
            analyticsService.logApiRequest(
                    clientIp(request),
                    request.getMethod(),
                    request.getRequestURI(),
                    wrapped.getStatus(),
                    latencyMs,
                    errorCode(wrapped),
                    firebaseUid(request)
            );
            wrapped.copyBodyToResponse();
        }
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String errorCode(ContentCachingResponseWrapper response) {
        if (response.getStatus() < 400) {
            return null;
        }
        byte[] body = response.getContentAsByteArray();
        if (body.length == 0) {
            return null;
        }
        try {
            JsonNode root = objectMapper.readTree(body);
            return root.path("error").path("code").asText(null);
        } catch (RuntimeException | IOException ignored) {
            return null;
        }
    }

    private String firebaseUid(HttpServletRequest request) {
        Object user = request.getAttribute(FirebaseAuthInterceptor.REQUEST_ATTRIBUTE);
        if (user instanceof FirebaseUser firebaseUser) {
            return firebaseUser.uid();
        }
        return null;
    }
}
