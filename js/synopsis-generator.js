/**
 * Synopsis Generator - Mock AI 시놉시스 생성 로직
 * 확장 버전: 2000자 이상의 부(Part) 단위 시놉시스 생성 지원
 */

const synopsisGenerator = {
  // 부(Part) 유형별 기본 장 번호 시작점
  PART_CHAPTER_START: {
    intro: 1,
    development: 4,
    crisis: 7,
    resolution: 10
  },
  /**
   * Mock AI 시놉시스 생성
   */
  async generate(templateId, characterIds, eventIds) {
    // 로딩 시뮬레이션 (1.5초)
    await this.simulateLoading(1500);

    const presets = await dataLoader.getPresetSynopses();
    const templates = await dataLoader.getSynopsisTemplates();
    const characters = await dataLoader.getCharacters();
    const events = await dataLoader.getEvents();

    // 1. 정확히 일치하는 프리셋 찾기
    const exactMatch = presets.find(p =>
      p.templateId === templateId &&
      this.arraysEqual(p.selectedCharacters.slice().sort(), characterIds.slice().sort()) &&
      this.arraysEqual(p.selectedEvents.slice().sort(), eventIds.slice().sort())
    );

    if (exactMatch) {
      return {
        synopsis: exactMatch.generatedSynopsis,
        metadata: exactMatch.metadata,
        title: exactMatch.title,
        source: 'preset'
      };
    }

    // 2. 유사한 프리셋 찾기 (캐릭터 포함 관계)
    const similarPreset = presets.find(p =>
      p.templateId === templateId &&
      characterIds.every(id => p.selectedCharacters.includes(id))
    );

    if (similarPreset) {
      return {
        synopsis: this.modifyPresetSynopsis(similarPreset.generatedSynopsis, characters, characterIds),
        metadata: {
          ...similarPreset.metadata,
          wordCount: Math.round(similarPreset.metadata.wordCount * 0.8),
          generatedAt: new Date().toISOString()
        },
        title: similarPreset.title + ' (변형)',
        source: 'modified'
      };
    }

    // 3. 템플릿 기반 동적 생성
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const selectedChars = characters.filter(c => characterIds.includes(c.id));
      const selectedEvents = events.filter(e => eventIds.includes(e.id));

      const generatedSynopsis = this.fillTemplate(template, selectedChars, selectedEvents);

      return {
        synopsis: generatedSynopsis,
        metadata: {
          wordCount: generatedSynopsis.length,
          genre: template.genre,
          tone: '자동 생성',
          generatedAt: new Date().toISOString()
        },
        title: `${template.name} 기반 시놉시스`,
        source: 'template'
      };
    }

    // 4. 기본 시놉시스 생성
    return this.generateDefaultSynopsis(characters, events, characterIds, eventIds);
  },

  /**
   * 템플릿 변수 채우기
   */
  fillTemplate(template, characters, events) {
    let result = template.template;

    const protagonist = characters.find(c => c.role === '주인공');
    const antagonist = characters.find(c => c.role === '적대자');
    const supporters = characters.filter(c => c.role === '조연');
    const allies = supporters.map(c => c.name).join(', ') || '동료들';

    // 이벤트 정렬 (시간순)
    const sortedEvents = events.slice().sort((a, b) => {
      const yearA = parseInt(a.year?.match(/\d+/)?.[0] || 0);
      const yearB = parseInt(b.year?.match(/\d+/)?.[0] || 0);
      return yearA - yearB;
    });

    const firstEvent = sortedEvents[0];
    const lastEvent = sortedEvents[sortedEvents.length - 1];

    // 변수 치환
    const replacements = {
      '{{protagonist}}': protagonist?.name || '주인공',
      '{{antagonist}}': antagonist?.name || '적대자',
      '{{allies}}': allies,
      '{{goal}}': protagonist?.affiliation || '왕국',
      '{{event1}}': firstEvent?.title || '운명적 사건',
      '{{climax_event}}': lastEvent?.title || '최종 결전',
      '{{resolution}}': '새로운 시대를 열었다',
      '{{inciting_incident}}': firstEvent?.title || '운명의 시작',
      '{{mentor}}': supporters[0]?.name || '스승',
      '{{skill}}': protagonist?.skills?.[0]?.name || '특별한 능력',
      '{{trial_event}}': sortedEvents[Math.floor(sortedEvents.length / 2)]?.title || '시련',
      '{{transformation}}': '진정한 영웅',
      '{{final_goal}}': '목표',
      '{{setting}}': firstEvent?.relatedPlaces?.[0] || '이 세계',
      '{{love_interest}}': supporters.find(c => c.gender !== protagonist?.gender)?.name || '상대',
      '{{initial_conflict}}': '오해',
      '{{bonding_event}}': firstEvent?.title || '함께한 모험',
      '{{external_threat}}': antagonist?.name || '외부의 위협'
    };

    Object.keys(replacements).forEach(key => {
      result = result.replace(new RegExp(key, 'g'), replacements[key]);
    });

    return result;
  },

  /**
   * 프리셋 시놉시스 수정 (선택된 캐릭터에 맞게)
   */
  modifyPresetSynopsis(synopsis, allCharacters, selectedCharacterIds) {
    // 선택되지 않은 캐릭터 이름을 일반 명칭으로 교체
    let modified = synopsis;

    allCharacters.forEach(char => {
      if (!selectedCharacterIds.includes(char.id)) {
        const nameRegex = new RegExp(char.name, 'g');
        const replacement = char.role === '주인공' ? '영웅' :
                          char.role === '적대자' ? '적' :
                          '동료';
        modified = modified.replace(nameRegex, replacement);
      }
    });

    return modified;
  },

  /**
   * 기본 시놉시스 생성
   */
  generateDefaultSynopsis(allCharacters, allEvents, characterIds, eventIds) {
    const selectedChars = allCharacters.filter(c => characterIds.includes(c.id));
    const selectedEvents = allEvents.filter(e => eventIds.includes(e.id));

    const protagonist = selectedChars.find(c => c.role === '주인공');
    const antagonist = selectedChars.find(c => c.role === '적대자');
    const supporters = selectedChars.filter(c => c.role === '조연');

    let synopsis = '';

    // 도입부
    if (protagonist) {
      synopsis += `${protagonist.name}은(는) ${protagonist.description}\n\n`;
    }

    // 사건 전개
    if (selectedEvents.length > 0) {
      selectedEvents.forEach(event => {
        synopsis += `${event.title}: ${event.description}\n\n`;
      });
    }

    // 갈등
    if (antagonist) {
      synopsis += `그러나 ${antagonist.name}이(가) 앞을 가로막는다. ${antagonist.description}\n\n`;
    }

    // 동료
    if (supporters.length > 0) {
      const names = supporters.map(s => s.name).join(', ');
      synopsis += `${names}과(와) 함께 역경을 헤쳐나가며, `;
    }

    // 결말
    synopsis += protagonist ?
      `${protagonist.name}은(는) 자신의 운명을 마주하게 된다.` :
      '이야기는 새로운 전개를 향해 나아간다.';

    return {
      synopsis: synopsis.trim(),
      metadata: {
        wordCount: synopsis.length,
        genre: '판타지',
        tone: '자동 생성',
        generatedAt: new Date().toISOString()
      },
      title: '자동 생성 시놉시스',
      source: 'default'
    };
  },

  /**
   * 로딩 시뮬레이션
   */
  simulateLoading(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * 배열 동등 비교
   */
  arraysEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  },

  /**
   * 시놉시스 품질 점수 계산 (Mock)
   */
  calculateQualityScore(synopsis, characters, events) {
    let score = 50; // 기본 점수

    // 캐릭터 수에 따른 점수
    if (characters.length >= 2) score += 10;
    if (characters.length >= 4) score += 10;

    // 이벤트 수에 따른 점수
    if (events.length >= 2) score += 10;
    if (events.length >= 4) score += 10;

    // 주인공/적대자 포함 여부
    if (characters.some(c => c.role === '주인공')) score += 5;
    if (characters.some(c => c.role === '적대자')) score += 5;

    return Math.min(100, score);
  },

  // ============================================================
  // 확장 시놉시스 생성 (2000자 이상, 부(Part) 단위)
  // ============================================================

  /**
   * 확장 시놉시스 생성 - 부(Part) 단위로 2000자 이상 생성
   * @param {string} partType - 'intro' | 'development' | 'crisis' | 'resolution'
   * @param {number} partNumber - 부 번호 (1, 2, 3, 4...)
   * @param {string} partTitle - 부 제목 (예: "잃어버린 기억")
   * @param {Array} characterIds - 선택된 캐릭터 ID 배열
   * @param {Array} eventIds - 선택된 이벤트 ID 배열
   * @param {string} genre - 장르 (판타지, 회귀물, 빙의물, 무협, 로맨스판타지)
   */
  async generateExtended(partType, partNumber, partTitle, characterIds, eventIds, genre = '판타지') {
    // 로딩 시뮬레이션 (2초 - 더 긴 콘텐츠 생성 중)
    await this.simulateLoading(2000);

    // 데이터 로드
    const allCharacters = await dataLoader.getCharacters();
    const allEvents = await dataLoader.getEvents();
    const templateData = await dataLoader.load('synopsis_templates.json');

    const selectedChars = allCharacters.filter(c => characterIds.includes(c.id));
    const selectedEvents = allEvents.filter(e => eventIds.includes(e.id));

    // 확장 템플릿 찾기
    const extTemplate = templateData.extendedTemplates?.find(t => t.partType === partType);
    if (!extTemplate) {
      // 폴백: 기본 생성
      return this.generateDefaultSynopsis(allCharacters, allEvents, characterIds, eventIds);
    }

    // 확장 변수 맵 구축
    const variables = this.buildExtendedVariables(
      selectedChars,
      selectedEvents,
      partType,
      partNumber,
      partTitle,
      genre,
      templateData.genreVocabulary
    );

    // HTML 시놉시스 생성
    const htmlContent = this.buildExtendedHtml(extTemplate, variables, partNumber, partTitle);

    return {
      synopsis: htmlContent,
      metadata: {
        wordCount: htmlContent.replace(/<[^>]*>/g, '').length,
        genre: genre,
        tone: this.getPartTone(partType),
        partType: partType,
        partNumber: partNumber,
        generatedAt: new Date().toISOString()
      },
      title: `${partNumber}부: ${partTitle}`,
      source: 'extended'
    };
  },

  /**
   * 확장 변수 맵 구축 - 30개 이상의 변수 생성
   */
  buildExtendedVariables(characters, events, partType, partNumber, partTitle, genre, genreVocab) {
    const protagonist = characters.find(c => c.role === '주인공');
    const antagonist = characters.find(c => c.role === '적대자');
    const supporters = characters.filter(c => c.role === '조연');
    const ally1 = supporters[0];
    const ally2 = supporters[1];
    const mentor = supporters.find(c => c.description?.includes('스승') || c.description?.includes('가르침')) || ally1;

    // 이벤트 시간순 정렬
    const sortedEvents = events.slice().sort((a, b) => {
      const yearA = parseInt(a.year?.match(/\d+/)?.[0] || 0);
      const yearB = parseInt(b.year?.match(/\d+/)?.[0] || 0);
      return yearA - yearB;
    });
    const firstEvent = sortedEvents[0];
    const midEvent = sortedEvents[Math.floor(sortedEvents.length / 2)];
    const lastEvent = sortedEvents[sortedEvents.length - 1];

    // 장르별 표현 가져오기
    const vocab = genreVocab?.[genre] || genreVocab?.['판타지'] || {};
    const powerTerm = vocab.power?.[Math.floor(Math.random() * vocab.power?.length)] || '힘';
    const awakeningTerm = vocab.awakening?.[Math.floor(Math.random() * vocab.awakening?.length)] || '각성';
    const conflictTerm = vocab.conflict?.[Math.floor(Math.random() * vocab.conflict?.length)] || '위협';

    // 장 번호 계산
    const chapterStart = this.PART_CHAPTER_START[partType] || 1;

    return {
      // 기본 정보
      part_number: partNumber,
      part_title: partTitle,
      chapter_number: chapterStart,
      chapter_number_2: chapterStart + 1,
      chapter_number_3: chapterStart + 2,

      // 주인공 관련 (10개+)
      protagonist: protagonist?.name || '주인공',
      protagonist_alias: protagonist?.alias || '운명에 선택받은 자',
      protagonist_description: protagonist?.description || '특별한 운명을 타고난 인물.',
      protagonist_personality_detail: this.extractPersonalityDetail(protagonist),
      protagonist_origin: protagonist?.affiliation || '작은 마을',
      protagonist_initial_state: this.getInitialState(protagonist, partType),
      protagonist_inner_conflict: '말로 표현할 수 없는 공허함이',
      protagonist_secret: '아무도 모르는 비밀을 품고 있었다.',
      protagonist_determination: '이번에는 반드시 해내겠다고 다짐했다.',
      protagonist_skill: protagonist?.skills?.[0]?.name || '특별한 능력',
      protagonist_awakening: '숨겨진 힘이 깨어났다',
      protagonist_state: '긴장된 표정으로 앞을 응시했다',
      protagonist_final_state: '모든 것을 건 각오로',
      protagonist_battle_cry: '여기서 끝낸다!',
      protagonist_climax_action: '마지막 일격을 날렸다',
      protagonist_final_power: '진정한 힘',
      protagonist_final_role: '새로운 시대의 주인공',
      protagonist_reflection: '지나온 날들을 돌아보았다',
      protagonist_state_after_crisis: '깊은 상처를 입었지만 포기하지 않았다',
      protagonist_realization: '모든 것이 달라 보였다',
      protagonist_reaction: '하지만 {{protagonist}}은(는) 무너지지 않았다',

      // 적대자 관련 (5개+)
      antagonist: antagonist?.name || '어둠의 존재',
      antagonist_alias: antagonist?.alias || '그림자의 군주',
      antagonist_description: antagonist?.description || '강대한 힘을 가진 적.',
      antagonist_first_mention: '그가 바로 모든 비극의 원흉이었다.',
      antagonist_greeting: '비웃듯 말했다',
      antagonist_quote: '드디어 왔군. 기다리고 있었다.',
      antagonist_activity: '암흑 제국은 착착 전쟁 준비를 진행하고 있었다.',
      antagonist_minion: '적의 부하',

      // 동료/조력자 관련 (10개+)
      ally_1: ally1?.name || '첫 번째 동료',
      ally_1_description: ally1?.description || '믿음직한 동료.',
      ally_1_skill: ally1?.skills?.[0]?.name || '특별한 기술',
      ally_2: ally2?.name || '두 번째 동료',
      ally_2_description: ally2?.description || '새롭게 합류한 동료.',
      ally_2_skill: ally2?.skills?.[0]?.name || '독특한 능력',
      ally_2_meeting: '예상치 못한 만남',
      ally_2_first_impression: '흥미로운 눈으로 바라보았다',
      ally_2_quote: '함께 싸우겠어.',
      allies_list: supporters.map(s => s.name).join(', ') || '동료들',
      allies_state: '동료들도 각자의 결의를 다지고 있었다.',
      allies_endings: '동료들도 각자의 길을 찾아 나섰다.',
      ally_support: '동료들의 지원이 이어졌다.',
      ally_support_moment: '\"함께라면 할 수 있어.\"',
      allies_contribution: '동료들의 합공이 빛을 발했다.',
      mentor: mentor?.name || '스승',
      mentor_description: mentor?.description || '지혜로운 조력자.',
      mentor_quote: '너에게는 특별한 재능이 있다.',

      // 세계관/배경 관련 (8개+)
      world_name: this.inferWorldName(protagonist, events) || '이 세계',
      world_description: '수많은 왕국과 세력이 얽혀 있는 대륙.',
      time_setting: firstEvent?.year || '그 시절',
      time_skip: '며칠이 지났다.',
      current_location: firstEvent?.relatedPlaces?.[0] || '새로운 장소',
      location_description: '신비로운 기운이 감도는 곳이었다.',
      crisis_location: lastEvent?.relatedPlaces?.[0] || '최후의 전장',
      crisis_location_description: '운명의 결전이 펼쳐질 장소.',
      first_destination: '새로운 목적지',
      final_location: '최종 결전장',

      // 이벤트/사건 관련 (15개+)
      inciting_event_title: firstEvent?.title || '운명의 사건',
      inciting_event_description: firstEvent?.description || '모든 것을 바꾼 사건이 일어났다.',
      mid_conflict_event: midEvent?.title || '중간 위기',
      climax_event: lastEvent?.title || '최종 결전',
      climax_description: '모든 것이 이 순간에 달려있었다.',
      disaster_hint: conflictTerm,
      revelation: '숨겨진 진실이 밝혀졌다.',
      bonding_event: midEvent?.title || '함께한 시간',
      betrayal_or_twist: '예상치 못한 반전',
      twist_description: '모든 것이 뒤집혔다.',
      twist_character: antagonist?.name || '그',
      twist_explanation: '침묵으로 대답했다',
      crisis_setup: '긴장감이 고조되었다.',
      crisis_reveal: '충격적인 진실이었다.',
      final_battle_event: '최후의 결전',
      final_battle_description: '치열한 싸움이 펼쳐졌다.',

      // 행동/묘사 관련 (10개+)
      daily_routine: '평범한 일상',
      public_perception: '평범한 사람',
      first_action: '첫 발을 내딛었다.',
      journey_description: '험난한 여정이 시작되었다.',
      training_hint: '혹독한 수련이 기다리고 있었다.',
      training_description: '피나는 훈련의 나날이 계속되었다.',
      meeting_circumstance: '우연한 만남',
      initial_friction: '서로를 경계했지만',
      conflict_description: '위기가 닥쳤다.',
      battle_description: '치열한 전투가 벌어졌다.',
      battle_result: '간신히 승리했다.',
      confrontation_description: '두 사람의 시선이 부딪혔다.',
      victory_moment: '마침내 승리의 순간이 왔다.',
      victory_emotion: '복잡한 감정이 밀려왔다',
      cliffhanger: '하지만 이것이 끝이 아니었다...',

      // 기타
      previous_part_summary: '지난 이야기에서 많은 일이 있었다.',
      ominous_hint: '불길한 예감이 스쳐 지나갔다.',
      new_era_description: '새로운 시대가 열렸다.',
      time_after_victory: '전쟁이 끝난 후',
      final_enemy: antagonist?.name || '최후의 적',
      final_preparation: '마지막 준비를 마쳤다',
      final_determination: '마지막까지 포기하지 않겠다.',
      aftermath_description: '전투의 여파가 가라앉았다.',
      remaining_conflict: '하지만 모든 것이 해결된 것은 아니었다.',
      twist_reveal: '숨겨진 적이 모습을 드러냈다',
      resolution_begins: '마지막 싸움이 시작되었다.',
      reflection_moment: '지난 여정을 떠올렸다',
      preparation_description: '각자 결의를 다졌다.',
      epilogue_hint: '새로운 모험의 씨앗이 뿌려지고 있었다.',
      final_scene_description: '평화로운 풍경이 펼쳐졌다.'
    };
  },

  /**
   * 확장 HTML 시놉시스 빌드
   */
  buildExtendedHtml(template, variables, partNumber, partTitle) {
    let html = `<h1>${partNumber}부: ${partTitle}</h1>\n\n`;

    const sectionOrder = ['prologue', 'chapter1', 'chapter2', 'chapter3'];

    for (const sectionKey of sectionOrder) {
      const section = template.sections[sectionKey];
      if (!section) continue;

      // 제목 처리
      let sectionTitle = section.title;
      sectionTitle = this.replaceVariables(sectionTitle, variables);

      // 기본 제목 폴백
      if (sectionTitle.includes('{{')) {
        const defaultTitle = template.defaultTitles?.[`${sectionKey}_title`] || sectionKey;
        sectionTitle = sectionTitle.replace(/\{\{[^}]+\}\}/g, defaultTitle);
      }

      html += `<h2>${sectionTitle}</h2>\n`;

      // 본문 - 변형 중 랜덤 선택
      const variations = section.variations || [];
      const selectedVariation = variations[Math.floor(Math.random() * variations.length)] || '';

      let content = this.replaceVariables(selectedVariation, variables);

      // 남은 변수들 폴백 처리
      content = content.replace(/\{\{[^}]+\}\}/g, '');

      // 섹션별 추가 내용으로 길이 보강
      content = this.enrichSectionContent(content, sectionKey, variables);

      html += `<p>${content}</p>\n\n`;
    }

    return html.trim();
  },

  /**
   * 섹션 내용 보강 - 2000자 달성을 위한 추가 내용 생성
   */
  enrichSectionContent(content, sectionKey, variables) {
    const enrichments = {
      prologue: [
        `\n\n${variables.world_name}의 사람들은 평화로운 시대가 영원히 계속되리라 믿었다. 아이들은 거리에서 뛰놀고, 상인들은 북적이는 시장에서 물건을 팔았다. 농부들은 풍년을 기대하며 씨를 뿌렸고, 학자들은 도서관에서 고서를 연구했다. 그 누구도 다가올 재앙의 그림자를 눈치채지 못했다.`,
        `\n\n하지만 현자들 사이에서는 불안한 속삭임이 퍼지고 있었다. 오래된 예언서에 기록된 징조들이 하나둘씩 나타나기 시작했기 때문이다. 밤하늘의 별자리가 미묘하게 변하고, 숲 속의 동물들이 이상하게 행동했다. 무언가 거대한 변화가 다가오고 있었다.`
      ],
      chapter1: [
        `\n\n마을 사람들 사이에서 ${variables.protagonist}은(는) 조용하지만 성실한 젊은이로 알려져 있었다. 매일 똑같은 시간에 일어나 일을 시작하고, 해가 지면 집으로 돌아가는 규칙적인 생활. 하지만 밤이면 악몽에 시달렸다. 불타는 성, 비명을 지르는 사람들, 그리고 자신을 애타게 부르는 목소리. 꿈에서 깰 때마다 베개는 눈물로 젖어 있었지만, 정작 무슨 꿈이었는지는 기억나지 않았다.`,
        `\n\n${variables.protagonist}의 마음 한켠에는 설명할 수 없는 공허함이 자리하고 있었다. 마치 중요한 무언가를 잊어버린 것 같은 느낌. 가끔 먼 산을 바라보며 이유 없는 그리움에 젖곤 했다. 그것이 무엇인지, 왜 그런 감정이 드는지 알 수 없었지만, 언젠가 그 답을 찾게 되리라는 막연한 확신이 있었다.`
      ],
      chapter2: [
        `\n\n세상이 빙글빙글 도는 것 같았다. 지금까지 믿어왔던 모든 것이 무너지는 소리가 들리는 것 같았다. ${variables.protagonist}은(는) 무릎이 꺾이는 것을 가까스로 참아내며 ${variables.ally_1}을(를) 바라보았다. 정말인가요? 이 모든 것이 사실인가요? ${variables.ally_1}은(는) 천천히 고개를 끄덕였다.`,
        `\n\n${variables.ally_1}은(는) ${variables.protagonist}에게 시간이 많지 않다고 말했다. 적들이 이미 움직이기 시작했고, 머지않아 이곳까지 손을 뻗칠 것이라고. 선택해야 했다. 이대로 모른 척 숨어 살 것인가, 아니면 운명에 맞서 싸울 것인가. ${variables.protagonist}의 가슴 속에서 무언가가 타오르기 시작했다.`
      ],
      chapter3: [
        `\n\n새벽녘, ${variables.protagonist}은(는) 마을을 떠날 채비를 했다. 오랫동안 살아온 곳이었지만, 더 이상 이곳에 머물 수 없었다. 뒤를 돌아보면 익숙한 풍경이 새벽안개 속으로 사라지고 있었다. 언젠가 다시 돌아올 수 있을까. 아니, 지금은 그런 생각을 할 때가 아니었다.`,
        `\n\n앞으로의 여정이 험난할 것임을 ${variables.protagonist}은(는) 알고 있었다. 수많은 시련이 기다리고 있을 것이고, 어쩌면 목숨을 잃을 수도 있었다. 하지만 두렵지 않았다. 아니, 두렵지만 물러서지 않을 것이다. 이것이 자신의 운명이라면 기꺼이 받아들이리라. ${variables.protagonist}은(는) 굳은 결의로 첫 발을 내딛었다.`
      ]
    };

    const additions = enrichments[sectionKey];
    if (additions && additions.length > 0) {
      // 두 개의 추가 문단을 모두 추가
      return content + additions.join('');
    }

    return content;
  },

  /**
   * 변수 치환
   */
  replaceVariables(text, variables) {
    let result = text;
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, variables[key]);
    });
    return result;
  },

  /**
   * 성격 상세 추출
   */
  extractPersonalityDetail(character) {
    if (!character) return '강인한 의지를 가진 인물.';

    const personality = character.personality || '';
    if (personality.length > 20) {
      return personality;
    }

    return personality || '남다른 의지와 결단력을 지녔다.';
  },

  /**
   * 초기 상태 결정 (부 유형에 따라)
   */
  getInitialState(character, partType) {
    const states = {
      intro: '평범한 일상을 보내고 있었다',
      development: '새로운 도전을 시작했다',
      crisis: '결전을 앞두고 긴장하고 있었다',
      resolution: '마지막 싸움을 준비하고 있었다'
    };
    return states[partType] || states.intro;
  },

  /**
   * 세계관 이름 추론
   */
  inferWorldName(protagonist, events) {
    // 캐릭터 소속에서 추론
    if (protagonist?.affiliation) {
      const affiliation = protagonist.affiliation;
      if (affiliation.includes('왕국')) return affiliation.replace('왕국', '') + ' 대륙';
      if (affiliation.includes('제국')) return affiliation;
      return affiliation;
    }

    // 이벤트 장소에서 추론
    const places = events.flatMap(e => e.relatedPlaces || []);
    if (places.length > 0) {
      return places[0];
    }

    return '이 세계';
  },

  /**
   * 부 유형별 톤 반환
   */
  getPartTone(partType) {
    const tones = {
      intro: '도입/설정',
      development: '성장/전개',
      crisis: '긴장/위기',
      resolution: '해결/감동'
    };
    return tones[partType] || '서사적';
  }
};
