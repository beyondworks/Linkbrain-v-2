/**
 * Glass Morphism Theme
 *
 * 반투명 유리 효과와 부드러운 그라데이션을 특징으로 하는 몽환적인 테마입니다.
 * Aurora 컬러 팔레트와 backdrop-filter blur를 활용합니다.
 */

import { createTheme, alpha } from '@mui/material/styles';

// ============================================================
// Design Tokens
// ============================================================

/** Aurora 컬러 팔레트 */
const aurora = {
  violet: '#8B5CF6',
  purple: '#A855F7',
  fuchsia: '#D946EF',
  pink: '#EC4899',
  rose: '#F43F5E',
  cyan: '#06B6D4',
  teal: '#14B8A6',
};

const palette = {
  mode: 'light',
  primary: {
    light: '#4A4A4A',
    main: '#1A1A1A',
    dark: '#000000',
    contrastText: '#FFFFFF',
  },
  secondary: {
    light: '#22D3EE',
    main: aurora.cyan,
    dark: '#0891B2',
    contrastText: '#FFFFFF',
  },
  error: {
    light: '#FDA4AF',
    main: aurora.rose,
    dark: '#E11D48',
    contrastText: '#FFFFFF',
  },
  warning: {
    light: '#FCD34D',
    main: '#F59E0B',
    dark: '#D97706',
    contrastText: '#000000',
  },
  success: {
    light: '#6EE7B7',
    main: '#10B981',
    dark: '#059669',
    contrastText: '#FFFFFF',
  },
  info: {
    light: '#7DD3FC',
    main: '#0EA5E9',
    dark: '#0284C7',
    contrastText: '#FFFFFF',
  },
  text: {
    primary: 'rgba(30, 27, 75, 0.95)',
    secondary: 'rgba(30, 27, 75, 0.7)',
    disabled: 'rgba(30, 27, 75, 0.4)',
  },
  background: {
    default: '#F0EEFF',
    paper: 'rgba(255, 255, 255, 0.6)',
  },
  divider: 'rgba(139, 92, 246, 0.15)',
  action: {
    active: 'rgba(139, 92, 246, 0.7)',
    hover: 'rgba(139, 92, 246, 0.08)',
    selected: 'rgba(139, 92, 246, 0.12)',
    disabled: 'rgba(30, 27, 75, 0.3)',
    disabledBackground: 'rgba(139, 92, 246, 0.12)',
    focus: 'rgba(139, 92, 246, 0.2)',
  },
  // 커스텀 Aurora 팔레트
  aurora,
};

