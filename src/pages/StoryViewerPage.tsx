import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LikeButton } from '../components/LikeButton';
import { CommentSection } from '../components/CommentSection';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { PencilIcon, DownloadIcon } from '../components/Icons';
import { supabase } from '../lib/supabaseClient';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { LoadingBar } from '../components/LoadingBar';
import { generateEpub, downloadEpub } from '../lib/epubGenerator';

interface PublishedStory {
  id: string;
  title: string;
  content: string;
  cover_image_url?: string;
  profiles: {
    username: string;
  };
  created_at: string;
  user_id: string; // Ensure user_id is in the interface
  is_paid: boolean; // Add is_paid
  price?: number; // Add price
}

const StoryViewerPage = () => {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth(); // Get session and user to check user ID
  const [story, setStory] = useState<PublishedStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for edit modal visibility
  const [editTitleInput, setEditTitleInput] = useState(''); // Input for editing title
  const [editCoverImageUrlInput, setEditCoverImageUrlInput] = useState(''); // Input for editing cover image URL

  useEffect(() => {
    const fetchStory = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/published-stories/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch story');
        }
        const data = await response.json();
        setStory(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  // Track story view
  useEffect(() => {
    const trackView = async () => {
      if (!id || !session?.user?.id) return;

      try {
        // Insert view record (upsert to prevent duplicates per user)
        await supabase
          .from('story_views')
          .upsert({
            published_story_id: id,
            user_id: session.user.id,
            viewed_at: new Date().toISOString()
          }, {
            onConflict: 'published_story_id,user_id'
          });

        // Increment view_count on published_stories
        const { data: currentStory } = await supabase
          .from('published_stories')
          .select('view_count')
          .eq('id', id)
          .single();

        if (currentStory) {
          await supabase
            .from('published_stories')
            .update({ view_count: (currentStory.view_count || 0) + 1 })
            .eq('id', id);
        }
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    trackView();
  }, [id, session]);

  const executeEditStory = async () => {
    if (!story || !session) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/published-stories/${story.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: editTitleInput,
          coverImageUrl: editCoverImageUrlInput || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '글 수정에 실패했습니다.');
      }

      alert('글이 성공적으로 수정되었습니다!');
      setIsEditModalOpen(false);
      // Update the displayed story directly after successful edit
      setStory(prevStory => {
          if (!prevStory) return null;
          return {
              ...prevStory,
              title: editTitleInput,
              cover_image_url: editCoverImageUrlInput || undefined,
          };
      });
    } catch (err: any) {
      console.error("Error updating published story:", err);
      // Optionally, set error state for display on the page
    }
  };

  const handleOpenEditModal = () => {
    if (!story) return;
    setEditTitleInput(story.title);
    setEditCoverImageUrlInput(story.cover_image_url || '');
    setIsEditModalOpen(true);
  };

  const handleDownloadEpub = async () => {
    if (!story) return;

    try {
      // Generate EPUB with story content
      const blob = await generateEpub(
        {
          title: story.title,
          author: story.profiles.username,
          language: 'ko',
        },
        [{
          title: story.title,
          content: story.content,
        }]
      );

      // Download
      downloadEpub(blob, story.title);
      alert('EPUB 파일이 다운로드되었습니다!');
    } catch (error) {
      console.error('EPUB 생성 오류:', error);
      alert('EPUB 파일 생성 중 오류가 발생했습니다.');
    }
  };

  const isAuthor = session?.user?.id === story?.user_id;

  if (loading) {
    return (
      <>
        <LoadingBar isLoading={loading} />
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" text="이야기를 불러오는 중..." />
        </div>
      </>
    );
  }

  if (!story) {
    return <div className="min-h-screen flex items-center justify-center">이야기를 찾을 수 없습니다.</div>;
  }

  return (
    <>
      <header className="flex justify-between items-center p-4 border-b border-ink/10 dark:border-pale-lavender/10"> {/* Changed to justify-between for edit button */}
        <Link to="/">
          <h1 className="text-xl font-bold text-primary-accent dark:text-dark-accent">
            Persona Writer
          </h1>
        </Link>
        {isAuthor && (
            <button
                onClick={handleOpenEditModal}
                className="p-2 rounded-full hover:bg-blue-500/20 text-blue-500 transition-colors"
                title="글 수정"
            >
                <PencilIcon className="w-5 h-5" />
            </button>
        )}
      </header>
      <div className="max-w-4xl mx-auto p-8">
        {story.cover_image_url ? (
          <img src={story.cover_image_url} alt={`${story.title} cover`} className="w-full h-96 object-cover rounded-lg mb-8" />
        ) : (
          <div className="w-full h-96 bg-primary-accent dark:bg-dark-accent rounded-lg mb-8" />
        )}

        <div className="mb-12"> {/* Container for title and meta, increased bottom margin */}
            <div className="flex justify-between items-center mb-6"> {/* Increased bottom margin for flex container */}
                <h1 className="text-5xl font-extrabold flex-grow mr-8 leading-tight text-primary-accent dark:text-dark-accent">{story.title}</h1> {/* Title on left, added right margin, adjusted line height and color */}
                <div className="text-right flex-shrink-0"> {/* Meta on right */}
                    <p className="text-lg font-semibold text-primary-accent dark:text-dark-accent">{story.profiles.username}</p>
                    <p className="text-sm text-ink/40 mt-1">
                        {new Date(story.created_at).toLocaleDateString()} 발행
                    </p>
                </div>
            </div>
            {/* Separator */}
            <hr className="my-12 border-t border-ink/10 dark:border-pale-lavender/10" /> {/* Separator */}
        </div>
        
        <main
          className="prose dark:prose-invert lg:prose-xl mx-auto" // Removed border-b pb-8 mt-12, adjusted for new spacing
          dangerouslySetInnerHTML={{ __html: story.content }}
        />

        <section className="mt-8">
            <div className="flex justify-center items-center space-x-4">
              <LikeButton storyId={story.id} />
              <button
                onClick={handleDownloadEpub}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-accent/10 dark:bg-dark-accent/10 text-primary-accent dark:text-dark-accent rounded-lg hover:bg-primary-accent hover:text-white dark:hover:bg-dark-accent transition-colors"
                title="E-Book 다운로드"
              >
                <DownloadIcon className="w-5 h-5" />
                <span className="font-medium">E-Book 다운로드</span>
              </button>
            </div>
            <CommentSection storyId={story.id} />
        </section>
      </div>

      {/* Edit Published Story Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="글 수정"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="editTitle" className="block text-sm font-medium text-ink/80 dark:text-pale-lavender/80 mb-1">제목</label>
            <input
              type="text"
              id="editTitle"
              className="w-full p-2 border-2 rounded-lg bg-paper dark:bg-forest-sub border-ink/20 dark:border-pale-lavender/20 focus:border-primary-accent dark:focus:border-dark-accent focus:outline-none"
              value={editTitleInput}
              onChange={(e) => setEditTitleInput(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="editCoverImageUrl" className="block text-sm font-medium text-ink/80 dark:text-pale-lavender/80 mb-1">표지 이미지 URL (선택 사항)</label>
            <input
              type="text"
              id="editCoverImageUrl"
              className="w-full p-2 border-2 rounded-lg bg-paper dark:bg-forest-sub border-ink/20 dark:border-pale-lavender/20 focus:border-primary-accent dark:focus:border-dark-accent focus:outline-none"
              value={editCoverImageUrlInput}
              onChange={(e) => setEditCoverImageUrlInput(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border border-ink/20 dark:border-pale-lavender/20 text-ink dark:text-pale-lavender font-semibold rounded-lg hover:bg-ink/5 dark:hover:bg-pale-lavender/10 transition-colors"
            >
              취소
            </button>
            <button
              onClick={executeEditStory}
              className="px-4 py-2 bg-primary-accent text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors"
            >
              수정 완료
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default StoryViewerPage;
