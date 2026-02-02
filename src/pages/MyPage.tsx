import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import PublishedStoryCard from "../components/PublishedStoryCard";
import { Modal } from "../components/Modal";
import { Link } from "react-router-dom";
import spiritIcon from "../assets/spirit.png";

interface PublishedStory {

  id: string;

  title: string;

  cover_image_url?: string;

  profiles: {

    username: string;

  };

  created_at: string;

  is_paid: boolean;

  price?: number;

}



interface PurchasedStory extends Omit<PublishedStory, 'profiles'> {

  remaining_days: number;

  profiles: {

    username: string;

  };

}

interface SubscribedUser {
  id: string;
  username: string;
}

export const MyPage = () => {
  const { session, username, inspirationCount } = useAuth();
  const [myPublishedStories, setMyPublishedStories] = useState<
    PublishedStory[]
  >([]);
  const [purchasedStories, setPurchasedStories] = useState<PurchasedStory[]>(
    [],
  );
  const [subscriptions, setSubscriptions] = useState<SubscribedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentStoryToEdit, setCurrentStoryToEdit] =
    useState<PublishedStory | null>(null);
  const [editTitleInput, setEditTitleInput] = useState("");
  const [editCoverImageUrlInput, setEditCoverImageUrlInput] = useState("");

  const fetchMyPublishedStories = useCallback(async () => {
    if (!session?.user?.id) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    setError(null);

    try {
      const { data: stories, error: storiesError } = await supabase
        .from("published_stories")
        .select(
          `
          id,
          title,
          cover_image_url,
          created_at,
          user_id,
          is_paid,
          price
        `,
        )
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (storiesError) throw storiesError;

      const userUsername =
        session?.user?.user_metadata?.username || "Anonymous";
      const storiesWithUsername = stories.map((story) => ({
        ...story,
        profiles: { username: userUsername },
      }));

      setMyPublishedStories(storiesWithUsername);
    } catch (err: any) {
      console.error("Error fetching my published stories:", err);
      setError(err.message || "내가 발행한 글을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [session]);

  const fetchSubscriptions = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${session.user.id}/subscriptions`,);
      if (!response.ok) throw new Error("Failed to fetch subscriptions");
      const data = await response.json();
      setSubscriptions(data);
    } catch (err: any) {
      console.error("Error fetching subscriptions:", err);
    }
  }, [session]);

  const fetchPurchasedStories = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const { data: purchases, error: purchaseError } = await supabase
        .from("user_story_purchases")
        .select(`
          expiry_date,
          published_stories (id, title, cover_image_url, created_at, user_id, is_paid, price)
        `)
        .eq("user_id", session.user.id);

      if (purchaseError) throw purchaseError;
      if (!purchases) {
        setPurchasedStories([]);
        return;
      }

      // Step 1: Create a clean, well-typed array of stories that have been purchased.
      const purchasedStoriesFromDB = purchases
        .map(p => {
          // Supabase returns a to-one relationship as an array if no unique constraint is on the FK. Handle both cases.
          const storyData = Array.isArray(p.published_stories) ? p.published_stories[0] : p.published_stories;
          if (!storyData) return null;
          return {
            ...storyData,
            expiry_date: p.expiry_date,
          };
        })
        .filter((s): s is NonNullable<typeof s> => s !== null); // Simple, effective filter for nulls.

      // Step 2: Get author profiles.
      const authorIds = [...new Set(purchasedStoriesFromDB.map(s => s.user_id))];
      const authorPromises = authorIds.map(id =>
        fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}/profile`)
          .then(res => {
            if (!res.ok) return { id, username: "Anonymous" };
            return res.json();
          })
          .then(profile => ({ id, username: profile.username || "Anonymous" }))
          .catch(() => ({ id, username: "Anonymous" }))
      );
      const authors = await Promise.all(authorPromises);
      const authorMap = new Map(authors.map(a => [a.id, a.username]));

      // Step 3: Combine all data into the final shape.
      const finalStories: PurchasedStory[] = purchasedStoriesFromDB.map(story => {
        const expiresAt = new Date(story.expiry_date);
        const remainingTime = expiresAt.getTime() - new Date().getTime();
        const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
        
        // This object must match the `PurchasedStory` interface.
        return {
          id: story.id,
          title: story.title,
          cover_image_url: story.cover_image_url,
          created_at: story.created_at,
          is_paid: story.is_paid,
          price: story.price,
          remaining_days: remainingDays > 0 ? remainingDays : 0,
          profiles: {
            username: authorMap.get(story.user_id) || "Anonymous",
          },
        };
      });

      // Step 4: Set the state.
      setPurchasedStories(finalStories.filter(story => story.remaining_days > 0));

    } catch (err: any) {
      console.error("Error fetching purchased stories:", err);
      setError(err.message || "구매한 글 목록을 불러오는 데 실패했습니다.");
    }
  }, [session]);

  useEffect(() => {
    fetchMyPublishedStories();
    fetchSubscriptions();
    fetchPurchasedStories();
  }, [fetchMyPublishedStories, fetchSubscriptions, fetchPurchasedStories]);

  const executeEditStory = async () => {
    if (!currentStoryToEdit || !session) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/published-stories/${currentStoryToEdit.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            title: editTitleInput,
            coverImageUrl: editCoverImageUrlInput || null,
          }),
        },
      );

      if (!response.ok) throw new Error("발행 글 수정에 실패했습니다.");

      alert("글이 성공적으로 수정되었습니다!");
      setIsEditModalOpen(false);
      fetchMyPublishedStories();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteStory = async (storyId: string, storyTitle: string) => {
    if (!window.confirm(`'${storyTitle}' 글을 정말로 삭제하시겠습니까?`))
      return;
    if (!session) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/published-stories/${storyId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.access_token}` },
        },
      );

      if (!response.ok) throw new Error("삭제 실패");

      alert("글이 삭제되었습니다.");
      fetchMyPublishedStories();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        로딩 중...
      </div>
    );

  return (
    <div className="min-h-screen p-8">
      <header className="mb-8 flex justify-between items-center border-b pb-8">
        <Link to="/">
          <h1 className="text-xl font-bold">Persona Writer</h1>
        </Link>
        <div className="text-center">
          <h1 className="text-4xl font-extrabold flex items-center justify-center space-x-2">
            <span>{username}님 작품</span>
            <img src={spiritIcon} alt="Inspiration" className="h-6 w-6" />
            <span className="text-2xl">{inspirationCount}</span>
          </h1>
        </div>
        <div className="w-48"></div>
      </header>

      <main>
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">내가 발행한 글</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {myPublishedStories.map((story) => (
              <PublishedStoryCard
                key={story.id}
                story={{ ...story, is_paid: false }}
                onEdit={() => {
                  setCurrentStoryToEdit(story);
                  setEditTitleInput(story.title);
                  setEditCoverImageUrlInput(story.cover_image_url || "");
                  setIsEditModalOpen(true);
                }}
                onDelete={() => handleDeleteStory(story.id, story.title)}
                onStoryClick={() => {}}
              />
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">내가 구매한 글</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {purchasedStories.map((story) => (
              <PublishedStoryCard
                key={story.id}
                story={{ ...story, is_paid: false }}
                onStoryClick={() => {}}
                remainingTime={`${story.remaining_days}일 남음`}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">구독한 작가</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {subscriptions.map((user) => (
              <Link
                to={`/users/${user.id}`}
                key={user.id}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-20 h-20 rounded-full bg-primary-accent/10 flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold">
                    {user.username.charAt(0)}
                  </span>
                </div>
                <span className="font-semibold">{user.username}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="발행 글 수정"
      >
        <div className="space-y-4">
          <input
            className="w-full p-2 border rounded"
            value={editTitleInput}
            onChange={(e) => setEditTitleInput(e.target.value)}
          />
          <input
            className="w-full p-2 border rounded"
            value={editCoverImageUrlInput}
            onChange={(e) => setEditCoverImageUrlInput(e.target.value)}
            placeholder="표지 URL"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2"
            >
              취소
            </button>
            <button
              onClick={executeEditStory}
              className="px-4 py-2 bg-primary-accent text-white rounded"
            >
              수정
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
