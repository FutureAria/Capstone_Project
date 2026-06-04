package com.musiccuration.backend.config;

import com.musiccuration.backend.auth.FirebaseAuthInterceptor;
import com.musiccuration.backend.rate_limit.RateLimitInterceptor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final MusicProperties musicProperties;
    private final ObjectProvider<FirebaseAuthInterceptor> firebaseAuthInterceptor;
    private final RateLimitInterceptor rateLimitInterceptor;

    public WebConfig(
            MusicProperties musicProperties,
            ObjectProvider<FirebaseAuthInterceptor> firebaseAuthInterceptor,
            RateLimitInterceptor rateLimitInterceptor
    ) {
        this.musicProperties = musicProperties;
        this.firebaseAuthInterceptor = firebaseAuthInterceptor;
        this.rateLimitInterceptor = rateLimitInterceptor;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(musicProperties.frontendOrigin())
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        firebaseAuthInterceptor.ifAvailable(interceptor ->
                registry.addInterceptor(interceptor)
                        .addPathPatterns("/api/**")
                        .excludePathPatterns("/api/health", "/api/ops/**")
        );

        registry.addInterceptor(rateLimitInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/health");
    }
}
