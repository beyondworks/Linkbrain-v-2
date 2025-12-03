# Linkbrain v-2 개발 가이드

## 🚀 빠른 시작

### 로컬 개발 환경 설정

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env .env.local
# .env.local 파일을 열어 개인 API 키 설정

# 3. 개발 서버 실행
npm run dev

# 4. 브라우저에서 확인
# http://localhost:5173
```

### 배포

```bash
# Vercel에 자동 배포 (git push 시)
# 또는 수동 배포:
npm run build
vercel deploy --prod
```

---

## 📚 문서 가이드

### 1️⃣ **PROJECT_STATUS.md** (현재 상태 확인)
```
언제 읽을까?
- 프로젝트 전체 상황을 파악하고 싶을 때
- 무엇이 완료되었고 무엇이 남았는지 확인할 때

내용:
- 완료된 작업 체크리스트
- 미완료 작업 (우선순위 순)
- 프로젝트 구조
- 기술 스택
- 다음 단계
```

### 2️⃣ **TECHNICAL_ANALYSIS.md** (기술 분석)
```
언제 읽을까?
- 아키텍처 이해가 필요할 때
- 데이터 흐름을 파악하고 싶을 때
- 보안 문제를 이해하고 싶을 때

내용:
- 현재 코드 상태 분석 (통계)
- 프론트엔드/백엔드/DB 상세 분석
- 보안 검토 및 문제점
- 데이터 흐름 설계
- 개발 우선순위 및 일정
- 기술 선택 근거
```

### 3️⃣ **IMPLEMENTATION_ROADMAP.md** (상세 구현 계획)
```
언제 읽을까?
- 구체적으로 무엇부터 시작할지 모를 때
- 일일 작업 계획을 수립할 때
- 코드 구현 패턴이 필요할 때

내용:
- 주별 개발 계획 (Day별)
- 각 작업의 산출물
- 구현 코드 템플릿
- 진행률 추적
- 성공 기준
```

### 4️⃣ **README_DEVELOPMENT.md** (이 파일)
```
언제 읽을까?
- 개발 시작 전 설정이 필요할 때
- 각 문서의 역할을 알고 싶을 때
- 일반적인 개발 팁이 필요할 때
```

---

## 🎯 오늘(또는 내일) 할 일

### 만약 지금 시작한다면:

#### 우선순위 1: Firestore 설정 (30분)
```bash
# 1. Firebase Console 접속
# https://console.firebase.google.com/project/linkbrain-4a011

# 2. Firestore 데이터베이스 생성
# - Firestore Database 섹션에서 "데이터베이스 만들기"
# - 프로덕션 모드
# - 지역: asia-northeast1 (서울)

# 3. 초기 보안 규칙 설정
# IMPLEMENTATION_ROADMAP.md의 "Firestore 보안 규칙" 섹션 참고
```

#### 우선순위 2: API 엔드포인트 구현 (2시간)
```bash
# 1. 필요한 디렉토리/파일 생성
mkdir -p api/clips
touch api/clips/create.ts
touch api/clips/list.ts
touch api/clips/detail.ts
touch api/clips/update.ts
touch api/clips/delete.ts

# 2. IMPLEMENTATION_ROADMAP.md의 API 템플릿 코드 참고
# 각 엔드포인트 구현

# 3. 로컬에서 테스트
npm run dev  # 프론트엔드
# 다른 터미널에서:
npm run build  # API 빌드 확인
```

#### 우선순위 3: 클라이언트 Hook 작성 (1시간)
```bash
# 1. useClips.ts 작성
touch src/hooks/useClips.ts
# IMPLEMENTATION_ROADMAP.md의 Hook 템플릿 참고

# 2. ClipGrid.tsx에 데이터 바인딩
# src/components/ClipGrid.tsx 수정
```

---

## 🔑 핵심 개념 정리

### 1. 클립 생성 흐름
```
사용자 입력 URL
    ↓
FloatingSearchButton
    ↓
POST /api/analyze
  - Cheerio로 HTML 스크래핑
  - OpenAI GPT-4o-mini 분석
  - 제목, 카테고리, 키워드 추출
    ↓
사용자 확인/수정
    ↓
POST /api/clips/create
  - Firestore에 저장
  - htmlContent 저장
    ↓
ClipGrid에 실시간 표시
```

### 2. 데이터 구조
```javascript
Clip {
  id: string                    // Firestore auto ID
  userId: string               // 사용자 ID (FK)
  url: string                  // 원본 URL
  platform: 'youtube'|...      // 플랫폼 감지
  title: string                // AI 분석 제목
  summary: string              // AI 분석 요약
  keywords: string[]           // AI 분석 키워드
  category: string             // AI 분석 카테고리
  imageUrl: string             // 썸네일
  htmlContent: string          // 원문 HTML (핵심!)
  createdAt: timestamp
  updatedAt: timestamp
  viewCount: number
  likeCount: number
  collectionIds: string[]      // 속한 컬렉션
}
```

### 3. 보안 규칙
```
- 로그인한 사용자만 클립 생성 가능
- 자신이 만든 클립만 수정/삭제 가능
- 다른 사용자의 클립은 읽기만 가능
- 공개 설정된 컬렉션은 누구나 읽기 가능
```

---

## 🛠️ 자주 하는 작업

### 새로운 API 엔드포인트 추가

```bash
# 1. 파일 생성
touch api/[feature]/[action].ts

# 2. 기본 구조
# api/[feature]/[action].ts
export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', 'https://yourdomain.com');

  // 메소드 검사
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 인증 토큰 검증
    const token = req.headers.authorization?.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // 비즈니스 로직

    // 응답
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

# 3. 테스트
curl -X POST http://localhost:5173/api/[feature]/[action] \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### 프론트엔드에서 API 호출

