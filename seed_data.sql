-- Ensure gen_random_uuid() is available (usually is in Supabase)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Pre-defined UUIDs for consistency in sample data
-- User IDs (These should ideally come from auth.users.id)
DO $$
DECLARE
    user1_id UUID := '757797a2-8032-4bc1-a2ce-796e01ac6b4a';
    user2_id UUID := '118ec487-c121-485c-89ed-676fafa07c28';

    -- Story IDs (initial 10 stories)
    story1_id UUID := '10000000-0000-0000-0000-000000000001';
    story2_id UUID := '10000000-0000-0000-0000-000000000002';
    story3_id UUID := '10000000-0000-0000-0000-000000000003';
    story4_id UUID := '10000000-0000-0000-0000-000000000004';
    story5_id UUID := '10000000-0000-0000-0000-000000000005';
    story6_id UUID := '10000000-0000-0000-0000-000000000006';
    story7_id UUID := '10000000-0000-0000-0000-000000000007';
    story8_id UUID := '10000000-0000-0000-0000-000000000008';
    story9_id UUID := '10000000-0000-0000-0000-000000000009';
    story10_id UUID := '10000000-0000-0000-0000-000000000010';
BEGIN

-- 1. Insert sample data into 'profiles' table
-- NOTE: In a real Supabase setup, 'profiles.id' must match 'auth.users.id'.
-- These INSERTs assume corresponding entries in 'auth.users' exist with these UUIDs.
INSERT INTO public.profiles (id, username, inspiration_count)
VALUES
    (user1_id, '작가1', 1500),
    (user2_id, '작가2', 500)
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    inspiration_count = EXCLUDED.inspiration_count;

-- 2. Insert sample data into 'published_stories' table (initial 10)
-- Assuming project_id can be NULL or an existing project ID
INSERT INTO public.published_stories (id, user_id, title, content, cover_image_url, is_paid, price, created_at, updated_at)
VALUES
    (story1_id, user1_id, '용감한 탐험가의 일기', '먼 옛날, 용감한 탐험가가 미지의 대륙을 찾아 나섰습니다...', 'https://picsum.photos/300/200?random=1', FALSE, NULL, now() - INTERVAL '10 days', now() - INTERVAL '10 days'),
    (story2_id, user1_id, '마법학교의 비밀', '어둠이 깔린 마법학교에서, 어린 마법사는 오래된 비밀을...', 'https://picsum.photos/300/200?random=2', TRUE, 300, now() - INTERVAL '9 days', now() - INTERVAL '9 days'),
    (story3_id, user2_id, '잊혀진 왕국의 노래', '황폐해진 왕국에 희망의 노래가 울려 퍼지기 시작합니다.', 'https://picsum.photos/300/200?random=3', FALSE, NULL, now() - INTERVAL '8 days', now() - INTERVAL '8 days'),
    (story4_id, user2_id, '시간 여행자의 고백', '과거를 바꿀 수 있다면, 당신은 어떤 선택을 하시겠습니까?', 'https://picsum.photos/300/200?random=4', TRUE, 400, now() - INTERVAL '7 days', now() - INTERVAL '7 days'),
    (story5_id, user1_id, '별을 쫓는 아이', '도시의 불빛 아래, 별을 쫓는 한 아이의 꿈 이야기.', 'https://picsum.photos/300/200?random=5', TRUE, 300, now() - INTERVAL '6 days', now() - INTERVAL '6 days'),
    (story6_id, user2_id, '미래 도시의 그림자', '화려한 미래 도시 아래 숨겨진 어두운 진실.', 'https://picsum.photos/300/200?random=6', FALSE, NULL, now() - INTERVAL '5 days', now() - INTERVAL '5 days'),
    (story7_id, user1_id, '고대 유적의 수수께끼', '잊혀진 문명의 유적에서 발견된 기묘한 기록들.', 'https://picsum.photos/300/200?random=7', TRUE, 400, now() - INTERVAL '4 days', now() - INTERVAL '4 days'),
    (story8_id, user2_id, '끝없는 겨울의 시작', '세상을 덮친 끝없는 겨울, 살아남기 위한 처절한 사투.', 'https://picsum.photos/300/200?random=8', TRUE, 500, now() - INTERVAL '3 days', now() - INTERVAL '3 days'),
    (story9_id, user1_id, '꿈을 훔치는 자', '사람들의 행복한 꿈을 훔치는 미스터리한 존재의 등장.', 'https://picsum.photos/300/200?random=9', FALSE, NULL, now() - INTERVAL '2 days', now() - INTERVAL '2 days'),
    (story10_id, user2_id, '황혼의 검객', '몰락한 왕국을 지키기 위한 마지막 검객의 이야기.', 'https://picsum.photos/300/200?random=10', TRUE, 300, now() - INTERVAL '1 day', now() - INTERVAL '1 day')
ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    cover_image_url = EXCLUDED.cover_image_url,
    is_paid = EXCLUDED.is_paid,
    price = EXCLUDED.price,
    updated_at = now();

