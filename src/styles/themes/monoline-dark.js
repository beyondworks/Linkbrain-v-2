/**
 * Monoline Dark Theme
 *
 * 미니멀한 라인 기반 다크 UI 테마입니다.
 * 채움 없이 1px 테두리만으로 구성되며, 모노스페이스 타이포그래피를 사용합니다.
 * Lime accent로 포인트를 줍니다.
 */

import { createTheme, alpha } from '@mui/material/styles';

// ============================================================
// Design Tokens
// ============================================================

/** Monoline 컬러 팔레트 */
const mono = {
  black: '#0A0A0A',
  darkest: '#111111',
  darker: '#1A1A1A',
  dark: '#222222',
  mid: '#333333',
  light: '#666666',
  lighter: '#888888',
  lightest: '#AAAAAA',
  white: '#FFFFFF',
};

const accent = {
  lime: '#CCFF00',
  limeLight: '#E5FF66',
  limeDark: '#99CC00',
  cyan: '#00FFFF',
  cyanLight: '#66FFFF',
  cyanDark: '#00CCCC',
};

const palette = {
  mode: 'dark',
  primary: {
    light: accent.limeLight,
    main: accent.lime,
    dark: accent.limeDark,
    contrastText: mono.black,
  },
  secondary: {
    light: accent.cyanLight,
    main: accent.cyan,
    dark: accent.cyanDark,
    contrastText: mono.black,
  },
  error: {
    light: '#FF6B6B',
    main: '#FF4444',
    dark: '#CC3333',
    contrastText: mono.black,
  },
  warning: {
    light: '#FFCC66',
    main: '#FFAA00',
    dark: '#CC8800',
    contrastText: mono.black,
  },
  success: {
    light: accent.limeLight,
    main: accent.lime,
    dark: accent.limeDark,
    contrastText: mono.black,
  },
  info: {
    light: accent.cyanLight,
    main: accent.cyan,
    dark: accent.cyanDark,
    contrastText: mono.black,
  },
  text: {
    primary: mono.white,
    secondary: mono.lightest,
    disabled: mono.light,
  },
  background: {
    default: mono.black,
    paper: mono.black,
  },
  divider: mono.mid,
  action: {
    active: mono.lightest,
    hover: alpha(mono.white, 0.05),
    selected: alpha(accent.lime, 0.1),
    disabled: mono.mid,
    disabledBackground: alpha(mono.white, 0.05),
    focus: alpha(accent.lime, 0.15),
  },
  // 커스텀 팔레트
  mono,
  accent,
};

