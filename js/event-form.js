/**
 * Event Form - 이벤트 생성/수정/삭제 모달 폼 컴포넌트
 */

class EventForm {
  constructor() {
    this.modalContainer = null;
    this.pendingImage = null;
    this.currentEventId = null;
    this.characters = [];
    this.init();
  }

  /**
   * 모달 컨테이너 초기화
   */
  init() {
    if (!document.getElementById('event-modal-container')) {
      const container = document.createElement('div');
      container.id = 'event-modal-container';
      document.body.appendChild(container);
    }
    this.modalContainer = document.getElementById('event-modal-container');
  }

  /**
   * 프로젝트 캐릭터 목록 로드
   */
  async loadCharacters(projectId) {
    this.characters = await characterStore.getMergedCharacters(projectId);
  }

  /**
   * 생성 모달 표시
   */
  async showCreateModal(projectId) {
    this.currentEventId = null;
    this.pendingImage = null;
    await this.loadCharacters(projectId);
    this.renderModal({
      title: '새 이벤트 추가',
      event: { projectId, relatedCharacters: [] },
      isEdit: false
    });
  }

  /**
   * 수정 모달 표시
   */
  async showEditModal(eventId) {
    const event = await eventStore.getEventById(eventId);
    if (!event) {
      utils.showToast('이벤트를 찾을 수 없습니다.', 'error');
      return;
    }

    this.currentEventId = eventId;
    this.pendingImage = null;
    await this.loadCharacters(event.projectId);
    this.renderModal({
      title: '이벤트 수정',
      event,
      isEdit: true
    });
  }

  /**
   * 삭제 확인 모달 표시
   */
  async showDeleteModal(eventId) {
    const event = await eventStore.getEventById(eventId);
    if (!event) {
      utils.showToast('이벤트를 찾을 수 없습니다.', 'error');
      return;
    }

    this.currentEventId = eventId;
    this.renderDeleteModal(event);
  }

