# Linkbrain v-2: Deployment & Testing Checklist

## Pre-Deployment Verification

### ✅ Code Quality
- [ ] Run TypeScript compiler: `npx tsc --noEmit`
- [ ] No TypeScript errors in console
- [ ] All imports resolve correctly
- [ ] No console.error or console.warn in production code
- [ ] Code follows project conventions

### ✅ Firebase Setup
- [ ] Firebase project created and configured
- [ ] Firestore database initialized
- [ ] Firebase Authentication enabled
- [ ] Service account key downloaded for backend
- [ ] Google Cloud Vision API enabled in project

### ✅ Environment Configuration
- [ ] `.env.local` created with all required variables:
  ```
  VITE_FIREBASE_API_KEY=xxx
  VITE_FIREBASE_AUTH_DOMAIN=xxx
  VITE_FIREBASE_PROJECT_ID=xxx
  VITE_FIREBASE_STORAGE_BUCKET=xxx
  VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
  VITE_FIREBASE_APP_ID=xxx
  ```
- [ ] `.env.production` configured for production
- [ ] No secrets committed to git
- [ ] Environment variables working locally

### ✅ Security Rules
- [ ] Firestore rules file reviewed: `firestore.rules`
- [ ] All collections properly protected
- [ ] User ownership verified on all operations
- [ ] Data validation enforced
- [ ] Rules deployed: `firebase deploy --only firestore:rules`

### ✅ API Endpoints
- [ ] All 10 endpoints implemented and tested
- [ ] CORS headers properly configured
- [ ] Authentication token verification working
- [ ] Error responses formatted consistently
- [ ] Pagination working correctly

---

## Component Integration Testing

### ✅ FloatingSearchButton Integration
**File**: `src/components/FloatingSearchButton.tsx`

- [ ] Imports useClips and useSnapshot hooks
- [ ] Form validates input correctly
- [ ] Creates clip in Firestore on submit
- [ ] Creates snapshot if HTML content provided
- [ ] Displays success/error messages
- [ ] Button disabled while loading
- [ ] Form resets after successful creation
- [ ] Error handling prevents app crash

**Test Steps**:
1. Open app and locate floating button
2. Click to open form
3. Enter clip data (title, URL, category)
4. Click "Create Clip"
5. Verify clip appears in ClipGrid
6. Verify data in Firestore console

### ✅ ClipGrid Integration
**File**: `src/components/ClipGrid.tsx`

- [ ] Imports useClips hook and ClipTemplateRouter
- [ ] Fetches clips from API on mount
- [ ] Displays loading state while fetching
- [ ] Shows error message if fetch fails
- [ ] Renders empty state if no clips
- [ ] ClipTemplateRouter selects correct template
- [ ] Pagination controls work correctly
- [ ] Filters (category, search) work correctly
- [ ] Clips update when filters change

**Test Steps**:
1. Navigate to ClipGrid page
2. Verify clips load from API (not mock data)
3. Test category filter
4. Test search functionality
5. Test pagination
6. Create new clip and verify it appears
7. Delete clip and verify it disappears

### ✅ ClipDetail Integration
**File**: `src/components/ClipDetail.tsx`

- [ ] Imports useClips and useSnapshot hooks
- [ ] Displays clip using ClipTemplateRouter
- [ ] "Save Snapshot" button works
- [ ] "Export PDF" button works
- [ ] Snapshots list displays correctly
- [ ] View snapshot opens in modal
- [ ] Delete snapshot removes it
- [ ] Wayback Machine status displays
- [ ] Open Original link works

**Test Steps**:
1. Click on any clip to open detail
2. Verify correct template is used
3. Click "Save Snapshot" and verify it saves
4. Click "Show Snapshots" and verify list
5. Click "View" on snapshot and verify modal
6. Test "Export PDF" button
7. Check Wayback Machine link if available
8. Click "Open Original" to verify URL

### ✅ Template Router
**File**: `src/components/clip-templates/ClipTemplateRouter.tsx`

- [ ] AI/Coding clips use AIClipTemplate
- [ ] Design clips use DesignClipTemplate
- [ ] News clips use NewsClipTemplate
- [ ] Other categories use DefaultClipTemplate
- [ ] Fallback works if category missing
- [ ] All templates render without errors
- [ ] No visual glitches or layout issues

**Test Steps**:
1. Create clips in each category:
   - AI (should use AIClipTemplate)
   - Design (should use DesignClipTemplate)
   - News (should use NewsClipTemplate)
   - Shopping (should use DefaultClipTemplate)
2. Verify correct template renders for each
3. Check colors match expected theme
4. Test on mobile and desktop

---

## API Testing

