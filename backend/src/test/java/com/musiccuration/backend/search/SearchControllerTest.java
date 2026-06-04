package com.musiccuration.backend.search;

import com.musiccuration.backend.common.GlobalExceptionHandler;
import com.musiccuration.backend.external.youtube.YouTubeApiClient;
import com.musiccuration.backend.external.youtube.YouTubeMapper;
import org.junit.jupiter.api.Test;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SearchControllerTest {
    @Test
    void rejectsBlankQuery() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(new SearchController(new NoopSearchService()))
                .setControllerAdvice(new GlobalExceptionHandler())
                .setValidator(validator())
                .build();

        mockMvc.perform(get("/api/search").param("q", " "))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("INVALID_REQUEST"));
    }

    private LocalValidatorFactoryBean validator() {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();
        return validator;
    }

    private static class NoopSearchService extends SearchService {
        NoopSearchService() {
            super(nullYouTubeClient(), new YouTubeMapper(), null);
        }

        @Override
        public SearchResponse search(String query, int maxResults) {
            throw new AssertionError("Search service should not be called for invalid request");
        }

        private static YouTubeApiClient nullYouTubeClient() {
            return null;
        }
    }
}