  /**
   * 메인 폼 모달 렌더링
   */
  renderModal({ title, event, isEdit }) {
    const imageUrl = isEdit ? eventStore.getEventImageUrl(event) : null;
    const relatedCharacters = event.relatedCharacters || [];

    this.modalContainer.innerHTML = `
      <div id="event-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <!-- 헤더 -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 class="text-xl font-bold text-gray-900">${title}</h2>
            <button onclick="eventForm.closeModal()" class="text-gray-400 hover:text-gray-600 transition-colors">
              <span class="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          <!-- 폼 -->
          <form id="event-form" class="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div class="p-6">
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- 왼쪽: 이미지 업로드 -->
                <div class="lg:col-span-1">
                  <label class="block text-sm font-medium text-gray-700 mb-2">대표 이미지</label>
                  <div id="image-upload-area" class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer aspect-video flex flex-col items-center justify-center">
                    <img id="image-preview" src="${imageUrl || ''}" alt="미리보기"
                      class="${imageUrl ? '' : 'hidden'} w-full h-full object-cover rounded-lg"
                      onerror="this.classList.add('hidden'); document.getElementById('image-placeholder').classList.remove('hidden');">
                    <div id="image-placeholder" class="${imageUrl ? 'hidden' : ''} flex flex-col items-center">
                      <span class="material-symbols-outlined text-4xl text-gray-400 mb-2">add_photo_alternate</span>
                      <span class="text-sm text-gray-500">클릭하여 이미지 업로드</span>
                      <span class="text-xs text-gray-400 mt-1">PNG, JPG (최대 2MB)</span>
                    </div>
                  </div>
                  <input type="file" id="image-input" accept="image/*" class="hidden">
                  ${imageUrl ? `
                    <button type="button" onclick="eventForm.removeImage()" class="mt-2 text-sm text-red-600 hover:text-red-700">
                      <span class="material-symbols-outlined text-sm align-middle">delete</span>
                      이미지 제거
                    </button>
                  ` : ''}

                  <!-- 이미지 URL 입력 -->
                  <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">또는 URL 입력</label>
                    <input type="url" name="imageUrl" id="image-url-input" value="${!event.image?.startsWith('local:') ? (event.image || '') : ''}"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/image.jpg">
                  </div>
                </div>

                <!-- 오른쪽: 폼 필드 -->
                <div class="lg:col-span-2 space-y-4">
                  <!-- 필수 필드 -->
                  <div class="bg-blue-50 rounded-lg p-4 space-y-4">
                    <h3 class="text-sm font-semibold text-blue-900 flex items-center">
                      <span class="material-symbols-outlined text-sm mr-1">star</span>
                      필수 정보
                    </h3>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">이벤트 제목 <span class="text-red-500">*</span></label>
                      <input type="text" name="title" required value="${event.title || ''}"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="이벤트 제목을 입력하세요">
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">유형 <span class="text-red-500">*</span></label>
                        <select name="type" required
                          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="">선택하세요</option>
                          <option value="전투" ${event.type === '전투' ? 'selected' : ''}>전투</option>
                          <option value="정치" ${event.type === '정치' ? 'selected' : ''}>정치</option>
                          <option value="사회" ${event.type === '사회' ? 'selected' : ''}>사회</option>
                          <option value="개인" ${event.type === '개인' ? 'selected' : ''}>개인</option>
                          <option value="경제" ${event.type === '경제' ? 'selected' : ''}>경제</option>
                          <option value="문화" ${event.type === '문화' ? 'selected' : ''}>문화</option>
                          <option value="자연재해" ${event.type === '자연재해' ? 'selected' : ''}>자연재해</option>
                          <option value="기타" ${event.type === '기타' ? 'selected' : ''}>기타</option>
                        </select>
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">중요도 <span class="text-red-500">*</span></label>
                        <select name="importance" required
                          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="">선택하세요</option>
                          <option value="상" ${event.importance === '상' ? 'selected' : ''}>상</option>
                          <option value="중" ${event.importance === '중' ? 'selected' : ''}>중</option>
                          <option value="하" ${event.importance === '하' ? 'selected' : ''}>하</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">상세 설명 <span class="text-red-500">*</span></label>
                      <textarea name="description" required rows="3"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="이벤트에 대한 상세한 설명을 입력하세요">${event.description || ''}</textarea>
                    </div>
                  </div>

                  <!-- 선택 필드 -->
                  <div class="space-y-4">
                    <h3 class="text-sm font-semibold text-gray-600 flex items-center">
                      <span class="material-symbols-outlined text-sm mr-1">tune</span>
                      추가 정보 (선택)
                    </h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">작중 시점</label>
                        <input type="text" name="date" value="${event.date || ''}"
                          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="예: 왕국력 124년 겨울">
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">연도</label>
                        <input type="text" name="year" value="${event.year || ''}"
                          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="예: 왕국력 124년">
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">결과 및 영향</label>
                      <textarea name="impact" rows="2"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="이 이벤트로 인한 결과와 영향">${event.impact || ''}</textarea>
                    </div>

                    <!-- 관련 캐릭터 선택 -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">관련 캐릭터</label>
                      <div class="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                        ${this.characters.length > 0 ? `
                          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                            ${this.characters.map(char => `
                              <label class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                <input type="checkbox" name="relatedCharacters" value="${char.id}"
                                  ${relatedCharacters.includes(char.id) ? 'checked' : ''}
                                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                <span class="text-sm text-gray-700 truncate">${char.name}</span>
                              </label>
                            `).join('')}
                          </div>
                        ` : `
                          <p class="text-sm text-gray-500 text-center py-2">등록된 캐릭터가 없습니다.</p>
                        `}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 푸터 -->
            <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button type="button" onclick="eventForm.closeModal()"
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

    // 이벤트 리스너 설정
    this.setupEventListeners(event.projectId, isEdit);
  }

  /**
   * 삭제 확인 모달 렌더링
   */
  renderDeleteModal(event) {
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
            <h3 class="text-xl font-bold text-gray-900 mb-2">이벤트 삭제</h3>
            <p class="text-gray-600 mb-4">
              <strong class="text-gray-900">${event.title}</strong> 이벤트를 삭제하시겠습니까?
            </p>
            <p class="text-sm text-gray-500">
              이 작업은 되돌릴 수 없습니다.
            </p>
          </div>

          <!-- 버튼 -->
          <div class="flex gap-3 p-6 pt-0">
            <button onclick="eventForm.closeModal()"
              class="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              취소
            </button>
            <button onclick="eventForm.confirmDelete()"
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
    const form = document.getElementById('event-form');
    const imageUploadArea = document.getElementById('image-upload-area');
    const imageInput = document.getElementById('image-input');

    // 폼 제출
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit(new FormData(form), projectId, isEdit);
    });

    // 이미지 업로드 영역 클릭
    imageUploadArea.addEventListener('click', () => {
      imageInput.click();
    });

    // 이미지 파일 선택
    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handleImageUpload(file);
      }
    });

    // 드래그 앤 드롭
    imageUploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      imageUploadArea.classList.add('border-blue-400', 'bg-blue-50');
    });

    imageUploadArea.addEventListener('dragleave', () => {
      imageUploadArea.classList.remove('border-blue-400', 'bg-blue-50');
    });

    imageUploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      imageUploadArea.classList.remove('border-blue-400', 'bg-blue-50');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.handleImageUpload(file);
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
   * 이미지 업로드 처리
   */
  handleImageUpload(file) {
    // 파일 크기 체크 (2MB)
    if (file.size > 2 * 1024 * 1024) {
      utils.showToast('이미지 크기는 2MB 이하여야 합니다.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      this.pendingImage = base64;

      // 미리보기 표시
      const preview = document.getElementById('image-preview');
      const placeholder = document.getElementById('image-placeholder');

      preview.src = base64;
      preview.classList.remove('hidden');
      placeholder.classList.add('hidden');

      // URL 입력 필드 초기화
      document.getElementById('image-url-input').value = '';
    };
    reader.readAsDataURL(file);
  }

  /**
   * 이미지 제거
   */
  removeImage() {
    this.pendingImage = 'remove';
    const preview = document.getElementById('image-preview');
    const placeholder = document.getElementById('image-placeholder');

    preview.classList.add('hidden');
    placeholder.classList.remove('hidden');
    document.getElementById('image-url-input').value = '';
  }

  /**
   * 폼 제출 처리
   */
  async handleSubmit(formData, projectId, isEdit) {
    // 관련 캐릭터 체크박스 값 수집
    const relatedCharacters = [];
    const checkboxes = document.querySelectorAll('input[name="relatedCharacters"]:checked');
    checkboxes.forEach(cb => relatedCharacters.push(cb.value));

    // 폼 데이터 추출
    const eventData = {
      projectId,
      title: formData.get('title').trim(),
      type: formData.get('type'),
      importance: formData.get('importance'),
      description: formData.get('description').trim(),
      date: formData.get('date')?.trim() || '',
      year: formData.get('year')?.trim() || '',
      impact: formData.get('impact')?.trim() || '',
      relatedCharacters,
      relatedPlaces: [],
      relatedItems: []
    };

    // 유효성 검사
    if (!eventData.title || !eventData.type || !eventData.importance || !eventData.description) {
      utils.showToast('필수 항목을 입력해주세요.', 'error');
      return;
    }

    try {
      let savedEvent;
      const imageUrl = formData.get('imageUrl')?.trim();

      if (isEdit) {
        // 수정
        savedEvent = eventStore.update(this.currentEventId, eventData);

        // 이미지 처리
        if (this.pendingImage === 'remove') {
          eventStore.deleteImage(this.currentEventId);
          eventStore.update(this.currentEventId, { image: '' });
        } else if (this.pendingImage) {
          eventStore.saveImage(this.currentEventId, this.pendingImage);
          eventStore.update(this.currentEventId, { image: `local:${this.currentEventId}` });
        } else if (imageUrl) {
          eventStore.update(this.currentEventId, { image: imageUrl });
        }

        utils.showToast('이벤트가 수정되었습니다.', 'success');
      } else {
        // 생성
        savedEvent = eventStore.create(eventData);

        // 이미지 저장
        if (this.pendingImage && this.pendingImage !== 'remove') {
          eventStore.saveImage(savedEvent.id, this.pendingImage);
          eventStore.update(savedEvent.id, { image: `local:${savedEvent.id}` });
        } else if (imageUrl) {
          eventStore.update(savedEvent.id, { image: imageUrl });
        }

        // 타임라인에도 자동 등록
        timelineStore.create({
          eventId: savedEvent.id,
          year: savedEvent.year || '',
          title: savedEvent.title,
          projectId: savedEvent.projectId,
          description: savedEvent.description
        });

        utils.showToast('새 이벤트가 추가되었습니다.', 'success');
      }

      this.closeModal();

      // 페이지 새로고침
      window.location.reload();
    } catch (error) {
      console.error('Event save error:', error);
      utils.showToast('저장 중 오류가 발생했습니다.', 'error');
    }
  }

  /**
   * 삭제 확인
   */
  async confirmDelete() {
    try {
      eventStore.delete(this.currentEventId);
      utils.showToast('이벤트가 삭제되었습니다.', 'success');
      this.closeModal();

      // 목록 페이지로 리다이렉트 (상세 페이지에서 삭제한 경우)
      if (window.location.pathname.includes('event_detail')) {
        window.location.href = 'event_list.html';
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('Event delete error:', error);
      utils.showToast('삭제 중 오류가 발생했습니다.', 'error');
    }
  }

  /**
   * 모달 닫기
   */
  closeModal() {
    document.removeEventListener('keydown', this.handleEscKey);
    this.modalContainer.innerHTML = '';
    this.pendingImage = null;
    this.currentEventId = null;
  }
}

// 전역 인스턴스 생성
const eventForm = new EventForm();
