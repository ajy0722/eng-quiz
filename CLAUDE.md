# eng-quiz — 전공 암기 퀴즈 웹앱

모바일 우선 + 오프라인 동작하는 전공 과목(전자회로, 회로이론, 전자기학, 디지털신호처리 등) 암기 퀴즈 PWA.
스택: Vite + React + TypeScript, KaTeX, Vercel 배포. 기록은 `src/storage.ts`에 격리된 localStorage(추후 Supabase 교체 예정).

## 콘텐츠 구조 (핵심 불변식)

과목을 추가할 때 엔진 코드(`src/engine/*`, `src/content/registry.ts`)는 절대 수정하지 않는다. 폴더/파일 추가만으로 동작해야 한다.

- `src/content/<subjectId>/subject.ts` — 과목명 + 장(chapter) 목록 (`SubjectInfo`)
- `src/content/<subjectId>/<formulaId>.ts` — 식 하나당 파일 하나 (`FormulaContent`)
  - `conceptQuestions`: 4지선다 개념 문제 배열, 정답은 항상 정확히 1개
  - `numericGenerator` (선택): `randomParams/isValid/correct/mistakes/prompt/explanation` 계약을 따르는 수치 문제 생성기
- `src/content/registry.ts`가 `import.meta.glob`으로 자동 수집

정답 타입은 `src/types/answer.ts`의 `real | complex | symbolic` 세 가지로 일반화되어 있고, 비교/표시 로직은 `src/engine/answerCheck.ts`에 있다.

## 작업 규칙

### 1) "새 식 추가: <과목> <식>" 요청을 받으면

1. 해당 과목 폴더에 식 1개당 파일 1개로 콘텐츠 파일 생성
   - 개념 문제 8개 이상, 각각 정답 정확히 1개
   - 수치로 의미가 있으면 `numericGenerator` 추가 (적용 조건을 만족하는 값만 생성, 흔한 실수 기반 오답 포함)
2. 적용 조건과 물리적 가정을 해설(explanation)에 명시
3. `npm run test`로 전체 테스트 통과 확인 — **통과 전에는 커밋 금지**
4. 테스트 통과 후 커밋. 원격 저장소가 연결되어 있으면 push까지 수행 (아직 연결 전이면 로컬 커밋만 하고 push는 생략, 사용자에게 안내)

### 2) "sources/<파일> 에서 식 뽑아줘" 요청을 받으면

`sources/`는 `.gitignore`에 포함된 강의자료 폴더(저장소에 커밋되지 않음). 이 요청을 받으면:

1. 암기 가치가 있는 식 후보를 표로 제시 (식, 장, 적용 조건 컬럼)
2. 사용자가 고른 식만 등록 — **승인 없이 콘텐츠로 등록 금지**

### 3) 2단계로 미룬 기능 — 요청 전까지 구현 금지

- 시험일 기반 출제 가중치
- Supabase 동기화

## 품질 조건

- `tests/registry.test.ts`: 레지스트리 전체를 순회하며 모든 `numericGenerator`를 1000회 실행해 (a) 정답이 식과 일치 (b) 오답끼리·오답과 정답이 겹치지 않음 (c) 적용 조건(`isValid`) 만족을 검증하는 단일 테스트
- `tests/concept-question.test.ts`: 모든 개념 문제의 정답이 정확히 1개인지 검증
- `tests/fixtures/`의 3종 샘플(complex/real/symbolic)은 answer-type 엔진 자체를 검증하기 위한 것으로, **실제 콘텐츠로 등록하지 않는다**
- 테스트 통과 전 커밋 금지
