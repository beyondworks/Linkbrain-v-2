# Linkbrain v-2 기술 분석 및 개발 계획

## 📊 프로젝트 규모 분석

### 코드 통계
- **총 컴포넌트**: 66개 파일
- **미해결 TODO**: 0개
- **프론트엔드 완성도**: ~90%
- **백엔드 완성도**: ~20% (기본 분석 API만 존재)
- **데이터베이스**: 미설정
- **인증**: Firebase 준비됨, 통합 필요

---

## 🔍 현재 상태 상세 분석

### ✅ 프론트엔드 (거의 완성)

#### 1. 핵심 페이지 구현 완료
- **ClipGrid**: 클립 목록 표시 (필터링 지원)
- **ClipDetail**: 클립 상세 정보 (아직 데이터 미연결)
- **Collections**: 컬렉션 관리
- **Settings**: 사용자 설정 (다크모드, 언어)
- **Profile**: 사용자 프로필
- **Login/Signup**: 인증 페이지 UI

#### 2. UI/UX 우수사항
- Radix UI + Tailwind CSS 통합
- 다크모드 완전 지원
- 반응형 디자인 (mobile/desktop)
- 다국어 지원 구조 (KR/EN)
- 애니메이션 및 트랜지션

#### 3. 남은 작업
- 데이터 바인딩 (API 연결)
- 실제 클립 데이터 표시
- 필터링 로직 (카테고리, 출처)

---

### ⚠️ 백엔드 (초기 단계)

#### 1. 기존 API (`/api/analyze.ts`)
```typescript
기능:
- URL 수신 → 플랫폼 감지
- Cheerio로 HTML 스크래핑
- OpenAI GPT-4o-mini 분석
- 구조화된 JSON 응답 반환

문제점:
1. 데이터 저장 기능 없음 (응답만 반환)
2. 오류 처리 미흡 (scrape 실패 시 fallback만 있음)
3. Vercel의 제한된 실행시간 (≤10초)
4. 대용량 HTML 저장 문제 (응답에 htmlContent 포함)
```

#### 2. 필요한 추가 API 엔드포인트

**Data API (CRUD Operations)**
```
POST   /api/clips              - 클립 저장
GET    /api/clips              - 목록 조회 (필터링)
GET    /api/clips/:id          - 상세 조회
PATCH  /api/clips/:id          - 수정
DELETE /api/clips/:id          - 삭제

POST   /api/collections        - 컬렉션 생성
GET    /api/collections        - 목록 조회
GET    /api/collections/:id    - 상세 조회
PATCH  /api/collections/:id    - 수정
DELETE /api/collections/:id    - 삭제

GET    /api/search            - 클립 검색
```

**Analysis API (강화)**
```
POST   /api/analyze           - URL 분석 (기존)
POST   /api/scrape            - 웹페이지 스크래핑 (원문 저장용)
```

---

### ❌ 데이터베이스 (미설정)

#### 1. 필요한 테이블/컬렉션

**Firestore Collections**

```javascript
// 1. users 컬렉션
{
  id: string (UID)
  email: string
  displayName: string
  avatar: string
  createdAt: timestamp
  updatedAt: timestamp
  settings: {
    language: 'KR' | 'EN'
    darkMode: boolean
  }
}

// 2. clips 컬렉션
{
  id: string (auto)
  userId: string (FK)
  url: string
  platform: 'youtube' | 'instagram' | 'threads' | 'twitter' | 'web' | 'linkedin'
  title: string
  summary: string
  keywords: string[]
  category: string
  sentiment: 'positive' | 'neutral' | 'negative'
  type: 'article' | 'video' | 'image' | 'social_post' | 'website'
  author: string
  imageUrl: string

  // 원문 저장 (핵심)
  htmlContent: string (압축/축약)
  cssContent: string
  metaData: {
    title: string
    description: string
    author: string
    publishedDate: string
  }

  // 관계
  collectionIds: string[] (참조)

  // 메타
  createdAt: timestamp
  updatedAt: timestamp
  viewCount: number
  likeCount: number
}

// 3. collections 컬렉션
{
  id: string (auto)
  userId: string (FK)
  name: string
  description: string
  color: string
  clipIds: string[] (FK)
  createdAt: timestamp
  updatedAt: timestamp
  isPublic: boolean
}

// 4. tags 컬렉션 (선택사항)
{
  id: string
  name: string
  count: number (클립 수)
}
```

---

## 🔐 보안 검토

### 현재 문제점 ⚠️

1. **노출된 API 키** (.env에 평문 저장)
   - OpenAI API 키
   - Firebase 설정
   - 해결: 환경변수 분리, 백엔드 처리

2. **CORS 설정 너무 개방적**
   ```typescript
   'Access-Control-Allow-Origin': '*'  // ❌ 위험
   ```
   해결: 특정 도메인만 허용

3. **클라이언트 사이드 API 키 노출**
   ```typescript
   VITE_OPENAI_API_KEY=sk-proj-...  // ❌ 브라우저에 노출됨
   ```
   해결: 백엔드에서만 처리

4. **입력 검증 부족**
   - URL 유효성 검사 필요
   - 사용자 입력 sanitization 필요

5. **Rate Limiting 없음**
   - AI 분석 남용 가능
   - 해결: IP 기반 또는 사용자 기반 제한

---

## 📝 데이터 흐름 설계

### 클립 생성 플로우

