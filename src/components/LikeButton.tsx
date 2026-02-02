import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { HeartIcon } from './Icons';

interface LikeButtonProps {
  storyId: string;
}

export const LikeButton = ({ storyId }: LikeButtonProps) => {
  const { session } = useAuth();
  const [likes, setLikes] = useState(0);
  const [userHasLiked, setUserHasLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        setLoading(true);
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (session) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/published-stories/${storyId}/likes`, { headers });
        
        if (!response.ok) {
          throw new Error('Failed to fetch likes');
        }
        
        const data = await response.json();
        setLikes(data.count);
        setUserHasLiked(data.userHasLiked);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikes();
  }, [storyId, session]);

  const handleLike = async () => {
    if (!session) {
      alert('로그인이 필요합니다.');
      return;
    }

    const originalLikes = likes;
    const originalUserHasLiked = userHasLiked;

    // Optimistic update
    setLikes(userHasLiked ? likes - 1 : likes + 1);
    setUserHasLiked(!userHasLiked);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/published-stories/${storyId}/like`, {
        method: userHasLiked ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update like status');
      }
    } catch (error) {
      console.error(error);
      // Revert on error
      setLikes(originalLikes);
      setUserHasLiked(originalUserHasLiked);
      alert('좋아요 처리에 실패했습니다.');
    }
  };

  if (loading) {
    return <div className="w-20 h-8 rounded-full bg-gray-200 animate-pulse" />;
  }

  return (
    <button
      onClick={handleLike}
      disabled={!session}
      className="flex items-center space-x-2 px-4 py-2 rounded-full border transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-ink/80 dark:text-pale-lavender/80 border-ink/20 dark:border-pale-lavender/20 hover:bg-ink/5 dark:hover:bg-pale-lavender/10"
    >
      {userHasLiked ? (
        <HeartIcon className="w-6 h-6 text-red-500" />
      ) : (
        <HeartIcon className="w-6 h-6" />
      )}
      <span className="font-semibold">{likes}</span>
    </button>
  );
};
