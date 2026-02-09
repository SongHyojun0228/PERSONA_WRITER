import { useProjectContext } from '../../context/ProjectContext';
import { useEditorContext } from '../../context/EditorContext';
import { useMemo } from 'react';
import { AIChat } from '../AIChat';
import { type Foreshadow } from '../../data/mock';
import { XIcon, PublishIcon, PaintBrushIcon, DownloadIcon } from '../Icons';
import { calculateReadTime } from '../../lib/utils';

interface RightSidebarProps {
    onPublish: () => void;
    onGenerateCover: () => void;
    onExportEpub: () => void;
}

const StatCard = ({ label, value }: { label: string, value: string | number }) => (
    <div className="p-4 rounded-lg bg-primary-accent/5 dark:bg-dark-accent/10">
        <div className="text-sm text-ink dark:text-pale-lavender">{label}</div>
        <div className="text-2xl font-bold text-primary-accent dark:text-dark-accent">{value}</div>
    </div>
);

const PlotPointItem = ({ foreshadow, onResolve, onDelete }: { 
    foreshadow: Foreshadow;
    onResolve: (id: string) => void;
    onDelete: (id: string) => void;
}) => (
    <li className={`p-3 rounded-lg ${foreshadow.status === 'open' ? 'bg-primary-accent/5 dark:bg-dark-accent/10' : 'bg-gray-500/10 text-gray-500 line-through'}`}>
        <div className="flex justify-between items-start">
            <span className="flex-1">{foreshadow.content}</span>
            {foreshadow.status === 'open' && (
                <button 
                    onClick={() => onResolve(foreshadow.id)}
                    className="ml-2 px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
                >
                    회수
                </button>
            )}
            {foreshadow.status === 'closed' && (
                <button 
                    onClick={() => onDelete(foreshadow.id)}
                    className="ml-2 p-1 rounded-full hover:bg-red-500/20 text-red-500"
                    title="복선 삭제"
                >
                    <XIcon className="w-4 h-4" />
                </button>
            )}
        </div>
    </li>
);

export const RightSidebar = ({ onPublish, onGenerateCover, onExportEpub }: RightSidebarProps) => {
    const { project, resolveForeshadow, deleteForeshadow } = useProjectContext();
    const { editorContent } = useEditorContext();

    const textContent = useMemo(() => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = editorContent;
        return tempDiv.textContent || tempDiv.innerText || '';
    }, [editorContent]);

    const charCountWithSpaces = textContent.length;
    const charCountWithoutSpaces = textContent.replace(/\s/g, '').length;
    const readTime = useMemo(() => calculateReadTime(editorContent), [editorContent]);

    const openForeshadows = project?.foreshadows?.filter(f => f.status === 'open') || [];
    const closedForeshadows = project?.foreshadows?.filter(f => f.status === 'closed') || [];

    return (
        <aside className="w-96 p-6 border-l border-ink/10 dark:border-pale-lavender/10 grid grid-rows-[auto_auto_auto_1fr] gap-y-8">
             <div className="space-y-3">
                <button
                    onClick={onPublish}
                    data-tour="publish"
                    className="w-full flex items-center justify-center p-3 rounded-lg bg-primary-accent text-white hover:bg-primary-accent/90 transition-colors font-bold"
                >
                    <PublishIcon className="w-5 h-5 mr-2" />
                    현재 글 발행하기
                </button>
                <button
                    onClick={onGenerateCover}
                    className="w-full flex items-center justify-center p-3 rounded-lg bg-dark-accent text-white hover:bg-dark-accent/90 transition-colors font-bold"
                >
                    <PaintBrushIcon />
                    표지 생성하기
                </button>
                <button
                    onClick={onExportEpub}
                    className="w-full flex items-center justify-center p-3 rounded-lg bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-800 transition-colors font-bold"
                >
                    <DownloadIcon className="w-5 h-5 mr-2" />
                    EPUB 내보내기
                </button>
            </div>
            <div>
                <h2 className="text-lg font-semibold mb-4 text-ink dark:text-pale-lavender">실시간 분석</h2>
                <div className="space-y-4">
                  <StatCard label="글자 수 (공백 포함)" value={charCountWithSpaces.toLocaleString()} />
                  <StatCard label="글자 수 (공백 제외)" value={charCountWithoutSpaces.toLocaleString()} />
                  <StatCard label="예상 읽기 시간" value={`약 ${readTime}분`} />
                </div>
            </div>
            <div data-tour="foreshadow">
                <h2 className="text-lg font-semibold mb-4 text-ink dark:text-pale-lavender">복선 리스트</h2>
                <ul className="space-y-3 max-h-48 overflow-y-auto">
                    {openForeshadows.length > 0 || closedForeshadows.length > 0 ? (
                        <>
                            {openForeshadows.map((plot) => (
                                <PlotPointItem key={plot.id} foreshadow={plot} onResolve={resolveForeshadow} onDelete={deleteForeshadow} />
                            ))}
                            {closedForeshadows.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-md font-semibold mb-2 text-gray-500">회수된 복선</h3>
                                    <ul className="space-y-2">
                                        {closedForeshadows.map((plot) => (
                                            <PlotPointItem key={plot.id} foreshadow={plot} onResolve={resolveForeshadow} onDelete={deleteForeshadow} />
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-ink dark:text-pale-lavender">
                            에디터에서 텍스트를 선택하고 🚩 버튼을 눌러 복선을 추가하세요.
                        </p>
                    )}
                </ul>
            </div>
            <div className="flex flex-col min-h-0" data-tour="ai-assistant">
                 <h2 className="text-lg font-semibold mb-4 text-ink dark:text-pale-lavender">AI 어시스턴트</h2>
                <AIChat />
            </div>
        </aside>
    );
};
