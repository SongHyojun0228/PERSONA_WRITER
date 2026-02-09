import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublishedStoryCard from './PublishedStoryCard';
import { SearchIcon } from './Icons';
import { PurchaseConfirmationModal } from './PurchaseConfirmationModal';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { calculateReadTime } from '../lib/utils';
import { SkeletonCardGrid } from './SkeletonCard';
import { LoadingBar } from './LoadingBar';

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
  likesCount?: number;
  user_id: string; // Ensure user_id is part of the interface
  isOwned?: boolean;
  isPurchased?: boolean;
  remainingDays?: number;
}

interface StoryToPurchase {
  id: string;
  title: string;
  costInInspiration: number;
}

interface PurchasedStoryInfo {
  id: string;
  expiry_date: string;
}

const STORIES_PER_PAGE = 16; // Define stories per page

// Helper function to extract first paragraph from HTML content
const extractFirstParagraph = (htmlContent: string): string => {
  if (!htmlContent) return '';

  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  // Get text content and extract first ~200 characters
  const textContent = tempDiv.textContent || tempDiv.innerText || '';
  const firstParagraph = textContent.trim().substring(0, 200);

  return firstParagraph ? firstParagraph + (textContent.length > 200 ? '...' : '') : '';
};

const Community = () => {
  const [stories, setStories] = useState<PublishedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'newest' | 'likes'>('newest');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { session, inspirationCount, user, refreshUserProfile } = useAuth();

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [storyToPurchase, setStoryToPurchase] = useState<StoryToPurchase | null>(null);
  const [, setPurchasedStories] = useState<PurchasedStoryInfo[]>([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // 1. Fetch base published stories
        const url = `${import.meta.env.VITE_API_URL}/api/published-stories?sort=${sortOrder}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch stories');
        const publishedStoriesData = await response.json();

        // 2. Fetch user's purchased stories if logged in
        let userPurchases: PurchasedStoryInfo[] = [];
        if (user) {
          const { data: purchaseData, error } = await supabase
            .from('user_story_purchases')
            .select('published_story_id, expiry_date')
            .eq('user_id', user.id);
          if (error) {
            console.error('Error fetching purchased stories:', error);
          } else {
            userPurchases = purchaseData.map(p => ({ id: p.published_story_id, expiry_date: p.expiry_date }))
            setPurchasedStories(userPurchases);
          }
        }
        
        // 3. Fetch likes, comments, and process all stories
        const processedStories = await Promise.all(
          publishedStoriesData.map(async (story: PublishedStory) => {
            // Fetch likes
            const { count: likesCount, error: likesError } = await supabase
              .from('likes')
              .select('*', { count: 'exact', head: true })
              .eq('published_story_id', story.id);

            // Fetch comments count
            const { count: commentsCount, error: commentsError } = await supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('published_story_id', story.id);

            // Check ownership and purchase status
            const isOwned = user ? story.user_id === user.id : false;
            const purchaseInfo = userPurchases.find(p => p.id === story.id);

            let isPurchased = false;
            let remainingDays: number | undefined = undefined;

            if (purchaseInfo) {
              const expiresAt = new Date(purchaseInfo.expiry_date);
              const remainingTime = expiresAt.getTime() - new Date().getTime();

              if (remainingTime > 0) {
                isPurchased = true;
                remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
              }
            }

            return {
              ...story,
              likesCount: likesError ? 0 : likesCount || 0,
              commentsCount: commentsError ? 0 : commentsCount || 0,
              isOwned,
              isPurchased,
              remainingDays,
            };
          })
        );
        
        // Set all stories, do not filter out expired ones from view
        setStories(processedStories);
        // Total pages will be recalculated based on filtered stories

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [sortOrder, user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
        navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
        setQuery('');
    }
  };

  const handleStoryClick = (storyId: string) => {
    if (!session) {
      alert('로그인해야 글을 읽을 수 있습니다.');
      navigate('/login');
      return;
    }
    
    const story = stories.find(s => s.id === storyId);
    if (!story) return;

    // If user owns the story or has already purchased it (and it's not expired), navigate directly
    if (story.isOwned || story.isPurchased) {
      navigate(`/story/${storyId}`);
      return;
    }

    // Otherwise, for paid stories, open the purchase confirmation modal
    if (story.is_paid) {
      const cost = story.price ? story.price / 100 : 0;
      setStoryToPurchase({ id: storyId, title: story.title, costInInspiration: cost });
      setIsPurchaseModalOpen(true);
    } else {
      // For free stories, navigate directly
      navigate(`/story/${storyId}`);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!storyToPurchase || !user || inspirationCount === null) {
      alert('구매를 진행할 수 없습니다.');
      return;
    }

    const { id: storyId, title: storyTitle, costInInspiration } = storyToPurchase;

    if (inspirationCount < costInInspiration) {
      alert('영감이 부족합니다. 영감을 충전해주세요!');
      return;
    }

    try {
      // Deduct inspiration from user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ inspiration_count: inspirationCount - costInInspiration })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Calculate expiry date (2 weeks from now)
      const purchaseDate = new Date();
      const expiryDate = new Date(purchaseDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

      // Upsert purchase record to handle re-purchases
      const { error: purchaseError } = await supabase
        .from('user_story_purchases')
        .upsert(
          {
            user_id: user.id,
            published_story_id: storyId,
            purchase_date: purchaseDate.toISOString(),
            expiry_date: expiryDate.toISOString(),
          },
          {
            onConflict: 'user_id,published_story_id', // The columns that have a UNIQUE constraint
          }
        )
        .select()
        .single();

      if (purchaseError) {
        // If there's a purchase error, attempt to revert inspiration deduction
        await supabase
          .from('profiles')
          .update({ inspiration_count: inspirationCount }) // Revert
          .eq('id', user.id);
        throw purchaseError;
      }

      alert(`'${storyTitle}' 글을 ${costInInspiration} 영감으로 구매했습니다! 2주간 열람 가능합니다.`);
      await refreshUserProfile(); // Refresh the user profile to get the updated inspiration count
      navigate(`/story/${storyId}`);
    } catch (error: any) {
      console.error('영감 사용 중 오류 발생:', error);
      alert(`영감 사용 중 오류가 발생했습니다: ${error.message}. 다시 시도해주세요.`);
    } finally {
      setIsPurchaseModalOpen(false);
      setStoryToPurchase(null);
    }
  };

  const handleClosePurchaseModal = () => {
    setIsPurchaseModalOpen(false);
    setStoryToPurchase(null);
    // As requested, if "아니요" is clicked, stay on the current page (Community)
  };

  // Filter stories by genre
  const filteredStories = genreFilter === 'all'
    ? stories
    : stories.filter(story => (story as any).genre === genreFilter);

  // Update total pages based on filtered results
  const totalPagesForFiltered = Math.ceil(filteredStories.length / STORIES_PER_PAGE);

  // Calculate stories for the current page
  const indexOfLastStory = currentPage * STORIES_PER_PAGE;
  const indexOfFirstStory = indexOfLastStory - STORIES_PER_PAGE;
  const currentStories = filteredStories.slice(indexOfFirstStory, indexOfLastStory);

  return (
    <div className="max-w-6xl mx-auto">
      <LoadingBar isLoading={loading} />
      <div className="flex flex-wrap items-center mb-4 px-4 gap-2 sm:gap-3">
        {/* Sorting Buttons */}
        <div className="flex-shrink-0 flex items-center space-x-2 p-1 rounded-lg bg-gray-200 dark:bg-forest-sub">
          <button
            onClick={() => setSortOrder('newest')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              sortOrder === 'newest'
                ? 'bg-white dark:bg-forest-primary text-ink dark:text-white shadow-sm'
                : 'text-ink/60 dark:text-pale-lavender/60 hover:bg-gray-300/50 dark:hover:bg-forest-sub-light'
            }`}
          >
            신작순
          </button>
          <button
            onClick={() => setSortOrder('likes')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              sortOrder === 'likes'
                ? 'bg-white dark:bg-forest-primary text-ink dark:text-white shadow-sm'
                : 'text-ink/60 dark:text-pale-lavender/60 hover:bg-gray-300/50 dark:hover:bg-forest-sub-light'
            }`}
          >
            인기순
          </button>
        </div>

        {/* Genre Filter */}
        <div className="flex-shrink-0">
          <select
            value={genreFilter}
            onChange={(e) => {
              setGenreFilter(e.target.value);
              setCurrentPage(1); // Reset to first page when filter changes
            }}
            className="px-3 py-1 rounded-md text-sm font-medium bg-white dark:bg-forest-primary text-ink dark:text-white border-2 border-gray-200 dark:border-forest-sub focus:outline-none focus:border-primary-accent dark:focus:border-dark-accent transition-colors"
          >
            <option value="all">모든 장르</option>
            <option value="로맨스">로맨스</option>
            <option value="판타지">판타지</option>
            <option value="SF">SF</option>
            <option value="미스터리">미스터리</option>
            <option value="에세이">에세이</option>
            <option value="일상">일상</option>
            <option value="기타">기타</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[200px] sm:max-w-[300px] sm:ml-auto">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="작품명 또는 작가 이름 검색..."
                    className="w-full p-2 pl-4 pr-10 text-sm border-2 rounded-full bg-paper dark:bg-forest-sub border-ink/10 dark:border-pale-lavender/20 focus:border-primary-accent dark:focus:border-dark-accent focus:outline-none transition-colors"
                />
                <button type="submit" aria-label="Search" className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-ink/50 dark:text-pale-lavender/50 hover:text-primary-accent dark:hover:text-dark-accent">
                    <SearchIcon className="w-4 h-4" />
                </button>
            </form>
        </div>
      </div>
      {loading ? (
        <SkeletonCardGrid count={16} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
            {currentStories.length > 0 ? (
              currentStories.map(story => (
                <PublishedStoryCard
                  key={story.id}
                  story={story}
                  onStoryClick={handleStoryClick}
                  likesCount={story.likesCount}
                  commentsCount={(story as any).commentsCount}
                  viewsCount={(story as any).view_count}
                  genre={(story as any).genre}
                  description={(story as any).description}
                  readTime={(story as any).content ? calculateReadTime((story as any).content) : undefined}
                  preview={(story as any).content ? extractFirstParagraph((story as any).content) : undefined}
                  overridePriceText={story.isOwned ? "작가님의 글" : undefined}
                  remainingTime={story.isPurchased && story.remainingDays ? `${story.remainingDays}일 남음` : undefined}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-ink/60 px-4">아직 발행된 이야기가 없습니다.</p>
            )}
          </div>

          {totalPagesForFiltered > 1 && ( // Only show pagination if there's more than one page
            <div className="flex justify-center items-center space-x-4 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg bg-primary-accent/10 dark:bg-dark-accent/10 text-ink dark:text-pale-lavender border-ink/20 dark:border-pale-lavender/20 hover:bg-primary-accent dark:hover:bg-dark-accent hover:text-white transition-colors duration-200 disabled:opacity-50"
              >
                이전
              </button>
              <span className="text-ink dark:text-pale-lavender">
                페이지 {currentPage} / {totalPagesForFiltered}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPagesForFiltered, prev + 1))}
                disabled={currentPage === totalPagesForFiltered}
                className="px-4 py-2 border rounded-lg bg-primary-accent/10 dark:bg-dark-accent/10 text-ink dark:text-pale-lavender border-ink/20 dark:border-pale-lavender/20 hover:bg-primary-accent dark:hover:bg-dark-accent hover:text-white transition-colors duration-200 disabled:opacity-50"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}

      {/* Purchase Confirmation Modal */}
      {storyToPurchase && (
        <PurchaseConfirmationModal
          isOpen={isPurchaseModalOpen}
          onClose={handleClosePurchaseModal}
          onConfirm={handleConfirmPurchase}
          storyTitle={storyToPurchase.title}
          costInInspiration={storyToPurchase.costInInspiration}
          currentUserInspiration={inspirationCount !== null ? inspirationCount : 0}
        />
      )}
    </div>
  );
};

export default Community;

