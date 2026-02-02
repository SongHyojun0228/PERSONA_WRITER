import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import pkg from "hanspell";
const { spellCheckByDAUM, spellCheckByPNU } = pkg; // Destructure both
import { HanspellResult } from "hanspell"; // Import HanspellResult interface

dotenv.config();

const app = express();
const port = 3001;

// Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey || !supabaseServiceKey) {
  throw new Error(
    "Supabase URL, Anon Key, and Service Key are required in .env file",
  );
}
const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", // Reverting to user's preferred and working model
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ],
});

const imageGenModel = genAI.getGenerativeModel({
  model: "nano-banana-pro-preview",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ],
});
interface HistoryItem {
  role: "user" | "ai";
  parts: { text: string }[];
}
interface StoryContext {
  settings: string;
  characterSheet: string;
}

// --- Community/Publishing Endpoints ---

// GET all published stories
app.get("/api/published-stories", async (req, res) => {
  const { sort, author_name } = req.query; // Get sort and author_name parameters

  try {
    let authorIdToFilter: string | null = null;
    let finalStoriesQuery;

    if (author_name) {
      // Find user by username
      const {
        data: { users },
        error: userSearchError,
      } = await supabaseAdmin.auth.admin.listUsers();
      if (userSearchError) throw userSearchError;

      const foundUser = users.find(
        (user) =>
          user.user_metadata?.username?.toLowerCase() ===
          (author_name as string).toLowerCase(),
      );

      if (!foundUser) {
        // If no author found, return empty array of stories
        return res.json([]);
      }
      authorIdToFilter = foundUser.id;
    }

    if (sort === "likes") {
      let queryBuilder = supabase.from("published_stories").select(`
          id,
          title,
          cover_image_url,
          created_at,
          user_id,
          is_paid,
          price,
          likes (
            count
          )
        `);
      if (authorIdToFilter) {
        queryBuilder = queryBuilder.eq("user_id", authorIdToFilter);
      }
      const { data, error } = await queryBuilder;
      if (error) throw error;
      finalStoriesQuery = data.sort(
        (a: any, b: any) => (b.likes[0]?.count || 0) - (a.likes[0]?.count || 0),
      );
    } else {
      // Default to 'newest'
      let queryBuilder = supabase.from("published_stories").select(`
          id,
          title,
          cover_image_url,
          created_at,
          user_id,
          is_paid,
          price
        `);
      if (authorIdToFilter) {
        queryBuilder = queryBuilder.eq("user_id", authorIdToFilter);
      }
      const { data, error } = await queryBuilder.order("created_at", {
        ascending: false,
      });
      if (error) throw error;
      finalStoriesQuery = data;
    }

    if (!finalStoriesQuery) {
      return res.json([]);
    }

    // Attach usernames to the stories regardless of the sort order.
    const storiesWithUsernames = await Promise.all(
      finalStoriesQuery.map(async (story: any) => {
        const {
          data: { user },
          error: userError,
        } = await supabaseAdmin.auth.admin.getUserById(story.user_id);

        const { likes, ...restOfStory } = story;

        if (userError) {
          console.error(`Error fetching user ${story.user_id}:`, userError);
          return { ...restOfStory, profiles: { username: "Anonymous" } };
        }
        return {
          ...restOfStory,
          profiles: { username: user?.user_metadata?.username || "Anonymous" },
        };
      }),
    );
    res.json(storiesWithUsernames);
  } catch (error: any) {
    console.error("Error fetching published stories:", error.message);
    return res.status(500).json({ error: "Failed to fetch published stories" });
  }
});

// GET a single published story by ID
app.get("/api/published-stories/:id", async (req, res) => {
  const { id } = req.params;
  const { data: story, error } = await supabase
    .from("published_stories")
    .select(
      `
      id,
      title,
      content,
      cover_image_url,
      created_at,
      user_id
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching story ${id}:`, error);
    return res
      .status(500)
      .json({ error: `Failed to fetch story with id ${id}` });
  }

  if (!story) {
    return res.status(404).json({ error: "Story not found" });
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.admin.getUserById(story.user_id);
    if (userError) {
      throw userError;
    }
    const storyWithUsername = {
      ...story,
      profiles: { username: user?.user_metadata?.username || "Anonymous" },
    };
    res.json(storyWithUsername);
  } catch (e) {
    console.error(`Error attaching username to story ${id}:`, e);
    res.json({ ...story, profiles: { username: "N/A" } });
  }
});

