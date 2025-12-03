# Phase 3: Content Preservation & Snapshot System - Implementation Guide

## Overview

Phase 3 implements a comprehensive content preservation system that allows users to save and archive web content with their clips. The system includes:

- **HTML Snapshot Extraction**: Captures and compresses HTML content for offline viewing
- **Image Compression**: Reduces image sizes while maintaining quality
- **CSS Extraction**: Preserves styling information for accurate rendering
- **PDF Export**: Generates shareable PDF versions of clips
- **Wayback Machine Integration**: Archives content to Internet Archive for long-term preservation
- **Security**: Full Firestore security rules with user ownership verification

## Files Created

### 1. **`src/lib/snapshotUtils.ts`** (380 lines)
Core utility functions for snapshot creation and management.

**Key Functions:**
- `extractCSS(html)` - Extract stylesheet links and inline styles
- `extractImages(html)` - Extract image URLs from HTML
- `compressHTML(html, maxSize)` - Compress HTML while preserving structure (default 100KB limit)
- `compressImage(imageUrl, quality)` - Reduce image file size
- `createSnapshot(html, url, options)` - Create complete snapshot with all assets
- `exportToPDF(element, filename)` - Generate PDF from HTML element
- `checkWaybackMachine(url)` - Check if URL is archived
- `saveToWaybackMachine(url)` - Submit URL to Internet Archive
- `restoreSnapshot(snapshot)` - Restore snapshot to viewable HTML
- `calculateSnapshotStats(original, snapshot)` - Get compression metrics

**Usage Example:**
```typescript
import { createSnapshot, exportToPDF } from '@/lib/snapshotUtils';

// Create snapshot
const snapshot = await createSnapshot(
  htmlContent,
  'https://example.com/article',
  { includeImages: true, compressHTML: true }
);

console.log(`Compressed from ${snapshot.metadata.originalSize} to ${snapshot.metadata.size} bytes`);

// Export to PDF
const element = document.getElementById('clip-content');
await exportToPDF(element, 'my-clip.pdf');
```

### 2. **`api/snapshot.ts`** (420 lines)
Serverless API endpoint for snapshot management (Vercel/Firebase Functions compatible).

**Endpoints:**

#### POST `/api/snapshot` - Create Snapshot
```typescript
// Request
POST /api/snapshot
Headers: { Authorization: "Bearer {token}" }
Body: {
  clipId: string;        // ID of the clip to snapshot
  htmlContent: string;   // HTML content to snapshot
  url: string;          // Original URL
  preserveWayback?: boolean; // Default: true
}

// Response
{
  success: true,
  snapshotId: string;
  size: number;         // Compressed HTML size in bytes
  compressed: true;
  imagesCount: number;
  cssCount: number;
  waybackStatus?: {
    archived: boolean;
    archivedUrl?: string;
    timestamp?: string;
  };
}
```

#### GET `/api/snapshot?snapshotId=X` - Get Single Snapshot
```typescript
// Request
GET /api/snapshot?snapshotId={snapshotId}
Headers: { Authorization: "Bearer {token}" }

// Response
{
  snapshotId: string;
  clipId: string;
  userId: string;
  originalUrl: string;
  htmlContent: string; // Compressed HTML
  images: Array<{ original, compressed, size }>;
  css: string[];
  createdAt: Date;
  size: number;
  compressed: boolean;
  waybackStatus?: {...};
}
```

#### GET `/api/snapshot?clipId=X` - Get All Snapshots for Clip
```typescript
// Request
GET /api/snapshot?clipId={clipId}
Headers: { Authorization: "Bearer {token}" }

// Response
{
  snapshots: SnapshotData[];
}
```

#### DELETE `/api/snapshot?snapshotId=X` - Delete Snapshot
```typescript
// Request
DELETE /api/snapshot?snapshotId={snapshotId}
Headers: { Authorization: "Bearer {token}" }

// Response
{
  success: true,
  message: "Snapshot deleted"
}
```

### 3. **`src/lib/useSnapshot.ts`** (310 lines)
React custom hook for snapshot management in components.

**Hook Functions:**
- `createSnapshot(clipId, htmlContent, url, preserveWayback)` - Create and save snapshot
- `getSnapshot(snapshotId)` - Retrieve single snapshot
- `getClipSnapshots(clipId)` - Get all snapshots for a clip
- `deleteSnapshot(snapshotId)` - Delete snapshot

**Hook State:**
- `snapshots` - Array of snapshot objects
- `loading` - Boolean indicating API call in progress
- `error` - String error message if operation failed

