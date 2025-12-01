/**
 * Data Loader - JSON 데이터 로드 및 캐싱
 */

class DataLoader {
  constructor() {
    this.cache = {};
    this.baseUrl = './data/';
  }

  /**
   * JSON 파일 로드 (캐싱 적용)
   */
  async load(filename) {
    if (this.cache[filename]) {
      return this.cache[filename];
    }

    try {
      const response = await fetch(`${this.baseUrl}${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}: ${response.statusText}`);
      }
      const data = await response.json();
      this.cache[filename] = data;
      return data;
    } catch (error) {
      console.error('Error loading data:', error);
      return null;
    }
  }

  /**
   * 프로젝트 목록 가져오기
   */
  async getProjects() {
    const data = await this.load('projects.json');
    return data?.projects || [];
  }

  /**
   * 활성 프로젝트 가져오기
   */
  async getActiveProject() {
    const projects = await this.getProjects();
    return projects.find(p => p.active) || projects[0] || null;
  }

  /**
   * 캐릭터 목록 가져오기 (프로젝트 ID로 필터링)
   */
  async getCharacters(projectId = null) {
    const data = await this.load('characters.json');
    const characters = data?.characters || [];

    if (projectId) {
      return characters.filter(c => c.projectId === projectId);
    }
    return characters;
  }

  /**
   * 특정 캐릭터 가져오기
   */
  async getCharacterById(id) {
    const characters = await this.getCharacters();
    return characters.find(c => c.id === id) || null;
  }

  /**
   * 이벤트 목록 가져오기 (프로젝트 ID로 필터링)
   */
  async getEvents(projectId = null) {
    const data = await this.load('events.json');
    const events = data?.events || [];

    if (projectId) {
      return events.filter(e => e.projectId === projectId);
    }
    return events;
  }

  /**
   * 특정 이벤트 가져오기
   */
  async getEventById(id) {
    const events = await this.getEvents();
    return events.find(e => e.id === id) || null;
  }

  /**
   * 타임라인 가져오기 (프로젝트 ID로 필터링)
   */
  async getTimeline(projectId = null) {
    const data = await this.load('timeline.json');
    const timeline = data?.timeline || [];

    if (projectId) {
      return timeline.filter(t => t.projectId === projectId);
    }
    return timeline.sort((a, b) => a.order - b.order);
  }

  /**
   * 시놉시스 가져오기 (프로젝트 ID로 필터링)
   */
  async getSynopses(projectId = null) {
    const data = await this.load('synopsis.json');
    const synopses = data?.synopses || [];

    if (projectId) {
      return synopses.filter(s => s.projectId === projectId);
    }
    return synopses.sort((a, b) => a.order - b.order);
  }

  /**
   * 특정 시놉시스 가져오기
   */
  async getSynopsisById(id) {
    const synopses = await this.getSynopses();
    return synopses.find(s => s.id === id) || null;
  }

  /**
   * 캐시 초기화
   */
  clearCache() {
    this.cache = {};
  }

  // ========================================
  // 캐릭터 관계 관련 메서드
  // ========================================

  /**
   * 관계 목록 가져오기 (프로젝트 ID로 필터링)
   */
  async getRelationships(projectId = null) {
    const data = await this.load('relationships.json');
    const relationships = data?.relationships || [];

    if (projectId) {
      return relationships.filter(r => r.projectId === projectId);
    }
    return relationships;
  }

  /**
   * 관계 유형 정의 가져오기
   */
  async getRelationshipTypes() {
    const data = await this.load('relationships.json');
    return data?.relationshipTypes || [];
  }

  /**
   * 특정 캐릭터와 연결된 관계 가져오기
   */
  async getCharacterRelationships(characterId) {
    const relationships = await this.getRelationships();
    return relationships.filter(r =>
      r.sourceId === characterId || r.targetId === characterId
    );
  }

  // ========================================
  // 시놉시스 템플릿 관련 메서드
  // ========================================

  /**
   * 시놉시스 템플릿 목록 가져오기
   */
  async getSynopsisTemplates(projectId = null) {
    const data = await this.load('synopsis_templates.json');
    const templates = data?.templates || [];

    if (projectId) {
      return templates.filter(t => t.projectId === projectId);
    }
    return templates;
  }

  /**
   * 프리셋 시놉시스 목록 가져오기
   */
  async getPresetSynopses(projectId = null) {
    const data = await this.load('synopsis_templates.json');
    const presets = data?.presetSynopses || [];

    if (projectId) {
      return presets.filter(p => p.projectId === projectId);
    }
    return presets;
  }

  // ========================================
  // 복선/떡밥 관련 메서드
  // ========================================

  /**
   * 복선/떡밥 목록 가져오기 (프로젝트 ID로 필터링)
   */
  async getForeshadowing(projectId = null) {
    const data = await this.load('foreshadowing.json');
    const foreshadowing = data?.foreshadowing || [];

    if (projectId) {
      return foreshadowing.filter(f => f.projectId === projectId);
    }
    return foreshadowing;
  }

  /**
   * 특정 복선/떡밥 가져오기
   */
  async getForeshadowingById(id) {
    const foreshadowing = await this.getForeshadowing();
    return foreshadowing.find(f => f.id === id) || null;
  }

  /**
   * 복선/떡밥 유형 정의 가져오기
   */
  async getForeshadowingTypes() {
    const data = await this.load('foreshadowing.json');
    return data?.foreshadowingTypes || [];
  }

  /**
   * 복선/떡밥 상태 유형 가져오기
   */
  async getForeshadowingStatusTypes() {
    const data = await this.load('foreshadowing.json');
    return data?.statusTypes || [];
  }

  /**
   * 복선/떡밥 통계 가져오기
   */
  async getForeshadowingStats(projectId) {
    const foreshadowing = await this.getForeshadowing(projectId);

    const stats = {
      total: foreshadowing.length,
      pending: foreshadowing.filter(f => f.status === '미회수').length,
      resolved: foreshadowing.filter(f => f.status === '회수완료').length,
      discarded: foreshadowing.filter(f => f.status === '폐기').length,
      byType: {},
      byImportance: {}
    };

    // 유형별 통계
    foreshadowing.forEach(f => {
      stats.byType[f.type] = (stats.byType[f.type] || 0) + 1;
      stats.byImportance[f.importance] = (stats.byImportance[f.importance] || 0) + 1;
    });

    return stats;
  }

  /**
   * 프로젝트 통계 계산
   */
  async getProjectStats(projectId) {
    const [characters, events] = await Promise.all([
      this.getCharacters(projectId),
      this.getEvents(projectId)
    ]);

    return {
      totalCharacters: characters.length,
      totalEvents: events.length,
      totalEpisodes: 0 // 회차 기능은 Phase 2에서 구현
    };
  }
}

