package com.musiccuration.backend.search;

import com.musiccuration.backend.common.ApiException;
import com.musiccuration.backend.common.ErrorCode;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
public class SearchController {
    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/api/search")
    public SearchResponse search(
            @RequestParam @NotBlank @Size(max = 120) String q,
            @RequestParam(defaultValue = "20") @Min(1) @Max(25) int maxResults
    ) {
        if (q == null || q.isBlank()) {
            throw new ApiException(ErrorCode.INVALID_REQUEST, "검색어를 입력해주세요.");
        }
        return searchService.search(q, maxResults);
    }

    @GetMapping("/api/video-id")
    public VideoIdResponse videoId(@RequestParam @NotBlank @Size(max = 120) String q) {
        if (q == null || q.isBlank()) {
            throw new ApiException(ErrorCode.INVALID_REQUEST, "검색어를 입력해주세요.");
        }
        return searchService.videoId(q);
    }
}
