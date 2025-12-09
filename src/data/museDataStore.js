/**
 * MUSE 세션 데이터 스토어
 *
 * 세션 내에서 데이터를 유지하고 동적 업데이트를 지원하는 간단한 인메모리 스토어.
 * 실제 API 연동 전까지 프로토타입용으로 사용.
 *
 * 동작 방식:
 * 1. 앱 시작 시 museDataStore가 초기 Mock 데이터로 초기화됨
 * 2. 각 페이지/컴포넌트에서 getAssets(), getMoodboards() 등으로 데이터 조회
 * 3. addAsset(), addMoodboard() 등으로 데이터 추가 시 subscribers에게 알림
 * 4. subscribe()로 변경 이벤트 구독, 컴포넌트에서 setState 연동
 *
 * Example usage:
 * // 컴포넌트에서 사용
 * useEffect(() => {
 *   setAssets(museDataStore.getAssets());
 *   const unsubscribe = museDataStore.subscribe('assets', (newAssets) => {
 *     setAssets(newAssets);
 *   });
 *   return unsubscribe;
 * }, []);
 */

import { museProjects, museMetrics, museUser } from './museMockData';
import { allImages } from '../utils/pexels-test-data';

/**
 * pexels-test-data 형식을 museAssets 형식으로 변환
 */
function convertToMuseAsset(pexelsImage, index) {
  return {
    id: `asset-${String(index + 1).padStart(3, '0')}`,
    title: pexelsImage.alt,
    type: 'image',
    format: 'JPG',
    resolution: pexelsImage.aspectRatio === '16/9' ? '1920x1080' : '1200x900',
    size: `${Math.floor(Math.random() * 10 + 2)} MB`,
    thumbnail: pexelsImage.src.medium,
    tags: pexelsImage.tags || [],
    license: 'Pexels License',
    status: 'approved',
    photographer: pexelsImage.photographer,
    aspectRatio: pexelsImage.aspectRatio,
    src: pexelsImage.src,
  };
}

// pexels-test-data의 이미지를 museAssets 형식으로 변환
const museAssets = allImages.map(convertToMuseAsset);

/**
 * 간단한 ID 생성기
 */
function generateId(prefix = 'item') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 현재 날짜를 YYYY-MM-DD 형식으로 반환
 */
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * 데이터 스토어 클래스
 */
class MuseDataStore {
  constructor() {
    // 초기 데이터 (디자인 결과물 이미지로 구성)
    // 카테고리별 8개: abstract(0-7), fineart(8-15), illustration(16-23), poster(24-31), gradient(32-39), photography(40-47), portrait(48-55)
    this.data = {
      assets: [...museAssets],
      moodboards: [
        {
          id: 'board-1',
          name: 'Abstract Art',
          description: 'Abstract and geometric artwork collection',
          items: [museAssets[0], museAssets[1], museAssets[2], museAssets[3]],
          createdAt: '2024-10-15',
        },
        {
          id: 'board-2',
          name: 'Fine Art',
          description: 'Paintings and canvas artwork',
          items: [museAssets[8], museAssets[9], museAssets[10], museAssets[11]],
          createdAt: '2024-10-10',
        },
        {
          id: 'board-3',
          name: 'Illustration',
          description: 'Digital illustration and artwork',
          items: [museAssets[16], museAssets[17], museAssets[18], museAssets[19]],
          createdAt: '2024-09-28',
        },
        {
          id: 'board-4',
          name: 'Photography',
          description: 'Product and editorial photography',
          items: [museAssets[40], museAssets[41], museAssets[42], museAssets[43]],
          createdAt: '2024-09-15',
        },
        {
          id: 'board-5',
          name: 'Portrait',
          description: 'Fashion and artistic portraits',
          items: [museAssets[48], museAssets[49], museAssets[50], museAssets[51]],
          createdAt: '2024-09-01',
        },
      ],
      projects: [...museProjects],
      metrics: [...museMetrics],
      user: { ...museUser },
    };

    // 구독자 목록
    this.subscribers = {
      assets: [],
      moodboards: [],
      projects: [],
      metrics: [],
      user: [],
    };
  }

  /**
   * 구독자들에게 변경 알림
   */
  notify(key) {
    this.subscribers[key].forEach((callback) => {
      callback(this.data[key]);
    });
  }

