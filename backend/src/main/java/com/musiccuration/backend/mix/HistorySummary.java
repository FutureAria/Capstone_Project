package com.musiccuration.backend.mix;

import jakarta.validation.constraints.Size;

public record HistorySummary(@Size(max = 20) String emotion) {
}
