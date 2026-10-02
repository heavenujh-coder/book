# PFM AI Consultant - 월간 가계부 종합 결산 리포트

전문 개인재무관리(PFM) AI 컨설턴트 웹 애플리케이션입니다. 
수입·예산·지출 정밀 분석, 내림차순 지출 순위 바 차트 시각화, 구체적 절약 피드백, 그리고 여유자금 투자 포트폴리오를 제공합니다.

---

## 🚀 GitHub 및 Vercel 배포 가이드

### 1. GitHub 저장소(Repository)에 푸시
```bash
git init
git add .
git commit -m "feat: PFM AI Consultant applet"
git branch -M main
git remote add origin https://github.com/{사용자이름}/{저장소이름}.git
git push -u origin main
```

### 2. Vercel에서 배포하기
1. [Vercel 대시보드](https://vercel.com/dashboard)에 로그인합니다.
2. **Add New...** > **Project**를 클릭합니다.
3. 방금 푸시한 GitHub 저장소를 선택(Import)합니다.
4. **Project Settings**:
   - **Framework Preset**: `Vite` (자동 감지됨)
   - **Build Command**: `npm run build` (기본값)
   - **Output Directory**: `dist` (기본값)
   - **Install Command**: `npm install` (기본값)
5. **Environment Variables (환경 변수)**:
   - `GEMINI_API_KEY`: (선택/권장) Google AI Studio에서 발급받은 Gemini API 키를 등록합니다.
     *(키가 없어도 내장된 PFM 정밀 엔진을 통해 모든 보고서가 정상 산출됩니다.)*
6. **Deploy** 버튼을 누르면 약 1분 이내에 배포가 완료됩니다!

---

## 📁 주요 구성 파일
- `vercel.json`: Vercel SPA 라우팅 및 `/api/*` 서버리스 함수 리라이트 설정
- `api/pfm-consult.ts`: Vercel Serverless Function (Gemini 3.8 Flash 연동 및 폴백)
- `src/`: React 19 + TypeScript + Tailwind CSS UI 프론트엔드
- `src/utils/pfmEngine.ts`: PFM 결산, 유니코드 텍스트 바 차트 및 절약/투자 알고리즘 엔진
- `src/utils/presets.ts`: 한국형 4대 가계 프리셋 (사회초년생, 3인가구 외벌이, 프리랜서, 신혼부부)