### ✅ Clips API (`/api/clips`)

#### POST - Create Clip
```bash
curl -X POST http://localhost:3000/api/clips \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Clip",
    "url": "https://example.com",
    "category": "AI",
    "description": "Test description"
  }'
```
- [ ] Returns 201 Created
- [ ] Returns clipId
- [ ] Clip stored in Firestore
- [ ] Unauthorized request rejected (401)

#### GET - List Clips
```bash
curl http://localhost:3000/api/clips?category=AI \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Returns 200 OK
- [ ] Returns array of clips
- [ ] Filters work (category, search, etc.)
- [ ] Pagination works (limit, offset)
- [ ] Only user's clips returned

#### PATCH - Update Clip
```bash
curl -X PATCH http://localhost:3000/api/clips?id=CLIP_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'
```
- [ ] Returns 200 OK
- [ ] Clip updated in Firestore
- [ ] User ownership verified
- [ ] Unauthorized updates rejected

#### DELETE - Delete Clip
```bash
curl -X DELETE http://localhost:3000/api/clips?id=CLIP_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Returns 200 OK
- [ ] Clip deleted from Firestore
- [ ] User ownership verified
- [ ] Unauthorized deletes rejected

### ✅ Collections API (`/api/collections`)

- [ ] POST creates collection for user
- [ ] GET lists user's collections
- [ ] PATCH updates collection
- [ ] DELETE removes collection
- [ ] All endpoints require authentication
- [ ] User ownership verified

### ✅ Snapshots API (`/api/snapshot`)

#### POST - Create Snapshot
```bash
curl -X POST http://localhost:3000/api/snapshot \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clipId": "clip-123",
    "htmlContent": "<html>...</html>",
    "url": "https://example.com",
    "preserveWayback": true
  }'
```
- [ ] Returns 201 Created
- [ ] Returns snapshotId
- [ ] HTML compressed correctly
- [ ] Wayback Machine checked/submitted
- [ ] Stored in Firestore

#### GET - Retrieve Snapshot
```bash
curl http://localhost:3000/api/snapshot?snapshotId=SNAPSHOT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Returns 200 OK
- [ ] Returns snapshot data
- [ ] User ownership verified
- [ ] Unauthorized access rejected (403)

#### DELETE - Delete Snapshot
- [ ] Returns 200 OK
- [ ] Snapshot deleted from Firestore
- [ ] User ownership verified

---

## Security Testing

### ✅ Authentication
- [ ] Unauthenticated requests rejected with 401
- [ ] Invalid tokens rejected with 401
- [ ] Expired tokens rejected with 401
- [ ] User ID extracted correctly from token
- [ ] Different users see only their data

### ✅ Authorization
- [ ] Users cannot modify other users' clips (403)
- [ ] Users cannot delete other users' collections (403)
- [ ] Users cannot view other users' snapshots (403)
- [ ] Ownership verified on updates
- [ ] Ownership verified on deletes

### ✅ Data Validation
- [ ] Required fields enforced
- [ ] Field type validation works
- [ ] Field size limits enforced
- [ ] URL validation working
- [ ] HTML size limits enforced (100KB)
- [ ] Snapshot size limit enforced (1MB)

### ✅ Firestore Rules
- [ ] Anonymous users cannot read any data
- [ ] Authenticated users can only read own clips
- [ ] Authenticated users can only read own collections
- [ ] Authenticated users can only read own snapshots
- [ ] Server timestamps enforced (not client)
- [ ] Immutable fields (userId, createdAt) cannot be modified

---

## Performance Testing

### ✅ Load Testing
- [ ] App loads in <3 seconds
- [ ] First clip fetches in <500ms
- [ ] Clip detail renders in <1 second
- [ ] Snapshot creation completes in <5 seconds
- [ ] PDF export completes in <10 seconds

### ✅ Database Performance
- [ ] Clip list query returns in <500ms
- [ ] Filter queries optimized with indexes
- [ ] Pagination prevents loading too much data
- [ ] Large snapshots compress correctly

### ✅ Memory & CPU
- [ ] No memory leaks on component unmount
- [ ] Image compression doesn't freeze UI
- [ ] PDF generation non-blocking
- [ ] Wayback submission async (doesn't block)

---

## Browser Compatibility Testing

### ✅ Desktop Browsers
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### ✅ Mobile Browsers
- [ ] iOS Safari
- [ ] Chrome Mobile
- [ ] Samsung Internet

### ✅ Features Tested
- [ ] Layout responsive at all breakpoints
- [ ] Touch events work on mobile
- [ ] File uploads work
- [ ] PDF export works
- [ ] Modals/dialogs functional
- [ ] Form validation working

---

## Accessibility Testing

### ✅ WCAG 2.1 AA Compliance
- [ ] Color contrast sufficient (4.5:1 for text)
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Form labels present
- [ ] Error messages accessible
- [ ] Focus indicators visible

### ✅ Keyboard Navigation
- [ ] Tab through all buttons
- [ ] Enter activates buttons
- [ ] Escape closes modals
- [ ] Arrow keys for navigation
- [ ] Alt+key shortcuts working

---

## Data Integrity Testing

### ✅ Data Consistency
- [ ] Creating clip creates in Firestore
- [ ] Updating clip syncs to database
- [ ] Deleting clip removes from database
- [ ] No orphaned documents
- [ ] References maintain integrity

### ✅ Data Backup
- [ ] Firestore automatic backups enabled
- [ ] Snapshots archived to Wayback Machine
- [ ] No single point of failure
- [ ] Recovery plan documented

---

## Documentation Testing

### ✅ Guides Completeness
- [ ] LINKBRAIN_IMPLEMENTATION_GUIDE.md is accurate
- [ ] QUICK_START_IMPLEMENTATION.md works end-to-end
- [ ] PHASE_3_COMPLETION_GUIDE.md covers all features
- [ ] COMPONENT_UPDATE_GUIDE.md has correct code
- [ ] All code examples work without modification

### ✅ Comments & Clarity
- [ ] Code comments are helpful
- [ ] Function signatures documented
- [ ] Return types documented
- [ ] Error cases explained
- [ ] Usage examples provided

---

## Production Deployment Steps

### 1. Pre-Deployment (Development)
- [ ] All tests pass
- [ ] Security audit complete
- [ ] Performance baselines established
- [ ] Backup strategy verified

### 2. Staging Deployment
```bash
# Build project
npm run build

