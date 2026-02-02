-- Update script for published_stories cover_image_url
-- This script assumes the stories already exist in the database from a previous seed or manual entry.

DO $$
DECLARE
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

UPDATE public.published_stories
SET cover_image_url = 'https://picsum.photos/300/200?random=1'
WHERE id = story1_id;

UPDATE public.published_stories
SET cover_image_url = 'https://picsum.photos/300/200?random=2'
WHERE id = story2_id;

UPDATE public.published_stories
SET cover_image_url = 'https://picsum.photos/300/200?random=3'
WHERE id = story3_id;

UPDATE public.published_stories
SET cover_image_url = 'https://picsum.photos/300/200?random=4'
WHERE id = story4_id;

UPDATE public.published_stories
SET cover_image_url = 'https://picsum.photos/300/200?random=5'
WHERE id = story5_id;

UPDATE public.published_stories
SET cover_image_url = 'https://picsum.photos/300/200?random=6'
WHERE id = story6_id;

UPDATE public.published_stories
SET cover_image_url = 'https://picsum.photos/300/200?random=7'
WHERE id = story7_id;

UPDATE public.published_stories
SET cover_image_url = 'https://picsum.photos/300/200?random=8'
WHERE id = story8_id;

UPDATE public.published_stories
SET cover_image_url = 'https://picsum.photos/300/200?random=9'
WHERE id = story9_id;

UPDATE public.published_stories
SET cover_image_url = 'https://picsum.photos/300/200?random=10'
WHERE id = story10_id;

END $$;