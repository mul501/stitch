/**
 * Foreshadowing Form - 복선/떡밥 생성/수정/삭제 모달 폼 컴포넌트
 */

class ForeshadowingForm {
  constructor() {
    this.modalContainer = null;
    this.currentForeshadowingId = null;
    this.characters = [];
    this.events = [];
    this.foreshadowingTypes = [];
    this.statusTypes = [];
    this.init();
  }

  /**
   * 모달 컨테이너 초기화
   */
  init() {
    if (!document.getElementById('foreshadowing-modal-container')) {
      const container = document.createElement('div');
      container.id = 'foreshadowing-modal-container';
      document.body.appendChild(container);
    }
    this.modalContainer = document.getElementById('foreshadowing-modal-container');
  }

  /**
   * 데이터 로드 (캐릭터, 이벤트, 유형 등)
   */
  async loadData(projectId) {
    [this.characters, this.events, this.foreshadowingTypes, this.statusTypes] = await Promise.all([
      dataLoader.getCharacters(projectId),
      dataLoader.getEvents(projectId),
      dataLoader.getForeshadowingTypes(),
      dataLoader.getForeshadowingStatusTypes()
    ]);
  }

  /**
   * 생성 모달 표시
   */
  async showCreateModal(projectId) {
    this.currentForeshadowingId = null;
    await this.loadData(projectId);
    this.renderModal({
      title: '새 복선/떡밥 추가',
      foreshadowing: { projectId },
      isEdit: false
    });
  }

  /**
   * 수정 모달 표시
   */
  async showEditModal(foreshadowingId) {
    const foreshadowing = await foreshadowingStore.getForeshadowingById(foreshadowingId);
    if (!foreshadowing) {
      utils.showToast('복선/떡밥을 찾을 수 없습니다.', 'error');
      return;
    }

    this.currentForeshadowingId = foreshadowingId;
    await this.loadData(foreshadowing.projectId);
    this.renderModal({
      title: '복선/떡밥 수정',
      foreshadowing,
      isEdit: true
    });
  }

  /**
   * 삭제 확인 모달 표시
   */
  async showDeleteModal(foreshadowingId) {
    const foreshadowing = await foreshadowingStore.getForeshadowingById(foreshadowingId);
    if (!foreshadowing) {
      utils.showToast('복선/떡밥을 찾을 수 없습니다.', 'error');
      return;
    }

    this.renderDeleteModal(foreshadowing);
  }

