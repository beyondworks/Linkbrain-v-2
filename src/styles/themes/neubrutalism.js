/**
 * Neubrutalism Theme
 *
 * 브루탈리즘에서 영감받은 대담하고 거친 UI 테마입니다.
 * 하드 섀도우, 두꺼운 검정 테두리, 고채도 색상을 특징으로 합니다.
 */

import { createTheme } from '@mui/material/styles';

// ============================================================
// Design Tokens
// ============================================================

/** Neubrutalism 컬러 팔레트 */
const brutal = {
  // 메인 컬러
  black: '#000000',
  white: '#FFFFFF',
  // 비비드 컬러
  red: '#FF6B6B',
  yellow: '#FFE66D',
  blue: '#4ECDC4',
  pink: '#FF8ED4',
  orange: '#FFA07A',
  green: '#98D8AA',
  purple: '#DDA0DD',
  cyan: '#7FDBFF',
  // 배경 컬러
  cream: '#FFF9E6',
  beige: '#F5E6D3',
  mint: '#E8F5E8',
  lavender: '#F0E6FF',
  peach: '#FFE5D9',
  // 회색 계열
  grayLight: '#E8E8E8',
  gray: '#D0D0D0',
  grayDark: '#B8B8B8',
};

const palette = {
  mode: 'light',
  primary: {
    light: '#FF8A8A',
    main: brutal.red,
    dark: '#E65555',
    contrastText: brutal.black,
  },
  secondary: {
    light: '#7EDDD6',
    main: brutal.blue,
    dark: '#3BB5AE',
    contrastText: brutal.black,
  },
  error: {
    light: '#FF8A8A',
    main: '#FF4444',
    dark: '#CC0000',
    contrastText: brutal.black,
  },
  warning: {
    light: '#FFEF99',
    main: brutal.yellow,
    dark: '#E6CC00',
    contrastText: brutal.black,
  },
  success: {
    light: '#B8E8C0',
    main: brutal.green,
    dark: '#6BBF7A',
    contrastText: brutal.black,
  },
  info: {
    light: '#99E6FF',
    main: brutal.cyan,
    dark: '#00B3E6',
    contrastText: brutal.black,
  },
  text: {
    primary: brutal.black,
    secondary: 'rgba(0, 0, 0, 0.7)',
    disabled: 'rgba(0, 0, 0, 0.4)',
  },
  background: {
    default: brutal.cream,
    paper: brutal.white,
  },
  divider: brutal.black,
  action: {
    active: brutal.black,
    hover: 'rgba(0, 0, 0, 0.08)',
    selected: 'rgba(0, 0, 0, 0.12)',
    disabled: 'rgba(0, 0, 0, 0.3)',
    disabledBackground: 'rgba(0, 0, 0, 0.1)',
    focus: 'rgba(0, 0, 0, 0.15)',
  },
  // 커스텀 팔레트
  brutal,
};