// 전역 인스턴스 생성
const dataLoader = new DataLoader();

// ========================================
// RelationshipStore - 관계 CRUD 관리
// ========================================

class RelationshipStore {
  constructor() {
    this.KEYS = {
      created: 'stitch_relationships_created',
      updated: 'stitch_relationships_updated',
      deleted: 'stitch_relationships_deleted'
    };
  }

  /**
   * 고유 ID 생성
   */
  generateId() {
    return `rel_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  /**
   * localStorage에서 생성된 관계 로드
   */
  getCreated() {
    return utils.storage.get(this.KEYS.created, []);
  }

  /**
   * localStorage에서 수정된 관계 로드
   */
  getUpdated() {
    return utils.storage.get(this.KEYS.updated, {});
  }

  /**
   * localStorage에서 삭제된 관계 ID 로드
   */
  getDeleted() {
    return utils.storage.get(this.KEYS.deleted, []);
  }

  /**
   * 새 관계 생성
   */
  create(relationshipData) {
    const created = this.getCreated();
    const newRelationship = {
      ...relationshipData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    created.push(newRelationship);
    utils.storage.set(this.KEYS.created, created);
    return newRelationship;
  }

  /**
   * 관계 수정
   */
  update(id, updates) {
    // 먼저 사용자가 생성한 관계인지 확인
    const created = this.getCreated();
    const createdIndex = created.findIndex(r => r.id === id);

    if (createdIndex !== -1) {
      // 사용자 생성 관계 수정
      created[createdIndex] = { ...created[createdIndex], ...updates };
      utils.storage.set(this.KEYS.created, created);
      return created[createdIndex];
    }

    // 원본 JSON 관계 수정 (오버레이)
    const updated = this.getUpdated();
    updated[id] = { ...updated[id], ...updates, updatedAt: new Date().toISOString() };
    utils.storage.set(this.KEYS.updated, updated);
    return updated[id];
  }

  /**
   * 관계 삭제
   */
  delete(id) {
    // 먼저 사용자가 생성한 관계인지 확인
    const created = this.getCreated();
    const createdIndex = created.findIndex(r => r.id === id);

    if (createdIndex !== -1) {
      // 사용자 생성 관계는 바로 삭제
      created.splice(createdIndex, 1);
      utils.storage.set(this.KEYS.created, created);
      return true;
    }

    // 원본 JSON 관계는 삭제 목록에 추가
    const deleted = this.getDeleted();
    if (!deleted.includes(id)) {
      deleted.push(id);
      utils.storage.set(this.KEYS.deleted, deleted);
    }

    // 수정 목록에서도 제거
    const updated = this.getUpdated();
    delete updated[id];
    utils.storage.set(this.KEYS.updated, updated);

    return true;
  }

  /**
   * JSON 원본 + localStorage 변경분 병합
   */
  async getMergedRelationships(projectId = null) {
    // 1. 원본 JSON 로드
    let relationships = await dataLoader.getRelationships(projectId);

    // 2. 삭제된 관계 제외
    const deleted = this.getDeleted();
    relationships = relationships.filter(r => !deleted.includes(r.id));

    // 3. 수정된 관계 덮어쓰기
    const updated = this.getUpdated();
    relationships = relationships.map(r => {
      if (updated[r.id]) {
        return { ...r, ...updated[r.id] };
      }
      return r;
    });

    // 4. 새로 생성된 관계 추가
    const created = this.getCreated();
    const filteredCreated = projectId
      ? created.filter(r => r.projectId === projectId)
      : created;
    relationships = [...relationships, ...filteredCreated];

    return relationships;
  }

  /**
   * 모든 변경사항 초기화
   */
  clearAll() {
    utils.storage.remove(this.KEYS.created);
    utils.storage.remove(this.KEYS.updated);
    utils.storage.remove(this.KEYS.deleted);
  }
}

// 전역 인스턴스 생성
const relationshipStore = new RelationshipStore();

// ========================================
// CharacterStore - 캐릭터 CRUD 관리
// ========================================

class CharacterStore {
  constructor() {
    this.KEYS = {
      created: 'stitch_characters_created',
      updated: 'stitch_characters_updated',
      deleted: 'stitch_characters_deleted',
      images: 'stitch_character_images'
    };
  }

  /**
   * 고유 ID 생성
   */
  generateId() {
    return `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  /**
   * localStorage에서 생성된 캐릭터 로드
   */
  getCreated() {
    return utils.storage.get(this.KEYS.created, []);
  }

  /**
   * localStorage에서 수정된 캐릭터 로드
   */
  getUpdated() {
    return utils.storage.get(this.KEYS.updated, {});
  }

  /**
   * localStorage에서 삭제된 캐릭터 ID 로드
   */
  getDeleted() {
    return utils.storage.get(this.KEYS.deleted, []);
  }

  /**
   * localStorage에서 이미지 저장소 로드
   */
  getImages() {
    return utils.storage.get(this.KEYS.images, {});
  }

  /**
   * 새 캐릭터 생성
   */
  create(characterData) {
    const created = this.getCreated();
    const newCharacter = {
      ...characterData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    created.push(newCharacter);
    utils.storage.set(this.KEYS.created, created);
    return newCharacter;
  }

  /**
   * 캐릭터 수정
   */
  update(id, updates) {
    // 먼저 사용자가 생성한 캐릭터인지 확인
    const created = this.getCreated();
    const createdIndex = created.findIndex(c => c.id === id);

    if (createdIndex !== -1) {
      // 사용자 생성 캐릭터 수정
      created[createdIndex] = { ...created[createdIndex], ...updates };
      utils.storage.set(this.KEYS.created, created);
      return created[createdIndex];
    }

    // 원본 JSON 캐릭터 수정 (오버레이)
    const updated = this.getUpdated();
    updated[id] = { ...updated[id], ...updates, updatedAt: new Date().toISOString() };
    utils.storage.set(this.KEYS.updated, updated);
    return updated[id];
  }

  /**
   * 캐릭터 삭제 (관계 연쇄 삭제 옵션)
   */
  async delete(id, cascadeRelationships = false) {
    // 연쇄 삭제 옵션이 켜져 있으면 관련 관계도 삭제
    if (cascadeRelationships) {
      const relationships = await this.getRelatedRelationships(id);
      relationships.forEach(rel => {
        relationshipStore.delete(rel.id);
      });
    }

    // 이미지도 삭제
    this.deleteImage(id);

    // 먼저 사용자가 생성한 캐릭터인지 확인
    const created = this.getCreated();
    const createdIndex = created.findIndex(c => c.id === id);

    if (createdIndex !== -1) {
      // 사용자 생성 캐릭터는 바로 삭제
      created.splice(createdIndex, 1);
      utils.storage.set(this.KEYS.created, created);
      return true;
    }

    // 원본 JSON 캐릭터는 삭제 목록에 추가
    const deleted = this.getDeleted();
    if (!deleted.includes(id)) {
      deleted.push(id);
      utils.storage.set(this.KEYS.deleted, deleted);
    }

    // 수정 목록에서도 제거
    const updated = this.getUpdated();
    delete updated[id];
    utils.storage.set(this.KEYS.updated, updated);

    return true;
  }

  /**
   * JSON 원본 + localStorage 변경분 병합
   */
  async getMergedCharacters(projectId = null) {
    // 1. 원본 JSON 로드
    let characters = await dataLoader.getCharacters(projectId);

    // 2. 삭제된 캐릭터 제외
    const deleted = this.getDeleted();
    characters = characters.filter(c => !deleted.includes(c.id));

    // 3. 수정된 캐릭터 덮어쓰기
    const updated = this.getUpdated();
    characters = characters.map(c => {
      if (updated[c.id]) {
        return { ...c, ...updated[c.id] };
      }
      return c;
    });

    // 4. 새로 생성된 캐릭터 추가
    const created = this.getCreated();
    const filteredCreated = projectId
      ? created.filter(c => c.projectId === projectId)
      : created;
    characters = [...characters, ...filteredCreated];

    return characters;
  }

  /**
   * 특정 캐릭터 가져오기 (병합된 데이터에서)
   */
  async getCharacterById(id) {
    const characters = await this.getMergedCharacters();
    return characters.find(c => c.id === id) || null;
  }

  /**
   * 특정 캐릭터와 연결된 관계 가져오기
   */
  async getRelatedRelationships(characterId) {
    const relationships = await relationshipStore.getMergedRelationships();
    return relationships.filter(r =>
      r.sourceId === characterId || r.targetId === characterId
    );
  }

  // ========================================
  // 이미지 관리
  // ========================================

  /**
   * 이미지 저장 (Base64)
   */
  saveImage(id, base64DataUrl) {
    const images = this.getImages();
    images[id] = base64DataUrl;
    utils.storage.set(this.KEYS.images, images);
  }

  /**
   * 이미지 로드
   */
  getImage(id) {
    const images = this.getImages();
    return images[id] || null;
  }

  /**
   * 이미지 삭제
   */
  deleteImage(id) {
    const images = this.getImages();
    delete images[id];
    utils.storage.set(this.KEYS.images, images);
  }

  /**
   * 캐릭터 이미지 URL 가져오기 (local: prefix 처리)
   */
  getCharacterImageUrl(character) {
    if (!character) return null;

    if (character.image?.startsWith('local:')) {
      const id = character.image.replace('local:', '');
      return this.getImage(id);
    }
    return character.image || null;
  }

  /**
   * 모든 변경사항 초기화
   */
  clearAll() {
    utils.storage.remove(this.KEYS.created);
    utils.storage.remove(this.KEYS.updated);
    utils.storage.remove(this.KEYS.deleted);
    utils.storage.remove(this.KEYS.images);
  }
}

// 전역 인스턴스 생성
const characterStore = new CharacterStore();

// ========================================
// TimelineStore - 타임라인 CRUD 관리
// ========================================

class TimelineStore {
  constructor() {
    this.KEYS = {
      order: 'stitch_timeline_order', // 순서 저장용
      created: 'stitch_timeline_created',
      updated: 'stitch_timeline_updated',
      deleted: 'stitch_timeline_deleted'
    };
  }

  /**
   * 고유 ID 생성
   */
  generateId() {
    return `time_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  /**
   * localStorage에서 생성된 타임라인 로드
   */
  getCreated() {
    return utils.storage.get(this.KEYS.created, []);
  }

  /**
   * localStorage에서 삭제된 타임라인 ID 로드
   */
  getDeleted() {
    return utils.storage.get(this.KEYS.deleted, []);
  }

  /**
   * 새 타임라인 항목 생성
   */
  create(timelineData) {
    const created = this.getCreated();
    const newTimeline = {
      ...timelineData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    created.push(newTimeline);
    utils.storage.set(this.KEYS.created, created);
    return newTimeline;
  }

  /**
   * 타임라인 항목 삭제
   */
  delete(id) {
    // 먼저 사용자가 생성한 타임라인인지 확인
    const created = this.getCreated();
    const createdIndex = created.findIndex(t => t.id === id);

    if (createdIndex !== -1) {
      created.splice(createdIndex, 1);
      utils.storage.set(this.KEYS.created, created);
      return true;
    }

    // 원본 JSON 타임라인은 삭제 목록에 추가
    const deleted = this.getDeleted();
    if (!deleted.includes(id)) {
      deleted.push(id);
      utils.storage.set(this.KEYS.deleted, deleted);
    }
    return true;
  }

  /**
   * localStorage에서 순서 정보 로드
   */
  getOrder() {
    return utils.storage.get(this.KEYS.order, {});
  }

  /**
   * 순서 저장
   * @param {string} projectId 
   * @param {Array} eventIds 
   */
  saveOrder(projectId, eventIds) {
    const orderMap = this.getOrder();
    orderMap[projectId] = eventIds;
    utils.storage.set(this.KEYS.order, orderMap);
  }

  /**
   * 타임라인 이벤트 가져오기 (순서 적용)
   */
  async getTimeline(projectId = null) {
    // 1. 기본 데이터 로드
    let events = await dataLoader.getTimeline(projectId);

    // 2. 삭제된 타임라인 제외
    const deleted = this.getDeleted();
    events = events.filter(e => !deleted.includes(e.id));

    // 3. 새로 생성된 타임라인 추가
    const created = this.getCreated();
    const filteredCreated = projectId
      ? created.filter(t => t.projectId === projectId)
      : created;
    events = [...events, ...filteredCreated];

    // 4. 저장된 순서 적용
    const orderMap = this.getOrder();
    const savedOrder = projectId ? orderMap[projectId] : null;

    if (savedOrder && savedOrder.length > 0) {
      // 저장된 순서대로 정렬
      // 저장된 순서에 없는 이벤트는 뒤로 보냄
      events.sort((a, b) => {
        const indexA = savedOrder.indexOf(a.id);
        const indexB = savedOrder.indexOf(b.id);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return 0;
      });
    }

    return events;
  }
}

// 전역 인스턴스 생성
const timelineStore = new TimelineStore();

// ========================================
// SynopsisStore - 시놉시스 CRUD 관리
// ========================================

class SynopsisStore {
  constructor() {
    this.KEYS = {
      created: 'stitch_synopsis_created',
      updated: 'stitch_synopsis_updated',
      deleted: 'stitch_synopsis_deleted'
    };
  }

  /**
   * 고유 ID 생성
   */
  generateId() {
    return `syn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  /**
   * localStorage에서 생성된 시놉시스 로드
   */
  getCreated() {
    return utils.storage.get(this.KEYS.created, []);
  }

  /**
   * localStorage에서 수정된 시놉시스 로드 (내용 등)
   */
  getUpdated() {
    return utils.storage.get(this.KEYS.updated, {});
  }

  /**
   * 새 시놉시스 생성
   */
  create(synopsisData) {
    const created = this.getCreated();
    const newSynopsis = {
      ...synopsisData,
      id: synopsisData.id || this.generateId(),
      createdAt: new Date().toISOString()
    };
    created.push(newSynopsis);
    utils.storage.set(this.KEYS.created, created);
    return newSynopsis;
  }

  /**
   * 시놉시스 수정 (내용 업데이트 등)
   */
  update(id, updates) {
    // 1. 사용자 생성 시놉시스인지 확인
    const created = this.getCreated();
    const createdIndex = created.findIndex(s => s.id === id);

    if (createdIndex !== -1) {
      created[createdIndex] = { ...created[createdIndex], ...updates };
      utils.storage.set(this.KEYS.created, created);
      return created[createdIndex];
    }

    // 2. 원본 JSON 시놉시스 수정
    const updated = this.getUpdated();
    updated[id] = { ...updated[id], ...updates, updatedAt: new Date().toISOString() };
    utils.storage.set(this.KEYS.updated, updated);
    return updated[id];
  }

  /**
   * JSON 원본 + localStorage 변경분 병합
   */
  async getMergedSynopses(projectId = null) {
    // 1. 원본 JSON 로드
    let synopses = await dataLoader.getSynopses(projectId);

    // 2. 수정된 내용 적용
    const updated = this.getUpdated();
    synopses = synopses.map(s => {
      if (updated[s.id]) {
        return { ...s, ...updated[s.id] };
      }
      return s;
    });

    // 3. 새로 생성된 시놉시스 추가
    const created = this.getCreated();
    const filteredCreated = projectId
      ? created.filter(s => s.projectId === projectId)
      : created;

    return [...synopses, ...filteredCreated];
  }
}

// 전역 인스턴스 생성
const synopsisStore = new SynopsisStore();

// ========================================
// ForeshadowingStore - 복선/떡밥 CRUD 관리
// ========================================

class ForeshadowingStore {
  constructor() {
    this.KEYS = {
      created: 'stitch_foreshadowing_created',
      updated: 'stitch_foreshadowing_updated',
      deleted: 'stitch_foreshadowing_deleted'
    };
  }

  /**
   * 고유 ID 생성
   */
  generateId() {
    return `fore_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  /**
   * localStorage에서 생성된 복선 로드
   */
  getCreated() {
    return utils.storage.get(this.KEYS.created, []);
  }

  /**
   * localStorage에서 수정된 복선 로드
   */
  getUpdated() {
    return utils.storage.get(this.KEYS.updated, {});
  }

  /**
   * localStorage에서 삭제된 복선 ID 로드
   */
  getDeleted() {
    return utils.storage.get(this.KEYS.deleted, []);
  }

  /**
   * 새 복선 생성
   */
  create(foreshadowingData) {
    const created = this.getCreated();
    const newForeshadowing = {
      ...foreshadowingData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    created.push(newForeshadowing);
    utils.storage.set(this.KEYS.created, created);
    return newForeshadowing;
  }

  /**
   * 복선 수정
   */
  update(id, updates) {
    // 먼저 사용자가 생성한 복선인지 확인
    const created = this.getCreated();
    const createdIndex = created.findIndex(f => f.id === id);

    if (createdIndex !== -1) {
      // 사용자 생성 복선 수정
      created[createdIndex] = { ...created[createdIndex], ...updates };
      utils.storage.set(this.KEYS.created, created);
      return created[createdIndex];
    }

    // 원본 JSON 복선 수정 (오버레이)
    const updated = this.getUpdated();
    updated[id] = { ...updated[id], ...updates, updatedAt: new Date().toISOString() };
    utils.storage.set(this.KEYS.updated, updated);
    return updated[id];
  }

  /**
   * 복선 삭제
   */
  delete(id) {
    // 먼저 사용자가 생성한 복선인지 확인
    const created = this.getCreated();
    const createdIndex = created.findIndex(f => f.id === id);

    if (createdIndex !== -1) {
      // 사용자 생성 복선은 바로 삭제
      created.splice(createdIndex, 1);
      utils.storage.set(this.KEYS.created, created);
      return true;
    }

    // 원본 JSON 복선은 삭제 목록에 추가
    const deleted = this.getDeleted();
    if (!deleted.includes(id)) {
      deleted.push(id);
      utils.storage.set(this.KEYS.deleted, deleted);
    }

    // 수정 목록에서도 제거
    const updated = this.getUpdated();
    delete updated[id];
    utils.storage.set(this.KEYS.updated, updated);

    return true;
  }

  /**
   * JSON 원본 + localStorage 변경분 병합
   */
  async getMergedForeshadowing(projectId = null) {
    // 1. 원본 JSON 로드
    let foreshadowing = await dataLoader.getForeshadowing(projectId);

    // 2. 삭제된 복선 제외
    const deleted = this.getDeleted();
    foreshadowing = foreshadowing.filter(f => !deleted.includes(f.id));

    // 3. 수정된 복선 덮어쓰기
    const updated = this.getUpdated();
    foreshadowing = foreshadowing.map(f => {
      if (updated[f.id]) {
        return { ...f, ...updated[f.id] };
      }
      return f;
    });

    // 4. 새로 생성된 복선 추가
    const created = this.getCreated();
    const filteredCreated = projectId
      ? created.filter(f => f.projectId === projectId)
      : created;
    foreshadowing = [...foreshadowing, ...filteredCreated];

    return foreshadowing;
  }

  /**
   * 특정 복선 가져오기 (병합된 데이터에서)
   */
  async getForeshadowingById(id) {
    const foreshadowing = await this.getMergedForeshadowing();
    return foreshadowing.find(f => f.id === id) || null;
  }

  /**
   * 모든 변경사항 초기화
   */
  clearAll() {
    utils.storage.remove(this.KEYS.created);
    utils.storage.remove(this.KEYS.updated);
    utils.storage.remove(this.KEYS.deleted);
  }
}

// 전역 인스턴스 생성
const foreshadowingStore = new ForeshadowingStore();

// ========================================
// EventStore - 이벤트 CRUD 관리
// ========================================

class EventStore {
  constructor() {
    this.KEYS = {
      created: 'stitch_events_created',
      updated: 'stitch_events_updated',
      deleted: 'stitch_events_deleted',
      images: 'stitch_event_images'
    };
  }

  /**
   * 고유 ID 생성
   */
  generateId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  /**
   * localStorage에서 생성된 이벤트 로드
   */
  getCreated() {
    return utils.storage.get(this.KEYS.created, []);
  }

  /**
   * localStorage에서 수정된 이벤트 로드
   */
  getUpdated() {
    return utils.storage.get(this.KEYS.updated, {});
  }

  /**
   * localStorage에서 삭제된 이벤트 ID 로드
   */
  getDeleted() {
    return utils.storage.get(this.KEYS.deleted, []);
  }

  /**
   * localStorage에서 이미지 저장소 로드
   */
  getImages() {
    return utils.storage.get(this.KEYS.images, {});
  }

  /**
   * 새 이벤트 생성
   */
  create(eventData) {
    const created = this.getCreated();
    const newEvent = {
      ...eventData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    created.push(newEvent);
    utils.storage.set(this.KEYS.created, created);
    return newEvent;
  }

  /**
   * 이벤트 수정
   */
  update(id, updates) {
    // 먼저 사용자가 생성한 이벤트인지 확인
    const created = this.getCreated();
    const createdIndex = created.findIndex(e => e.id === id);

    if (createdIndex !== -1) {
      // 사용자 생성 이벤트 수정
      created[createdIndex] = { ...created[createdIndex], ...updates };
      utils.storage.set(this.KEYS.created, created);
      return created[createdIndex];
    }

    // 원본 JSON 이벤트 수정 (오버레이)
    const updated = this.getUpdated();
    updated[id] = { ...updated[id], ...updates, updatedAt: new Date().toISOString() };
    utils.storage.set(this.KEYS.updated, updated);
    return updated[id];
  }

  /**
   * 이벤트 삭제
   */
  delete(id) {
    // 이미지도 삭제
    this.deleteImage(id);

    // 먼저 사용자가 생성한 이벤트인지 확인
    const created = this.getCreated();
    const createdIndex = created.findIndex(e => e.id === id);

    if (createdIndex !== -1) {
      // 사용자 생성 이벤트는 바로 삭제
      created.splice(createdIndex, 1);
      utils.storage.set(this.KEYS.created, created);
      return true;
    }

    // 원본 JSON 이벤트는 삭제 목록에 추가
    const deleted = this.getDeleted();
    if (!deleted.includes(id)) {
      deleted.push(id);
      utils.storage.set(this.KEYS.deleted, deleted);
    }

    // 수정 목록에서도 제거
    const updated = this.getUpdated();
    delete updated[id];
    utils.storage.set(this.KEYS.updated, updated);

    return true;
  }

  /**
   * JSON 원본 + localStorage 변경분 병합
   */
  async getMergedEvents(projectId = null) {
    // 1. 원본 JSON 로드
    let events = await dataLoader.getEvents(projectId);

    // 2. 삭제된 이벤트 제외
    const deleted = this.getDeleted();
    events = events.filter(e => !deleted.includes(e.id));

    // 3. 수정된 이벤트 덮어쓰기
    const updated = this.getUpdated();
    events = events.map(e => {
      if (updated[e.id]) {
        return { ...e, ...updated[e.id] };
      }
      return e;
    });

    // 4. 새로 생성된 이벤트 추가
    const created = this.getCreated();
    const filteredCreated = projectId
      ? created.filter(e => e.projectId === projectId)
      : created;
    events = [...events, ...filteredCreated];

    return events;
  }

  /**
   * 특정 이벤트 가져오기 (병합된 데이터에서)
   */
  async getEventById(id) {
    const events = await this.getMergedEvents();
    return events.find(e => e.id === id) || null;
  }

  // ========================================
  // 이미지 관리
  // ========================================

  /**
   * 이미지 저장 (Base64)
   */
  saveImage(id, base64DataUrl) {
    const images = this.getImages();
    images[id] = base64DataUrl;
    utils.storage.set(this.KEYS.images, images);
  }

  /**
   * 이미지 로드
   */
  getImage(id) {
    const images = this.getImages();
    return images[id] || null;
  }

  /**
   * 이미지 삭제
   */
  deleteImage(id) {
    const images = this.getImages();
    delete images[id];
    utils.storage.set(this.KEYS.images, images);
  }

  /**
   * 이벤트 이미지 URL 가져오기 (local: prefix 처리)
   */
  getEventImageUrl(event) {
    if (!event) return null;

    if (event.image?.startsWith('local:')) {
      const id = event.image.replace('local:', '');
      return this.getImage(id);
    }
    return event.image || null;
  }

  /**
   * 모든 변경사항 초기화
   */
  clearAll() {
    utils.storage.remove(this.KEYS.created);
    utils.storage.remove(this.KEYS.updated);
    utils.storage.remove(this.KEYS.deleted);
    utils.storage.remove(this.KEYS.images);
  }
}

// 전역 인스턴스 생성
const eventStore = new EventStore();
