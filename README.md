# Make GEO - Generative Engine Optimization

AI 검색엔진(ChatGPT, Perplexity, Google SGE 등)에 최적화된 콘텐츠를 분석·생성하는 GEO 도구입니다.

## 프로젝트 구조

```
Make_GEO/
├── src/
│   ├── screens/          # 화면 (UI/프론트엔드)
│   │   ├── dashboard/    # 메인 대시보드
│   │   ├── analysis/     # 콘텐츠 분석 화면
│   │   ├── content/      # 콘텐츠 편집·생성 화면
│   │   ├── reports/      # 리포트·통계 화면
│   │   └── settings/     # 설정 화면
│   ├── actions/          # 동작 (로직/백엔드)
│   │   ├── api/          # 외부 API 연동
│   │   ├── services/     # 핵심 비즈니스 로직
│   │   ├── utils/        # 공통 유틸리티 함수
│   │   └── hooks/        # 상태 관리·커스텀 훅
│   ├── components/       # 공용 UI 컴포넌트
│   │   ├── common/       # 버튼, 인풋 등 기본 컴포넌트
│   │   └── layout/       # 헤더, 사이드바 등 레이아웃
│   ├── assets/           # 정적 리소스
│   │   ├── images/
│   │   └── styles/
│   └── config/           # 환경 설정·상수
├── public/               # 정적 파일
├── tests/                # 테스트 코드
│   ├── screens/
│   └── actions/
└── docs/                 # 문서
```

## 화면 (Screens)

| 화면 | 설명 |
|------|------|
| dashboard | 전체 GEO 점수, 현황 요약 |
| analysis | URL/콘텐츠 분석, AI 응답 노출 점검 |
| content | GEO 최적화 콘텐츠 작성·수정 |
| reports | 시간별 트래킹, 성과 리포트 |
| settings | API 키, 크롤링 설정 등 |

## 동작 (Actions)

| 모듈 | 설명 |
|------|------|
| api | AI 검색엔진 API, 크롤링 요청 처리 |
| services | GEO 점수 계산, 콘텐츠 최적화 서비스 |
| utils | 텍스트 파싱, 스키마 생성, 공통 함수 |
| hooks | 데이터 패칭, 전역 상태 관리 |
