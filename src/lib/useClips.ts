import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export interface ClipData {
    id?: string;
    url: string;
    platform: 'youtube' | 'instagram' | 'threads' | 'web';
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
    comments: any[];
    publishDate: string | null;
    htmlContent: string;
    collectionIds?: string[];
    viewCount?: number;
    likeCount?: number;
    createdAt?: string;
    updatedAt?: string;
    // NEW: Processed content fields (optional for backward compatibility)
    rawMarkdown?: string;
    contentMarkdown?: string;
    contentHtml?: string;
    images?: string[];
}


export interface CollectionData {
    id?: string;
    name: string;
    description?: string;
    color?: string;
    clipIds?: string[];
    isPublic?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

interface UseClipsReturn {
    clips: ClipData[];
    collections: CollectionData[];
    loading: boolean;
    error: string | null;

    // Clip operations
    createClip: (clipData: ClipData) => Promise<ClipData>;
    getClips: (filters?: { category?: string; platform?: string; search?: string; collectionId?: string; limit?: number; offset?: number }) => Promise<void>;
    updateClip: (id: string, updates: Partial<ClipData>) => Promise<ClipData>;
    deleteClip: (id: string) => Promise<void>;

    // Collection operations
    createCollection: (collectionData: CollectionData) => Promise<CollectionData>;
    getCollections: () => Promise<void>;
    updateCollection: (id: string, updates: Partial<CollectionData>) => Promise<CollectionData>;
    deleteCollection: (id: string) => Promise<void>;
    addClipToCollection: (clipId: string, collectionId: string) => Promise<void>;
    removeClipFromCollection: (clipId: string, collectionId: string) => Promise<void>;
}

export const useClips = (): UseClipsReturn => {
    const { user } = useAuth();
    const [clips, setClips] = useState<ClipData[]>([]);
    const [collections, setCollections] = useState<CollectionData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleError = (err: any, message: string) => {
        console.error(message, err);
        setError(err?.response?.data?.error || err.message || message);
    };

    // CLIP OPERATIONS
    const createClip = useCallback(async (clipData: ClipData): Promise<ClipData> => {
        if (!user) throw new Error('User must be authenticated');

        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/clips', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user.getIdToken()}`,
                },
                body: JSON.stringify({
                    ...clipData,
                    userId: user.uid,
                }),
            });

            if (!response.ok) throw new Error(`Failed to create clip: ${response.statusText}`);

            const newClip = await response.json();
            setClips(prev => [newClip, ...prev]);
            return newClip;
        } catch (err) {
            handleError(err, 'Failed to create clip');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    const getClips = useCallback(async (filters?: any) => {
        if (!user) return;

        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                userId: user.uid,
                ...filters,
            });

            const response = await fetch(`/api/clips?${params}`, {
                headers: {
                    'Authorization': `Bearer ${await user.getIdToken()}`,
                },
            });

            if (!response.ok) throw new Error(`Failed to fetch clips: ${response.statusText}`);

            const data = await response.json();
            setClips(data.clips || []);
        } catch (err) {
            handleError(err, 'Failed to fetch clips');
        } finally {
            setLoading(false);
        }
    }, [user]);

    const updateClip = useCallback(async (id: string, updates: Partial<ClipData>): Promise<ClipData> => {
        if (!user) throw new Error('User must be authenticated');

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/clips?id=${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user.getIdToken()}`,
                },
                body: JSON.stringify(updates),
            });

            if (!response.ok) throw new Error(`Failed to update clip: ${response.statusText}`);

            const updatedClip = await response.json();
            setClips(prev => prev.map(c => c.id === id ? updatedClip : c));
            return updatedClip;
        } catch (err) {
            handleError(err, 'Failed to update clip');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    const deleteClip = useCallback(async (id: string) => {
        if (!user) throw new Error('User must be authenticated');

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/clips?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${await user.getIdToken()}`,
                },
            });

            if (!response.ok) throw new Error(`Failed to delete clip: ${response.statusText}`);

            setClips(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            handleError(err, 'Failed to delete clip');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    // COLLECTION OPERATIONS
    const createCollection = useCallback(async (collectionData: CollectionData): Promise<CollectionData> => {
        if (!user) throw new Error('User must be authenticated');

        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/collections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user.getIdToken()}`,
                },
                body: JSON.stringify({
                    ...collectionData,
                    userId: user.uid,
                }),
            });

            if (!response.ok) throw new Error(`Failed to create collection: ${response.statusText}`);

            const newCollection = await response.json();
            setCollections(prev => [newCollection, ...prev]);
            return newCollection;
        } catch (err) {
            handleError(err, 'Failed to create collection');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    const getCollections = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/collections?userId=${user.uid}`, {
                headers: {
                    'Authorization': `Bearer ${await user.getIdToken()}`,
                },
            });

            if (!response.ok) throw new Error(`Failed to fetch collections: ${response.statusText}`);

            const data = await response.json();
            setCollections(data.collections || []);
        } catch (err) {
            handleError(err, 'Failed to fetch collections');
        } finally {
            setLoading(false);
        }
    }, [user]);

    const updateCollection = useCallback(async (id: string, updates: Partial<CollectionData>): Promise<CollectionData> => {
        if (!user) throw new Error('User must be authenticated');

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/collections?id=${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user.getIdToken()}`,
                },
                body: JSON.stringify(updates),
            });

            if (!response.ok) throw new Error(`Failed to update collection: ${response.statusText}`);

            const updatedCollection = await response.json();
            setCollections(prev => prev.map(c => c.id === id ? updatedCollection : c));
            return updatedCollection;
        } catch (err) {
            handleError(err, 'Failed to update collection');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    const deleteCollection = useCallback(async (id: string) => {
        if (!user) throw new Error('User must be authenticated');

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/collections?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${await user.getIdToken()}`,
                },
            });

            if (!response.ok) throw new Error(`Failed to delete collection: ${response.statusText}`);

            setCollections(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            handleError(err, 'Failed to delete collection');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    const addClipToCollection = useCallback(async (clipId: string, collectionId: string) => {
        if (!user) throw new Error('User must be authenticated');

        setLoading(true);
        try {
            const collection = collections.find(c => c.id === collectionId);
            if (!collection) throw new Error('Collection not found');

            const updatedClipIds = Array.from(new Set([...(collection.clipIds || []), clipId]));
            await updateCollection(collectionId, { clipIds: updatedClipIds });
        } catch (err) {
            handleError(err, 'Failed to add clip to collection');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user, collections, updateCollection]);

    const removeClipFromCollection = useCallback(async (clipId: string, collectionId: string) => {
        if (!user) throw new Error('User must be authenticated');

        setLoading(true);
        try {
            const collection = collections.find(c => c.id === collectionId);
            if (!collection) throw new Error('Collection not found');

            const updatedClipIds = (collection.clipIds || []).filter(id => id !== clipId);
            await updateCollection(collectionId, { clipIds: updatedClipIds });
        } catch (err) {
            handleError(err, 'Failed to remove clip from collection');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user, collections, updateCollection]);

    // Load collections on component mount
    useEffect(() => {
        if (user) {
            getCollections();
        }
    }, [user, getCollections]);

    return {
        clips,
        collections,
        loading,
        error,
        createClip,
        getClips,
        updateClip,
        deleteClip,
        createCollection,
        getCollections,
        updateCollection,
        deleteCollection,
        addClipToCollection,
        removeClipFromCollection,
    };
};
