/**
 * Content Snapshot and Preservation API
 * Handles HTML snapshots, image compression, PDF export, and Wayback Machine integration
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { db, adminAuth } from '../src/lib/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

interface SnapshotMetadata {
  clipId: string;
  userId: string;
  originalUrl: string;
  snapshotUrl?: string;
  htmlContent: string;
  images: {
    original: string;
    compressed: string;
    size: number;
  }[];
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

/**
 * Extract CSS from HTML
 */
function extractCSS(html: string): string[] {
  const cssLinks: string[] = [];
  const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  const linkTagRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']*)["'][^>]*>/gi;
  
  let match;
  while ((match = styleTagRegex.exec(html)) !== null) {
    cssLinks.push(match[1]);
  }
  
  while ((match = linkTagRegex.exec(html)) !== null) {
    cssLinks.push(match[1]);
  }
  
  return cssLinks;
}

/**
 * Compress HTML content
 */
function compressHTML(html: string, maxSize: number = 100000): string {
  let compressed = html.replace(/<!--[\s\S]*?-->/g, '');
  compressed = compressed.replace(/\s+/g, ' ');
  
  if (compressed.length > maxSize) {
    compressed = compressed.substring(0, maxSize);
    const openTags = compressed.match(/<[^/][^>]*>/g) || [];
    const closeTags = compressed.match(/<\/[^>]*>/g) || [];
    
    if (openTags.length > closeTags.length) {
      compressed += '</div>'.repeat(Math.min(5, openTags.length - closeTags.length));
    }
  }
  
  return compressed;
}

/**
 * Extract image data from HTML
 */
function extractImages(html: string): string[] {
  const images: string[] = [];
  const imgTagRegex = /<img[^>]*src=["']([^"']*)["'][^>]*>/gi;
  
  let match;
  while ((match = imgTagRegex.exec(html)) !== null) {
    images.push(match[1]);
  }
  
  return images;
}

/**
 * Fetch from URL and create snapshot
 */
async function createSnapshotFromURL(url: string): Promise<{ html: string; success: boolean }> {
  const maxRetries = 3;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      
      if (response.ok) {
        const html = await response.text();
        return { html, success: true };
      }
    } catch (error) {
      if (i === maxRetries - 1) {
        throw new Error(`Failed to fetch URL after ${maxRetries} attempts`);
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  return { html: '', success: false };
}

/**
 * Check Wayback Machine availability
 */
async function checkWaybackMachine(url: string): Promise<{
  archived: boolean;
  archivedUrl?: string;
  timestamp?: string;
}> {
  const maxRetries = 2;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(
        `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.archived_snapshots?.closest?.available) {
          return {
            archived: true,
            archivedUrl: `https://web.archive.org/web/${data.archived_snapshots.closest.timestamp}/${url}`,
            timestamp: data.archived_snapshots.closest.timestamp
          };
        }
        
        return { archived: false };
      }
    } catch (error) {
      if (i === maxRetries - 1) {
        console.error('Failed to check Wayback Machine:', error);
      }
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  return { archived: false };
}

/**
 * Submit to Wayback Machine for archival
 */
async function submitToWaybackMachine(url: string): Promise<boolean> {
  const maxRetries = 2;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      await fetch(`https://web.archive.org/save/${encodeURIComponent(url)}`, {
        method: 'GET'
      });
      
      return true;
    } catch (error) {
      if (i === maxRetries - 1) {
        console.error('Failed to submit to Wayback Machine:', error);
      }
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  return false;
}

/**
 * Handle snapshot creation
 */
