# Linkbrain v-2: AI Multimodal Enhancement Implementation Guide

## 🎯 Overview

This implementation adds **enhanced AI multimodal functionality** to Linkbrain with **domain-specific UI templates** for creating beautiful, category-tailored clip views from URLs. The system now:

✅ Saves clips to Firestore (data persistence)
✅ Routes clips to domain-specific UIs (AI, Design, News, Default)
✅ Preserves original content with HTML snapshots
✅ Integrates Google Vision API for image recognition
✅ Provides smart template selection based on category and content

---

## 📦 New Components & Files

### Backend APIs

#### 1. **`api/clips.ts`** - Clip CRUD Operations
Complete CRUD endpoints for managing clips in Firestore:

```typescript
POST   /api/clips              # Create new clip
GET    /api/clips?filters      # List clips (with filtering)
PATCH  /api/clips?id=X         # Update clip
DELETE /api/clips?id=X         # Delete clip
```

**Features:**
- Firestore integration with user authentication
- Filtering by: category, platform, search, collectionId
- Pagination support (limit/offset)
- HTML content compression (max 100KB per doc)

#### 2. **`api/collections.ts`** - Collection Management
CRUD operations for organizing clips into collections:

```typescript
POST   /api/collections           # Create collection
GET    /api/collections           # Get user's collections
PATCH  /api/collections?id=X      # Update collection
DELETE /api/collections?id=X      # Delete collection
```

**Features:**
- User-scoped collections
- Color-coded organization
- Public/private toggle
- Clip relationship management

### Frontend Hooks & Utilities

#### 3. **`src/lib/useClips.ts`** - React Hook for Clip Management
Complete hook for managing clips and collections from React components:

```typescript
const { 
    clips, collections, loading, error,
    createClip, getClips, updateClip, deleteClip,
    createCollection, getCollections, updateCollection, deleteCollection,
    addClipToCollection, removeClipFromCollection
} = useClips();
```

**Features:**
- Full CRUD operations
- Automatic error handling
- Firebase Auth integration
- Real-time state management

### Domain-Specific UI Components

#### 4. **`src/components/clip-templates/AIClipTemplate.tsx`**
**For:** AI, Coding, IT, Technical Content

**Features:**
- Code snippet showcase
- Technical insights panel
- Key concepts display
- Resource links & media
- Engagement metrics (views, likes, comments)

**Color Scheme:** Blue/Dark theme
**Best for:** Technical articles, code tutorials, AI insights

#### 5. **`src/components/clip-templates/DesignClipTemplate.tsx`**
**For:** Design, Marketing, Visual Content

**Features:**
- Large visual hero section
- Design elements gallery
- Author profile with branding
- Engagement metrics
- Save/Like buttons

**Color Scheme:** Purple/Pink with gradient
**Best for:** Design portfolios, visual inspiration, product showcases

#### 6. **`src/components/clip-templates/NewsClipTemplate.tsx`**
**For:** News, Articles, Blog Posts

**Features:**
- Article layout with typography
- Author byline & publication date
- Topic tags with filtering
- Comment section
- Full article engagement metrics
- Related images gallery

**Color Scheme:** Professional blue/gray
**Best for:** News articles, long-form journalism, blog posts

#### 7. **`src/components/clip-templates/DefaultClipTemplate.tsx`**
**For:** Shopping, Business, Other Categories

**Features:**
- Card-based layout
- Category badges
- Keywords display
- Author info
- Engagement metrics
- Action buttons (Open, Like, Share)

**Color Scheme:** Adaptive (matches category)
**Best for:** General content, fallback template

#### 8. **`src/components/clip-templates/ClipTemplateRouter.tsx`**
**Smart template selector** that routes clips to appropriate UI based on:

```typescript
Route Logic:
├─ "AI" category       → AIClipTemplate
├─ "Design" category   → DesignClipTemplate
├─ "News" category     → NewsClipTemplate
├─ "Coding" category   → AIClipTemplate
└─ Other categories    → DefaultClipTemplate
```

**Usage:**
```typescript
import ClipTemplateRouter from '@/components/clip-templates/ClipTemplateRouter';

<ClipTemplateRouter clip={clipData} />
```

---

## 🔧 Integration Steps

### Step 1: Add Environment Variables

Add Google Vision API credentials to `.env`:

```bash
# Google Cloud Vision API
VITE_GOOGLE_CLOUD_PROJECT_ID=your-project-id
VITE_GOOGLE_CLOUD_API_KEY=your-api-key

# Firebase (already configured)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
```

