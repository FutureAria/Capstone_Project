package com.musiccuration.backend.auth;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.musiccuration.backend.common.ApiException;
import com.musiccuration.backend.common.ErrorCode;
import com.musiccuration.backend.config.FirebaseAuthProperties;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.Signature;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.security.spec.X509EncodedKeySpec;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Component
public class FirebaseTokenVerifier {
    private static final String CERT_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
    private static final String ISSUER_PREFIX = "https://securetoken.google.com/";

    private final FirebaseAuthProperties properties;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final Object certLock = new Object();
    private Map<String, PublicKey> cachedKeys = Map.of();
    private long certExpiresAtEpochSecond = 0;

    public FirebaseTokenVerifier(FirebaseAuthProperties properties, RestClient restClient, ObjectMapper objectMapper) {
        this.properties = properties;
        this.restClient = restClient;
        this.objectMapper = objectMapper;
    }

    public FirebaseUser verify(String token) {
        if (token == null || token.isBlank()) {
            throw unauthorized("Firebase ID Token이 필요합니다.");
        }
        if (properties.projectId() == null || properties.projectId().isBlank()) {
            throw unauthorized("백엔드 Firebase project id가 설정되어 있지 않습니다.");
        }

        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw unauthorized("Firebase ID Token 형식이 올바르지 않습니다.");
            }

            JsonNode header = parseBase64Json(parts[0]);
            JsonNode payload = parseBase64Json(parts[1]);
            String kid = header.path("kid").asText("");
            String alg = header.path("alg").asText("");

            if (!"RS256".equals(alg) || kid.isBlank()) {
                throw unauthorized("Firebase ID Token header가 올바르지 않습니다.");
            }

            PublicKey publicKey = publicKeys().get(kid);
            if (publicKey == null) {
                refreshPublicKeys();
                publicKey = publicKeys().get(kid);
            }
            if (publicKey == null) {
                throw unauthorized("Firebase ID Token 인증서를 찾지 못했습니다.");
            }

            verifySignature(parts, publicKey);
            validatePayload(payload);

            return new FirebaseUser(
                    payload.path("sub").asText(),
                    payload.path("email").asText(null),
                    payload.path("email_verified").asBoolean(false)
            );
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw unauthorized("Firebase ID Token 검증에 실패했습니다.");
        }
    }

    private void validatePayload(JsonNode payload) {
        String projectId = properties.projectId();
        String issuer = ISSUER_PREFIX + projectId;
        long now = Instant.now().getEpochSecond();
        long exp = payload.path("exp").asLong(0);
        long iat = payload.path("iat").asLong(0);
        String aud = payload.path("aud").asText("");
        String iss = payload.path("iss").asText("");
        String sub = payload.path("sub").asText("");

        if (!issuer.equals(iss) || !projectId.equals(aud)) {
            throw unauthorized("Firebase ID Token 발급 프로젝트가 일치하지 않습니다.");
        }
        if (sub.isBlank() || sub.length() > 128) {
            throw unauthorized("Firebase ID Token subject가 올바르지 않습니다.");
        }
        if (exp <= now || iat > now + 60) {
            throw unauthorized("Firebase ID Token 시간이 유효하지 않습니다.");
        }
    }

    private void verifySignature(String[] parts, PublicKey publicKey) throws Exception {
        Signature signature = Signature.getInstance("SHA256withRSA");
        signature.initVerify(publicKey);
        signature.update((parts[0] + "." + parts[1]).getBytes(StandardCharsets.UTF_8));
        byte[] sig = Base64.getUrlDecoder().decode(parts[2]);
        if (!signature.verify(sig)) {
            throw unauthorized("Firebase ID Token 서명이 올바르지 않습니다.");
        }
    }

    private JsonNode parseBase64Json(String value) throws Exception {
        byte[] decoded = Base64.getUrlDecoder().decode(value);
        return objectMapper.readTree(decoded);
    }

    private Map<String, PublicKey> publicKeys() {
        long now = Instant.now().getEpochSecond();
        if (now < certExpiresAtEpochSecond && !cachedKeys.isEmpty()) {
            return cachedKeys;
        }
        return refreshPublicKeys();
    }

    private Map<String, PublicKey> refreshPublicKeys() {
        synchronized (certLock) {
            long now = Instant.now().getEpochSecond();
            if (now < certExpiresAtEpochSecond && !cachedKeys.isEmpty()) {
                return cachedKeys;
            }

            String body = restClient.get()
                    .uri(CERT_URL)
                    .retrieve()
                    .body(String.class);
            try {
                Map<String, String> certs = objectMapper.readValue(body, new TypeReference<>() {});
                Map<String, PublicKey> nextKeys = new HashMap<>();
                for (Map.Entry<String, String> entry : certs.entrySet()) {
                    nextKeys.put(entry.getKey(), publicKeyFromPem(entry.getValue()));
                }
                cachedKeys = Map.copyOf(nextKeys);
                certExpiresAtEpochSecond = now + properties.certCacheSeconds();
                return cachedKeys;
            } catch (Exception e) {
                throw unauthorized("Firebase 인증서 로드에 실패했습니다.");
            }
        }
    }

    private PublicKey publicKeyFromPem(String pem) throws Exception {
        String normalized = pem
                .replace("-----BEGIN CERTIFICATE-----", "")
                .replace("-----END CERTIFICATE-----", "")
                .replaceAll("\\s", "");
        byte[] certBytes = Base64.getDecoder().decode(normalized);
        CertificateFactory certificateFactory = CertificateFactory.getInstance("X.509");
        X509Certificate certificate = (X509Certificate) certificateFactory.generateCertificate(new java.io.ByteArrayInputStream(certBytes));
        byte[] encoded = certificate.getPublicKey().getEncoded();
        return KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(encoded));
    }

    private ApiException unauthorized(String message) {
        return new ApiException(ErrorCode.UNAUTHORIZED, message, HttpStatus.UNAUTHORIZED);
    }
}
