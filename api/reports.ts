/**
 * Reports API Endpoint
 * 
 * GET /api/reports?userId=xxx&type=weekly|monthly
 * POST /api/reports/generate - Generate new report
 * PATCH /api/reports?id=xxx - Mark report as read
 * 
 * NOTE: Independent API - does NOT modify existing endpoints.
 */

import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { generateReport, Report } from './_lib/report-generator';

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
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PATCH');
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
        const authToken = req.headers.authorization?.split('Bearer ')[1];
        // Prioritize explicit userId from query or body over auth token
        const userId = req.query.userId || req.body?.userId || authToken;

        if (!userId) {
            return res.status(401).json({ error: 'User ID is required' });
        }

        switch (req.method) {
            case 'GET':
                return handleGetReports(req, res, userId);
            case 'POST':
                return handleGenerateReport(req, res, userId);
            case 'PATCH':
                return handleUpdateReport(req, res, userId);
            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error: any) {
        console.error('[Reports API] Error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}

/**
 * GET: Fetch user's reports
 */
async function handleGetReports(req: VercelRequest, res: VercelResponse, userId: string) {
    const { type, id, limit: queryLimit = '10' } = req.query;

    // If specific ID requested
    if (id) {
        const docRef = doc(db, 'reports', id as string);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ error: 'Report not found' });
        }

        const report = docSnap.data();
        if (report.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        return res.status(200).json({ report });
    }

    // Query reports
    const reportsRef = collection(db, 'reports');
    let q;

    if (type && ['weekly', 'monthly'].includes(type as string)) {
        q = query(
            reportsRef,
            where('userId', '==', userId),
            where('type', '==', type),
            orderBy('createdAt', 'desc'),
            limit(parseInt(queryLimit as string))
        );
    } else {
        q = query(
            reportsRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(parseInt(queryLimit as string))
        );
    }

    const snapshot = await getDocs(q);
    const reports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Record<string, any>)
    }));

    // Also check for unread reports
    const unreadCount = reports.filter((r: any) => !r.isRead).length;

    return res.status(200).json({
        reports,
        total: reports.length,
        unreadCount
    });
}

/**
 * POST: Generate a new report
 */
async function handleGenerateReport(req: VercelRequest, res: VercelResponse, userId: string) {
    const { type = 'weekly' } = req.body;

    if (!['weekly', 'monthly'].includes(type)) {
        return res.status(400).json({ error: 'Invalid report type. Must be "weekly" or "monthly"' });
    }

    console.log(`[Reports API] Generating ${type} report for user ${userId}`);

    // Check if a report was already generated today
    const today = new Date().toISOString().split('T')[0];
    const existingId = `${userId}_${type}_${today}`;
    const existingRef = doc(db, 'reports', existingId);
    const existingSnap = await getDoc(existingRef);

    if (existingSnap.exists()) {
        console.log('[Reports API] Report already exists for today');
        return res.status(200).json({
            report: existingSnap.data(),
            message: 'Report already generated today'
        });
    }

    // Generate new report
    const report = await generateReport(db as any, userId, type as 'weekly' | 'monthly');

    // Save to Firestore
    await setDoc(doc(db, 'reports', report.id), report);

    console.log(`[Reports API] Report saved: ${report.id}`);

    return res.status(201).json({
        report,
        message: 'Report generated successfully'
    });
}

/**
 * PATCH: Update report (mark as read)
 */
async function handleUpdateReport(req: VercelRequest, res: VercelResponse, userId: string) {
    const { id } = req.query;
    const { isRead } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Report ID is required' });
    }

    const docRef = doc(db, 'reports', id as string);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return res.status(404).json({ error: 'Report not found' });
    }

    const report = docSnap.data();
    if (report.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update
    const updates: any = {};
    if (typeof isRead === 'boolean') {
        updates.isRead = isRead;
    }

    await updateDoc(docRef, updates);

    return res.status(200).json({
        id,
        ...report,
        ...updates,
        message: 'Report updated'
    });
}
