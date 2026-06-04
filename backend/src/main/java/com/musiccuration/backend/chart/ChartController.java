package com.musiccuration.backend.chart;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
public class ChartController {
    private final ChartService chartService;

    public ChartController(ChartService chartService) {
        this.chartService = chartService;
    }

    @GetMapping("/api/chart")
    public ChartResponse chart(
            @RequestParam(defaultValue = "KR") @Pattern(regexp = "^[A-Z]{2}$") String regionCode,
            @RequestParam(defaultValue = "10") @Min(1) @Max(25) int maxResults
    ) {
        return chartService.chart(regionCode, maxResults);
    }
}
