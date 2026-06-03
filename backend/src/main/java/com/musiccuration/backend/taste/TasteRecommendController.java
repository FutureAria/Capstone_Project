package com.musiccuration.backend.taste;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TasteRecommendController {
    private final TasteRecommendService tasteRecommendService;

    public TasteRecommendController(TasteRecommendService tasteRecommendService) {
        this.tasteRecommendService = tasteRecommendService;
    }

    @PostMapping("/api/taste/recommend")
    public TasteRecommendResponse recommend(@Valid @RequestBody TasteRecommendRequest request) {
        return tasteRecommendService.recommend(request);
    }
}