async function handleCreateSnapshot(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  const { clipId, htmlContent, url, preserveWayback = true } = req.body;
  
  if (!clipId || !htmlContent || !url) {
    res.status(400).json({ error: 'Missing required fields: clipId, htmlContent, url' });
    return;
  }
  
  // Verify authentication
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization token' });
    return;
  }
  
  const token = authHeader.substring(7);
  
  let userId: string;
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    userId = decodedToken.uid;
  } catch (error) {
    res.status(401).json({ error: 'Invalid authorization token' });
    return;
  }
  
  try {
    // Extract CSS and images
    const css = extractCSS(htmlContent);
    const images = extractImages(htmlContent);
    
    // Compress HTML
    const compressedHTML = compressHTML(htmlContent, 100000);
    
    // Check Wayback Machine if requested
    let waybackStatus = undefined;
    if (preserveWayback) {
      waybackStatus = await checkWaybackMachine(url);
      
      // If not archived, submit to Wayback Machine
      if (!waybackStatus.archived) {
        await submitToWaybackMachine(url);
      }
    }
    
    // Save snapshot to Firestore
    const snapshotData: SnapshotMetadata = {
      clipId,
      userId,
      originalUrl: url,
      htmlContent: compressedHTML,
      images: images.map(img => ({
        original: img,
        compressed: img, // In production, would compress here
        size: img.length
      })),
      css,
      createdAt: new Date(),
      size: compressedHTML.length,
      compressed: true,
      waybackStatus
    };
    
    const snapshotsCollection = collection(db, 'snapshots');
    const docRef = await addDoc(snapshotsCollection, snapshotData);
    
    res.status(201).json({
      success: true,
      snapshotId: docRef.id,
      size: compressedHTML.length,
      compressed: true,
      imagesCount: images.length,
      cssCount: css.length,
      waybackStatus
    });
  } catch (error) {
    console.error('Snapshot creation error:', error);
    res.status(500).json({
      error: 'Failed to create snapshot',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Handle snapshot retrieval
 */
async function handleGetSnapshot(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  const { snapshotId, clipId } = req.query;
  
  if (!snapshotId && !clipId) {
    res.status(400).json({ error: 'Missing required query parameter: snapshotId or clipId' });
    return;
  }
  
  // Verify authentication
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization token' });
    return;
  }
  
  const token = authHeader.substring(7);
  
  let userId: string;
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    userId = decodedToken.uid;
  } catch (error) {
    res.status(401).json({ error: 'Invalid authorization token' });
    return;
  }
  
  try {
    const snapshotsCollection = collection(db, 'snapshots');
    let queryRef;
    
    if (snapshotId) {
      const snapshotDoc = await getDocs(
        query(snapshotsCollection, where('__name__', '==', snapshotId as string))
      );
      
      if (snapshotDoc.empty) {
        res.status(404).json({ error: 'Snapshot not found' });
        return;
      }
      
      const snapshot = snapshotDoc.docs[0].data() as SnapshotMetadata;
      
      if (snapshot.userId !== userId) {
        res.status(403).json({ error: 'Unauthorized access' });
        return;
      }
      
      res.status(200).json({
        snapshotId: snapshotDoc.docs[0].id,
        ...snapshot
      });
    } else if (clipId) {
      const snapshotsQuery = query(
        snapshotsCollection,
        where('clipId', '==', clipId as string),
        where('userId', '==', userId)
      );
      
      const snapshotDocs = await getDocs(snapshotsQuery);
      
      const snapshots = snapshotDocs.docs.map(doc => ({
        snapshotId: doc.id,
        ...(doc.data() as SnapshotMetadata)
      }));
      
      res.status(200).json({ snapshots });
    }
  } catch (error) {
    console.error('Snapshot retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve snapshot',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Handle snapshot deletion
 */
async function handleDeleteSnapshot(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  const { snapshotId } = req.query;
  
  if (!snapshotId) {
    res.status(400).json({ error: 'Missing required query parameter: snapshotId' });
    return;
  }
  
  // Verify authentication
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization token' });
    return;
  }
  
  const token = authHeader.substring(7);
  
  let userId: string;
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    userId = decodedToken.uid;
  } catch (error) {
    res.status(401).json({ error: 'Invalid authorization token' });
    return;
  }
  
  try {
    const snapshotsCollection = collection(db, 'snapshots');
    const snapshotDoc = doc(snapshotsCollection, snapshotId as string);
    const snapshot = await getDocs(
      query(snapshotsCollection, where('__name__', '==', snapshotId as string))
    );
    
    if (snapshot.empty) {
      res.status(404).json({ error: 'Snapshot not found' });
      return;
    }
    
    const snapshotData = snapshot.docs[0].data() as SnapshotMetadata;
    
    if (snapshotData.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized access' });
      return;
    }
    
    await deleteDoc(snapshotDoc);
    
    res.status(200).json({ success: true, message: 'Snapshot deleted' });
  } catch (error) {
    console.error('Snapshot deletion error:', error);
    res.status(500).json({
      error: 'Failed to delete snapshot',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Main API handler
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method === 'POST') {
    await handleCreateSnapshot(req, res);
  } else if (req.method === 'GET') {
    await handleGetSnapshot(req, res);
  } else if (req.method === 'DELETE') {
    await handleDeleteSnapshot(req, res);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