  /**
   * 메인 폼 모달 렌더링
   */
  renderModal({ title, foreshadowing, isEdit }) {
    const typeOptions = this.foreshadowingTypes.map(t =>
      `<option value="${t.type}" ${foreshadowing.type === t.type ? 'selected' : ''}>${t.type}</option>`
    ).join('');

    const statusOptions = this.statusTypes.map(s =>
      `<option value="${s.status}" ${foreshadowing.status === s.status ? 'selected' : ''}>${s.status}</option>`
    ).join('');

    const characterCheckboxes = this.characters.map(c => `
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" name="relatedCharacters" value="${c.id}"
          ${(foreshadowing.relatedCharacters || []).includes(c.id) ? 'checked' : ''}
          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
        ${c.name}
      </label>
    `).join('');

    const eventCheckboxes = this.events.map(e => `
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" name="relatedEvents" value="${e.id}"
          ${(foreshadowing.relatedEvents || []).includes(e.id) ? 'checked' : ''}
          class="rounded border-gray-300 text-purple-600 focus:ring-purple-500">
        ${e.title}
      </label>
    `).join('');

    this.modalContainer.innerHTML = `
      <div id="foreshadowing-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <!-- 헤더 -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 class="text-xl font-bold text-gray-900">${title}</h2>
            <button onclick="foreshadowingForm.closeModal()" class="text-gray-400 hover:text-gray-600 transition-colors">
              <span class="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          <!-- 폼 -->
          <form id="foreshadowing-form" class="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div class="p-6 space-y-6">
              <!-- 기본 정보 -->
              <div class="bg-blue-50 rounded-lg p-4 space-y-4">
                <h3 class="text-sm font-semibold text-blue-900 flex items-center">
                  <span class="material-symbols-outlined text-sm mr-1">star</span>
                  기본 정보
                </h3>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">제목 <span class="text-red-500">*</span></label>
                  <input type="text" name="title" required value="${foreshadowing.title || ''}"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="복선/떡밥 제목">
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">유형 <span class="text-red-500">*</span></label>
                    <select name="type" required
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">선택하세요</option>
                      ${typeOptions}
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">상태 <span class="text-red-500">*</span></label>
                    <select name="status" required id="status-select"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">선택하세요</option>
                      ${statusOptions}
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">중요도 <span class="text-red-500">*</span></label>
                    <select name="importance" required
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">선택하세요</option>
                      <option value="상" ${foreshadowing.importance === '상' ? 'selected' : ''}>상</option>
                      <option value="중" ${foreshadowing.importance === '중' ? 'selected' : ''}>중</option>
                      <option value="하" ${foreshadowing.importance === '하' ? 'selected' : ''}>하</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">설명 <span class="text-red-500">*</span></label>
                  <textarea name="description" required rows="3"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="복선/떡밥에 대한 설명">${foreshadowing.description || ''}</textarea>
                </div>
              </div>

              <!-- 심은 위치 (설치) -->
              <div class="bg-amber-50 rounded-lg p-4 space-y-4">
                <h3 class="text-sm font-semibold text-amber-900 flex items-center">
                  <span class="material-symbols-outlined text-sm mr-1">place</span>
                  심은 위치 (설치)
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">회차</label>
                    <input type="number" name="plantedEpisode" min="1" value="${foreshadowing.plantedAt?.episode || ''}"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="예: 3">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">장면</label>
                    <input type="text" name="plantedScene" value="${foreshadowing.plantedAt?.scene || ''}"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="예: 첫 만남">
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">힌트 (독자에게 노출된 내용)</label>
                  <textarea name="plantedHint" rows="2"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="독자에게 보여진 힌트나 복선 내용">${foreshadowing.plantedAt?.hint || ''}</textarea>
                </div>
              </div>

              <!-- 회수 위치 (회수완료 시에만 표시) -->
              <div id="resolved-section" class="bg-green-50 rounded-lg p-4 space-y-4 ${foreshadowing.status !== '회수완료' ? 'hidden' : ''}">
                <h3 class="text-sm font-semibold text-green-900 flex items-center">
                  <span class="material-symbols-outlined text-sm mr-1">check_circle</span>
                  회수 위치
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">회차</label>
                    <input type="number" name="resolvedEpisode" min="1" value="${foreshadowing.resolvedAt?.episode || ''}"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="예: 45">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">장면</label>
                    <input type="text" name="resolvedScene" value="${foreshadowing.resolvedAt?.scene || ''}"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="예: 진실이 밝혀지는 순간">
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">해결 방법</label>
                  <textarea name="resolvedResolution" rows="2"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="복선이 어떻게 회수되었는지">${foreshadowing.resolvedAt?.resolution || ''}</textarea>
                </div>
              </div>

              <!-- 관련 캐릭터/이벤트 -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-gray-50 rounded-lg p-4">
                  <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span class="material-symbols-outlined text-sm mr-1">person</span>
                    관련 캐릭터
                  </h3>
                  <div class="max-h-40 overflow-y-auto space-y-2">
                    ${characterCheckboxes || '<p class="text-sm text-gray-500">등록된 캐릭터가 없습니다.</p>'}
                  </div>
                </div>

                <div class="bg-gray-50 rounded-lg p-4">
                  <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span class="material-symbols-outlined text-sm mr-1">event</span>
                    관련 이벤트
                  </h3>
                  <div class="max-h-40 overflow-y-auto space-y-2">
                    ${eventCheckboxes || '<p class="text-sm text-gray-500">등록된 이벤트가 없습니다.</p>'}
                  </div>
                </div>
              </div>

              <!-- 추가 정보 -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">키워드 (쉼표로 구분)</label>
                  <input type="text" name="keywords" value="${(foreshadowing.keywords || []).join(', ')}"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#떡밥, #반전, #숨겨진과거">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">메모</label>
                  <textarea name="notes" rows="2"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="작가 노트, 아이디어 등">${foreshadowing.notes || ''}</textarea>
                </div>
              </div>
            </div>

            <!-- 푸터 -->
            <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button type="button" onclick="foreshadowingForm.closeModal()"
                class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                취소
              </button>
              <button type="submit"
                class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <span class="material-symbols-outlined text-sm mr-1">save</span>
                ${isEdit ? '저장' : '생성'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.setupEventListeners(foreshadowing.projectId, isEdit);
  }

  /**
   * 삭제 확인 모달 렌더링
   */
  renderDeleteModal(foreshadowing) {
    this.modalContainer.innerHTML = `
      <div id="delete-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <!-- 헤더 -->
          <div class="flex items-center justify-center pt-6">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <span class="material-symbols-outlined text-3xl text-red-600">warning</span>
            </div>
          </div>

          <!-- 내용 -->
          <div class="p-6 text-center">
            <h3 class="text-xl font-bold text-gray-900 mb-2">복선/떡밥 삭제</h3>
            <p class="text-gray-600 mb-4">
              <strong class="text-gray-900">${foreshadowing.title}</strong>을(를) 삭제하시겠습니까?
            </p>
            <p class="text-sm text-gray-500">이 작업은 되돌릴 수 없습니다.</p>
          </div>

          <!-- 버튼 -->
          <div class="flex gap-3 p-6 pt-0">
            <button onclick="foreshadowingForm.closeModal()"
              class="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              취소
            </button>
            <button onclick="foreshadowingForm.confirmDelete('${foreshadowing.id}')"
              class="flex-1 px-4 py-2.5 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center">
              <span class="material-symbols-outlined text-sm mr-1">delete</span>
              삭제
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners(projectId, isEdit) {
    const form = document.getElementById('foreshadowing-form');
    const statusSelect = document.getElementById('status-select');
    const resolvedSection = document.getElementById('resolved-section');

    // 폼 제출
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit(new FormData(form), projectId, isEdit);
    });

