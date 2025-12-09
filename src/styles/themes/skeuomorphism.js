/**
 * Skeuomorphism Theme (Classic iOS Weather App Style)
 *
 * 애플의 초기 iOS 날씨 앱과 계산기 스타일을 재해석한 테마입니다.
 *
 * ## 핵심 철학
 * - **Blue Sky Atmosphere**: 클래식한 파란 하늘 그라데이션 배경
 * - **Calculator Emboss**: 메인 카드는 계산기 버튼처럼 부드럽고 묵직한 볼록 엠보싱
 * - **Horizon Gloss**: 내부 작은 컨테이너는 상하가 명확히 나뉘는 젤리 광택 (Glossy Split)
 *
 * ## 규격 준수 전략
 * - Background Texture: `config.background` 값에 CSS Gradient 할당
 * - Glossy Card: `box-shadow`의 inset을 활용하여 입체감 표현
 */

import { createTheme } from '@mui/material/styles';

// ============================================================
// Design Tokens - Classic iOS Colors
// ============================================================

const classic = {
  // iOS Weather App Blue Sky
  skyTop: '#1C3B70', // Deep Blue
  skyBottom: '#5E8EBF', // Light Blue
  
  // Text Colors
  textMain: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.9)',
};

const palette = {
  mode: 'dark', // Dark mode base for white text priority
  primary: {
    main: '#FFFFFF',
    contrastText: '#003366',
  },
  background: {
    default: classic.skyTop,
    paper: 'rgba(255, 255, 255, 0.2)',
  },
  text: {
    primary: classic.textMain,
    secondary: classic.textSecondary,
  },
  divider: 'rgba(255, 255, 255, 0.4)',
};

// ============================================================
// Theme Creation
// ============================================================

const skeuomorphismTheme = createTheme({
  palette,
  typography: {
    fontFamily: '"Helvetica Neue", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 3,  // 3 * 4px = 12px
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.background.default,
          transition: 'background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          backgroundImage: 'none',
        },
      },
    },
  },
});

/**
 * 대시보드 스타일 설정
 */
skeuomorphismTheme.dashboard = {
  style: 'skeuomorphism',
  iconStyle: 'filled',
  iconWeight: 500,

  // [큰 컨테이너 - Main Cards]
  // 계산기 버튼 스타일: 중앙선 없이 부드럽게 볼록한(Convex) 엠보싱
  // 전체적인 덩어리감 표현
  cardColors: [
    'linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)',
    'linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)',
    'linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)',
    'linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)',
    'linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)',
    'linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)',
  ],

  // [작은 내부 컨테이너 - Sub Cards]
  // **상! 하! 음영 처리 (Horizon Split Gloss) - 완화된 버전**
  // 50% 지점에서 빛이 끊기지만, 대비를 조금 줄여 부드럽게 처리
  subCardColors: [
    'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.05) 51%, rgba(255,255,255,0.2) 100%)',
    'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.05) 51%, rgba(255,255,255,0.2) 100%)',
    'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.05) 51%, rgba(255,255,255,0.2) 100%)',
    'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.05) 51%, rgba(255,255,255,0.2) 100%)',
    'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.05) 51%, rgba(255,255,255,0.2) 100%)',
    'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.05) 51%, rgba(255,255,255,0.2) 100%)',
  ],


  // 텍스트
  textColor: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.8)',
  
  // 텍스트 그림자 (입체감: 상단 음영 + 하단 깊은 그림자)
  textShadow: '0 -1px 1px rgba(0, 0, 0, 0.3), 0 2px 5px rgba(0, 0, 0, 0.5)',

  // 효과
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
  
  // 테두리
  border: '1px solid rgba(255,255,255,0.3)',
  borderColor: 'rgba(255,255,255,0.3)',
  
  // 그림자 (Main Cards)
  // Calculator Emboss: 상단 하이라이트 + 하단 그림자 (Deep Box)
  shadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 8px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',

  // 서브카드 스타일 (Sub Cards)
  // 테두리와 그림자로 Horizon 효과 보조
  subBorder: '1px solid rgba(255,255,255,0.2)',
  subShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 1px rgba(0,0,0,0.1)',
  subBackdropFilter: 'none',

  // 구분선
  dividerColor: 'rgba(255,255,255,0.3)',

  // Progress
  progressHeight: 8,
  progressTrackColor: 'rgba(0,0,0,0.3)',
  progressBarColor: `linear-gradient(to bottom, #FFD700 0%, #FFAA00 100%)`,
  progressGradient: false,

  // 배경
  background: classic.skyTop,

  // Atmosphere
  atmosphere: `
    linear-gradient(to bottom, ${classic.skyTop} 0%, ${classic.skyBottom} 100%)
  `,
  atmosphereOpacity: 1,
};

export default skeuomorphismTheme;
