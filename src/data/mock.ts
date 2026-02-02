export interface Page {
  id: string;
  title: string;
  content: string;
  sort_order: number; // Added for page reordering
}

export interface Character {
  id: string;
  name: string;
  gender: string;
  personality: string;
  description: string;
}

export interface Foreshadow {
  id: string;
  content: string;
  status: 'open' | 'closed';
  created_at: string;
  resolved_at?: string;
}

export interface Relationship {
    id: string;
    source_character_id: string;
    target_character_id: string;
    description: string;
    source_name?: string;
    target_name?: string;
}

export interface Project {
  id: string; // Supabase UUID
  user_id: string;
  name: string;
  created_at: string;
  cover_image_url?: string; // Added for cover generation
  settings: Page;
  characters: Character[];
  pages: Page[];
  foreshadows: Foreshadow[];
  mergedPages: MergedPage[];
  relationships: Relationship[];
}

export interface MergedPage {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

