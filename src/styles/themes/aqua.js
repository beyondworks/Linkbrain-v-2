/**
 * Aqua UI Theme (Mac OS X 10.0–10.4 Style)
 *
 * 2001년 Mac OS X의 아이코닉한 Aqua 인터페이스를 재현한 테마.
 * Steve Jobs가 "lickable"하다고 표현한 캔디 젤 버튼과 물방울 같은 UI가 특징.
 *
 * ## 핵심 철학
 * - **Candy Gel Buttons**: 상단에 강한 흰색 하이라이트가 있는 반투명 젤리 버튼
 * - **Pinstripe Texture**: 미세한 수직 줄무늬 배경 패턴
 * - **Brushed Metal**: iTunes 스타일의 가로 브러시드 메탈 패널
 * - **Translucent Blue**: 반투명 파란색 컨트롤과 프로그레스 바
 * - **Soft Drop Shadows**: 부드럽고 확산된 그림자
 */

import { createTheme } from '@mui/material/styles';

// ============================================================
// Design Tokens - Mac OS X Aqua Style
// ============================================================

const aqua = {
  // Aqua Blue Palette (Authentic Mac OS X)
  blueHighlight: '#B8D4FF',  // Top of gel button
  blueLight: '#6BB3FA',      // Upper gradient
  blueMid: '#2E7CF6',        // Core Aqua blue
  blueDark: '#1461D8',       // Lower gradient
  blueDeep: '#0050C8',       // Bottom/shadow

  // Pulsing default button colors
  pulseLight: '#7FCFFF',
  pulseDark: '#0066CC',

  // Traffic Light Buttons (Classic style)
  trafficRed: '#FF5F57',
  trafficYellow: '#FEBC2E',
  trafficGreen: '#28C840',
  trafficInactive: '#DCDCDC',

  // Brushed Metal (iTunes/Finder toolbar)
  metalHighlight: '#FAFAFA',
  metalLight: '#ECECEC',
  metalMid: '#DDDDDD',
  metalDark: '#C8C8C8',
  metalShadow: '#A8A8A8',

  // Window Chrome
  windowBg: '#FFFFFF',
  windowTitleBar: 'linear-gradient(to bottom, #F8F8F8 0%, #E8E8E8 45%, #D8D8D8 50%, #E0E0E0 100%)',
  windowBorder: '#888888',

  // Pinstripe (Subtle vertical lines)
  pinstripeLight: 'rgba(255,255,255,0.4)',
  pinstripeDark: 'rgba(0,0,0,0.03)',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#555555',
  textDisabled: '#999999',

  // Selections
  selectionBg: 'rgba(46, 124, 246, 0.25)',
  selectionBorder: '#2E7CF6',

  // Panel backgrounds
  panelBg: '#ECECEC',
  contentBg: '#FFFFFF',

  // Scrollbar
  scrollThumb: 'rgba(46, 124, 246, 0.6)',
  scrollTrack: '#F0F0F0',
};

const palette = {
  mode: 'light',
  primary: {
    main: aqua.blueMid,
    light: aqua.blueLight,
    dark: aqua.blueDark,
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: aqua.metalDark,
    light: aqua.metalLight,
    dark: aqua.metalShadow,
    contrastText: aqua.textPrimary,
  },
  background: {
    default: aqua.panelBg,
    paper: aqua.windowBg,
  },
  text: {
    primary: aqua.textPrimary,
    secondary: aqua.textSecondary,
    disabled: aqua.textDisabled,
  },
  divider: aqua.metalDark,
  warning: {
    main: '#F5A623',
    light: '#F8C471',
    dark: '#D68910',
  },
  info: {
    main: aqua.blueMid,
    light: aqua.blueLight,
    dark: aqua.blueDark,
  },
  success: {
    main: '#34C759',
    light: '#5DD879',
    dark: '#248A3D',
  },
  error: {
    main: '#FF3B30',
    light: '#FF6961',
    dark: '#C41E3A',
  },
};

// ============================================================
// Pinstripe Pattern Generator
// ============================================================

const pinstripePattern = `
  repeating-linear-gradient(
    90deg,
    ${aqua.pinstripeLight} 0px,
    ${aqua.pinstripeLight} 1px,
    transparent 1px,
    transparent 2px
  )
`;

// ============================================================
// Brushed Metal Pattern (Horizontal strokes) - Used in cardColors
// ============================================================

const BRUSHED_METAL = `
  linear-gradient(to bottom,
    ${aqua.metalHighlight} 0%,
    ${aqua.metalLight} 100%
  )
`;

// ============================================================
// Aqua Gel Button Gradient
// ============================================================

const aquaGelGradient = `
  linear-gradient(to bottom,
    ${aqua.blueHighlight} 0%,
    ${aqua.blueLight} 15%,
    ${aqua.blueMid} 40%,
    ${aqua.blueDark} 85%,
    ${aqua.blueDeep} 100%
  )
`;

