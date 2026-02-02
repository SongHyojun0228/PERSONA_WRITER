CREATE TABLE user_story_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  published_story_id UUID REFERENCES published_stories(id) ON DELETE CASCADE NOT NULL,
  purchase_date TIMESTAMPTZ DEFAULT now() NOT NULL,
  expiry_date TIMESTAMPTZ NOT NULL,
  UNIQUE(user_id, published_story_id) -- A user can only purchase a specific story once (active purchase)
);

ALTER TABLE user_story_purchases ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own purchases
CREATE POLICY "Users can view their own story purchases"
ON user_story_purchases
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for users to insert their own purchases
CREATE POLICY "Users can insert their own story purchases"
ON user_story_purchases
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own purchases (e.g., extend expiry, though not in current spec)
CREATE POLICY "Users can update their own story purchases"
ON user_story_purchases
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy to allow users to delete their own purchases (e.g., if refunded, though not in current spec)
CREATE POLICY "Users can delete their own story purchases"
ON user_story_purchases
FOR DELETE
USING (auth.uid() = user_id);