const typography = {
  fontFamily: [
    '"SF Pro Display"',
    '"SF Pro Text"',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Pretendard Variable"',
    'Pretendard',
    'system-ui',
    'sans-serif',
  ].join(','),
  fontSize: 14,
  htmlFontSize: 16,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 600,
  h1: {
    fontWeight: 700,
    fontSize: '2.75rem',
    lineHeight: 1.15,
    letterSpacing: '-0.03em',
  },
  h2: {
    fontWeight: 700,
    fontSize: '2.25rem',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h3: {
    fontWeight: 600,
    fontSize: '1.875rem',
    lineHeight: 1.25,
    letterSpacing: '-0.02em',
  },
  h4: {
    fontWeight: 600,
    fontSize: '1.5rem',
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h5: {
    fontWeight: 600,
    fontSize: '1.25rem',
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
  },
  h6: {
    fontWeight: 600,
    fontSize: '1.125rem',
    lineHeight: 1.4,
    letterSpacing: '0',
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
    letterSpacing: '0',
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
    letterSpacing: '0.01em',
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0',
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 1.75,
    letterSpacing: '0.01em',
    textTransform: 'none',
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.5,
    letterSpacing: '0.02em',
  },
  overline: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    lineHeight: 2,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
};

/** Glass 효과를 위한 커스텀 값들 */
const glassEffects = {
  blur: {
    sm: 'blur(8px)',
    md: 'blur(16px)',
    lg: 'blur(24px)',
    xl: 'blur(40px)',
  },
  background: {
    light: 'rgba(255, 255, 255, 0.15)', // 투명도 더 증가 (0.25 -> 0.15)
    medium: 'rgba(255, 255, 255, 0.10)', // 투명도 더 증가 (0.15 -> 0.10)
    dark: 'rgba(255, 255, 255, 0.05)', // 투명도 더 증가 (0.10 -> 0.05)
  },
  border: {
    light: 'rgba(255, 255, 255, 0.5)',
    subtle: 'rgba(255, 255, 255, 0.3)',
  },
  gradient: {
    aurora: `linear-gradient(135deg, ${alpha(aurora.violet, 0.4)} 0%, ${alpha(aurora.fuchsia, 0.3)} 50%, ${alpha(aurora.cyan, 0.4)} 100%)`,
    mesh: `
      radial-gradient(at 40% 20%, ${alpha(aurora.violet, 0.3)} 0px, transparent 50%),
      radial-gradient(at 80% 0%, ${alpha(aurora.pink, 0.25)} 0px, transparent 50%),
      radial-gradient(at 0% 50%, ${alpha(aurora.cyan, 0.25)} 0px, transparent 50%),
      radial-gradient(at 80% 50%, ${alpha(aurora.fuchsia, 0.2)} 0px, transparent 50%),
      radial-gradient(at 0% 100%, ${alpha(aurora.teal, 0.25)} 0px, transparent 50%),
      radial-gradient(at 80% 100%, ${alpha(aurora.purple, 0.2)} 0px, transparent 50%)
    `,
  },
};

const customShadows = {
  none: 'none',
  sm: `0 4px 16px ${alpha(aurora.violet, 0.1)}`,
  md: `0 8px 24px ${alpha(aurora.violet, 0.12)}`,
  lg: `0 12px 32px ${alpha(aurora.violet, 0.15)}`,
  xl: `0 16px 48px ${alpha(aurora.violet, 0.18)}`,
  glow: `0 0 40px ${alpha(aurora.violet, 0.3)}`,
};

const components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarWidth: 'thin',
        background: glassEffects.gradient.mesh,
        backgroundColor: palette.background.default,
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        transition: 'background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        backgroundColor: glassEffects.background.light,
        backdropFilter: glassEffects.blur.lg,
        WebkitBackdropFilter: glassEffects.blur.lg,
        border: `1px solid ${glassEffects.border.light}`,
        boxShadow: customShadows.lg,
      },
      elevation0: {
        boxShadow: customShadows.none,
        backgroundColor: 'transparent',
        backdropFilter: 'none',
        border: 'none',
      },
      elevation1: {
        boxShadow: customShadows.sm,
        backgroundColor: glassEffects.background.dark,
        backdropFilter: glassEffects.blur.md,
      },
      elevation2: {
        boxShadow: customShadows.md,
        backgroundColor: glassEffects.background.medium,
      },
      elevation3: {
        boxShadow: customShadows.lg,
      },
      elevation4: {
        boxShadow: customShadows.xl,
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 6,  // 6 * 4px = 24px
        backgroundColor: glassEffects.background.light,
        backdropFilter: glassEffects.blur.lg,
        WebkitBackdropFilter: glassEffects.blur.lg,
        border: `1px solid ${glassEffects.border.light}`,
        boxShadow: customShadows.lg,
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 4,  // 4 * 4px = 16px
        textTransform: 'none',
        backdropFilter: glassEffects.blur.sm,
        WebkitBackdropFilter: glassEffects.blur.sm,
      },
      contained: {
        background: `linear-gradient(135deg, ${aurora.violet} 0%, ${aurora.fuchsia} 100%)`,
        boxShadow: customShadows.md,
        '&:hover': {
          background: `linear-gradient(135deg, ${aurora.purple} 0%, ${aurora.pink} 100%)`,
          boxShadow: customShadows.lg,
        },
      },
      outlined: {
        borderColor: alpha(aurora.violet, 0.5),
        backgroundColor: glassEffects.background.dark,
        '&:hover': {
          borderColor: aurora.violet,
          backgroundColor: glassEffects.background.medium,
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 3,  // 3 * 4px = 12px
        backgroundColor: glassEffects.background.medium,
        backdropFilter: glassEffects.blur.sm,
        border: `1px solid ${glassEffects.border.subtle}`,
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 4,  // 4 * 4px = 16px
          backgroundColor: glassEffects.background.dark,
          backdropFilter: glassEffects.blur.sm,
          '& fieldset': {
            borderColor: glassEffects.border.subtle,
          },
          '&:hover fieldset': {
            borderColor: alpha(aurora.violet, 0.5),
          },
          '&.Mui-focused fieldset': {
            borderColor: aurora.violet,
          },
        },
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 3,  // 3 * 4px = 12px
        backgroundColor: glassEffects.background.medium,
        backdropFilter: glassEffects.blur.md,
        border: `1px solid ${glassEffects.border.subtle}`,
        boxShadow: customShadows.md,
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: glassEffects.border.subtle,
      },
    },
  },
};

// ============================================================
// Theme Creation
// ============================================================

const glassmorphismTheme = createTheme({
  palette,
  typography,
  spacing: 8,
  shape: { borderRadius: 6 },  // 6 * 4px = 24px
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
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          // Updated background to match Liquid Glass theme (Blue Sunny Sky)
          backgroundImage: 'url("https://images.unsplash.com/photo-1515547016864-114f7a674ad6?q=80&w=3236&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed',
          backgroundColor: '#87CEEB', // Fallback
          minHeight: '100vh',
          transition: 'background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    // ... other component overrides ...
    MuiPaper: components.MuiPaper,
    MuiCard: components.MuiCard,
    MuiButton: components.MuiButton,
    MuiChip: components.MuiChip,
    MuiTextField: components.MuiTextField,
    MuiTooltip: components.MuiTooltip,
    MuiDivider: components.MuiDivider,
  },
});

