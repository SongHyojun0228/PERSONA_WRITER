-- ====================================
-- Persona Writer 샘플 데이터 생성 스크립트
-- ====================================
-- 실행 전에 YOUR_USER_ID를 실제 user_id로 변경해주세요!
-- Supabase Dashboard > Authentication > Users 에서 확인 가능합니다.

-- 또는 아래 쿼리로 현재 사용자 ID 확인:
-- SELECT auth.uid();

DO $$
DECLARE
    v_user_id UUID := 'YOUR_USER_ID'::UUID; -- ⚠️ 여기를 수정하세요!

    -- 프로젝트 IDs
    p1_id UUID; p2_id UUID; p3_id UUID; p4_id UUID; p5_id UUID;
    p6_id UUID; p7_id UUID; p8_id UUID; p9_id UUID; p10_id UUID;

    -- 페이지 IDs (settings)
    pg1_id UUID; pg2_id UUID; pg3_id UUID; pg4_id UUID; pg5_id UUID;
    pg6_id UUID; pg7_id UUID; pg8_id UUID; pg9_id UUID; pg10_id UUID;

    -- 캐릭터 IDs
    c1_1 UUID; c1_2 UUID; c1_3 UUID; -- 프로젝트 1 캐릭터들
    c2_1 UUID; c2_2 UUID; c2_3 UUID;
    c3_1 UUID; c3_2 UUID;
    c4_1 UUID; c4_2 UUID; c4_3 UUID;
    c5_1 UUID; c5_2 UUID;
    c6_1 UUID; c6_2 UUID; c6_3 UUID;
    c7_1 UUID; c7_2 UUID;
    c8_1 UUID; c8_2 UUID; c8_3 UUID;
    c9_1 UUID; c9_2 UUID;
    c10_1 UUID; c10_2 UUID; c10_3 UUID;

