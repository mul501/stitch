/**
 * Utility Functions - 검색, 필터, 정렬, UI 헬퍼
 */

const utils = {
  /**
   * 문자열 검색 (대소문자 무시, 한글/영문)
   */
  searchText(text, query) {
    if (!query || !text) return true;
    return text.toLowerCase().includes(query.toLowerCase());
  },

  /**
   * 배열 검색 (여러 필드)
   */
  searchArray(array, query, fields = ['name']) {
    if (!query) return array;

    return array.filter(item => {
      return fields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return this.searchText(value, query);
        }
        return false;
      });
    });
  },

  /**
   * 배열 필터링 (조건 객체)
   */
  filterArray(array, filters) {
    if (!filters || Object.keys(filters).length === 0) {
      return array;
    }

    return array.filter(item => {
      return Object.keys(filters).every(key => {
        const filterValue = filters[key];
        const itemValue = item[key];

        if (filterValue === null || filterValue === undefined || filterValue === '') {
          return true;
        }

        return itemValue === filterValue;
      });
    });
  },

  /**
   * 배열 정렬
   */
  sortArray(array, field, order = 'asc') {
    return [...array].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      if (typeof aVal === 'string') {
        return order === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return order === 'asc' ? aVal - bVal : bVal - aVal;
    });
  },

  /**
   * 디바운스 (검색 등에 사용)
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * 날짜 포맷팅
   */
  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  /**
   * 상대 시간 표시 (예: "2시간 전")
   */
  timeAgo(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 30) return `${diffDays}일 전`;

    return this.formatDate(dateString);
  },

  /**
   * 로딩 상태 표시
   */
  showLoading(container, message = '로딩 중...') {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    if (container) {
      container.innerHTML = `
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p class="text-gray-600">${message}</p>
          </div>
        </div>
      `;
    }
  },

  /**
   * 빈 상태 표시
   */
  showEmpty(container, message = '데이터가 없습니다', icon = 'inbox') {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    if (container) {
      container.innerHTML = `
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <span class="material-symbols-outlined text-gray-400 text-6xl mb-4">${icon}</span>
            <p class="text-gray-600">${message}</p>
          </div>
        </div>
      `;
    }
  },

  /**
   * 에러 표시
   */
  showError(container, message = '오류가 발생했습니다') {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    if (container) {
      container.innerHTML = `
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <span class="material-symbols-outlined text-red-500 text-6xl mb-4">error</span>
            <p class="text-red-600">${message}</p>
          </div>
        </div>
      `;
    }
  },

  /**
   * 토스트 메시지
   */
  showToast(message, type = 'success', duration = 3000) {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
      warning: 'bg-yellow-500'
    };

    const icons = {
      success: 'check_circle',
      error: 'error',
      info: 'info',
      warning: 'warning'
    };

    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-up`;
    toast.innerHTML = `
      <span class="material-symbols-outlined">${icons[type]}</span>
      <span>${message}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'transition-opacity');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  /**
   * localStorage 헬퍼
   */
  storage: {
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error('Error writing to localStorage:', error);
        return false;
      }
    },

    remove(key) {
      localStorage.removeItem(key);
    },

    clear() {
      localStorage.clear();
    }
  },

  /**
   * HTML 이스케이프
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  },

  /**
   * 텍스트 자르기
   */
  truncate(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  /**
   * 배열에서 ID로 아이템 찾기
   */
  findById(array, id) {
    return array.find(item => item.id === id) || null;
  },

  /**
   * 배열에서 여러 ID로 아이템들 찾기
   */
  findByIds(array, ids) {
    if (!ids || ids.length === 0) return [];
    return array.filter(item => ids.includes(item.id));
  },

  /**
   * 이미지 로드 에러 처리 (기본 이미지 표시)
   */
  handleImageError(event) {
    event.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
  },

  /**
   * 클립보드 복사
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('클립보드에 복사되었습니다', 'success');
      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      this.showToast('복사에 실패했습니다', 'error');
      return false;
    }
  },

  /**
   * 전화번호 포맷팅
   */
  formatPhone(phone) {
    if (!phone) return '';
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  },

  /**
   * 사이드바 토글
   */
  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    if (sidebar && overlay) {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('open');
    }
  },

  /**
   * 사용자 프로필 관리
   */
  // 사용자 정보 가져오기
  getUserProfile() {
    const defaultUser = {
      name: '김작가',
      role: '작가',
      avatar: 'https://ui-avatars.com/api/?name=김작가&background=4285F4&color=fff'
    };

    // localStorage에서 사용자 정보 가져오기 (없으면 기본값)
    const stored = localStorage.getItem('userProfile');
    return stored ? JSON.parse(stored) : defaultUser;
  },

  // 사용자 정보 저장
  setUserProfile(profile) {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    this.updateUserProfileUI(profile);
  },

  // UI에 사용자 정보 표시
  updateUserProfileUI(profile = null) {
    const user = profile || this.getUserProfile();

    // 사용자 이름
    const nameEl = document.getElementById('user-name');
    if (nameEl) {
      nameEl.textContent = user.name;
    }

    // 사용자 아바타
    const avatarEl = document.getElementById('user-avatar');
    if (avatarEl) {
      avatarEl.src = user.avatar;
      avatarEl.alt = user.name;
    }

    // 역할 (있으면)
    const roleEl = document.getElementById('user-role');
    if (roleEl) {
      roleEl.textContent = user.role;
    }
  },

  // 페이지 로드 시 자동으로 사용자 정보 표시
  initUserProfile() {
    this.updateUserProfileUI();
  }
};

// 간단한 애니메이션 CSS 추가
if (!document.querySelector('#utils-styles')) {
  const style = document.createElement('style');
  style.id = 'utils-styles';
  style.textContent = `
    @keyframes slide-up {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    .animate-slide-up {
      animation: slide-up 0.3s ease-out;
    }
  `;
  document.head.appendChild(style);
}
