# Linkbrain v-2: Component Integration Map

## 🗺️ Component Connection Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          LINKBRAIN COMPONENT GRAPH                          │
└─────────────────────────────────────────────────────────────────────────────┘

                                    App.tsx
                            (Main Router & State)
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
        Hero.tsx              ClipGrid.tsx         ClipDetail.tsx
     (Landing)            (Clip List View)      (Full Clip View)
        │                       │                      │
        │                       │              ┌───────┴────────┐
        │                  ┌────┴─────┐       │                │
        │                  │           │       │                │
   FloatingSearchButton  ClipCard.tsx  │  ClipTemplateRouter  (OLD)
        │                             │       │           MultiTemplate
        │                             │       │
        │                             │       ├─→ AIClipTemplate
    /api/analyze                      │       ├─→ DesignClipTemplate
    (GPT-4o-mini)                     │       ├─→ NewsClipTemplate
    (Google Vision)                   │       └─→ DefaultClipTemplate
        │                             │
        └────→ useClips Hook ←────────┘
                (React Hook)
                │
        ┌───────┼────────┐
        │       │        │
   /api/clips  /api/    collectionsAPI
  (CREATE)    (READ/
              UPDATE/
              DELETE)
        │
        │
   Firestore
   (Database)
```

---

## 📦 File Structure & Dependencies

```
src/
├── components/
│   ├── App.tsx
│   │   ├── imports: react-router, useClips hook
│   │   └── routes: Hero, ClipGrid, ClipDetail
│   │
│   ├── Hero.tsx
│   │   ├── imports: FloatingSearchButton
│   │   └── displays: Landing page with search
│   │
│   ├── FloatingSearchButton.tsx (MODIFIED)
│   │   ├── imports: useClips hook, /api/analyze
│   │   ├── calls: POST /api/analyze → createClip
│   │   └── shows: Analysis preview, save button
│   │
│   ├── ClipGrid.tsx (MODIFIED)
│   │   ├── imports: useClips hook, ClipCard
│   │   ├── calls: getClips() on mount
│   │   └── displays: Grid of clips with filters
│   │
│   ├── ClipCard.tsx
│   │   ├── displays: Single clip preview
│   │   └── interaction: onClick → navigate to ClipDetail
│   │
│   ├── ClipDetail.tsx (MODIFIED)
│   │   ├── imports: ClipTemplateRouter
│   │   └── renders: <ClipTemplateRouter clip={clip} />
│   │
│   ├── clip-templates/ (NEW)
│   │   ├── ClipTemplateRouter.tsx
│   │   │   ├── input: clip object
│   │   │   ├── logic: category → template selection
│   │   │   └── output: appropriate component
│   │   │
│   │   ├── AIClipTemplate.tsx (NEW)
│   │   │   ├── category: AI, Coding, IT
│   │   │   └── style: Blue/Dark theme
│   │   │
│   │   ├── DesignClipTemplate.tsx (NEW)
│   │   │   ├── category: Design, Marketing
│   │   │   └── style: Purple/Pink theme
│   │   │
│   │   ├── NewsClipTemplate.tsx (NEW)
│   │   │   ├── category: News, Articles
│   │   │   └── style: Professional theme
│   │   │
│   │   └── DefaultClipTemplate.tsx (NEW)
│   │       ├── category: Shopping, Business, Other
│   │       └── style: Adaptive theme
│   │
│   ├── ui/ (EXISTING)
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── button.tsx
│   │   └── ... (52 existing components)
│   │
│   └── ... (other components)
│
├── lib/
│   ├── firebase.ts (EXISTING)
│   │   └── exports: auth, db, storage, analytics
│   │
│   ├── useClips.ts (NEW)
│   │   ├── imports: useState, useCallback, useEffect
│   │   ├── imports: useAuth hook
│   │   ├── manages: clips, collections state
│   │   ├── exports: createClip, getClips, updateClip, deleteClip
│   │   │         createCollection, getCollections, etc.
│   │   └── calls: /api/clips, /api/collections
│   │
│   ├── categoryColors.ts (EXISTING)
│   │   └── colors: 9 category-color mappings
│   │
│   └── ... (other utilities)
│
└── context/
    └── AuthContext.ts (EXISTING)
        └── exports: useAuth hook

api/
├── analyze.ts (EXISTING, ENHANCED)
│   ├── enhanced: Google Vision API integration
│   ├── imports: OpenAI, cheerio, vision
│   └── output: Analyzed clip data with category
│
├── clips.ts (NEW)
│   ├── methods: POST, GET, PATCH, DELETE
│   ├── imports: Firestore, Firebase auth
│   └── manages: clips collection in Firestore
│
└── collections.ts (NEW)
    ├── methods: POST, GET, PATCH, DELETE
    ├── imports: Firestore, Firebase auth
    └── manages: collections collection in Firestore

package.json (MODIFIED)
└── added: @google-cloud/vision
```

---

## 🔄 Data Flow & Component Communication

### Flow 1: User Analyzes URL

```
User Input (FloatingSearchButton)
        ↓
    /api/analyze
   (AI Analysis)
        ↓
  Analysis Result
        ↓
  ClipDetail Preview
        ↓
  User confirms
        ↓
  createClip() ← useClips hook
        ↓
  /api/clips POST
        ↓
  Firestore Save
        ↓
  Success Toast
