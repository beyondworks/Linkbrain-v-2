/**
 * Material Design Theme (Modern / Material You Inspired)
 *
 * 2024년 현대적인 머티리얼 디자인을 기반으로 한 클린하고 에어리한 테마입니다.
 *
 * ## 핵심 철학
 * - **Soft Elevation**: Offset 없이 확산되는 은은한 그림자 (Diffuse Shadow)
 * - **Rounded Cards**: 부드러운 라운드 모서리 (16-20px)
 * - **Airy Layout**: 넓은 여백과 가벼운 느낌
 * - **Cool Background**: 연한 블루/라벤더 계열 배경
 * - **Pure White Cards**: 깔끔한 흰색 카드
 *
 * ## 특징
 * | 항목 | 설명 |
 * |------|------|
 * | 배경 | 연한 블루-그레이 (#E8EEF4) |
 * | 카드 | 순수 흰색 + 라운드 코너 |
 * | 그림자 | Offset 없음, 확산 blur |
 * | 서브카드 | 연한 배경 + 미세한 테두리 |
 */

import { createTheme, alpha } from '@mui/material/styles';
import { blueGrey } from '@mui/material/colors';

// ============================================================
// Design Tokens - Modern Material You Inspired
// ============================================================

// Modern Material Color Palette
const modern = {
  // Background: Cool Blue-Grey (연한 하늘색/라벤더)
  bgDefault: '#E8EEF4',      // Main background (pale blue-grey)
  bgPaper: '#FFFFFF',        // Card background (pure white)
  bgSubtle: '#F5F8FA',       // Sub-card background (very light)

  // Accent colors (Soft, muted tones)
  teal: '#4DB6AC',           // Wind indicator
  amber: '#FFB74D',          // Humidity
  orange: '#FF8A65',         // UV Index
  blue: '#64B5F6',           // Pressure

  // Borders
  borderLight: 'rgba(0, 0, 0, 0.06)',
  borderMedium: 'rgba(0, 0, 0, 0.12)',
};

const palette = {
  mode: 'light',
  primary: {
    light: '#6B9FFF',
    main: '#3D7EFF',          // Softer blue (more modern)
    dark: '#2860D8',
    contrastText: '#FFFFFF',
  },
  secondary: {
    light: blueGrey[500],
    main: blueGrey[700],
    dark: blueGrey[900],
    contrastText: '#FFFFFF',
  },
  error: {
    light: '#EF5350',
    main: '#E53935',
    dark: '#C62828',
    contrastText: '#FFFFFF',
  },
  warning: {
    light: '#FFB74D',
    main: '#FFA726',
    dark: '#F57C00',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },
  success: {
    light: '#66BB6A',
    main: '#43A047',
    dark: '#2E7D32',
    contrastText: '#FFFFFF',
  },
  info: {
    light: '#4FC3F7',
    main: '#29B6F6',
    dark: '#0288D1',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },
  text: {
    primary: '#1A1A1A',           // Darker for better contrast
    secondary: 'rgba(0, 0, 0, 0.55)',
    disabled: 'rgba(0, 0, 0, 0.35)',
  },
  background: {
    default: modern.bgDefault,   // Cool blue-grey background
    paper: modern.bgPaper,       // Pure white cards
  },
  divider: modern.borderLight,
  action: {
    active: 'rgba(0, 0, 0, 0.54)',
    hover: 'rgba(0, 0, 0, 0.04)',
    selected: 'rgba(61, 126, 255, 0.08)',
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.08)',
    focus: 'rgba(61, 126, 255, 0.12)',
  },
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

