import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { useState, useEffect } from "react";
import { type Project } from "../data/mock";
import { PencilIcon, TrashIcon } from "../components/Icons"; // Revert HeartIcon import
import Community from "../components/Community";
import { NotificationBell } from '../components/NotificationBell';
import { ThemeToggle } from '../components/ThemeToggle';
import spiritIcon from '../assets/spirit.png';
import { InspirationShopModal } from '../components/InspirationShopModal'; // Import InspirationShopModal
import { LoadingBar } from '../components/LoadingBar';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface ProjectCardProps {
  id: string;
  title: string;
  onClick?: () => void;
  onEdit?: (id: string, currentTitle: string) => void;
  onDelete?: (id: string, title: string) => void;
  createdAt?: string;
  coverImageUrl?: string;
}

const ProjectCard = ({
  id,
  title,
  onClick,
  onEdit,
  onDelete,
  createdAt,
  coverImageUrl,
}: ProjectCardProps) => {
  const isNew = id === "new-project";

  if (isNew && onClick) {
    return (
      <button
        onClick={onClick}
        className="relative rounded-lg w-full h-64 flex flex-col items-center justify-center
                   border-dashed border-2 hover:border-primary-accent hover:text-primary-accent
                   dark:hover:border-dark-accent dark:hover:text-dark-accent
                   transition-all duration-300"
      >
        <h2 className="text-xl font-bold">{title}</h2>
      </button>
    );
  }

  return (
    <Link to={`/dashboard/${id}`} className="block group w-full h-64">
      <div className="overflow-hidden rounded-lg shadow-lg transition-shadow duration-300 group-hover:shadow-xl group-hover:scale-105 transform origin-center h-full bg-paper dark:bg-forest-sub">
        {coverImageUrl ? (
          <div
            className="w-full h-40 object-cover relative"
            style={{
              backgroundImage: `url(${coverImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
        ) : (
          <div className="w-full h-40 bg-primary-accent dark:bg-dark-accent relative" />
        )}
        <div className="p-4 relative">
          <h3 className="text-lg font-bold truncate">{title}</h3>
          {createdAt && (
            <p className="text-sm mt-1">
              {new Date(createdAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              }).replace(/\s/g, "").replace(/\./g, "/").slice(0, -1)}
              {" 집필 시작"}
            </p>
          )}
          <div className="absolute top-2 right-2 flex space-x-2 z-20">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit?.(id, title); }}
              className="p-2 rounded-full hover:bg-blue-500/20 text-blue-500 transition-colors"
              title="작품 수정"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete?.(id, title); }}
              className="p-2 rounded-full hover:bg-red-500/20 text-red-500 transition-colors"
              title="작품 삭제"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const HomePage = () => {
  const navigate = useNavigate();
  const { session, username, inspirationCount } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'projects' | 'community'>('community');
  const [isShopModalOpen, setIsShopModalOpen] = useState(false); // State for modal visibility

  const fetchProjects = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", session.user.id);
    if (error) {
      console.error("Error fetching projects:", error);
    } else {
      setProjects(data as Project[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeView === 'projects') {
      fetchProjects();
    }
  }, [session, activeView]);

  const handleAddNewProject = async () => {
    const title = prompt("새 작품의 제목을 입력하세요:");
    if (title && session?.user?.id) {
      setLoading(true);
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert({ name: title, user_id: session.user.id })
        .select().single();
      if (projectError) { console.error(projectError); setLoading(false); return; }
      
      const { error: settingsError } = await supabase.from("pages").insert({
        project_id: projectData.id,
        title: "기본 설정",
        content: `<h1>${title} - 기본 설정</h1>`,
        type: "SETTINGS",
      });
      if (settingsError) { console.error(settingsError); setLoading(false); return; }

      setLoading(false);
      navigate(`/dashboard/${projectData.id}`);
    }
  };

  const handleEditProject = async (projectId: string, currentTitle: string) => {
    const newTitle = prompt("작품의 새 제목을 입력하세요:", currentTitle);
    if (newTitle && newTitle.trim() !== "" && newTitle !== currentTitle) {
      setLoading(true);
      const { error } = await supabase.from("projects").update({ name: newTitle }).eq("id", projectId).eq("user_id", session?.user?.id);
      if (error) { console.error("Error updating project:", error); } 
      else { fetchProjects(); }
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (!window.confirm(`'${projectName}' 작품을 정말로 삭제하시겠습니까?\n모든 관련 데이터(페이지, 캐릭터 등)도 삭제됩니다.`)) return;
    setLoading(true);
    await supabase.from("pages").delete().eq("project_id", projectId);
    await supabase.from("characters").delete().eq("project_id", projectId);
    const { error } = await supabase.from("projects").delete().eq("id", projectId).eq("user_id", session?.user?.id);
    if (error) { console.error("Error deleting project:", error); } 
    else { fetchProjects(); }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const NavLink = ({ view, children }: { view: 'projects' | 'community', children: React.ReactNode }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        activeView === view
          ? 'text-primary-accent dark:text-dark-accent'
          : 'text-ink/60 dark:text-pale-lavender/60 hover:text-primary-accent dark:hover:text-dark-accent'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-paper dark:bg-forest-bg text-ink dark:text-pale-lavender">
      <header className="sticky top-0 z-40 w-full bg-paper/80 dark:bg-forest-bg/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4 border-b border-ink/10 dark:border-pale-lavender/10">
                <div className="flex items-center space-x-8">
                    <Link to="/">
                        <h1 className="text-xl font-bold text-primary-accent dark:text-dark-accent">Persona Writer</h1>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-2">
                        <NavLink view="projects">작품 목록</NavLink>
                        <NavLink view="community">이야기 광장</NavLink>
                    </nav>
                </div>
                <div className="flex items-center space-x-4 relative">
                    {username && (
                      <>
                        <Link to="/my-page" className="flex items-center space-x-2 text-ink/80 dark:text-pale-lavender/80 hover:text-primary-accent dark:hover:text-dark-accent">
                          <span className="text-sm font-medium">{username}님</span>
                        </Link>
                        {inspirationCount !== null && (
                          <div
                            className="flex items-center space-x-1 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setIsShopModalOpen(true)}
                            title="영감 구매"
                          >
                            <img src={spiritIcon} alt="Inspiration" className="h-4 w-4" />
                            <span className="text-xs font-semibold">{inspirationCount}</span>
                          </div>
                        )}
                      </>
                    )}
                    <ThemeToggle />
                    <NotificationBell />
                    <button
                        onClick={handleLogout}
                        className="px-3 py-1.5 text-sm rounded-md text-white bg-red-500 hover:bg-red-600 transition-colors"
                    >
                        로그아웃
                    </button>
                </div>
            </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'projects' && (
          <div>
            <LoadingBar isLoading={loading} />
            <div className="mb-8">
              <h1 className="text-4xl font-extrabold text-primary-accent dark:text-dark-accent">{username}님 작품 목록</h1>
              <p className="text-lg mt-2 text-ink/60 dark:text-pale-lavender/60">계속해서 당신의 이야기를 만들어나가세요.</p>
            </div>
            {loading ? (
                <div className="flex items-center justify-center p-8">
                  <LoadingSpinner size="lg" text="프로젝트를 불러오는 중..." />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} id={project.id} title={project.name} createdAt={project.created_at} coverImageUrl={project.cover_image_url} onEdit={handleEditProject} onDelete={handleDeleteProject} />
                    ))}
                    <ProjectCard key="new-project" id="new-project" title="+ 새 작품 시작하기" onClick={handleAddNewProject} />
                </div>
            )}
          </div>
        )}

        {activeView === 'community' && (
          <div>
            <div className="mb-8">
                <h2 className="text-4xl font-extrabold text-primary-accent dark:text-dark-accent">이야기 광장</h2>
            </div>
            <Community />
          </div>
        )}

        {/* Divider and Creator's Recommendation */}
        {activeView === 'community' && ( // Only show recommendation in community view for now
          <>
            <hr className="my-12 border-ink/10 dark:border-pale-lavender/10" />
            <div className="mb-8">
              <h2 className="text-4xl font-extrabold text-primary-accent dark:text-dark-accent">제작자의 추천</h2>
              <p className="text-lg mt-2 text-ink/60 dark:text-pale-lavender/60">매주 새로운 영감을 주는 작품들을 소개합니다.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Book 1: 사랑의 생애 */}
              <div className="bg-paper dark:bg-forest-sub rounded-lg shadow-lg overflow-hidden flex flex-col p-6">
                <div className="flex-shrink-0 mb-4 self-center">
                  <img
                    src="https://contents.kyobobook.co.kr/sih/fit-in/200x0/pdt/9788959134823.jpg"
                    alt="사랑의 생애 표지"
                    className="w-36 h-52 object-cover rounded-lg shadow-md"
                  />
                </div>
                <div className="flex-grow flex flex-col text-center">
                  <h3 className="text-xl font-bold text-ink dark:text-pale-lavender">사랑의 생애</h3>
                  <p className="text-base text-ink/60 dark:text-pale-lavender/60 mt-1 mb-3">김연수</p>
                  <p className="text-base leading-relaxed text-ink/80 dark:text-pale-lavender/80 mb-6 flex-grow">
                    "여러분, 이번 주에 제가 정말 감명 깊게 읽은 작품은 김연수 작가님의 '사랑의 생애'입니다. 이 책을 읽으면서 저는 마치 시간여행을 하는 듯한 기분을 느꼈어요. 한 인물의 삶을 통해 사랑이라는 복잡하고도 아름다운 감정의 여러 얼굴을 만날 수 있답니다. 작가님의 깊이 있는 시선과 가슴을 울리는 문장력 덕분에, 평범한 순간들이 얼마나 특별해질 수 있는지 다시 한번 깨닫게 되었죠. 여러분의 이야기에도 새로운 깊이와 감동을 더해줄 영감을 찾고 있다면, 이 책이 분명 큰 도움이 될 거예요!"
                  </p>
                  <a
                    href="https://search.kyobobook.co.kr/search?keyword=%EC%82%AC%EB%9E%91%EC%9D%98%20%EC%83%9D%EC%95%A0&gbCode=TOT&target=total"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-block px-5 py-2.5 bg-primary-accent text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors text-base"
                  >
                    자세히 보기
                  </a>
                </div>
              </div>

              {/* Book 2: 스푸트니크의 연인 */}
              <div className="bg-paper dark:bg-forest-sub rounded-lg shadow-lg overflow-hidden flex flex-col p-6">
                <div className="flex-shrink-0 mb-4 self-center">
                  <img
                    src="https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788970120935.jpg"
                    alt="스푸트니크의 연인 표지"
                    className="w-36 h-52 object-cover rounded-lg shadow-md"
                  />
                </div>
                <div className="flex-grow flex flex-col text-center">
                  <h3 className="text-xl font-bold text-ink dark:text-pale-lavender">스푸트니크의 연인</h3>
                  <p className="text-base text-ink/60 dark:text-pale-lavender/60 mt-1 mb-3">무라카미 하루키</p>
                  <p className="text-base leading-relaxed text-ink/80 dark:text-pale-lavender/80 mb-6 flex-grow">
                    "무라카미 하루키 특유의 몽환적이고 서정적인 분위기를 좋아하신다면, '스푸트니크의 연인'을 놓치지 마세요. 이 책은 사랑, 상실, 그리고 자아를 찾아가는 여정을 스푸트니크처럼 외로운 인물들의 이야기를 통해 아름답게 그려냅니다. 현실과 비현실의 경계를 넘나드는 하루키의 섬세한 문장들은 분명 여러분의 마음속 깊은 곳에 오래도록 남을 거예요. 새로운 영감과 감성적인 충전을 원한다면 강력 추천합니다!"
                  </p>
                  <a
                    href="https://product.kyobobook.co.kr/detail/S000213906411"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-block px-5 py-2.5 bg-primary-accent text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors text-base"
                  >
                    자세히 보기
                  </a>
                </div>
              </div>

              {/* Book 3: 아몬드 */}
              <div className="bg-paper dark:bg-forest-sub rounded-lg shadow-lg overflow-hidden flex flex-col p-6">
                <div className="flex-shrink-0 mb-4 self-center">
                  <img
                    src="https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9791198363503.jpg"
                    alt="아몬드 표지"
                    className="w-36 h-52 object-cover rounded-lg shadow-md"
                  />
                </div>
                <div className="flex-grow flex flex-col text-center">
                  <h3 className="text-xl font-bold text-ink dark:text-pale-lavender">아몬드</h3>
                  <p className="text-base text-ink/60 dark:text-pale-lavender/60 mt-1 mb-3">손원평</p>
                  <p className="text-base leading-relaxed text-ink/80 dark:text-pale-lavender/80 mb-6 flex-grow">
                    "'아몬드'는 감정을 느끼지 못하는 한 소년의 특별한 성장 이야기입니다. 타인의 감정을 이해하지 못하는 주인공의 시선으로 세상을 바라보며, 진정한 공감과 인간다운 삶의 의미에 대해 깊이 생각하게 됩니다. 간결하면서도 흡인력 있는 문체는 여러분의 작품에 캐릭터의 내면을 표현하는 새로운 방법을 제시할 것입니다. 감정의 본질을 탐구하고 싶다면 꼭 읽어보시길 바랍니다!"
                  </p>
                  <a
                    href="https://product.kyobobook.co.kr/detail/S000001123668"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-block px-5 py-2.5 bg-primary-accent text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors text-base"
                  >
                    자세히 보기
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Render the InspirationShopModal */}
      <InspirationShopModal
        isOpen={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
      />
    </div>
  );
};
