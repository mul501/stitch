/**
 * Character Form - 캐릭터 생성/수정/삭제 모달 폼 컴포넌트
 */

class CharacterForm {
  constructor() {
    this.modalContainer = null;
    this.pendingImage = null;
    this.currentCharacterId = null;
    this.init();
  }

  /**
   * 모달 컨테이너 초기화
   */
  init() {
    // 모달 컨테이너가 없으면 생성
    if (!document.getElementById('character-modal-container')) {
      const container = document.createElement('div');
      container.id = 'character-modal-container';
      document.body.appendChild(container);
    }
    this.modalContainer = document.getElementById('character-modal-container');
  }

  /**
   * 생성 모달 표시
   */
  showCreateModal(projectId) {
    this.currentCharacterId = null;
    this.pendingImage = null;
    this.renderModal({
      title: '새 캐릭터 추가',
      character: { projectId },
      isEdit: false
    });
  }

  /**
   * 수정 모달 표시
   */
  async showEditModal(characterId) {
    const character = await characterStore.getCharacterById(characterId);
    if (!character) {
      utils.showToast('캐릭터를 찾을 수 없습니다.', 'error');
      return;
    }

    this.currentCharacterId = characterId;
    this.pendingImage = null;
    this.renderModal({
      title: '캐릭터 수정',
      character,
      isEdit: true
    });
  }

  /**
   * 삭제 확인 모달 표시
   */
  async showDeleteModal(characterId) {
    const character = await characterStore.getCharacterById(characterId);
    if (!character) {
      utils.showToast('캐릭터를 찾을 수 없습니다.', 'error');
      return;
    }

    const relationships = await characterStore.getRelatedRelationships(characterId);
    this.renderDeleteModal(character, relationships);
  }

  /**
   * 메인 폼 모달 렌더링
   */
  renderModal({ title, character, isEdit }) {
    const imageUrl = isEdit ? characterStore.getCharacterImageUrl(character) : null;

    this.modalContainer.innerHTML = `
      <div id="character-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <!-- 헤더 -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 class="text-xl font-bold text-gray-900">${title}</h2>
            <button onclick="characterForm.closeModal()" class="text-gray-400 hover:text-gray-600 transition-colors">
              <span class="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          <!-- 폼 -->
          <form id="character-form" class="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div class="p-6">
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- 왼쪽: 이미지 업로드 -->
                <div class="lg:col-span-1">
                  <label class="block text-sm font-medium text-gray-700 mb-2">프로필 이미지</label>
                  <div id="image-upload-area" class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer aspect-square flex flex-col items-center justify-center">
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
                    <button type="button" onclick="characterForm.removeImage()" class="mt-2 text-sm text-red-600 hover:text-red-700">
                      <span class="material-symbols-outlined text-sm align-middle">delete</span>
                      이미지 제거
                    </button>
                  ` : ''}
                </div>

                <!-- 오른쪽: 폼 필드 -->
                <div class="lg:col-span-2 space-y-4">
                  <!-- 필수 필드 -->
                  <div class="bg-blue-50 rounded-lg p-4 space-y-4">
                    <h3 class="text-sm font-semibold text-blue-900 flex items-center">
                      <span class="material-symbols-outlined text-sm mr-1">star</span>
                      필수 정보
                    </h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">이름 <span class="text-red-500">*</span></label>
                        <input type="text" name="name" required value="${character.name || ''}"
                          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="캐릭터 이름">
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">역할 <span class="text-red-500">*</span></label>
                        <select name="role" required
                          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="">선택하세요</option>
                          <option value="주인공" ${character.role === '주인공' ? 'selected' : ''}>주인공</option>
                          <option value="조연" ${character.role === '조연' ? 'selected' : ''}>조연</option>
                          <option value="적대자" ${character.role === '적대자' ? 'selected' : ''}>적대자</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">설명 <span class="text-red-500">*</span></label>
                      <textarea name="description" required rows="3"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="캐릭터에 대한 간단한 설명">${character.description || ''}</textarea>
                    </div>
                  </div>

