# Linkbrain v-2 구현 로드맵

## 🎯 핵심 목표
1. **기본 CRUD 기능**: 클립 저장/조회/수정/삭제
2. **AI 기반 분석**: URL → 자동 분류/키워드 추출
3. **원문 영구 저장**: 링크 없이도 영구 조회 가능
4. **사용자 관리**: 로그인/계정/설정
5. **배포 준비**: Vercel 자동 배포

---

## 📅 상세 개발 스케줄

### Week 1: 백엔드 기초 (4일)

#### Day 1: 데이터베이스 설계 및 Firestore 설정
```
작업:
1. Firestore 컬렉션 생성
   - users (사용자)
   - clips (클립)
   - collections (컬렉션)

2. 보안 규칙 설정
   - 사용자 자신의 데이터만 접근
   - 공개 컬렉션 읽기 권한

3. 인덱스 설정
   - userId + createdAt
   - userId + category + createdAt
   - userId + platform

산출물:
- Firestore 스키마 설계 문서
- 보안 규칙 (.rules 파일)
- DB 구조 다이어그램
```

#### Day 2-3: API 엔드포인트 개발
```
작업:
1. Vercel API 라우팅 구조 설정
   /api/clips/create.ts     (POST)
   /api/clips/list.ts       (GET)
   /api/clips/detail.ts     (GET)
   /api/clips/update.ts     (PATCH)
   /api/clips/delete.ts     (DELETE)
   /api/collections/*.ts    (CRUD)

2. 클립 저장 API
   - 입력 검증
   - Firestore 저장
   - 응답 반환

3. 클립 조회 API
   - 카테고리 필터링
   - 출처 필터링
   - 페이지네이션
   - 정렬 (최신순, 인기순)

4. 수정/삭제 API
   - 권한 검사
   - Firestore 업데이트

산출물:
- 동작하는 API 엔드포인트
- API 문서 (요청/응답 스키마)
- 테스트 케이스
```

#### Day 4: 테스트 및 오류 처리
```
작업:
1. API 테스트
   - Postman/curl로 각 엔드포인트 테스트
   - 오류 케이스 검증

2. 오류 처리
   - 입력 검증 강화
   - 서버 오류 처리
   - 적절한 HTTP 상태 코드

3. 로깅 및 모니터링
   - 요청/응답 로깅
   - 오류 추적

산출물:
- 안정적인 API
- 오류 처리 문서
```

---

### Week 1 (계속): 프론트엔드 연결 (3일)

#### Day 1: API 클라이언트 작성
```
작업:
1. src/hooks/useClips.ts
   - fetchClips(filters) → 클립 목록 조회
   - createClip(data) → 클립 저장
   - updateClip(id, data) → 클립 수정
   - deleteClip(id) → 클립 삭제

2. src/hooks/useAnalyze.ts
   - analyzeUrl(url) → AI 분석 실행

3. 에러 처리 및 로딩 상태
   - isLoading, error, data 상태 관리

산출물:
- 재사용 가능한 custom hooks
- TypeScript 타입 정의
```

#### Day 2-3: 컴포넌트 데이터 바인딩
```
작업:
1. ClipGrid.tsx 연결
   - useClips() hook 사용
   - 필터링 적용
   - 실시간 업데이트

2. FloatingSearchButton.tsx 연결
   - useAnalyze() hook 사용
   - URL 분석 → 클립 저장
   - 로딩/성공 피드백

3. ClipDetail.tsx 데이터 표시
   - 클립 상세 정보 표시
   - 수정 기능
   - 삭제 기능

4. 컬렉션 기능
   - 클립 → 컬렉션 추가
   - 컬렉션 생성/삭제

산출물:
- 완전히 동작하는 클립 생성/조회/수정/삭제
- UI/UX 피드백 (로딩, 성공, 오류)
```

---

### Week 2: 원문 저장 및 고급 기능 (4일)

#### Day 1: 웹페이지 원문 캡처
```
작업:
1. 분석 API 강화
   - 대용량 HTML 처리
   - CSS 분리 저장
   - 이미지 URL 추출

2. 저장 최적화
   - HTML 압축
   - 불필요한 태그 제거
   - 용량 제한 (예: 5MB)

기술 옵션:
- jsdom: DOM 파싱
- html-minifier: HTML 압축
- sharp: 이미지 최적화
- LZ-string: 압축

산출물:
- 최적화된 원문 저장 로직
```

#### Day 2-3: ClipDetail 원문 재현
```
작업:
1. Firestore에서 HTML 로드
   - htmlContent 파싱
   - CSS 적용
   - 이미지 표시

2. iframe 없이 재현
   - SandboxHTML 컴포넌트 작성
   - 스타일 격리
   - 보안 (XSS 방지)

3. 상호작용 구현
   - 댓글 표시 (메타데이터)
   - 좋아요/공유 버튼
   - 원본 URL 링크

기술 방안:
- dangerouslySetInnerHTML 대신 DOMPurify 사용
- CSS Module 또는 styled-components로 격리

산출물:
- 원본과 동일한 모양의 클립 표시
- 보안이 강화된 렌더링
```

#### Day 4: 고급 필터링 및 검색
```
작업:
1. 검색 API
   - GET /api/search?q=keyword
   - 제목, 설명, 키워드 검색

2. 고급 필터링
   - 날짜 범위 필터
   - 여러 카테고리 선택
   - 여러 출처 선택

3. 정렬 옵션
   - 최신순
   - 인기순 (조회수)
   - 관련성순

산출물:
- 강력한 검색/필터링 기능
- 사용자가 원하는 클립 빠르게 찾기
```

---

### Week 2 (계속): 인증 및 배포 (3일)

