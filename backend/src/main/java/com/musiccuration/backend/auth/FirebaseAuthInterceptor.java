package com.musiccuration.backend.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.musiccuration.backend.common.ApiException;
import com.musiccuration.backend.common.ErrorCode;
import com.musiccuration.backend.common.ErrorResponse;
import com.musiccuration.backend.config.FirebaseAuthProperties;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;

@Component
@ConditionalOnProperty(prefix = "music.firebase-auth", name = "enabled", havingValue = "true")
public class FirebaseAuthInterceptor implements HandlerInterceptor {
    public static final String REQUEST_ATTRIBUTE = "firebaseUser";

    private final FirebaseAuthProperties properties;
    private final FirebaseTokenVerifier tokenVerifier;
    private final ObjectMapper objectMapper;

    public FirebaseAuthInterceptor(
            FirebaseAuthProperties properties,
            FirebaseTokenVerifier tokenVerifier,
            ObjectMapper objectMapper
    ) {
        this.properties = properties;
        this.tokenVerifier = tokenVerifier;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws IOException {
        if (!properties.enabled()) {
            return true;
        }

        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            writeUnauthorized(response, "로그인이 필요한 API입니다.");
            return false;
        }

        try {
            FirebaseUser user = tokenVerifier.verify(authorization.substring("Bearer ".length()).trim());
            request.setAttribute(REQUEST_ATTRIBUTE, user);
            return true;
        } catch (ApiException e) {
            writeUnauthorized(response, e.getMessage());
            return false;
        }
    }

    private void writeUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(401);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), ErrorResponse.of(
                ErrorCode.UNAUTHORIZED,
                message,
                401
        ));
    }
}
