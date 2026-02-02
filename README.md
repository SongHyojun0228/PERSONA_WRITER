# Persona Writer

페르소나 라이터는 AI 기반의 글쓰기 보조 도구로, 작가들이 자신만의 세계관을 구축하고, 매력적인 캐릭터를 창조하며, 일관성 있는 스토리를 작성할 수 있도록 돕습니다.

## ✨ 주요 기능

-   **AI 글쓰기 어시스턴트:** Google Gemini 모델을 활용하여 글의 리듬감, 문체, 캐릭터의 일관성 등을 분석하고 제안합니다.
-   **캐릭터 관리:** 캐릭터 시트를 작성하고, 인물 관계도를 시각적으로 관리하여 복잡한 관계를 한눈에 파악할 수 있습니다.
-   **지능형 에디터:** 강력한 TipTap 에디터를 기반으로 맞춤법 검사, 복선 관리 등 글쓰기에 필요한 다양한 편의 기능을 제공합니다.
-   **작품 발행 및 커뮤니티:** 완성된 작품을 발행하여 다른 사용자들과 공유하고, '이야기 광장'에서 다른 작가들의 작품을 읽고 영감을 얻을 수 있습니다.
-   **영감 상점:** 활동을 통해 얻은 '영감' 포인트로 유료 작품을 구매하고, 작가에게 후원할 수 있습니다.

## 🛠️ 기술 스택

-   **Frontend:** React, TypeScript, Vite, Tailwind CSS, TipTap Editor, React Flow
-   **Backend:** Node.js, Express, TypeScript
-   **Database:** Supabase (PostgreSQL)
-   **AI:** Google Gemini API

## 🚀 설치 및 실행

### 1. 프로젝트 클론

```bash
git clone https://github.com/your-username/persona-writer.git
cd persona-writer
```

### 2. 종속성 설치

```bash
npm install
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 Supabase 및 Gemini API 키를 설정합니다.

```env
# Supabase
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
DATABASE_URL=YOUR_SUPABASE_DATABASE_URL
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

# Google Gemini
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### 4. 개발 서버 실행

프론트엔드와 백엔드 개발 서버를 동시에 실행합니다.

```bash
# 프론트엔드 개발 서버 (http://localhost:5173)
npm run dev

# 백엔드 개발 서버 (http://localhost:3001)
npm run server
```

### 5. 프로덕션 빌드

```bash
# 프론트엔드 빌드 (dist/ 폴더에 생성)
npm run build

# 백엔드 빌드 (dist-server/ 폴더에 생성)
npm run build:server
```

## ☁️ 배포

이 프로젝트는 프론트엔드와 백엔드를 분리하여 배포하는 것을 권장합니다.

### 백엔드 (Railway)

1.  프로젝트를 GitHub 저장소에 푸시합니다.
2.  Railway에 로그인하여 새 프로젝트를 만들고, 해당 GitHub 저장소를 연결합니다.
3.  Railway가 프로젝트의 `Dockerfile`을 자동으로 감지하여 빌드 및 배포를 시작합니다.
4.  Railway 프로젝트 설정의 'Variables' 탭에서 `.env` 파일에 설정했던 환경 변수들을 모두 추가합니다.
5.  배포가 완료되면 제공되는 공개 URL을 확인합니다.

### 프론트엔드 (Vercel)

1.  Vercel에 로그인하여 새 프로젝트를 만들고, 동일한 GitHub 저장소를 연결합니다.
2.  Vercel은 Vite 프로젝트를 자동으로 인식하며, 다음과 같이 설정합니다.
    -   **Build Command:** `npm run build`
    -   **Output Directory:** `dist`
3.  Vercel 프로젝트 설정의 'Environment Variables' 탭에서 다음 변수들을 추가합니다.
    -   `VITE_API_URL`: Railway에 배포된 백엔드의 공개 URL
    -   `VITE_SUPABASE_URL`: Supabase 프로젝트 URL
    -   `VITE_SUPABASE_ANON_KEY`: Supabase 공개(anon) 키
4.  저장소의 `main` 브랜치에 푸시하면 Vercel이 자동으로 새 버전을 배포합니다.