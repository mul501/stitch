/**
 * Simple Router - URL 기반 페이지 라우팅
 */

class Router {
  constructor() {
    this.routes = {
      'dashboard': 'dashboard.html',
      'characters': 'character_list.html',
      'character-detail': 'character_detail.html',
      'events': 'event_list.html',
      'event-detail': 'event_detail.html',
      'timeline': 'timeline.html',
      'synopsis': 'synopsis.html'
    };

    this.init();
  }

  /**
   * 라우터 초기화
   */
  init() {
    // URL 변경 감지
    window.addEventListener('popstate', () => this.handleRoute());

    // 페이지 로드 시 초기 라우팅
    this.handleRoute();
  }

  /**
   * 현재 URL에서 페이지와 파라미터 추출
   */
  getCurrentRoute() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page') || 'dashboard';
    const id = urlParams.get('id');

    return { page, id, params: urlParams };
  }

  /**
   * 라우트 처리
   */
  handleRoute() {
    const { page, id } = this.getCurrentRoute();

    // 페이지별 초기화 함수 호출 (각 페이지에서 정의)
    if (typeof window.initPage === 'function') {
      window.initPage(page, id);
    }
  }

  /**
   * 페이지 이동
   */
  navigate(page, params = {}) {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page);

    // 추가 파라미터 설정
    Object.keys(params).forEach(key => {
      if (params[key]) {
        url.searchParams.set(key, params[key]);
      }
    });

    // URL 변경 (페이지 새로고침 없이)
    window.history.pushState({}, '', url);

    // 실제 페이지 변경
    const filename = this.routes[page];
    if (filename) {
      window.location.href = filename + url.search;
    }
  }

  /**
   * 현재 페이지 가져오기
   */
  getCurrentPage() {
    return this.getCurrentRoute().page;
  }

  /**
   * URL 파라미터 가져오기
   */
  getParam(key) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key);
  }

  /**
   * URL 파라미터 설정 (페이지 이동 없이)
   */
  setParam(key, value) {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url);
  }
}

// 전역 인스턴스 생성
const router = new Router();