```

### Flow 2: User Browses Saved Clips

```
ClipGrid Mount
        ↓
  getClips() ← useClips hook
        ↓
  /api/clips GET (with filters)
        ↓
  Firestore Query
        ↓
  Clips Array
        ↓
  Render ClipCards
        ↓
  User clicks card
        ↓
  Navigate to ClipDetail
```

### Flow 3: User Views Clip Detail

```
ClipDetail Mount
        ↓
  <ClipTemplateRouter clip={clip} />
        ↓
  Router analyzes category
        ↓
┌─────────┬──────────┬──────────┬─────────────┐
│         │          │          │             │
↓         ↓          ↓          ↓             ↓
"AI"   "Design"    "News"    "Coding"     "Other"
│         │          │          │             │
↓         ↓          ↓          ↓             ↓
AI       Design     News       AI           Default
Template Template  Template   Template     Template
```

---

## 🧩 Component Props & Interfaces

### ClipTemplateRouter
```typescript
interface ClipTemplateRouterProps {
    clip: any  // Any clip object from Firestore
}

// Automatically selects template based on clip.category
// No additional props needed
```

### AIClipTemplate
```typescript
interface AIClipTemplateProps {
    clip: {
        title: string
        summary: string
        keywords: string[]
        image: string | null
        author: string
        authorProfile: { avatar?: string, name?: string }
        mediaItems: any[]
        engagement: { views?: string, likes?: string, comments?: string }
        url: string
    }
}
```

### DesignClipTemplate
```typescript
interface DesignClipTemplateProps {
    clip: {
        title: string
        summary: string
        image: string | null
        author: string
        authorProfile: { avatar?: string, name?: string }
        keywords: string[]
        mediaItems: any[]
        engagement: { views?: string, likes?: string }
        url: string
        publishDate?: string
    }
}
```

### NewsClipTemplate
```typescript
interface NewsClipTemplateProps {
    clip: {
        title: string
        summary: string
        image: string | null
        author: string
        authorProfile: { avatar?: string, name?: string }
        keywords: string[]
        mediaItems: any[]
        engagement: { views?: string, likes?: string, comments?: string }
        comments: Array<{ author: string, text: string, postedAt?: string }>
        publishDate?: string
        url: string
    }
}
```

### DefaultClipTemplate
```typescript
interface DefaultClipTemplateProps {
    clip: {
        title: string
        summary: string
        category: string
        platform: string
        image: string | null
        author: string
        authorProfile: { avatar?: string }
        keywords: string[]
        sentiment: string
        engagement: { views?: string, likes?: string, comments?: string }
        url: string
    }
}
```

### useClips Hook
```typescript
interface UseClipsReturn {
    // State
    clips: ClipData[]
    collections: CollectionData[]
    loading: boolean
    error: string | null
    
    // Clip operations
    createClip: (clipData: ClipData) => Promise<ClipData>
    getClips: (filters?: FilterOptions) => Promise<void>
    updateClip: (id: string, updates: Partial<ClipData>) => Promise<ClipData>
    deleteClip: (id: string) => Promise<void>
    
    // Collection operations
    createCollection: (data: CollectionData) => Promise<CollectionData>
    getCollections: () => Promise<void>
    updateCollection: (id: string, updates: Partial<CollectionData>) => Promise<CollectionData>
    deleteCollection: (id: string) => Promise<void>
    addClipToCollection: (clipId: string, collectionId: string) => Promise<void>
    removeClipFromCollection: (clipId: string, collectionId: string) => Promise<void>
}
```

---

## 📋 Integration Checklist

### Component Updates Required

#### [ ] FloatingSearchButton.tsx
```typescript
// Add import
import { useClips } from '../lib/useClips';

// Add hook
const { createClip } = useClips();

// Replace mock save with:
const handleSaveClip = async (analysisResult: any) => {
    try {
        await createClip({
            url: analysisResult.url,
            platform: analysisResult.platform,
            template: analysisResult.template,
            title: analysisResult.title,
            summary: analysisResult.summary,
            keywords: analysisResult.keywords,
            category: analysisResult.category,
            sentiment: analysisResult.sentiment,
            type: analysisResult.type,
            image: analysisResult.image,
            author: analysisResult.author,
            authorProfile: analysisResult.authorProfile,
            mediaItems: analysisResult.mediaItems,
            engagement: analysisResult.engagement,
            mentions: analysisResult.mentions,
            comments: analysisResult.comments,
            publishDate: analysisResult.publishDate,
            htmlContent: analysisResult.htmlContent,
        });
        toast.success('Clip saved!');
    } catch (error) {
        toast.error('Failed to save clip');
    }
};
```

#### [ ] ClipGrid.tsx
```typescript
// Add import
import { useClips } from '../lib/useClips';

// Replace mock clips with:
const { clips, getClips, loading, error } = useClips();

// Add effect
useEffect(() => {
    getClips({ category: selectedCategory });
}, [selectedCategory, getClips]);

