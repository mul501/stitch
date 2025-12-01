/**
 * Navigation Component - 통일된 네비게이션 시스템
 */

const navigation = {
  // 통일된 색상 테마
  theme: {
    primary: '#4285F4',
    primaryHover: '#357ae8',
    background: '#F8F9FA',
    text: '#1F2937',
    textGray: '#6B7280',
    border: '#E5E7EB'
  },

  // 메뉴 항목
  menuItems: [
    { id: 'dashboard', label: '대시보드', icon: 'dashboard', page: 'dashboard' },
    { id: 'characters', label: '캐릭터', icon: 'person', page: 'characters' },
    { id: 'graph', label: '관계도', icon: 'hub', page: 'graph' },
    { id: 'events', label: '이벤트', icon: 'event', page: 'events' },
    { id: 'timeline', label: '타임라인', icon: 'timeline', page: 'timeline' },
    { id: 'synopsis', label: '시놉시스', icon: 'auto_stories', page: 'synopsis' },
    { id: 'foreshadowing', label: '복선/떡밥', icon: 'help', page: 'foreshadowing' }
  ],

  /**
   * 사이드바 생성
   */
  createSidebar(activePageId = 'dashboard') {
    const project = utils.storage.get('activeProject', { name: '잃어버린 왕국' });

    return `
      <aside class="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
        <!-- 프로젝트 정보 -->
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">${project.name || '프로젝트'}</h2>
          <p class="text-sm text-gray-500 mt-1">${project.genre || '판타지'}</p>
        </div>

        <!-- 메뉴 -->
        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          ${this.menuItems.map(item => {
            const isActive = item.id === activePageId;
            return `
              <a
                href="?page=${item.page}"
                class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }"
                onclick="navigation.navigateTo('${item.page}'); return false;"
              >
                <span class="material-symbols-outlined">${item.icon}</span>
                <span>${item.label}</span>
              </a>
            `;
          }).join('')}
        </nav>

        <!-- 사용자 프로필 -->
        <div class="p-4 border-t border-gray-200">
          <div class="flex items-center gap-3">
            <img
              src="https://ui-avatars.com/api/?name=${encodeURIComponent(project.author || '김작가')}&background=4285F4&color=fff"
              class="w-10 h-10 rounded-full"
              alt="프로필"
            >
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">${project.author || '김작가'}</p>
              <p class="text-xs text-gray-500">작가</p>
            </div>
            <button class="text-gray-400 hover:text-gray-600" title="설정">
              <span class="material-symbols-outlined">settings</span>
            </button>
          </div>
        </div>
      </aside>
    `;
  },

  /**
   * 상단 헤더 생성 (사이드바 없는 페이지용)
   */
  createHeader(activePageId = 'dashboard') {
    const project = utils.storage.get('activeProject', { name: '잃어버린 왕국' });

    return `
      <header class="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- 로고 및 프로젝트명 -->
            <div class="flex items-center gap-4">
              <h1 class="text-xl font-bold text-gray-900">${project.name || '프로젝트'}</h1>
            </div>

            <!-- 네비게이션 메뉴 -->
            <nav class="hidden md:flex items-center gap-1">
              ${this.menuItems.map(item => {
                const isActive = item.id === activePageId;
                return `
                  <a
                    href="?page=${item.page}"
                    class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }"
                    onclick="navigation.navigateTo('${item.page}'); return false;"
                  >
                    <span class="material-symbols-outlined text-sm">${item.icon}</span>
                    <span>${item.label}</span>
                  </a>
                `;
              }).join('')}
            </nav>

            <!-- 사용자 프로필 -->
            <div class="flex items-center gap-4">
              <button class="text-gray-400 hover:text-gray-600" title="알림">
                <span class="material-symbols-outlined">notifications</span>
              </button>
              <button class="text-gray-400 hover:text-gray-600" title="설정">
                <span class="material-symbols-outlined">settings</span>
              </button>
              <img
                src="https://ui-avatars.com/api/?name=${encodeURIComponent(project.author || '김작가')}&background=4285F4&color=fff"
                class="w-8 h-8 rounded-full cursor-pointer"
                alt="프로필"
                title="${project.author || '김작가'}"
              >
            </div>
          </div>
        </div>
      </header>
    `;
  },

  /**
   * 모바일 메뉴 토글 버튼
   */
  createMobileMenuButton() {
    return `
      <button
        id="mobile-menu-btn"
        class="md:hidden fixed top-4 left-4 z-50 bg-white rounded-lg p-2 shadow-lg"
        onclick="navigation.toggleMobileMenu()"
      >
        <span class="material-symbols-outlined">menu</span>
      </button>
    `;
  },

  /**
   * 페이지 레이아웃 초기화
   */
  init(pageId, layoutType = 'sidebar') {
    const bodyElement = document.body;

    // 활성 프로젝트 로드
    this.loadActiveProject();

    // 레이아웃 타입에 따라 네비게이션 삽입
    if (layoutType === 'sidebar') {
      // 사이드바 레이아웃
      const sidebar = document.createElement('div');
      sidebar.innerHTML = this.createSidebar(pageId);
      bodyElement.insertBefore(sidebar.firstElementChild, bodyElement.firstChild);

      // 메인 컨텐츠 영역에 여백 추가
      const mainContent = document.querySelector('main') || document.querySelector('.main-content');
      if (mainContent) {
        mainContent.style.marginLeft = '16rem'; // w-64 = 16rem
      }
    } else if (layoutType === 'header') {
      // 헤더 레이아웃
      const header = document.createElement('div');
      header.innerHTML = this.createHeader(pageId);
      bodyElement.insertBefore(header.firstElementChild, bodyElement.firstChild);

      // 메인 컨텐츠 영역에 상단 여백 추가
      const mainContent = document.querySelector('main') || document.querySelector('.main-content');
      if (mainContent) {
        mainContent.style.paddingTop = '4rem'; // h-16 = 4rem
      }
    }

    // 모바일 메뉴 버튼 추가 (사이드바 레이아웃일 때)
    if (layoutType === 'sidebar') {
      const mobileBtn = document.createElement('div');
      mobileBtn.innerHTML = this.createMobileMenuButton();
      bodyElement.appendChild(mobileBtn.firstElementChild);
    }

    // 전역 스타일 추가
    this.injectGlobalStyles();
  },

  /**
   * 활성 프로젝트 로드
   */
  async loadActiveProject() {
    const project = await dataLoader.getActiveProject();
    if (project) {
      utils.storage.set('activeProject', project);
    }
  },

  /**
   * 페이지 이동
   */
  navigateTo(page, params = {}) {
    const url = new URL(window.location.href);
    const filename = {
      'dashboard': 'index.html',
      'characters': 'character_list.html',
      'graph': 'character_graph.html',
      'events': 'event_list.html',
      'timeline': 'timeline.html',
      'synopsis': 'synopsis.html',
      'foreshadowing': 'foreshadowing.html'
    }[page];

    if (filename) {
      // 파라미터 추가
      const queryParams = new URLSearchParams(params);
      window.location.href = filename + (queryParams.toString() ? '?' + queryParams.toString() : '');
    }
  },

  /**
   * 모바일 메뉴 토글
   */
  toggleMobileMenu() {
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      sidebar.classList.toggle('hidden');
    }
  },

  /**
   * 전역 스타일 삽입
   */
  injectGlobalStyles() {
    if (!document.querySelector('#navigation-styles')) {
      const style = document.createElement('style');
      style.id = 'navigation-styles';
      style.textContent = `
        /* 네비게이션 글로벌 스타일 */
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', 'Noto Sans KR', sans-serif;
          background-color: ${this.theme.background};
        }

        /* 사이드바 반응형 */
        @media (max-width: 768px) {
          aside {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            z-index: 50;
          }

          aside:not(.hidden) {
            transform: translateX(0);
          }

          main, .main-content {
            margin-left: 0 !important;
          }
        }

        /* 링크 기본 스타일 */
        a {
          text-decoration: none;
          color: inherit;
        }

        /* 머티리얼 아이콘 크기 */
        .material-symbols-outlined {
          font-size: 24px;
        }

        /* 스크롤바 스타일 */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        ::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
      `;
      document.head.appendChild(style);
    }
  },

  /**
   * 브레드크럼 생성
   */
  createBreadcrumb(items) {
    return `
      <nav class="flex items-center gap-2 text-sm text-gray-600 mb-6">
        ${items.map((item, index) => `
          ${index > 0 ? '<span class="material-symbols-outlined text-xs">chevron_right</span>' : ''}
          ${item.href ?
            `<a href="${item.href}" class="hover:text-blue-600">${item.label}</a>` :
            `<span class="text-gray-900 font-medium">${item.label}</span>`
          }
        `).join('')}
      </nav>
    `;
  }
};
