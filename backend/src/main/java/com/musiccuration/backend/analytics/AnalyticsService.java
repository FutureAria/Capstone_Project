package com.musiccuration.backend.analytics;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {
    private static final Logger log = LoggerFactory.getLogger(AnalyticsService.class);
    private final JdbcTemplate jdbcTemplate;

    public AnalyticsService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void logApiRequest(String clientIp, String method, String endpoint, int status, long latencyMs, String errorCode, String userId) {
        try {
            jdbcTemplate.update("""
                    INSERT INTO api_request_logs(client_ip_hash, method, endpoint, status, latency_ms, error_code, user_id_hash)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, hash(clientIp), method, endpoint, status, Math.toIntExact(Math.min(latencyMs, Integer.MAX_VALUE)), errorCode, hash(userId));
        } catch (DataAccessException ex) {
            log.warn("Failed to write api request log", ex);
        }
    }

    public void logRecommendationEvent(String endpoint, String emotion, int songCount, String provider, boolean cached) {
        try {
            jdbcTemplate.update("""
                    INSERT INTO recommendation_events(endpoint, emotion, song_count, provider, cached)
                    VALUES (?, ?, ?, ?, ?)
                    """, endpoint, emotion, songCount, provider, cached);
        } catch (DataAccessException ex) {
            log.warn("Failed to write recommendation event", ex);
        }
    }

    public AnalyticsSummary summary() {
        Integer totalRequests = queryInt("SELECT COUNT(*) FROM api_request_logs");
        Integer totalRecommendationEvents = queryInt("SELECT COUNT(*) FROM recommendation_events");
        List<Map<String, Object>> endpoints = jdbcTemplate.queryForList("""
                SELECT endpoint, COUNT(*) AS count
                FROM api_request_logs
                GROUP BY endpoint
                ORDER BY count DESC, endpoint ASC
                LIMIT 10
                """);
        List<Map<String, Object>> statuses = jdbcTemplate.queryForList("""
                SELECT status, COUNT(*) AS count
                FROM api_request_logs
                GROUP BY status
                ORDER BY status ASC
                """);
        List<Map<String, Object>> emotions = jdbcTemplate.queryForList("""
                SELECT emotion, COUNT(*) AS count
                FROM recommendation_events
                WHERE emotion IS NOT NULL
                GROUP BY emotion
                ORDER BY count DESC, emotion ASC
                LIMIT 10
                """);
        return new AnalyticsSummary(totalRequests, totalRecommendationEvents, endpoints, statuses, emotions);
    }

    private Integer queryInt(String sql) {
        Integer value = jdbcTemplate.queryForObject(sql, Integer.class);
        return value == null ? 0 : value;
    }

    private String hash(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            return null;
        }
    }
}
