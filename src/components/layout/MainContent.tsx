import TiptapEditor from '../Editor';
import { useProjectContext } from '../../context/ProjectContext';
import { useEditorContext } from '../../context/EditorContext';
import { useMemo, useCallback, useRef } from 'react';
import { CharacterSheetEditor } from '../CharacterSheetEditor';
import { CharacterRelationshipManager } from '../CharacterRelationshipManager';
import { PlotBoard } from '../PlotBoard';
import { Timeline } from '../Timeline';
import { debounce } from '../../lib/utils';

export const MainContent = () => {
  const { project, activeView, updatePageContent, updateMergedPageContent } = useProjectContext();
  const { setSaveStatus, setLastSaved } = useEditorContext();

  const activeContent = useMemo(() => {
    if (!project || !activeView || activeView.type === 'characterSheet' || activeView.type === 'relationships' || activeView.type === 'plotBoard' || activeView.type === 'timeline') return '';

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

  // Debounced save function
  const debouncedSaveRef = useRef(
    debounce(async (view: typeof activeView, content: string) => {
      if (!view) return;

      setSaveStatus('saving');
      try {
        if (view.type === 'page' || view.type === 'settings') {
          await updatePageContent(view, content);
        } else if (view.type === 'mergedPage') {
          await updateMergedPageContent(view.id, content);
        }
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Save error:', error);
        setSaveStatus('error');
      }
    }, 500)
  );

  const handleUpdate = useCallback((newContent: string) => {
    if (!activeView) return;
    debouncedSaveRef.current(activeView, newContent);
  }, [activeView]);

  if (!project || !activeView) {
    return <main className="flex-1 overflow-y-auto p-8">불러오는 중...</main>;
  }

  return (
    <main className="flex-1 overflow-y-auto">
      {activeView.type === 'characterSheet' ? (
        <CharacterSheetEditor />
      ) : activeView.type === 'relationships' ? (
        <CharacterRelationshipManager />
      ) : activeView.type === 'plotBoard' ? (
        <PlotBoard />
      ) : activeView.type === 'timeline' ? (
        <Timeline />
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
