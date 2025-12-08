# Linkbrain v-2 개발 진행 상황

**마지막 업데이트:** 2025-12-08

## 📋 프로젝트 개요

Linkbrain v-2는 URL과 웹 콘텐츠를 아카이브하고 AI로 메타데이터를 생성하는 "Second Brain" 애플리케이션입니다.

**주요 기능:**
- URL 기반 콘텐츠 자동 아카이빙
- 서버 측 DOM 렌더링 (Jina Reader)
- 브라우저 확장/북마클릿 지원
- AI 메타데이터 생성 (OpenAI GPT-4o-mini)
- Firebase/Firestore 기반 데이터 저장
- 다양한 플랫폼 지원 (Instagram, Threads, YouTube, 일반 웹)

## 🚀 현재 상태 (2025-12-08)

### ✅ 완료된 작업

#### 1. UI 개선 및 버그 수정
- [x] 체크박스 위치 수정 (왼쪽 상단 → 오른쪽 상단)
- [x] 카테고리 칩과 체크박스 겹침 해결
- [x] ClipDetail 제목 표시 개선 (line-clamp-2, 30자 제한 제거)
- [x] **모바일 선택 삭제 기능 추가** (2025-12-07)
  - 모바일/데스크톱 필터 레이아웃 완전 분리
  - 모바일: 필터(왼쪽) + 선택 버튼(오른쪽 정렬)
  - 데스크톱: 기존 레이아웃 유지
  - 모바일 하단 고정 액션 바 (취소/전체선택/삭제)
- [x] **모바일 ClipDetail 반응형 최적화** (2025-12-07)
  - Threads/Instagram 레이아웃을 YouTube 스타일로 통일 (`flex flex-col gap-4`, `p-6`)
  - overflow-hidden 추가로 콘텐츠 넘침 방지
  - URL 및 텍스트에 word-break 인라인 스타일 적용
- [x] **이미지 캐러셀 UX 개선** (2025-12-08)
  - 전체화면 모달 제거
  - 드래그/스와이프 네비게이션 추가 (터치/마우스)
  - 바(bar) 형태 페이지네이션으로 변경
  - 헤더에 `< 1/10 >` 형태 네비게이션 화살표 배치
  - 원본 이미지 비율 유지 (maxHeight 제한 제거)
- [x] **모바일 검색 실시간 필터링** (2025-12-08)
  - MobileSidebar에 onSearch prop 및 debounce 로직 추가
  - 데스크톱 Sidebar와 동일한 검색 UX 구현
- [x] **사이드바 UX 개선** (2025-12-08)
  - 카테고리/컬렉션 필터 검색 추가 (4개 이상일 때 표시)
  - 리스트/클라우드 뷰 모드 토글 추가
  - 즐겨찾기(★) 기능 추가 (localStorage 저장)
  - 최근 사용 카테고리 자동 정렬 (최대 5개)
  - 정렬 순서: 즐겨찾기 → 최근 사용 → 알파벳순