# Test build locally
npm run preview

# Deploy to staging environment
firebase deploy --project staging
```
- [ ] Build completes without errors
- [ ] Preview runs without issues
- [ ] All features work in staging
- [ ] Performance metrics acceptable

### 3. Production Deployment
```bash
# Deploy security rules
firebase deploy --only firestore:rules --project production

# Deploy functions (if using Firebase Functions)
firebase deploy --only functions --project production

# Deploy app (Vercel)
vercel deploy --prod
```
- [ ] Security rules deployed first
- [ ] Functions deployed and tested
- [ ] App deployed and verified
- [ ] Rollback plan ready

### 4. Post-Deployment Verification
- [ ] App loads in production
- [ ] Authentication works
- [ ] Creating clips works end-to-end
- [ ] Snapshots create and save
- [ ] All templates render correctly
- [ ] No JavaScript errors in console
- [ ] Firestore reads and writes working
- [ ] API endpoints responding

---

## Monitoring & Health Checks

### ✅ Ongoing Monitoring
- [ ] Set up error tracking (Sentry/LogRocket)
- [ ] Configure performance monitoring
- [ ] Set up Firestore usage alerts
- [ ] Monitor API response times
- [ ] Track user engagement metrics

### ✅ Health Checks
```bash
# Automated health check script
curl http://app.com/api/health
# Should return 200 OK with status info
```

### ✅ Alerting
- [ ] Alert on API errors (>5% error rate)
- [ ] Alert on slow responses (>1s)
- [ ] Alert on database quota exceeded
- [ ] Alert on failed deployments

---

## Rollback Plan

If issues occur in production:

### Immediate Actions
1. Check error logs and monitoring
2. Identify affected component/API
3. Decide if rollback needed

### Rollback Steps
```bash
# View deployment history
firebase history

# Rollback to previous version
firebase deploy --project production --only firestore:rules

# For Vercel app
vercel rollback --prod

# Verify rollback
curl http://app.com/api/health
```

### Communication
- [ ] Notify team of issue
- [ ] Update status page
- [ ] Document root cause
- [ ] Post-mortem meeting

---

## Sign-Off Checklist

- [ ] Project Lead: Code review complete
- [ ] QA Lead: All tests passed
- [ ] Security: Security audit passed
- [ ] DevOps: Deployment procedure verified
- [ ] Product: Feature validation complete
- [ ] Documentation: All guides reviewed

**Project Lead Signature**: _________________ **Date**: _______

**QA Lead Signature**: _________________ **Date**: _______

**Security Lead Signature**: _________________ **Date**: _______

---

## Final Status

✅ **Ready for Deployment** (upon completion of all checks above)

**Deployment Date**: _________________
**Deployed By**: _________________
**Verified By**: _________________

---

*Linkbrain v-2 Deployment & Testing Checklist*
*Last Updated: December 2, 2025*