const typography = {
  fontFamily: [
    '"Space Grotesk"',
    '"DM Sans"',
    '"Inter"',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Pretendard Variable"',
    'Pretendard',
    'system-ui',
    'sans-serif',
  ].join(','),
  fontSize: 14,
  htmlFontSize: 16,
  fontWeightLight: 400,
  fontWeightRegular: 500,
  fontWeightMedium: 600,
  fontWeightBold: 800,
  h1: {
    fontFamily: '"Space Grotesk", "DM Sans", sans-serif',
    fontWeight: 800,
    fontSize: '3rem',
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontFamily: '"Space Grotesk", "DM Sans", sans-serif',
    fontWeight: 800,
    fontSize: '2.5rem',
    lineHeight: 1.15,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontFamily: '"Space Grotesk", "DM Sans", sans-serif',
    fontWeight: 700,
    fontSize: '2rem',
    lineHeight: 1.2,
    letterSpacing: '0',
  },
  h4: {
    fontFamily: '"Space Grotesk", "DM Sans", sans-serif',
    fontWeight: 700,
    fontSize: '1.5rem',
    lineHeight: 1.25,
    letterSpacing: '0',
  },
  h5: {
    fontFamily: '"Space Grotesk", "DM Sans", sans-serif',
    fontWeight: 600,
    fontSize: '1.25rem',
    lineHeight: 1.3,
    letterSpacing: '0',
  },
  h6: {
    fontFamily: '"Space Grotesk", "DM Sans", sans-serif',
    fontWeight: 600,
    fontSize: '1.125rem',
    lineHeight: 1.35,
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
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '0',
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '0.01em',
    textTransform: 'uppercase',
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 700,
    lineHeight: 1.75,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.5,
    letterSpacing: '0.02em',
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 700,
    lineHeight: 2,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
};

/** Neubrutalism 스타일 속성 */
const brutalStyles = {
  border: {
    thin: `2px solid ${brutal.black}`,
    medium: `3px solid ${brutal.black}`,
    thick: `4px solid ${brutal.black}`,
  },
  shadow: {
    sm: `3px 3px 0px ${brutal.black}`,
    md: `5px 5px 0px ${brutal.black}`,
    lg: `8px 8px 0px ${brutal.black}`,
    xl: `12px 12px 0px ${brutal.black}`,
    // 호버시 줄어드는 그림자
    hover: `2px 2px 0px ${brutal.black}`,
    // 컬러 그림자
    colorSm: (color) => `3px 3px 0px ${color}`,
    colorMd: (color) => `5px 5px 0px ${color}`,
  },
  // 호버 인터랙션
  hoverTransform: 'translate(3px, 3px)',
  activeTransform: 'translate(5px, 5px)',
};

const components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarWidth: 'thin',
        scrollbarColor: `${brutal.black} ${brutal.cream}`,
        backgroundColor: brutal.cream,
        transition: 'background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        '&::-webkit-scrollbar': {
          width: '10px',
          height: '10px',
        },
        '&::-webkit-scrollbar-track': {
          background: brutal.cream,
          border: `2px solid ${brutal.black}`,
        },
        '&::-webkit-scrollbar-thumb': {
          background: brutal.black,
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        backgroundColor: brutal.white,
        border: brutalStyles.border.medium,
        boxShadow: brutalStyles.shadow.md,
        borderRadius: 0,
      },
      elevation0: {
        boxShadow: 'none',
        border: 'none',
      },
      elevation1: {
        boxShadow: brutalStyles.shadow.sm,
        border: brutalStyles.border.thin,
      },
      elevation2: {
        boxShadow: brutalStyles.shadow.md,
        border: brutalStyles.border.medium,
      },
      elevation3: {
        boxShadow: brutalStyles.shadow.lg,
        border: brutalStyles.border.medium,
      },
      elevation4: {
        boxShadow: brutalStyles.shadow.xl,
        border: brutalStyles.border.thick,
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        backgroundColor: brutal.white,
        border: brutalStyles.border.medium,
        boxShadow: brutalStyles.shadow.md,
        transition: 'transform 0.1s ease-out, box-shadow 0.1s ease-out',
        '&:hover': {
          transform: brutalStyles.hoverTransform,
          boxShadow: brutalStyles.shadow.hover,
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        textTransform: 'uppercase',
        fontWeight: 700,
        letterSpacing: '0.05em',
        border: brutalStyles.border.thin,
        boxShadow: brutalStyles.shadow.sm,
        transition: 'transform 0.1s ease-out, box-shadow 0.1s ease-out',
        '&:hover': {
          transform: brutalStyles.hoverTransform,
          boxShadow: 'none',
        },
        '&:active': {
          transform: brutalStyles.activeTransform,
          boxShadow: 'none',
        },
      },
      contained: {
        '&:hover': {
          boxShadow: 'none',
        },
      },
      containedPrimary: {
        backgroundColor: brutal.red,
        color: brutal.black,
        '&:hover': {
          backgroundColor: brutal.red,
        },
      },
      containedSecondary: {
        backgroundColor: brutal.blue,
        color: brutal.black,
        '&:hover': {
          backgroundColor: brutal.blue,
        },
      },
      outlined: {
        borderColor: brutal.black,
        borderWidth: '2px',
        backgroundColor: brutal.white,
        '&:hover': {
          borderWidth: '2px',
          borderColor: brutal.black,
          backgroundColor: brutal.cream,
        },
      },
      text: {
        border: 'none',
        boxShadow: 'none',
        '&:hover': {
          transform: 'none',
          backgroundColor: 'rgba(0,0,0,0.08)',
        },
      },
    },
    defaultProps: {
      disableElevation: true,
      disableRipple: true,
    },
  },
  MuiButtonBase: {
    defaultProps: {
      disableRipple: true,
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        border: brutalStyles.border.thin,
        boxShadow: brutalStyles.shadow.sm,
        transition: 'transform 0.1s ease-out, box-shadow 0.1s ease-out',
        '&:hover': {
          transform: brutalStyles.hoverTransform,
          boxShadow: 'none',
          backgroundColor: brutal.cream,
        },
      },
    },
    defaultProps: {
      disableRipple: true,
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        border: brutalStyles.border.thin,
        fontWeight: 600,
      },
      filled: {
        boxShadow: '2px 2px 0px #000',
      },
      colorPrimary: {
        backgroundColor: brutal.red,
        color: brutal.black,
      },
      colorSecondary: {
        backgroundColor: brutal.blue,
        color: brutal.black,
      },
      colorSuccess: {
        backgroundColor: brutal.green,
        color: brutal.black,
      },
      colorError: {
        backgroundColor: '#FF4444',
        color: brutal.black,
      },
      colorWarning: {
        backgroundColor: brutal.yellow,
        color: brutal.black,
      },
      colorInfo: {
        backgroundColor: brutal.cyan,
        color: brutal.black,
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 0,
          backgroundColor: brutal.white,
          '& fieldset': {
            borderWidth: '2px',
            borderColor: brutal.black,
          },
          '&:hover fieldset': {
            borderColor: brutal.black,
            borderWidth: '3px',
          },
          '&.Mui-focused fieldset': {
            borderWidth: '3px',
            borderColor: brutal.black,
            boxShadow: brutalStyles.shadow.sm,
          },
        },
        '& .MuiFilledInput-root': {
          borderRadius: 0,
          border: brutalStyles.border.thin,
          backgroundColor: brutal.cream,
          '&:hover': {
            backgroundColor: brutal.beige,
          },
          '&.Mui-focused': {
            backgroundColor: brutal.white,
          },
          '&::before, &::after': {
            display: 'none',
          },
        },
      },
    },
  },
  MuiSelect: {
    styleOverrides: {
      root: {
        borderRadius: 0,
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: brutal.black,
        borderWidth: '1px',
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 0,
        backgroundColor: brutal.black,
        color: brutal.white,
        border: 'none',
        fontSize: '0.8125rem',
        fontWeight: 600,
      },
      arrow: {
        color: brutal.black,
      },
    },
  },
  MuiSlider: {
    styleOverrides: {
      root: {
        '& .MuiSlider-track': {
          border: 'none',
          height: 8,
        },
        '& .MuiSlider-rail': {
          backgroundColor: brutal.black,
          height: 8,
          opacity: 0.3,
        },
        '& .MuiSlider-thumb': {
          width: 20,
          height: 20,
          borderRadius: 0,
          border: brutalStyles.border.thin,
          backgroundColor: brutal.white,
          boxShadow: '2px 2px 0px #000',
          '&:hover, &.Mui-focusVisible': {
            boxShadow: '2px 2px 0px #000',
          },
          '&.Mui-active': {
            boxShadow: '1px 1px 0px #000',
          },
        },
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        height: 12,
        backgroundColor: brutal.white,
        border: brutalStyles.border.thin,
      },
      bar: {
        borderRadius: 0,
      },
    },
  },
  MuiSwitch: {
    styleOverrides: {
      root: {
        '& .MuiSwitch-track': {
          borderRadius: 0,
          backgroundColor: brutal.cream,
          border: brutalStyles.border.thin,
          opacity: 1,
        },
        '& .MuiSwitch-thumb': {
          borderRadius: 0,
          boxShadow: '2px 2px 0px #000',
        },
        '& .Mui-checked': {
          '& + .MuiSwitch-track': {
            backgroundColor: brutal.green,
            opacity: 1,
          },
        },
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      indicator: {
        height: 4,
        backgroundColor: brutal.black,
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'uppercase',
        fontWeight: 700,
        letterSpacing: '0.05em',
        borderBottom: `2px solid transparent`,
        '&.Mui-selected': {
          color: brutal.black,
        },
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: 'none',
        borderBottom: brutalStyles.border.medium,
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRadius: 0,
        boxShadow: brutalStyles.shadow.lg,
        border: brutalStyles.border.medium,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 0,
        border: brutalStyles.border.thick,
        boxShadow: brutalStyles.shadow.xl,
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: 0,
        border: brutalStyles.border.medium,
        boxShadow: brutalStyles.shadow.md,
      },
    },
  },
  MuiPopover: {
    styleOverrides: {
      paper: {
        borderRadius: 0,
        border: brutalStyles.border.medium,
        boxShadow: brutalStyles.shadow.md,
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        border: brutalStyles.border.thin,
        boxShadow: brutalStyles.shadow.sm,
      },
      standardSuccess: {
        backgroundColor: brutal.green,
        color: brutal.black,
        '& .MuiAlert-icon': {
          color: brutal.black,
        },
      },
      standardError: {
        backgroundColor: brutal.red,
        color: brutal.black,
        '& .MuiAlert-icon': {
          color: brutal.black,
        },
      },
      standardWarning: {
        backgroundColor: brutal.yellow,
        color: brutal.black,
        '& .MuiAlert-icon': {
          color: brutal.black,
        },
      },
      standardInfo: {
        backgroundColor: brutal.cyan,
        color: brutal.black,
        '& .MuiAlert-icon': {
          color: brutal.black,
        },
      },
    },
  },
  MuiSnackbar: {
    styleOverrides: {
      root: {
        '& .MuiSnackbarContent-root': {
          borderRadius: 0,
          border: brutalStyles.border.medium,
          boxShadow: brutalStyles.shadow.md,
        },
      },
    },
  },
  MuiAvatar: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        border: brutalStyles.border.thin,
      },
    },
  },
  MuiBadge: {
    styleOverrides: {
      badge: {
        borderRadius: 0,
        fontWeight: 700,
      },
    },
  },
};

