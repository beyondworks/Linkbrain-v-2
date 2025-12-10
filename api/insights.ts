/**
 * Insights API Endpoint
 * 
 * GET /api/insights?userId=xxx&period=weekly|monthly|custom&days=7
 * Returns user's personalized insights based on clip data
 * 
 * POST /api/insights/generate - Force regenerate insights
 * 
 * NOTE: This is a new independent API - does NOT modify existing endpoints.
 */

import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { analyzeUserClips, InsightResult } from './_lib/insights-analyzer';

// Define simple interfaces for Vercel Request/Response
interface VercelRequest {
    method: string;
    body: any;
    query: any;
    headers: any;
}

interface VercelResponse {
    setHeader: (name: string, value: string) => void;
    status: (code: number) => VercelResponse;
    json: (body: any) => void;
    end: () => void;
}

// Initialize Firebase
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// CORS middleware
const setCorsHeaders = (res: VercelResponse) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );
};

/**
 * Main handler
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Get userId from Authorization header or query
        const authToken = req.headers.authorization?.split('Bearer ')[1];
        const userId = req.query.userId || req.body?.userId || authToken;

        if (!userId) {
            return res.status(401).json({ error: 'User ID is required' });
        }

        switch (req.method) {
            case 'GET':
                return handleGetInsights(req, res, userId);
            case 'POST':
                return handleGenerateInsights(req, res, userId);
            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error: any) {
        console.error('[Insights API] Error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}

/**
 * GET: Fetch cached insights or generate new ones
 */
async function handleGetInsights(req: VercelRequest, res: VercelResponse, userId: string) {
    const { period = 'weekly', days, forceRefresh } = req.query;

    // Validate period
    const validPeriods = ['weekly', 'monthly', 'custom'];
    const periodType = validPeriods.includes(period) ? period as 'weekly' | 'monthly' | 'custom' : 'weekly';
    const customDays = periodType === 'custom' ? parseInt(days as string) || 7 : undefined;

    // Check for cached insights (within last hour)
    const cacheKey = `${userId}_${periodType}_${customDays || ''}`;
    const cachedInsight = await getCachedInsight(userId, periodType);

    if (cachedInsight && !forceRefresh) {
        console.log('[Insights API] Returning cached insight');
        return res.status(200).json({
            insight: cachedInsight,
            cached: true
        });
    }

    // Generate fresh insights
    console.log('[Insights API] Generating fresh insights');
    const insight = await analyzeUserClips(db as any, userId, periodType, customDays);

    // Cache the result
    await cacheInsight(userId, periodType, insight);

    return res.status(200).json({
        insight,
        cached: false
    });
}

/**
 * POST: Force regenerate insights
 */
async function handleGenerateInsights(req: VercelRequest, res: VercelResponse, userId: string) {
    const { period = 'weekly', days } = req.body;

    const validPeriods = ['weekly', 'monthly', 'custom'];
    const periodType = validPeriods.includes(period) ? period as 'weekly' | 'monthly' | 'custom' : 'weekly';
    const customDays = periodType === 'custom' ? parseInt(days) || 7 : undefined;

    console.log(`[Insights API] Force generating ${periodType} insights for user ${userId}`);

    const insight = await analyzeUserClips(db as any, userId, periodType, customDays);

    // Cache the result
    await cacheInsight(userId, periodType, insight);

    return res.status(200).json({
        insight,
        message: 'Insights regenerated successfully'
    });
}

/**
 * Get cached insight from Firestore
 */
async function getCachedInsight(userId: string, period: 'weekly' | 'monthly' | 'custom'): Promise<InsightResult | null> {
    try {
        const insightsRef = collection(db, 'insights');
        const q = query(
            insightsRef,
            where('userId', '==', userId),
            where('period', '==', period),
            orderBy('generatedAt', 'desc'),
            limit(1)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        const data = doc.data();

        // Check if cache is still fresh (1 hour for weekly, 4 hours for monthly)
        const cacheAge = Date.now() - new Date(data.generatedAt).getTime();
        const maxAge = period === 'monthly' ? 4 * 60 * 60 * 1000 : 60 * 60 * 1000;

        if (cacheAge > maxAge) {
            console.log('[Insights API] Cache expired');
            return null;
        }

        return data as InsightResult;
    } catch (error) {
        console.error('[Insights API] Cache lookup error:', error);
        return null;
    }
}

/**
 * Cache insight to Firestore
 */
async function cacheInsight(userId: string, period: 'weekly' | 'monthly' | 'custom', insight: InsightResult): Promise<void> {
    try {
        const docId = `${userId}_${period}_${new Date().toISOString().split('T')[0]}`;
        const insightsRef = doc(db, 'insights', docId);

        await setDoc(insightsRef, {
            userId,
            period,
            ...insight
        });

        console.log('[Insights API] Insight cached successfully');
    } catch (error) {
        console.error('[Insights API] Cache write error:', error);
    }
}
