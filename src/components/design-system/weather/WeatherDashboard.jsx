/**
 * WeatherDashboard 컴포넌트
 *
 * 테마 베리에이션 테스트를 위한 날씨 대시보드입니다.
 * 각 테마의 `dashboard` 속성을 읽어 스타일을 자동 적용합니다.
 *
 * ## 테마별 스타일 (통합 토큰 구조)
 * 모든 테마가 동일한 토큰 키를 사용하여 조건부 로직 없이 스타일 적용
 *
 * Props:
 * @param {object} data - 날씨 데이터 객체 [Optional]
 *
 * Example usage:
 * <WeatherDashboard />
 */

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import { useTheme, alpha } from '@mui/material/styles';

import {
  currentWeather,
  hourlyForecast,
  weeklyForecast,
  weatherDetails,
  weatherIcons,
  pixelWeatherIcons,
} from './weatherData';


const TRANSITION_DURATION = '0.35s';

/**
 * 날씨 조건별 배경 색상 팔레트
 * Glass 테마에서 날씨에 맞는 분위기를 연출
 */
const weatherColorPalettes = {
  // 맑음 - 따뜻한 황금빛, 하늘색
  sunny: {
    base: `radial-gradient(circle at 50% 50%, #FFF8E7 0%, #FFF8E7 100%)`,
    blobs: [
      { color: '#FFD93D', size: 400, top: '5%', left: '10%', opacity: 0.5 },
      { color: '#FF8C00', size: 350, top: '15%', right: '5%', opacity: 0.4 },
      { color: '#87CEEB', size: 300, bottom: '20%', left: '5%', opacity: 0.35 },
      { color: '#FFE066', size: 280, bottom: '10%', right: '15%', opacity: 0.4 },
      { color: '#FFA500', size: 200, top: '50%', left: '50%', opacity: 0.3 },
    ],
  },
  // 구름 조금 - 부드러운 하늘색, 흰색
  partlyCloudy: {
    base: `radial-gradient(circle at 50% 50%, #F0F8FF 0%, #F0F8FF 100%)`,
    blobs: [
      { color: '#87CEEB', size: 400, top: '5%', left: '10%', opacity: 0.45 },
      { color: '#FFFFFF', size: 380, top: '20%', right: '5%', opacity: 0.5 },
      { color: '#B0E0E6', size: 320, bottom: '15%', left: '5%', opacity: 0.4 },
      { color: '#E0E8F0', size: 280, bottom: '10%', right: '15%', opacity: 0.45 },
      { color: '#FFE4B5', size: 200, top: '40%', left: '60%', opacity: 0.35 },
    ],
  },
  // 흐림 - 회색빛, 차분한 톤
  cloudy: {
    base: `radial-gradient(circle at 50% 50%, #E8ECEF 0%, #E8ECEF 100%)`,
    blobs: [
      { color: '#A9B4C2', size: 420, top: '5%', left: '10%', opacity: 0.45 },
      { color: '#D3D8DE', size: 380, top: '20%', right: '5%', opacity: 0.5 },
      { color: '#B8C4CE', size: 300, bottom: '15%', left: '5%', opacity: 0.4 },
      { color: '#C5CDD5', size: 320, bottom: '10%', right: '15%', opacity: 0.45 },
      { color: '#9AA8B8', size: 250, top: '50%', left: '50%', opacity: 0.35 },
    ],
  },
  // 비 - 청회색, 푸른빛
  rainy: {
    base: `radial-gradient(circle at 50% 50%, #E3EBF2 0%, #E3EBF2 100%)`,
    blobs: [
      { color: '#5B8FB9', size: 400, top: '5%', left: '10%', opacity: 0.45 },
      { color: '#7BA3C4', size: 350, top: '20%', right: '5%', opacity: 0.4 },
      { color: '#4A7C9B', size: 320, bottom: '15%', left: '5%', opacity: 0.4 },
      { color: '#89B4D4', size: 280, bottom: '10%', right: '15%', opacity: 0.45 },
      { color: '#3D6A89', size: 220, top: '45%', left: '55%', opacity: 0.35 },
    ],
  },
  // 폭풍 - 어두운 보라, 회색
  stormy: {
    base: `radial-gradient(circle at 50% 50%, #D8DCE6 0%, #D8DCE6 100%)`,
    blobs: [
      { color: '#4A4063', size: 420, top: '5%', left: '10%', opacity: 0.5 },
      { color: '#6B5B7A', size: 380, top: '20%', right: '5%', opacity: 0.45 },
      { color: '#3D3550', size: 300, bottom: '15%', left: '5%', opacity: 0.45 },
      { color: '#8B7DA8', size: 320, bottom: '10%', right: '15%', opacity: 0.4 },
      { color: '#5C4E6E', size: 250, top: '50%', left: '50%', opacity: 0.4 },
    ],
  },
  // 눈 - 차가운 흰색, 연한 파랑
  snowy: {
    base: `radial-gradient(circle at 50% 50%, #F5F8FC 0%, #F5F8FC 100%)`,
    blobs: [
      { color: '#E8F4FC', size: 400, top: '5%', left: '10%', opacity: 0.6 },
      { color: '#FFFFFF', size: 380, top: '20%', right: '5%', opacity: 0.7 },
      { color: '#D6EAF8', size: 320, bottom: '15%', left: '5%', opacity: 0.5 },
      { color: '#C9E2F5', size: 280, bottom: '10%', right: '15%', opacity: 0.55 },
      { color: '#B8D8F0', size: 220, top: '45%', left: '55%', opacity: 0.45 },
    ],
  },
  // 안개 - 뿌연 회색
  foggy: {
    base: `radial-gradient(circle at 50% 50%, #EAECEE 0%, #EAECEE 100%)`,
    blobs: [
      { color: '#D5D8DC', size: 450, top: '5%', left: '10%', opacity: 0.6 },
      { color: '#E8EAED', size: 400, top: '20%', right: '5%', opacity: 0.65 },
      { color: '#CCD1D6', size: 350, bottom: '15%', left: '5%', opacity: 0.55 },
      { color: '#DFE2E5', size: 320, bottom: '10%', right: '15%', opacity: 0.6 },
      { color: '#C4C9CE', size: 280, top: '50%', left: '50%', opacity: 0.5 },
    ],
  },
  // 바람 - 시원한 청록색
  windy: {
    base: `radial-gradient(circle at 50% 50%, #E8F6F3 0%, #E8F6F3 100%)`,
    blobs: [
      { color: '#76D7C4', size: 400, top: '5%', left: '10%', opacity: 0.4 },
      { color: '#A3E4D7', size: 350, top: '20%', right: '5%', opacity: 0.45 },
      { color: '#48C9B0', size: 300, bottom: '15%', left: '5%', opacity: 0.4 },
      { color: '#85E0D0', size: 280, bottom: '10%', right: '15%', opacity: 0.45 },
      { color: '#5DADE2', size: 220, top: '45%', left: '55%', opacity: 0.35 },
    ],
  },
  // 밤 - 짙은 남색, 보라
  night: {
    base: `radial-gradient(circle at 50% 50%, #1A1A2E 0%, #1A1A2E 100%)`,
    blobs: [
      { color: '#16213E', size: 400, top: '5%', left: '10%', opacity: 0.6 },
      { color: '#0F3460', size: 350, top: '20%', right: '5%', opacity: 0.5 },
      { color: '#1A1A40', size: 320, bottom: '15%', left: '5%', opacity: 0.55 },
      { color: '#2C2C54', size: 280, bottom: '10%', right: '15%', opacity: 0.5 },
      { color: '#40407A', size: 200, top: '50%', left: '50%', opacity: 0.4 },
    ],
  },
  // 밤 흐림 - 어두운 회청색
  nightCloudy: {
    base: `radial-gradient(circle at 50% 50%, #1E2A3A 0%, #1E2A3A 100%)`,
    blobs: [
      { color: '#2C3E50', size: 400, top: '5%', left: '10%', opacity: 0.55 },
      { color: '#34495E', size: 350, top: '20%', right: '5%', opacity: 0.5 },
      { color: '#1C2833', size: 320, bottom: '15%', left: '5%', opacity: 0.5 },
      { color: '#283747', size: 280, bottom: '10%', right: '15%', opacity: 0.55 },
      { color: '#212F3D', size: 220, top: '45%', left: '55%', opacity: 0.45 },
    ],
  },
};

