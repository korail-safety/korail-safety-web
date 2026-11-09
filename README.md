# korail-safety-web

생성형 AI 기반 철도 안전교육 영상 자동화 서비스 웹 레포지토리 (한국철도공사 서울본부 미래내일 일경험)

## 기술 스택

- Next.js (App Router) · TypeScript · Tailwind CSS
- TanStack Query · axios
- react-hook-form · zod
- 폴더 구조: [Feature-Sliced Design](https://fsd.how/)

## 시작하기

```bash
npm install
cp .env.example .env.local   # 환경 변수 설정
npm run dev                  # http://localhost:3000
```

## 스크립트

| 명령어             | 설명                    |
| ------------------ | ----------------------- |
| `npm run dev`      | 개발 서버               |
| `npm run build`    | 프로덕션 빌드           |
| `npm run lint`     | ESLint                  |
| `npm run lint:fsd` | FSD 구조 검사 (Steiger) |
| `npm run format`   | Prettier 포맷팅         |

## 폴더 구조

```
app/            # Next.js 라우팅 전용 (src/pages의 화면을 re-export)
pages/          # 비워둠 — Next가 src/pages를 Pages Router로 인식하지 않게 하기 위함
src/
├─ app/         # 전역 설정: entrypoint(Providers), styles
├─ pages/       # 페이지 단위 화면
├─ widgets/     # 여러 feature/entity를 조합한 큰 UI 블록
├─ features/    # 사용자 행동 단위 (보고서 업로드, 영상 생성 등)
├─ entities/    # 도메인 데이터 (report, video, scene 등)
└─ shared/      # 도메인과 무관한 공통 코드 (api, ui, config, lib)
```

### 규칙

1. import는 위 레이어 → 아래 레이어 방향으로만 (app → pages → widgets → features → entities → shared)
2. 같은 레이어의 다른 슬라이스끼리는 import 금지
3. 슬라이스는 `index.ts`(Public API)로만 가져오기 — `@/entities/video` (O), `@/entities/video/ui/VideoCard` (X)

PR 전에 `npm run lint:fsd`로 규칙 위반을 확인하세요.
