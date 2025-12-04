# 핵심 기능 강화 계획 (클립 품질 개선)

## 현재 문제점 분석

### 1️⃣ Instagram 추출 실패 (우선순위: CRITICAL)
**증상**:
- 제목/내용/서머리가 실제와 상이
- 원문 분석 못함

**근본 원인 추적**:
1. puppeteer-extractor.ts (Instagram 섹션)
   - og:title에서 handle만 추출
   - 실제 캡션 텍스트 미추출
   - 로그인 게이트 감지만 있음

2. url-content-fetcher.ts
   - Puppeteer 약한 결과 → Jina 폴백
   - 하지만 Jina도 Instagram 제약 가능

3. clip-service.ts
   - rawText가 없으면 AI 호출 안함
   - fallback title/summary 적용

**해결 방법**:
1. Puppeteer Instagram 캡션 추출 강화
2. Jina 폴백 로직 검증
3. AI 메타데이터 품질 검증

---

## 2️⃣ 썸네일 / 작성자 정보 / 원문 표시 (우선순위: HIGH)

### ClipDetail.tsx 현재 상태
- ✅ 썸네일: clip.image 또는 clip.images[0] 사용
- ❌ 작성자 프로필: "User" 하드코딩됨 (실제 데이터 없음)
- ❌ 원문 내용: Instagram은 og:image + title만 표시
- ⚠️ 이미지: Threads 다중이미지 지원, Instagram은 단일만

### 필요한 데이터 구조 확장

**Clip 인터페이스에 추가**:
```typescript
interface Clip {
  // 기존
  image?: string;
  images?: string[];
  
  // 추가 필요
  author?: string;                    // 작성자명
  authorHandle?: string;              // @username
  authorAvatar?: string;              // 프로필 이미지 URL
  authorProfile?: {
    avatar: string;
    handle: string;
    url?: string;
  };
  
  // 원문 콘텐츠
  htmlContent?: string;               // 이미 있음
  contentMarkdown?: string;           // 이미 있음
  contentText?: string;               // 텍스트 버전
}
```

**Firestore에 저장되는 필드**:
- author (문자열)
- authorProfile (객체: {avatar, handle, url})
- authorHandle
- mediaItems (기존: 미사용)

---

## 3️⃣ Instagram 레이아웃 개선

**현재**:
- 단순 사진 + 제목 표시
- 작성자 정보 하드코딩
- 원문 캡션 미표시

**개선 후**:
- ✅ 작성자 프로필 사진 + 이름 (@handle)
- ✅ 실제 캡션 텍스트 표시
- ✅ Carousel 이미지 그리드 (여러장)
- ✅ 썸네일 우선순위 (og:image > 추출 이미지)

---

## 4️⃣ 작업 범위 (기존 디자인 유지)

### DO ✅
- 데이터 추출 파이프라인 강화
- Clip 데이터 구조 확장 (신규 필드)
- ClipDetail 표시 로직 개선 (실제 데이터 반영)
- Instagram/Threads 레이아웃 개선
- 에러 처리 강화

### DON'T ❌
- UI 스타일 변경 (색상, 폰트, 간격)
- 레이아웃 구조 변경 (위치, 구성)
- 새 컴포넌트 추가
- 디자인 시스템 수정

---

## 5️⃣ 구현 단계

### Phase 1: API 층 강화
**목표**: puppeteer-extractor에서 정확한 데이터 추출

1. Instagram 캡션 추출 강화
   - og:title 분석 (캡션이 포함될 수 있음)
   - meta description 추가 추출
   - img alt 텍스트 활용

2. Puppeteer 결과 개선
   - author 정보 추출
   - authorHandle 파싱
   - authorAvatar URL 확인

3. Jina 폴백 테스트
   - Instagram on Jina 품질 확인
   - 폴백 조건 재검토

### Phase 2: 데이터 구조 확장
**목표**: clip-service에서 확장 필드 저장

1. ClipContentInput 인터페이스 확장
2. createClipFromContent 업데이트
3. Firestore 스키마 확장

### Phase 3: UI 표시 개선
**목표**: ClipDetail에서 실제 데이터 표시

1. Instagram 레이아웃: 작성자 정보 실제 데이터 표시
2. Threads 레이아웃: 동일
3. Web 레이아웃: 저자 정보 표시 (가능시)

### Phase 4: 검증 및 테스트
**목표**: 각 플랫폼별 E2E 테스트

1. Instagram 링크로 테스트
2. Threads 링크로 테스트
3. Web 링크로 테스트
4. 에러 케이스 검증

---

## 🔑 핵심 원칙

1. **점진적 개선**: 작은 단위로 자주 검증
2. **데이터 우선**: UI는 데이터에 따라 자동 반영
3. **기존 유지**: 레이아웃/스타일 건드리지 않기
4. **에러 처리**: 데이터 없을 때 우아하게 폴백
5. **로깅**: 각 단계에서 console.log로 추적 가능하게

---

## 📊 성공 기준

- ✅ Instagram 캡션이 실제 원문과 일치
- ✅ 작성자 정보 (이름, 핸들, 프로필사진) 표시됨
- ✅ 여러 이미지 있을 때 모두 표시됨
- ✅ 기존 UI 스타일 100% 유지
- ✅ 에러 없이 작동 (폴백 정상)
