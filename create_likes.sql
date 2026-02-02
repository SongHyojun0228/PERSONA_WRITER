CREATE TABLE likes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  published_story_id UUID REFERENCES published_stories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, published_story_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own likes"
ON likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
ON likes
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Public read access for likes"
ON likes
FOR SELECT
USING (true);
