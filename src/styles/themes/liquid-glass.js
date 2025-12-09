/**
 * Liquid Glass Theme
 *
 * CSS Filter와 SVG Distortion을 활용한 액체 같은 유리 질감 테마입니다.
 *
 * ## 핵심 철학
 * - **Liquid Distortion**: 배경이 물결치듯 왜곡되는 SVG 필터 효과.
 * - **Specular Highlight**: 강렬한 테두리 반사광으로 젤리 같은 입체감 표현.
 * - **Vivid & Transparent**: 투명한 화이트 베이스에 강렬한 배경 이미지.
 */

import { createTheme } from '@mui/material/styles';

// ============================================================
// Design Tokens - Liquid Glass CSS Variables
// ============================================================

const liquid = {
  // Increased transparency for more glass-like feel (0.35 -> 0.15)
  bgColor: 'rgba(255, 255, 255, 0.15)',
  // Restored Highlight (stronger border effect) for contour emphasis
  highlight: 'rgba(255, 255, 255, 0.6)', 
  text: '#ffffff',
  // Reduced hover glow opacity to 30% of original 0.4 -> 0.12
  hoverGlow: 'rgba(255, 255, 255, 0.12)',
  accent: '#ffffff', // Changed from red to white for luxury/glass feel
  grey: '#5b5b5b',
  // Simple Blue Sunny Sky Background (User Provided)
  backgroundUrl: 'https://images.unsplash.com/photo-1515547016864-114f7a674ad6?q=80&w=3236&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
};

const palette = {
  mode: 'dark',
  primary: {
    main: '#FFFFFF',
    contrastText: '#000000',
  },
  background: {
    default: '#87CEEB', // Sky Blue Fallback
    paper: liquid.bgColor,
  },
  text: {
    primary: liquid.text,
    secondary: 'rgba(255, 255, 255, 0.7)',
  },
};

// ============================================================
// Theme Creation
// ============================================================

const liquidGlassTheme = createTheme({
  palette,
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    // Unified offset-less text shadow for all text variants
    allVariants: { textShadow: '0 0 5px rgba(0,0,0,0.4)' },
    h1: { fontWeight: 700, textShadow: '0 0 10px rgba(0,0,0,0.3)' },
    h2: { fontWeight: 600 },
    body1: { fontWeight: 500 },
  },
  shape: {
    borderRadius: 6,  // 6 * 4px = 24px (glassmorphism과 동일)
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.background.default,
          backgroundImage: `url("${liquid.backgroundUrl}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed',
          // transition 속성은 GlobalStyles에서 관리
          transition: 'background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          backgroundImage: 'none',
          boxShadow: 'none', // Custom shadow 사용
        },
      },
    },
  },
});

/**
 * 대시보드 스타일 설정
 */
liquidGlassTheme.dashboard = {
  style: 'liquid-glass',
  iconStyle: 'filled',
  iconWeight: 600,
  
  // 특수 플래그: Liquid Glass 효과 활성화
  liquidEffect: true,

  // 카드 배경색 (투명 베이스, 오버레이 레이어로 처리됨)
  // linear-gradient 포맷으로 통일 (다른 테마와 트랜지션 호환)
  cardColors: [
    `linear-gradient(to bottom, ${liquid.bgColor} 0%, ${liquid.bgColor} 100%)`,
    `linear-gradient(to bottom, ${liquid.bgColor} 0%, ${liquid.bgColor} 100%)`,
    `linear-gradient(to bottom, ${liquid.bgColor} 0%, ${liquid.bgColor} 100%)`,
    `linear-gradient(to bottom, ${liquid.bgColor} 0%, ${liquid.bgColor} 100%)`,
    `linear-gradient(to bottom, ${liquid.bgColor} 0%, ${liquid.bgColor} 100%)`,
    `linear-gradient(to bottom, ${liquid.bgColor} 0%, ${liquid.bgColor} 100%)`,
  ],

  // 텍스트
  textColor: liquid.text,
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  textShadow: '0 0 5px rgba(0,0,0,0.4)', // 가독성을 위한 그림자 (Offset 없음)

  // 테두리 (Specular 효과로 대체되므로 투명)
  border: '1px solid transparent',
  borderColor: 'transparent',
  
  // 그림자 (CSS box-shadow) - Offset 제거 및 은은하게 수정
  // Old: '0 6px 6px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 0, 0, 0.1)'
  // New: 0 offset, diffuse, very subtle
  shadow: '0 0 20px rgba(0, 0, 0, 0.05), 0 0 40px rgba(0, 0, 0, 0.02)',

  // Liquid Specular Highlight (Corner-only highlight for pure glass effect)
  highlightColor: 'corner-only', // 특수 값: 좌상/우하 엣지만 강조

  // 서브카드 스타일 (linear-gradient 포맷으로 통일 - 트랜지션 호환)
  subCardColors: [
    `linear-gradient(to bottom, ${liquid.hoverGlow} 0%, ${liquid.hoverGlow} 100%)`,
    `linear-gradient(to bottom, ${liquid.hoverGlow} 0%, ${liquid.hoverGlow} 100%)`,
    `linear-gradient(to bottom, ${liquid.hoverGlow} 0%, ${liquid.hoverGlow} 100%)`,
    `linear-gradient(to bottom, ${liquid.hoverGlow} 0%, ${liquid.hoverGlow} 100%)`,
    `linear-gradient(to bottom, ${liquid.hoverGlow} 0%, ${liquid.hoverGlow} 100%)`,
    `linear-gradient(to bottom, ${liquid.hoverGlow} 0%, ${liquid.hoverGlow} 100%)`,
  ],
  subBorder: '1px solid transparent', // 투명 테두리 (트랜지션 호환)
  // 서브카드 그림자 - 하이라이트 강조 (좌상단, 우하단)
  subShadow: 'inset 1px 1px 0 rgba(255,255,255,0.3), inset -1px -1px 0 rgba(255,255,255,0.15)', 
  subBackdropFilter: 'blur(12px)', // 블러 증가

  // 구분선
  dividerColor: 'rgba(255, 255, 255, 0.2)',

  // Progress
  progressHeight: 8,
  progressTrackColor: 'rgba(0,0,0,0.2)',
  progressBarColor: 'linear-gradient(to right, rgba(255,255,255,0.3), #ffffff)', // Luxurious light beam effect
  progressGradient: false,

  // 배경 (CSS body에서 이미지로 처리, 여기선 fallback)
  background: 'transparent',

  // Atmosphere (사용 안 함, body 배경 사용)
  atmosphere: null,
  atmosphereOpacity: 0,
};

export default liquidGlassTheme;
