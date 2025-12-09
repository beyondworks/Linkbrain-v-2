/**
 * Flat Design Theme (Windows 8 Metro UI Style)
 *
 * 마이크로소프트의 Metro 디자인 언어를 기반으로 한 순수 플랫 테마입니다.
 *
 * ## 핵심 철학
 * - **Authentically Digital**: 스큐어모피즘의 정반대. 텍스처, 그림자, 그라데이션을 완전히 배제.
 * - **Typography**: 얇고 크고 명확한 폰트, 중요 텍스트는 Bold 처리로 강조.
 * - **Grid & Tiles**: 직각 모서리의 컬러풀한 타일 배치.
 * - **Iconography**: 단순하지만 굵고 명확한 아이콘 사용.
 */

import { createTheme } from '@mui/material/styles';

// ============================================================
// Design Tokens - Windows 8 Metro Palette (Vivid & Saturated)
// ============================================================

const metro = {
  blue: '#0078D7', // More saturated blue
  teal: '#00CC6A', // More saturated teal/greenish
  lime: '#A4C400',
  orange: '#F47C00', // More saturated orange
  red: '#E81123', // Vivid red
  magenta: '#E3008C', // Vivid magenta
  purple: '#881798', // More saturated purple
  dark: '#1D1D1D',
  gray: '#555555',
  light: '#FFFFFF',
  cyan: '#0099BC', // Vivid cyan for hourly
  background: '#FFFFFF', // 순수 화이트 배경
};

const palette = {
  mode: 'light',
  primary: {
    main: metro.blue,
    contrastText: '#FFFFFF',
  },
  background: {
    default: metro.background,
    paper: '#F3F3F3', // 타일 기본색 (없을 경우)
  },
  text: {
    primary: metro.dark,
    secondary: metro.gray,
  },
  divider: '#E5E5E5',
};

// ============================================================
// Theme Creation
// ============================================================

const flatTheme = createTheme({
  palette,
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' }, // 중요 텍스트 강조 (Bold)
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 700 },
    body1: { fontWeight: 500 }, // 본문도 약간 굵게
    button: { fontWeight: 700, textTransform: 'uppercase' },
    caption: { fontWeight: 500 },
  },
  shape: {
    borderRadius: 0, // 직각 모서리 (Metro Style)
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.background.default,
          // transition 속성은 GlobalStyles에서 관리되거나 WeatherDashboard에서 주입됨
          transition: 'background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // 틴트 제거
          boxShadow: 'none', // 그림자 제거
        },
      },
    },
  },
});

/**
 * 대시보드 스타일 설정
 * 
 * **주의**: 모든 배경색은 `linear-gradient` 포맷을 사용하여
 * 다른 테마(Skeuomorphism 등)와의 전환 시 부드러운 Cross-fade를 지원해야 합니다.
 * (Solid Color끼리만 전환하더라도 포맷 통일 권장)
 */
flatTheme.dashboard = {
  style: 'tiles', // 'tiles' 스타일 사용 (WeatherDashboard에서 분기 처리 가능)
  iconStyle: 'filled', // 단순하고 명확한 아이콘
  iconWeight: 600, // 아이콘 웨이트 증가 (단순함 속에서 강조)

  // 카드 배경색 (Metro Tiles)
  // 날씨 앱 맥락에 맞는 Metro Palette 적용
  cardColors: [
    // 1. Current Weather (Main): Metro Blue (신뢰, 맑음)
    `linear-gradient(to bottom, ${metro.blue} 0%, ${metro.blue} 100%)`,
    
    // 2. Weekly Forecast: Metro Teal (안정감) -> Green/Teal
    `linear-gradient(to bottom, ${metro.teal} 0%, ${metro.teal} 100%)`,
    
    // 3. Hourly Forecast: Metro Cyan (정보 전달)
    `linear-gradient(to bottom, ${metro.cyan} 0%, ${metro.cyan} 100%)`,
    
    // 4. Weather Details: Metro Purple (고급스러움, 포인트)
    `linear-gradient(to bottom, ${metro.purple} 0%, ${metro.purple} 100%)`,
    
    // 5. Sunrise/Sunset: Metro Orange (태양)
    `linear-gradient(to bottom, ${metro.orange} 0%, ${metro.orange} 100%)`,
  ],

  // 서브카드 (Hourly Forecast 내부 등) - 투명도나 별도 색상 없이 깔끔하게
  subCardColors: null, 

  // 텍스트
  textColor: '#FFFFFF', // 타일 위 텍스트는 기본적으로 흰색
  textSecondary: 'rgba(255, 255, 255, 0.85)', // 대비 증가
  
  // 텍스트 그림자 - 투명 (트랜지션용)
  textShadow: '0 0 0 rgba(0, 0, 0, 0)',

  // 효과 없음 (Flat)
  backdropFilter: 'none',
  WebkitBackdropFilter: 'none',

  // 테두리 - 투명 (트랜지션을 위해 1px 유지)
  border: '1px solid transparent',
  borderColor: 'transparent',

  // 그림자 - 투명 (트랜지션을 위해 포맷 유지)
  shadow: '0 0 0 rgba(0, 0, 0, 0)',

  // 서브카드 스타일
  subBorder: '1px solid rgba(255, 255, 255, 0.3)',
  subShadow: '0 0 0 rgba(0, 0, 0, 0)', // 투명 (트랜지션용)
  subBackdropFilter: 'none',

  // 구분선
  dividerColor: 'rgba(255, 255, 255, 0.4)',

  // Progress
  progressHeight: 8, // 두껍게
  progressTrackColor: 'rgba(0, 0, 0, 0.2)',
  progressBarColor: '#FFFFFF', // 흰색 바
  progressGradient: false,

  // 배경 (Solid White)
  background: metro.background,

  // Atmosphere (None)
  atmosphere: `
    linear-gradient(to bottom, ${metro.background} 0%, ${metro.background} 100%)
  `,
  atmosphereOpacity: 0,
};

export default flatTheme;
