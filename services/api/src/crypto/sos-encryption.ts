import _sodium from 'libsodium-wrappers-sumo';
import { logger } from '../utils/logger.js';

let sodium: typeof _sodium;

/**
 * Initialize libsodium. Must be called before any crypto operations.
 */
export async function initCrypto(): Promise<void> {
  await _sodium.ready;
  sodium = _sodium;
  logger.info('✅ Crypto (libsodium) initialized');
}

/**
 * Generate an X25519 keypair for SOS payload encryption.
 * Called at user registration — public key stored server-side, private key stays on device.
 */
export function generateX25519Keypair(): {
  publicKey: string;
  privateKey: string;
} {
  const keypair = sodium.crypto_box_keypair();
  return {
    publicKey: sodium.to_base64(keypair.publicKey, sodium.base64_variants.ORIGINAL),
    privateKey: sodium.to_base64(keypair.privateKey, sodium.base64_variants.ORIGINAL),
  };
}

/**
 * Derive a shared secret from server's private key and client's public key.
 * Uses X25519 Diffie-Hellman key exchange.
 * The shared secret is used for ChaCha20-Poly1305 encryption of SOS payloads.
 */
export function deriveSharedSecret(
  serverPrivateKeyB64: string,
  clientPublicKeyB64: string
): string {
  const serverPrivateKey = sodium.from_base64(serverPrivateKeyB64, sodium.base64_variants.ORIGINAL);
  const clientPublicKey = sodium.from_base64(clientPublicKeyB64, sodium.base64_variants.ORIGINAL);

  // Use crypto_box_beforenm to pre-compute the shared key
  const sharedKey = sodium.crypto_box_beforenm(clientPublicKey, serverPrivateKey);
  return sodium.to_base64(sharedKey, sodium.base64_variants.ORIGINAL);
}

/**
 * Encrypt an SOS payload using ChaCha20-Poly1305 (AEAD).
 * Used for SMS fallback and BLE beacon payloads.
 * 
 * @param payload - The plaintext SOS data (compact string)
 * @param sharedSecretB64 - Pre-computed shared secret (Base64)
 * @returns Base64-encoded ciphertext with nonce prepended
 */
export function encryptSOSPayload(
  payload: string,
  sharedSecretB64: string
): string {
  const sharedSecret = sodium.from_base64(sharedSecretB64, sodium.base64_variants.ORIGINAL);
  
  // Generate random nonce (24 bytes for XChaCha20-Poly1305)
  const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
  
  // Encrypt with AEAD (authenticated encryption)
  const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    sodium.from_string(payload),
    null, // no additional data
    null, // no secret nonce
    nonce,
    sharedSecret
  );

  // Prepend nonce to ciphertext for transmission
  const combined = new Uint8Array(nonce.length + ciphertext.length);
  combined.set(nonce);
  combined.set(ciphertext, nonce.length);

  return sodium.to_base64(combined, sodium.base64_variants.ORIGINAL);
}

/**
 * Decrypt an SOS payload encrypted with ChaCha20-Poly1305.
 * Called by the server when receiving SMS webhook or BLE relay.
 * 
 * @param encryptedB64 - Base64 ciphertext with prepended nonce
 * @param sharedSecretB64 - Pre-computed shared secret
 * @returns Decrypted plaintext, or null if tampered/invalid
 */
export function decryptSOSPayload(
  encryptedB64: string,
  sharedSecretB64: string
): string | null {
  try {
    const sharedSecret = sodium.from_base64(sharedSecretB64, sodium.base64_variants.ORIGINAL);
    const combined = sodium.from_base64(encryptedB64, sodium.base64_variants.ORIGINAL);

    const nonceLength = sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES;
    if (combined.length < nonceLength) {
      logger.warn('SOS decrypt: payload too short');
      return null;
    }

    const nonce = combined.slice(0, nonceLength);
    const ciphertext = combined.slice(nonceLength);

    const plaintext = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null, // no secret nonce
      ciphertext,
      null, // no additional data
      nonce,
      sharedSecret
    );

    return sodium.to_string(plaintext);
  } catch (error) {
    // AEAD tag verification failed — payload was tampered with
    logger.warn('SOS decrypt: authentication failed (tampered payload or wrong key)');
    return null;
  }
}

/**
 * Encrypt sensitive data at rest (identity fields, etc.) using AES-256-GCM.
 * Uses libsodium's secretbox (XSalsa20-Poly1305) as a portable alternative.
 */
export function encryptAtRest(plaintext: string, keyB64: string): string {
  const key = sodium.from_base64(keyB64, sodium.base64_variants.ORIGINAL);
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const ciphertext = sodium.crypto_secretbox_easy(
    sodium.from_string(plaintext),
    nonce,
    key
  );
  
  const combined = new Uint8Array(nonce.length + ciphertext.length);
  combined.set(nonce);
  combined.set(ciphertext, nonce.length);
  return sodium.to_base64(combined, sodium.base64_variants.ORIGINAL);
}

/**
 * Decrypt data encrypted at rest.
 */
export function decryptAtRest(encryptedB64: string, keyB64: string): string | null {
  try {
    const key = sodium.from_base64(keyB64, sodium.base64_variants.ORIGINAL);
    const combined = sodium.from_base64(encryptedB64, sodium.base64_variants.ORIGINAL);
    
    const nonceLength = sodium.crypto_secretbox_NONCEBYTES;
    const nonce = combined.slice(0, nonceLength);
    const ciphertext = combined.slice(nonceLength);
    
    const plaintext = sodium.crypto_secretbox_open_easy(ciphertext, nonce, key);
    return sodium.to_string(plaintext);
  } catch {
    return null;
  }
}

/**
 * Generate a cryptographic hash for user ID (used in BLE beacons).
 * Truncated to 8 characters for compact transmission.
 */
export function hashUserId(userId: string): string {
  const hash = sodium.crypto_generichash(16, sodium.from_string(userId));
  return sodium.to_hex(hash).slice(0, 8);
}

/**
 * Generate a secure random OTP
 */
export function generateOTP(length = 6): string {
  const max = Math.pow(10, length);
  const randomBytes = sodium.randombytes_buf(4);
  const num = new DataView(randomBytes.buffer).getUint32(0) % max;
  return num.toString().padStart(length, '0');
}

/**
 * Hash an OTP for storage (never store OTPs in plaintext)
 */
export function hashOTP(otp: string): string {
  const hash = sodium.crypto_generichash(32, sodium.from_string(otp));
  return sodium.to_hex(hash);
}

/**
 * Verify an OTP against its hash
 */
export function verifyOTPHash(otp: string, hash: string): boolean {
  return hashOTP(otp) === hash;
}

export function getServerKeypair(seed: string): {
  publicKey: string;
  privateKey: string;
} {
  const seedBytes = sodium.from_hex(seed.padEnd(64, '0').slice(0, 64));
  const keypair = sodium.crypto_box_seed_keypair(seedBytes);
  return {
    publicKey: sodium.to_base64(keypair.publicKey, sodium.base64_variants.ORIGINAL),
    privateKey: sodium.to_base64(keypair.privateKey, sodium.base64_variants.ORIGINAL),
  };
}
