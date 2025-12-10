import { getFirestore, collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, where, orderBy, Query } from 'firebase/firestore';
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

// Interface for Collection document
interface Collection {
    userId: string;
    name: string;
    description: string;
    color: string;
    clipIds: string[];
    createdAt: string;
    updatedAt: string;
    isPublic: boolean;
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
        const userId = req.query.userId || req.body?.userId || authToken;

        if (!userId && req.method !== 'GET') {
            return res.status(401).json({ error: 'User ID is required' });
        }

        // Route to appropriate handler
        switch (req.method) {
            case 'POST':
                return handleCreateCollection(req, res, userId);
            case 'GET':
                return handleGetCollections(req, res, userId);
            case 'PATCH':
                return handleUpdateCollection(req, res, userId);
            case 'DELETE':
                return handleDeleteCollection(req, res, userId);
            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}

// CREATE: Save a new collection
async function handleCreateCollection(req: VercelRequest, res: VercelResponse, userId: string) {
    try {
        const { name, description = '', color = '#21DBA4', isPublic = false } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Collection name is required' });
        }

        const collectionData: Collection = {
            userId,
            name,
            description,
            color,
            clipIds: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isPublic,
        };

        // Add to Firestore
        const collectionsCollection = collection(db, 'collections');
        const docRef = await addDoc(collectionsCollection, collectionData);

        res.status(201).json({
            id: docRef.id,
            ...collectionData,
        });
    } catch (error: any) {
        console.error('Create collection error:', error);
        res.status(500).json({ error: 'Failed to create collection', details: error.message });
    }
}

// READ: Get collections for user
async function handleGetCollections(req: VercelRequest, res: VercelResponse, userId: string) {
    try {
        const q = query(
            collection(db, 'collections'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const collections = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.status(200).json({
            collections,
            total: collections.length,
        });
    } catch (error: any) {
        console.error('Get collections error:', error);
        res.status(500).json({ error: 'Failed to fetch collections', details: error.message });
    }
}

// UPDATE: Update a collection
async function handleUpdateCollection(req: VercelRequest, res: VercelResponse, userId: string) {
    try {
        const { id } = req.query;
        const updates = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Collection ID is required' });
        }

        // Verify ownership
        const docRef = doc(db, 'collections', id as string);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ error: 'Collection not found' });
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
        console.error('Update collection error:', error);
        res.status(500).json({ error: 'Failed to update collection', details: error.message });
    }
}

// DELETE: Delete a collection
async function handleDeleteCollection(req: VercelRequest, res: VercelResponse, userId: string) {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Collection ID is required' });
        }

        // Verify ownership
        const docRef = doc(db, 'collections', id as string);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        if (docSnap.data()?.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Delete document
        await deleteDoc(docRef);

        res.status(200).json({ success: true, deletedId: id });
    } catch (error: any) {
        console.error('Delete collection error:', error);
        res.status(500).json({ error: 'Failed to delete collection', details: error.message });
    }
}