/**
 * 현재 날씨 조건에 맞는 색상 팔레트 반환
 */
const getWeatherPalette = (condition) => {
  return weatherColorPalettes[condition] || weatherColorPalettes.sunny;
};

/**
 * 테마에서 대시보드 설정 가져오기
 */
const useDashboardConfig = () => {
  const theme = useTheme();
  const defaultTransition = {
    duration: TRANSITION_DURATION,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    properties: 'all',
  };

  return theme.dashboard || {
    style: 'default',
    iconStyle: 'filled',
    iconWeight: 400,
    cardColors: [],
    textColor: theme.palette.text.primary,
    textSecondary: theme.palette.text.secondary,
    textShadow: 'none',
    iconGradient: null,
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none',
    border: 'none',
    shadow: 'none',
    subBackdropFilter: 'none',
    highlightColor: null,
    liquidEffect: false,
    dividerColor: theme.palette.divider,
    progressHeight: 4,
    progressTrackColor: 'rgba(0, 0, 0, 0.1)',
    progressBarColor: null,
    progressGradient: true,
    background: theme.palette.background.default,
    atmosphere: null,
    atmosphereOpacity: 0,
    transition: defaultTransition,
  };
};

/**
 * 테마 전환 transition 스타일 생성
 */
const getTransitionStyle = (config) => {
  const t = config.transition || {
    duration: TRANSITION_DURATION,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    properties: 'all',
  };
  return `${t.properties.split(', ').map(p => `${p} ${t.duration} ${t.easing}`).join(', ')}`;
};

/**
 * Aqua Scrollbar-style Progress Bar 컴포넌트
 * Mac OS X 10.0-10.4의 아이코닉한 캔디 젤 스크롤바를 재현
 *
 * 특징:
 * - 완전 라운드 pill 형태
 * - 상단 40%에 강한 흰색 하이라이트 (캔디 효과)
 * - 반투명 파란색 젤 그라디언트
 * - 트랙은 inset 스타일의 은색 그루브
 */
