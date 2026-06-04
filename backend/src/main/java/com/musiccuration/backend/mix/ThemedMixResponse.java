package com.musiccuration.backend.mix;

import com.fasterxml.jackson.databind.JsonNode;

public record ThemedMixResponse(JsonNode mixes, String provider, boolean cached) {
}