const typography = {
  fontFamily: [
    '"Pretendard Variable"',
    'Pretendard',
    '-apple-system',
    'BlinkMacSystemFont',
    'system-ui',
    'Roboto',
    '"Helvetica Neue"',
    '"Segoe UI"',
    '"Apple SD Gothic Neo"',
    '"Noto Sans KR"',
    '"Malgun Gothic"',
    'sans-serif',
  ].join(','),
  headingFontFamily: '"Outfit", "Pretendard Variable", Pretendard, sans-serif',
  fontSize: 14,
  htmlFontSize: 16,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  h1: {
    fontFamily: '"Outfit", "Pretendard Variable", Pretendard, sans-serif',
    fontWeight: 900,
    fontSize: '2.5rem',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontFamily: '"Outfit", "Pretendard Variable", Pretendard, sans-serif',
    fontWeight: 900,
    fontSize: '2rem',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h3: {
    fontFamily: '"Outfit", "Pretendard Variable", Pretendard, sans-serif',
    fontWeight: 800,
    fontSize: '1.75rem',
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontFamily: '"Outfit", "Pretendard Variable", Pretendard, sans-serif',
    fontWeight: 700,
    fontSize: '1.5rem',
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h5: {
    fontFamily: '"Outfit", "Pretendard Variable", Pretendard, sans-serif',
    fontWeight: 700,
    fontSize: '1.25rem',
    lineHeight: 1.4,
    letterSpacing: '0',
  },
  h6: {
    fontFamily: '"Outfit", "Pretendard Variable", Pretendard, sans-serif',
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
    letterSpacing: '0',
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.01em',
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
    letterSpacing: '0.02em',
    textTransform: 'none',
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.5,
    letterSpacing: '0.02em',
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 600,
    lineHeight: 2,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
};

/**
 * Modern Material Elevation 시스템
 * **Offset 없이 확산되는 부드러운 그림자** (Diffuse Shadow)
 * 이미지 참고: offset 0, blur만 사용하여 은은한 떠있는 느낌
 */
const elevation = {
  0: 'none',
  // 미세한 elevation (서브카드)
  1: '0 0 4px rgba(0, 0, 0, 0.04), 0 0 2px rgba(0, 0, 0, 0.02)',
  // 기본 elevation (메인 카드) - offset 없이 은은한 확산
  2: '0 0 8px rgba(0, 0, 0, 0.06), 0 0 4px rgba(0, 0, 0, 0.03)',
  3: '0 0 12px rgba(0, 0, 0, 0.07), 0 0 6px rgba(0, 0, 0, 0.04)',
  4: '0 0 16px rgba(0, 0, 0, 0.08), 0 0 8px rgba(0, 0, 0, 0.04)',
  6: '0 0 24px rgba(0, 0, 0, 0.09), 0 0 12px rgba(0, 0, 0, 0.05)',
  8: '0 0 32px rgba(0, 0, 0, 0.10), 0 0 16px rgba(0, 0, 0, 0.05)',
  12: '0 0 40px rgba(0, 0, 0, 0.11), 0 0 20px rgba(0, 0, 0, 0.06)',
  16: '0 0 48px rgba(0, 0, 0, 0.12), 0 0 24px rgba(0, 0, 0, 0.06)',
  24: '0 0 60px rgba(0, 0, 0, 0.14), 0 0 30px rgba(0, 0, 0, 0.07)',
};

const customShadows = {
  none: elevation[0],
  sm: elevation[1],
  md: elevation[2],
  lg: elevation[4],
  xl: elevation[8],
  // 호버/포커스용 그림자
  hover: elevation[3],
  focus: `0 0 0 3px ${alpha('#3D7EFF', 0.15)}`,
  // 카드용 미세한 elevation
  card: elevation[2],
};

const components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarWidth: 'thin',
        backgroundColor: palette.background.default,
        transition: 'background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      elevation0: { boxShadow: elevation[0] },
      elevation1: { boxShadow: elevation[1] },
      elevation2: { boxShadow: elevation[2] },
      elevation3: { boxShadow: elevation[3] },
      elevation4: { boxShadow: elevation[4] },
      elevation6: { boxShadow: elevation[6] },
      elevation8: { boxShadow: elevation[8] },
      elevation12: { boxShadow: elevation[12] },
      elevation16: { boxShadow: elevation[16] },
      elevation24: { boxShadow: elevation[24] },
    },
    defaultProps: {
      elevation: 2,
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 5,  // 5 * 4px = 20px
        boxShadow: elevation[2],
        transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        // 호버 시 elevation 상승 (은은하게)
        '&:hover': {
          boxShadow: elevation[3],
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 2.5,  // 2.5 * 4px = 10px
        textTransform: 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        // 포커스 시 그림자로 표시
        '&:focus-visible': {
          boxShadow: customShadows.focus,
        },
      },
      contained: {
        boxShadow: elevation[1],
        // 호버 시 elevation 상승 (은은하게)
        '&:hover': {
          boxShadow: elevation[3],
        },
        '&:active': {
          boxShadow: elevation[1],
        },
      },
      outlined: {
        '&:hover': {
          backgroundColor: alpha('#0000FF', 0.04),
        },
      },
    },
    defaultProps: {
      disableElevation: false, // Elevation 유지
      disableRipple: false, // Ripple 효과 유지
    },
  },
  MuiButtonBase: {
    defaultProps: {
      disableRipple: false, // Ripple 효과 활성화
    },
  },
  MuiFab: {
    styleOverrides: {
      root: {
        boxShadow: elevation[6],
        '&:hover': {
          boxShadow: elevation[12],
        },
        '&:active': {
          boxShadow: elevation[8],
        },
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        transition: 'background-color 0.2s',
        '&:hover': {
          backgroundColor: alpha('#000', 0.04),
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 4,
        transition: 'box-shadow 0.2s, transform 0.15s',
        '&:hover': {
          boxShadow: elevation[2],
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          transition: 'box-shadow 0.2s',
          '&:hover': {
            boxShadow: elevation[1],
          },
          '&.Mui-focused': {
            boxShadow: `${elevation[2]}, ${customShadows.focus}`,
          },
        },
      },
    },
  },
  MuiSlider: {
    styleOverrides: {
      thumb: {
        boxShadow: elevation[2],
        transition: 'box-shadow 0.2s, transform 0.15s',
        '&:hover': {
          boxShadow: elevation[4],
        },
        '&.Mui-active': {
          boxShadow: elevation[6],
        },
      },
    },
  },
  MuiSwitch: {
    styleOverrides: {
      thumb: {
        boxShadow: elevation[1],
      },
      switchBase: {
        '&.Mui-checked .MuiSwitch-thumb': {
          boxShadow: elevation[2],
        },
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        boxShadow: elevation[4],
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        boxShadow: elevation[8],
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        boxShadow: elevation[24],
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        boxShadow: elevation[16],
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: elevation[4],
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        boxShadow: elevation[2],
      },
    },
  },
  MuiSnackbar: {
    styleOverrides: {
      root: {
        '& .MuiSnackbarContent-root': {
          boxShadow: elevation[6],
        },
      },
    },
  },
  MuiAccordion: {
    styleOverrides: {
      root: {
        boxShadow: elevation[1],
        '&.Mui-expanded': {
          boxShadow: elevation[4],
        },
        transition: 'box-shadow 0.3s, margin 0.3s',
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        transition: 'background-color 0.2s',
        '&:hover': {
          backgroundColor: alpha('#000', 0.04),
        },
        '&.Mui-selected': {
          backgroundColor: alpha('#0000FF', 0.08),
          '&:hover': {
            backgroundColor: alpha('#0000FF', 0.12),
          },
        },
      },
    },
  },
};

// ============================================================
// Theme Creation
// ============================================================

const materialTheme = createTheme({
  palette,
  typography,
  spacing: 8,
  shape: { borderRadius: 5 },  // 1뎁스 컨테이너 통일 (5 * 4px = 20px)
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
  // Material: 풍부한 트랜지션 (UX 구조를 모션으로 보조)
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
      // Material Design 표준 이징
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)', // Standard
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',   // Decelerate
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',      // Accelerate
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',     // Sharp
    },
  },
  components,
});