// POST to publish a story
app.post("/api/publish", async (req, res) => {
  const { projectId, title, content, coverImageUrl, is_paid, price } = req.body;

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }
  const token = authHeader.split(" ")[1];

  // Create a new Supabase client with the user's JWT to perform authorized actions
  const supabaseUserClient = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
  } = await supabaseUserClient.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: "Invalid user token" });
  }

  const { data: newStory, error } = await supabaseUserClient
    .from("published_stories")
    .insert({
      project_id: projectId,
      user_id: user.id,
      title,
      content,
      cover_image_url: coverImageUrl,
      is_paid,
      price,
    })
    .select()
    .single();

  if (error) {
    console.error("Error publishing story:", error);
    return res.status(500).json({ error: "Failed to publish story." });
  }

  // --- Create Notifications for Subscribers (fire and forget) ---
  const createNotifications = async () => {
    try {
      // 1. Find all subscribers of the author
      const { data: subscribers, error: subsError } = await supabaseAdmin
        .from("subscriptions")
        .select("subscriber_id")
        .eq("subscribed_to_id", user.id);

      if (subsError) {
        console.error("Error fetching subscribers:", subsError.message);
        return;
      }

      if (subscribers && subscribers.length > 0) {
        // 2. Prepare notification data
        const notificationsToInsert = subscribers.map((sub) => ({
          user_id: sub.subscriber_id,
          type: "new_story",
          data: {
            storyId: newStory.id,
            storyTitle: newStory.title,
            authorId: user.id,
            authorName: user.user_metadata?.username || "A writer",
          },
        }));

        // 3. Insert notifications
        const { error: notificationError } = await supabaseAdmin
          .from("notifications")
          .insert(notificationsToInsert);

        if (notificationError) {
          console.error(
            "Error creating notifications:",
            notificationError.message,
          );
        } else {
          console.log(
            `Created ${notificationsToInsert.length} notifications for new story.`,
          );
        }
      }
    } catch (e: any) {
      console.error("Failed to run notification creation process:", e.message);
    }
  };

  createNotifications(); // Run without awaiting

  // --- End Notification Logic ---

  res.status(201).json(newStory);
});

// PATCH to update a published story
app.patch("/api/published-stories/:id", async (req, res) => {
  const { id } = req.params;
  const { title, coverImageUrl } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }

  const token = authHeader.split(" ")[1];
  const supabaseUserClient = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
  } = await supabaseUserClient.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: "Invalid user token" });
  }

  const { data, error } = await supabaseUserClient
    .from("published_stories")
    .update({ title, cover_image_url: coverImageUrl })
    .eq("id", id)
    .eq("user_id", user.id); // Ensure user owns the story

  if (error) {
    console.error("Error updating published story:", error);
    return res.status(500).json({ error: "Failed to update published story." });
  }

  res.status(200).json(data);
});

// DELETE a published story
app.delete("/api/published-stories/:id", async (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }

  const token = authHeader.split(" ")[1];
  const supabaseUserClient = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser();

  if (userError || !user) {
    return res.status(401).json({ error: "Invalid user token" });
  }

  try {
    // Step 1: Verify user owns the story
    const { data: story, error: storyError } = await supabaseAdmin
      .from("published_stories")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (storyError) {
        console.error(`Error finding story to delete: ${storyError.message}`);
        // This could be a legitimate "not found" case.
        return res.status(404).json({ error: "Story not found." });
    }
    if (story.user_id !== user.id) {
        return res.status(403).json({ error: "You do not have permission to delete this story." });
    }

    // Step 2: Delete related likes
    const { error: likesError } = await supabaseAdmin
      .from("likes")
      .delete()
      .eq("published_story_id", id);
      
    if (likesError) {
      throw new Error(`Failed to delete likes: ${likesError.message}`);
    }

    // Step 3: Delete related comments
    const { error: commentsError } = await supabaseAdmin
      .from("comments")
      .delete()
      .eq("published_story_id", id);
      
    if (commentsError) {
      throw new Error(`Failed to delete comments: ${commentsError.message}`);
    }

    // Step 4: Delete related notifications (optional, log error if fails)
    const { error: notificationsError } = await supabaseAdmin
      .from("notifications")
      .delete()
      .eq("data->>storyId", id);

    if (notificationsError) {
      console.warn(`Could not delete notifications for story ${id}: ${notificationsError.message}. Proceeding anyway.`);
    }

    // Step 5: Delete the story itself
    const { error: deleteStoryError } = await supabaseAdmin
      .from("published_stories")
      .delete()
      .eq("id", id);

    if (deleteStoryError) {
      throw new Error(`Failed to delete story: ${deleteStoryError.message}`);
    }

    console.log(`Successfully deleted story ${id} and all related data.`);
    res.status(204).send(); // Success, no content
    
  } catch (error: any) {
    console.error(`Error during deletion process for story ${id}:`, error.message);
    return res.status(500).json({ error: "An unexpected error occurred while deleting the story." });
  }
});

app.patch("/api/projects/:id/cover", async (req, res) => {
  const { id } = req.params;
  const { cover_image_url } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }

  if (!cover_image_url) {
    return res.status(400).json({ error: "cover_image_url is required" });
  }

  const token = authHeader.split(" ")[1];
  const supabaseUserClient = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
  } = await supabaseUserClient.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: "Invalid user token" });
  }

  const { data, error } = await supabaseUserClient
    .from("projects")
    .update({ cover_image_url })
    .eq("id", id)
    .eq("user_id", user.id); // Ensure user owns the project

  if (error) {
    console.error("Error updating project cover:", error);
    return res.status(500).json({ error: "Failed to update project cover" });
  }

  res.status(200).json(data);
});