// 커스텀 속성 추가
glassmorphismTheme.customShadows = customShadows;
glassmorphismTheme.glassEffects = glassEffects;

/**
 * 대시보드 스타일 설정 (통합 토큰 구조)
 * WeatherDashboard 등 템플릿 컴포넌트가 참조
 *
 * 모든 테마가 동일한 속성 키를 가져 완벽한 트랜지션 지원
 * 사용하지 않는 속성도 중립값(0, transparent 등)으로 포함
 */
glassmorphismTheme.dashboard = {
  // === 스타일 타입 ===
  style: 'glassmorphism', // 'glass'에서 변경하여 WeatherDashboard의 강제 opaque 오버레이(isGlass) 회피

  // === 아이콘 스타일 ===
  iconStyle: 'filled',
  iconWeight: 400,

  // === 카드 배경색 (6개 배열 고정) ===
  // linear-gradient 포맷으로 통일 (다른 테마와 트랜지션 호환)
  cardColors: [
    `linear-gradient(to bottom, ${glassEffects.background.light} 0%, ${glassEffects.background.light} 100%)`,
    `linear-gradient(to bottom, ${glassEffects.background.light} 0%, ${glassEffects.background.light} 100%)`,
    `linear-gradient(to bottom, ${glassEffects.background.light} 0%, ${glassEffects.background.light} 100%)`,
    `linear-gradient(to bottom, ${glassEffects.background.light} 0%, ${glassEffects.background.light} 100%)`,
    `linear-gradient(to bottom, ${glassEffects.background.light} 0%, ${glassEffects.background.light} 100%)`,
    `linear-gradient(to bottom, ${glassEffects.background.light} 0%, ${glassEffects.background.light} 100%)`,
  ],
  subCardColors: [
    `linear-gradient(to bottom, ${glassEffects.background.medium} 0%, ${glassEffects.background.medium} 100%)`,
    `linear-gradient(to bottom, ${glassEffects.background.medium} 0%, ${glassEffects.background.medium} 100%)`,
    `linear-gradient(to bottom, ${glassEffects.background.medium} 0%, ${glassEffects.background.medium} 100%)`,
    `linear-gradient(to bottom, ${glassEffects.background.medium} 0%, ${glassEffects.background.medium} 100%)`,
    `linear-gradient(to bottom, ${glassEffects.background.medium} 0%, ${glassEffects.background.medium} 100%)`,
    `linear-gradient(to bottom, ${glassEffects.background.medium} 0%, ${glassEffects.background.medium} 100%)`,
  ],

  // === 텍스트 색상 ===
  textColor: palette.text.primary,
  textSecondary: palette.text.secondary,

  // 텍스트 그림자 (투명 - 트랜지션 호환)
  textShadow: '0 0 0 rgba(0, 0, 0, 0)',

  // === Glass 효과 ===
  backdropFilter: glassEffects.blur.lg,
  WebkitBackdropFilter: glassEffects.blur.lg,

  // === 테두리 ===
  border: `1px solid ${glassEffects.border.light}`,
  borderColor: glassEffects.border.light,

  // === 그림자 ===
  shadow: customShadows.lg,

  // === 서브카드 스타일 ===
  subBorder: `1px solid ${glassEffects.border.subtle}`,
  subShadow: '0 0 0 0 rgba(0,0,0,0)',
  subBackdropFilter: glassEffects.blur.md,

  // === 구분선 ===
  dividerColor: glassEffects.border.subtle,

  // === Progress bar ===
  progressHeight: 4,
  progressTrackColor: 'rgba(0, 0, 0, 0.1)',
  progressBarColor: aurora.violet,
  progressGradient: true,

  // === 배경 ===
  background: 'transparent',

  // === Atmosphere (Texture/Gradient Layer) ===
  // 사용 안 함, body 배경 사용
  atmosphere: null,
  atmosphereOpacity: 0,

  // === 강조색 (모든 테마 공통 속성) ===
  accentColor: aurora.violet,

  // === 블롭 (Glass 전용) ===
  blobs: [
    { color: aurora.violet, size: 400, top: '5%', left: '10%', opacity: 0.4 },
    { color: aurora.fuchsia, size: 350, top: '20%', right: '5%', opacity: 0.35 },
    { color: aurora.cyan, size: 300, bottom: '15%', left: '5%', opacity: 0.3 },
    { color: aurora.pink, size: 280, bottom: '10%', right: '15%', opacity: 0.35 },
    { color: aurora.teal, size: 250, top: '50%', left: '50%', opacity: 0.25 },
  ],
};

export default glassmorphismTheme;