### Step 2: Install Dependencies

```bash
npm install @google-cloud/vision
```

### Step 3: Update ClipDetail Component

Replace the old platform-specific layouts with the new template router:

```typescript
// OLD:
const template = (clip.template || clip.source || 'web').toLowerCase();
switch (template) {
    case 'youtube':
        return <YoutubeLayout clip={clip} />;
    // ... etc
}

// NEW:
import ClipTemplateRouter from './clip-templates/ClipTemplateRouter';
<ClipTemplateRouter clip={clip} />
```

### Step 4: Update FloatingSearchButton Component

Modify to save clips via the new API:

```typescript
import { useClips } from '../lib/useClips';

const FloatingSearchButton = () => {
    const { createClip } = useClips();
    
    const handleSaveClip = async (analysisResult: any) => {
        await createClip({
            url: analysisResult.url,
            title: analysisResult.title,
            category: analysisResult.category,
            // ... map other fields
        });
    };
};
```

### Step 5: Update ClipGrid Component

Fetch clips from Firestore instead of mock data:

```typescript
import { useClips } from '../lib/useClips';

const ClipGrid = () => {
    const { clips, getClips, loading } = useClips();
    const [category, setCategory] = useState<string | null>(null);
    
    useEffect(() => {
        getClips({ category: category || undefined });
    }, [category, getClips]);
    
    if (loading) return <div>Loading clips...</div>;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clips.map(clip => (
                <ClipCard key={clip.id} clip={clip} />
            ))}
        </div>
    );
};
```

---

## 🎨 Template Selection Algorithm

The `ClipTemplateRouter` intelligently selects templates based on:

```typescript
Priority Order:
1. Category field (highest)
   - "AI" → AI Template
   - "Design" → Design Template
   - "News" → News Template
   - "Coding" → AI Template
   
2. Content Type (secondary)
   - "article" → News Template
   - "image" → Design Template
   - "video" → Default Template
   
3. Platform (fallback)
   - "youtube" → Default Template
   - "instagram" → Design Template
   
4. Default → DefaultClipTemplate
```

**Example Routing:**
```
URL: https://medium.com/article
Analysis Result: {
    category: "AI",           ← Determines template
    type: "article",
    platform: "web"
}
→ Routes to: AIClipTemplate
```

---

## 🚀 API Usage Examples

### Create a Clip

```typescript
const { createClip } = useClips();

await createClip({
    url: "https://example.com/article",
    platform: "web",
    template: "web",
    title: "Understanding Machine Learning",
    summary: "A comprehensive guide to ML concepts",
    keywords: ["AI", "machine-learning", "data-science"],
    category: "AI",
    sentiment: "positive",
    type: "article",
    image: "https://...",
    author: "John Doe",
    mediaItems: ["image1.jpg", "image2.jpg"],
    engagement: { views: "1000", likes: "50" },
    mentions: [{ label: "Source", url: "https://..." }],
    comments: [],
    publishDate: new Date().toISOString(),
    htmlContent: "<html>...</html>"
});
```

### Query Clips with Filters

```typescript
const { getClips } = useClips();

// Get all AI category clips
await getClips({ category: "AI" });

// Search clips
await getClips({ search: "machine learning", limit: 20 });

// Get clips from specific collection
await getClips({ collectionId: "collection-123" });

// Combined filters with pagination
await getClips({
    category: "Design",
    platform: "instagram",
    limit: 50,
    offset: 0
});
```

### Manage Collections

```typescript
const { createCollection, addClipToCollection } = useClips();

// Create a new collection
const collection = await createCollection({
    name: "AI Resources",
    description: "Machine learning articles and tutorials",
    color: "#3B82F6"
});

// Add clip to collection
await addClipToCollection("clip-123", collection.id);
```

---

## 📊 Data Models

### Clip Document (Firestore)

