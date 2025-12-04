# Linkbrain v-2 최근 업데이트 분석 (2025-12-03)

## 📊 변경 파일 요약
- api/analyze.ts (+75 lines, -75 lines) → API 로직 개선
- api/lib/clip-service.ts (+87 lines, -87 lines) → **NEW 파일**: 클립 생성 서비스 분리
- api/lib/url-content-fetcher.ts (+104 lines, -104 lines) → **NEW 파일**: URL 콘텐츠 페칭 로직
- api/lib/puppeteer-extractor.ts → **NEW 파일**: Puppeteer 기반 콘텐츠 추출
- package.json (+3 lines) → 새 의존성 추가
- src/components/FloatingSearchButton.tsx (-150 lines) → 간소화
- src/components/Hero.tsx (-155 lines) → 간소화
- src/components/Sidebar.tsx (-17 lines) → 간소화
- public/fallback-thumbnails (2개 이미지 수정) → 새로운 fallback-3.png 추가

---

## 🔑 핵심 변경사항

### 1️⃣ API 아키텍처 개선 (분리 설계)
**이전**: analyze.ts에 모든 로직 집중
**현재**: 책임 분리
- `clip-service.ts`: 클립 생성 및 메타데이터 생성 (SafeGenerateMetadata)
- `url-content-fetcher.ts`: URL에서 콘텐츠 가져오기 (Jina + Puppeteer 통합)
- `puppeteer-extractor.ts`: Puppeteer 기반 브라우저 자동화

### 2️⃣ ClipService (clip-service.ts)
**핵심 인터페이스**:
```typescript
export interface ClipContentInput {
    url: string;
    sourceType: 'instagram' | 'threads' | 'youtube' | 'web' | 'twitter';
    rawText?: string;           // ✅ 실제 추출 텍스트만
    htmlContent?: string;       // ✅ 실제 HTML만
    images?: string[];          // ✅ 실제 이미지 URL만
    userId: string;
    author?: string;
    authorAvatar?: string;
    authorHandle?: string;
}
```

**주요 함수**:
- `detectPlatform()`: URL에서 플랫폼 감지 (Threads, Instagram, YouTube, Twitter, Web)
- `extractTextFromHtml()`: HTML → 텍스트 추출 (cheerio 사용)
- `safeGenerateMetadata()`: 
  - ⚡ **CRITICAL**: rawText가 없으면 AI 호출 안함
  - temperature = 0 (결정론적 결과)
  - 명시적으로 "새 정보 생성 금지"
  - 기존 텍스트 분석만 수행
- `createClipFromContent()`: Firestore에 클립 저장
  - ✅ contentMarkdown = rawText (AI 수정 X)
  - ✅ htmlContent = input.htmlContent (AI 수정 X)
  - ✅ images = input.images (AI 수정 X)
  - AI는 title, summary, keywords만 생성

**Fallback 전략**:
- `fallbackTitle()`: rawText 첫 줄 또는 호스트명
- `fallbackSummary()`: rawText 자체 또는 간단한 설명

### 3️⃣ URLContentFetcher (url-content-fetcher.ts)
**아키텍처**: 
1. Social Media (Threads, Instagram, Twitter, YouTube) → **Puppeteer 우선**
2. 약한 결과 → Jina 폴백
3. 일반 Web → **Jina Reader**

**Puppeteer + Jina 통합**:
```
Social Media (Threads/Instagram) 
  → Puppeteer 시도
  → 약한 결과? (텍스트 < 200 chars, 이미지 = 0, 로그인 게이트)
    → Jina 폴백으로 텍스트 추가
    → Puppeteer 메타데이터 유지 (합침)
```

**약한 결과 판단**:
- rawText.length < 200 chars
- images.length === 0
- 로그인 게이트 감지 ("log in", "sign up", "로그인", "가입")

### 4️⃣ PuppeteerExtractor (puppeteer-extractor.ts)
**플랫폼별 처리**:

**Threads**:
- og:title에서 handle 추출 ("@handle" 패턴)
- DOM에서 handle 찾기 (`[href^="/@"]`)
- div[dir="auto"]에서 텍스트 (필터: 5자 미만, 숫자, 조회수 제거)
- 모든 이미지 수집 + og:image 우선

**Instagram**:
- og:title에서 handle 추출 ("Instagram의 username님" 또는 "username on Instagram")
- 로그인 게이트 감지 (bodyText.length < 500)
- carousel 이미지 추출 (srcset 파싱)

**Web/Blog**:
- article, main, body 콘텐츠 추출
- h1-h6 수집 (최대 10개)
- p 필터링 (> 50 chars, 최대 20개)
- 모든 이미지 수집 + og:image 우선

### 5️⃣ UI 컴포넌트 간소화
**Hero.tsx** / **FloatingSearchButton.tsx**:
- 직접 `/api/analyze` POST 호출
- 요청: `{ url, language, userId }`
- 응답: 생성된 클립 데이터
- Firebase 인증 토큰 전달
- Firestore 실시간 리스너로 자동 업데이트
- 성공 토스트: 생성된 클립 제목 표시

---

## 🚨 중요 변경점

1. **Zero Hallucination Policy**
   - clip-service.ts의 `safeGenerateMetadata()` 함수
   - temperature = 0
   - "DO NOT generate, invent, or hallucinate" 명시
   - rawText 없으면 AI 호출 안함

2. **Puppeteer + Jina 하이브리드**
   - Social media는 Puppeteer 최우선 (메타데이터 정확성)
   - 약한 결과면 Jina로 텍스트 보강
   - 메타데이터는 Puppeteer 결과 유지

3. **Fallback 이미지 추가**
   - public/fallback-thumbnails/fallback-3.png 추가
   - 3개 중 랜덤 선택

4. **계정 정보 추출 개선**
   - author, authorHandle, authorAvatar 구분
   - Threads/Instagram handle 자동 추출
   - og:image 우선순위

---

## 📌 현재 상태
- ✅ 아키텍처 분리 완료
- ✅ Zero Hallucination Policy 구현
- ✅ Social Media 처리 개선
- ✅ 하이브리드 페칭 전략 구현
- ⏳ 테스트 및 통합 필요
- ⏳ 에러 처리 검증 필요

---

## 🎯 다음 작업
1. Vite 재컴파일 확인 (새 파일들)
2. API 엔드포인트 integrate 확인
3. 각 플랫폼별 테스트
4. 에러 로깅 및 모니터링