const AquaScrollbarProgress = ({ value }) => {
  // 0%부터 value%까지 채우는 단순 계산
  const barWidth = Math.max(value, 5); // 최소 5% 너비 보장

  return (
    <Box
      sx={ {
        position: 'relative',
        width: '100%',
        height: 16,
      } }
    >
      {/* Track - Inset groove */}
      <Box
        sx={ {
          position: 'absolute',
          inset: 0,
          top: 3,
          bottom: 3,
          borderRadius: 5,
          background: `
            linear-gradient(to bottom,
              #A8A8A8 0%,
              #C8C8C8 20%,
              #E0E0E0 50%,
              #D0D0D0 80%,
              #B8B8B8 100%
            )
          `,
          border: '1px solid #909090',
          boxShadow: `
            inset 0 1px 3px rgba(0, 0, 0, 0.25),
            inset 0 0 1px rgba(0, 0, 0, 0.1),
            0 1px 0 rgba(255, 255, 255, 0.8)
          `,
        } }
      />

      {/* Bar - Aqua Candy Gel Scrollbar Thumb */}
      <Box
        sx={ {
          position: 'absolute',
          left: 0,
          width: `${barWidth}%`,
          top: 1,
          bottom: 1,
          borderRadius: 8,
          overflow: 'hidden',
          // Aqua 젤 그라디언트 베이스
          background: `
            linear-gradient(to bottom,
              #B8D8FF 0%,
              #6BB3FA 15%,
              #2E7CF6 40%,
              #1461D8 70%,
              #0050C8 100%
            )
          `,
          border: '1px solid #0050C8',
          boxShadow: `
            inset 0 1px 0 rgba(255, 255, 255, 0.5),
            0 1px 2px rgba(0, 80, 200, 0.4),
            0 0 4px rgba(46, 124, 246, 0.3)
          `,
          // 컨테이너 for highlights
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 1,
            left: 2,
            right: 2,
            height: '45%',
            borderRadius: '6px 6px 50% 50%',
            background: `
              linear-gradient(to bottom,
                rgba(255, 255, 255, 0.7) 0%,
                rgba(255, 255, 255, 0.4) 50%,
                rgba(255, 255, 255, 0.1) 100%
              )
            `,
            pointerEvents: 'none',
          },
          // 하단 리플렉션
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 1,
            left: 3,
            right: 3,
            height: '20%',
            borderRadius: '50% 50% 4px 4px',
            background: `
              linear-gradient(to top,
                rgba(255, 255, 255, 0.15) 0%,
                transparent 100%
              )
            `,
            pointerEvents: 'none',
          },
        } }
      />

      {/* End cap - 왼쪽 끝 반원 하이라이트 강조 */}
      <Box
        sx={ {
          position: 'absolute',
          left: 0,
          top: 1,
          bottom: 1,
          width: 8,
          borderRadius: '8px 0 0 8px',
          background: `
            radial-gradient(ellipse at left center,
              rgba(255, 255, 255, 0.3) 0%,
              transparent 70%
            )
          `,
          pointerEvents: 'none',
        } }
      />
    </Box>
  );
};

/**
 * Aqua Traffic Light Button 컴포넌트
 * Mac OS X 스타일의 닫기/최소화/최대화 버튼
 */
const TrafficLightButton = ({ color, size = 12 }) => (
  <Box
    sx={ {
      width: size,
      height: size,
      borderRadius: '50%',
      background: `
        linear-gradient(to bottom,
          rgba(255,255,255,0.4) 0%,
          rgba(255,255,255,0.1) 50%,
          transparent 50%
        ),
        linear-gradient(to bottom,
          ${color} 0%,
          ${color}dd 100%
        )
      `,
      border: `1px solid ${color}88`,
      boxShadow: `
        inset 0 1px 0 rgba(255,255,255,0.5),
        0 1px 2px rgba(0,0,0,0.15)
      `,
    } }
  />
);

/**
 * Classic OS 윈도우 스타일 타이틀바 컴포넌트
 * 양쪽에 수평선 + 중앙 정렬 타이틀
 * Aqua 테마: Traffic Light 버튼 포함
 */
