import { getFirestore, collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, where, orderBy, Query, DocumentSnapshot } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';

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

// Initialize Firebase (if not already initialized)
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

// Middleware for CORS
const setCorsHeaders = (res: VercelResponse) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );
};

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
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Get userId from Authorization header or query
        const authToken = req.headers.authorization?.split('Bearer ')[1];
        const userId = req.query.userId || authToken || req.body.userId;

        if (!userId && req.method !== 'GET') {
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
            // NEW: Accept processed content fields
            rawMarkdown, contentMarkdown, contentHtml, images
        } = req.body;

        // Validate required fields
        if (!url || !title) {
            return res.status(400).json({ error: 'URL and title are required' });
        }

        // Create clip document
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
            // NEW: Add processed content fields if provided
            ...(rawMarkdown && { rawMarkdown }),
            ...(contentMarkdown && { contentMarkdown }),
            ...(contentHtml && { contentHtml }),
            ...(images && { images }),
        };

        // Compress HTML content if too large (Firestore 1MB limit per doc)
        if (clipData.htmlContent && clipData.htmlContent.length > 100000) {
            console.warn(`HTML content too large (${clipData.htmlContent.length} bytes), storing truncated version`);
            clipData.htmlContent = clipData.htmlContent.substring(0, 100000);
        }

        // Add to Firestore
        const clipsCollection = collection(db, 'clips');
        const docRef = await addDoc(clipsCollection, clipData);

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

        let q: Query = collection(db, 'clips');

        // Build query with filters
        const whereConditions = [];

        if (userId) {
            whereConditions.push(where('userId', '==', userId));
        }

        if (category) {
            whereConditions.push(where('category', '==', category));
        }

        if (platform) {
            whereConditions.push(where('platform', '==', platform));
        }

        if (collectionId) {
            whereConditions.push(where('collectionIds', 'array-contains', collectionId));
        }

        // Build the query
        if (whereConditions.length > 0) {
            q = query(collection(db, 'clips'), ...whereConditions, orderBy('createdAt', 'desc'));
        } else {
            q = query(collection(db, 'clips'), orderBy('createdAt', 'desc'));
        }

        // Execute query
        const snapshot = await getDocs(q);
        let clips = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as any));

        // Client-side filtering for search (simple substring match)
        if (search) {
            const searchLower = (search as string).toLowerCase();
            clips = clips.filter(clip =>
                clip.title.toLowerCase().includes(searchLower) ||
                clip.summary.toLowerCase().includes(searchLower) ||
                clip.keywords.some((k: string) => k.toLowerCase().includes(searchLower))
            );
        }

        // Apply pagination
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

        // Verify ownership
        const docRef = doc(db, 'clips', id as string);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ error: 'Clip not found' });
        }

        if (docSnap.data()?.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Update document
        updates.updatedAt = new Date().toISOString();
        await updateDoc(docRef, updates);

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

        // Verify ownership
        const docRef = doc(db, 'clips', id as string);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ error: 'Clip not found' });
        }

        if (docSnap.data()?.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Delete document
        await deleteDoc(docRef);

        res.status(200).json({ success: true, deletedId: id });
    } catch (error: any) {
        console.error('Delete clip error:', error);
        res.status(500).json({ error: 'Failed to delete clip', details: error.message });
    }
}