                  <!-- 선택 필드 -->
                  <div class="space-y-4">
                    <h3 class="text-sm font-semibold text-gray-600 flex items-center">
                      <span class="material-symbols-outlined text-sm mr-1">tune</span>
                      추가 정보 (선택)
                    </h3>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">별칭</label>
                        <input type="text" name="alias" value="${character.alias || ''}"
                          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="별명 또는 칭호">
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">나이</label>
                        <input type="number" name="age" min="0" value="${character.age || ''}"
                          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="나이">
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">성별</label>
                        <select name="gender"
                          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="">선택하세요</option>
                          <option value="남" ${character.gender === '남' ? 'selected' : ''}>남</option>
                          <option value="여" ${character.gender === '여' ? 'selected' : ''}>여</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">소속</label>
                      <input type="text" name="affiliation" value="${character.affiliation || ''}"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="소속 조직, 왕국, 단체 등">
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">외모</label>
                      <textarea name="appearance" rows="2"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="외모 특징">${character.appearance || ''}</textarea>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">성격</label>
                      <textarea name="personality" rows="2"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="성격 및 가치관">${character.personality || ''}</textarea>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">키워드 (쉼표로 구분)</label>
                      <input type="text" name="keywords" value="${(character.keywords || []).join(', ')}"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="#왕족, #검술, #리더십">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 푸터 -->
            <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button type="button" onclick="characterForm.closeModal()"
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
    this.setupEventListeners(character.projectId, isEdit);
  }

  /**
   * 삭제 확인 모달 렌더링
   */
  renderDeleteModal(character, relationships) {
    const hasRelationships = relationships.length > 0;

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
            <h3 class="text-xl font-bold text-gray-900 mb-2">캐릭터 삭제</h3>
            <p class="text-gray-600 mb-4">
              <strong class="text-gray-900">${character.name}</strong> 캐릭터를 삭제하시겠습니까?
            </p>

            ${hasRelationships ? `
              <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 text-left">
                <p class="text-sm text-amber-800 font-medium mb-2">
                  <span class="material-symbols-outlined text-sm align-middle mr-1">link</span>
                  이 캐릭터와 연결된 ${relationships.length}개의 관계가 있습니다:
                </p>
                <ul class="text-sm text-amber-700 list-disc list-inside max-h-32 overflow-y-auto">
                  ${relationships.map(rel => `
                    <li>${rel.type}: ${rel.sourceId === character.id ? rel.targetId : rel.sourceId}</li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}

            <p class="text-sm text-gray-500">
              ${hasRelationships ? '캐릭터와 관련된 모든 관계도 함께 삭제됩니다.' : '이 작업은 되돌릴 수 없습니다.'}
            </p>
          </div>

          <!-- 버튼 -->
          <div class="flex gap-3 p-6 pt-0">
            <button onclick="characterForm.closeModal()"
              class="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              취소
            </button>
            <button onclick="characterForm.confirmDelete('${character.id}', ${hasRelationships})"
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
    const form = document.getElementById('character-form');
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
  }

  /**
   * 폼 제출 처리
   */
  async handleSubmit(formData, projectId, isEdit) {
    // 폼 데이터 추출
    const characterData = {
      projectId,
      name: formData.get('name').trim(),
      role: formData.get('role'),
      description: formData.get('description').trim(),
      alias: formData.get('alias')?.trim() || '',
      age: formData.get('age') ? parseInt(formData.get('age')) : null,
      gender: formData.get('gender') || '',
      affiliation: formData.get('affiliation')?.trim() || '',
      appearance: formData.get('appearance')?.trim() || '',
      personality: formData.get('personality')?.trim() || '',
      keywords: formData.get('keywords')
        ? formData.get('keywords').split(',').map(k => k.trim()).filter(k => k)
        : []
    };

    // 유효성 검사
    if (!characterData.name || !characterData.role || !characterData.description) {
      utils.showToast('필수 항목을 입력해주세요.', 'error');
      return;
    }

    try {
      let savedCharacter;

      if (isEdit) {
        // 수정
        savedCharacter = characterStore.update(this.currentCharacterId, characterData);

        // 이미지 처리
        if (this.pendingImage === 'remove') {
          characterStore.deleteImage(this.currentCharacterId);
          characterStore.update(this.currentCharacterId, { image: '' });
        } else if (this.pendingImage) {
          characterStore.saveImage(this.currentCharacterId, this.pendingImage);
          characterStore.update(this.currentCharacterId, { image: `local:${this.currentCharacterId}` });
        }

        utils.showToast('캐릭터가 수정되었습니다.', 'success');
      } else {
        // 생성
        savedCharacter = characterStore.create(characterData);

        // 이미지 저장
        if (this.pendingImage && this.pendingImage !== 'remove') {
          characterStore.saveImage(savedCharacter.id, this.pendingImage);
          characterStore.update(savedCharacter.id, { image: `local:${savedCharacter.id}` });
        }

        utils.showToast('새 캐릭터가 추가되었습니다.', 'success');
      }

      this.closeModal();

      // 페이지 새로고침
      window.location.reload();
    } catch (error) {
      console.error('Character save error:', error);
      utils.showToast('저장 중 오류가 발생했습니다.', 'error');
    }
  }

  /**
   * 삭제 확인
   */
  async confirmDelete(characterId, hasRelationships) {
    try {
      await characterStore.delete(characterId, hasRelationships);
      utils.showToast('캐릭터가 삭제되었습니다.', 'success');
      this.closeModal();

      // 목록 페이지로 리다이렉트 (상세 페이지에서 삭제한 경우)
      if (window.location.pathname.includes('character_detail')) {
        window.location.href = 'character_list.html';
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('Character delete error:', error);
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
    this.currentCharacterId = null;
  }
}

// 전역 인스턴스 생성
const characterForm = new CharacterForm();