  /**
   * 데이터 변경 구독
   * @returns {function} unsubscribe 함수
   */
  subscribe(key, callback) {
    if (!this.subscribers[key]) {
      console.warn(`Unknown data key: ${key}`);
      return () => {};
    }
    this.subscribers[key].push(callback);

    // unsubscribe 함수 반환
    return () => {
      this.subscribers[key] = this.subscribers[key].filter((cb) => cb !== callback);
    };
  }

  // ============================================
  // Assets (레퍼런스 이미지) 관련 메서드
  // ============================================

  /**
   * 모든 에셋 조회
   */
  getAssets() {
    return [...this.data.assets];
  }

  /**
   * 에셋 ID로 조회
   */
  getAssetById(id) {
    return this.data.assets.find((asset) => asset.id === id);
  }

  /**
   * 새 에셋 추가
   */
  addAsset(assetData) {
    const newAsset = {
      id: generateId('asset'),
      title: assetData.title || 'Untitled',
      type: assetData.type || 'image',
      format: assetData.format || 'JPG',
      resolution: assetData.resolution || 'Unknown',
      size: assetData.size || 'Unknown',
      thumbnail: assetData.thumbnail || assetData.previewUrl || '',
      tags: assetData.tags || [],
      license: assetData.license || 'Personal',
      status: 'pending',
      createdAt: getCurrentDate(),
    };

    this.data.assets = [newAsset, ...this.data.assets];
    this.notify('assets');
    return newAsset;
  }

  /**
   * 에셋 삭제
   */
  deleteAsset(id) {
    this.data.assets = this.data.assets.filter((asset) => asset.id !== id);
    this.notify('assets');
  }

  /**
   * 에셋 업데이트
   */
  updateAsset(id, updates) {
    this.data.assets = this.data.assets.map((asset) =>
      asset.id === id ? { ...asset, ...updates } : asset
    );
    this.notify('assets');
  }

  // ============================================
  // Moodboards (무드보드) 관련 메서드
  // ============================================

  /**
   * 모든 무드보드 조회
   */
  getMoodboards() {
    return [...this.data.moodboards];
  }

  /**
   * 무드보드 ID로 조회
   */
  getMoodboardById(id) {
    return this.data.moodboards.find((board) => board.id === id);
  }

  /**
   * 새 무드보드 생성
   */
  createMoodboard(name, description = '') {
    const newBoard = {
      id: generateId('board'),
      name,
      description,
      items: [],
      createdAt: getCurrentDate(),
    };

    this.data.moodboards = [...this.data.moodboards, newBoard];
    this.notify('moodboards');
    return newBoard;
  }

  /**
   * 무드보드 이름 변경
   */
  renameMoodboard(id, name) {
    this.data.moodboards = this.data.moodboards.map((board) =>
      board.id === id ? { ...board, name } : board
    );
    this.notify('moodboards');
  }

  /**
   * 무드보드 삭제
   */
  deleteMoodboard(id) {
    this.data.moodboards = this.data.moodboards.filter((board) => board.id !== id);
    this.notify('moodboards');
  }

  /**
   * 무드보드 복제
   */
  duplicateMoodboard(id) {
    const original = this.getMoodboardById(id);
    if (!original) return null;

    const duplicated = {
      ...original,
      id: generateId('board'),
      name: `${original.name} (Copy)`,
      items: [...original.items],
      createdAt: getCurrentDate(),
    };

    this.data.moodboards = [...this.data.moodboards, duplicated];
    this.notify('moodboards');
    return duplicated;
  }

  /**
   * 무드보드에 아이템 추가
   */
  addItemToMoodboard(boardId, asset) {
    this.data.moodboards = this.data.moodboards.map((board) => {
      if (board.id !== boardId) return board;

      // 이미 존재하는지 확인
      const exists = board.items.some((item) => item.id === asset.id);
      if (exists) return board;

      return { ...board, items: [...board.items, asset] };
    });
    this.notify('moodboards');
  }

  /**
   * 무드보드에서 아이템 제거
   */
  removeItemFromMoodboard(boardId, assetId) {
    this.data.moodboards = this.data.moodboards.map((board) =>
      board.id === boardId
        ? { ...board, items: board.items.filter((item) => item.id !== assetId) }
        : board
    );
    this.notify('moodboards');
  }

  // ============================================
  // 간단 조회용 (읽기 전용)
  // ============================================

  getProjects() {
    return [...this.data.projects];
  }

  getMetrics() {
    return [...this.data.metrics];
  }

  getUser() {
    return { ...this.data.user };
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const museDataStore = new MuseDataStore();

export default museDataStore;
