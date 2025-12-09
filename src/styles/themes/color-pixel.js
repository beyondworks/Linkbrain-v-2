/**
 * Color Pixel Theme (Apple IIgs / GS/OS Style)
 *
 * 1980년대 후반 Apple IIgs의 컬러 GUI를 재현한 테마.
 * 레인보우 Apple 로고 색상과 디더링 패턴이 특징.
 * **픽셀 폰트 + 픽셀 아이콘 유지**
 *
 * ## 핵심 철학
 * - **16-Color Palette**: Apple IIgs의 제한된 컬러 팔레트 (CGA/EGA 시대 색감)
 * - **Dithered Background**: 파란색/보라색 세로 줄무늬 디더링
 * - **Hard Shadows**: 1px 하드 섀도우
 * - **Pixel Icons**: pixelarticons 사용 (Pixel Modernism과 동일)
 */

import { createTheme } from '@mui/material/styles';

// ============================================================
// Design Tokens - Apple IIgs 16-Color Palette (Visible on White)
// ============================================================

const colorPixel = {
  // Apple IIgs Palette (Adjusted for visibility on white background)
  black: '#1A1A1A',
  darkBlue: '#2A3F6F', // Muted Navy
  darkGreen: '#2D5A3D',
  darkCyan: '#3A7A7A', // Slightly more saturated Teal
  darkRed: '#8B3A3A', // Muted Maroon
  darkMagenta: '#6B4A6B', // Muted Purple
  brown: '#7A6A3A', // Olive/Brown
  lightGray: '#B8B8B8', // Muted Silver
  darkGray: '#5A5A5A', // Darker Gray for better visibility
  blue: '#3A5A9A', // Darker Blue
  green: '#3A7A4A', // Darker Green for visibility
  cyan: '#4A8A8A', // Darker Cyan
  red: '#B04545', // Muted Red
  magenta: '#8A4A8A', // Muted Magenta
  yellow: '#D4A010', // Saturated Gold for white bg visibility
  white: '#F5F5F0', // Off-white

  // UI Specific - Classic IIgs Lavender/Periwinkle Desktop
  desktopLavender: '#9090D0', // Light Blue-Purple (Lavender)
  windowWhite: '#F8F8F5', // Warm off-white
  borderLight: '#FFFFFF', // Highlight border (top/left)
  borderDark: '#5050A0', // Darker purple shadow
  shadow: '3px 3px 0 #5050A0', // Purple shadow
};

const palette = {
  mode: 'light',
  primary: {
    main: colorPixel.darkMagenta,
    contrastText: colorPixel.white,
  },
  secondary: {
    main: colorPixel.darkBlue,
    contrastText: colorPixel.white,
  },
  background: {
    default: colorPixel.desktopLavender,
    paper: colorPixel.windowWhite,
  },
  text: {
    primary: colorPixel.black,
    secondary: colorPixel.darkGray,
  },
  divider: colorPixel.black,
  warning: {
    main: colorPixel.yellow,
    light: colorPixel.brown,
    dark: colorPixel.red,
  },
  info: {
    main: colorPixel.cyan,
    light: colorPixel.blue,
    dark: colorPixel.darkCyan,
  },
  success: {
    main: colorPixel.green,
    dark: colorPixel.darkGreen,
  },
  error: {
    main: colorPixel.red,
    dark: colorPixel.darkRed,
  },
};

// ============================================================
// Theme Creation
// ============================================================

const colorPixelTheme = createTheme({
  palette,
  typography: {
    fontFamily: '"Pixelify Sans", "Chicago", "Geneva", "SF Mono", Menlo, Monaco, monospace',
    fontSize: 15,
    htmlFontSize: 16,
    h1: { fontWeight: 700, letterSpacing: '-0.02em', fontSize: '4rem' },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600, fontSize: '1.1rem' },
    subtitle2: { fontWeight: 600, fontSize: '1rem' },
    body1: { lineHeight: 1.4, fontWeight: 500, fontSize: '1.05rem' },
    body2: { lineHeight: 1.4, fontWeight: 500, fontSize: '0.95rem' },
    button: { fontWeight: 700, textTransform: 'uppercase' },
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
          transition: 'background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          // Classic Mac 3D Border: 외곽 + 내부 이중 테두리 + 입체 음영
          border: `1px solid ${colorPixel.black}`,
          boxShadow: `
            inset -1px -1px 0 ${colorPixel.borderDark},
            inset 1px 1px 0 ${colorPixel.borderLight},
            2px 2px 0 ${colorPixel.borderDark}
          `,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          border: `1px solid ${colorPixel.black}`,
          boxShadow: `
            inset -1px -1px 0 ${colorPixel.borderDark},
            inset 1px 1px 0 ${colorPixel.borderLight},
            1px 1px 0 ${colorPixel.borderDark}
          `,
          '&:hover': {
            backgroundColor: colorPixel.black,
            color: colorPixel.white,
            boxShadow: 'inset 1px 1px 0 #000, inset -1px -1px 0 #666',
          },
        },
      },
    },
  },
});