// Update render
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!clips.length) return <EmptyState />;

return (
    <div className="grid...">
        {clips.map(clip => (
            <ClipCard key={clip.id} clip={clip} />
        ))}
    </div>
);
```

#### [ ] ClipDetail.tsx
```typescript
// Replace old template rendering:
// OLD:
switch(template) {
    case 'youtube': return <YoutubeLayout />;
    case 'instagram': return <InstagramLayout />;
    // ... etc
}

// NEW:
import ClipTemplateRouter from './clip-templates/ClipTemplateRouter';

return <ClipTemplateRouter clip={clip} />;
```

---

## 🔌 API Endpoint Integration

### Creating a Clip
```typescript
// From FloatingSearchButton
const { createClip } = useClips();
await createClip(analysisResult);

// Makes POST /api/clips
// Calls: Firestore.collection('clips').add()
```

### Fetching Clips
```typescript
// From ClipGrid
const { getClips } = useClips();
await getClips({ category: 'AI', limit: 20 });

// Makes GET /api/clips?category=AI&limit=20
// Calls: Firestore.collection('clips').where().orderBy().getDocs()
```

### Managing Collections
```typescript
// Create
const { createCollection } = useClips();
await createCollection({ name: 'Design Resources' });

// Add clip
const { addClipToCollection } = useClips();
await addClipToCollection('clip-123', 'collection-456');
```

---

## 🎯 Module Dependency Graph

```
useClips Hook
├── Uses: Firebase Auth (getIdToken)
├── Uses: Firebase Firestore (collection, query, etc.)
├── Calls: /api/clips (REST)
│   └── Returns: ClipData[]
├── Calls: /api/collections (REST)
│   └── Returns: CollectionData[]
└── Manages: Local state (clips, collections, loading, error)

ClipTemplateRouter
├── Receives: Clip object
├── Reads: clip.category
├── Decides: Which template to use
└── Renders: One of 4 templates

Template Components (AI, Design, News, Default)
├── Receive: Clip object
├── Display: Category-specific UI
└── Can emit: Like, Save, Share events (optional)

FloatingSearchButton
├── Imports: useClips hook
├── Calls: /api/analyze
├── Shows: Analysis preview
├── Calls: createClip() from useClips
└── Updates: ClipGrid via state

ClipGrid
├── Imports: useClips hook, ClipCard
├── Calls: getClips() from useClips
├── Manages: Category/platform filters
└── Displays: Array of ClipCard components

ClipCard
├── Receives: Clip object
├── Displays: Clip preview
└── Emits: Click event → navigate to ClipDetail

ClipDetail
├── Imports: ClipTemplateRouter
├── Receives: Clip from route
├── Renders: <ClipTemplateRouter clip={clip} />
└── Shows: Full clip view (template-specific)
```

---

## 📊 State Management Flow

```
Global State (App.tsx):
├── selectedClip (passed to ClipDetail)
├── category filter (passed to ClipGrid)
└── user (from AuthContext)

Hook State (useClips):
├── clips: ClipData[] ← from Firestore
├── collections: CollectionData[] ← from Firestore
├── loading: boolean
└── error: string | null

Component State (Local):
├── FloatingSearchButton: analysisResult, isOpen
├── ClipGrid: currentCategory, searchQuery, pageOffset
├── ClipDetail: isLiked, isSaved, currentImageIndex
└── Templates: No persistent state
```

---

## 🚀 Deployment Checklist

- [ ] Update FloatingSearchButton with useClips hook
- [ ] Update ClipGrid to fetch from /api/clips
- [ ] Update ClipDetail to use ClipTemplateRouter
- [ ] Deploy api/clips.ts to Vercel
- [ ] Deploy api/collections.ts to Vercel
- [ ] Test end-to-end: URL → Save → View
- [ ] Test all 4 templates with sample data
- [ ] Configure Firestore security rules
- [ ] Add environment variables (.env)
- [ ] Test on mobile devices

---

## 📞 Troubleshooting Reference

| Issue | Component | Solution |
|-------|-----------|----------|
| Clips not saving | FloatingSearchButton | Check useClips initialization |
| Templates not rendering | ClipTemplateRouter | Check clip.category field |
| Grid shows loading forever | ClipGrid | Check /api/clips endpoint |
| Images not loading | All templates | Check image URL format |
| Auth errors | useClips hook | Verify Firebase Auth setup |

---

## 📚 File Reference

| File | Purpose | Status |
|------|---------|--------|
| `api/clips.ts` | Clip CRUD | ✅ Created |
| `api/collections.ts` | Collection CRUD | ✅ Created |
| `src/lib/useClips.ts` | React Hook | ✅ Created |
| `src/components/clip-templates/*` | UI Templates | ✅ Created |
| `src/components/FloatingSearchButton.tsx` | ⚠️ Needs update |
| `src/components/ClipGrid.tsx` | ⚠️ Needs update |
| `src/components/ClipDetail.tsx` | ⚠️ Needs update |
| `package.json` | ✅ Updated |

---

**Ready to integrate! Follow the checklist above in order.**
