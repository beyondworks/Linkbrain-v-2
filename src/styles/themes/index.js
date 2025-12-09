/**
 * Theme System
 *
 * 여러 테마를 관리하고 전환할 수 있는 유틸리티를 제공합니다.
 * 각 테마는 MUI createTheme 규격을 따릅니다.
 */

import defaultTheme from './default.js';
import pixelModernismTheme from './pixel-modernism.js';
import colorPixelTheme from './color-pixel.js';
import grey3dTheme from './grey-3d.js';
import aquaTheme from './aqua.js';
import flatTheme from './flat.js';
import materialTheme from './material.js';
import glassmorphismTheme from './glassmorphism.js';
import monolineDarkTheme from './monoline-dark.js';
import neubrutalismTheme from './neubrutalism.js';
import skeuomorphismTheme from './skeuomorphism.js';
import liquidGlassTheme from './liquid-glass.js';

/** 사용 가능한 테마 목록 */
export const themes = {
  default: defaultTheme,
  'pixel-modernism': pixelModernismTheme,
  'color-pixel': colorPixelTheme,
  'grey-3d': grey3dTheme,
  aqua: aquaTheme,
  skeuomorphism: skeuomorphismTheme,
  flat: flatTheme,
  material: materialTheme,
  neubrutalism: neubrutalismTheme,
  glassmorphism: glassmorphismTheme,
  'monoline-dark': monolineDarkTheme,
  'liquid-glass': liquidGlassTheme,
};

/** 테마 메타데이터 */
export const themeMeta = {
  default: {
    name: 'Default',
    description: '프로젝트 기본 테마, 날카로운 모서리와 은은한 그림자',
    mode: 'light',
  },
  'pixel-modernism': {
    name: 'Pixel Modernism',
    description: '매킨토시 스타일의 흑백 픽셀 GUI',
    mode: 'light',
  },
  'color-pixel': {
    name: 'Color Pixel',
    description: 'Apple IIgs 스타일의 16컬러 레트로 GUI',
    mode: 'light',
  },
  'grey-3d': {
    name: 'Grey 3D',
    description: 'Mac OS 8 Platinum 스타일의 3D 그레이 UI',
    mode: 'light',
  },
  aqua: {
    name: 'Aqua',
    description: 'Mac OS X 10.0 스타일의 젤 버튼과 파란 그라디언트',
    mode: 'light',
  },
  skeuomorphism: {
    name: 'Skeuomorphism',
    description: '가죽과 유리 질감의 클래식 스큐어모피즘',
    mode: 'dark',
  },
  flat: {
    name: 'Flat Design',
    description: 'Metro 스타일의 순수 플랫 디자인, 그림자 없음',
    mode: 'light',
  },
  material: {
    name: 'Material Design',
    description: '라운드 카드와 미세한 elevation의 모던 머티리얼',
    mode: 'light',
  },
  neubrutalism: {
    name: 'Neubrutalism',
    description: '대담한 하드 섀도우와 두꺼운 테두리',
    mode: 'light',
  },
  glassmorphism: {
    name: 'Glass Morphism',
    description: '몽환적인 반투명 유리 효과',
    mode: 'light',
  },
  'monoline-dark': {
    name: 'Monoline Dark',
    description: '미니멀한 라인 기반 다크 UI',
    mode: 'dark',
  },
  'liquid-glass': {
    name: 'Liquid Glass',
    description: 'SVG 필터로 물결치는 젤리 유리 효과',
    mode: 'dark',
  },
};

/**
 * 테마 이름으로 테마 객체 가져오기
 *
 * @param {string} themeName - 테마 이름 (material, glassmorphism, monoline-dark)
 * @returns {object} MUI 테마 객체
 */
export const getTheme = (themeName) => {
  return themes[themeName] || themes.default;
};

/**
 * 테마 이름 목록 가져오기
 *
 * @returns {string[]} 테마 이름 배열
 */
export const getThemeNames = () => Object.keys(themes);

export { defaultTheme, pixelModernismTheme, colorPixelTheme, grey3dTheme, aquaTheme, flatTheme, materialTheme, glassmorphismTheme, monolineDarkTheme, neubrutalismTheme, skeuomorphismTheme, liquidGlassTheme };
export default themes;
