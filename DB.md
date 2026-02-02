# Database Schema

---

## Table: `public.character_relationships`
Manages relationships between characters within a project.

-   **`id`** (`uuid`, Primary Key, Default: `gen_random_uuid()`)
-   **`project_id`** (`uuid`, Not Null, Foreign Key to `projects.id`, On Delete CASCADE)
-   **`source_character_id`** (`uuid`, Not Null, Foreign Key to `characters.id`, On Delete CASCADE)
-   **`target_character_id`** (`uuid`, Not Null, Foreign Key to `characters.id`, On Delete CASCADE)
-   **`description`** (`text`, Not Null)
-   **`created_at`** (`timestamp with time zone`, Nullable, Default: `timezone('utc'::text, now())`)

**Constraints:**
-   `unique_project_character_relationship`: Unique constraint on (`project_id`, `source_character_id`, `target_character_id`, `description`)
-   `no_self_relationship`: Ensures `source_character_id` is not equal to `target_character_id`

---

## Table: `public.comments`
Stores user comments on published stories.

-   **`id`** (`uuid`, Primary Key, Default: `gen_random_uuid()`)
-   **`user_id`** (`uuid`, Nullable, Foreign Key to `auth.users.id`, On Delete CASCADE)
-   **`published_story_id`** (`uuid`, Not Null, Foreign Key to `published_stories.id`, On Delete CASCADE)
-   **`content`** (`text`, Not Null)
-   **`created_at`** (`timestamp with time zone`, Not Null, Default: `now()`)
-   **`parent_comment_id`** (`uuid`, Nullable, Foreign Key to `comments.id`, On Delete CASCADE)
-   **`is_anonymous`** (`boolean`, Not Null, Default: `false`)

---

## Table: `public.likes`
Records user likes on published stories.

-   **`user_id`** (`uuid`, Primary Key, Not Null, Foreign Key to `auth.users.id`, On Delete CASCADE)
-   **`published_story_id`** (`uuid`, Primary Key, Not Null, Foreign Key to `published_stories.id`, On Delete CASCADE)
-   **`created_at`** (`timestamp with time zone`, Nullable, Default: `now()`)

---

## Table: `public.merged_pages`
Stores merged pages for projects.

-   **`id`** (`uuid`, Primary Key, Default: `gen_random_uuid()`)
-   **`project_id`** (`uuid`, Not Null, Foreign Key to `projects.id`, On Delete CASCADE)
-   **`title`** (`text`, Not Null)
-   **`content`** (`text`, Nullable)
-   **`created_at`** (`timestamp with time zone`, Not Null, Default: `now()`)

---

## Table: `public.notifications`
Manages user notifications.

-   **`id`** (`uuid`, Primary Key, Default: `gen_random_uuid()`)
-   **`user_id`** (`uuid`, Not Null, Foreign Key to `auth.users.id`, On Delete CASCADE)
-   **`type`** (`text`, Not Null)
-   **`data`** (`jsonb`, Nullable)
-   **`is_read`** (`boolean`, Not Null, Default: `false`)
-   **`created_at`** (`timestamp with time zone`, Not Null, Default: `now()`)

**Indexes:**
-   `idx_notifications_user_id`: B-tree index on `user_id`

---

## Table: `public.pages`
Stores individual pages within a project.

-   **`id`** (`uuid`, Primary Key, Default: `gen_random_uuid()`)
-   **`project_id`** (`uuid`, Not Null, Foreign Key to `projects.id`, On Delete CASCADE)
-   **`title`** (`text`, Nullable)
-   **`content`** (`text`, Nullable)
-   **`type`** (`public.page_type`, Not Null)
-   **`created_at`** (`timestamp with time zone`, Nullable, Default: `now()`)
-   **`sort_order`** (`integer`, Nullable, Default: `0`)

---

## Table: `public.profiles`
Stores user profile information, linked to `auth.users`.

-   **`id`** (`uuid`, Primary Key, Not Null, Foreign Key to `auth.users.id`, On Delete CASCADE)
-   **`username`** (`text`, Nullable)
-   **`updated_at`** (`timestamp with time zone`, Nullable, Default: `now()`)
-   **`inspiration_count`** (`integer`, Nullable, Default: `100`)

---

## Table: `public.projects`
Stores user projects.

-   **`id`** (`uuid`, Primary Key, Default: `gen_random_uuid()`)
-   **`user_id`** (`uuid`, Not Null, Foreign Key to `profiles.id`, On Delete CASCADE)
-   **`name`** (`text`, Not Null)
-   **`created_at`** (`timestamp with time zone`, Nullable, Default: `now()`)
-   **`cover_image_url`** (`text`, Nullable)

---

## Table: `public.published_stories`
Stores stories published by users.

-   **`id`** (`uuid`, Primary Key, Default: `gen_random_uuid()`)
-   **`project_id`** (`uuid`, Nullable, Foreign Key to `projects.id`, On Delete CASCADE)
-   **`user_id`** (`uuid`, Nullable, Foreign Key to `auth.users.id`, On Delete CASCADE)
-   **`title`** (`text`, Not Null)
-   **`content`** (`text`, Nullable)
-   **`cover_image_url`** (`text`, Nullable)
-   **`created_at`** (`timestamp with time zone`, Nullable, Default: `now()`)
-   **`updated_at`** (`timestamp with time zone`, Nullable, Default: `now()`)
-   **`is_paid`** (`boolean`, Not Null, Default: `false`)
-   **`price`** (`integer`, Nullable)

**Triggers:**
-   `on_published_stories_updated`: Executes `handle_updated_at()` before update.

**Constraints:**
-   `price_range_check`: Ensures price is between 300 and 500 if not null.

---

## Table: `public.user_story_purchases`
Records purchases of published stories by users.

-   **`id`** (`uuid`, Primary Key, Default: `gen_random_uuid()`)
-   **`user_id`** (`uuid`, Not Null, Foreign Key to `auth.users.id`, On Delete CASCADE)
-   **`published_story_id`** (`uuid`, Not Null, Foreign Key to `published_stories.id`, On Delete CASCADE)
-   **`purchase_date`** (`timestamp with time zone`, Not Null, Default: `now()`)
-   **`expiry_date`** (`timestamp with time zone`, Not Null)

**Constraints:**
-   `user_story_purchases_user_id_published_story_id_key`: Unique constraint on (`user_id`, `published_story_id`)
