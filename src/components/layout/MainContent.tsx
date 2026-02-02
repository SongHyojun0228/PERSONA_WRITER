import TiptapEditor from '../Editor';
import { useProjectContext } from '../../context/ProjectContext';
import { useMemo } from 'react';
import { CharacterSheetEditor } from '../CharacterSheetEditor';
import { CharacterRelationshipManager } from '../CharacterRelationshipManager';

export const MainContent = () => {
  const { project, activeView, updatePageContent, updateMergedPageContent } = useProjectContext();

  const activeContent = useMemo(() => {
    if (!project || !activeView || activeView.type === 'characterSheet' || activeView.type === 'relationships') return '';

    if (activeView.type === 'settings') {
        return project.settings.content;
    }
    if (activeView.type === 'page') {
        const page = project.pages.find(p => p.id === activeView.id);
        return page ? page.content : '';
    }
    if (activeView.type === 'mergedPage') {
        const mergedPage = project.mergedPages.find(p => p.id === activeView.id);
        return mergedPage ? mergedPage.content : '';
    }
    return '';
  }, [project, activeView]);

  const handleUpdate = (newContent: string) => {
    if (!activeView) return;
    
    if (activeView.type === 'page' || activeView.type === 'settings') {
      updatePageContent(activeView, newContent);
    } else if (activeView.type === 'mergedPage') {
      updateMergedPageContent(activeView.id, newContent);
    }
  };

  if (!project || !activeView) {
    return <main className="flex-1 overflow-y-auto p-8">불러오는 중...</main>;
  }

  return (
    <main className="flex-1 overflow-y-auto">
      {activeView.type === 'characterSheet' ? (
        <CharacterSheetEditor />
      ) : activeView.type === 'relationships' ? (
        <CharacterRelationshipManager />
      ) : (
        <TiptapEditor
          key={activeView.id}
          content={activeContent}
          onUpdate={handleUpdate}
        />
      )}
    </main>
  );
};