// ============================================================
// Theme Creation
// ============================================================

const neubrutalismTheme = createTheme({
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
  // Neubrutalism: 빠르고 직접적인 인터랙션
  transitions: {
    duration: {
      shortest: 100,
      shorter: 100,
      short: 100,
      standard: 100,
      complex: 150,
      enteringScreen: 100,
      leavingScreen: 100,
    },
    easing: {
      easeInOut: 'ease-out',
      easeOut: 'ease-out',
      easeIn: 'ease-in',
      sharp: 'ease-out',
    },
  },
  components,
});

// 커스텀 속성 추가
neubrutalismTheme.brutalStyles = brutalStyles;
neubrutalismTheme.brutal = brutal;

/**
 * 대시보드 스타일 설정 (통합 토큰 구조)
 * WeatherDashboard 등 템플릿 컴포넌트가 참조
 *
 * 모든 테마가 동일한 속성 키를 가져 완벽한 트랜지션 지원
 * 사용하지 않는 속성도 중립값(0, transparent 등)으로 포함
 */
neubrutalismTheme.dashboard = {
  // === 스타일 타입 ===
  style: 'brutal',

  // === 아이콘 스타일 ===
  iconStyle: 'filled',
  iconWeight: 600,

  // === 카드 배경색 (6개 배열 고정) ===
  // linear-gradient 포맷으로 통일 (다른 테마와 트랜지션 호환)
  cardColors: [
    `linear-gradient(to bottom, ${brutal.red} 0%, ${brutal.red} 100%)`,       // 현재 날씨
    `linear-gradient(to bottom, ${brutal.blue} 0%, ${brutal.blue} 100%)`,     // 주간 예보
    `linear-gradient(to bottom, ${brutal.grayLight} 0%, ${brutal.grayLight} 100%)`, // 시간별 예보
    `linear-gradient(to bottom, ${brutal.pink} 0%, ${brutal.pink} 100%)`,     // 상세 정보
    `linear-gradient(to bottom, ${brutal.green} 0%, ${brutal.green} 100%)`,   // 일출/일몰
    `linear-gradient(to bottom, ${brutal.orange} 0%, ${brutal.orange} 100%)`, // 추가 카드용
  ],
  subCardColors: [
    `linear-gradient(to bottom, ${brutal.white} 0%, ${brutal.white} 100%)`,
    `linear-gradient(to bottom, ${brutal.white} 0%, ${brutal.white} 100%)`,
    `linear-gradient(to bottom, ${brutal.white} 0%, ${brutal.white} 100%)`,
    `linear-gradient(to bottom, ${brutal.white} 0%, ${brutal.white} 100%)`,
    `linear-gradient(to bottom, ${brutal.white} 0%, ${brutal.white} 100%)`,
    `linear-gradient(to bottom, ${brutal.white} 0%, ${brutal.white} 100%)`,
  ],

  // === 텍스트 색상 ===
  textColor: brutal.black,
  textSecondary: 'rgba(0, 0, 0, 0.7)',

  // 텍스트 그림자 (투명 - 트랜지션 호환)
  textShadow: '0 0 0 rgba(0, 0, 0, 0)',

  // === Glass 효과 (중립값: blur(0px)) ===
  backdropFilter: 'blur(0px)',
  WebkitBackdropFilter: 'blur(0px)',

  // === 테두리 ===
  border: brutalStyles.border.medium,
  borderColor: brutal.black,

  // === 그림자 ===
  shadow: brutalStyles.shadow.md,

  // === 서브카드 스타일 ===
  subBorder: '2px solid #000000',
  subShadow: '3px 3px 0px #000000',
  subBackdropFilter: 'blur(0px)',

  // === 구분선 ===
  dividerColor: brutal.black,

  // === Progress bar ===
  progressHeight: 8,
  progressTrackColor: 'rgba(0, 0, 0, 0.1)',
  progressBarColor: brutal.black,
  progressGradient: false,

  // === 배경 ===
  background: brutal.cream,

  // === Atmosphere (Texture/Gradient Layer) ===
  // Skeuomorphism 전환 시 부드러운 트랜지션을 위해 동일한 그라데이션 정의 (투명도 0)
  atmosphere: `
    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px),
    repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px),
    linear-gradient(to bottom, #E0E0E0, #D1D1D6)
  `,
  atmosphereOpacity: 0,

  // === 강조색 (모든 테마 공통 속성) ===
  accentColor: brutal.red,

  // === 블롭 (Glass 전용, 다른 테마는 null) ===
  blobs: null,
};

export default neubrutalismTheme;
