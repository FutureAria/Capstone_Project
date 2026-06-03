package com.musiccuration.backend.emotion;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EmotionController {
    private final EmotionService emotionService;

    public EmotionController(EmotionService emotionService) {
        this.emotionService = emotionService;
    }

    @PostMapping("/api/emotion")
    public EmotionResponse emotion(@Valid @RequestBody EmotionRequest request) {
        return emotionService.analyze(request.text());
    }
}
