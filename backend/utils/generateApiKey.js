import crypto from 'crypto';
import { fileURLToPath } from 'url';

/**
 * Generate a secure API key for Telegram bot authentication
 * @param {number} length - Length of the key in bytes (default: 32 bytes = 64 hex characters)
 * @returns {string} Secure random API key
 */
export function generateApiKey(length = 32) {
    // Generate cryptographically secure random bytes
    const randomBytes = crypto.randomBytes(length);
    // Convert to hexadecimal string
    return randomBytes.toString('hex');
}

/**
 * Generate API key with custom format (base64url encoded)
 * @param {number} length - Length of the key in bytes (default: 32)
 * @returns {string} Secure random API key in base64url format
 */
export function generateApiKeyBase64(length = 32) {
    const randomBytes = crypto.randomBytes(length);
    // Convert to base64url (URL-safe base64)
    return randomBytes.toString('base64url');
}

// If run directly, generate and display a key
// Check if this file is being run directly (not imported as a module)
const currentFile = fileURLToPath(import.meta.url);
let runFile = '';

if (process.argv[1]) {
    // process.argv[1] is already a file path, not a URL
    try {
        // Try to convert if it's a URL, otherwise use as-is
        if (process.argv[1].startsWith('file://')) {
            runFile = fileURLToPath(process.argv[1]);
        } else {
            runFile = process.argv[1];
        }
    } catch (e) {
        runFile = process.argv[1];
    }
}

// Normalize paths for comparison (handle Windows/Unix path differences)
const normalizePath = (path) => path.replace(/\\/g, '/').toLowerCase();
const isMainModule = runFile && normalizePath(currentFile) === normalizePath(runFile);

if (isMainModule) {
    const key = generateApiKey(32);
    console.log('\n🔐 Secure API Key Generated:');
    console.log('='.repeat(60));
    console.log(key);
    console.log('='.repeat(60));
    console.log('\n📝 Add this to your .env file:');
    console.log(`TELEGRAM_API_KEY=${key}\n`);
}

