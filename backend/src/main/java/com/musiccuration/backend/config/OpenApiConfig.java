package com.musiccuration.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI musicCurationOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Music Curation API")
                        .version("v1")
                        .description("Backend proxy API for YouTube and Claude based music curation.")
                        .license(new License().name("Portfolio project")));
    }
}