#### Day 1: 인증 통합
```
작업:
1. Firebase Auth 연결
   - 회원가입/로그인 완성
   - 토큰 관리
   - 로그아웃

2. 권한 검사
   - API 요청 시 인증 토큰 전달
   - 서버에서 사용자 확인
   - 자신의 데이터만 접근

3. 사용자 프로필
   - 프로필 정보 저장
   - 설정 저장 (다크모드, 언어)

산출물:
- 완전한 인증 시스템
- 안전한 데이터 접근 제어
```

#### Day 2: 보안 강화
```
작업:
1. 환경변수 관리
   - .env.local (로컬 개발)
   - .env.example (템플릿)
   - Vercel 환경변수 설정

2. API 보안
   - CORS 설정 (특정 도메인)
   - Rate limiting (IP당 요청 제한)
   - 입력 검증 강화

3. 클라이언트 보안
   - API 키를 브라우저에 노출하지 않기
   - XSS 방지
   - CSRF 토큰 (필요시)

산출물:
- 보안이 강화된 API
- 안전한 배포 준비
```

#### Day 3: Vercel 배포
```
작업:
1. 배포 설정
   - Vercel에 프로젝트 연결
   - 자동 배포 설정 (git push)
   - 환경변수 설정

2. 성능 최적화
   - 번들 크기 최적화
   - 이미지 최적화
   - 페이지 로딩 시간 측정

3. 모니터링
   - Vercel Analytics 활성화
   - 오류 추적
   - 성능 모니터링

산출물:
- 배포된 서비스
- 실시간 모니터링 설정
```

---

## 🔧 구체적 구현 패턴

### 1. API 엔드포인트 템플릿

```typescript
// /api/clips/create.ts
import { Response } from 'express';
import * as admin from 'firebase-admin';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://yourdomain.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 인증 확인
    const token = req.headers.authorization?.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // 입력 검증
    const { url, title, category, keywords, platform } = req.body;
    if (!url || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Firestore 저장
    const db = admin.firestore();
    const clipRef = await db.collection('clips').add({
      userId,
      url,
      title,
      category,
      keywords,
      platform,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      id: clipRef.id,
      message: 'Clip created successfully',
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
```

### 2. 클라이언트 Hook 템플릿

```typescript
// /src/hooks/useClips.ts
import { useState, useCallback } from 'react';
import { auth } from '../lib/firebase';

export const useClips = () => {
  const [clips, setClips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClips = useCallback(async (filters = {}) => {
    setIsLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const params = new URLSearchParams(filters);
      const response = await fetch(
        `/api/clips/list?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      setClips(data.clips);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { clips, isLoading, error, fetchClips };
};
```

### 3. Firestore 보안 규칙

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 사용자 문서
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // 클립 문서
    match /clips/{clipId} {
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid;
      allow read: if request.auth.uid == resource.data.userId;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }

    // 컬렉션 문서
    match /collections/{collectionId} {
      allow create: if request.auth != null;
      allow read: if request.auth.uid == resource.data.userId ||
                     (resource.data.isPublic == true);
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 📊 진행률 추적

### 현재 (Day 0)
```
백엔드: ████░░░░░░ 20%
프론트엔드: ███████████░░ 90%
데이터베이스: ░░░░░░░░░░ 0%
인증: █░░░░░░░░░ 10%
배포: ░░░░░░░░░░ 0%
---
전체: ███████░░░ 42%
```

### Week 1 종료 시점 (예상)
```
백엔드: ██████████ 100%
프론트엔드: ███████████░░░ 100%
데이터베이스: ██████████ 100%
인증: ███████░░░ 70%
배포: ░░░░░░░░░░ 0%
---
전체: ████████░░ 74%
```

### 최종 (Week 2 종료)
```
백엔드: ██████████ 100%
프론트엔드: ██████████ 100%
데이터베이스: ██████████ 100%
인증: ██████████ 100%
배포: ██████████ 100%
---
전체: ██████████ 100%
```

---

## 🎯 성공 기준 (Definition of Done)

### MVP (최소 기능 제품)
- [ ] URL 입력 → 클립 자동 생성
- [ ] 클립 목록 조회 (카테고리/출처 필터)
- [ ] 클립 상세 보기 (원문 재현)
- [ ] 로그인/계정 관리
- [ ] 배포 완료

### Phase 1 확장
- [ ] 컬렉션 관리
- [ ] 고급 검색/필터링
- [ ] 공유 기능
- [ ] 댓글 기능

### Phase 2 확장 (이후)
- [ ] 오프라인 지원 (PWA)
- [ ] 협업 기능
- [ ] API 공개 (OAuth)
- [ ] 모바일 앱

---

## 🚨 주의사항

### 보안
1. ❌ 절대 API 키를 환경변수에 포함하지 말 것
2. ✅ 모든 API 요청에 인증 토큰 검증
3. ✅ Firestore 보안 규칙 엄격하게 설정
4. ✅ Rate limiting 구현

### 성능
1. 📦 번들 크기: < 200KB (gzip)
2. ⏱️ 첫 로드: < 3초
3. 📊 API 응답: < 500ms
4. 📱 모바일: LTE 환경에서 최적화

### 디자인
1. 🎨 기존 UI/UX 유지
2. 🌙 다크모드 완벽 지원
3. 📱 반응형 디자인 유지
4. 🎯 일관된 색상/타이포그래피

---

## 📞 연락 및 지원

문제 발생 시:
1. PROJECT_STATUS.md 확인
2. TECHNICAL_ANALYSIS.md 검토
3. git log 확인
4. 필요시 새 branch 생성하여 실험

---

*마지막 업데이트: 2025-12-02*
*예상 완료: 2025-12-16*