- [x] **뒤로가기 버튼 UI 통일** (2025-12-08)
  - 모든 페이지 동일 스타일 적용: w-10 h-10, rounded-full, border
  - ChevronLeft 아이콘 (w-6 h-6)
  - hover:text-[#21DBA4] hover:border-[#21DBA4]
  - 적용 페이지: ProfilePage, SettingsPage, CollectionsPage, SecurityPage, NotificationsPage
- [x] **ClipDetail 상세페이지 UX 개선** (2025-12-08)
  - 고정 헤더 즉시 렌더링 (motion.div 밖으로 분리)
  - 상세페이지 진입 시 최상단 스크롤 자동 적용
  - 카테고리 표시 칩(Chip) 형태로 변경 (ClipCard와 일관성)
- [x] **모바일 카테고리 변경 기능** (2025-12-08)
  - ClipDetail/ClipCard에서 카테고리 칩 터치 시 변경 다이얼로그 표시
  - 카테고리 변경 시 UI 즉시 업데이트 (onCategoryChange 콜백)
  - list 뷰에 CategoryChangeDialog 누락 버그 수정
  - 터치 영역 확대 및 onTouchEnd 핸들러 추가
- [x] **ClipDetail 레이아웃 구조 개선** (2025-12-08)
  - 전체 화면 fixed 컨테이너로 변경 (독립적 레이아웃)
  - 헤더를 sticky로 변경 (스크롤 컨테이너 내 고정)
  - 모바일/데스크톱 위치 정확히 조정
  - App.tsx pt-8 래퍼 제거

#### 2. 서버 측 DOM 렌더링 구현
- [x] 공통 클립 서비스 추출 (`api/lib/clip-service.ts`)
- [x] URL 컨텐츠 fetcher 생성 (`api/lib/url-content-fetcher.ts`)
- [x] Jina Reader API 통합
- [x] `/api/analyze` 업그레이드 (서버 측 DOM 렌더링)
- [x] `/api/dom-import` 리팩토링 (공통 서비스 사용)

#### 3. 제로 할루시네이션 정책 구현
- [x] AI temperature 0으로 고정 (deterministic)
- [x] 원문 기반만 사용하도록 엄격한 규칙 적용
- [x] fallbackTitle/fallbackSummary 구현 (AI 없이 텍스트 추출)
- [x] safeGenerateMetadata 함수로 변경 (null 반환 가능)
- [x] AI 프롬프트 개선 ("CONTENT에 없는 정보 생성 금지")
- [x] 상세 로깅 추가

#### 4. DOM 기반 import 시스템
- [x] `/api/dom-import` 엔드포인트 생성
- [x] 클라이언트 DOM 캡처 예시 스크립트 작성
- [x] 브라우저 확장/북마클릿 지원

### 📝 핵심 아키텍처

```
홈 화면 URL 입력
    ↓
POST /api/analyze
    ↓
1. detectPlatform(url) → sourceType
2. fetchUrlContent(url) → { rawText, images, htmlContent }
3. createClipFromContent({ url, rawText, images, userId })
    ↓
    3-1. safeGenerateMetadata(rawText) [temperature=0]
    3-2. Firestore 저장
    ↓
Clip 반환
```

**브라우저 확장 플로우:**
```
Client DOM Capture
    ↓
POST /api/dom-import { url, text, html, images }
    ↓
createClipFromContent({ url, rawText, htmlContent, images, userId })
    ↓
Clip 반환
```

### 🔧 기술 스택

**Frontend:**
- React + TypeScript
- Vite
- TailwindCSS
- Shadcn UI
- Firebase Auth

**Backend (API Routes):**
- Vercel Serverless Functions
- OpenAI GPT-4o-mini
- Jina Reader API
- Cheerio (HTML parsing)
- Puppeteer (optional, for screenshot fallback)
- Firebase/Firestore

**주요 파일:**
- `api/analyze.ts` - URL import 메인 엔드포인트
- `api/dom-import.ts` - 브라우저 확장용 엔드포인트
- `api/lib/clip-service.ts` - 공통 클립 생성 서비스
- `api/lib/url-content-fetcher.ts` - Jina Reader 통합
- `src/components/FloatingSearchButton.tsx` - URL 입력 UI
- `src/components/ClipDetail.tsx` - 클립 상세 보기

### 🎯 핵심 원칙 (Invariants)

1. **원문 기반만 사용**
   - `contentMarkdown` = rawText (AI 수정 불가)
   - `htmlContent` = 입력 HTML (AI 수정 불가)
   - `images` = 추출된 이미지 (AI 생성 불가)

2. **AI는 메타데이터만 생성**
   - title, summary, keywords, category
   - 반드시 rawText 기반으로만 생성
   - temperature = 0 (deterministic)

3. **Graceful Degradation**
   - 컨텐츠 추출 실패 → URL-only 클립 생성
   - AI 실패 → fallback metadata 사용
   - 에러 발생해도 최소한 URL은 저장

### 🔐 환경 변수 (.env)

```
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# APIs
OPENAI_API_KEY=
JINA_API_KEY=
```

### 📊 현재 이슈 및 제약사항

**알려진 이슈:**
- Instagram/Threads private posts는 추출 불가 (→ URL-only)
- Jina Reader API quota 제한 가능성
- 일부 JavaScript-heavy 사이트 추출 부족

**개선 필요:**
- [ ] Puppeteer fallback 완전 구현
- [ ] 이미지 품질 필터링
- [ ] 캐싱 레이어 추가
- [ ] 배치 처리 지원
- [ ] 에러 리포팅 강화

### 🧪 테스트 방법

**로컬 개발 서버:**
```bash
npm run dev
# http://localhost:3000
```

**URL Import 테스트:**
1. 홈 화면 URL 입력창에 링크 붙여넣기
2. 분석 버튼 클릭
3. Firestore에 클립 생성 확인
4. ClipDetail에서 내용 확인

**DOM Import 테스트:**
```bash
curl -X POST http://localhost:3000/api/dom-import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "url": "https://example.com",
    "text": "Sample text content",
    "images": ["https://example.com/image.jpg"]
  }'
```

### 📚 참고 문서

프로젝트 내 문서:
- `client-dom-capture-example.js` - 브라우저 확장 참고 코드
- Brain artifacts:
  - `dom-import-plan.md` - DOM import 구현 계획
  - `dom-import-api-docs.md` - DOM import API 문서
  - `url-dom-rendering-plan.md` - 서버 측 DOM 렌더링 계획
  - `walkthrough.md` - 구현 세부사항

### 🚧 다음 단계

1. **테스트 강화**
   - 다양한 URL 타입 테스트
   - 실패 케이스 검증
   - 기존 클립 호환성 확인

2. **성능 최적화**
   - Jina API 응답 캐싱
   - 이미지 lazy loading
   - 배치 처리

3. **기능 확장**
   - 브라우저 확장 프로그램 개발
   - 컬렉션 자동 분류
   - 태그 자동 생성

4. **배포**
   - Vercel 배포 설정
   - 환경 변수 설정
   - 도메인 연결

## 💡 개발 팁

**새 세션에서 작업 재개 시:**
1. 이 문서 (`PROGRESS.md`) 먼저 읽기
2. `DEVELOPMENT_LOG.md` 확인하여 최근 변경사항 파악
3. `.env` 파일 설정 확인
4. `npm install` 실행
5. `npm run dev`로 개발 서버 시작

**코드 수정 시 주의사항:**
- `api/lib/clip-service.ts`의 Invariants 절대 위반 금지
- AI temperature는 항상 0 유지
- 프론트엔드 UI 변경 최소화
- 기존 Clip 인터페이스 호환성 유지

**디버깅:**
- 서버 로그: `[Clip Service]`, `[Jina Reader]`, `[AI Metadata]` 접두사로 검색
- 브라우저 콘솔에서 네트워크 요청 확인
- Firestore 콘솔에서 데이터 직접 확인

---

**마지막 커밋 정보:**
- 날짜: 2025-12-03
- 주요 변경: 제로 할루시네이션 정책 구현, 서버 측 DOM 렌더링 완성
