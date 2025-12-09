/**
 * Landing Page Content
 *
 * MUSE 랜딩페이지의 모든 텍스트 콘텐츠를 관리하는 중앙 저장소.
 * 콘텐츠 수정 시 이 파일만 변경하면 됩니다.
 */

export const landingContent = {
  // ============================================
  // Hero Section - 핵심 브랜드 메시지
  // ============================================
  hero: {
    // 브랜드 타이틀
    brandName: 'MUSE',
    tagline: 'Visual Inspiration Archiving Solution',

    // 핵심 메시지 (3줄 히어로 헤드라인)
    headline: [
      'CAPTURE',
      'CURATE',
      'CREATE',
    ],

    // 서브 카피
    description: '웹과 로컬에서 발견한 시각적 영감을 체계적으로 아카이빙하고, 태그 기반으로 탐색하며, 프로젝트별 무드보드를 구축하세요.',

    // 3가지 USP 요약 (Hero 하단 표시)
    usps: [
      {
        id: 'capture',
        keyword: 'Capture',
        title: 'Effortless Upload',
        description: '드래그 앤 드롭으로 레퍼런스를 즉시 아카이브에 추가',
        icon: 'cloud_upload',
      },
      {
        id: 'curate',
        keyword: 'Curate',
        title: 'Smart Organization',
        description: '카테고리와 태그로 체계적인 레퍼런스 관리',
        icon: 'category',
      },
      {
        id: 'create',
        keyword: 'Create',
        title: 'Moodboard Builder',
        description: '선별된 이미지로 프로젝트 무드보드 구축',
        icon: 'dashboard_customize',
      },
    ],
  },

  // ============================================
  // USP Section - 각 기능의 상세 설명
  // ============================================
  usp: {
    sectionTitle: 'How It Works',
    sectionSubtitle: '디자이너의 워크플로우에 맞춘 직관적인 기능',

    items: [
      {
        id: 'upload',
        number: '01',
        title: 'Upload & Organize',
        subtitle: '레퍼런스 업로드',
        description: '파일을 드래그하거나 클릭하여 업로드하세요. 업로드 과정에서 제목, 카테고리, 태그를 즉시 입력하여 체계적으로 정리할 수 있습니다.',
        details: [
          '드래그 앤 드롭 업로드',
          '다중 파일 동시 업로드',
          '메타데이터 즉시 입력',
          '진행률 실시간 표시',
        ],
        component: 'UploadModal',
        layoutReverse: false,
      },
      {
        id: 'filter',
        number: '02',
        title: 'Search & Filter',
        subtitle: '스마트 필터링',
        description: '키워드 검색과 태그 필터를 조합하여 원하는 레퍼런스를 정확하게 찾으세요. 정렬 옵션과 뷰 모드 전환으로 탐색 경험을 최적화합니다.',
        details: [
          '실시간 키워드 검색',
          '다중 태그 필터링',
          '정렬 옵션 (최신순, 이름순)',
          '그리드/리스트 뷰 전환',
        ],
        component: 'FilterBar',
        layoutReverse: true,
      },
      {
        id: 'curate',
        number: '03',
        title: 'Curate Moodboards',
        subtitle: '무드보드 큐레이션',
        description: '선별된 레퍼런스를 프로젝트별 무드보드에 담아 시각적 가이드라인을 완성하세요. 여러 개의 무드보드를 생성하고 관리할 수 있습니다.',
        details: [
          '원클릭 무드보드 추가',
          '무제한 무드보드 생성',
          '썸네일 그리드 미리보기',
          '드래그로 순서 변경',
        ],
        component: 'Moodboard',
        layoutReverse: false,
      },
    ],
  },

  // ============================================
  // Features Grid - 추가 기능 하이라이트
  // ============================================
  features: {
    sectionTitle: 'Built for Designers',
    sectionSubtitle: '디자인 워크플로우를 위한 세심한 기능',

    items: [
      {
        id: 'detail-view',
        title: 'Detail View',
        description: '고해상도 이미지와 메타데이터를 한눈에 확인',
        icon: 'visibility',
      },
      {
        id: 'keyboard-nav',
        title: 'Keyboard Navigation',
        description: '화살표 키로 빠르게 이미지 탐색',
        icon: 'keyboard',
      },
      {
        id: 'responsive',
        title: 'Responsive Grid',
        description: 'Masonry 레이아웃으로 최적의 이미지 배치',
        icon: 'grid_view',
      },
      {
        id: 'dark-mode',
        title: 'Dark Mode Ready',
        description: '눈의 피로를 줄이는 다크 테마 지원',
        icon: 'dark_mode',
      },
    ],
  },

  // ============================================
  // CTA Section - 행동 유도
  // ============================================
  cta: {
    // 헤드라인 옵션
    headline: 'Start Archiving Your Inspiration',
    subheadline: '지금 바로 시각적 영감을 체계적으로 관리하세요',

    // 설명
    description: '무료로 시작하고, 당신만의 레퍼런스 라이브러리를 구축하세요. 더 이상 영감을 잃어버리지 마세요.',

    // CTA 버튼
    primaryButton: {
      text: 'Go to Archive',
      link: '/archive',
    },
    secondaryButton: {
      text: 'View Components',
      link: '/storybook',
    },

    // 통계/소셜 프루프 (선택적)
    stats: [
      { value: '10,000+', label: 'References' },
      { value: '500+', label: 'Moodboards' },
      { value: '100%', label: 'Free' },
    ],
  },

  // ============================================
  // Footer 정보
  // ============================================
  footer: {
    brand: 'MUSE',
    tagline: 'Visual Inspiration Archiving Solution',
    copyright: '© 2024 MUSE. Built with React + MUI.',
    links: [
      { text: 'Storybook', href: '/?path=/docs/pages-overview--docs' },
      { text: 'GitHub', href: '#' },
    ],
  },
};

// 데모용 목업 데이터
export const demoData = {
  // FilterBar 데모용 태그
  availableTags: [
    'UI Design',
    'Typography',
    'Photography',
    'Branding',
    'Illustration',
    '3D',
    'Motion',
    'Architecture',
  ],
  selectedTags: ['UI Design', 'Typography'],

  // Moodboard 데모용 데이터
  moodboards: [
    {
      id: 'demo-1',
      name: 'Brand Identity',
      description: 'Visual references for brand redesign project',
      items: [
        { thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400' },
        { thumbnail: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400' },
        { thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
        { thumbnail: 'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=400' },
      ],
      createdAt: '2024-11-15',
    },
    {
      id: 'demo-2',
      name: 'Typography Study',
      description: 'Font pairings and type explorations',
      items: [
        { thumbnail: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400' },
        { thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400' },
      ],
      createdAt: '2024-11-10',
    },
  ],

  // Gallery 데모용 이미지
  galleryImages: [
    {
      src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
      title: 'Abstract Gradient',
      tags: ['UI Design', '3D'],
    },
    {
      src: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800',
      title: 'Geometric Shapes',
      tags: ['Illustration', 'Branding'],
    },
    {
      src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      title: 'Portrait Study',
      tags: ['Photography'],
    },
    {
      src: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=800',
      title: 'Typography Art',
      tags: ['Typography'],
    },
    {
      src: 'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=800',
      title: 'Color Exploration',
      tags: ['UI Design', 'Branding'],
    },
    {
      src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      title: 'Mountain Landscape',
      tags: ['Photography', 'Architecture'],
    },
  ],
};