const WindowTitle = ({ title, config, textSecondary }) => {
  const isWindowStyle = config.windowStyle;
  const isAqua = config.style === 'aqua';

  if (!isWindowStyle) {
    // 기존 스타일 (단순 텍스트)
    return (
      <Typography variant="subtitle2" sx={ { mb: 2, color: textSecondary } }>
        { title }
      </Typography>
    );
  }

  // Aqua 테마: Mac OS X 윈도우 타이틀바 스타일
  if (isAqua) {
    const trafficLights = config.trafficLights || {
      close: '#FF5F57',
      minimize: '#FEBC2E',
      maximize: '#28C840',
    };

    return (
      <Box
        sx={ {
          display: 'flex',
          alignItems: 'center',
          mb: 2,
          pb: 1.5,
          borderBottom: `1px solid ${config.borderColor || '#C8C8C8'}`,
          background: `linear-gradient(to bottom, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%)`,
          mx: -2,
          mt: -1.5,
          px: 2,
          pt: 1,
          borderRadius: '5px 5px 0 0',
        } }
      >
        {/* Traffic Light Buttons */}
        <Box sx={ { display: 'flex', gap: 0.75, mr: 2 } }>
          <TrafficLightButton color={ trafficLights.close } />
          <TrafficLightButton color={ trafficLights.minimize } />
          <TrafficLightButton color={ trafficLights.maximize } />
        </Box>

        {/* 중앙 타이틀 */}
        <Typography
          variant="subtitle2"
          sx={ {
            flex: 1,
            textAlign: 'center',
            color: textSecondary,
            fontWeight: 600,
            letterSpacing: '0.02em',
            textShadow: '0 1px 0 rgba(255,255,255,0.8)',
            pr: 5, // Offset for traffic lights
          } }
        >
          { title }
        </Typography>
      </Box>
    );
  }

  // Classic Mac/IIgs 윈도우 타이틀바 스타일 (수평선)
  const lineColor = config.borderColor || config.textSecondary;

  return (
    <Box
      sx={ {
        display: 'flex',
        alignItems: 'center',
        mb: 2,
        gap: 1,
      } }
    >
      {/* 왼쪽 수평선들 */}
      <Box sx={ { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' } }>
        { [0, 1, 2, 3, 4, 5].map((i) => (
          <Box
            key={ `left-${i}` }
            sx={ {
              height: '1px',
              backgroundColor: lineColor,
              opacity: 0.6,
            } }
          />
        )) }
      </Box>

      {/* 중앙 타이틀 */}
      <Typography
        variant="subtitle2"
        sx={ {
          color: textSecondary,
          px: 1.5,
          whiteSpace: 'nowrap',
          fontWeight: 700,
          letterSpacing: '0.05em',
        } }
      >
        { title }
      </Typography>

      {/* 오른쪽 수평선들 */}
      <Box sx={ { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' } }>
        { [0, 1, 2, 3, 4, 5].map((i) => (
          <Box
            key={ `right-${i}` }
            sx={ {
              height: '1px',
              backgroundColor: lineColor,
              opacity: 0.6,
            } }
          />
        )) }
      </Box>
    </Box>
  );
};

/**
 * 날씨 조건에 따른 아이콘 색상 반환
 * tiles/brutal/monoline은 단색, 그 외는 날씨별 컬러
 */
const getWeatherIconColor = (condition, config, theme) => {
  // tiles/monoline만 단색 (brutal은 컬러 아이콘)
  // pixel은 모노크롬, color-pixel(style=pixel)은 아래 로직에서 컬러 처리
  const isMonoStyle = config.style === 'tiles' || config.style === 'monoline';
  
  // Pixel 테마는 기본적으로 모노크롬
  if (config.style === 'pixel') {
    // Color Pixel인 경우 (desktopLavender 배경 체크)
    if (config.background === '#9090D0') {
      // Saturated colors for visibility on white background
      switch (condition) {
        case 'sunny':
        case 'partlyCloudy':
          return '#E8A000'; // More saturated Gold/Orange
        case 'rainy':
        case 'stormy':
          return '#2080A0'; // More saturated Teal-Blue
        case 'cloudy':
        case 'foggy':
          return '#4A4A4A'; // Darker Gray
        case 'snowy':
          return '#3090A0'; // More saturated Cyan
        case 'night':
        case 'nightCloudy':
          return '#3050A0'; // More saturated Blue
        default:
          return config.textColor;
      }
    }
    // Grey 3D (Mac OS 8 Platinum) - Muted colors (현대적 아이콘)
    if (config.style === 'grey3d') {
      switch (condition) {
        case 'sunny':
        case 'partlyCloudy':
          return '#CC9933'; // Muted gold
        case 'rainy':
        case 'stormy':
          return '#6699AA'; // Muted cyan
        case 'cloudy':
        case 'foggy':
          return '#666666'; // Gray
        case 'snowy':
          return '#88BBCC'; // Light cyan
        case 'night':
        case 'nightCloudy':
          return '#447788'; // Dark cyan
        default:
          return config.textColor;
      }
    }
    // 일반 Pixel Modernism은 모노크롬
    return config.textColor;
  }

  if (isMonoStyle) {
    return config.textColor;
  }

  // Aqua 테마: 그라디언트 젤 아이콘 색상 (Mac OS X 스타일)
  if (config.style === 'aqua') {
    switch (condition) {
      case 'sunny':
      case 'partlyCloudy':
        return `linear-gradient(to bottom, #FFE066 0%, #F5A623 50%, #D68910 100%)`;
      case 'rainy':
      case 'stormy':
        return `linear-gradient(to bottom, #6BB3FA 0%, #2E7CF6 50%, #1461D8 100%)`;
      case 'cloudy':
      case 'foggy':
        return `linear-gradient(to bottom, #CCCCCC 0%, #888888 50%, #666666 100%)`;
      case 'snowy':
        return `linear-gradient(to bottom, #FFFFFF 0%, #B8D4FF 50%, #87CEEB 100%)`;
      case 'night':
      case 'nightCloudy':
        return `linear-gradient(to bottom, #6B8DD6 0%, #3D5A99 50%, #2C3E50 100%)`;
      default:
        return `linear-gradient(to bottom, #6BB3FA 0%, #2E7CF6 50%, #1461D8 100%)`;
    }
  }

  // 날씨 조건별 색상
  switch (condition) {
    case 'sunny':
    case 'partlyCloudy':
      return config.style === 'skeuomorphism'
        ? `linear-gradient(to bottom, #FFF176 0%, ${theme.palette.warning.main} 100%)`
        : theme.palette.warning.main;
    case 'rainy':
    case 'stormy':
      return config.style === 'skeuomorphism'
        ? `linear-gradient(to bottom, #81D4FA 0%, ${theme.palette.info.main} 100%)`
        : theme.palette.info.main;
    case 'cloudy':
    case 'foggy':
      return config.style === 'skeuomorphism'
        ? `linear-gradient(to bottom, #ECEFF1 0%, ${theme.palette.text.secondary} 100%)`
        : theme.palette.text.secondary;
    case 'snowy':
      return config.style === 'skeuomorphism'
        ? `linear-gradient(to bottom, #FFFFFF 0%, ${theme.palette.info.light} 100%)`
        : theme.palette.info.light;
    default:
      return config.style === 'skeuomorphism'
        ? `linear-gradient(to bottom, #ECEFF1 0%, ${theme.palette.text.secondary} 100%)`
        : theme.palette.text.secondary;
  }
};

/**
 * MaterialSymbol 아이콘 컴포넌트
 * 테마에 따라 filled/outline, weight 자동 적용
 */
const Icon = ({ name, size = 24, fill, color = 'inherit', weight, ...props }) => {
  const config = useDashboardConfig();

  // fill 값이 명시되지 않으면 테마 설정 사용
  const isFilled = fill !== undefined ? fill : config.iconStyle === 'filled';
  // weight 값이 명시되지 않으면 테마 설정 사용
  const iconWeight = weight !== undefined ? weight : config.iconWeight;

  // Pixel 테마 여부 및 픽셀 아이콘 경로 존재 확인
  const isPixel = config.style === 'pixel';
  const pixelPath = pixelWeatherIcons[name];

  // 아이콘 스타일 (gradient 아이콘은 트랜지션 문제로 사용하지 않음)
  const iconStyle = {
    color: color,
    textShadow: config.textShadow,
    imageRendering: config.style === 'pixel' ? 'pixelated' : 'auto',
    display: 'inline-block',
    transition: 'color 0.35s ease, text-shadow 0.35s ease, font-size 0.35s ease',
  };

  // Pixel 테마이고 픽셀 아이콘 경로가 있는 경우 SVG 렌더링
  if (isPixel && pixelPath) {
    return (
      <Box
        component="svg"
        viewBox="0 0 24 24"
        sx={{
          width: size,
          height: size,
          fill: color,
          display: 'inline-block',
          verticalAlign: 'middle',
          // SVG 트랜지션 (색상, 크기 등)
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          ...props.sx
        }}
        {...props}
      >
        <path d={pixelPath} />
      </Box>
    );
  }

  return (
    <span
      className="material-symbols-rounded"
      style={ {
        fontSize: size,
        fontVariationSettings: `'FILL' ${isFilled ? 1 : 0}, 'wght' ${iconWeight}, 'GRAD' 0, 'opsz' 24`,
        lineHeight: 1,
        display: 'inline-block',
        verticalAlign: 'middle',
        ...iconStyle,
      } }
      { ...props }
    >
      { name }
    </span>
  );
};

/**
 * Liquid Glass Layers Component
 */
const LiquidLayers = ({ config }) => {
  if (!config.liquidEffect) return null;

  return (
    <>
      {/* Glass Filter: 왜곡 효과 */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backdropFilter: 'blur(0px)',
          filter: 'url(#lg-dist)',
          isolation: 'isolate',
          pointerEvents: 'none',
        }}
      />
      {/* Glass Overlay: 배경색 */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: config.cardColors?.[0] || 'rgba(255,255,255,0.25)',
          pointerEvents: 'none',
        }}
      />
      {/* Glass Specular: 하이라이트 (좌상단, 우하단 코너 강조) */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          borderRadius: 'inherit',
          overflow: 'hidden',
          // 코너 하이라이트: 좌상단(흰색 강함), 우하단(흰색 약함), 나머지 투명
          boxShadow: config.highlightColor === 'corner-only'
            ? `inset 1px 1px 0 rgba(255,255,255,0.5), inset -1px -1px 0 rgba(255,255,255,0.2)`
            : `inset 1px 1px 0 ${config.highlightColor || 'rgba(255,255,255,0.75)'}, inset 0 0 5px ${config.highlightColor || 'rgba(255,255,255,0.75)'}`,
          // Corner Only Mode일 때 마스크 적용 (코너 부분만 남기고 중간 흐리게)
          maskImage: config.highlightColor === 'corner-only'
            ? 'linear-gradient(135deg, black 0%, transparent 25%, transparent 75%, black 100%)'
            : 'none',
          WebkitMaskImage: config.highlightColor === 'corner-only'
            ? 'linear-gradient(135deg, black 0%, transparent 25%, transparent 75%, black 100%)'
            : 'none',
          pointerEvents: 'none',
        }}
      />
    </>
  );
};

/**
 * 현재 날씨 카드
 */
const CurrentWeatherCard = ({ index = 0 }) => {
  const theme = useTheme();
  const config = useDashboardConfig();
  const isDark = theme.palette.mode === 'dark';
  const isFlat = config.style === 'tiles';

  // 통합 토큰에서 직접 스타일 가져오기
  const cardBg = config.cardColors?.[0] || theme.palette.background.paper;
  const textColor = config.textColor;
  const textSecondary = config.textSecondary;

  // 날씨 아이콘 색상
  const accentColor = getWeatherIconColor(currentWeather.condition, config, theme);

  // 테마 전환 트랜지션
  const transitionStyle = getTransitionStyle(config);
  const transitionDelay = `${index * 100}ms`;

  return (
    <Paper
      sx={ {
        p: isFlat ? 2.5 : 4, // Flat 테마일 때 패딩 축소
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: config.liquidEffect ? 'transparent' : cardBg,
        color: textColor,
        border: config.border,
        borderRadius: config.cardBorderRadius ?? theme.shape.borderRadius,
        boxShadow: config.shadow,
        backdropFilter: config.backdropFilter,
        WebkitBackdropFilter: config.WebkitBackdropFilter,
        transition: transitionStyle,
        transitionDelay: transitionDelay,
      } }
    >
      <LiquidLayers config={config} />
      
      {/* 배경 장식 - 회전 애니메이션 */}
      <Box
        sx={ {
          position: 'absolute',
          top: isFlat ? -20 : -40,
          right: isFlat ? -20 : -40,
          opacity: isDark ? 0.1 : 0.15,
          pointerEvents: 'none',
          zIndex: 3, // Liquid Layer 위
          '@keyframes spin': {
            from: { transform: 'rotate(0deg)' },
            to: { transform: 'rotate(360deg)' },
          },
          animation: 'spin 60s linear infinite',
        } }
      >
        <Icon
          name={ weatherIcons[currentWeather.condition] }
          size={ isFlat ? 240 : 200 } // Flat 테마일 때 아이콘 확대
          color={ textColor }
        />
      </Box>

      <Stack spacing={ isFlat ? 1.5 : 2 } sx={ { position: 'relative', zIndex: 3 } }>
        {/* 위치 */}
        <Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
          <Icon name="location_on" size={ 18 } color={ textSecondary } />
          <Typography variant="subtitle2" sx={ { color: textSecondary } }>
            { currentWeather.location }
          </Typography>
        </Box>

        {/* 온도 */}
        <Box sx={ { display: 'flex', alignItems: 'flex-start', gap: 2 } }>
          <Typography
            variant="h1"
            sx={ {
              fontSize: { xs: '4rem', md: isFlat ? '6.5rem' : '5.5rem' }, // Flat 테마일 때 폰트 확대
              fontWeight: isFlat ? 700 : 300, // Flat 테마일 때 굵게
              lineHeight: 1,
              color: textColor,
              textShadow: config.textShadow,
            } }
          >
            { currentWeather.temperature }
            <Typography
              component="span"
              sx={ {
                fontSize: '2rem',
                fontWeight: isFlat ? 600 : 300,
                verticalAlign: 'top',
              } }
            >
              °
            </Typography>
          </Typography>
          <Box sx={ { pt: 1 } }>
            <Icon
              name={ weatherIcons[currentWeather.condition] }
              size={ isFlat ? 64 : 48 } // Flat 테마일 때 날씨 아이콘 확대
              color={ accentColor }
            />
          </Box>
        </Box>

        {/* 상태 */}
        <Typography
          variant="h5"
          sx={ {
            fontWeight: isFlat ? 600 : 500,
            color: textColor,
            textShadow: config.textShadow,
          } }
        >
          { currentWeather.conditionText }
        </Typography>

        {/* 최고/최저 */}
        <Box sx={ { display: 'flex', alignItems: 'center', gap: 2 } }>
          <Typography variant="body2" sx={ { color: textSecondary } }>
            H: { currentWeather.high }°
          </Typography>
          <Typography variant="body2" sx={ { color: textSecondary } }>
            L: { currentWeather.low }°
          </Typography>
        </Box>

        {/* 업데이트 시간 */}
        <Typography
          variant="caption"
          sx={ { color: textSecondary, opacity: 0.8 } }
        >
          { currentWeather.updatedAt }
        </Typography>
      </Stack>
    </Paper>
  );
};

/**
 * 시간별 예보 카드
 */
const HourlyForecastCard = ({ index = 0 }) => {
  const theme = useTheme();
  const config = useDashboardConfig();
  const isDark = theme.palette.mode === 'dark';
  const isFlat = config.style === 'tiles';

  const cardBg = config.cardColors?.[2] || theme.palette.background.paper;
  const textColor = config.textColor;
  const textSecondary = config.textSecondary;

  // 테마 전환 트랜지션
  const transitionStyle = getTransitionStyle(config);
  const transitionDelay = `${index * 100}ms`;

  return (
    <Paper
      sx={ {
        p: isFlat ? 2 : 3, // Flat 테마일 때 패딩 축소
        background: config.liquidEffect ? 'transparent' : cardBg,
        color: textColor,
        border: config.border,
        borderRadius: config.cardBorderRadius ?? theme.shape.borderRadius,
        boxShadow: config.shadow,
        backdropFilter: config.backdropFilter,
        WebkitBackdropFilter: config.WebkitBackdropFilter,
        transition: transitionStyle,
        transitionDelay: transitionDelay,
        position: 'relative',
        overflow: 'hidden',
      } }
    >
      <LiquidLayers config={config} />
      <Box sx={{ position: 'relative', zIndex: 3 }}>
        <WindowTitle title="HOURLY FORECAST" config={config} textSecondary={textSecondary} />
        <Box
          sx={ {
            display: 'flex',
            justifyContent: 'space-between',
            overflowX: 'auto',
            pb: 1,
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : config.dividerColor,
              borderRadius: 2,
            },
          } }
        >
          { hourlyForecast.map((hour, index) => (
            <Box
              key={ hour.time }
              sx={ {
                flex: 1,
                textAlign: 'center',
                py: 1,
                px: 0.5,
                borderRadius: 0,
                background: config.subCardColors && index === 0
                  ? config.subCardColors[0]
                  : (index === 0
                    ? alpha(textColor, 0.1)
                    : 'transparent'),
                border: config.subCardColors && index === 0
                  ? (config.subBorder || 'none')
                  : (index === 0
                    ? `1px solid ${alpha(textColor, 0.3)}`
                    : '1px solid transparent'),
                boxShadow: config.subCardColors && index === 0
                  ? (config.subShadow || 'none')
                  : 'none',
              } }
            >
              <Typography
                variant="caption"
                sx={ {
                  fontWeight: index === 0 ? 600 : 400,
                  color: index === 0 ? textColor : textSecondary,
                } }
              >
                { hour.time }
              </Typography>
              <Box sx={ { my: 1 } }>
                <Icon
                  name={ weatherIcons[hour.condition] }
                  size={ isFlat ? 32 : 24 } // Flat 테마일 때 아이콘 확대
                  color={ getWeatherIconColor(hour.condition, config, theme) }
                />
              </Box>
              <Typography variant="body2" sx={ { fontWeight: 500, color: textColor } }>
                { hour.temp }°
              </Typography>
              { hour.precipitation > 0 && (
                <Typography
                  variant="caption"
                  sx={ {
                    color: textSecondary,
                    display: 'block',
                    mt: 0.5,
                  } }
                >
                  { hour.precipitation }%
                </Typography>
              ) }
            </Box>
          )) }
        </Box>
      </Box>
    </Paper>
  );
};