**Usage Example:**
```typescript
import { useSnapshot } from '@/lib/useSnapshot';

function ClipDetailPage({ clipId }) {
  const { snapshots, loading, createSnapshot, getClipSnapshots } = useSnapshot();
  
  useEffect(() => {
    // Load existing snapshots for this clip
    getClipSnapshots(clipId);
  }, [clipId, getClipSnapshots]);
  
  const handleCreateSnapshot = async () => {
    const htmlContent = document.getElementById('content').innerHTML;
    const snapshot = await createSnapshot(
      clipId,
      htmlContent,
      'https://example.com/article'
    );
    
    if (snapshot) {
      console.log(`Snapshot created: ${snapshot.snapshotId}`);
    }
  };
  
  return (
    <div>
      <button onClick={handleCreateSnapshot} disabled={loading}>
        {loading ? 'Creating...' : 'Save Snapshot'}
      </button>
      
      {snapshots.map(snapshot => (
        <div key={snapshot.snapshotId}>
          <p>{snapshot.originalUrl}</p>
          <p>Size: {(snapshot.size / 1024).toFixed(2)} KB</p>
          {snapshot.waybackStatus?.archived && (
            <a href={snapshot.waybackStatus.archivedUrl}>View Archive</a>
          )}
        </div>
      ))}
    </div>
  );
}
```

### 4. **`firestore.rules`** (200+ lines)
Comprehensive Firestore security rules for production deployment.

**Collections Protected:**
- `clips/{clipId}` - User-owned clip documents
- `clips/{clipId}/comments/{commentId}` - Clip comments
- `collections/{collectionId}` - User-owned collection groupings
- `collections/{collectionId}/clips/{clipId}` - Collection clip references
- `snapshots/{snapshotId}` - User-owned content snapshots
- `users/{userId}` - User profile documents
- `users/{userId}/preferences/{preferenceId}` - User preferences
- `users/{userId}/activity/{activityId}` - User activity log
- `publicClips/{clipId}` - Publicly shared clips

**Security Features:**
- User ownership verification on all operations
- Data validation (required fields, type checking, size limits)
- Document size enforcement (1MB limit for snapshots)
- Timestamp validation (server-side timestamps only)
- Immutable document fields (userId, createdAt)
- Role-based access control for collections

## Integration Steps

### Step 1: Deploy Firestore Rules
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy rules to your project
firebase deploy --only firestore:rules
```

### Step 2: Update package.json Dependencies
Ensure these dependencies are present (should be from Phase 1):
```json
{
  "dependencies": {
    "html2canvas": "^1.4.1",
    "jspdf": "^2.5.1",
    "@google-cloud/vision": "^3.7.0"
  }
}
```

### Step 3: Add Environment Variables
Add to your `.env.local`:
```env
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_WAYBACK_API_URL=https://archive.org/wayback/available
```

### Step 4: Integrate useSnapshot Hook into ClipDetail Component

**File**: `src/components/ClipDetail.tsx`

Add snapshot creation to the clip detail view:

```typescript
import { useSnapshot } from '@/lib/useSnapshot';
import { exportToPDF } from '@/lib/snapshotUtils';