const aquaGelHover = `
  linear-gradient(to bottom,
    #C8E0FF 0%,
    ${aqua.blueHighlight} 15%,
    ${aqua.blueLight} 40%,
    ${aqua.blueMid} 85%,
    ${aqua.blueDark} 100%
  )
`;

const aquaGelActive = `
  linear-gradient(to bottom,
    ${aqua.blueDark} 0%,
    ${aqua.blueMid} 50%,
    ${aqua.blueLight} 100%
  )
`;

// ============================================================
// Theme Creation
// ============================================================

const aquaTheme = createTheme({
  palette,
  typography: {
    fontFamily: '"Lucida Grande", "Lucida Sans Unicode", "Helvetica Neue", Arial, sans-serif',
    fontSize: 13,
    htmlFontSize: 16,
    h1: {
      fontWeight: 400,
      letterSpacing: '-0.02em',
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 400,
      letterSpacing: '-0.01em',
    },
    h3: { fontWeight: 500 },
    h4: { fontWeight: 500 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    subtitle1: {
      fontWeight: 500,
      fontSize: '0.9rem',
    },
    subtitle2: {
      fontWeight: 600,
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: aqua.textSecondary,
    },
    body1: {
      lineHeight: 1.5,
      fontWeight: 400,
      fontSize: '0.9rem',
    },
    body2: {
      lineHeight: 1.5,
      fontWeight: 400,
      fontSize: '0.8rem',
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
      fontSize: '0.85rem',
    },
    caption: {
      fontSize: '0.7rem',
      fontWeight: 400,
      color: aqua.textSecondary,
    },
  },
  shape: {
    borderRadius: 5, // Classic Aqua rounded corners
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.background.default,
          backgroundImage: pinstripePattern,
          transition: 'background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          // Custom Aqua scrollbar
          '&::-webkit-scrollbar': {
            width: 15,
            height: 15,
          },
          '&::-webkit-scrollbar-track': {
            background: aqua.scrollTrack,
            borderRadius: 8,
          },
          '&::-webkit-scrollbar-thumb': {
            background: aqua.scrollThumb,
            borderRadius: 8,
            border: `2px solid ${aqua.scrollTrack}`,
            '&:hover': {
              background: aqua.blueMid,
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 6,
          border: `1px solid ${aqua.metalDark}`,
          // Aqua window shadow
          boxShadow: `
            0 3px 8px rgba(0, 0, 0, 0.15),
            0 1px 3px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.9)
          `,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          // Aqua Candy Gel Button
          background: aquaGelGradient,
          border: `1px solid ${aqua.blueDark}`,
          borderRadius: 5,
          color: '#FFFFFF',
          fontWeight: 500,
          textShadow: '0 -1px 0 rgba(0, 0, 0, 0.25)',
          padding: '6px 20px',
          minHeight: 22,
          // Candy gel shadow
          boxShadow: `
            inset 0 1px 0 rgba(255, 255, 255, 0.45),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1),
            0 1px 2px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(0, 86, 200, 0.1)
          `,
          '&:hover': {
            background: aquaGelHover,
            boxShadow: `
              inset 0 1px 0 rgba(255, 255, 255, 0.55),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1),
              0 2px 4px rgba(0, 0, 0, 0.25),
              0 0 8px rgba(46, 124, 246, 0.3)
            `,
          },
          '&:active': {
            background: aquaGelActive,
            boxShadow: `
              inset 0 2px 4px rgba(0, 0, 0, 0.3),
              inset 0 0 2px rgba(0, 0, 0, 0.2)
            `,
          },
          '&.Mui-disabled': {
            background: `linear-gradient(to bottom, ${aqua.metalLight} 0%, ${aqua.metalDark} 100%)`,
            color: aqua.textDisabled,
            border: `1px solid ${aqua.metalShadow}`,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
          },
        },
        outlined: {
          background: `linear-gradient(to bottom, ${aqua.windowBg} 0%, ${aqua.metalLight} 100%)`,
          color: aqua.textPrimary,
          border: `1px solid ${aqua.metalDark}`,
          textShadow: 'none',
          boxShadow: `
            inset 0 1px 0 rgba(255, 255, 255, 0.8),
            0 1px 2px rgba(0, 0, 0, 0.1)
          `,
          '&:hover': {
            background: `linear-gradient(to bottom, #FFFFFF 0%, ${aqua.metalLight} 100%)`,
            borderColor: aqua.blueMid,
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 14,
          borderRadius: 7,
          backgroundColor: aqua.metalMid,
          border: `1px solid ${aqua.metalShadow}`,
          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2)',
        },
        bar: {
          borderRadius: 6,
          background: `
            linear-gradient(to bottom,
              rgba(255, 255, 255, 0.4) 0%,
              rgba(255, 255, 255, 0.1) 50%,
              transparent 50%,
              rgba(0, 0, 0, 0.05) 100%
            ),
            linear-gradient(to bottom,
              ${aqua.blueHighlight} 0%,
              ${aqua.blueMid} 50%,
              ${aqua.blueDark} 100%
            )
          `,
          // Animated stripes for indeterminate
          backgroundSize: '100% 100%, 100% 100%',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          background: `linear-gradient(to bottom, ${aqua.windowBg} 0%, ${aqua.metalLight} 100%)`,
          border: `1px solid ${aqua.metalDark}`,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 1px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          background: `linear-gradient(to bottom, ${aqua.windowBg} 0%, ${aqua.metalLight} 100%)`,
          border: `1px solid ${aqua.metalDark}`,
          color: aqua.textPrimary,
          textTransform: 'none',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
          '&.Mui-selected': {
            background: aquaGelGradient,
            color: '#FFFFFF',
            textShadow: '0 -1px 0 rgba(0,0,0,0.25)',
            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.4),
              inset 0 -1px 2px rgba(0,0,0,0.15)
            `,
            '&:hover': {
              background: aquaGelHover,
            },
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: aqua.blueMid,
        },
        thumb: {
          background: `linear-gradient(to bottom, #FFFFFF 0%, ${aqua.metalLight} 100%)`,
          border: `1px solid ${aqua.metalShadow}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          '&:hover': {
            boxShadow: `0 0 0 4px rgba(46, 124, 246, 0.2), 0 1px 3px rgba(0,0,0,0.3)`,
          },
        },
        track: {
          background: aquaGelGradient,
          border: 'none',
        },
        rail: {
          background: aqua.metalMid,
          border: `1px solid ${aqua.metalShadow}`,
          opacity: 1,
        },
      },
    },
  },
});

/**
 * 대시보드 스타일 설정
 */
aquaTheme.dashboard = {
  style: 'aqua',
  iconStyle: 'filled',
  iconWeight: 400,

  // 카드 배경색 - Brushed Metal Panel with inner glow
  cardColors: [
    BRUSHED_METAL,
    BRUSHED_METAL,
    BRUSHED_METAL,
    BRUSHED_METAL,
    BRUSHED_METAL,
    BRUSHED_METAL,
  ],

  // 서브카드: Inset well (들어간 패널) - Classic Aqua style
  subCardColors: [
    `linear-gradient(to bottom, ${aqua.metalDark} 0%, ${aqua.metalLight} 8%, ${aqua.windowBg} 100%)`,
  ],

  // 텍스트
  textColor: aqua.textPrimary,
  textSecondary: aqua.textSecondary,
  textShadow: '0 1px 0 rgba(255, 255, 255, 0.8)', // Light emboss

  // 효과 - subtle blur for glass feel
  backdropFilter: 'none',
  WebkitBackdropFilter: 'none',

  // 테두리 - Classic Aqua window border
  border: `1px solid ${aqua.metalShadow}`,
  borderColor: aqua.metalShadow,

  // 그림자: Aqua window style (soft, diffuse)
  shadow: `
    0 3px 10px rgba(0, 0, 0, 0.12),
    0 1px 4px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -1px 0 rgba(0, 0, 0, 0.05)
  `,

  // 서브카드 스타일: Inset Well
  subBorder: `1px solid ${aqua.metalShadow}`,
  subShadow: `
    inset 0 1px 3px rgba(0, 0, 0, 0.15),
    inset 0 0 1px rgba(0, 0, 0, 0.1),
    0 1px 0 rgba(255, 255, 255, 0.8)
  `,
  subBackdropFilter: 'none',

  // 구분선
  dividerColor: aqua.metalDark,

  // Progress: Aqua Candy Bar
  progressHeight: 14,
  progressTrackColor: `linear-gradient(to bottom, ${aqua.metalDark} 0%, ${aqua.metalLight} 100%)`,
  progressBarColor: aquaGelGradient,
  progressGradient: true,

  // 배경: Pinstripe Pattern
  background: aqua.panelBg,

  // Atmosphere: Pinstripe Texture over gradient
  atmosphere: `
    ${pinstripePattern},
    linear-gradient(to bottom, ${aqua.metalLight} 0%, ${aqua.panelBg} 50%, ${aqua.metalMid} 100%)
  `,
  atmosphereOpacity: 1,

  // 타이틀바 스타일
  windowStyle: true,

  // Traffic light button colors (for potential window chrome)
  trafficLights: {
    close: aqua.trafficRed,
    minimize: aqua.trafficYellow,
    maximize: aqua.trafficGreen,
    inactive: aqua.trafficInactive,
  },

  // Hover effects
  hoverGlow: `0 0 8px rgba(46, 124, 246, 0.4)`,
};

export default aquaTheme;