/**
 * 주간 예보 카드
 */
const WeeklyForecastCard = ({ index = 0 }) => {
  const theme = useTheme();
  const config = useDashboardConfig();
  const isFlat = config.style === 'tiles';

  const cardBg = config.cardColors?.[1] || theme.palette.background.paper;
  const textColor = config.textColor;
  const textSecondary = config.textSecondary;

  // 테마 전환 트랜지션
  const transitionStyle = getTransitionStyle(config);
  const transitionDelay = `${index * 100}ms`;

  return (
    <Paper
      sx={ {
        p: isFlat ? 2 : 3, // Flat 테마일 때 패딩 축소
        height: '100%',
        background: config.liquidEffect ? 'transparent' : cardBg,
        color: textColor,
        border: config.border,
        borderRadius: config.cardBorderRadius ?? theme.shape.borderRadius,
        boxShadow: config.shadow,
        backdropFilter: config.backdropFilter,
        WebkitBackdropFilter: config.WebkitBackdropFilter,
        transition: transitionStyle,
        transitionDelay: transitionDelay,
        position: 'relative',
        overflow: 'hidden',
      } }
    >
      <LiquidLayers config={config} />
      <Box sx={{ position: 'relative', zIndex: 3 }}>
        <WindowTitle title="7-DAY FORECAST" config={config} textSecondary={textSecondary} />
        <Stack spacing={ 0 }>
          { weeklyForecast.map((day, index) => (
            <Box
              key={ day.day }
              sx={ { display: 'flex', alignItems: 'center', py: isFlat ? 1.2 : 1.5, gap: 2 } }
            >
              <Typography
                variant="body2"
                sx={ {
                  width: 48,
                  fontWeight: index === 0 ? 600 : 400,
                  color: textColor,
                } }
              >
                { day.day }
              </Typography>
              <Box sx={ { width: isFlat ? 40 : 32, textAlign: 'center' } }>
                <Icon
                  name={ weatherIcons[day.condition] }
                  size={ isFlat ? 28 : 22 } // Flat 테마일 때 아이콘 확대
                  color={ getWeatherIconColor(day.condition, config, theme) }
                />
              </Box>
              { day.precipitation > 30 && (
                <Typography variant="caption" sx={ { color: textSecondary, width: 36 } }>
                  { day.precipitation }%
                </Typography>
              ) }
              { day.precipitation <= 30 && <Box sx={ { width: 36 } } /> }
              <Box sx={ { flex: 1, display: 'flex', alignItems: 'center', gap: 1 } }>
                <Typography variant="body2" sx={ { width: 28, color: textSecondary } }>
                  { day.low }°
                </Typography>
                <Box sx={ { flex: 1, mx: 1 } }>
                  { /* Aqua 테마: 스크롤바 스타일 프로그레스 바 */ }
                  { config.style === 'aqua' ? (
                    <AquaScrollbarProgress
                      value={ ((day.high - day.low) / 20) * 100 }
                    />
                  ) : (
                    <LinearProgress
                      variant="determinate"
                      value={ ((day.high - day.low) / 20) * 100 }
                      sx={ {
                        height: config.progressHeight,
                        borderRadius: config.progressGradient ? 2 : 0,
                        background: config.progressTrackColor,
                        '& .MuiLinearProgress-bar': {
                          borderRadius: config.progressGradient ? 2 : 0,
                          background: config.progressGradient
                            ? `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.warning.main})`
                            : config.progressBarColor,
                        },
                      } }
                    />
                  ) }
                </Box>
                <Typography variant="body2" sx={ { width: 28, fontWeight: 500, color: textColor } }>
                  { day.high }°
                </Typography>
              </Box>
            </Box>
          )) }
        </Stack>
      </Box>
    </Paper>
  );
};