const typography = {
  fontFamily: [
    '"JetBrains Mono"',
    '"Fira Code"',
    '"SF Mono"',
    'Consolas',
    '"Liberation Mono"',
    'Menlo',
    'monospace',
  ].join(','),
  fontSize: 13,
  htmlFontSize: 16,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  h1: {
    fontFamily: '"Space Mono", "JetBrains Mono", monospace',
    fontWeight: 700,
    fontSize: '2.5rem',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    textTransform: 'uppercase',
  },
  h2: {
    fontFamily: '"Space Mono", "JetBrains Mono", monospace',
    fontWeight: 700,
    fontSize: '2rem',
    lineHeight: 1.25,
    letterSpacing: '-0.01em',
    textTransform: 'uppercase',
  },
  h3: {
    fontFamily: '"Space Mono", "JetBrains Mono", monospace',
    fontWeight: 700,
    fontSize: '1.5rem',
    lineHeight: 1.3,
    letterSpacing: '0',
  },
  h4: {
    fontFamily: '"Space Mono", "JetBrains Mono", monospace',
    fontWeight: 700,
    fontSize: '1.25rem',
    lineHeight: 1.35,
    letterSpacing: '0',
  },
  h5: {
    fontFamily: '"Space Mono", "JetBrains Mono", monospace',
    fontWeight: 500,
    fontSize: '1rem',
    lineHeight: 1.4,
    letterSpacing: '0.02em',
  },
  h6: {
    fontFamily: '"Space Mono", "JetBrains Mono", monospace',
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: 1.4,
    letterSpacing: '0.02em',
  },
  body1: {
    fontSize: '0.875rem',
    lineHeight: 1.7,
    letterSpacing: '0.01em',
  },
  body2: {
    fontSize: '0.8125rem',
    lineHeight: 1.7,
    letterSpacing: '0.01em',
  },
  subtitle1: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  subtitle2: {
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  button: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    lineHeight: 1.75,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  caption: {
    fontSize: '0.6875rem',
    lineHeight: 1.5,
    letterSpacing: '0.04em',
  },
  overline: {
    fontSize: '0.625rem',
    fontWeight: 500,
    lineHeight: 2,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
  },
};

/** Monoline 스타일 속성 */
const monolineStyles = {
  border: {
    thin: `1px solid ${mono.mid}`,
    accent: `1px solid ${accent.lime}`,
    hover: `1px solid ${mono.lighter}`,
  },
  grid: {
    pattern: `
      linear-gradient(${mono.darker} 1px, transparent 1px),
      linear-gradient(90deg, ${mono.darker} 1px, transparent 1px)
    `,
    size: '24px 24px',
  },
};

const customShadows = {
  none: 'none',
  sm: `0 0 0 1px ${mono.mid}`,
  md: `0 0 0 1px ${mono.mid}, 0 4px 16px ${alpha(mono.black, 0.5)}`,
  lg: `0 0 0 1px ${mono.mid}, 0 8px 32px ${alpha(mono.black, 0.6)}`,
  xl: `0 0 0 1px ${mono.mid}, 0 12px 48px ${alpha(mono.black, 0.7)}`,
  glow: `0 0 20px ${alpha(accent.lime, 0.3)}, 0 0 40px ${alpha(accent.lime, 0.1)}`,
  glowCyan: `0 0 20px ${alpha(accent.cyan, 0.3)}, 0 0 40px ${alpha(accent.cyan, 0.1)}`,
};

const components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarWidth: 'thin',
        scrollbarColor: `${mono.mid} ${mono.black}`,
        backgroundColor: mono.black,
        backgroundImage: monolineStyles.grid.pattern,
        backgroundSize: monolineStyles.grid.size,
        transition: 'background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: mono.black,
        },
        '&::-webkit-scrollbar-thumb': {
          background: mono.mid,
          border: `2px solid ${mono.black}`,
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        // rgba 형태로 명시하여 색상 트랜지션 보장
        backgroundColor: 'rgba(0, 0, 0, 0)',
        border: monolineStyles.border.thin,
        boxShadow: 'none',
        // ::before pseudo-element 제거 - dashboard에서 직접 배경 제어
        // 트랜지션 시 pseudo-element가 방해하지 않도록 함
      },
      elevation0: {
        border: '0px solid transparent',
      },
      elevation1: {
        border: monolineStyles.border.thin,
      },
      elevation2: {
        border: monolineStyles.border.thin,
        boxShadow: customShadows.md,
      },
      elevation3: {
        border: monolineStyles.border.thin,
        boxShadow: customShadows.lg,
      },
      elevation4: {
        border: monolineStyles.border.accent,
        boxShadow: customShadows.glow,
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        backgroundColor: 'transparent',
        border: monolineStyles.border.thin,
        boxShadow: 'none',
        position: 'relative',
        overflow: 'visible',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: alpha(mono.black, 0.9),
          zIndex: -1,
        },
        '&:hover': {
          borderColor: mono.lighter,
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontWeight: 500,
      },
      contained: {
        backgroundColor: accent.lime,
        color: mono.black,
        boxShadow: 'none',
        border: `1px solid ${accent.lime}`,
        '&:hover': {
          backgroundColor: accent.limeLight,
          boxShadow: customShadows.glow,
        },
      },
      outlined: {
        borderColor: mono.mid,
        color: mono.white,
        backgroundColor: 'transparent',
        '&:hover': {
          borderColor: accent.lime,
          color: accent.lime,
          backgroundColor: alpha(accent.lime, 0.05),
        },
      },
      text: {
        color: mono.lightest,
        '&:hover': {
          color: accent.lime,
          backgroundColor: 'transparent',
        },
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        border: monolineStyles.border.thin,
        '&:hover': {
          borderColor: accent.lime,
          color: accent.lime,
          backgroundColor: 'transparent',
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        backgroundColor: 'transparent',
        border: monolineStyles.border.thin,
        '&:hover': {
          borderColor: mono.lighter,
        },
      },
      filled: {
        backgroundColor: alpha(mono.white, 0.05),
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 0,
          backgroundColor: 'transparent',
          '& fieldset': {
            borderColor: mono.mid,
          },
          '&:hover fieldset': {
            borderColor: mono.lighter,
          },
          '&.Mui-focused fieldset': {
            borderColor: accent.lime,
            borderWidth: '1px',
          },
        },
        '& .MuiInputBase-input': {
          fontFamily: typography.fontFamily,
        },
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: mono.mid,
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 0,
        backgroundColor: mono.darkest,
        border: monolineStyles.border.thin,
        fontFamily: typography.fontFamily,
        fontSize: '0.75rem',
        letterSpacing: '0.02em',
      },
      arrow: {
        color: mono.mid,
      },
    },
  },
  MuiSlider: {
    styleOverrides: {
      root: {
        color: accent.lime,
        '& .MuiSlider-track': {
          border: 'none',
          height: '2px',
        },
        '& .MuiSlider-rail': {
          backgroundColor: mono.mid,
          height: '2px',
        },
        '& .MuiSlider-thumb': {
          width: '12px',
          height: '12px',
          borderRadius: 0,
          backgroundColor: accent.lime,
          '&:hover, &.Mui-focusVisible': {
            boxShadow: customShadows.glow,
          },
        },
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        backgroundColor: mono.mid,
        height: '2px',
      },
      bar: {
        borderRadius: 0,
        backgroundColor: accent.lime,
      },
    },
  },
  MuiSwitch: {
    styleOverrides: {
      root: {
        '& .MuiSwitch-track': {
          borderRadius: 0,
          backgroundColor: mono.mid,
        },
        '& .MuiSwitch-thumb': {
          borderRadius: 0,
        },
        '&.Mui-checked': {
          '& .MuiSwitch-thumb': {
            backgroundColor: accent.lime,
          },
          '& + .MuiSwitch-track': {
            backgroundColor: alpha(accent.lime, 0.3),
          },
        },
      },
    },
  },
};

