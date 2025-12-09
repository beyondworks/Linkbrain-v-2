/**
 * Pixel GUI Modernism Theme
 *
 * 픽셀 그리드 위에서 만든 흑백/저채도 그래픽 UI.
 * 초기 Macintosh, Susan Kare 아이콘, 흑백 GUI 시대의 미학을 재해석.
 *
 * ## 핵심 철학
 * - **Cool Monochrome**: 아주 살짝 푸른빛이 도는 쿨 그레이(Cool Gray) 흑백 팔레트.
 * - **1px Grid & Dither**: 1px 솔리드 라인과 디더링(점 패턴) 배경으로 텍스처 표현.
 * - **Pixel Art**: 고정 픽셀 캔버스, 디테일 최소화.
 * - **Functionality**: 그림자/입체감/텍스처 대신 구조 요소로 계층 표현.
 */

import { createTheme } from '@mui/material/styles';

// ============================================================
// Design Tokens - Pixel GUI Modernism (Retro Macintosh Style)
// ============================================================

const pixel = {
  // Cool Blue-Gray Palette (Higher Blue Tone)
  bg: '#D0DBEA', // More saturated Blue-Gray
  bgElevated: '#EAF2FA', // Cool Blue-White
  fg: '#152035', // Deep Navy-Gray
  border: '#2A3950', // Blue-Gray border
  borderLight: '#FFFFFF', // Highlight border (top/left)
  borderDark: '#1A2540', // Shadow border (bottom/right)
  borderMuted: '#8595AD', // Muted Blue-Gray
  selectionBg: '#2A3950',
  selectionFg: '#EAF2FA',
  disabledFg: '#A0AEC2',
  shadow: '2px 2px 0 #2A3950', // Thicker, more clunky shadow
};

const palette = {
  mode: 'light',
  primary: {
    main: pixel.fg,
    contrastText: pixel.bgElevated,
  },
  secondary: {
    main: pixel.borderMuted,
    contrastText: pixel.bgElevated,
  },
  background: {
    default: pixel.bg,
    paper: pixel.bgElevated,
  },
  text: {
    primary: pixel.fg,
    secondary: pixel.borderMuted,
  },
  divider: pixel.border,
};

// ============================================================
// Theme Creation
// ============================================================

const pixelModernismTheme = createTheme({
  palette,
  typography: {
    fontFamily: '"Pixelify Sans", "Chicago", "Geneva", "SF Mono", Menlo, Monaco, monospace',
    // Increase base font size for "clunky" look
    fontSize: 16, 
    htmlFontSize: 16,
    // Make headings bolder and tighter
    h1: { fontWeight: 700, letterSpacing: '-0.03em', fontSize: '4.5rem' }, 
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600, fontSize: '1.1rem' },
    subtitle2: { fontWeight: 600, fontSize: '1rem' },
    body1: { lineHeight: 1.4, fontWeight: 500, fontSize: '1.1rem' }, // Larger body text
    body2: { lineHeight: 1.4, fontWeight: 500, fontSize: '1rem' },
    button: { fontWeight: 700, textTransform: 'uppercase', fontSize: '1rem' },
    caption: { fontSize: '0.85rem', fontWeight: 500 },
  },
  shape: {
    borderRadius: 0,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.background.default,
          // 테마 전환 시 부드러운 트랜지션
          transition: 'background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          // Classic Mac 3D Border: 외곽 + 내부 이중 테두리 + 입체 음영
          border: `1px solid ${pixel.border}`,
          boxShadow: `
            inset -1px -1px 0 ${pixel.borderDark},
            inset 1px 1px 0 ${pixel.borderLight},
            2px 2px 0 ${pixel.borderDark}
          `,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          border: `1px solid ${pixel.border}`,
          boxShadow: `
            inset -1px -1px 0 ${pixel.borderDark},
            inset 1px 1px 0 ${pixel.borderLight},
            1px 1px 0 ${pixel.borderDark}
          `,
          '&:hover': {
            backgroundColor: pixel.selectionBg,
            color: pixel.selectionFg,
            boxShadow: 'inset 1px 1px 0 #000, inset -1px -1px 0 #666',
          },
        },
      },
    },
  },
});

/**
 * 대시보드 스타일 설정
 */
pixelModernismTheme.dashboard = {
  style: 'pixel',
  iconStyle: 'filled',
  iconWeight: 400, 

  // 카드 배경색 (Cool White)
  cardColors: [
    `linear-gradient(to bottom, ${pixel.bgElevated} 0%, ${pixel.bgElevated} 100%)`,
    `linear-gradient(to bottom, ${pixel.bgElevated} 0%, ${pixel.bgElevated} 100%)`,
    `linear-gradient(to bottom, ${pixel.bgElevated} 0%, ${pixel.bgElevated} 100%)`,
    `linear-gradient(to bottom, ${pixel.bgElevated} 0%, ${pixel.bgElevated} 100%)`,
    `linear-gradient(to bottom, ${pixel.bgElevated} 0%, ${pixel.bgElevated} 100%)`,
    `linear-gradient(to bottom, ${pixel.bgElevated} 0%, ${pixel.bgElevated} 100%)`,
  ],

  // 서브카드: 점 패턴 배경 (Classic Mac 스타일)
  subCardColors: [
    `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='1' height='1' fill='%238595AD'/%3E%3C/svg%3E"), ${pixel.bgElevated}`,
  ],

  // 텍스트
  textColor: pixel.fg,
  textSecondary: pixel.borderMuted,
  textShadow: '0 0 0 rgba(0, 0, 0, 0)',

  // 효과
  backdropFilter: 'none',
  WebkitBackdropFilter: 'none',
  
  // 테두리: 3D 입체 효과 (top/left 밝게, bottom/right 어둡게)
  border: `1px solid ${pixel.border}`,
  borderColor: pixel.border,
  
  // 그림자: 3D 입체 박스
  shadow: `
    inset -1px -1px 0 ${pixel.borderDark},
    inset 1px 1px 0 ${pixel.borderLight},
    2px 2px 0 ${pixel.borderDark}
  `,

  // 서브카드 스타일: 3D 음각 효과 (inset)
  subBorder: `1px solid ${pixel.borderMuted}`,
  subShadow: `
    inset 1px 1px 0 ${pixel.borderDark},
    inset -1px -1px 0 ${pixel.borderLight}
  `,
  subBackdropFilter: 'none',

  // 구분선
  dividerColor: pixel.border,

  // Progress
  progressHeight: 12,
  progressTrackColor: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='1' height='1' fill='%23000000'/%3E%3C/svg%3E"), #C8D0DC`,
  progressBarColor: pixel.fg,
  progressGradient: false,

  // 배경
  background: pixel.bg,

  // Atmosphere: 점 패턴
  atmosphere: `
    url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='1' height='1' fill='%23A0A8B8'/%3E%3C/svg%3E"),
    linear-gradient(to bottom, ${pixel.bg} 0%, ${pixel.bg} 100%)
  `,
  atmosphereOpacity: 1,
  
  // 타이틀바 스타일 플래그 (OS 윈도우 스타일)
  windowStyle: true,
};

export default pixelModernismTheme;