/**
 * 대시보드 스타일 설정
 * **style: 'pixel'** 로 설정하여 픽셀 아이콘 사용!
 */
colorPixelTheme.dashboard = {
  style: 'pixel', // !! 픽셀 아이콘 사용 (Pixel Modernism과 동일)
  iconStyle: 'filled',
  iconWeight: 400,

  // 카드 배경색 (White Windows)
  cardColors: [
    `linear-gradient(to bottom, ${colorPixel.windowWhite} 0%, ${colorPixel.windowWhite} 100%)`,
    `linear-gradient(to bottom, ${colorPixel.windowWhite} 0%, ${colorPixel.windowWhite} 100%)`,
    `linear-gradient(to bottom, ${colorPixel.windowWhite} 0%, ${colorPixel.windowWhite} 100%)`,
    `linear-gradient(to bottom, ${colorPixel.windowWhite} 0%, ${colorPixel.windowWhite} 100%)`,
    `linear-gradient(to bottom, ${colorPixel.windowWhite} 0%, ${colorPixel.windowWhite} 100%)`,
    `linear-gradient(to bottom, ${colorPixel.windowWhite} 0%, ${colorPixel.windowWhite} 100%)`,
  ],

  // 서브카드: 점 패턴 배경 (Classic Mac 스타일)
  subCardColors: [
    `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='1' height='1' fill='%236A6A6A'/%3E%3C/svg%3E"), ${colorPixel.windowWhite}`,
  ],

  // 텍스트
  textColor: colorPixel.black,
  textSecondary: colorPixel.darkGray,
  textShadow: '0 0 0 rgba(0, 0, 0, 0)',

  // 효과
  backdropFilter: 'none',
  WebkitBackdropFilter: 'none',

  // 테두리: 3D 입체 효과
  border: `1px solid ${colorPixel.black}`,
  borderColor: colorPixel.black,

  // 그림자: 3D 입체 박스
  shadow: `
    inset -1px -1px 0 ${colorPixel.borderDark},
    inset 1px 1px 0 ${colorPixel.borderLight},
    2px 2px 0 ${colorPixel.borderDark}
  `,

  // 서브카드 스타일: 3D 음각 효과 (inset)
  subBorder: `1px solid ${colorPixel.darkGray}`,
  subShadow: `
    inset 1px 1px 0 ${colorPixel.borderDark},
    inset -1px -1px 0 ${colorPixel.borderLight}
  `,
  subBackdropFilter: 'none',

  // 구분선
  dividerColor: colorPixel.black,

  // Progress (Solid Color Bar - No Gradient!)
  progressHeight: 10,
  // Track: 점 패턴
  progressTrackColor: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='1' height='1' fill='%235A5A5A'/%3E%3C/svg%3E"), ${colorPixel.lightGray}`,
  // Bar: Solid muted blue (no gradient)
  progressBarColor: colorPixel.darkBlue,
  progressGradient: false,

  // 배경
  background: colorPixel.desktopLavender,

  // Atmosphere (Classic IIgs Lavender Dithered Desktop - 세로 줄무늬)
  atmosphere: `
    url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='2' height='4' fill='%236060B0'/%3E%3Crect x='2' y='0' width='2' height='4' fill='%239090D0'/%3E%3C/svg%3E"),
    linear-gradient(to bottom, ${colorPixel.desktopLavender} 0%, ${colorPixel.desktopLavender} 100%)
  `,
  atmosphereOpacity: 1,
  
  // 타이틀바 스타일 플래그 (OS 윈도우 스타일)
  windowStyle: true,
};

export default colorPixelTheme;

