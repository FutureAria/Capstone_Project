package com.musiccuration.backend.mix;

import jakarta.validation.constraints.Size;

public record AlbumSummary(@Size(max = 80) String name) {
}