/**
 * 상세 정보 카드
 */
const WeatherDetailsCard = ({ index = 0 }) => {
  const theme = useTheme();
  const config = useDashboardConfig();
  const isFlat = config.style === 'tiles';

  const cardBg = config.cardColors?.[3] || theme.palette.background.paper;
  const textColor = config.textColor;
  const textSecondary = config.textSecondary;

  // 테마 전환 트랜지션
  const transitionStyle = getTransitionStyle(config);
  const transitionDelay = `${index * 100}ms`;

  return (
    <Paper
      sx={ {
        p: isFlat ? 2 : 3, // Flat 테마일 때 패딩 축소
        height: '100%',
        background: config.liquidEffect ? 'transparent' : cardBg,
        color: textColor,
        border: config.border,
        borderRadius: config.cardBorderRadius ?? theme.shape.borderRadius,
        boxShadow: config.shadow,
        backdropFilter: config.backdropFilter,
        WebkitBackdropFilter: config.WebkitBackdropFilter,
        transition: transitionStyle,
        transitionDelay: transitionDelay,
        position: 'relative',
        overflow: 'hidden',
      } }
    >
      <LiquidLayers config={config} />
      <Box sx={{ position: 'relative', zIndex: 3 }}>
        <WindowTitle title="WEATHER DETAILS" config={config} textSecondary={textSecondary} />
        <Grid container spacing={ isFlat ? 1.5 : 2 }>
          { weatherDetails.map((detail, index) => (
            <Grid size={ 6 } key={ detail.label }>
              <Box
                sx={ {
                  p: isFlat ? 1.5 : 2, // Flat 테마일 때 패딩 축소
                  borderRadius: config.subBorderRadius ?? (theme.shape.borderRadius * 0.75),
                background: config.subCardColors
                  ? config.subCardColors[index % config.subCardColors.length]
                  : (config.style === 'tiles'
                    ? alpha(textColor, 0.15)
                    : theme.palette.background.paper),
                  border: config.subBorder || `1px solid ${config.borderColor}`,
                  boxShadow: config.subShadow || 'none',
                  backdropFilter: config.subBackdropFilter || 'none',
                  WebkitBackdropFilter: config.subBackdropFilter || 'none',
                  transition: transitionStyle,
                } }
              >
                <Box sx={ { display: 'flex', alignItems: 'center', gap: 1, mb: 1 } }>
                  <Icon
                    name={ detail.icon }
                    size={ isFlat ? 24 : 18 } // Flat 테마일 때 아이콘 확대
                    color={ textSecondary }
                  />
                  <Typography variant="caption" sx={ { color: textSecondary } }>
                    { detail.label }
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={ { fontWeight: 600, color: textColor, textShadow: config.textShadow, fontSize: isFlat ? '1.2rem' : '1rem' } }
                >
                  { detail.value }
                </Typography>
              </Box>
            </Grid>
          )) }
        </Grid>
      </Box>
    </Paper>
  );
};

