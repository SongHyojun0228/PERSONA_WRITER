import { formatTimeAgo } from '../lib/timeAgo';
import { useEditorContext } from '../context/EditorContext';

export const EditorStatusBar = () => {
  const { saveStatus, lastSaved } = useEditorContext();

  return (
    <div className="flex items-center space-x-2 text-xs text-ink/60 dark:text-pale-lavender/60">
      {saveStatus === 'saving' && (
        <>
          <div className="animate-spin h-3 w-3 border-2 border-primary-accent dark:border-dark-accent border-t-transparent rounded-full" />
          <span>저장 중...</span>
        </>
      )}
      {saveStatus === 'saved' && lastSaved && (
        <>
          <span className="text-green-500">✓</span>
          <span>마지막 저장: {formatTimeAgo(lastSaved.toISOString())}</span>
        </>
      )}
      {saveStatus === 'error' && (
        <span className="text-red-500">저장 실패</span>
      )}
    </div>
  );
};
