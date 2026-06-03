package com.musiccuration.backend.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.musiccuration.backend.config.FirebaseAuthProperties;
import org.junit.jupiter.api.Test;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class FirebaseAuthInterceptorTest {
    @Test
    void allowsRequestsWhenFirebaseAuthIsDisabled() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(new TestController())
                .addInterceptors(new FirebaseAuthInterceptor(
                        new FirebaseAuthProperties(false, "", 3600),
                        null,
                        new ObjectMapper()
                ))
                .build();

        mockMvc.perform(get("/api/test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));
    }

    @Test
    void rejectsMissingBearerTokenWhenFirebaseAuthIsEnabled() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(new TestController())
                .addInterceptors(new FirebaseAuthInterceptor(
                        new FirebaseAuthProperties(true, "music-curation-capston", 3600),
                        null,
                        new ObjectMapper()
                ))
                .build();

        mockMvc.perform(get("/api/test"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
    }

    @RestController
    private static class TestController {
        @GetMapping("/api/test")
        TestResponse test() {
            return new TestResponse(true);
        }
    }

    private record TestResponse(boolean ok) {
    }
}
