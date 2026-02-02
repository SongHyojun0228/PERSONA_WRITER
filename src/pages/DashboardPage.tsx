import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { LeftSidebar } from '../components/layout/LeftSidebar';
import { MainContent } from '../components/layout/MainContent';
import { RightSidebar } from '../components/layout/RightSidebar';
import { EditorProvider, useEditorContext } from '../context/EditorContext';
import { ProjectProvider, useProjectContext } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { type Project } from '../data/mock';
import { CoverGeneratorModal } from '../components/CoverGeneratorModal';
import { Modal } from '../components/Modal'; // Import Modal component

// This is the inner component that renders once the project is loaded
const Dashboard = () => {
  const { project, setProject, setActiveView } = useProjectContext();
  const { editorContent } = useEditorContext();
  const { session } = useAuth();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isPublishConfirmModalOpen, setIsPublishConfirmModalOpen] = useState(false);
  const [publishTitleInput, setPublishTitleInput] = useState('');
  const [publishCoverImageUrlInput, setPublishCoverImageUrlInput] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState(300);
  const [priceError, setPriceError] = useState('');

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) {
        setError("Project ID is missing.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data: projectData, error: projectError } = await supabase.from('projects').select('*').eq('id', projectId).single();
        if (projectError) throw projectError;
        const { data: charactersData, error: charactersError } = await supabase.from('characters').select('*').eq('project_id', projectId);
        if (charactersError) throw charactersError;
        const { data: pagesData, error: pagesError } = await supabase.from('pages').select('*').eq('project_id', projectId).order('sort_order', { ascending: true });
        if (pagesError) throw pagesError;
        const { data: foreshadowsData, error: foreshadowsError } = await supabase.from('foreshadows').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
        if (foreshadowsError) throw foreshadowsError;
        const { data: mergedPagesData, error: mergedPagesError } = await supabase.from('merged_pages').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
        if (mergedPagesError) throw mergedPagesError;
        
        // 6. Fetch Relationships
        const relationshipsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}/relationships`, {
            headers: { 'Authorization': `Bearer ${session?.access_token}` }, // Add optional chaining
        });

        if (!relationshipsResponse.ok) {
            const errorBody = await relationshipsResponse.json();
            throw new Error(errorBody.error || `Failed to fetch relationships with status ${relationshipsResponse.status}`);
        }
        const relationshipsData = await relationshipsResponse.json();


        const settingsPage = pagesData.find(p => p.type === 'SETTINGS');
        let regularPages = pagesData.filter(p => p.type === 'PAGE');
        regularPages.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

        if (!settingsPage) {
            setError("Settings page not found for this project.");
            setLoading(false);
            return;
        }

        const fullProject: Project = {
          id: projectData.id,
          user_id: projectData.user_id,
          name: projectData.name,
          created_at: projectData.created_at,
          cover_image_url: projectData.cover_image_url,
          settings: settingsPage,
          characters: charactersData || [],
          pages: regularPages || [],
          foreshadows: foreshadowsData || [],
          mergedPages: mergedPagesData || [],
          relationships: relationshipsData || [],
        };
        setProject(fullProject);
        setActiveView({ type: 'settings', id: settingsPage.id });
      } catch (err: any) {
        console.error("Error fetching project details:", err);
        setError(err.message || "Failed to load project details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjectDetails();
  }, [projectId, setProject, setActiveView]);

  const executePublish = async () => {
    if (isPaid) {
      if (price < 300 || price > 500) {
        setPriceError('가격은 300원에서 500원 사이로 설정해야 합니다.');
        return;
      }
    }
    
    if (!project || !editorContent || !session) {
      alert("발행할 콘텐츠가 없거나 로그인이 필요합니다.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          projectId: project.id,
          title: publishTitleInput,
          content: editorContent,
          coverImageUrl: publishCoverImageUrlInput || null,
          is_paid: isPaid,
          price: isPaid ? price : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '발행에 실패했습니다.');
      }

      const publishedStory = await response.json();
      alert('성공적으로 발행되었습니다!');
      navigate(`/story/${publishedStory.id}`);
    } catch (error: any) {
      console.error('Publishing error:', error);
      alert(`오류: ${error.message}`);
    } finally {
      setIsPublishConfirmModalOpen(false);
    }
  };

  const handlePublishClick = () => {
    if (!project || !editorContent) {
      alert("발행할 콘텐츠가 없습니다.");
      return;
    }
    setPublishTitleInput(project.name);
    setPublishCoverImageUrlInput(project.cover_image_url || '');
    setIsPaid(false);
    setPrice(300);
    setPriceError('');
    setIsPublishConfirmModalOpen(true);
  };
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = Number(e.target.value);
    setPrice(newPrice);
    if (newPrice < 300 || newPrice > 500) {
      setPriceError('가격은 300원에서 500원 사이로 설정해야 합니다.');
    } else {
      setPriceError('');
    }
  };

  const handleGenerateCover = () => setIsCoverModalOpen(true);

  if (loading) return <div className="min-h-screen flex items-center justify-center">프로젝트 상세 정보 불러오는 중...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">오류: {error}</div>;

  return (
    <>
      <div className="flex flex-col h-screen font-sans">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <LeftSidebar />
          <MainContent />
          <RightSidebar onPublish={handlePublishClick} onGenerateCover={handleGenerateCover} />
        </div>
      </div>
      <CoverGeneratorModal isOpen={isCoverModalOpen} onClose={() => setIsCoverModalOpen(false)} />
      <Modal isOpen={isPublishConfirmModalOpen} onClose={() => setIsPublishConfirmModalOpen(false)} title="게시물 발행 확인">
        <div className="space-y-4">
          <div>
            <label htmlFor="publishTitle" className="block text-sm font-medium text-ink/80 dark:text-pale-lavender/80 mb-1">제목</label>
            <input type="text" id="publishTitle" className="w-full p-2 border-2 rounded-lg bg-paper dark:bg-forest-sub border-ink/20 dark:border-pale-lavender/20 focus:border-primary-accent dark:focus:border-dark-accent focus:outline-none" value={publishTitleInput} onChange={(e) => setPublishTitleInput(e.target.value)} />
          </div>
          <div>
            <label htmlFor="publishCoverImageUrl" className="block text-sm font-medium text-ink/80 dark:text-pale-lavender/80 mb-1">표지 이미지 URL (선택 사항)</label>
            <input type="text" id="publishCoverImageUrl" className="w-full p-2 border-2 rounded-lg bg-paper dark:bg-forest-sub border-ink/20 dark:border-pale-lavender/20 focus:border-primary-accent dark:focus:border-dark-accent focus:outline-none" value={publishCoverImageUrlInput} onChange={(e) => setPublishCoverImageUrlInput(e.target.value)} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <input type="checkbox" id="isPaid" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} className="h-4 w-4 text-primary-accent rounded border-gray-300 focus:ring-primary-accent" />
              <label htmlFor="isPaid" className="ml-2 block text-sm text-ink dark:text-pale-lavender">유료 발행</label>
            </div>
            {isPaid && (
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-ink/80 dark:text-pale-lavender/80 mb-1">가격 (300 ~ 500원)</label>
                <input type="number" id="price" value={price} onChange={handlePriceChange} min="300" max="500" step="10" className="w-full p-2 border-2 rounded-lg bg-paper dark:bg-forest-sub border-ink/20 dark:border-pale-lavender/20 focus:border-primary-accent dark:focus:border-dark-accent focus:outline-none" />
                {priceError && <p className="mt-1 text-xs text-red-500">{priceError}</p>}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button onClick={() => setIsPublishConfirmModalOpen(false)} className="px-4 py-2 border border-ink/20 dark:border-pale-lavender/20 text-ink dark:text-pale-lavender font-semibold rounded-lg hover:bg-ink/5 dark:hover:bg-pale-lavender/10 transition-colors">취소</button>
            <button onClick={executePublish} className="px-4 py-2 bg-primary-accent text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-400" disabled={!!priceError}>발행</button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export const DashboardPage = () => (
  <ProjectProvider>
    <EditorProvider>
      <Dashboard />
    </EditorProvider>
  </ProjectProvider>
);