// 커스텀 속성 추가
materialTheme.customShadows = customShadows;
materialTheme.elevation = elevation;

/**
 * 대시보드 스타일 설정 (Modern Material Design)
 *
 * **주요 특징**:
 * - 라운드 카드 (borderRadius: 20px)
 * - Offset 없는 미세한 elevation
 * - 연한 블루-그레이 배경
 * - 순수 흰색 카드
 */
materialTheme.dashboard = {
  // === 스타일 타입 ===
  style: 'modern-material',

  // === 아이콘 스타일 ===
  iconStyle: 'rounded',  // Modern rounded icons
  iconWeight: 400,

  // === 카드 라운드 (토큰 배수: 1 = 4px) ===
  cardBorderRadius: 5,  // 5 * 4px = 20px

  // === 카드 배경색 (6개 배열 고정) ===
  // 순수 흰색 카드
  cardColors: [
    `linear-gradient(to bottom, ${modern.bgPaper} 0%, ${modern.bgPaper} 100%)`,
    `linear-gradient(to bottom, ${modern.bgPaper} 0%, ${modern.bgPaper} 100%)`,
    `linear-gradient(to bottom, ${modern.bgPaper} 0%, ${modern.bgPaper} 100%)`,
    `linear-gradient(to bottom, ${modern.bgPaper} 0%, ${modern.bgPaper} 100%)`,
    `linear-gradient(to bottom, ${modern.bgPaper} 0%, ${modern.bgPaper} 100%)`,
    `linear-gradient(to bottom, ${modern.bgPaper} 0%, ${modern.bgPaper} 100%)`,
  ],

  // 서브카드: 연한 배경 (이미지 참고: Current conditions 카드)
  subCardColors: [
    `linear-gradient(to bottom, ${modern.bgSubtle} 0%, ${modern.bgSubtle} 100%)`,
    `linear-gradient(to bottom, ${modern.bgSubtle} 0%, ${modern.bgSubtle} 100%)`,
    `linear-gradient(to bottom, ${modern.bgSubtle} 0%, ${modern.bgSubtle} 100%)`,
    `linear-gradient(to bottom, ${modern.bgSubtle} 0%, ${modern.bgSubtle} 100%)`,
    `linear-gradient(to bottom, ${modern.bgSubtle} 0%, ${modern.bgSubtle} 100%)`,
    `linear-gradient(to bottom, ${modern.bgSubtle} 0%, ${modern.bgSubtle} 100%)`,
  ],

  // === 텍스트 색상 ===
  textColor: palette.text.primary,
  textSecondary: palette.text.secondary,

  // 텍스트 그림자 (없음 - 깔끔한 느낌)
  textShadow: '0 0 0 rgba(0, 0, 0, 0)',

  // === Glass 효과 (없음) ===
  backdropFilter: 'blur(0px)',
  WebkitBackdropFilter: 'blur(0px)',

  // === 테두리 (없음 - 그림자로 분리감 표현) ===
  border: '1px solid transparent',
  borderColor: 'transparent',

  // === 그림자 - Offset 없는 미세한 elevation ===
  shadow: elevation[2],

  // === 서브카드 스타일 ===
  subBorder: `1px solid ${modern.borderLight}`,  // 아주 연한 테두리
  subShadow: '0 0 0 rgba(0, 0, 0, 0)',           // 그림자 없음
  subBackdropFilter: 'blur(0px)',
  subBorderRadius: 4,  // 4 * 4px = 16px

  // === 구분선 ===
  dividerColor: modern.borderMedium,

  // === Progress bar ===
  progressHeight: 6,
  progressTrackColor: 'rgba(0, 0, 0, 0.08)',
  progressBarColor: palette.primary.main,
  progressGradient: false,  // Solid color (modern)
  progressBorderRadius: 0.75,  // 0.75 * 4px = 3px

  // === 배경 (Cool Blue-Grey) ===
  background: modern.bgDefault,

  // === Atmosphere (없음 - 순수 단색 배경) ===
  atmosphere: `
    linear-gradient(to bottom, ${modern.bgDefault} 0%, ${modern.bgDefault} 100%)
  `,
  atmosphereOpacity: 0,

  // === 강조색 ===
  accentColor: palette.primary.main,

  // === 악센트 색상 (이미지 참고: Wind, Humidity, UV, Pressure 아이콘 색상) ===
  accentColors: {
    wind: modern.teal,
    humidity: modern.amber,
    uvIndex: modern.orange,
    pressure: modern.blue,
  },

  // === 블롭 (없음) ===
  blobs: null,
};

export default materialTheme;
