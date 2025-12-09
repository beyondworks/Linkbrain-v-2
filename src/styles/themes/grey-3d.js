/**
 * Grey 3D Desktop UI Theme (Mac OS 8 Platinum Style)
 *
 * 1997년 Mac OS 8의 Platinum 인터페이스를 재현한 테마.
 * 3D 입체 버튼, 그레이 배경, 양각/음각 효과가 특징.
 * **현대적 폰트 + Material Icons 사용**
 *
 * ## 핵심 철학
 * - **Platinum Grey**: 밝은 회색 계열 UI
 * - **3D Beveled**: 입체감 있는 버튼/윈도우 (양각/음각)
 * - **Clean Background**: 도트 패턴 없이 순수 그레이
 * - **Modern Typography**: 현대적 산세리프 폰트
 */

import { createTheme } from '@mui/material/styles';

// ============================================================
// Design Tokens - Mac OS 8 Platinum Style (Modern)
// ============================================================

const platinum = {
  // Platinum Grey Palette
  white: '#FFFFFF',
  lightest: '#EEEEEE', // Window background (원래대로)
  light: '#DDDDDD', // Desktop background
  medium: '#CCCCCC', // Inactive elements
  dark: '#999999', // Borders, shadows
  darker: '#666666', // Text secondary
  darkest: '#333333', // Text primary
  black: '#000000',

  // 3D Effect Colors
  highlight: '#FFFFFF', // Top/Left edge highlight
  shadow: '#808080', // Bottom/Right edge shadow (원래대로)
  deepShadow: '#404040', // Outer shadow (원래대로)

  // Accent Colors (Mac OS 8 Appearance Manager)
  lavender: '#9999CC', // Default accent
  lime: '#99CC99',
  magenta: '#CC99CC',

  // UI Specific
  desktop: '#CCCCCC', // Platinum desktop (원래대로)
  window: '#DDDDDD', // Window background (원래대로)
};

const palette = {
  mode: 'light',
  primary: {
    main: platinum.lavender,
    contrastText: platinum.black,
  },
  secondary: {
    main: platinum.darker,
    contrastText: platinum.white,
  },
  background: {
    default: platinum.desktop,
    paper: platinum.window,
  },
  text: {
    primary: platinum.darkest,
    secondary: platinum.darker,
  },
  divider: platinum.dark,
  warning: {
    main: '#CC9933',
    light: '#DDAA44',
    dark: '#AA7722',
  },
  info: {
    main: '#6699AA',
    light: '#88BBCC',
    dark: '#447788',
  },
  success: {
    main: '#669966',
    dark: '#447744',
  },
  error: {
    main: '#AA5555',
    dark: '#884444',
  },
};

// ============================================================
// Theme Creation
// ============================================================

const grey3dTheme = createTheme({
  palette,
  typography: {
    // 현대적 산세리프 폰트
    fontFamily: '"SF Pro Display", "Helvetica Neue", "Segoe UI", "Roboto", Arial, sans-serif',
    fontSize: 14,
    htmlFontSize: 16,
    h1: { fontWeight: 600, letterSpacing: '-0.02em', fontSize: '3rem' },
    h2: { fontWeight: 600, letterSpacing: '-0.01em' },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 500 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    subtitle1: { fontWeight: 500, fontSize: '0.95rem' },
    subtitle2: { fontWeight: 500, fontSize: '0.85rem' },
    body1: { lineHeight: 1.5, fontWeight: 400, fontSize: '0.95rem' },
    body2: { lineHeight: 1.5, fontWeight: 400, fontSize: '0.875rem' },
    button: { fontWeight: 500, textTransform: 'none' },
    caption: { fontSize: '0.75rem', fontWeight: 400 },
  },
  shape: {
    borderRadius: 0, // 원래대로 직각
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
          // Mac OS 8 3D Window Border (양각)
          border: `1px solid ${platinum.dark}`,
          boxShadow: `
            inset -1px -1px 0 ${platinum.shadow},
            inset 1px 1px 0 ${platinum.highlight},
            1px 1px 0 ${platinum.deepShadow}
          `,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          border: `1px solid ${platinum.dark}`,
          boxShadow: `
            inset -1px -1px 0 ${platinum.shadow},
            inset 1px 1px 0 ${platinum.highlight}
          `,
          '&:hover': {
            backgroundColor: platinum.medium,
          },
          '&:active': {
            boxShadow: `
              inset 1px 1px 0 ${platinum.shadow},
              inset -1px -1px 0 ${platinum.highlight}
            `,
          },
        },
      },
    },
  },
});

/**
 * 대시보드 스타일 설정
 */
grey3dTheme.dashboard = {
  style: 'grey3d', // 현대적 아이콘 사용 (pixel 아님)
  iconStyle: 'filled',
  iconWeight: 400,

  // 카드 배경색 (Platinum Window)
  cardColors: [
    `linear-gradient(to bottom, ${platinum.window} 0%, ${platinum.window} 100%)`,
    `linear-gradient(to bottom, ${platinum.window} 0%, ${platinum.window} 100%)`,
    `linear-gradient(to bottom, ${platinum.window} 0%, ${platinum.window} 100%)`,
    `linear-gradient(to bottom, ${platinum.window} 0%, ${platinum.window} 100%)`,
    `linear-gradient(to bottom, ${platinum.window} 0%, ${platinum.window} 100%)`,
    `linear-gradient(to bottom, ${platinum.window} 0%, ${platinum.window} 100%)`,
  ],

  // 서브카드: 순수 그레이 (패턴 없음)
  subCardColors: [
    `linear-gradient(to bottom, ${platinum.lightest} 0%, ${platinum.lightest} 100%)`,
  ],

  // 텍스트
  textColor: platinum.darkest,
  textSecondary: platinum.darker,
  textShadow: '0 0 0 rgba(0, 0, 0, 0)',

  // 효과
  backdropFilter: 'none',
  WebkitBackdropFilter: 'none',

  // 테두리: 3D 입체 효과
  border: `1px solid ${platinum.dark}`,
  borderColor: platinum.dark,

  // 그림자: 3D Beveled Box (양각) - 원래대로
  shadow: `
    inset -1px -1px 0 ${platinum.shadow},
    inset 1px 1px 0 ${platinum.highlight},
    1px 1px 0 ${platinum.deepShadow}
  `,

  // 서브카드 스타일: 3D 음각 효과 (Inset/Sunken)
  subBorder: `1px solid ${platinum.dark}`,
  subShadow: `
    inset 1px 1px 0 ${platinum.shadow},
    inset -1px -1px 0 ${platinum.highlight}
  `,
  subBackdropFilter: 'none',

  // 구분선
  dividerColor: platinum.dark,

  // Progress
  progressHeight: 10,
  progressTrackColor: platinum.medium,
  progressBarColor: platinum.lavender,
  progressGradient: false,

  // 배경: 순수 그레이 (패턴 없음)
  background: platinum.desktop,

  // Atmosphere: 순수 그레이 (도트 패턴 제거)
  atmosphere: `
    linear-gradient(to bottom, ${platinum.desktop} 0%, ${platinum.desktop} 100%)
  `,
  atmosphereOpacity: 1,

  // 타이틀바 스타일 플래그 (OS 윈도우 스타일 - 현대화)
  windowStyle: true,
};

export default grey3dTheme;

