# 기분 + MBTI AI 음식 추천 웹앱

사용자가 기분과 MBTI를 입력하면 Gemini API가 음식 메뉴를 추천하는 Vercel용 웹앱입니다.

## 구조

```text
mood-mbti-food-app/
├─ index.html
├─ api/
│  └─ generate.js
├─ package.json
├─ .env.example
└─ .gitignore
```

## Vercel 배포

1. 이 폴더를 GitHub 저장소에 업로드합니다.
2. Vercel에서 해당 저장소를 Import 합니다.
3. Vercel 프로젝트의 `Settings → Environment Variables`에 다음 값을 등록합니다.
   - Name: `GEMINI_API_KEY`
   - Value: Google AI Studio에서 발급받은 키
4. 저장 후 재배포합니다.

API 키는 `index.html`에 넣지 않습니다. 서버리스 함수 `api/generate.js`가 Vercel 환경변수에서 읽습니다.

## 로컬 실행

```bash
npm i -g vercel
cp .env.example .env.local
# .env.local 안의 GEMINI_API_KEY 값을 실제 키로 수정
vercel dev
```

브라우저에서 안내된 로컬 주소를 엽니다.

## 사용 모델

기본 Gemini 모델은 `gemini-3.1-flash-lite`입니다. 필요하면 Vercel 환경변수 `GEMINI_MODEL`로 변경할 수 있습니다.
