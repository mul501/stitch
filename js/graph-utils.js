/**
 * Graph Utilities - vis.js Network 유틸리티 함수
 */

const graphUtils = {
  /**
   * 캐릭터 데이터를 vis.js 노드로 변환
   */
  charactersToNodes(characters) {
    return characters.map(char => ({
      id: char.id,
      label: char.name,
      title: `${char.name}\n${char.alias || ''}\n${char.role}`,
      image: char.image,
      group: char.role,
      shape: 'circularImage',
      size: char.role === '주인공' ? 45 : 35,
      borderWidth: 3,
      font: {
        size: 14,
        color: '#1F2937',
        face: 'Noto Sans KR, sans-serif'
      }
    }));
  },

  /**
   * 관계 데이터를 vis.js 엣지로 변환
   */
  relationshipsToEdges(relationships, relationshipTypes) {
    const typeColors = {};
    relationshipTypes.forEach(t => {
      typeColors[t.type] = t.color;
    });

    return relationships.map(rel => ({
      id: rel.id,
      from: rel.sourceId,
      to: rel.targetId,
      label: rel.subtype || rel.type,
      title: rel.description,
      color: {
        color: typeColors[rel.type] || '#6B7280',
        highlight: typeColors[rel.type] || '#6B7280',
        hover: typeColors[rel.type] || '#6B7280'
      },
      width: rel.strength,
      arrows: rel.bidirectional ? '' : 'to',
      smooth: {
        type: 'curvedCW',
        roundness: 0.2
      },
      font: {
        size: 11,
        color: '#6B7280',
        align: 'middle',
        background: 'white'
      },
      relationshipType: rel.type,
      relationshipData: rel
    }));
  },

  /**
   * 관계 유형으로 엣지 필터링
   */
  filterByRelationshipTypes(edges, selectedTypes) {
    if (!selectedTypes || selectedTypes.length === 0) {
      return edges;
    }
    return edges.filter(edge => selectedTypes.includes(edge.relationshipType));
  },

  /**
   * 특정 캐릭터와 연결된 노드/엣지만 필터링
   */
  filterConnectedToCharacter(nodes, edges, characterId) {
    if (!characterId) {
      return { nodes, edges };
    }

    const connectedNodeIds = new Set([characterId]);
    edges.forEach(edge => {
      if (edge.from === characterId) connectedNodeIds.add(edge.to);
      if (edge.to === characterId) connectedNodeIds.add(edge.from);
    });

    return {
      nodes: nodes.filter(n => connectedNodeIds.has(n.id)),
      edges: edges.filter(e =>
        connectedNodeIds.has(e.from) && connectedNodeIds.has(e.to)
      )
    };
  },

  /**
   * vis.js Network 기본 옵션
   */
  getNetworkOptions() {
    return {
      nodes: {
        shape: 'circularImage',
        size: 40,
        font: {
          size: 14,
          color: '#1F2937',
          face: 'Noto Sans KR, sans-serif'
        },
        borderWidth: 3,
        shadow: {
          enabled: true,
          size: 5,
          x: 2,
          y: 2
        }
      },
      edges: {
        width: 2,
        smooth: {
          type: 'curvedCW',
          roundness: 0.2
        },
        font: {
          size: 11,
          align: 'middle',
          background: 'white'
        },
        shadow: {
          enabled: true,
          size: 3
        }
      },
      physics: {
        enabled: true,
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          gravitationalConstant: -50,
          centralGravity: 0.01,
          springLength: 150,
          springConstant: 0.08
        },
        stabilization: {
          enabled: true,
          iterations: 100,
          updateInterval: 25
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
        navigationButtons: false,  // 커스텀 버튼 사용으로 비활성화
        keyboard: true,
        zoomView: true
      },
      groups: {
        '주인공': {
          color: {
            border: '#3B82F6',
            background: '#DBEAFE',
            highlight: { border: '#2563EB', background: '#BFDBFE' },
            hover: { border: '#2563EB', background: '#BFDBFE' }
          }
        },
        '조연': {
          color: {
            border: '#22C55E',
            background: '#DCFCE7',
            highlight: { border: '#16A34A', background: '#BBF7D0' },
            hover: { border: '#16A34A', background: '#BBF7D0' }
          }
        },
        '적대자': {
          color: {
            border: '#EF4444',
            background: '#FEE2E2',
            highlight: { border: '#DC2626', background: '#FECACA' },
            hover: { border: '#DC2626', background: '#FECACA' }
          }
        }
      }
    };
  },

  /**
   * 관계 유형별 색상 맵 생성
   */
  createColorMap(relationshipTypes) {
    const colorMap = {};
    relationshipTypes.forEach(t => {
      colorMap[t.type] = t.color;
    });
    return colorMap;
  },

  /**
   * 관계 상세 정보 HTML 생성
   */
  createRelationshipDetailHtml(edge, characters) {
    if (!edge || !edge.relationshipData) {
      return `
        <div class="text-center text-gray-500 py-8">
          <span class="material-symbols-outlined text-4xl mb-2">info</span>
          <p>관계를 선택하면 상세 정보가 표시됩니다</p>
        </div>
      `;
    }

    const rel = edge.relationshipData;
    const sourceChar = characters.find(c => c.id === rel.sourceId);
    const targetChar = characters.find(c => c.id === rel.targetId);

    return `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img src="${sourceChar?.image}" alt="${sourceChar?.name}" class="w-10 h-10 rounded-full object-cover" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(sourceChar?.name || '')}&background=random'">
            <span class="font-medium">${sourceChar?.name || '알 수 없음'}</span>
          </div>
          <span class="text-gray-400">${rel.bidirectional ? '↔' : '→'}</span>
          <div class="flex items-center gap-3">
            <span class="font-medium">${targetChar?.name || '알 수 없음'}</span>
            <img src="${targetChar?.image}" alt="${targetChar?.name}" class="w-10 h-10 rounded-full object-cover" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(targetChar?.name || '')}&background=random'">
          </div>
        </div>
        <div class="border-t pt-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="px-2 py-1 text-xs rounded-full text-white" style="background-color: ${edge.color.color}">${rel.type}</span>
            <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">${rel.subtype || '-'}</span>
            <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">강도: ${'★'.repeat(rel.strength)}${'☆'.repeat(5 - rel.strength)}</span>
          </div>
          <p class="text-gray-600 text-sm">${rel.description}</p>
          ${rel.keywords?.length ? `
            <div class="flex flex-wrap gap-1 mt-3">
              ${rel.keywords.map(k => `<span class="text-xs text-blue-600">${k}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  /**
   * 노드 상세 정보 HTML 생성
   */
  createNodeDetailHtml(node, character) {
    if (!character) {
      return '';
    }

    return `
      <div class="flex items-start gap-4">
        <img src="${character.image}" alt="${character.name}" class="w-16 h-16 rounded-full object-cover" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random&size=128'">
        <div class="flex-1">
          <h3 class="font-bold text-lg">${character.name}</h3>
          <p class="text-gray-500 text-sm">${character.alias || ''}</p>
          <div class="flex flex-wrap gap-2 mt-2">
            <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">${character.age}세</span>
            <span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">${character.role}</span>
            <span class="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">${character.gender}</span>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * 관계 편집 폼 HTML 생성
   * @param {Object|null} relationship - 수정할 관계 객체 (신규 생성 시 null)
   * @param {Array} characters - 캐릭터 목록
   * @param {Array} relationshipTypes - 관계 유형 정의
   * @param {boolean} isNew - 신규 생성 모드 여부
   */
  createRelationshipEditFormHtml(relationship, characters, relationshipTypes, isNew = false) {
    // 캐릭터 옵션 생성
    const characterOptions = characters.map(c =>
      `<option value="${c.id}">${c.name} (${c.role})</option>`
    ).join('');

    // 관계 유형 옵션 생성
    const typeOptions = relationshipTypes.map(t =>
      `<option value="${t.type}" ${relationship?.type === t.type ? 'selected' : ''}>${t.type}</option>`
    ).join('');

    // 현재 선택된 유형의 세부유형 옵션
    const currentType = relationship?.type || relationshipTypes[0]?.type || '';
    const currentTypeData = relationshipTypes.find(t => t.type === currentType);
    const subtypeOptions = (currentTypeData?.subtypes || []).map(s =>
      `<option value="${s}" ${relationship?.subtype === s ? 'selected' : ''}>${s}</option>`
    ).join('');

    // 강도 별점 (1-5)
    const strength = relationship?.strength || 3;
    const starRating = Array.from({ length: 5 }, (_, i) =>
      `<button type="button" class="strength-star text-2xl transition-colors ${i < strength ? 'text-yellow-400' : 'text-gray-300'}" data-value="${i + 1}">★</button>`
    ).join('');

    return `
      <form id="relationship-form" class="space-y-4">
        <input type="hidden" name="id" value="${relationship?.id || ''}">
        <input type="hidden" name="strength" value="${strength}">

        <!-- 캐릭터 선택 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">출발 캐릭터 *</label>
            <select name="sourceId" required
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ${!isNew ? 'disabled' : ''}>
              <option value="">선택하세요</option>
              ${characterOptions}
            </select>
            ${!isNew && relationship ? `<input type="hidden" name="sourceId" value="${relationship.sourceId}">` : ''}
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">도착 캐릭터 *</label>
            <select name="targetId" required
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ${!isNew ? 'disabled' : ''}>
              <option value="">선택하세요</option>
              ${characterOptions}
            </select>
            ${!isNew && relationship ? `<input type="hidden" name="targetId" value="${relationship.targetId}">` : ''}
          </div>
        </div>

        <!-- 관계 유형/세부유형 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">관계 유형 *</label>
            <select name="type" required id="rel-type-select"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              ${typeOptions}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">세부 유형</label>
            <select name="subtype" id="rel-subtype-select"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">선택 안함</option>
              ${subtypeOptions}
            </select>
          </div>
        </div>

        <!-- 관계 강도 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">관계 강도</label>
          <div class="flex items-center gap-1" id="strength-rating">${starRating}</div>
          <p class="text-xs text-gray-500 mt-1">선의 굵기로 표시됩니다</p>
        </div>

        <!-- 양방향 옵션 -->
        <div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="bidirectional"
              class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              ${relationship?.bidirectional ? 'checked' : ''}>
            <span class="text-sm text-gray-700">양방향 관계 (↔)</span>
          </label>
          <p class="text-xs text-gray-500 mt-1 ml-6">체크 해제 시 출발→도착 단방향 화살표</p>
        </div>

        <!-- 설명 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">설명</label>
          <textarea name="description" rows="3"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="두 캐릭터의 관계를 설명해주세요...">${relationship?.description || ''}</textarea>
        </div>

        <!-- 키워드 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">키워드</label>
          <input type="text" name="keywords"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="#신뢰, #동료, #라이벌"
            value="${(relationship?.keywords || []).join(', ')}">
          <p class="text-xs text-gray-500 mt-1">쉼표로 구분하여 입력</p>
        </div>

        <!-- 버튼 -->
        <div class="flex justify-end gap-2 pt-4 border-t border-gray-200">
          <button type="button" id="cancel-edit-btn"
            class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm transition-colors">
            취소
          </button>
          ${!isNew ? `
            <button type="button" id="delete-rel-btn"
              class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors">
              삭제
            </button>
          ` : ''}
          <button type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
            ${isNew ? '추가' : '저장'}
          </button>
        </div>
      </form>
    `;
  }
};