-- 3. Insert sample data into 'comments' table
INSERT INTO public.comments (user_id, published_story_id, content, created_at)
VALUES
    (user2_id, story1_id, '작가1님의 글은 언제나 최고예요! 다음 작품도 기대됩니다.', now() - INTERVAL '9 days'),
    (user1_id, story1_id, '감사합니다! 더 좋은 이야기로 찾아뵐게요.', now() - INTERVAL '8 days'),
    (user2_id, story2_id, '마법학교 이야기에 푹 빠져버렸어요. 영감 300개가 전혀 아깝지 않네요!', now() - INTERVAL '7 days'),
    (user1_id, story3_id, '작가2님, 이 작품 정말 인상 깊어요. 무료라니 믿을 수 없네요.', now() - INTERVAL '6 days'),
    (user2_id, story3_id, '칭찬 감사합니다! 더 많은 분들이 읽어주셨으면 좋겠어요.', now() - INTERVAL '5 days'),
    (user1_id, story4_id, '시간 여행자의 고뇌가 여기까지 느껴지네요. 결말이 궁금해서 바로 구매했습니다.', now() - INTERVAL '4 days'),
    (user2_id, story5_id, '별을 쫓는 아이의 순수함이 마음을 울립니다.', now() - INTERVAL '3 days'),
    (user1_id, story6_id, '미래 도시의 어두운 면을 잘 그려내셨네요. 사회 비판적인 시각이 돋보여요.', now() - INTERVAL '2 days'),
    (user2_id, story7_id, '고대 유적의 수수께끼라니! 제가 제일 좋아하는 장르입니다. 기대돼요.', now() - INTERVAL '1 day'),
    (user1_id, story8_id, '겨울 배경의 판타지라니, 상상력이 대단하십니다. 흥미진진해요!', now() - INTERVAL '1 hours');

-- 4. Insert sample data into 'likes' table
INSERT INTO public.likes (user_id, published_story_id, created_at)
VALUES
    (user2_id, story1_id, now() - INTERVAL '9 days'),
    (user1_id, story3_id, now() - INTERVAL '8 days'),
    (user2_id, story5_id, now() - INTERVAL '7 days'),
    (user1_id, story6_id, now() - INTERVAL '6 days'),
    (user2_id, story7_id, now() - INTERVAL '5 days'),
    (user1_id, story8_id, now() - INTERVAL '4 days'),
    (user2_id, story9_id, now() - INTERVAL '3 days'),
    (user1_id, story10_id, now() - INTERVAL '2 days'),
    (user2_id, story2_id, now() - INTERVAL '1 day'),
    (user1_id, story4_id, now())
ON CONFLICT (user_id, published_story_id) DO NOTHING;

-- 5. Insert sample data into 'subscriptions' table
INSERT INTO public.subscriptions (subscriber_id, subscribed_to_id, created_at)
VALUES
    (user1_id, user2_id, now() - INTERVAL '5 days')
ON CONFLICT (subscriber_id, subscribed_to_id) DO NOTHING; -- 작가1이 작가2 구독

END $$;