```typescript
// src/components/MyComponent.tsx
import { useClips } from '../hooks/useClips';

function MyComponent() {
  const { clips, isLoading, error, fetchClips } = useClips();

  useEffect(() => {
    fetchClips({ category: 'AI', limit: 10 });
  }, []);

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <div>
      {clips.map(clip => (
        <div key={clip.id}>{clip.title}</div>
      ))}
    </div>
  );
}
```

### Firestore 데이터 직접 확인

```bash
# Firebase Console 접속
# https://console.firebase.google.com/project/linkbrain-4a011/firestore

# 또는 Firebase CLI 사용
firebase login
firebase firestore:delete clips/[docId]
```

---

## 🐛 디버깅 팁

### API 디버깅
```bash
# 1. 개발 서버 로그 확인
npm run dev

# 2. API 직접 테스트
curl http://localhost:5173/api/analyze \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# 3. Vercel 로그 확인
vercel logs [function-name]
```

### Firestore 권한 오류
```
"PERMISSION_DENIED"가 나면?
→ 보안 규칙 확인 (firebase.rules 파일)
→ 인증 토큰이 제대로 전달되는지 확인
→ Firestore 권한 설정 재확인
```

### 환경변수 문제
```bash
# .env.local 파일에서 키 확인
cat .env.local | grep VITE_

# Vercel에서도 설정되어야 함
vercel env ls

# Vercel 환경변수 추가
vercel env add VITE_FIREBASE_API_KEY
```

---

## 📊 프로젝트 상태 확인

### 현재 진행률
```
개발 상태: 42% (프론트엔드 90%, 백엔드 20%, DB 0%, 인증 10%, 배포 0%)
예상 완료: 2025-12-16 (약 2주)
```

### 주간 목표
```
Week 1: 백엔드 API + 프론트엔드 연결 (목표: 74% 완료)
Week 2: 원문 저장 + 인증 + 배포 (목표: 100% 완료)
```

---

## 🤝 팀 커뮤니케이션

### 각 문서 역할
- **PROJECT_STATUS.md**: 현재 상황 공유
- **TECHNICAL_ANALYSIS.md**: 기술 결정 근거
- **IMPLEMENTATION_ROADMAP.md**: 일일 작업 계획
- **README_DEVELOPMENT.md**: 개발 팁 (이 파일)

### 진행 상황 업데이트
매일 최소 1회 이상 PROJECT_STATUS.md 업데이트

### 문제 해결
1. PROJECT_STATUS.md에서 관련 섹션 확인
2. TECHNICAL_ANALYSIS.md에서 기술 배경 이해
3. IMPLEMENTATION_ROADMAP.md에서 구체적 구현 패턴 참고

---

## 📝 체크리스트

### 개발 시작 전
- [ ] PROJECT_STATUS.md 읽기
- [ ] TECHNICAL_ANALYSIS.md 읽기
- [ ] IMPLEMENTATION_ROADMAP.md 읽기
- [ ] 로컬 개발 환경 설정 (npm install)
- [ ] .env.local 설정

### 매일 시작 시
- [ ] PROJECT_STATUS.md에서 오늘 목표 확인
- [ ] IMPLEMENTATION_ROADMAP.md에서 구체적 작업 내용 확인
- [ ] git status 확인
- [ ] npm run dev로 개발 서버 실행

### 작업 완료 후
- [ ] 테스트 (로컬 및 Vercel)
- [ ] git commit (의미있는 메시지)
- [ ] PROJECT_STATUS.md 업데이트
- [ ] 필요시 IMPLEMENTATION_ROADMAP.md 업데이트

---

## 🎓 추천 학습 순서

1. **개념 이해** (30분)
   - PROJECT_STATUS.md 전체 읽기

2. **아키텍처 학습** (1시간)
   - TECHNICAL_ANALYSIS.md의 데이터 흐름 섹션
   - Firestore 스키마 이해

3. **구현 방법 학습** (1시간)
   - IMPLEMENTATION_ROADMAP.md의 코드 템플릿
   - API 엔드포인트 패턴
   - Hook 작성 패턴

4. **실제 구현** (2-3시간)
   - Firestore 설정
   - 첫 번째 API 엔드포인트 구현
   - 테스트

---

## 🚀 빠른 성공 전략

### Day 1 (4시간)
1. Firestore 설정 (30분)
2. 첫 API 엔드포인트 (POST /api/clips/create) (1.5시간)
3. 클라이언트 Hook (1시간)
4. 테스트 (1시간)

### Day 2 (4시간)
1. 나머지 API 엔드포인트 (2시간)
2. 프론트엔드 연결 (1.5시간)
3. 테스트 및 디버깅 (30분)

### Day 3+ (진행 상황에 따라)
1. 원문 저장
2. 인증 통합
3. 배포

---

## 💡 최종 팁

1. **작은 단계로 진행**: 한 번에 한 API 엔드포인트만 구현
2. **자주 테스트**: 각 단계 후 로컬에서 테스트
3. **문서화**: 어려웠던 부분은 주석으로 남기기
4. **커밋 자주**: 의미있는 단위로 자주 커밋
5. **진행 상황 기록**: PROJECT_STATUS.md 자주 업데이트

---

## 📞 문제 발생 시

| 문제 | 확인할 곳 |
|------|----------|
| API 호출 안 됨 | CORS 설정, 인증 토큰, Vercel 로그 |
| Firestore 권한 오류 | 보안 규칙, 인증 상태 |
| 환경변수 오류 | .env.local, Vercel 환경변수 |
| 프론트엔드 연결 안 됨 | API URL, Hook 구현 |
| 배포 실패 | git status, npm run build, Vercel 로그 |

---

*마지막 업데이트: 2025-12-02*
*개발자: Claude Code (Haiku 4.5)*