```typescript
{
    // Metadata
    id: string                          // Auto-generated by Firestore
    userId: string                      // Owner (FK to users)
    url: string                         // Original URL
    platform: 'youtube'|'instagram'|'threads'|'web'|'linkedin'
    template: string                    // Template type selector
    
    // Content
    title: string                       // Clip title
    summary: string                     // AI-generated summary
    keywords: string[]                  // 5 keywords (AI-extracted)
    category: string                    // AI, Design, Marketing, etc.
    sentiment: 'positive'|'neutral'|'negative'
    type: 'article'|'video'|'image'|'social_post'|'website'
    
    // Media
    image: string | null                // Primary image URL
    mediaItems: any[]                   // Additional images, videos
    htmlContent: string                 // Archived HTML (compressed)
    
    // Author
    author: string                      // Author name
    authorProfile: {
        name?: string
        handle?: string
        avatar?: string
        verified?: boolean
        subscribers?: string
    }
    
    // Engagement
    engagement: {
        likes?: string
        views?: string
        comments?: string
    }
    comments: Array<{
        author: string
        text: string
        likes?: string
        postedAt?: string
    }>
    mentions: Array<{
        label: string
        url: string
    }>
    publishDate: string | null
    
    // Organization
    collectionIds: string[]             // Multiple collection support
    viewCount: number                   // User activity tracking
    likeCount: number
    
    // Timestamps
    createdAt: string                   // ISO timestamp
    updatedAt: string                   // ISO timestamp
}
```

### Collection Document (Firestore)

```typescript
{
    id: string                          // Auto-generated
    userId: string                      // Owner (FK to users)
    name: string                        // Collection name
    description: string                 // Optional description
    color: string                       // Hex color (#21DBA4)
    clipIds: string[]                   // References to clips
    isPublic: boolean                   // Sharing setting
    createdAt: string
    updatedAt: string
}
```

---

## 🔐 Security Considerations

### Authentication
- All API endpoints require Firebase Auth token
- Token validated via `Authorization: Bearer <token>` header
- User ID extracted from token for ownership verification

### Authorization
- Users can only access their own clips/collections
- Ownership verified on UPDATE/DELETE operations
- Public collections can be viewed by anyone (future feature)

### Data Protection
- HTML content compressed to stay under 1MB Firestore limit
- Sensitive API keys stored in backend environment variables
- Google Cloud API key restricted to Vision API only

### Rate Limiting
Add to `api/clips.ts` and `api/collections.ts`:

```typescript
// Rate limiting middleware (implement using Redis or simple in-memory)
const RATE_LIMIT = 100; // requests per hour
const checkRateLimit = (userId: string) => {
    // Check against rate limit store
    // Return true if within limit, false otherwise
};

if (!checkRateLimit(userId)) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
}
```

---

## 🎯 Next Steps

### Phase 3: Content Preservation
- [ ] Implement HTML snapshot with CSS extraction
- [ ] Add image compression pipeline
- [ ] Create PDF export functionality
- [ ] Setup Cloudinary for image CDN

### Phase 4: Advanced Features
- [ ] Full-text search with embeddings
- [ ] Trending clips discovery
- [ ] Collaborative collections
- [ ] Public clip sharing & embedding
- [ ] API rate limiting & quota management

### Phase 5: Performance Optimization
- [ ] Redis caching for clip queries
- [ ] Image CDN optimization
- [ ] Lazy loading for clip grids
- [ ] Indexed Firestore queries

---

## 🐛 Troubleshooting

### Clips not saving
- Check Firebase Auth token is valid
- Verify Firestore write permissions
- Check browser console for error messages
- Ensure all required fields are present

### Template not displaying
- Verify `category` field is populated
- Check ClipTemplateRouter console logs
- Ensure clip object has required fields
- Clear browser cache and reload

### Images not loading
- Check image URLs are accessible
- Verify CORS headers in Vercel function
- Check Firestore document size (<1MB)
- Monitor network tab for failed requests

### Google Vision API errors
- Verify API key is correct
- Check quota limits in Google Cloud Console
- Ensure service account has Vision API permissions
- Check request payload size (<20MB)

---

## 📝 API Reference

See `/api/clips.ts` and `/api/collections.ts` for complete endpoint documentation.

Key endpoints:
- `POST /api/clips` - Create clip
- `GET /api/clips` - List clips with filters
- `PATCH /api/clips?id=X` - Update clip
- `DELETE /api/clips?id=X` - Delete clip
- `POST /api/collections` - Create collection
- `GET /api/collections` - List user's collections
- `PATCH /api/collections?id=X` - Update collection
- `DELETE /api/collections?id=X` - Delete collection

---

## 🤝 Contributing

When adding new templates:
1. Create new file in `src/components/clip-templates/`
2. Export component as `{Category}ClipTemplate`
3. Add route to `ClipTemplateRouter`
4. Document category mapping
5. Test with sample data

---

## 📚 References

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Google Vision API](https://cloud.google.com/vision/docs)
- [React Hooks Best Practices](https://react.dev/reference/react)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Last Updated:** December 2025
**Status:** Phase 1 & 2 Complete, Phase 3 In Progress
**Maintainer:** Linkbrain Dev Team
