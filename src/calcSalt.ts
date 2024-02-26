// @Note Crypto.subtle is only available in localhost or secure contexts (HTTPS).
function getCrypto() {
    try {
        return window.crypto;
    } catch {
        return crypto;
    }
}

export async function calcSalt(password: string, salt = "salt", iterations = 1e7) {
    const crypto = getCrypto();
    const textEncoder = new TextEncoder();
    const passwordBuffer = textEncoder.encode(password);
    const importedKey = await crypto.subtle.importKey("raw", passwordBuffer, "PBKDF2", false, ["deriveBits"]);

    const saltBuffer = textEncoder.encode(salt);
    const params = { name: "PBKDF2", hash: "SHA-256", salt: saltBuffer, iterations };
    const derivation = await crypto.subtle.deriveBits(params, importedKey, 256);

    return Array.from(new Uint8Array(derivation))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