// ============================================================
// Theme Creation
// ============================================================

const monolineDarkTheme = createTheme({
  palette,
  typography,
  spacing: 8,
  shape: { borderRadius: 0 },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
  },
  zIndex: {
    mobileStepper: 1000,
    fab: 1050,
    speedDial: 1050,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
  transitions: {
    duration: {
      shortest: 100,
      shorter: 150,
      short: 200,
      standard: 250,
      complex: 300,
      enteringScreen: 200,
      leavingScreen: 150,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
  components,
});

// 커스텀 속성 추가
monolineDarkTheme.customShadows = customShadows;
monolineDarkTheme.monolineStyles = monolineStyles;

/**
 * 대시보드 스타일 설정 (통합 토큰 구조)
 * WeatherDashboard 등 템플릿 컴포넌트가 참조
 *
 * 모든 테마가 동일한 속성 키를 가져 완벽한 트랜지션 지원
 * 사용하지 않는 속성도 중립값(0, transparent 등)으로 포함
 */
monolineDarkTheme.dashboard = {
  // === 스타일 타입 ===
  style: 'monoline',

  // === 아이콘 스타일 ===
  iconStyle: 'outline',
  iconWeight: 200,

  // === 카드 배경색 (6개 배열 고정) ===
  // linear-gradient 포맷으로 통일 (다른 테마와 트랜지션 호환)
  cardColors: [
    'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%)',
    'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%)',
    'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%)',
    'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%)',
    'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%)',
    'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%)',
  ],
  subCardColors: [
    'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%)',
    'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%)',
    'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%)',
    'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%)',
    'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%)',
    'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%)',
  ],

  // === 텍스트 색상 ===
  textColor: mono.white,
  textSecondary: mono.lightest,

  // 텍스트 그림자 (투명 - 트랜지션 호환)
  textShadow: '0 0 0 rgba(0, 0, 0, 0)',

  // === Glass 효과 (중립값: blur(0px)) ===
  backdropFilter: 'blur(0px)',
  WebkitBackdropFilter: 'blur(0px)',

  // === 테두리 ===
  border: `1px solid ${mono.mid}`,
  borderColor: mono.mid,

  // === 그림자 (중립값: 0 0 0 0 rgba(0,0,0,0)) ===
  shadow: '0 0 0 0 rgba(0,0,0,0)',

  // === 서브카드 스타일 ===
  subBorder: `1px solid ${mono.mid}`,
  subShadow: '0 0 0 0 rgba(0,0,0,0)',
  subBackdropFilter: 'blur(0px)',

  // === 구분선 ===
  dividerColor: 'rgba(255, 255, 255, 0.2)',

  // === Progress bar ===
  progressHeight: 2,
  progressTrackColor: 'rgba(255, 255, 255, 0.2)',
  progressBarColor: '#FFFFFF',
  progressGradient: false,

  // === 배경 ===
  background: mono.black,

  // === Atmosphere (Texture/Gradient Layer) ===
  // Skeuomorphism 전환 시 부드러운 트랜지션을 위해 동일한 그라데이션 정의 (투명도 0)
  atmosphere: `
    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px),
    repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px),
    linear-gradient(to bottom, #E0E0E0, #D1D1D6)
  `,
  atmosphereOpacity: 0,

  // === 강조색 (모든 테마 공통 속성) ===
  accentColor: accent.lime,

  // === 블롭 (Glass 전용, 다른 테마는 null) ===
  blobs: null,
};

export default monolineDarkTheme;
