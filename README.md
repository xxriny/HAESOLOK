# HAESOLOK

해소록은 교사의 민원 대응 기록, 마음 온도 체크, 주간 리포트, AI 대응 가이드 생성을 지원하는 Next.js 기반 MVP입니다.

## 주요 기능

- 마음 온도 체크 및 온도 변화 그래프
- 민원 기록 작성 및 목록 관리
- AI 민원 대응 가이드 생성
- 주간 리포트와 정서 케어 추천
- NEIS 학교 검색 및 학사일정 연동
- 공공데이터 활용 안내

## 빠른 실행

### 1. 요구 사항

- Node.js 18 이상
- npm 8 이상

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 만들고 아래처럼 시작할 수 있습니다.

```env
LLM_PROVIDER=mock
```

`mock` 모드는 외부 AI API 키 없이 예시 응답으로 실행됩니다.

실제 AI/API 연동이 필요하면 `.env.local.example`을 참고해 필요한 값을 채웁니다.

```env
# LLM Provider: gemini | openai | anthropic | mock
LLM_PROVIDER=gemini

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

# Optional public data API
NEIS_API_KEY=your_neis_api_key
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## 주요 명령어

```bash
# 개발 서버
npm run dev

# 린트
npm run lint

# 프로덕션 빌드
npm run build

# 빌드 결과 실행
npm run start
```

`npm run build`는 Windows 환경의 일부 네이티브 패키지 호환을 위해 `scripts/patch-readlink.cjs`를 먼저 로드하도록 구성되어 있습니다.

## 주요 페이지

| 경로 | 설명 |
| --- | --- |
| `/` | 시작 화면 |
| `/onboarding` | 교사/학교 정보 입력 |
| `/dashboard` | 대시보드 |
| `/check-in` | 마음 온도 체크 |
| `/temperature` | 온도 기록 그래프 |
| `/complaints` | 민원 기록 목록 |
| `/complaints/new` | 민원 기록 작성 |
| `/ai-guide` | AI 민원 대응 가이드 |
| `/report` | 주간 리포트 |
| `/care` | 정서 케어 추천 |
| `/data` | 공공데이터 안내 |
| `/profile` | 내 정보 확인 |

## API 연동 메모

- `LLM_PROVIDER=mock`: 외부 AI 호출 없이 예시 데이터 사용
- `LLM_PROVIDER=gemini`: `GEMINI_API_KEY` 필요
- `LLM_PROVIDER=openai`: `OPENAI_API_KEY` 필요
- `LLM_PROVIDER=anthropic`: `ANTHROPIC_API_KEY` 필요
- `NEIS_API_KEY`: 학교 검색과 학사일정 조회에 사용, 일부 호출은 키 없이도 제한적으로 동작할 수 있음

## 자세한 실행 안내

로컬 실행, 환경변수, 문제 해결은 [실행가이드.md](./실행가이드.md)를 참고하세요.
