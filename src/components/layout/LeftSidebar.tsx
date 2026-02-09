import { useState } from "react";
import {
  useProjectContext,
  type ActiveView,
} from "../../context/ProjectContext";
import {
  DocumentTextIcon,
  ChevronDownIcon,
  PlusIcon,
  CogIcon,
  XIcon,
  UserGroupIcon,
  PencilIcon,
  CombineIcon,
  BoardIcon,
  TimelineIcon,
} from "../Icons";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type Page, type MergedPage } from "../../data/mock";

const NavButton = ({
  onClick,
  isActive,
  children,
  actionButton,
  'data-tour': dataTour,
}: {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  actionButton?: React.ReactNode;
  'data-tour'?: string;
}) => (
  <div className="flex items-center group" data-tour={dataTour}>
    <div
      onClick={onClick}
      className={`relative flex items-center w-full py-2 text-lg font-medium rounded-lg text-left transition-colors cursor-pointer ${
        isActive
          ? "bg-primary-accent/20 text-primary-accent dark:bg-dark-accent/30 dark:text-dark-accent"
          : "text-ink dark:text-pale-lavender hover:bg-primary-accent/10 dark:hover:bg-dark-accent/20"
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick();
          e.preventDefault();
        }
      }}
    >
      <div
        className={`px-4 flex items-center w-full ${actionButton ? "pr-12" : ""}`}
      >
        {children}
      </div>
      {actionButton && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex space-x-1">
          {actionButton}
        </span>
      )}
    </div>
  </div>
);

const SortablePageItem = ({
  page,
  activeView,
  setActiveView,
  handleDeletePage,
  editingPageId,
  setEditingPageId,
}: {
  page: Page;
  activeView: ActiveView | null;
  setActiveView: (view: ActiveView) => void;
  handleDeletePage: (id: string, title: string) => void;
  editingPageId: string | null;
  setEditingPageId: (id: string | null) => void;
}) => {
  const { updatePageTitle } = useProjectContext();
  const [editingTitle, setEditingTitle] = useState(page.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
    position: "relative" as const,
  };

  const handleFinishEditing = () => {
    if (editingTitle.trim() && editingTitle.trim() !== page.title) {
      updatePageTitle(page.id, editingTitle.trim());
    }
    setEditingPageId(null);
  };

  const isEditing = editingPageId === page.id;

  return (
    <div ref={setNodeRef} style={style}>
      <NavButton
        isActive={activeView?.type === "page" && activeView.id === page.id}
        onClick={() => !isEditing && setActiveView({ type: "page", id: page.id })}
        actionButton={
          !isEditing && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setEditingPageId(page.id); setEditingTitle(page.title); }}
                className="p-1 rounded-full hover:bg-blue-500/20 text-blue-500"
                title="제목 수정"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeletePage(page.id, page.title); }}
                className="p-1 rounded-full hover:bg-red-500/20 text-red-500"
                title="페이지 삭제"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </>
          )
        }
      >
        <div {...attributes} {...listeners} className="flex-grow flex items-center cursor-grab overflow-hidden">
          <DocumentTextIcon />
          {isEditing ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={handleFinishEditing}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFinishEditing();
                if (e.key === 'Escape') setEditingPageId(null);
              }}
              className="bg-transparent w-full focus:outline-none focus:ring-1 focus:ring-primary-accent rounded"
              autoFocus
            />
          ) : (
            <span className="truncate">{page.title}</span>
          )}
        </div>
      </NavButton>
    </div>
  );
};

interface LeftSidebarProps {
  className?: string;
  onClose?: () => void;
}

export const LeftSidebar = ({ className, onClose }: LeftSidebarProps = {}) => {
  const {
    project,
    activeView,
    setActiveView,
    addPage,
    deletePage,
    reorderPages,
    mergePages,
    updateMergedPageTitle,
    deleteMergedPage,
  } = useProjectContext();
  const [isPagesOpen, setPagesOpen] = useState(true);
  const [isMergedPagesOpen, setMergedPagesOpen] = useState(true);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingMergedPageId, setEditingMergedPageId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  const handleAddPage = () => {
    const title = prompt("새 페이지의 제목을 입력하세요:", "새 페이지");
    if (title) {
      addPage(title);
    }
  };

  const handleDeletePage = (pageId: string, pageTitle: string) => {
    if (window.confirm(`'${pageTitle}' 페이지를 정말로 삭제하시겠습니까?`)) {
      deletePage(pageId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && project?.pages) {
      const oldIndex = project.pages.findIndex((page) => page.id === active.id);
      const newIndex = project.pages.findIndex((page) => page.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(project.pages, oldIndex, newIndex);
        reorderPages(newOrder);
      }
    }
  };

  const handleMergePages = () => {
    if (project && project.pages.length > 0) {
      if (window.confirm('현재 순서대로 모든 페이지를 합쳐서 새 통합 페이지를 생성하시겠습니까?')) {
        mergePages();
      }
    } else {
      alert('통합할 페이지가 없습니다.');
    }
  };
  
  const handleFinishEditingMerged = (page: MergedPage) => {
    if (editingTitle.trim() && editingTitle.trim() !== page.title) {
      updateMergedPageTitle(page.id, editingTitle.trim());
    }
    setEditingMergedPageId(null);
  };

  if (!project) {
    return (
      <aside className={className || "w-72 p-4 border-r border-ink/10 dark:border-pale-lavender/10 animate-pulse bg-gray-100 dark:bg-gray-800"}></aside>
    );
  }

  return (
    <aside className={className || "w-72 p-4 border-r border-ink/10 dark:border-pale-lavender/10 flex flex-col"}>
      {onClose && (
        <button
          onClick={onClose}
          className="md:hidden self-end mb-2 p-1 rounded-full hover:bg-ink/10 dark:hover:bg-pale-lavender/10"
          aria-label="닫기"
        >
          <XIcon className="w-5 h-5" />
        </button>
      )}
      <h2
        className="text-2xl font-bold mb-6 px-2 truncate"
        title={project.name}
      >
        {project.name}
      </h2>
      <nav className="space-y-2">
        <NavButton
          onClick={() =>
            setActiveView({ type: "settings", id: project.settings.id })
          }
          isActive={activeView?.type === "settings"}
        >
          <CogIcon />
          <span>기본 설정</span>
        </NavButton>

        <NavButton
          onClick={() => setActiveView({ type: "characterSheet" })}
          isActive={activeView?.type === "characterSheet"}
          data-tour="character-sheet"
        >
          <UserGroupIcon />
          <span>캐릭터 시트</span>
        </NavButton>

        <NavButton
          onClick={() => setActiveView({ type: 'relationships' })}
          isActive={activeView?.type === 'relationships'}
        >
          <img src="/relationship.png" alt="인물 관계" className="h-5 w-5 mr-3" />
          <span>인물 관계</span>
        </NavButton>

        <NavButton
          onClick={() => setActiveView({ type: 'plotBoard' })}
          isActive={activeView?.type === 'plotBoard'}
        >
          <BoardIcon className="h-5 w-5 mr-3" />
          <span>플롯 보드</span>
        </NavButton>

        <NavButton
          onClick={() => setActiveView({ type: 'timeline' })}
          isActive={activeView?.type === 'timeline'}
        >
          <TimelineIcon className="h-5 w-5 mr-3" />
          <span>타임라인</span>
        </NavButton>

        <div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPagesOpen(!isPagesOpen)}
              className="flex items-center w-full px-4 py-2 text-lg font-medium text-left text-ink dark:text-pale-lavender"
            >
              <ChevronDownIcon
                className={`w-5 h-5 mr-3 transition-transform ${isPagesOpen ? "rotate-0" : "-rotate-90"}`}
              />
              <span>페이지 목록</span>
            </button>
            <div className="flex">
              <button onClick={handleMergePages} className="p-2 rounded-full hover:bg-primary-accent/10 dark:hover:bg-dark-accent/20" title="페이지 통합">
                <CombineIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleAddPage}
                className="p-2 rounded-full hover:bg-primary-accent/10 dark:hover:bg-dark-accent/20"
                title="새 페이지 추가"
              >
                <PlusIcon />
              </button>
            </div>
          </div>
          {isPagesOpen && (
            <div className="mt-2 space-y-1">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={project.pages.map((page) => page.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {project.pages.map((page) => (
                    <SortablePageItem
                      key={page.id}
                      page={page}
                      activeView={activeView}
                      setActiveView={setActiveView}
                      handleDeletePage={handleDeletePage}
                      editingPageId={editingPageId}
                      setEditingPageId={setEditingPageId}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
        
        {project.mergedPages && project.mergedPages.length > 0 && (
          <div>
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setMergedPagesOpen(!isMergedPagesOpen)}
                className="flex items-center w-full px-4 py-2 text-lg font-medium text-left text-ink dark:text-pale-lavender"
              >
                <ChevronDownIcon
                  className={`w-5 h-5 mr-3 transition-transform ${isMergedPagesOpen ? "rotate-0" : "-rotate-90"}`}
                />
                <span>통합본 목록</span>
              </button>
            </div>
            {isMergedPagesOpen && (
              <div className="mt-2 space-y-1">
                {project.mergedPages.map((mergedPage: MergedPage) => {
                  const isEditing = editingMergedPageId === mergedPage.id;
                  return (
                    <NavButton
                      key={mergedPage.id}
                      onClick={() => !isEditing && setActiveView({ type: 'mergedPage', id: mergedPage.id })}
                      isActive={activeView?.type === 'mergedPage' && activeView.id === mergedPage.id}
                      actionButton={
                        !isEditing && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingMergedPageId(mergedPage.id); setEditingTitle(mergedPage.title); }}
                              className="p-1 rounded-full hover:bg-blue-500/20 text-blue-500"
                              title="제목 수정"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); if(window.confirm(`'${mergedPage.title}' 통합본을 정말로 삭제하시겠습니까?`)) deleteMergedPage(mergedPage.id)}}
                              className="p-1 rounded-full hover:bg-red-500/20 text-red-500"
                              title="통합본 삭제"
                            >
                              <XIcon className="w-4 h-4" />
                            </button>
                          </>
                        )
                      }
                    >
                      <DocumentTextIcon />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={() => handleFinishEditingMerged(mergedPage)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleFinishEditingMerged(mergedPage);
                            if (e.key === 'Escape') setEditingMergedPageId(null);
                          }}
                          className="bg-transparent w-full focus:outline-none focus:ring-1 focus:ring-primary-accent rounded"
                          autoFocus
                        />
                      ) : (
                        <span className="truncate">{mergedPage.title}</span>
                      )}
                    </NavButton>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>
    </aside>
  );
};