// --- Cover Generation Endpoints ---
app.post("/api/generate-image", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res
      .status(400)
      .json({ error: "A prompt is required to generate an image." });
  }

  const IMAGE_PROMPT_PREFIX =
    "Generate a highly detailed, photorealistic image of the following scene: ";

  try {
    let result;
    try {
      const modifiedPrompt = `${IMAGE_PROMPT_PREFIX}${prompt}`;
      result = await imageGenModel.generateContent(modifiedPrompt);
    } catch (apiError: any) {
      console.error(
        "Error directly from imageGenModel.generateContent:",
        apiError,
      );
      throw new Error(
        `Gemini API call failed: ${apiError.message || "Unknown API error"}`,
      );
    }

    const response = result.response; // Get the GenerateContentResponse from the result
    console.log("Gemini Image Generation Debug Info:", {
      finishReason: response.candidates?.[0]?.finishReason,
      promptFeedback: response.promptFeedback, // Access from response
    });
    const candidates = response.candidates;

    const inlineData = candidates?.[0]?.content?.parts?.[0]?.inlineData;
    const textResponse = candidates?.[0]?.content?.parts?.[0]?.text;

    let imageUrl: string | undefined; // Declare once here

    if (inlineData?.data && inlineData?.mimeType) {
      imageUrl = `data:${inlineData.mimeType};base64,${inlineData.data}`;
      // No need for a separate if (!imageUrl) check here, as it's guaranteed to be set.
      res.json({ imageUrl: imageUrl });
    } else if (textResponse) {
      // Model returned a text response instead of an image
      res.status(200).json({
        textResponseContent: textResponse,
        message:
          "Gemini model returned a text message instead of an image. Please refine your prompt.",
      });
    } else {
      throw new Error(
        "No valid image data or text response found in Gemini response.",
      );
    }
  } catch (error) {
    console.error("Error generating image with Gemini:", error);
    res.status(500).json({ error: "Failed to generate image." });
  }
});

// --- User Profile Endpoints ---