```
1. 사용자가 URL 입력
2. FloatingSearchButton에서 URL 제출
   ↓
3. POST /api/analyze
   - URL 검증
   - 플랫폼 감지
   - 웹페이지 스크래핑
   - OpenAI 분석
   - 결과 반환 (title, keywords, category 등)
   ↓
4. 사용자 확인/수정
   ↓
5. POST /api/clips (저장)
   - Firestore에 저장
   - HTML 원문 저장
   - 이미지 압축 저장
   ↓
6. ClipGrid에 실시간 표시
   - GET /api/clips?category=...&source=...
```

### 클립 조회 플로우

```
1. 사용자가 ClipGrid 접근
   ↓
2. GET /api/clips?category=AI&source=youtube
   ↓
3. 필터링된 클립 목록 반환
   ↓
4. 클립 클릭
   ↓
5. GET /api/clips/:id
   ↓
6. ClipDetail에 원문 재현 표시
   - htmlContent로 재구성
   - CSS 적용
   - 이미지 표시
   - 메타데이터 표시
```

---

## ⚡ 개발 우선순위 및 일정

### Phase 1: 데이터베이스 & API (3-4일)
```
Day 1:
  - Firestore 스키마 설계 및 생성
  - 보안 규칙 설정

Day 2-3:
  - POST /api/clips (클립 저장)
  - GET /api/clips (목록, 필터링)
  - GET /api/clips/:id (상세)
  - PATCH /api/clips/:id (수정)
  - DELETE /api/clips/:id (삭제)

Day 4:
  - 컬렉션 API 구현
  - 테스트 및 디버깅
```

### Phase 2: 프론트엔드 연결 (2-3일)
```
Day 1:
  - API 클라이언트 (hooks) 작성
  - ClipGrid에 데이터 바인딩
  - 필터링 로직 연결

Day 2-3:
  - ClipDetail 구현
  - 저장/수정/삭제 기능
  - 로딩/에러 상태 처리
```

### Phase 3: 원문 저장 및 재현 (3-4일)
```
Day 1-2:
  - HTML 캡처 라이브러리 선택
  - 이미지 최적화
  - 저장 로직 개선

Day 3-4:
  - ClipDetail에 원문 재현
  - 스타일 적용
  - 반응형 처리
```

### Phase 4: 인증 & 보안 (2-3일)
```
Day 1:
  - Firebase Auth 통합
  - 사용자 정보 저장

Day 2:
  - API 권한 검사
  - Rate limiting

Day 3:
  - 환경변수 분리
  - 키 관리
```

### Phase 5: 배포 (1-2일)
```
Day 1:
  - Vercel 배포 설정
  - 환경변수 설정

Day 2:
  - 성능 최적화
  - 모니터링
```

**총 일정: 11-17일 (약 2-3주)**

---

## 🛠️ 기술 선택 및 대안

### 원문 저장 방식 (중요)

| 방식 | 장점 | 단점 | 추천 |
|------|------|------|------|
| **HTML 문자열 저장** | 간단, 빠름 | 용량 큼, 보안 문제 | ✅ 추천 |
| **스크린샷 저장** (Puppeteer) | 정확한 재현 | 느림, 비용 많음 | ❌ |
| **Markdown 변환** | 용량 작음, 안전 | 스타일 손실 | △ 대안 |
| **DOM 재구성** | 정확함 | 복잡함 | △ 고급 |

**결론**: HTML 문자열 저장 + CSS 분리 + 이미지 최적화

### 데이터베이스 선택

**Firestore (현재 선택) ✅**
- 장점: Firebase 통합, 자동 스케일, 보안 규칙 우수
- 단점: NoSQL이라 쿼리 제한 있음
- 비용: 무료 범위 충분 (초기 단계)

**Alternative**: PostgreSQL + Supabase
- 더 강력한 쿼리
- 관계형 데이터 관리 용이
- 추후 마이그레이션 고려 가능

---

## 🚀 구현 전략

### 1. 백엔드부터 진행 (API 우선)
```
이유:
- 프론트엔드는 이미 90% 완성
- API가 없으면 프론트엔드 연결 불가
- 병렬 진행 가능 (한쪽은 데이터 기다림)
```

### 2. 스키마 우선 설계
```
이유:
- 전체 데이터 흐름 이해 필요
- API 설계의 기초
- 변경 비용 낮음
```

### 3. API 먼저 완성, 프론트엔드 연결 후 원문 저장
```
이유:
- 핵심 기능부터 동작하는 상태 유지
- 테스트 용이
- 점진적 완성
```

---

## 📋 체크리스트

### 시작 전 준비물
- [ ] Firestore 데이터베이스 생성
- [ ] 보안 규칙 설정
- [ ] Vercel 프로젝트 연결
- [ ] 환경변수 설정 (.env.local 등)

### API 개발 체크리스트
- [ ] 데이터 모델 정의
- [ ] Firestore 스키마 생성
- [ ] CRUD API 엔드포인트 개발
- [ ] 오류 처리
- [ ] 입력 검증
- [ ] Rate limiting
- [ ] 권한 검사

### 프론트엔드 연결 체크리스트
- [ ] API 클라이언트 (React hooks)
- [ ] 데이터 페칭 로직
- [ ] 에러 상태 처리
- [ ] 로딩 상태 처리
- [ ] 캐싱 (선택사항)

### 원문 저장 체크리스트
- [ ] HTML 캡처 라이브러리 통합
- [ ] 이미지 최적화
- [ ] 메타데이터 저장
- [ ] ClipDetail 원문 표시

### 배포 체크리스트
- [ ] 환경변수 분리
- [ ] API 키 관리
- [ ] CORS 설정
- [ ] 성능 최적화
- [ ] 모니터링 설정

---

*마지막 업데이트: 2025-12-02*