BEGIN
    -- ====================================
    -- 1. 로맨스 소설: "봄날의 약속"
    -- ====================================
    INSERT INTO projects (user_id, name, cover_image_url)
    VALUES (v_user_id, '봄날의 약속', 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800')
    RETURNING id INTO p1_id;

    INSERT INTO pages (project_id, title, content, type, sort_order)
    VALUES
        (p1_id, '기본 설정', '<h1>봄날의 약속 - 기본 설정</h1><p>벚꽃이 만발한 봄, 우연히 만난 두 사람의 따뜻한 사랑 이야기</p>', 'SETTINGS', 0)
        RETURNING id INTO pg1_id;

    INSERT INTO pages (project_id, title, content, type, sort_order)
    VALUES
        (p1_id, '1장. 벚꽃이 흩날리던 날',
         '<h1>1장. 벚꽃이 흩날리던 날</h1><p>4월의 첫째 주, 서울은 온통 연분홍빛으로 물들어 있었다. 여의도 윤중로를 따라 늘어선 벚나무들이 일제히 꽃망울을 터트렸고, 바람이 불 때마다 꽃잎들이 눈처럼 흩날렸다.</p><p>"아, 정말 예쁘다." 수진은 하늘을 올려다보며 감탄했다. 회사 일로 지친 마음이 벚꽃을 보는 순간 조금은 가벼워지는 것 같았다. 그녀는 천천히 벚꽃길을 걸으며 휴대폰으로 사진을 찍기 시작했다.</p><p>그때였다. 앞에서 달려오던 자전거와 부딪힐 뻔한 순간, 누군가 그녀의 팔을 잡아당겼다. "조심하세요!" 낯선 남자의 목소리였다. 수진은 놀라서 그를 쳐다봤다. 검은색 니트에 청바지를 입은 남자는 미안한 듯 미소를 지었다.</p><p>"괜찮으세요? 자전거가 너무 빨리 오는 걸 못 보신 것 같아서..." 그의 말에 수진은 얼떨결에 고개를 끄덕였다. "아, 네... 감사합니다." 어색한 침묵이 흘렀고, 남자는 머리를 긁적이며 말했다. "저도 벚꽃 사진 찍으러 왔는데, 날씨 정말 좋죠?" 수진은 그제야 웃으며 대답했다. "네, 정말 예쁘네요."</p><p>그렇게 두 사람의 인연은 벚꽃이 흩날리는 봄날에 시작되었다.</p>',
         'PAGE', 1),
        (p1_id, '2장. 다시 만난 우연',
         '<h1>2장. 다시 만난 우연</h1><p>일주일 후, 수진은 회사 근처 카페에서 커피를 주문하며 서 있었다. "아이스 아메리카노 한 잔이요." 그녀가 주문을 마치고 돌아서는 순간, 익숙한 얼굴과 마주쳤다. "어? 저번에..." 벚꽃길에서 만났던 그 남자였다.</p><p>"안녕하세요! 여기서 또 만나다니, 정말 신기하네요." 남자는 환하게 웃으며 인사했다. 수진도 반가운 마음에 미소를 지었다. "정말 우연이네요. 여기 자주 오세요?" "네, 근처에서 일해서요. 혹시 이 근처 회사 다니세요?" 그들은 자연스럽게 대화를 이어갔고, 커피를 받아 들고 같은 방향으로 걷기 시작했다.</p><p>"저는 민준이라고 해요. 이름이라도 알려드리고 싶었는데 저번엔 타이밍을 놓쳤네요." 그가 먼저 자기소개를 했다. "저는 수진이에요. 그때 정말 고마웠어요. 자전거한테 부딪힐 뻔했거든요." 민준은 손을 저으며 겸손하게 답했다. "아니에요, 당연한 거죠."</p><p>그날 이후, 두 사람은 종종 그 카페에서 마주치곤 했다. 우연이 계속되면서 자연스럽게 연락처도 주고받았고, 점심시간에 함께 식사를 하기도 했다. 수진은 민준과 함께 있을 때 마음이 편안했다. 그는 언제나 따뜻하게 웃으며 그녀의 이야기를 들어주었다.</p>',
         'PAGE', 2),
        (p1_id, '3장. 마음의 변화',
         '<h1>3장. 마음의 변화</h1><p>5월이 되자 날씨는 점점 더워졌다. 수진은 민준과의 만남이 기다려졌다. 처음에는 그저 편안한 친구라고 생각했지만, 어느 순간부터 그의 문자를 기다리는 자신을 발견했다. 퇴근 후 함께 걷는 한강변, 주말에 함께 간 영화관, 그 모든 순간이 소중하게 느껴졌다.</p><p>"수진 씨, 요즘 제 생각 많이 해요?" 어느 날 저녁, 한강공원 벤치에 앉아 있던 민준이 갑자기 물었다. 수진은 놀라서 얼굴이 빨개졌다. "어... 그게..." 말을 잇지 못하는 수진을 보며 민준은 부드럽게 웃었다. "저는 요즘 수진 씨 생각을 많이 해요. 아침에 일어나면 제일 먼저 생각나고, 자기 전에도 생각나요."</p><p>수진의 심장이 빠르게 뛰기 시작했다. 민준은 그녀의 손을 살짝 잡으며 말을 이었다. "처음에는 그냥 친구로 지내고 싶었는데, 시간이 지날수록 수진 씨가 없는 하루를 상상할 수 없게 됐어요. 저... 수진 씨를 좋아합니다." 수진은 가슴이 벅차올랐다. 그녀도 같은 마음이었다.</p><p>"저도요. 민준 씨를 좋아해요." 수진의 대답에 민준은 환하게 웃으며 그녀를 꼭 안아주었다. 한강의 야경이 그들을 축복하듯 반짝였다.</p>',
         'PAGE', 3);

    -- 캐릭터 생성
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p1_id, '김수진', '여성', '섬세하고 따뜻한, 책임감 있는', '28세 마케팅 회사 대리. 일에 지쳐있었지만 민준을 만나며 다시 설레는 마음을 찾게 된다. 벚꽃을 좋아하고 사진 찍는 것이 취미.') RETURNING id INTO c1_1;
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p1_id, '이민준', '남성', '다정하고 배려심 많은, 유머러스한', '30세 건축 설계사. 우연한 만남으로 수진에게 첫눈에 반했고, 진심을 다해 그녀에게 다가간다. 자전거 타는 것을 좋아하고 커피 애호가.') RETURNING id INTO c1_2;
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p1_id, '박지혜', '여성', '활발하고 솔직한, 낙천적인', '수진의 대학 동기이자 절친. 수진과 민준의 관계를 응원하며 조언을 아끼지 않는다. 연애 코치 역할.') RETURNING id INTO c1_3;

    -- 인물 관계
    INSERT INTO character_relationships (project_id, source_character_id, target_character_id, description)
    VALUES
        (p1_id, c1_1, c1_2, '연인. 벚꽃이 흩날리던 날 우연히 만나 사랑에 빠짐'),
        (p1_id, c1_2, c1_1, '연인. 첫눈에 반해 진심으로 다가감'),
        (p1_id, c1_1, c1_3, '대학 동기이자 절친. 연애 고민을 상담하는 사이'),
        (p1_id, c1_3, c1_1, '절친. 수진의 사랑을 응원함');

    -- 캐릭터 아크
    INSERT INTO character_arcs (character_id, milestone, description, emotional_state, sort_order)
    VALUES
        (c1_1, '벚꽃길에서의 첫 만남', '민준과 우연히 만나 자전거 사고를 피함', '놀람, 감사함', 0),
        (c1_1, '카페에서 재회', '다시 만난 기쁨과 설렘', '반가움, 설렘', 1),
        (c1_1, '사랑 고백 받음', '민준의 고백을 듣고 자신의 마음을 확인', '행복, 벅참', 2),
        (c1_2, '수진을 처음 봄', '벚꽃길에서 위기의 순간 도움', '설렘, 호기심', 0),
        (c1_2, '마음을 확신', '수진과의 만남이 거듭되며 사랑을 확신', '확신, 두근거림', 1),
        (c1_2, '용기내어 고백', '한강에서 진심을 고백함', '떨림, 기쁨', 2);

    -- 플롯 보드
    INSERT INTO plot_cards (project_id, title, content, column_name, sort_order)
    VALUES
        (p1_id, '벚꽃 축제 장면 추가', '여의도 벚꽃 축제 분위기를 더 디테일하게 묘사', 'to-do', 0),
        (p1_id, '수진의 회사 생활 묘사', '수진이 일에 지친 모습을 보여주는 장면', 'in-progress', 0),
        (p1_id, '민준의 과거 이야기', '민준이 왜 수진에게 더 끌렸는지 배경 스토리', 'to-do', 1),
        (p1_id, '고백 장면 완성', '한강 야경 배경으로 고백 장면 작성 완료', 'done', 0),
        (p1_id, '엔딩 구상', '두 사람의 미래를 암시하는 따뜻한 엔딩', 'to-do', 2);

    -- 타임라인
    INSERT INTO timeline_events (project_id, title, description, event_date, sort_order)
    VALUES
        (p1_id, '벚꽃길 첫 만남', '수진과 민준이 여의도 윤중로에서 처음 만남', '2024-04-05', 0),
        (p1_id, '카페 재회', '근처 카페에서 우연히 재회하며 연락처 교환', '2024-04-12', 1),
        (p1_id, '한강 데이트', '한강공원에서 함께 산책하며 마음 확인', '2024-05-03', 2),
        (p1_id, '사랑 고백', '민준이 수진에게 고백하고 연인 관계 시작', '2024-05-10', 3);


    -- ====================================
    -- 2. 판타지 소설: "마법사의 귀환"
    -- ====================================
    INSERT INTO projects (user_id, name, cover_image_url)
    VALUES (v_user_id, '마법사의 귀환', 'https://images.unsplash.com/photo-1518398046578-8cca57782e17?w=800')
    RETURNING id INTO p2_id;

    INSERT INTO pages (project_id, title, content, type, sort_order)
    VALUES
        (p2_id, '기본 설정', '<h1>마법사의 귀환 - 기본 설정</h1><p>천년 만에 깨어난 대마법사가 변해버린 세계에서 다시 일어서는 이야기</p>', 'SETTINGS', 0);

    INSERT INTO pages (project_id, title, content, type, sort_order)
    VALUES
        (p2_id, '프롤로그. 봉인의 끝',
         '<h1>프롤로그. 봉인의 끝</h1><p>어둠 속에서 눈을 떴다. 얼마나 잠들어 있었던 걸까. 아르카디우스는 천천히 몸을 일으켰다. 봉인의 마력이 완전히 풀린 것이 느껴졌다. 그는 주변을 둘러보았다. 한때 그가 지배하던 마법탑은 이제 폐허가 되어 있었다.</p><p>"천년... 천년이나 지났단 말인가." 그의 목소리는 쉬어 있었다. 봉인되기 전, 그는 세계 최강의 대마법사였다. 하지만 동료들의 배신으로 이곳에 갇혀 긴 잠에 빠졌다. 이제 봉인이 풀렸지만, 그의 마나는 거의 바닥났고 몸은 예전 같지 않았다.</p><p>탑의 밖으로 나오자 낯선 풍경이 펼쳐졌다. 마법이 사라진 세계. 과학이라는 새로운 힘이 세상을 지배하고 있었다. 아르카디우스는 주먹을 쥐었다. "다시 시작이군. 좋아, 이번에는 내가 원하는 대로 이 세계를 만들어가겠어."</p><p>그렇게 천년 만에 깨어난 대마법사의 귀환이 시작되었다.</p>',
         'PAGE', 1),
        (p2_id, '1장. 새로운 세계',
         '<h1>1장. 새로운 세계</h1><p>아르카디우스는 가까운 마을로 향했다. 천년 전에는 작은 농촌 마을이었던 곳이 이제는 거대한 도시로 변해 있었다. 높은 건물들, 빛나는 간판들, 쉴 새 없이 달리는 자동차들. 모든 것이 낯설었다.</p><p>"저기, 할아버지 괜찮으세요?" 한 젊은 여성이 그에게 다가왔다. 그녀는 아르카디우스의 낡은 로브를 보며 걱정스러운 표情을 지었다. "코스프레... 하시는 건가요? 아니면 노숙자...?" 아르카디우스는 어리둥절했다. 코스프레? 노숙자? 이게 무슨 말인가.</p><p>"나는 대마법사 아르카디우스다. 이 세계를 지배하던..." 그가 말을 시작하자 여성은 웃으며 말을 끊었다. "아, RPG 게임 캐릭터 컨셉이시구나! 재밌네요. 근데 정말 추워 보여요. 여기 카페 가서 따뜻한 커피라도 드릴게요." 그녀는 그를 끌고 근처 카페로 향했다.</p><p>카페에 앉은 아르카디우스는 처음 보는 기계들과 음료에 놀랐다. "이게 뭐지?" "커피예요. 마셔보세요." 그는 조심스럽게 한 모금 마셨다. "음... 쓰지만 나쁘지 않군." 여성은 미소를 지으며 자기소개를 했다. "저는 이지은이에요. 직업은 마법사... 아니 웹 개발자고요." 아르카디우스는 이 이상한 세계에 적응해야 한다는 걸 깨달았다.</p>',
         'PAGE', 2),
        (p2_id, '2장. 숨겨진 마나',
         '<h1>2장. 숨겨진 마나</h1><p>며칠 후, 아르카디우스는 지은의 도움으로 임시 거처를 마련했다. 그녀는 그를 진짜 할아버지처럼 돌봐주었다. 하지만 그는 여전히 자신의 정체를 밝히지 못했다. 누가 믿겠는가, 천년 전 대마법사라는 것을.</p><p>어느 날 밤, 그는 도시를 배회하다 이상한 기운을 느꼈다. "이것은... 마나?" 희미하지만 분명한 마법의 흔적이었다. 그는 기운을 따라 오래된 골목길로 들어갔다. 거기서 그는 검은 로브를 입은 사람들이 수상한 의식을 치르는 것을 목격했다.</p><p>"어둠의 군주여, 이 세계에 강림하소서!" 그들이 외치자 마법진이 빛을 발했다. 아르카디우스는 경악했다. "이 멍청한 것들이! 어둠의 군주를 소환하다니!" 그는 즉시 마나를 모아 마법진을 파괴했다. 하지만 그의 약해진 마나로는 부족했고, 소환이 거의 완성되려는 순간이었다.</p><p>"막아야 해!" 그가 최후의 수단으로 금지된 마법을 시전하려는 순간, 갑자기 누군가가 나타나 마법진을 완전히 파괴했다. "누구냐!" 아르카디우스가 소리쳤다. 어둠 속에서 나타난 것은 놀랍게도... 지은이었다. 그녀의 손에서 빛나는 마법이 보였다. "지은... 너도 마법사였단 말이냐?" 그녀는 쓴웃음을 지으며 답했다. "비밀이 들켰네요, 아르카디우스님. 아니, 전설의 대마법사님."</p>',
         'PAGE', 3);

    -- 캐릭터
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p2_id, '아르카디우스', '남성', '오만하지만 카리스마 있는, 강인한', '천년 전 세계 최강의 대마법사. 동료의 배신으로 봉인되었다가 깨어남. 약해진 마나를 되찾기 위해 노력 중.') RETURNING id INTO c2_1;
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p2_id, '이지은', '여성', '친절하고 영리한, 비밀스러운', '현대의 숨겨진 마법사. 웹 개발자로 위장하며 살고 있으며, 어둠의 세력을 감시하는 역할.') RETURNING id INTO c2_2;
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p2_id, '어둠의 군주', '미지', '사악하고 강력한, 냉혹한', '천년 전 아르카디우스와 대립했던 강력한 존재. 다시 이 세계에 강림하려 함.') RETURNING id INTO c2_3;

    -- 인물 관계
    INSERT INTO character_relationships (project_id, source_character_id, target_character_id, description)
    VALUES
        (p2_id, c2_1, c2_2, '스승과 제자. 지은이 아르카디우스의 마법을 배우게 됨'),
        (p2_id, c2_2, c2_1, '제자이자 조력자. 현대 세계를 안내함'),
        (p2_id, c2_1, c2_3, '숙적. 천년 전부터 대립해온 관계'),
        (p2_id, c2_3, c2_1, '복수 대상. 봉인했던 아르카디우스를 제거하려 함');

    -- 플롯 보드
    INSERT INTO plot_cards (project_id, title, content, column_name, sort_order)
    VALUES
        (p2_id, '마법 시스템 정리', '현대와 고대 마법의 차이점 설정', 'in-progress', 0),
        (p2_id, '어둠의 세력 조직도', '적 세력의 구조와 목적 구체화', 'to-do', 0),
        (p2_id, '아르카디우스 각성', '마나를 되찾는 훈련 장면', 'to-do', 1),
        (p2_id, '지은의 정체 밝힘', '지은이 마법사임을 드러내는 장면 완성', 'done', 0);

    -- 타임라인
    INSERT INTO timeline_events (project_id, title, description, event_date, sort_order)
    VALUES
        (p2_id, '봉인 해제', '아르카디우스가 천년 만에 깨어남', '2024-03-15', 0),
        (p2_id, '지은과의 만남', '현대 세계에서 지은을 만나 도움 받음', '2024-03-16', 1),
        (p2_id, '첫 전투', '어둠의 세력과 첫 충돌, 지은의 정체 발각', '2024-03-20', 2);


    -- ====================================
    -- 3. SF 소설: "별을 항해하는 자들"
    -- ====================================
    INSERT INTO projects (user_id, name, cover_image_url)
    VALUES (v_user_id, '별을 항해하는 자들', 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800')
    RETURNING id INTO p3_id;

    INSERT INTO pages (project_id, title, content, type, sort_order)
    VALUES
        (p3_id, '기본 설정', '<h1>별을 항해하는 자들 - 기본 설정</h1><p>2157년, 인류는 태양계를 넘어 별들 사이를 항해하기 시작했다</p>', 'SETTINGS', 0);

    INSERT INTO pages (project_id, title, content, type, sort_order)
    VALUES
        (p3_id, '1장. 우주선 오디세이',
         '<h1>1장. 우주선 오디세이</h1><p>서기 2157년. 인류는 드디어 태양계 밖 행성으로의 항해를 시작했다. 우주선 오디세이호는 인류 역사상 가장 먼 거리를 항해하는 임무를 맡았다. 목적지는 켄타우루스자리 알파별 근처의 프록시마 b 행성. 그곳에는 생명체의 신호가 감지되었다.</p><p>"선장님, 워프 드라이브 충전 완료입니다." 부조종사 사라 첸이 보고했다. 선장 제임스 라이트는 고개를 끄덕였다. "좋아. 모든 승무원은 워프 준비 자세를 취하라. 이번 항해는 3년이 걸릴 예정이다." 크루들은 긴장한 표정으로 각자의 자리에 앉았다.</p><p>"워프 드라이브 가동!" 제임스의 명령과 함께 우주선 전체가 진동했다. 그리고 순간, 오디세이호는 빛보다 빠른 속도로 우주를 가르기 시작했다. 창밖의 별들이 긴 선으로 늘어지며 지나갔다. 인류의 새로운 모험이 시작된 것이다.</p><p>하지만 제임스는 불안했다. 이 먼 항해 동안 무슨 일이 벌어질지 아무도 모른다. 우주는 여전히 미지의 영역이었다. "모두들, 긴장을 늦추지 마라. 우리는 인류 최초의 성간 항해자들이다." 그의 말에 크루들은 결연한 표정으로 답했다. "네, 선장님!"</p>',
         'PAGE', 1),
        (p3_id, '2장. 예상치 못한 조우',
         '<h1>2장. 예상치 못한 조우</h1><p>항해 6개월 차. 오디세이호는 순항 중이었다. 대부분의 크루들은 냉동 수면 상태였고, 교대로 깨어나 우주선을 감시했다. 오늘은 엔지니어 마크 존슨의 차례였다. 그는 커피를 마시며 레이더를 체크하고 있었다.</p><p>"응? 이게 뭐지?" 레이더에 미확인 물체가 감지되었다. 그것도 아주 빠른 속도로 접근하고 있었다. 마크는 즉시 선장을 깨웠다. "선장님! 미확인 물체 접근 중입니다!" 제임스는 재빨리 조종실로 달려갔다.</p><p>"크기는?" "우리 우주선의 두 배 정도입니다. 그리고... 이건 자연물이 아닙니다. 명백히 인공물입니다!" 마크의 보고에 제임스의 얼굴이 굳었다. "외계 우주선이란 말인가?" 창밖을 보자 거대한 은색 우주선이 보였다. 그것은 유선형의 아름다운 디자인이었고, 표면에서 푸른 빛이 흘렀다.</p><p>갑자기 통신 장치에서 소리가 들렸다. 하지만 그것은 알아들을 수 없는 언어였다. "번역기를 돌려!" 제임스가 명령했다. 잠시 후, 번역된 메시지가 나왔다. "지구의 항해자들이여, 환영한다. 우리는 안드로메다 연합이다. 오랜 시간 너희를 기다려왔다." 인류는 드디어 외계 문명과 조우한 것이다.</p>',
         'PAGE', 2);

    -- 캐릭터
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p3_id, '제임스 라이트', '남성', '냉철하고 결단력 있는, 책임감 강한', '오디세이호 선장. 45세. 인류 최초 성간 항해의 책임자로서 무거운 짐을 짊어짐.') RETURNING id INTO c3_1;
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p3_id, '사라 첸', '여성', '침착하고 분석적인, 호기심 많은', '부조종사 겸 과학자. 32세. 외계 생명체 연구 전문가로 이번 항해에 큰 기대를 걸고 있음.') RETURNING id INTO c3_2;

    -- 인물 관계
    INSERT INTO character_relationships (project_id, source_character_id, target_character_id, description)
    VALUES
        (p3_id, c3_1, c3_2, '상사와 부하. 서로를 신뢰하는 관계'),
        (p3_id, c3_2, c3_1, '부하이자 조언자. 과학적 지식으로 선장을 돕는다');

    -- 플롯 보드
    INSERT INTO plot_cards (project_id, title, content, column_name, sort_order)
    VALUES
        (p3_id, '안드로메다 연합 설정', '외계 문명의 역사와 기술 수준 구체화', 'in-progress', 0),
        (p3_id, '프록시마 b 도착', '목적지 행성의 모습과 환경 묘사', 'to-do', 0),
        (p3_id, '워프 드라이브 사고', '긴장감을 위한 기술적 위기 장면', 'to-do', 1),
        (p3_id, '외계인과의 첫 대화', '번역 장면 완성', 'done', 0);

    -- 타임라인
    INSERT INTO timeline_events (project_id, title, description, event_date, sort_order)
    VALUES
        (p3_id, '오디세이호 발진', '지구를 떠나 성간 항해 시작', '2157-06-15', 0),
        (p3_id, '외계 우주선 조우', '안드로메다 연합과 첫 접촉', '2157-12-20', 1);


    -- ====================================
    -- 4. 미스터리 소설: "붉은 달의 비밀"
    -- ====================================
    INSERT INTO projects (user_id, name, cover_image_url)
    VALUES (v_user_id, '붉은 달의 비밀', 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800')
    RETURNING id INTO p4_id;

    INSERT INTO pages (project_id, title, content, type, sort_order)
    VALUES
        (p4_id, '기본 설정', '<h1>붉은 달의 비밀 - 기본 설정</h1><p>작은 마을에서 일어난 연쇄 살인 사건의 진실을 파헤치는 형사의 이야기</p>', 'SETTINGS', 0);

    INSERT INTO pages (project_id, title, content, type, sort_order)
    VALUES
        (p4_id, '1장. 첫 번째 사건',
         '<h1>1장. 첫 번째 사건</h1><p>붉은 달이 뜬 밤, 한적한 시골 마을 청산리에서 시신이 발견되었다. 피해자는 마을에서 오랫동안 살아온 60대 노인 박철수였다. 서울에서 파견된 강력계 형사 한민우는 현장을 둘러보며 미간을 찌푸렸다.</p><p>"이상하군. 외부 침입 흔적이 없어." 현장은 지나치게 깔끔했다. 마치 누군가 의도적으로 증거를 지운 것처럼 보였다. 피해자의 집은 안에서 잠겨 있었고, 창문도 모두 닫혀 있었다. 전형적인 밀실 살인이었다.</p><p>"형사님, 이것 좀 보세요." 과학수사팀원이 침대 옆에서 붉은 천 조각을 발견했다. 한민우는 그것을 집어 들었다. "이건... 제단에서 쓰는 천이군." 그의 머릿속에 마을 입구에서 본 낡은 사당이 떠올랐다. "혹시 이 마을에 무슨 종교적인 의식이 있나?"</p><p>마을 이장은 고개를 저었다. "그런 건 없습니다. 다만... 옛날부터 전해오는 전설은 있죠. 붉은 달이 뜰 때마다 누군가 사라진다는..." 한민우는 창밖의 붉은 달을 쳐다봤다. 불길한 예감이 들었다.</p>',
         'PAGE', 1),
        (p4_id, '2장. 두 번째 희생자',
         '<h1>2장. 두 번째 희생자</h1><p>일주일 후, 또다시 붉은 달이 떴다. 그리고 예상대로, 두 번째 시신이 발견되었다. 이번 피해자는 30대 여성 최은혜였다. 그녀는 마을의 초등학교 교사였다. 사인은 첫 번째 피해자와 동일했다. 목 졸림.</p><p>한민우는 두 피해자의 공통점을 찾기 시작했다. "박철수와 최은혜... 나이도 다르고, 직업도 다르고, 접점이 없어 보이는데." 그는 마을 사람들을 하나하나 조사했다. 그러던 중 흥미로운 사실을 발견했다.</p><p>"20년 전, 이 마을에서 한 소녀가 실종되었다고?" 한민우는 오래된 신문 기사를 들고 이장에게 물었다. "네... 그때 일은 마을 사람들도 잘 모릅니다. 소녀의 가족은 모두 이사를 갔고..." 이장의 말에 한민우는 직감했다. "이 사건과 연쇄 살인이 연관되어 있어."</p><p>그날 밤, 한민우는 마을의 오래된 사당을 찾아갔다. 사당 안에는 소녀의 제단이 있었고, 벽에는 이상한 글귀가 적혀 있었다. "붉은 달이 세 번 뜨면, 잃어버린 것이 돌아온다." 그는 등골이 서늘해지는 것을 느꼈다. "세 번... 그렇다면 다음 붉은 달에 또 사건이 일어난다는 건가?"</p>',
         'PAGE', 2);

    -- 캐릭터
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p4_id, '한민우', '남성', '냉철하고 집요한, 정의감 강한', '38세 강력계 형사. 서울 본청에서 파견되어 청산리 연쇄 살인 사건을 수사 중.') RETURNING id INTO c4_1;
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p4_id, '이서연', '여성', '신중하고 관찰력 뛰어난, 공감 능력 높은', '32세 프로파일러. 한민우와 함께 사건을 수사하며 범인의 심리를 분석.') RETURNING id INTO c4_2;
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p4_id, '마을 이장', '남성', '온화하지만 비밀스러운', '65세 청산리 이장. 20년 전 사건에 대해 뭔가 숨기고 있는 듯 보임.') RETURNING id INTO c4_3;

    -- 인물 관계
    INSERT INTO character_relationships (project_id, source_character_id, target_character_id, description)
    VALUES
        (p4_id, c4_1, c4_2, '수사 파트너. 서로의 전문 분야로 협력'),
        (p4_id, c4_2, c4_1, '파트너. 민우의 직관을 프로파일링으로 뒷받침'),
        (p4_id, c4_1, c4_3, '수사관과 용의자. 민우는 이장을 의심하기 시작함');

    -- 플롯 보드
    INSERT INTO plot_cards (project_id, title, content, column_name, sort_order)
    VALUES
        (p4_id, '20년 전 사건 상세화', '실종된 소녀의 이야기를 구체적으로 풀어내기', 'in-progress', 0),
        (p4_id, '세 번째 사건 장면', '클라이맥스를 향한 긴장감 고조', 'to-do', 0),
        (p4_id, '범인의 정체 암시', '독자가 추리할 수 있는 단서 배치', 'to-do', 1),
        (p4_id, '첫 번째 사건 완성', '밀실 살인 장면 작성 완료', 'done', 0);

    -- 타임라인
    INSERT INTO timeline_events (project_id, title, description, event_date, sort_order)
    VALUES
        (p4_id, '첫 번째 살인', '박철수 노인 시신 발견', '2024-10-13', 0),
        (p4_id, '두 번째 살인', '최은혜 교사 시신 발견', '2024-10-20', 1),
        (p4_id, '20년 전 사건 발견', '실종 소녀와의 연관성 파악', '2024-10-22', 2);


    -- ====================================
    -- 5. 일상 에세이: "커피 한 잔의 여유"
    -- ====================================
    INSERT INTO projects (user_id, name, cover_image_url)
    VALUES (v_user_id, '커피 한 잔의 여유', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800')
    RETURNING id INTO p5_id;

    INSERT INTO pages (project_id, title, content, type, sort_order)
    VALUES
        (p5_id, '기본 설정', '<h1>커피 한 잔의 여유 - 기본 설정</h1><p>바쁜 일상 속에서 찾은 작은 행복과 여유에 대한 에세이</p>', 'SETTINGS', 0);

    INSERT INTO pages (project_id, title, content, type, sort_order)
    VALUES
        (p5_id, '아침의 의식',
         '<h1>아침의 의식</h1><p>알람 소리에 눈을 뜨면 제일 먼저 하는 일이 있다. 커피를 내리는 것. 어떤 사람들은 세수를 먼저 하고, 어떤 사람들은 스트레칭을 먼저 하지만, 나는 커피를 먼저 내린다. 그것이 나만의 아침 의식이다.</p><p>원두를 그라인더에 넣고 갈 때 나는 향이 좋다. 갓 갈린 원두의 고소한 냄새가 아직 덜 깬 정신을 깨운다. 에스프레소 머신에 원두를 담고, 탬핑을 하고, 버튼을 누르면 진한 커피가 천천히 떨어진다. 그 순간만큼은 아무 생각도 하지 않는다.</p><p>첫 모금을 마실 때의 그 쓰면서도 부드러운 맛. 목을 타고 내려가는 따뜻함. 이것이 나의 하루를 시작하는 방법이다. 바쁜 일상 속에서도 이 15분만큼은 온전히 나를 위한 시간이다. 커피 한 잔이 주는 여유, 그것이 나를 하루 종일 버티게 하는 힘이다.</p><p>오늘도 나는 커피를 내리며 생각한다. 오늘은 어떤 일들이 기다리고 있을까. 어떤 사람들을 만나게 될까. 하지만 걱정하지 않는다. 커피 한 잔의 여유를 가진 채로 시작하는 하루는, 어떤 일이 있어도 견딜 수 있을 것 같으니까.</p>',
         'PAGE', 1),
        (p5_id, '동네 카페의 추억',
         '<h1>동네 카페의 추억</h1><p>우리 동네에는 작은 카페 하나가 있다. 체인점이 아닌, 개인이 운영하는 카페. 간판도 소박하고, 인테리어도 화려하지 않지만, 나는 그곳을 좋아한다. 주인 할머니가 직접 로스팅한 원두로 커피를 내려주기 때문이다.</p><p>처음 그 카페에 간 건 2년 전이었다. 회사에서 힘든 일이 있던 날, 무작정 걷다가 우연히 발견했다. "어서 오세요." 할머니의 따뜻한 목소리가 나를 반겼다. "아메리카노 한 잔 주세요." 나는 구석 자리에 앉아 창밖을 바라봤다.</p><p>할머니가 내려준 커피는 특별했다. 체인점 커피와는 다른, 손맛이 느껴지는 커피였다. "힘든 일 있었어요?" 할머니가 물었다. 나는 고개를 끄덕였다. "괜찮아요. 커피 한 잔 마시면 다 좋아질 거예요." 그 말에 나도 모르게 눈물이 났다.</p><p>그 이후로 나는 그 카페의 단골이 되었다. 주말마다 찾아가 커피를 마시고, 할머니와 이런저런 이야기를 나눈다. 할머니는 늘 같은 말을 한다. "커피는 마음을 위로하는 음료예요." 맞는 말이다. 커피 한 잔이 주는 위로, 그것이 내가 이 카페를 찾는 이유다.</p>',
         'PAGE', 2);

    -- 캐릭터
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p5_id, '나', '중성', '사색적이고 감성적인', '30대 직장인. 커피를 사랑하며 바쁜 일상 속에서 작은 여유를 찾는다.') RETURNING id INTO c5_1;
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p5_id, '카페 할머니', '여성', '따뜻하고 지혜로운', '70대 카페 주인. 손님들에게 커피와 함께 위로를 건넨다.') RETURNING id INTO c5_2;

    -- 인물 관계
    INSERT INTO character_relationships (project_id, source_character_id, target_character_id, description)
    VALUES
        (p5_id, c5_1, c5_2, '단골손님과 카페 주인. 서로를 위로하는 관계');

    -- 플롯 보드
    INSERT INTO plot_cards (project_id, title, content, column_name, sort_order)
    VALUES
        (p5_id, '커피 종류별 에세이', '에스프레소, 라떼, 콜드브루 등 각각의 에세이 작성', 'to-do', 0),
        (p5_id, '계절별 커피 이야기', '봄, 여름, 가을, 겨울 각 계절의 커피', 'in-progress', 0);

    -- 타임라인
    INSERT INTO timeline_events (project_id, title, description, event_date, sort_order)
    VALUES
        (p5_id, '커피와의 첫 만남', '대학생 때 처음 카페에서 아르바이트 시작', '2015-03-01', 0),
        (p5_id, '동네 카페 발견', '힘든 날 우연히 할머니 카페 발견', '2022-11-15', 1);


    -- ====================================
    -- 6. 학원물: "수학의 정석"
    -- ====================================
    INSERT INTO projects (user_id, name, cover_image_url)
    VALUES (v_user_id, '수학의 정석', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800')
    RETURNING id INTO p6_id;

    INSERT INTO pages (project_id, title, content, type, sort_order)
    VALUES
        (p6_id, '기본 설정', '<h1>수학의 정석 - 기본 설정</h1><p>수학을 포기했던 고등학생이 천재 수학 교사를 만나 성장하는 이야기</p>', 'SETTINGS', 0);

    INSERT INTO pages (project_id, title, content, type, sort_order)
    VALUES
        (p6_id, '1장. 수포자의 일상',
         '<h1>1장. 수포자의 일상</h1><p>"야, 강민준! 너 수학 몇 점 받았냐?" 친구의 물음에 민준은 시험지를 책상 서랍에 구겨 넣었다. 25점. 또 수학에서 낙제점을 받았다. 고등학교 2학년인데, 수학은 중학교 1학년 수준도 못 따라간다.</p><p>"수학은 진짜 왜 배우는지 모르겠어. 살면서 미적분을 어디다 쓰냐고." 민준은 투덜거렸다. 하지만 마음 한편으로는 불안했다. 수능이 1년 반밖에 안 남았는데, 이대로는 대학도 못 갈 것 같았다.</p><p>그날 방과 후, 담임 선생님이 민준을 불렀다. "민준아, 너 수학 성적 이대로 괜찮겠니?" 민준은 고개를 숙였다. "이번 학기부터 새로 오신 수학 선생님이 계셔. 방과 후에 특별 수업을 한대. 너도 한번 들어볼래?"</p><p>민준은 내키지 않았지만 거절할 수도 없었다. "네..." 그렇게 그는 전설의 수학 교사, 박지훈 선생님을 만나게 되었다.</p>',
         'PAGE', 1),
        (p6_id, '2장. 천재 교사의 등장',
         '<h1>2장. 천재 교사의 등장</h1><p>방과 후 교실. 민준을 포함한 수포자 5명이 모여 있었다. 모두들 시큰둥한 표정이었다. "또 지루한 수업이겠지..." 민준이 하품을 하려는 순간, 교실 문이 열렸다.</p><p>"안녕하세요. 저는 박지훈입니다." 30대 초반으로 보이는 젊은 선생님이 들어왔다. 그는 칠판에 간단한 문제 하나를 적었다. "1 + 1은?" 학생들은 어이없어했다. "2요." 누군가 대답했다.</p><p>"맞아요. 그런데 왜 2일까요?" 박지훈의 질문에 학생들은 멍했다. "왜냐고요? 당연한 거 아닌가요?" "당연한 건 없어요. 모든 것엔 이유가 있죠." 그는 칠판에 사과 그림을 그렸다. "사과 하나에 사과 하나를 더하면 사과 두 개. 이게 덧셈의 시작이에요."</p><p>민준은 처음으로 수학 수업에 집중했다. 박지훈은 복잡한 공식 대신, 왜 그런 공식이 만들어졌는지를 설명했다. "수학은 암기가 아니에요. 이해하는 거죠." 수업이 끝나고, 민준은 생각했다. "어... 수학이 이렇게 재밌는 거였어?"</p>',
         'PAGE', 2);

    -- 캐릭터
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p6_id, '강민준', '남성', '포기를 잘하지만 순수한, 호기심 많은', '고2 학생. 수포자였지만 박지훈을 만나며 수학에 흥미를 느끼기 시작.') RETURNING id INTO c6_1;
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p6_id, '박지훈', '남성', '열정적이고 창의적인, 인내심 강한', '32세 수학 교사. 수학의 본질을 가르치는 천재 교사로 학생들의 멘토.') RETURNING id INTO c6_2;
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p6_id, '최서윤', '여성', '성실하고 경쟁심 강한', '고2 학생. 전교 1등이지만 민준이 성장하는 모습을 보며 자극받음.') RETURNING id INTO c6_3;

    -- 인물 관계
    INSERT INTO character_relationships (project_id, source_character_id, target_character_id, description)
    VALUES
        (p6_id, c6_1, c6_2, '제자와 스승. 민준이 박지훈을 존경하고 따름'),
        (p6_id, c6_2, c6_1, '스승. 민준의 잠재력을 믿고 이끌어줌'),
        (p6_id, c6_1, c6_3, '라이벌이자 친구. 서로 자극하며 성장');

    -- 플롯 보드
    INSERT INTO plot_cards (project_id, title, content, column_name, sort_order)
    VALUES
        (p6_id, '첫 시험 도전', '민준이 처음으로 60점 넘기는 장면', 'in-progress', 0),
        (p6_id, '수학 대회 출전', '학교 대표로 수학 경시대회 나가기', 'to-do', 0),
        (p6_id, '수포자 탈출 완료', '민준이 수학의 재미를 깨달은 장면', 'done', 0);

    -- 타임라인
    INSERT INTO timeline_events (project_id, title, description, event_date, sort_order)
    VALUES
        (p6_id, '수학 25점', '민준이 또 낙제점 받음', '2024-03-15', 0),
        (p6_id, '박지훈 만남', '특별 수업에서 천재 교사를 만남', '2024-03-18', 1),
        (p6_id, '첫 60점', '민준이 처음으로 평균 넘김', '2024-05-20', 2);


    -- ====================================
    -- 7. 역사 소설: "조선의 검"
    -- ====================================
    INSERT INTO projects (user_id, name, cover_image_url)
    VALUES (v_user_id, '조선의 검', 'https://images.unsplash.com/photo-1583393138805-7281e3544949?w=800')
    RETURNING id INTO p7_id;

    INSERT INTO pages (project_id, title, content, type, sort_order)
    VALUES
        (p7_id, '기본 설정', '<h1>조선의 검 - 기본 설정</h1><p>조선 중기, 임진왜란 직전의 혼란한 시대를 살아가는 의적의 이야기</p>', 'SETTINGS', 0);

    INSERT INTO pages (project_id, title, content, type, sort_order)
    VALUES
        (p7_id, '1장. 한양의 밤',
         '<h1>1장. 한양의 밤</h1><p>선조 25년(1592년), 임진왜란이 일어나기 직전의 조선. 한양은 표면적으로는 평화로웠지만, 내부는 당파 싸움으로 썩어가고 있었다. 권력자들은 백성들을 착취했고, 가난한 이들은 하루하루 연명하기도 힘들었다.</p><p>깊은 밤, 한양 도성의 한 대저택에 검은 그림자가 나타났다. "호위무사들이 이렇게 허술하다니, 실망이군." 그림자의 주인공은 20대 후반의 젊은 남자였다. 그는 담을 넘어 금고가 있는 방으로 향했다.</p><p>"누구냐!" 호위무사가 소리쳤지만 이미 늦었다. 남자의 검이 빛처럼 움직였고, 무사들은 기절했다. 그는 금고를 열어 은자를 꺼냈다. "이 돈은 원래 백성들의 것. 돌려받는 것뿐이야." 그가 중얼거리며 창밖으로 뛰어내렸다.</p><p>다음 날 아침, 한양은 떠들썩했다. "의적 일검(一劍)이 또 나타났다!" 백성들은 환호했지만, 권력자들은 이를 갈았다. 일검, 그는 조선 최고의 의적이자, 관아가 가장 잡고 싶어하는 도적이었다.</p>',
         'PAGE', 1),
        (p7_id, '2장. 숙명의 만남',
         '<h1>2장. 숙명의 만남</h1><p>일검의 본명은 김정호였다. 어릴 적 탐관오리에게 가족을 잃고, 홀로 검술을 익혀 의적이 되었다. 그는 훔친 재물을 가난한 백성들에게 나눠주며 살아왔다.</p><p>어느 날, 정호는 남대문 시장에서 한 여인을 만났다. "조심하세요!" 그녀가 외쳤지만, 말이 끄는 수레가 그를 향해 달려왔다. 정호는 재빠르게 피했지만, 그 바람에 여인과 부딪혔다. "괜찮으세요?" 정호가 물었다.</p><p>"네... 감사합니다." 여인은 고개를 들었고, 정호는 그 순간 숨이 멎는 것 같았다. 아름다운 얼굴에 강인한 눈빛. "저는 이서연이라고 합니다." 그녀가 자기소개를 했다. 정호는 그녀가 범상치 않은 사람임을 직감했다.</p><p>그날 밤, 정호는 또 다른 대저택을 노렸다. 그런데 그곳에서 뜻밖의 사람을 만났다. "당신은...!" 바로 낮에 만났던 서연이었다. 그녀도 검을 들고 있었다. "의적 일검이시군요. 전 포도청 여포교(女捕校)입니다. 체포하겠습니다." 두 사람의 숙명적인 대결이 시작되었다.</p>',
         'PAGE', 2);

    -- 캐릭터
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p7_id, '김정호 (일검)', '남성', '정의롭고 과묵한, 검술 천재', '28세 의적. 가족을 잃고 백성을 위해 권력자들을 상대로 싸운다.') RETURNING id INTO c7_1;
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p7_id, '이서연', '여성', '강인하고 원칙적인, 정의로운', '25세 포도청 여포교. 법을 지키려 하지만 백성의 고통도 이해한다.') RETURNING id INTO c7_2;

    -- 인물 관계
    INSERT INTO character_relationships (project_id, source_character_id, target_character_id, description)
    VALUES
        (p7_id, c7_1, c7_2, '적이자 사랑. 서로 다른 길을 걷지만 서로에게 끌림'),
        (p7_id, c7_2, c7_1, '체포 대상이지만 존경함. 복잡한 감정');

    -- 플롯 보드
    INSERT INTO plot_cards (project_id, title, content, column_name, sort_order)
    VALUES
        (p7_id, '임진왜란 발발', '전쟁이 시작되며 두 사람의 선택', 'to-do', 0),
        (p7_id, '첫 대결 장면', '지붕 위 추격전 작성', 'in-progress', 0),
        (p7_id, '시장 만남 완성', '두 사람의 첫 만남 장면', 'done', 0);

    -- 타임라인
    INSERT INTO timeline_events (project_id, title, description, event_date, sort_order)
    VALUES
        (p7_id, '의적 활동 시작', '정호가 일검으로 활동 시작', '1590-01-01', 0),
        (p7_id, '서연과 만남', '시장에서 우연히 만남', '1592-03-10', 1),
        (p7_id, '첫 대결', '저택에서 검을 맞댐', '1592-03-11', 2);


    -- ====================================
    -- 8. 공포 소설: "13호실의 저주"
    -- ====================================
    INSERT INTO projects (user_id, name, cover_image_url)
    VALUES (v_user_id, '13호실의 저주', 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800')
    RETURNING id INTO p8_id;

    INSERT INTO pages (project_id, title, content, type, sort_order)
    VALUES
        (p8_id, '기본 설정', '<h1>13호실의 저주 - 기본 설정</h1><p>오래된 여관의 13호실에 얽힌 괴담과 그 진실을 파헤치는 이야기</p>', 'SETTINGS', 0);

    INSERT INTO pages (project_id, title, content, type, sort_order)
    VALUES
        (p8_id, '1장. 여관 도착',
         '<h1>1장. 여관 도착</h1><p>깊은 산속에 자리한 낡은 여관. 대학생 MT를 온 우리는 이곳밖에 예약할 곳이 없었다. "여기... 진짜 괜찮은 거야?" 친구 민수가 불안한 목소리로 물었다. 여관은 낡고 으스스했다.</p><p>"어서 오세요." 여관 주인은 60대 정도 되어 보이는 할머니였다. 그녀는 창백한 얼굴로 우리를 맞이했다. "방은 12호실까지 있습니다. 13호실은... 절대 들어가지 마세요." 할머니의 경고에 우리는 서로를 쳐다봤다.</p><p>"왜요?" 내가 물었다. 할머니는 고개를 저었다. "20년 전, 그 방에서 끔찍한 일이 있었어요. 그 이후로 그 방에 들어간 사람은... 모두..." 할머니는 말을 잇지 못했다. 우리는 등골이 서늘해지는 것을 느꼈다.</p><p>그날 밤, 복도 끝의 13호실 문에서 이상한 소리가 들렸다. 쿵... 쿵... 마치 누군가 문을 두드리는 것 같았다. "너희도 들었어?" 민수가 떨리는 목소리로 물었다. 우리는 고개를 끄덕였다. 호기심과 두려움 사이에서 우리는 결정을 내려야 했다. 13호실의 비밀을 밝혀낼 것인가, 아니면 모른 척 할 것인가.</p>',
         'PAGE', 1),
        (p8_id, '2장. 금기를 어기다',
         '<h1>2장. 금기를 어기다</h1><p>결국 우리는 13호실을 조사하기로 했다. 할머니가 잠든 깊은 밤, 우리는 손전등을 들고 복도를 걸었다. 13호실 앞에 서자 차가운 기운이 느껴졌다. "진짜 들어갈 거야?" 민수가 물었다.</p><p>"여기까지 왔는데 포기할 순 없지." 나는 문손잡이를 잡았다. 놀랍게도 문은 잠기지 않았다. 끼익... 문이 열리며 오래된 먼지 냄새가 코를 찔렀다. 방 안은 완전히 비어 있었다. 가구도 없고, 창문도 막혀 있었다.</p><p>"별거 없잖아." 민수가 안도의 한숨을 쉬었다. 그때였다. 갑자기 문이 쾅 하고 닫혔다. "뭐야!" 우리는 놀라서 문으로 달려갔지만 문은 꿈쩍도 하지 않았다. 손전등이 깜빡이기 시작했고, 방 안 온도가 급격히 떨어졌다.</p><p>어둠 속에서 무언가가 움직이는 소리가 들렸다. "누, 누구세요?" 내가 떨리는 목소리로 물었다. 그때 창문에 비친 그림자가 보였다. 길게 늘어진 머리카락, 하얀 옷을 입은 여자의 형상. 그녀가 천천히 우리를 향해 다가왔다. "나가... 나가..." 귀에서 속삭이는 목소리가 들렸다. 우리는 비명을 지르며 문을 두들겼다.</p>',
         'PAGE', 2);

    -- 캐릭터
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p8_id, '나 (주인공)', '중성', '호기심 많고 대담한', '대학생. 괴담을 믿지 않지만 13호실의 비밀을 파헤치다 위험에 처함.') RETURNING id INTO c8_1;
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p8_id, '민수', '남성', '소심하지만 의리 있는', '주인공의 친구. 겁이 많지만 친구를 위해 함께 13호실에 들어감.') RETURNING id INTO c8_2;
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p8_id, '13호실의 유령', '여성', '슬프고 원한 가득한', '20년 전 억울하게 죽은 여성의 유령. 진실을 밝혀주길 원함.') RETURNING id INTO c8_3;

    -- 인물 관계
    INSERT INTO character_relationships (project_id, source_character_id, target_character_id, description)
    VALUES
        (p8_id, c8_1, c8_2, '절친. 함께 공포를 겪으며 더 가까워짐'),
        (p8_id, c8_1, c8_3, '유령과 조우. 처음엔 두려웠지만 그녀의 사연을 알게 됨');

    -- 플롯 보드
    INSERT INTO plot_cards (project_id, title, content, column_name, sort_order)
    VALUES
        (p8_id, '20년 전 사건 진실', '유령의 억울한 죽음 배경 스토리', 'in-progress', 0),
        (p8_id, '탈출 장면', '13호실에서 빠져나오는 긴박한 장면', 'to-do', 0),
        (p8_id, '유령과의 대화', '진실을 밝히는 중요한 장면', 'to-do', 1),
        (p8_id, '13호실 침입 완성', '문이 잠기는 장면까지 작성', 'done', 0);

    -- 타임라인
    INSERT INTO timeline_events (project_id, title, description, event_date, sort_order)
    VALUES
        (p8_id, '여관 도착', 'MT를 위해 산속 여관에 도착', '2024-11-01', 0),
        (p8_id, '13호실 침입', '호기심에 금기를 어기고 방에 들어감', '2024-11-01', 1),
        (p8_id, '유령 조우', '13호실의 유령과 첫 만남', '2024-11-01', 2);


    -- ====================================
    -- 9. 코미디: "회사는 전쟁터"
    -- ====================================
    INSERT INTO projects (user_id, name, cover_image_url)
    VALUES (v_user_id, '회사는 전쟁터', 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800')
    RETURNING id INTO p9_id;

    INSERT INTO pages (project_id, title, content, type, sort_order)
    VALUES
        (p9_id, '기본 설정', '<h1>회사는 전쟁터 - 기본 설정</h1><p>신입사원의 좌충우돌 회사 적응기를 유쾌하게 그린 코미디</p>', 'SETTINGS', 0);

    INSERT INTO pages (project_id, title, content, type, sort_order)
    VALUES
        (p9_id, '1화. 첫 출근',
         '<h1>1화. 첫 출근</h1><p>"오늘부터 사회인이다!" 나는 거울 앞에서 넥타이를 매며 다짐했다. 첫 출근 날. 설레는 마음으로 회사에 도착했는데... "어? 문이 안 열리네?" 회사 정문이 잠겨 있었다. 시계를 보니 7시 30분. "아... 9시 출근인데 너무 일찍 왔구나."</p><p>1시간 반을 카페에서 보내고 다시 회사로 갔다. 이번엔 문이 열렸다. "안녕하세요!" 나는 밝게 인사했다. 그런데 아무도 대답이 없다. 사무실은 텅 비어 있었다. "어? 오늘 무슨 날인가?" 캘린더를 확인했지만 평일이었다.</p><p>그때 한 직원이 들어왔다. "아, 신입사원이구나. 다들 9시 30분쯤 와. 9시 출근은 명목상이야." "네...?" 나는 충격을 받았다. 이게 바로 회사 문화라는 건가. "그럼 저도..." "너는 신입이니까 9시에 와. 그게 룰이야." "네?!"</p><p>그렇게 나의 회사 생활은 혼란스럽게 시작되었다. 이건 전쟁터가 맞았다.</p>',
         'PAGE', 1),
        (p9_id, '2화. 점심시간의 전투',
         '<h1>2화. 점심시간의 전투</h1><p>드디어 점심시간. "뭐 먹을까?" 신나게 메뉴를 고르고 있는데 팀장님이 다가왔다. "신입, 우리 팀 점심 회식이야. 가자." "네?! 갑자기요?" "회사에서 갑자기는 일상이야."</p><p>팀원들과 함께 고깃집에 갔다. "신입, 고기 구워봐." "네!" 나는 열심히 고기를 구웠다. 그런데 선배가 핀잔을 주었다. "야, 고기를 왜 그렇게 구워. 불판 위에 그냥 올려놔야지." "아... 죄송합니다."</p><p>다시 고기를 올렸다. 이번엔 다른 선배가 말했다. "고기를 뒤집어야지! 타잖아!" "네!" 나는 재빨리 뒤집었다. 그러자 또 다른 선배가... "고기는 한 번만 뒤집는 거야. 너무 자주 뒤집으면 육즙이 빠져." "죄송합니다..."</p><p>결국 나는 고기를 먹지도 못하고 구우면서 땀만 뻘뻘 흘렸다. "신입, 고생했어. 다음엔 네가 먹어." 팀장님의 위로에 나는 눈물이 날 뻔했다. 점심시간도 전투였다.</p>',
         'PAGE', 2);

    -- 캐릭터
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p9_id, '나 (신입)', '중성', '순진하고 열정적인, 어리숙한', '신입사원. 회사 문화에 적응하려 노력하지만 매번 실수를 저지른다.') RETURNING id INTO c9_1;
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p9_id, '팀장님', '남성', '무뚝뚝하지만 따뜻한', '40대 팀장. 겉으론 엄하지만 속으론 신입을 챙긴다.') RETURNING id INTO c9_2;

    -- 인물 관계
    INSERT INTO character_relationships (project_id, source_character_id, target_character_id, description)
    VALUES
        (p9_id, c9_1, c9_2, '상사와 부하. 팀장은 신입의 성장을 지켜본다');

    -- 플롯 보드
    INSERT INTO plot_cards (project_id, title, content, column_name, sort_order)
    VALUES
        (p9_id, '회식 2차 에피소드', '노래방에서 벌어지는 코미디', 'to-do', 0),
        (p9_id, '프로젝트 발표 실수', '중요한 발표에서 삽질하는 장면', 'in-progress', 0);

    -- 타임라인
    INSERT INTO timeline_events (project_id, title, description, event_date, sort_order)
    VALUES
        (p9_id, '입사', '첫 출근 날 좌충우돌', '2024-01-02', 0),
        (p9_id, '첫 회식', '점심 회식에서 고기 굽는 전투', '2024-01-03', 1);


    -- ====================================
    -- 10. 드라마: "엄마의 노래"
    -- ====================================
    INSERT INTO projects (user_id, name, cover_image_url)
    VALUES (v_user_id, '엄마의 노래', 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800')
    RETURNING id INTO p10_id;

    INSERT INTO pages (project_id, title, content, type, sort_order)
    VALUES
        (p10_id, '기본 설정', '<h1>엄마의 노래 - 기본 설정</h1><p>치매를 앓는 엄마와 딸의 따뜻하고 슬픈 이야기</p>', 'SETTINGS', 0);

    INSERT INTO pages (project_id, title, content, type, sort_order)
    VALUES
        (p10_id, '1장. 진단',
         '<h1>1장. 진단</h1><p>"치매입니다." 의사의 말에 나는 믿을 수가 없었다. "엄마가... 치매라고요?" 불과 몇 달 전만 해도 건강하셨던 엄마. 그런 엄마가 치매라니. 의사는 차트를 보며 설명했다. "초기 단계입니다. 하지만 진행 속도가 빠를 수 있으니 각오하셔야 합니다."</p><p>진료실을 나와 엄마를 봤다. 엄마는 복도에 앉아 창밖을 바라보고 계셨다. "엄마, 괜찮으세요?" 나는 엄마 옆에 앉았다. "응, 괜찮아. 저기 봐, 벚꽃이 예쁘구나." 엄마는 미소를 지으셨다. 하지만 지금은 한겨울이었다. 창밖엔 벚꽃이 없었다.</p><p>집으로 돌아오는 길, 나는 눈물을 참았다. 엄마는 차 안에서 흥얼거리며 노래를 부르셨다. "엄마 마음은 호수요..." 내가 어릴 적 자장가로 불러주시던 노래. 그 노래만은 아직 기억하고 계셨다.</p><p>"엄마, 그 노래 좋아요." 내가 말하자 엄마는 웃으셨다. "그래? 네가 어릴 때 많이 불러줬는데." 나는 엄마의 손을 꼭 잡았다. "앞으로도 많이 불러주세요." 엄마는 고개를 끄덕이셨다. 우리에게 남은 시간이 얼마나 될지 몰랐지만, 그 시간을 소중히 보내기로 다짐했다.</p>',
         'PAGE', 1),
        (p10_id, '2장. 기억을 잃어가는 날들',
         '<h1>2장. 기억을 잃어가는 날들</h1><p>시간이 지날수록 엄마의 증상은 심해졌다. 어느 날은 나를 알아보지 못하셨다. "아가씨, 누구세요?" 엄마의 물음에 나는 가슴이 무너지는 것 같았다. "엄마... 저예요. 민지." "민지?" 엄마는 고개를 갸웃거리셨다.</p><p>나는 어린 시절 사진을 꺼내 보여드렸다. "이게 저예요. 엄마가 키우신 딸." 엄마는 사진을 보며 잠시 생각에 잠기셨다. "아... 민지. 우리 딸." 엄마는 미소를 지으셨다. 하지만 그 미소는 금방 사라졌고, 엄마는 다시 멍하니 창밖을 바라보셨다.</p><p>밤이 되면 엄마는 집을 나가려고 하셨다. "나 집에 가야 돼. 부모님이 기다리시는데." 이미 돌아가신 외할머니, 외할아버지를 찾으셨다. 나는 엄마를 달래며 다시 침대로 모셨다. "엄마, 여기가 집이에요. 저랑 같이 자요."</p><p>엄마는 순한 양처럼 침대에 누우셨고, 나는 엄마 옆에서 자장가를 불렀다. "엄마 마음은 호수요..." 그 노래를 부르자 엄마는 눈을 감으셨다. "고마워..." 엄마의 작은 속삭임에 나는 눈물을 흘렸다. 기억은 잃어도, 사랑은 남는다는 걸 믿고 싶었다.</p>',
         'PAGE', 2);

    -- 캐릭터
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p10_id, '민지', '여성', '강인하지만 감성적인, 효심 깊은', '30대 직장인. 치매를 앓는 엄마를 홀로 돌보며 힘든 시간을 보낸다.') RETURNING id INTO c10_1;
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p10_id, '엄마', '여성', '다정하고 따뜻한', '60대 주부. 치매로 기억을 잃어가지만 딸에 대한 사랑은 변하지 않는다.') RETURNING id INTO c10_2;
    INSERT INTO characters (project_id, name, gender, personality, description)
    VALUES
        (p10_id, '준혁', '남성', '이해심 깊고 든든한', '민지의 남자친구. 함께 엄마를 돌보며 민지를 지지한다.') RETURNING id INTO c10_3;

    -- 인물 관계
    INSERT INTO character_relationships (project_id, source_character_id, target_character_id, description)
    VALUES
        (p10_id, c10_1, c10_2, '딸과 엄마. 깊은 사랑으로 연결됨'),
        (p10_id, c10_2, c10_1, '엄마. 기억을 잃어도 딸을 사랑함'),
        (p10_id, c10_1, c10_3, '연인. 준혁이 민지를 응원하고 지지함');

    -- 플롯 보드
    INSERT INTO plot_cards (project_id, title, content, column_name, sort_order)
    VALUES
        (p10_id, '요양원 결정', '민지가 엄마를 요양원에 보낼지 고민하는 장면', 'to-do', 0),
        (p10_id, '엄마의 마지막 기억', '엄마가 민지를 마지막으로 알아보는 감동 장면', 'in-progress', 0),
        (p10_id, '치매 진단 장면 완성', '병원에서 진단받는 장면', 'done', 0);

    -- 타임라인
    INSERT INTO timeline_events (project_id, title, description, event_date, sort_order)
    VALUES
        (p10_id, '치매 진단', '엄마가 치매 진단을 받음', '2024-01-15', 0),
        (p10_id, '첫 증상 악화', '엄마가 민지를 알아보지 못함', '2024-03-10', 1),
        (p10_id, '준혁의 도움', '남자친구가 함께 돌봄을 시작', '2024-04-05', 2);

    RAISE NOTICE '✅ 샘플 데이터 생성 완료!';
    RAISE NOTICE '총 10개 프로젝트, 26개 캐릭터, 다수의 페이지, 관계, 플롯카드, 타임라인이 생성되었습니다.';
    RAISE NOTICE '⚠️  잊지 말고 상단의 YOUR_USER_ID를 실제 값으로 변경하세요!';

END $$;
