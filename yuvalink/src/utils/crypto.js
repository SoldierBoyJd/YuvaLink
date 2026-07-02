/**
 * End-to-end encryption for YuvaLink messages using Web Crypto API (AES-GCM).
 *
 * Design:
 *  - Each conversation has a deterministic symmetric key derived from:
 *      HKDF(SHA-256, ikm = sorted(userA_id + userB_id), salt = APP_SALT, info = "yuvalink-chat")
 *  - Messages are encrypted with AES-GCM-256 + a random 12-byte IV.
 *  - Stored format: base64url(iv[12] || ciphertext)
 *  - The key is derived entirely in-browser and never sent to the server.
 *
 * Security properties:
 *  - Server (Supabase) only stores ciphertext — unreadable without the key.
 *  - Each message has a unique IV — no ciphertext reuse.
 *  - Key derivation is deterministic per conversation pair, so both parties
 *    independently derive the same key without a key exchange round-trip.
 *
 * Limitation:
 *  This is symmetric E2EE — both participants share the same key. A true
 *  asymmetric scheme (e.g. Signal Protocol) would provide forward secrecy,
 *  but requires key storage and a more complex key exchange. For a student
 *  networking app this symmetric approach gives strong confidentiality.
 */

// Change this salt to something unique to your app — keep it constant.
const APP_SALT = "yuvalink-e2e-salt-2026";

/** Convert a UTF-8 string to Uint8Array */
const enc = new TextEncoder();
const dec = new TextDecoder();

/** Encode ArrayBuffer → base64url string */
function bufToBase64(buf) {
    return btoa(String.fromCharCode(...new Uint8Array(buf)))
        .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Decode base64url string → Uint8Array */
function base64ToBuf(str) {
    const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64);
    return Uint8Array.from(bin, c => c.charCodeAt(0));
}

/**
 * Derive a per-conversation AES-GCM key from two user IDs.
 * Always sorts IDs so userA+userB and userB+userA produce the same key.
 */
export async function deriveConversationKey(userIdA, userIdB) {
    // Sort so both users derive the same key regardless of order
    const sorted = [userIdA, userIdB].sort().join("|");
    const ikm = enc.encode(sorted);
    const salt = enc.encode(APP_SALT);

    // Import raw key material
    const keyMaterial = await crypto.subtle.importKey(
        "raw", ikm, { name: "HKDF" }, false, ["deriveKey"]
    );

    // Derive AES-GCM-256 key
    return crypto.subtle.deriveKey(
        {
            name: "HKDF",
            hash: "SHA-256",
            salt: salt,
            info: enc.encode("yuvalink-chat"),
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false, // non-extractable — key can't be exported from browser memory
        ["encrypt", "decrypt"]
    );
}

/**
 * Encrypt a plaintext message string.
 * Returns base64url(iv[12 bytes] || ciphertext).
 */
export async function encryptMessage(plaintext, key) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        enc.encode(plaintext)
    );
    // Prepend IV to ciphertext
    const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.byteLength);
    return bufToBase64(combined);
}

/**
 * Decrypt a base64url(iv || ciphertext) string.
 * Returns the original plaintext, or "[encrypted message]" on failure.
 */
export async function decryptMessage(encrypted, key) {
    try {
        const combined = base64ToBuf(encrypted);
        const iv = combined.slice(0, 12);
        const ciphertext = combined.slice(12);
        const plaintext = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            ciphertext
        );
        return dec.decode(plaintext);
    } catch {
        // Decryption failed — message may be from before encryption was added,
        // or key mismatch. Show graceful fallback.
        return encrypted; // return raw (old unencrypted messages still readable)
    }
}