export function ClipDetail({ clipId }) {
  const { snapshots, loading, createSnapshot, getClipSnapshots } = useSnapshot();
  const [showSnapshots, setShowSnapshots] = useState(false);
  
  useEffect(() => {
    getClipSnapshots(clipId);
  }, [clipId, getClipSnapshots]);
  
  const handleSaveSnapshot = async () => {
    const contentElement = document.getElementById('clip-content');
    if (!contentElement) return;
    
    const htmlContent = contentElement.innerHTML;
    await createSnapshot(clipId, htmlContent, window.location.href);
  };
  
  const handleExportPDF = async () => {
    const contentElement = document.getElementById('clip-content');
    if (!contentElement) return;
    
    await exportToPDF(contentElement, `clip-${clipId}.pdf`);
  };
  
  return (
    <div>
      {/* Existing clip content */}
      <div id="clip-content">
        {/* Clip rendered here */}
      </div>
      
      {/* Snapshot controls */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleSaveSnapshot}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Snapshot'}
        </button>
        
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Export PDF
        </button>
        
        <button
          onClick={() => setShowSnapshots(!showSnapshots)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          {showSnapshots ? 'Hide' : 'Show'} Snapshots ({snapshots.length})
        </button>
      </div>
      
      {/* Snapshots list */}
      {showSnapshots && (
        <div className="mt-4 space-y-2">
          {snapshots.map(snapshot => (
            <div key={snapshot.snapshotId} className="p-4 border rounded">
              <p className="text-sm text-gray-600">{snapshot.originalUrl}</p>
              <p className="text-sm">Size: {(snapshot.size / 1024).toFixed(2)} KB</p>
              {snapshot.waybackStatus?.archived && (
                <a
                  href={snapshot.waybackStatus.archivedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View on Archive.org
                </a>
              )}
              <p className="text-xs text-gray-500">
                {new Date(snapshot.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Step 5: Add Snapshot Display Component

Create `src/components/SnapshotViewer.tsx`:

```typescript
import { SnapshotData } from '@/lib/useSnapshot';
import { restoreSnapshot } from '@/lib/snapshotUtils';

interface SnapshotViewerProps {
  snapshot: SnapshotData;
  onClose: () => void;
}

export function SnapshotViewer({ snapshot, onClose }: SnapshotViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleView = () => {
    setIsOpen(true);
  };
  
  return (
    <>
      <button
        onClick={handleView}
        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        View Snapshot
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-5/6 h-5/6 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Snapshot Viewer</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              <iframe
                srcDoc={restoreSnapshot(snapshot)}
                className="w-full h-full border-none"
                title="Snapshot Viewer"
              />
            </div>
            
            <div className="p-4 border-t">
              <p className="text-sm text-gray-600">
                Original: <a href={snapshot.originalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{snapshot.originalUrl}</a>
              </p>
              <p className="text-sm text-gray-600">
                Saved: {new Date(snapshot.createdAt).toLocaleString()}
              </p>
              {snapshot.waybackStatus?.archived && (
                <p className="text-sm text-green-600">
                  ✓ Archived on {snapshot.waybackStatus.timestamp}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

### Step 6: Update API Configuration

Ensure your Vercel/Firebase Functions are configured to handle the new snapshot endpoints:

**For Vercel Functions:**
- Place `api/snapshot.ts` in the `/api` directory
- Ensure `vercel.json` includes the following:

```json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 60
    }
  }
}
```

**For Firebase Functions:**
- Deploy using `firebase deploy --only functions`
- Ensure proper Node.js runtime version (18+)

## Testing the Integration

### Test 1: Create Snapshot
```typescript
import { useSnapshot } from '@/lib/useSnapshot';

function TestSnapshot() {
  const { createSnapshot } = useSnapshot();
  
  const test = async () => {
    const result = await createSnapshot(
      'test-clip-123',
      '<html><body>Test content</body></html>',
      'https://example.com'
    );
    console.log('Snapshot created:', result);
  };
  
  return <button onClick={test}>Test Create Snapshot</button>;
}
```

### Test 2: Verify Wayback Machine Integration
```typescript
import { checkWaybackMachine } from '@/lib/snapshotUtils';

async function testWayback() {
  const result = await checkWaybackMachine('https://example.com');
  console.log('Wayback status:', result);
}
```

### Test 3: PDF Export
```typescript
import { exportToPDF } from '@/lib/snapshotUtils';

function testPDFExport() {
  const element = document.getElementById('test-content');
  exportToPDF(element, 'test.pdf');
}
```

## Performance Considerations

### Snapshot Size Management
- Default HTML compression: 100KB limit
- Images compressed to JPEG at 0.8 quality
- CSS inlined when possible
- Metrics provided: original size, compressed size, savings percentage

### Database Efficiency
- Firestore document size: 1MB hard limit (enforced by rules)
- Large snapshots split across multiple documents if needed
- Indexes created automatically for user queries
- Consider archival/cleanup strategy for old snapshots

### Network Optimization
- Snapshots sent to Wayback Machine asynchronously (doesn't block creation)
- Gzip compression handled by browser/server automatically
- Image compression happens client-side when possible

## Security Best Practices

### Implemented in firestore.rules:
✅ User ownership verification on all read/write operations
✅ Server-side timestamp enforcement (prevents client tampering)
✅ Document size validation (1MB limit)
✅ Required field validation
✅ Type checking for all data
✅ Immutable document fields (userId, createdAt, clipId)

### Additional Recommendations:
1. Enable API key restrictions in Google Cloud Console
2. Regularly audit Firestore usage and costs
3. Implement rate limiting on snapshot creation (future phase)
4. Add content moderation if allowing public snapshots
5. Regular backup strategy for critical snapshots

## Troubleshooting

### Issue: "Snapshot size exceeds limit"
**Solution**: Snapshots are automatically truncated to 100KB. For longer content, consider splitting into multiple snapshots or storing images separately.

### Issue: "Wayback Machine submission failed"
**Solution**: Wayback Machine submissions are fire-and-forget. Check `waybackStatus` in response. Failures don't prevent snapshot creation.

### Issue: "Permission denied" errors
**Solution**: Ensure:
1. User is authenticated (Bearer token in Authorization header)
2. User owns the document being accessed
3. Firestore security rules are deployed (`firebase deploy --only firestore:rules`)

### Issue: PDF export shows blank page
**Solution**: Ensure all images in the element are CORS-enabled or base64 encoded.

## Next Steps (Phase 4)

After Phase 3 completion, Phase 4 will add:
- Full-text search with semantic embeddings
- Trending clips discovery system
- Collaborative collections and sharing
- Public clip embedding
- Comment threads and annotations

## Status

✅ **Phase 3 Complete**
- HTML snapshot extraction with compression
- Image optimization
- CSS preservation
- PDF export
- Wayback Machine integration
- Full Firestore security rules
- React hook for easy integration
- Comprehensive API endpoints

**Files Created**: 4 new files + updated configuration
**Lines of Code**: 1,310 lines of production code
**Security**: Enterprise-grade security rules
