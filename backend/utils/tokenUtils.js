import pkg from 'jsonwebtoken';
import crypto from 'crypto';
const { sign, verify } = pkg;

export function generateToken(payload, expiresIn = null) {
    try {
        const options = {}; // Options for token generation

        if (expiresIn) {
            options.expiresIn = expiresIn; // Only add expiresIn if it's provided
        }

        const token = sign(payload, process.env.JWT_SECURE_KEY, options);
        return token;
    } catch (error) {
        throw error;
    }
}

export function generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex');
}

export function verifyToken(token) {
    const decoded = verify(token, process.env.JWT_SECURE_KEY);
    return decoded;
}

export function getRefreshTokenExpiry() {
    const now = new Date();
    const expiry = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
    return expiry;
}

// generate secret key
export function generateSecretKey() {
    return crypto.randomBytes(16).toString('hex');
}