/**
 * 일출/일몰 카드
 */
const SunCard = ({ index = 0 }) => {
  const theme = useTheme();
  const config = useDashboardConfig();
  const isFlat = config.style === 'tiles';

  const cardBg = config.cardColors?.[4] || theme.palette.background.paper;
  const textColor = config.textColor;
  const textSecondary = config.textSecondary;

  // 아이콘 색상
  // Color Pixel, Grey 3D는 컬러 아이콘 사용
  const isColorPixel = config.style === 'pixel' && config.background === '#9090D0';
  const isGrey3D = config.style === 'grey3d';
  const iconColor = config.style === 'tiles' || config.style === 'brutal' || (config.style === 'pixel' && !isColorPixel)
    ? textColor
    : (isColorPixel ? '#E8A000' : (isGrey3D ? '#CC9933' : theme.palette.warning.light));

  // 테마 전환 트랜지션
  const transitionStyle = getTransitionStyle(config);
  const transitionDelay = `${index * 100}ms`;

  return (
    <Paper
      sx={ {
        p: isFlat ? 2 : 3, // Flat 테마일 때 패딩 축소
        background: config.liquidEffect ? 'transparent' : cardBg,
        color: textColor,
        border: config.border,
        boxShadow: config.shadow,
        backdropFilter: config.backdropFilter,
        WebkitBackdropFilter: config.WebkitBackdropFilter,
        transition: transitionStyle,
        transitionDelay: transitionDelay,
        position: 'relative',
        overflow: 'hidden',
      } }
    >
      <LiquidLayers config={config} />
      <Box sx={{ position: 'relative', zIndex: 3 }}>
        <WindowTitle title="SUNRISE & SUNSET" config={config} textSecondary={textSecondary} />
        <Box sx={ { display: 'flex', justifyContent: 'space-around', alignItems: 'center' } }>
          <Box sx={ { textAlign: 'center' } }>
            <Icon name="wb_twilight" size={ isFlat ? 40 : 32 } color={ iconColor } />
            <Typography variant="body2" sx={ { mt: 1, color: textSecondary } }>
              Sunrise
            </Typography>
            <Typography variant="h6" sx={ { fontWeight: 600, color: textColor } }>
              { currentWeather.sunrise }
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={ { borderColor: config.dividerColor } } />
          <Box sx={ { textAlign: 'center' } }>
            <Icon
              name="wb_twilight"
              size={ isFlat ? 40 : 32 }
              color={ config.style === 'tiles' || (config.style === 'pixel' && !isColorPixel) 
                ? iconColor 
                : (isColorPixel ? '#D06020' : (isGrey3D ? '#AA7722' : theme.palette.warning.dark)) }
            />
            <Typography variant="body2" sx={ { mt: 1, color: textSecondary } }>
              Sunset
            </Typography>
            <Typography variant="h6" sx={ { fontWeight: 600, color: textColor } }>
              { currentWeather.sunset }
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

/**
 * 배경 블롭 컴포넌트 (Glass 테마용)
 */
const BackgroundBlobs = ({ blobs, transitionStyle }) => {
  if (!blobs || blobs.length === 0) return null;

  return (
    <>
      { blobs.map((blob, index) => (
        <Box
          key={ index }
          sx={ {
            position: 'absolute',
            width: blob.size,
            height: blob.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
            opacity: blob.opacity,
            top: blob.top,
            left: blob.left,
            right: blob.right,
            bottom: blob.bottom,
            filter: 'blur(60px)',
            pointerEvents: 'none',
            zIndex: 0,
            transition: transitionStyle || 'opacity 0.5s ease-out',
          } }
        />
      )) }
    </>
  );
};

/**
 * WeatherDashboard 메인 컴포넌트
 */
function WeatherDashboard() {
  const theme = useTheme();
  const config = useDashboardConfig();
  const isGlass = config.style === 'glass';

  // Glass 테마: 현재 날씨 조건에 맞는 색상 팔레트 사용
  const weatherPalette = getWeatherPalette(currentWeather.condition);

  // 테마 전환 트랜지션
  const transitionStyle = getTransitionStyle(config);

  // 배경 스타일 결정
  // Glass 테마는 weatherPalette.base를 atmosphere로 사용
  const baseBackgroundColor = config.background || theme.palette.background.default;
  
  const atmosphereGradient = isGlass
    ? weatherPalette.base
    : config.atmosphere;

  const atmosphereOpacity = isGlass
    ? 1
    : (config.atmosphereOpacity ?? 0);

  // 블롭 데이터: Glass 테마일 때 날씨 기반 팔레트 사용
  const blobs = isGlass ? weatherPalette.blobs : null;

  return (
    <Box
      sx={ {
        minHeight: '100vh',
        p: { xs: 2, md: 4 },
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: baseBackgroundColor, // 기본 배경색 (Solid)
        transition: transitionStyle,
        '& *': {
          transition: transitionStyle,
        },
      } }
    >
      {/* Atmosphere Layer (Gradient/Texture) */}
      <Box
        sx={ {
          position: 'absolute',
          inset: 0,
          background: atmosphereGradient || 'none',
          opacity: atmosphereOpacity,
          backgroundAttachment: isGlass ? 'fixed' : 'scroll',
          transition: transitionStyle,
          zIndex: 0,
          pointerEvents: 'none',
        } }
      />

      {/* Glass 테마용 배경 블롭 */}
      { isGlass && <BackgroundBlobs blobs={ blobs } transitionStyle={ transitionStyle } /> }

      {/* SVG Filter for Liquid Glass Effect */}
      <svg style={{ display: 'none' }}>
        <filter id="lg-dist" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
          <feDisplacementMap in="SourceGraphic" in2="blurred" scale="70" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <Box sx={ { maxWidth: 1200, mx: 'auto', position: 'relative', zIndex: 1 } }>
        {/* 헤더 */}
        <Box sx={ { mb: 4 } }>
          <Typography variant="h4" sx={ { fontWeight: 700, mb: 0.5 } }>
            Weather
          </Typography>
          <Typography variant="body2" color="text.secondary">
            { new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }) }
          </Typography>
        </Box>

        {/* 메인 그리드 */}
        <Grid container spacing={ 3 }>
          {/* 현재 날씨 */}
          <Grid size={ { xs: 12, md: 5 } }>
            <CurrentWeatherCard index={ 0 } />
          </Grid>

          {/* 상세 정보 */}
          <Grid size={ { xs: 12, md: 7 } }>
            <WeatherDetailsCard index={ 1 } />
          </Grid>

          {/* 시간별 예보 */}
          <Grid size={ 12 }>
            <HourlyForecastCard index={ 2 } />
          </Grid>

          {/* 주간 예보 */}
          <Grid size={ { xs: 12, md: 8 } }>
            <WeeklyForecastCard index={ 3 } />
          </Grid>

          {/* 일출/일몰 */}
          <Grid size={ { xs: 12, md: 4 } }>
            <SunCard index={ 4 } />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default WeatherDashboard;
