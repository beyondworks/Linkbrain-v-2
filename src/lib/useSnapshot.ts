/**
 * React Hook for Content Preservation and Snapshot Management
 */

import { useState, useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import { SnapshotResult } from './snapshotUtils';

export interface SnapshotData {
  snapshotId: string;
  clipId: string;
  userId: string;
  originalUrl: string;
  htmlContent: string;
  images: Array<{
    original: string;
    compressed: string;
    size: number;
  }>;
  css: string[];
  createdAt: Date;
  size: number;
  compressed: boolean;
  waybackStatus?: {
    archived: boolean;
    archivedUrl?: string;
    timestamp?: string;
  };
}

interface UseSnapshotReturn {
  snapshots: SnapshotData[];
  loading: boolean;
  error: string | null;
  createSnapshot: (clipId: string, htmlContent: string, url: string, preserveWayback?: boolean) => Promise<SnapshotData | null>;
  getSnapshot: (snapshotId: string) => Promise<SnapshotData | null>;
  getClipSnapshots: (clipId: string) => Promise<SnapshotData[]>;
  deleteSnapshot: (snapshotId: string) => Promise<boolean>;
}

export function useSnapshot(): UseSnapshotReturn {
  const [snapshots, setSnapshots] = useState<SnapshotData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();
  
  const getAuthToken = useCallback(async (): Promise<string | null> => {
    const user = auth.currentUser;
    if (!user) {
      setError('User not authenticated');
      return null;
    }
    
    return await user.getIdToken();
  }, [auth]);
  
  const createSnapshot = useCallback(
    async (
      clipId: string,
      htmlContent: string,
      url: string,
      preserveWayback = true
    ): Promise<SnapshotData | null> => {
      setLoading(true);
      setError(null);
      
      try {
        const token = await getAuthToken();
        if (!token) return null;
        
        const response = await fetch('/api/snapshot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            clipId,
            htmlContent,
            url,
            preserveWayback
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create snapshot');
        }
        
        const data = await response.json();
        
        const newSnapshot: SnapshotData = {
          snapshotId: data.snapshotId,
          clipId,
          userId: auth.currentUser?.uid || '',
          originalUrl: url,
          htmlContent,
          images: [],
          css: [],
          createdAt: new Date(),
          size: data.size,
          compressed: data.compressed,
          waybackStatus: data.waybackStatus
        };
        
        setSnapshots(prev => [...prev, newSnapshot]);
        return newSnapshot;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [auth, getAuthToken]
  );
  
  const getSnapshot = useCallback(
    async (snapshotId: string): Promise<SnapshotData | null> => {
      setLoading(true);
      setError(null);
      
      try {
        const token = await getAuthToken();
        if (!token) return null;
        
        const response = await fetch(
          `/api/snapshot?snapshotId=${encodeURIComponent(snapshotId)}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to retrieve snapshot');
        }
        
        const data = await response.json();
        
        const snapshot: SnapshotData = {
          ...data,
          createdAt: new Date(data.createdAt)
        };
        
        setSnapshots(prev => {
          const existing = prev.findIndex(s => s.snapshotId === snapshotId);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = snapshot;
            return updated;
          }
          return [...prev, snapshot];
        });
        
        return snapshot;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [auth, getAuthToken]
  );
  
  const getClipSnapshots = useCallback(
    async (clipId: string): Promise<SnapshotData[]> => {
      setLoading(true);
      setError(null);
      
      try {
        const token = await getAuthToken();
        if (!token) return [];
        
        const response = await fetch(
          `/api/snapshot?clipId=${encodeURIComponent(clipId)}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to retrieve snapshots');
        }
        
        const data = await response.json();
        
        const snapshotList: SnapshotData[] = (data.snapshots || []).map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt)
        }));
        
        setSnapshots(prev => {
          // Remove old snapshots for this clip
          const filtered = prev.filter(s => s.clipId !== clipId);
          return [...filtered, ...snapshotList];
        });
        
        return snapshotList;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [auth, getAuthToken]
  );
  
  const deleteSnapshot = useCallback(
    async (snapshotId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      
      try {
        const token = await getAuthToken();
        if (!token) return false;
        
        const response = await fetch(
          `/api/snapshot?snapshotId=${encodeURIComponent(snapshotId)}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete snapshot');
        }
        
        setSnapshots(prev => prev.filter(s => s.snapshotId !== snapshotId));
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [auth, getAuthToken]
  );
  
  return {
    snapshots,
    loading,
    error,
    createSnapshot,
    getSnapshot,
    getClipSnapshots,
    deleteSnapshot
  };
}
