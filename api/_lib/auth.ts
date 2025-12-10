/**
 * Shared Authentication Utility
 * 
 * Centralized authentication for all API endpoints.
 * Requires Firebase ID Token verification - no fallback to userId in body/query.
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin (singleton)
if (getApps().length === 0) {
    initializeApp({
        credential: cert({
            projectId: process.env.VITE_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
    });
}

export interface AuthResult {
    userId: string;
    email?: string;
}

/**
 * Verify Firebase ID Token from Authorization header.
 * Returns userId if valid, null if invalid/missing.
 * 
 * Usage:
 * const auth = await verifyAuth(req);
 * if (!auth) return res.status(401).json({ error: 'Authentication required' });
 */
export const verifyAuth = async (req: any): Promise<AuthResult | null> => {
    const authHeader = req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('[Auth] Missing or invalid Authorization header');
        return null;
    }

    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
        console.warn('[Auth] Empty token');
        return null;
    }

    try {
        const decodedToken = await getAuth().verifyIdToken(idToken);
        console.log(`[Auth] Verified userId: ${decodedToken.uid}`);

        return {
            userId: decodedToken.uid,
            email: decodedToken.email
        };
    } catch (error: any) {
        console.error('[Auth] Token verification failed:', error.message);
        return null;
    }
};

/**
 * Require authentication - use this at the start of protected endpoints.
 * Returns 401 response if authentication fails.
 */
export const requireAuth = async (req: any, res: any): Promise<AuthResult | null> => {
    const auth = await verifyAuth(req);

    if (!auth) {
        res.status(401).json({
            error: 'Authentication required',
            message: 'Please provide a valid Firebase ID token in Authorization header'
        });
        return null;
    }

    return auth;
};
