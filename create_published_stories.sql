-- 1. Create the published_stories table
CREATE TABLE published_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create a function to automatically update the `updated_at` timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create a trigger that uses the function to update `updated_at` on any row update
CREATE TRIGGER on_published_stories_updated
  BEFORE UPDATE ON published_stories
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

-- 4. Enable Row Level Security (RLS) for the new table
ALTER TABLE published_stories ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for the new table
-- Allow public read access for everyone
CREATE POLICY "Public read access for published_stories"
ON published_stories
FOR SELECT
USING (true);

-- Allow users to insert their own published stories
CREATE POLICY "Users can insert their own published_stories"
ON published_stories
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own published stories
CREATE POLICY "Users can update their own published_stories"
ON published_stories
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to delete their own published stories
CREATE POLICY "Users can delete their own published_stories"
ON published_stories
FOR DELETE
USING (auth.uid() = user_id);
