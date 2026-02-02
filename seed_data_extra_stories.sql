    -- Ensure gen_random_uuid() is available (usually is in Supabase)
    -- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Pre-defined UUIDs for consistency in sample data
    -- User IDs (These should ideally come from auth.users.id)
    DO $$
    DECLARE
        user1_id UUID := '757797a2-8032-4bc1-a2ce-796e01ac6b4a';
        user2_id UUID := '118ec487-c121-485c-89ed-676fafa07c28';

        -- Story IDs (additional 10 stories)
        story11_id UUID := '10000000-0000-0000-0000-000000000011';
        story12_id UUID := '10000000-0000-0000-0000-000000000012';
        story13_id UUID := '10000000-0000-0000-0000-000000000013';
        story14_id UUID := '10000000-0000-0000-0000-000000000014';
        story15_id UUID := '10000000-0000-0000-0000-000000000015';
        story16_id UUID := '10000000-0000-0000-0000-000000000016';
        story17_id UUID := '10000000-0000-0000-0000-000000000017';
        story18_id UUID := '10000000-0000-0000-0000-000000000018';
        story19_id UUID := '10000000-0000-0000-0000-000000000019';
        story20_id UUID := '10000000-0000-0000-0000-000000000020';
    BEGIN

    -- 1. Insert sample data into 'published_stories' table (additional 10)
    -- Assuming project_id can be NULL or an existing project ID
    INSERT INTO public.published_stories (id, user_id, title, content, cover_image_url, is_paid, price, created_at, updated_at)
    VALUES
        (story11_id, user1_id, '잊혀진 섬의 전설', '안개 속에 가려진 섬, 그곳에 전해지는 신비한 전설.', 'https://picsum.photos/300/200?random=11', FALSE, NULL, now() - INTERVAL '10 days', now() - INTERVAL '10 days'),
                (story12_id, user2_id, '별빛 아래의 속삭임', '밤하늘의 별들이 들려주는 사랑과 이별의 이야기.', 'https://picsum.photos/300/200?random=12', TRUE, 400, now() - INTERVAL '9 days', now() - INTERVAL '9 days'),
                (story13_id, user1_id, '잃어버린 시간의 조각', '시간을 되돌릴 수 있는 유물을 찾아 떠나는 모험.', 'https://picsum.photos/300/200?random=13', FALSE, NULL, now() - INTERVAL '8 days', now() - INTERVAL '8 days'),
                (story14_id, user2_id, '악마의 계약서', '영혼을 담보로 한 계약, 그 끝은 어디인가.', 'https://picsum.photos/300/200?random=14', TRUE, 500, now() - INTERVAL '7 days', now() - INTERVAL '7 days'),
                (story15_id, user1_id, '숲속 요정의 비밀', '인간에게 모습을 드러낸 숲속 요정, 그들의 숨겨진 이야기.', 'https://picsum.photos/300/200?random=15', FALSE, NULL, now() - INTERVAL '6 days', now() - INTERVAL '6 days'),
                (story16_id, user2_id, '어둠 속의 등대지기', '세상의 끝, 어둠 속에서 희망을 밝히는 등대지기의 삶.', 'https://picsum.photos/300/200?random=16', TRUE, 300, now() - INTERVAL '5 days', now() - INTERVAL '5 days'),
                (story17_id, user1_id, '환상의 서커스단', '하룻밤만 열리는 신비한 서커스단, 그들의 환상적인 공연.', 'https://picsum.photos/300/200?random=17', FALSE, NULL, now() - INTERVAL '4 days', now() - INTERVAL '4 days'),
                (story18_id, user2_id, '거울 속의 또 다른 나', '거울을 통해 만난 또 다른 자아, 혼란스러운 정체성.', 'https://picsum.photos/300/200?random=18', TRUE, 400, now() - INTERVAL '3 days', now() - INTERVAL '3 days'),
                (story19_id, user1_id, '용의 눈물', '전설 속 용의 눈물을 찾아 떠나는 위험한 여정.', 'https://picsum.photos/300/200?random=19', FALSE, NULL, now() - INTERVAL '2 days', now() - INTERVAL '2 days'),
                (story20_id, user2_id, '그림자 암살자의 복수', '배신당한 암살자의 그림자, 차가운 복수의 서막.', 'https://picsum.photos/300/200?random=20', TRUE, 500, now() - INTERVAL '1 day', now() - INTERVAL '1 day')    ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        cover_image_url = EXCLUDED.cover_image_url,
        is_paid = EXCLUDED.is_paid,
        price = EXCLUDED.price,
        updated_at = now();

    -- 2. Insert sample data into 'comments' table
    INSERT INTO public.comments (user_id, published_story_id, content, created_at)
    VALUES
        (user2_id, story11_id, '새로운 섬 이야기는 언제나 흥미진진하죠!', now() - INTERVAL '7 days'),
        (user1_id, story12_id, '별빛 속삭임, 정말 시적인 제목입니다.', now() - INTERVAL '6 days'),
        (user2_id, story13_id, '시간 여행, 제가 좋아하는 소재입니다!', now() - INTERVAL '5 days'),
        (user1_id, story14_id, '악마의 계약, 결말이 어떻게 될지 두근두근.', now() - INTERVAL '4 days'),
        (user2_id, story15_id, '요정 이야기는 언제나 마음을 편안하게 해줘요.', now() - INTERVAL '3 days'),
        (user1_id, story16_id, '등대지기 이야기라니, 깊은 울림이 있을 것 같아요.', now() - INTERVAL '2 days'),
        (user2_id, story17_id, '서커스단 이야기, 마법같은 상상력을 자극하네요.', now() - INTERVAL '1 day'),
        (user1_id, story18_id, '거울 속의 또 다른 나, 한번쯤 생각해 본 주제예요.', now() - INTERVAL '1 hours'),
        (user2_id, story19_id, '용의 눈물, 흥미로운 판타지네요!', now() - INTERVAL '30 minutes'),
        (user1_id, story20_id, '복수극은 언제나 통쾌하죠!', now() - INTERVAL '10 minutes');

    -- 3. Insert sample data into 'likes' table
    INSERT INTO public.likes (user_id, published_story_id, created_at)
    VALUES
        (user2_id, story11_id, now() - INTERVAL '7 days'),
        (user1_id, story13_id, now() - INTERVAL '6 days'),
        (user2_id, story15_id, now() - INTERVAL '5 days'),
        (user1_id, story16_id, now() - INTERVAL '4 days'),
        (user2_id, story17_id, now() - INTERVAL '3 days'),
        (user1_id, story18_id, now() - INTERVAL '2 days'),
        (user2_id, story19_id, now() - INTERVAL '1 day'),
        (user1_id, story20_id, now() - INTERVAL '1 hours')
    ON CONFLICT (user_id, published_story_id) DO NOTHING;

    END $$;