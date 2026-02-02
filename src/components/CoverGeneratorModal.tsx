import { useState, useRef, useEffect } from 'react';
import { Modal } from './Modal';
import { useAuth } from '../context/AuthContext';
import { useProjectContext } from '../context/ProjectContext';

interface CoverGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoverGeneratorModal = ({ isOpen, onClose }: CoverGeneratorModalProps) => {
  const { session } = useAuth();
  const { project, setProject } = useProjectContext();
  const [inputText, setInputText] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiTextMessage, setAiTextMessage] = useState('');
  const [currentView, setCurrentView] = useState<'generate' | 'upload'>('generate'); // New state for view toggle
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // New state for uploaded file
  const [uploading, setUploading] = useState(false); // New state for upload loading
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputText]);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError('이미지 생성을 위한 프롬프트(명령어)를 입력해주세요.');
      return;
    }
    setError('');
    setAiTextMessage(''); // Clear previous AI text message
    setIsLoading(true);
    setGeneratedImage('');

    try {
      const imageResponse = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputText }),
      });
      if (!imageResponse.ok) {
        // Handle HTTP errors, e.g., 500 from backend before custom JSON response
        const errorData = await imageResponse.json();
        throw new Error(errorData.error || '이미지 생성에 실패했습니다.');
      }
      const responseData = await imageResponse.json(); // Can be { imageUrl } or { textResponseContent, message }

      if (responseData.imageUrl) {
        setGeneratedImage(responseData.imageUrl);
      } else if (responseData.textResponseContent) {
        setAiTextMessage(responseData.textResponseContent);
        // Optionally, set error to inform user that image generation failed, but AI responded
        setError(responseData.message || 'Gemini 모델이 이미지 대신 텍스트 메시지를 반환했습니다.');
      } else {
        throw new Error('예상치 못한 응답 형식입니다. 이미지 URL 또는 텍스트 응답이 없습니다.');
      }

    } catch (err: any) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => { /* ... existing handleFileUpload logic ... */ };

  const handleDownloadImage = async () => {
    if (!generatedImage) {
      setError('다운로드할 이미지가 없습니다.');
      return;
    }

    try {
        const imageResponse = await fetch(generatedImage);
        const imageBlob = await imageResponse.blob();
        const blobUrl = URL.createObjectURL(imageBlob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `persona-writer-cover-${Date.now()}.png`; // Default filename
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl); // Clean up the object URL
    } catch (err: any) {
        console.error("Error downloading image:", err);
        setError('이미지 다운로드 중 오류가 발생했습니다.');
    }
  };

  const handleSaveCover = async () => {
    if (!generatedImage || !project || !session) return;

    try {
        const response = await fetch(`/api/projects/${project.id}/cover`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ cover_image_url: generatedImage }),
        });

        if (!response.ok) throw new Error('표지 저장에 실패했습니다.');

        if (project) {
            setProject({ ...project, cover_image_url: generatedImage });
        }
        alert('표지가 성공적으로 저장되었습니다!');
        onClose();
    } catch (err: any) {
        setError(err.message || '표지 저장 중 오류가 발생했습니다.');
    }
  };

  const handleClose = () => {
    setInputText('');
    setGeneratedImage('');
    setAiTextMessage(''); // Clear AI text message on close
    setIsLoading(false);
    setError('');
    setCurrentView('generate'); // Reset view on close
    setSelectedFile(null); // Clear selected file
    setUploading(false); // Reset uploading state
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="AI 표지 생성">
      <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
        {/* View Toggles */}
        <div className="flex border-b border-ink/20 dark:border-pale-lavender/20 mb-4">
          <button
            onClick={() => setCurrentView('generate')}
            className={`flex-1 py-2 text-center font-semibold ${currentView === 'generate' ? 'border-b-2 border-primary-accent dark:border-dark-accent text-primary-accent dark:text-dark-accent' : 'text-ink/60 dark:text-pale-lavender/60'}`}
          >
            AI 생성
          </button>
          <button
            onClick={() => setCurrentView('upload')}
            className={`flex-1 py-2 text-center font-semibold ${currentView === 'upload' ? 'border-b-2 border-primary-accent dark:border-dark-accent text-primary-accent dark:text-dark-accent' : 'text-ink/60 dark:text-pale-lavender/60'}`}
          >
            이미지 업로드
          </button>
        </div>

        {/* AI Generate View */}
        {currentView === 'generate' && (
          <>
            <p className="text-sm text-ink/80 dark:text-pale-lavender/80">
              표지 이미지 생성을 위한 프롬프트(명령어)를 직접 입력해주세요.
            </p>
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="예: A book cover titled 'Farewell' about a sad parting"
              className="w-full p-3 border-2 rounded-lg bg-paper dark:bg-forest-sub border-ink/20 dark:border-pale-lavender/20 focus:border-primary-accent dark:focus:border-dark-accent focus:outline-none resize-none"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full px-6 py-3 bg-primary-accent text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '생성 중...' : '생성하기'}
            </button>
          </>
        )}

        {/* Image Upload View */}
        {currentView === 'upload' && (
          <div className="space-y-4">
            <p className="text-sm text-ink/80 dark:text-pale-lavender/80">
              사용자 이미지 파일을 업로드하여 표지로 설정합니다.
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
              className="w-full p-2 border-2 rounded-lg bg-paper dark:bg-forest-sub border-ink/20 dark:border-pale-lavender/20 focus:border-primary-accent dark:focus:border-dark-accent focus:outline-none"
              disabled={uploading}
            />
            {selectedFile && (
                <p className="text-sm text-ink/60 dark:text-pale-lavender/60">선택된 파일: {selectedFile.name}</p>
            )}
            <button
              onClick={handleFileUpload}
              disabled={uploading || !selectedFile}
              className="w-full px-6 py-3 bg-primary-accent text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? '업로드 중...' : '파일 업로드'}
            </button>
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {aiTextMessage && (
            <div className="p-3 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
                <h3 className="font-semibold mb-1">AI 응답:</h3>
                <p>{aiTextMessage}</p>
                <p className="mt-2 text-xs opacity-80">이미지 생성이 불가하여 텍스트로 응답했습니다. 프롬프트를 다르게 시도해보세요.</p>
            </div>
        )}
        {isLoading && (
            <div className="text-center p-4">
                <p>프롬프트를 기반으로 이미지를 생성합니다...</p>
            </div>
        )}

        {(generatedImage && !isLoading && !uploading) && ( // Show generated/uploaded image if available and not loading/uploading
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">선택된 이미지:</h3>
              <img src={generatedImage} alt="Selected cover" className="w-full rounded-lg shadow-md" />
            </div>
            <div className="flex justify-between space-x-2 mt-4">
                <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 border border-ink/20 dark:border-pale-lavender/20 text-ink dark:text-pale-lavender font-semibold rounded-lg hover:bg-ink/5 dark:hover:bg-pale-lavender/10 transition-colors"
                >
                    닫기
                </button>
                <button
                    onClick={handleDownloadImage}
                    className="flex-1 px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                >
                    이미지 다운로드
                </button>
                <button
                    onClick={handleSaveCover}
                    className="flex-1 px-4 py-3 bg-dark-accent text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors"
                >
                    이 이미지로 표지 설정
                </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
