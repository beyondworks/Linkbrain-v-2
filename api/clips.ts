import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { verifyAuth } from './_lib/auth';
import { setCorsHeaders, handlePreflight } from './_lib/cors';

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

// Initialize Firebase Admin (if not already initialized)
if (getApps().length === 0) {
    initializeApp({
        credential: cert({
            projectId: process.env.VITE_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
    });
}

const db = getFirestore();

// Interface for Clip document
interface Clip {
    userId: string;
    url: string;
    platform: 'youtube' | 'instagram' | 'threads' | 'web' | 'linkedin';
    template: string;
    title: string;
    summary: string;
    keywords: string[];
    category: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    type: 'article' | 'video' | 'image' | 'social_post' | 'website';
    image: string | null;
    author: string;
    authorProfile: any;
    mediaItems: any[];
    engagement: any;
    mentions: Array<{ label: string; url: string }>;
    comments: Array<{ author: string; text: string; likes?: string; postedAt?: string }>;
    publishDate: string | null;
    htmlContent: string;
    collectionIds: string[];
    viewCount: number;
    likeCount: number;
    createdAt: string;
    updatedAt: string;
    // NEW: Processed content fields (optional for backward compatibility)
    rawMarkdown?: string;
    contentMarkdown?: string;
    contentHtml?: string;
    images?: string[];
}


// Vercel Serverless Function Handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCorsHeaders(req, res);

    if (handlePreflight(req, res)) {
        return;
    }

    try {
        // Verify authentication for all operations
        const auth = await verifyAuth(req);

        // GET requests can be public for some cases, but we still prefer auth
        if (!auth && req.method !== 'GET') {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userId = auth?.userId || req.query.userId;

        if (!userId) {
            return res.status(401).json({ error: 'User ID is required' });
        }

        // Route to appropriate handler
        switch (req.method) {
            case 'POST':
                return handleCreateClip(req, res, userId);
            case 'GET':
                return handleGetClips(req, res, userId);
            case 'PATCH':
                return handleUpdateClip(req, res, userId);
            case 'DELETE':
                return handleDeleteClip(req, res, userId);
            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}

// CREATE: Save a new clip to Firestore
async function handleCreateClip(req: VercelRequest, res: VercelResponse, userId: string) {
    try {
        const {
            url, platform, template, title, summary, keywords, category, sentiment, type,
            image, author, authorProfile, mediaItems, engagement, mentions, comments,
            publishDate, htmlContent, collectionIds = [],
            rawMarkdown, contentMarkdown, contentHtml, images
        } = req.body;

        if (!url || !title) {
            return res.status(400).json({ error: 'URL and title are required' });
        }

        const clipData: Clip = {
            userId,
            url,
            platform: platform || 'web',
            template: template || platform || 'web',
            title,
            summary: summary || '',
            keywords: keywords || [],
            category: category || 'Other',
            sentiment: sentiment || 'neutral',
            type: type || 'website',
            image: image || null,
            author: author || '',
            authorProfile: authorProfile || {},
            mediaItems: mediaItems || [],
            engagement: engagement || {},
            mentions: mentions || [{ label: 'Original', url }],
            comments: comments || [],
            publishDate: publishDate || null,
            htmlContent: htmlContent || '',
            collectionIds,
            viewCount: 0,
            likeCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...(rawMarkdown && { rawMarkdown }),
            ...(contentMarkdown && { contentMarkdown }),
            ...(contentHtml && { contentHtml }),
            ...(images && { images }),
        };

        if (clipData.htmlContent && clipData.htmlContent.length > 100000) {
            clipData.htmlContent = clipData.htmlContent.substring(0, 100000);
        }

        // Firebase Admin SDK syntax
        const docRef = await db.collection('clips').add(clipData);

        res.status(201).json({
            id: docRef.id,
            ...clipData,
        });
    } catch (error: any) {
        console.error('Create clip error:', error);
        res.status(500).json({ error: 'Failed to create clip', details: error.message });
    }
}


// READ: Get clips (with optional filtering)
async function handleGetClips(req: VercelRequest, res: VercelResponse, userId: string) {
    try {
        const { category, platform, search, collectionId, limit = 50, offset = 0 } = req.query;

        // Build query with Firebase Admin SDK
        let queryRef: FirebaseFirestore.Query = db.collection('clips');

        if (userId) {
            queryRef = queryRef.where('userId', '==', userId);
        }
        if (category) {
            queryRef = queryRef.where('category', '==', category);
        }
        if (platform) {
            queryRef = queryRef.where('platform', '==', platform);
        }
        if (collectionId) {
            queryRef = queryRef.where('collectionIds', 'array-contains', collectionId);
        }

        queryRef = queryRef.orderBy('createdAt', 'desc');

        const snapshot = await queryRef.get();
        let clips = snapshot.docs.map((doc: FirebaseFirestore.DocumentSnapshot) => ({
            id: doc.id,
            ...doc.data(),
        }));

        // Client-side filtering for search
        if (search) {
            const searchLower = (search as string).toLowerCase();
            clips = clips.filter((clip: any) =>
                clip.title?.toLowerCase().includes(searchLower) ||
                clip.summary?.toLowerCase().includes(searchLower) ||
                clip.keywords?.some((k: string) => k.toLowerCase().includes(searchLower))
            );
        }

        const offsetNum = parseInt(offset as string) || 0;
        const limitNum = parseInt(limit as string) || 50;
        const paginatedClips = clips.slice(offsetNum, offsetNum + limitNum);

        res.status(200).json({
            clips: paginatedClips,
            total: clips.length,
            offset: offsetNum,
            limit: limitNum,
        });
    } catch (error: any) {
        console.error('Get clips error:', error);
        res.status(500).json({ error: 'Failed to fetch clips', details: error.message });
    }
}

// UPDATE: Update an existing clip
async function handleUpdateClip(req: VercelRequest, res: VercelResponse, userId: string) {
    try {
        const { id } = req.query;
        const updates = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Clip ID is required' });
        }

        const docRef = db.collection('clips').doc(id as string);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ error: 'Clip not found' });
        }

        if (docSnap.data()?.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        updates.updatedAt = new Date().toISOString();
        await docRef.update(updates);

        res.status(200).json({
            id,
            ...docSnap.data(),
            ...updates,
        });
    } catch (error: any) {
        console.error('Update clip error:', error);
        res.status(500).json({ error: 'Failed to update clip', details: error.message });
    }
}

// DELETE: Delete a clip
async function handleDeleteClip(req: VercelRequest, res: VercelResponse, userId: string) {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Clip ID is required' });
        }

        const docRef = db.collection('clips').doc(id as string);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ error: 'Clip not found' });
        }

        if (docSnap.data()?.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await docRef.delete();

        res.status(200).json({ success: true, deletedId: id });
    } catch (error: any) {
        console.error('Delete clip error:', error);
        res.status(500).json({ error: 'Failed to delete clip', details: error.message });
    }
}