    // 상태 변경 시 회수 섹션 표시/숨김
    statusSelect.addEventListener('change', (e) => {
      if (e.target.value === '회수완료') {
        resolvedSection.classList.remove('hidden');
      } else {
        resolvedSection.classList.add('hidden');
      }
    });

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', this.handleEscKey);
  }

  /**
   * ESC 키 핸들러
   */
  handleEscKey = (e) => {
    if (e.key === 'Escape') {
      this.closeModal();
    }
  };

  /**
   * 폼 제출 처리
   */
  async handleSubmit(formData, projectId, isEdit) {
    // 관련 캐릭터/이벤트 체크박스 값 수집
    const relatedCharacters = [];
    const relatedEvents = [];
    document.querySelectorAll('input[name="relatedCharacters"]:checked').forEach(cb => {
      relatedCharacters.push(cb.value);
    });
    document.querySelectorAll('input[name="relatedEvents"]:checked').forEach(cb => {
      relatedEvents.push(cb.value);
    });

    // 폼 데이터 추출
    const foreshadowingData = {
      projectId,
      title: formData.get('title').trim(),
      type: formData.get('type'),
      status: formData.get('status'),
      importance: formData.get('importance'),
      description: formData.get('description').trim(),
      plantedAt: {
        episode: formData.get('plantedEpisode') ? parseInt(formData.get('plantedEpisode')) : null,
        scene: formData.get('plantedScene')?.trim() || '',
        hint: formData.get('plantedHint')?.trim() || ''
      },
      resolvedAt: formData.get('status') === '회수완료' ? {
        episode: formData.get('resolvedEpisode') ? parseInt(formData.get('resolvedEpisode')) : null,
        scene: formData.get('resolvedScene')?.trim() || '',
        resolution: formData.get('resolvedResolution')?.trim() || ''
      } : null,
      relatedCharacters,
      relatedEvents,
      keywords: formData.get('keywords')
        ? formData.get('keywords').split(',').map(k => k.trim()).filter(k => k)
        : [],
      notes: formData.get('notes')?.trim() || ''
    };

    // 유효성 검사
    if (!foreshadowingData.title || !foreshadowingData.type || !foreshadowingData.status ||
        !foreshadowingData.importance || !foreshadowingData.description) {
      utils.showToast('필수 항목을 입력해주세요.', 'error');
      return;
    }

    try {
      if (isEdit) {
        foreshadowingStore.update(this.currentForeshadowingId, foreshadowingData);
        utils.showToast('복선/떡밥이 수정되었습니다.', 'success');
      } else {
        foreshadowingStore.create(foreshadowingData);
        utils.showToast('새 복선/떡밥이 추가되었습니다.', 'success');
      }

      this.closeModal();
      window.location.reload();
    } catch (error) {
      console.error('Foreshadowing save error:', error);
      utils.showToast('저장 중 오류가 발생했습니다.', 'error');
    }
  }

  /**
   * 삭제 확인
   */
  async confirmDelete(foreshadowingId) {
    try {
      foreshadowingStore.delete(foreshadowingId);
      utils.showToast('복선/떡밥이 삭제되었습니다.', 'success');
      this.closeModal();
      window.location.reload();
    } catch (error) {
      console.error('Foreshadowing delete error:', error);
      utils.showToast('삭제 중 오류가 발생했습니다.', 'error');
    }
  }

  /**
   * 모달 닫기
   */
  closeModal() {
    document.removeEventListener('keydown', this.handleEscKey);
    this.modalContainer.innerHTML = '';
    this.currentForeshadowingId = null;
  }
}

// 전역 인스턴스 생성
const foreshadowingForm = new ForeshadowingForm();
