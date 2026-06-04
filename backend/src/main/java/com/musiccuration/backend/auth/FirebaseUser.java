package com.musiccuration.backend.auth;

public record FirebaseUser(
        String uid,
        String email,
        boolean emailVerified
) {
}