// GET a user's basic profile info
app.get("/api/users/:userId/profile", async (req, res) => {
  const { userId } = req.params;
  try {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (error) {
      console.error(
        `Error fetching profile for user ${userId}:`,
        error.message,
      );
      // Don't throw, just return 404
      return res.status(404).json({ error: "User not found" });
    }
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ username: user.user_metadata?.username || "Anonymous" });
  } catch (error: any) {
    console.error(
      `Unexpected error fetching profile for user ${userId}:`,
      error.message,
    );
    return res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// GET all stories published by a specific user
app.get("/api/users/:userId/stories", async (req, res) => {
  const { userId } = req.params;
  try {
    // First, get the user's username to attach to all stories
    const {
      data: { user: author },
      error: authorError,
    } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (authorError) {
      console.error(`Author not found for ID ${userId}:`, authorError.message);
      // Proceed without a username, the card will handle it
    }

    const authorUsername = author?.user_metadata?.username || "Anonymous";

    // Then, fetch all stories by this user
    const { data: stories, error } = await supabase
      .from("published_stories")
      .select(
        `
        id,
        title,
        cover_image_url,
        created_at,
        user_id
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Attach the username to each story object for consistency with PublishedStoryCard component
    const storiesWithUsername = stories.map((story) => ({
      ...story,
      profiles: { username: authorUsername },
    }));

    res.json(storiesWithUsername);
  } catch (error: any) {
    console.error(`Error fetching stories for user ${userId}:`, error.message);
    return res.status(500).json({ error: "Failed to fetch user stories" });
  }
});

// GET users a specific user is subscribed to
app.get("/api/users/:userId/subscriptions", async (req, res) => {
    const { userId } = req.params;

    try {
        // 1. Get all the IDs of users the current user is subscribed to
        const { data: subscriptions, error: subsError } = await supabaseAdmin
            .from("subscriptions")
            .select("subscribed_to_id")
            .eq("subscriber_id", userId);

        if (subsError) throw subsError;

        const subscribedToIds = subscriptions.map(s => s.subscribed_to_id);

        if (subscribedToIds.length === 0) {
            return res.json([]);
        }

        // 2. Get the profile details for those IDs
        const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
        if (usersError) throw usersError;

        const subscribedToProfiles = users
            .filter(user => subscribedToIds.includes(user.id))
            .map(user => ({
                id: user.id,
                username: user.user_metadata?.username || 'Anonymous',
            }));

        res.json(subscribedToProfiles);

    } catch (error: any) {
        console.error(`Error fetching subscriptions for user ${userId}:`, error.message);
        return res.status(500).json({ error: "Failed to fetch subscriptions" });
    }
});

// --- Subscription Endpoints ---

const getUserFromToken = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // This is not an error, the user is just not logged in.
    // Let the endpoint decide if this is an error or not.
    return next();
  }
  const token = authHeader.split(" ")[1];
  const supabaseUserClient = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const {
    data: { user },
  } = await supabaseUserClient.auth.getUser();

  // Attach user to request object if they exist
  if (user) {
    (req as any).user = user;
  }

  next();
};

// server.ts 의 subscription-status 라우터 수정
app.get(
  "/api/users/:userId/subscription-status",
  getUserFromToken,
  async (req, res) => {
    const subscribedToId = req.params.userId;
    const currentUser = (req as any).user;

    if (!currentUser) {
      return res.json({ isSubscribed: false, isSelf: false });
    }

    const subscriberId = currentUser.id;
    const isSelf = subscriberId === subscribedToId;

    if (isSelf) {
      return res.json({ isSubscribed: false, isSelf: true });
    }

    try {
      // 💡 핵심 수정: supabase 대신 supabaseAdmin을 사용합니다!
      // Admin은 RLS 정책을 우회하여 서버 권한으로 모든 데이터를 볼 수 있습니다.
      const { count, error } = await supabaseAdmin
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("subscriber_id", subscriberId)
        .eq("subscribed_to_id", subscribedToId);

      if (error) throw error;

      // 이제 정상적으로 1(구독 중) 또는 0(미구독)이 찍힐 겁니다.
      console.log(`📊 [DEBUG] DB 조회 결과 (Admin 권한) - Count: ${count}`);

      res.json({
        isSubscribed: (count || 0) > 0,
        isSelf: false,
      });
    } catch (error: any) {
      console.error("❌ [ERROR] 구독 체크 실패:", error.message);
      return res.status(500).json({ error: "Failed to check status" });
    }
  },
);

// POST to subscribe to a user
app.post("/api/users/:userId/subscribe", getUserFromToken, async (req, res) => {
  const subscribedToId = req.params.userId;
  const currentUser = (req as any).user;

  if (!currentUser) {
    return res
      .status(401)
      .json({ error: "You must be logged in to subscribe." });
  }
  const subscriberId = currentUser.id;

  if (subscriberId === subscribedToId) {
    return res.status(400).json({ error: "You cannot subscribe to yourself." });
  }

  try {
    const { error } = await createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: req.headers.authorization! } },
    })
      .from("subscriptions")
      .insert({
        subscriber_id: subscriberId,
        subscribed_to_id: subscribedToId,
      });

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        return res.status(409).json({ error: "Already subscribed" });
      }
      throw error;
    }

    res.status(201).json({ message: "Successfully subscribed." });
  } catch (error: any) {
    console.error("Error subscribing:", error.message);
    return res.status(500).json({ error: "Failed to subscribe" });
  }
});

// DELETE to unsubscribe from a user
app.delete(
  "/api/users/:userId/subscribe",
  getUserFromToken,
  async (req, res) => {
    const subscribedToId = req.params.userId;
    const currentUser = (req as any).user;

    if (!currentUser) {
      return res
        .status(401)
        .json({ error: "You must be logged in to unsubscribe." });
    }
    const subscriberId = currentUser.id;

    try {
      const { error } = await createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: req.headers.authorization! } },
      })
        .from("subscriptions")
        .delete()
        .eq("subscriber_id", subscriberId)
        .eq("subscribed_to_id", subscribedToId);

      if (error) throw error;

      res.status(204).send();
    } catch (error: any) {
      console.error("Error unsubscribing:", error.message);
      return res.status(500).json({ error: "Failed to unsubscribe" });
    }
  },
);

// --- Character Relationship Endpoints ---

// GET all relationships for a project
app.get("/api/projects/:projectId/relationships", getUserFromToken, async (req, res) => {
    const { projectId } = req.params;
    const currentUser = (req as any).user;

    if (!currentUser) {
        return res.status(401).json({ error: "You must be logged in." });
    }

    try {
        const { data, error } = await createClient(supabaseUrl, supabaseKey, {
            global: { headers: { Authorization: req.headers.authorization! } },
        })
        .from("character_relationships")
        .select(`
            id,
            description,
            source_character_id,
            target_character_id,
            source:characters!source_character_id(name),
            target:characters!target_character_id(name)
        `)
        .eq('project_id', projectId);

        if (error) throw error;

        // The query now returns names, but let's format it nicely
        const formattedData = data.map(r => ({
            ...r,
            source_name: (r.source as any)?.name || 'Unknown',
            target_name: (r.target as any)?.name || 'Unknown',
        }));

        res.json(formattedData);
    } catch (error: any) {
        console.error('Error fetching relationships:', error.message);
        return res.status(500).json({ error: "Failed to fetch relationships" });
    }
});

// POST a new relationship
app.post("/api/projects/:projectId/relationships", getUserFromToken, async (req, res) => {
    const { projectId } = req.params;
    const { source_character_id, target_character_id, description } = req.body;
    const currentUser = (req as any).user;

    if (!currentUser) {
        return res.status(401).json({ error: "You must be logged in." });
    }
    
    if (!source_character_id || !target_character_id || !description) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        const { data, error } = await createClient(supabaseUrl, supabaseKey, {
            global: { headers: { Authorization: req.headers.authorization! } },
        })
        .from("character_relationships")
        .insert({
            project_id: projectId,
            source_character_id,
            target_character_id,
            description,
        })
        .select('*, source:characters!source_character_id(name), target:characters!target_character_id(name)')
        .single();
        
        if (error) throw error;
        
        const newRelationship = { ...data, source_name: (data.source as any)?.name, target_name: (data.target as any)?.name };

        res.status(201).json(newRelationship);
    } catch (error: any) {
        console.error('Error adding relationship:', error.message);
        if (error.code === '23505') {
            return res.status(409).json({ error: 'This relationship already exists.' });
        }
        return res.status(500).json({ error: "Failed to add relationship" });
    }
});

// DELETE a relationship
app.delete("/api/relationships/:relationshipId", getUserFromToken, async (req, res) => {
    const { relationshipId } = req.params;
    const currentUser = (req as any).user;

    if (!currentUser) {
        return res.status(401).json({ error: "You must be logged in." });
    }

    try {
        const { error } = await createClient(supabaseUrl, supabaseKey, {
            global: { headers: { Authorization: req.headers.authorization! } },
        })
        .from("character_relationships")
        .delete()
        .eq('id', relationshipId);

        if (error) throw error;

        res.status(204).send();
    } catch (error: any) {
        console.error('Error deleting relationship:', error.message);
        return res.status(500).json({ error: "Failed to delete relationship" });
    }
});


// --- Notification Endpoints ---

// GET all notifications for the current user
app.get("/api/notifications", getUserFromToken, async (req, res) => {
  const currentUser = (req as any).user;
  if (!currentUser) {
    return res
      .status(401)
      .json({ error: "You must be logged in to view notifications." });
  }

  try {
    // DEBUG: Using supabaseAdmin to bypass RLS for checking notifications
    const { data: notifications, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(notifications);
  } catch (error: any) {
    console.error("Error fetching notifications:", error.message);
    return res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// POST to mark all notifications as read
app.post(
  "/api/notifications/mark-all-as-read",
  getUserFromToken,
  async (req, res) => {
    const currentUser = (req as any).user;
    if (!currentUser) {
      return res.status(401).json({ error: "You must be logged in." });
    }

    try {
      const { error } = await createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: req.headers.authorization! } },
      })
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", currentUser.id)
        .eq("is_read", false);

      if (error) throw error;

      res.status(204).send();
    } catch (error: any) {
      console.error("Error marking notifications as read:", error.message);
      return res
        .status(500)
        .json({ error: "Failed to mark notifications as read" });
    }
  },
);

// --- Likes Endpoints ---
app.get("/api/published-stories/:id/likes", async (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers.authorization;

  let user = null;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    const { data } = await createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    }).auth.getUser();
    user = data.user;
  }

  try {
    // Get total like count
    const { count, error: countError } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("published_story_id", id);

    if (countError) throw countError;

    let userHasLiked = false;
    if (user) {
      const { data: likeData, error: likeError } = await supabase
        .from("likes")
        .select("*")
        .eq("published_story_id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (likeError) throw likeError;

      userHasLiked = !!likeData;
    }

    res.json({ count: count ?? 0, userHasLiked });
  } catch (error) {
    console.error(`Error fetching likes for story ${id}:`, error);
    res.status(500).json({ error: "Failed to fetch likes" });
  }
});

app.post("/api/published-stories/:id/like", async (req, res) => {
  const { id: published_story_id } = req.params;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }

  const token = authHeader.split(" ")[1];
  const supabaseUserClient = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
  } = await supabaseUserClient.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: "Invalid user token" });
  }

  const { error } = await supabaseUserClient
    .from("likes")
    .insert({ published_story_id, user_id: user.id });

  if (error) {
    console.error("Error liking story:", error);
    return res.status(500).json({ error: "Failed to like story" });
  }

  // --- Create Notification for Like (fire and forget) ---
  const createLikeNotification = async () => {
    try {
      const { data: story, error: storyError } = await supabaseAdmin
        .from("published_stories")
        .select("user_id, title")
        .eq("id", published_story_id)
        .single();

      if (storyError) throw storyError;
      
      const storyAuthorId = story.user_id;
      const likerId = user.id;

      if (storyAuthorId !== likerId) {
        await supabaseAdmin.from("notifications").insert({
          user_id: storyAuthorId,
          type: "new_like",
          data: {
            storyId: published_story_id,
            storyTitle: story.title,
            likerId: likerId,
            likerUsername: user.user_metadata?.username || 'Someone',
          }
        });
      }
    } catch(e: any) {
      console.error("Failed to run like notification creation:", e.message);
    }
  }
  createLikeNotification();
  // --- End Notification Logic ---

  res.status(201).send();
});

app.delete("/api/published-stories/:id/like", async (req, res) => {
  const { id: published_story_id } = req.params;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }

  const token = authHeader.split(" ")[1];
  const supabaseUserClient = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
  } = await supabaseUserClient.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: "Invalid user token" });
  }

  const { error } = await supabaseUserClient
    .from("likes")
    .delete()
    .eq("published_story_id", published_story_id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error unliking story:", error);
    return res.status(500).json({ error: "Failed to unlike story" });
  }

  res.status(204).send();
});

// --- Comments Endpoints ---
app.get("/api/published-stories/:id/comments", async (req, res) => {
  const { id: published_story_id } = req.params;

  try {
    const { data: comments, error } = await supabase
      .from("comments")
      .select(
        "id, content, created_at, user_id, parent_comment_id, is_anonymous",
      ) // Include new fields
      .eq("published_story_id", published_story_id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const commentsWithUsernames = await Promise.all(
      comments.map(async (comment) => {
        let username = "익명"; // Default for anonymous
        if (comment.user_id && !comment.is_anonymous) {
          // Only fetch if not anonymous and user_id exists
          const {
            data: { user },
            error: userError,
          } = await supabaseAdmin.auth.admin.getUserById(comment.user_id);
          if (userError) {
            console.error(
              `Error fetching user ${comment.user_id} for comment ${comment.id}:`,
              userError,
            );
          } else {
            username = user?.user_metadata?.username || "알 수 없음";
          }
        }
        return {
          ...comment,
          profiles: { username: username },
        };
      }),
    );

    res.json(commentsWithUsernames);
  } catch (error) {
    console.error(
      `Error fetching comments for story ${published_story_id}:`,
      error,
    );
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

app.post("/api/published-stories/:id/comments", async (req, res) => {
  const { id: published_story_id } = req.params;
  const { content, parent_comment_id = null, is_anonymous = false } = req.body;
  const authHeader = req.headers.authorization;

  if (!content) {
    return res.status(400).json({ error: "Comment content is required" });
  }

  let userIdToInsert = null;
  let usernameForResponse = "익명";
  let supabaseUserClient = supabase; // Start with the anon client

  if (is_anonymous) {
    // If anonymous, userIdToInsert remains null. RLS will check `is_anonymous = TRUE AND user_id IS NULL`.
    // No auth token is needed for anonymous posts, so we can use the anon supabase client directly.
    supabaseUserClient = supabase; // Ensure using anon client.
  } else {
    // If not anonymous, an auth token is required, and user_id must be present.
    if (!authHeader) {
      return res.status(401).json({
        error: "Authorization header is missing for non-anonymous comment.",
      });
    }
    const token = authHeader.split(" ")[1];
    supabaseUserClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const {
      data: { user },
      error: userAuthError,
    } = await supabaseUserClient.auth.getUser();

    if (userAuthError || !user) {
      console.error(
        "Error getting user for non-anonymous post:",
        userAuthError,
      );
      return res
        .status(401)
        .json({ error: "Invalid or expired user token. Please log in again." });
    }
    userIdToInsert = user.id;
    usernameForResponse = user.user_metadata.username || "알 수 없음";
  }

  const { data: newComment, error } = await supabaseUserClient
    .from("comments")
    .insert({
      published_story_id,
      user_id: userIdToInsert,
      content,
      parent_comment_id,
      is_anonymous,
    })
    .select()
    .single();

  if (error) {
    console.error("Error posting comment:", error);
    return res.status(500).json({ error: error.message });
  }

  // --- Create Notification for Comment (fire and forget) ---
  const createCommentNotification = async () => {
    try {
        const { data: story, error: storyError } = await supabaseAdmin
            .from("published_stories")
            .select("user_id, title")
            .eq("id", published_story_id)
            .single();

        if (storyError) throw storyError;

        const storyAuthorId = story.user_id;
        const commenterId = userIdToInsert; // from the parent function scope

        if (storyAuthorId && storyAuthorId !== commenterId) {
            await supabaseAdmin.from("notifications").insert({
                user_id: storyAuthorId,
                type: "new_comment",
                data: {
                    storyId: published_story_id,
                    storyTitle: story.title,
                    commenterId: commenterId,
                    commenterUsername: usernameForResponse, // from parent scope
                }
            });
        }
    } catch (e: any) {
        console.error("Failed to run comment notification creation:", e.message);
    }
  }
  createCommentNotification();
  // --- End Notification Logic ---


  const commentWithUsername = {
    ...newComment,
    profiles: { username: usernameForResponse },
  };

  res.status(201).json(commentWithUsername);
});

// PUT /api/comments/:id (Update Comment)
app.put("/api/comments/:id", async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }
  if (!content) {
    return res.status(400).json({ error: "Comment content is required" });
  }

  const token = authHeader.split(" ")[1];
  const supabaseUserClient = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error: userAuthError,
  } = await supabaseUserClient.auth.getUser();

  if (userAuthError || !user) {
    console.error("Error getting user for comment update:", userAuthError);
    return res
      .status(401)
      .json({ error: "Invalid user token. Please log in again." });
  }

  const { data: updatedComment, error } = await supabaseUserClient
    .from("comments")
    .update({ content }) // Remove edited_at for now to prevent error
    .eq("id", id)
    .eq("user_id", user.id) // Ensure only the author can update
    .select()
    .single();

  if (error) {
    console.error("Error updating comment:", error);
    return res.status(500).json({ error: error.message });
  }
  if (!updatedComment) {
    return res.status(404).json({
      error: "Comment not found or you do not have permission to update it.",
    });
  }

  // Attach username to the updated comment before sending it back
  const commentWithUsername = {
    ...updatedComment,
    profiles: { username: user.user_metadata.username || "알 수 없음" },
  };

  res.status(200).json(commentWithUsername);
});

// DELETE /api/comments/:id (Delete Comment)
app.delete("/api/comments/:id", async (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }

  const token = authHeader.split(" ")[1];
  const supabaseUserClient = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error: userAuthError,
  } = await supabaseUserClient.auth.getUser();

  if (userAuthError || !user) {
    console.error("Error getting user for comment deletion:", userAuthError);
    return res
      .status(401)
      .json({ error: "Invalid user token. Please log in again." });
  }

  const { error } = await supabaseUserClient
    .from("comments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id); // Ensure only the author can delete

  if (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ error: error.message });
  }

  res.status(204).send(); // 204 No Content for successful deletion
});

// --- Search Endpoints ---
app.get("/api/search", async (req, res) => {
  const { q } = req.query;

  if (!q || typeof q !== "string") {
    return res.status(400).json({ error: "A search query 'q' is required." });
  }

  try {
    const lowerCaseQuery = q.toLowerCase();

    // --- Search for Users ---
    const userSearchPromise = supabaseAdmin.auth.admin
      .listUsers({ perPage: 1000 })
      .then(({ data, error }) => {
        if (error) throw error;
        const filteredUsers = data.users.filter((user) =>
          user.user_metadata?.username?.toLowerCase().includes(lowerCaseQuery),
        );
        return filteredUsers.map((user) => ({
          id: user.id,
          username: user.user_metadata?.username,
        }));
      });

    // --- Search for Stories (by title) ---
    const storySearchPromise = supabase
      .from("published_stories")
      .select("id, title, user_id, cover_image_url, created_at")
      .ilike("title", `%${q}%`)
      .then(async ({ data: storyData, error: storiesError }) => {
        if (storiesError) throw storiesError;

        // Attach usernames to stories
        return Promise.all(
          (storyData || []).map(async (story) => {
            const {
              data: { user },
              error: userError,
            } = await supabaseAdmin.auth.admin.getUserById(story.user_id);
            return {
              ...story,
              profiles: {
                username: user?.user_metadata?.username || "Anonymous",
              },
            };
          }),
        );
      });

    const [userResults, storyResults] = await Promise.all([
      userSearchPromise,
      storySearchPromise,
    ]);

    res.json({
      users: userResults,
      stories: storyResults,
    });
  } catch (error: any) {
    console.error("Error in combined search:", error.message);
    return res.status(500).json({ error: "Failed to perform search" });
  }
});

// --- AI & Spell Check Endpoints ---

// New endpoint for spell checking
app.post("/api/spellcheck", async (req, res) => {
  const { text, lang = "ko" }: { text: string; lang?: "ko" | "en" } = req.body;

  if (!text) {
    return res.status(400).send("Text is required for spell checking.");
  }

  try {
    if (lang === "ko") {
      const result = await new Promise<HanspellResult[]>((resolve, reject) => {
        const collectedResults: HanspellResult[] = [];
        spellCheckByDAUM(
          text,
          10000,
          (partialResults: HanspellResult[]) => {
            // This is the 'check' callback
            collectedResults.push(...partialResults);
          },
          () => {
            // This is the 'end' callback
            resolve(collectedResults);
          },
          (err: Error) => {
            // This is the 'error' callback
            reject(err);
          },
        );
      });
      return res.json(result);
    } else if (lang === "en") {
      // Placeholder for English spell checking
      // I will need to implement this or find a suitable library later.
      return res
        .status(501)
        .send("English spell checking is not yet implemented.");
    } else {
      return res
        .status(400)
        .send(
          "Unsupported language for spell checking. Only 'ko' and 'en' are supported.",
        );
    }
  } catch (error) {
    console.error("Spell check failed:", error);
    res.status(500).send("An error occurred during spell checking.");
  }
});

app.post("/api/check-pacing", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).send("Text is required for pacing check.");
  }

  const systemInstruction = {
    role: "system",
    parts: [
      {
        text: `당신은 문학 작품의 페이싱(Pacing)을 전문적으로 분석하는 AI 편집자입니다. 작가가 제공한 텍스트를 읽고, 글의 흐름, 리듬감, 속도 조절에 대해 상세하고 구체적인 피드백을 제공해야 합니다.
    
    분석할 때 다음 사항에 중점을 두세요:
    
    1.  **전체적인 속도감:** 글의 전반적인 속도가 너무 빠른가요, 너무 느린가요, 아니면 적절한가요? 특정 장면이나 문단이 전체 흐름과 어울리지 않게 느껴지는 부분이 있나요?
    2.  **문장 길이와 리듬:** 문장의 길이가 단조롭지 않나요? 짧은 문장과 긴 문장이 효과적으로 사용되어 글에 리듬감을 부여하고 있나요? 문장 구조의 반복으로 인해 글이 지루하게 느껴지는 부분은 없나요?
    3.  **장면 전환과 흐름:** 장면이나 아이디어 간의 전환이 자연스러운가요? 독자가 따라가기 어렵게 만드는 갑작스러운 전환이나 논리적 비약은 없나요?
    4.  **긴장과 이완:** 글의 페이싱이 긴장감을 효과적으로 고조시키고 필요한 순간에 이완시키고 있나요? 독자의 감정을 조절하는 데 페이싱이 어떻게 기여하고 있나요?
    5.  **구체적인 예시:** 당신의 분석을 뒷받침하기 위해 텍스트에서 **구체적인 문장이나 구절을 직접 인용**하고, 어떤 점에서 페이싱이 좋았는지 또는 어떻게 개선할 수 있는지 설명해주세요.
    
    최종 결과물은 이 분석들을 종합하여 작가에게 건설적인 조언을 제공하는 형식이어야 합니다. 칭찬할 부분은 칭찬하고, 개선이 필요한 부분은 명확한 대안과 함께 제시해주세요.`,
      },
    ],
  };

  try {
    const chat = model.startChat({
      systemInstruction: systemInstruction,
    });

    const result = await chat.sendMessageStream(text);

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText);
    }
    res.end();
  } catch (error) {
    console.error("Pacing check failed:", error);
    res.status(500).send("An error occurred during pacing check.");
  }
});

app.post("/api/check-consistency", async (req, res) => {
  const { storyText, characterSheet } = req.body;
  if (!storyText || !characterSheet) {
    return res
      .status(400)
      .send(
        "Story text and character sheet are required for consistency check.",
      );
  }

  const systemInstruction = {
    role: "system",
    parts: [
      {
        text: `당신은 문학 작품의 캐릭터 일관성을 전문적으로 분석하는 AI 편집자입니다.
        
        **주어진 정보:**
        1.  **캐릭터 시트:** 등장인물들의 이름, 성격, 배경 등 상세 프로필입니다.
        2.  **스토리 텍스트:** 작가가 작성한 소설의 일부입니다.
        
        **당신의 임무:**
        '스토리 텍스트'를 읽고, '캐릭터 시트'에 명시된 인물들의 성격이나 설정에 맞지 않는 행동이나 대사가 있는지 분석해주세요.
        
        **분석 가이드라인:**
        *   **일관성 없는 부분 찾기:** 특정 캐릭터가 자신의 성격과 명백히 다른 말이나 행동을 하는 부분을 찾아주세요.
        *   **구체적인 인용:** 분석을 뒷받침하기 위해 '스토리 텍스트'에서 **문제가 되는 문장이나 구절을 직접 인용**해주세요.
        *   **이유 설명:** 왜 그 행동이나 대사가 캐릭터의 설정과 일관되지 않는지 '캐릭터 시트'의 내용을 근거로 명확하게 설명해주세요.
        *   **칭찬할 부분 찾기:** 반대로, 캐릭터의 성격이 아주 잘 드러나는 훌륭한 묘사가 있다면 그 부분도 인용하고 칭찬해주세요.
        *   **결과 형식:** 최종 결과물은 칭찬과 개선 제안을 모두 포함하는 종합적인 분석 보고서 형식이어야 합니다.`,
      },
    ],
  };

  try {
    const chat = model.startChat({
      systemInstruction: systemInstruction,
    });

    const message = `
        # 캐릭터 시트:
        ${characterSheet}
        
        ---
        
        # 스토리 텍스트:
        ${storyText}
              `;

    const result = await chat.sendMessageStream(message);

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText);
    }
    res.end();
  } catch (error) {
    console.error("Consistency check failed:", error);
    res.status(500).send("An error occurred during consistency check.");
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const {
      message,
      history,
      context,
      username, // Add username to the request body destructuring
    }: {
      message: string;
      history: HistoryItem[];
      context: StoryContext;
      username?: string;
    } = req.body; // Update type for username

    if (!message) {
      return res.status(400).send("Message is required");
    }

    // 1. Map frontend roles to SDK roles ('ai' -> 'model')
    const sdkHistory = (history || []).map((h) => ({
      ...h,
      role: h.role === "ai" ? "model" : h.role,
    }));

    // 2. Ensure history starts with a user role
    const validHistory = [...sdkHistory];
    if (validHistory.length > 0 && validHistory[0].role !== "user") {
      validHistory.shift();
    }

    // 3. Create a dedicated system instruction for the AI
    const systemInstruction = {
      role: "system",
      parts: [
        {
          text: `당신은 '페르소나 라이터'의 전문 글쓰기 도우미 AI입니다.
${username ? `${username}님, ` : ""} 당신은 사용자가 작성하는 소설 또는 에세이에 대한 심층적인 이해를 바탕으로 질문에 답변하고 집필을 돕습니다.

제공되는 정보는 다음과 같습니다:
1.  **스토리 설정 (Story Settings)**: 이는 현재 사용자가 집필 중인 작품의 시공간적 배경, 세계관, 중요한 사건 등 전반적인 '설정'에 대한 정보입니다.
2.  **캐릭터 시트 (Character Sheet)**: 이는 작품에 등장하는 주요 인물들의 이름, 성별, 성격, 특징, 배경 등 '등장인물'에 대한 상세 정보입니다.

다음 지침에 따라 사용자를 지원해야 합니다:
*   사용자의 질문이나 요청에 대해 위에서 제공된 '스토리 설정'과 '캐릭터 시트' 정보를 적극적으로 활용하여 일관되고 개성 있는 답변을 제공하세요.
*   설정 붕괴가 일어나지 않도록 주의하며, 작품의 세계관과 캐릭터의 성격에 부합하는 조언이나 내용을 생성해야 합니다.
*   사용자의 집필 과정을 원활하게 돕기 위해 창의적이고 유용한 아이디어를 제공하며, 필요하다면 작품의 흐름이나 캐릭터 간의 관계에 대한 통찰을 제시할 수 있습니다.
*   사용자의 질문이 특정 설정이나 캐릭터에 관련된 경우, 해당 정보를 직접 참조하여 답변의 근거로 삼으세요.
*   당신은 등장인물의 그 누구도 아니고, 사용자(나)의 집필자 도우미입니다.. 상황극 같은 건 하지마. 사용자가 원할 시에만 하세요.

# Story Settings:
${context?.settings || "제공되지 않았습니다. 사용자의 일반적인 질문에 대해 답변합니다."}

# Character Sheet:
${context?.characterSheet || "제공되지 않았습니다. 일반적인 캐릭터 분석에 대해 답변합니다."}
`,
        },
      ],
    };

    const chat = model.startChat({
      history: validHistory,
      generationConfig: {
        maxOutputTokens: 4096, // Increased maxOutputTokens
      },
      systemInstruction: systemInstruction,
    });

    const result = await chat.sendMessageStream(message);

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText);
    }

    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing your request.");
  }
});



app.listen(port, () => {
  console.log(
    `[Persona Writer] Backend server is running at http://localhost:${port}`,
  );
});
