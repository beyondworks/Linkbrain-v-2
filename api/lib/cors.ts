/**
 * CORS Utility
 * 
 * Centralized CORS configuration with domain allowlist.
 * Replaces Access-Control-Allow-Origin: * with specific domains.
 */

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
    // Production domains
    'https://linkbrain.vercel.app',
    'https://linkbrain-v-2.vercel.app',
    'https://www.linkbrain.app',

    // Development
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
];

/**
 * Check if origin is allowed
 */
export const isOriginAllowed = (origin: string | undefined): boolean => {
    if (!origin) return false;
    return ALLOWED_ORIGINS.includes(origin);
};

/**
 * Set CORS headers with domain restriction
 */
export const setCorsHeaders = (req: any, res: any): boolean => {
    const origin = req.headers?.origin;

    // Check if origin is allowed
    if (origin && isOriginAllowed(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (!origin) {
        // No origin header (same-origin request or server-to-server)
        // Allow for backward compatibility but log warning
        res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS[0]);
    } else {
        // Unknown origin - deny
        console.warn(`[CORS] Blocked request from origin: ${origin}`);
        res.setHeader('Access-Control-Allow-Origin', 'null');
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    return true;
};

/**
 * Handle OPTIONS preflight request
 */
export const handlePreflight = (req: any, res: any): boolean => {
    if (req.method === 'OPTIONS') {
        setCorsHeaders(req, res);
        res.status(200).end();
        return true;
    }
    return false;
};
