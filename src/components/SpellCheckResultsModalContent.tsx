import React from 'react';

// Define the type for a single spell check error result from hanspell
interface HanspellError {
  token: string; // The original word or phrase
  suggestions: string[]; // Array of suggested corrections
  info: string; // Information about the error type
  type: number; // Error type code
  context: string; // Make context a required property
}

// Define props for the SpellCheckResultsModalContent component
interface SpellCheckResultsModalContentProps {
  results: HanspellError[];
  onApplyCorrection: (originalText: string, correctedText: string, context: string) => void;
  onApplyAllCorrection: (corrections: { originalText: string; correctedText: string; context: string }[]) => void; // New prop
  onClose: () => void;
}

const SpellCheckResultsModalContent: React.FC<SpellCheckResultsModalContentProps> = ({
  results,
  onApplyCorrection,
  onApplyAllCorrection, // Destructure new prop
  onClose,
}) => {
  if (!results || results.length === 0) {
    return (
      <div className="text-center text-ink dark:text-pale-lavender">
        <p>맞춤법 오류를 찾을 수 없습니다. ✨</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-primary-accent text-white rounded hover:bg-primary-accent/80 transition-colors"
        >
          닫기
        </button>
      </div>
    );
  }

  const handleApplyAll = () => {
    const correctionsToApply = results
      .filter(error => error.suggestions && error.suggestions.length > 0)
      .map(error => ({
        originalText: error.token,
        correctedText: error.suggestions[0], // Use the first suggestion
        context: error.context,
      }));
    
    onApplyAllCorrection(correctionsToApply);
    onClose(); // Close after attempting all corrections
  };

  return (
    <div className="max-h-96 overflow-y-auto">
      <h3 className="text-xl font-bold mb-4 text-ink dark:text-pale-lavender">맞춤법 검사 결과</h3>
      {results.map((error, index) => (
        <div key={index} className="mb-4 p-3 border border-ink/10 dark:border-pale-lavender/10 rounded-md">
          <p className="font-semibold text-primary-accent dark:text-dark-accent mb-1">
            틀린 단어: <span className="line-through text-red-500">{error.token}</span>
          </p>
          {error.suggestions && error.suggestions.length > 0 ? (
            <>
              <p className="text-sm text-ink/80 dark:text-pale-lavender/80 mb-2">추천 수정:</p>
              <div className="flex flex-wrap gap-2">
                {error.suggestions.map((suggestion, sIndex) => (
                  <button
                    key={sIndex}
                    onClick={() => {
                      onApplyCorrection(error.token, suggestion, error.context);
                      onClose(); // Close after applying single correction
                    }}
                    className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-ink/60 dark:text-pale-lavender/60">추천 수정 없음</p>
          )}
          {error.info && (
            <p className="text-xs text-ink/50 dark:text-pale-lavender/50 mt-2">
              정보: {error.info}
            </p>
          )}
        </div>
      ))}
      <div className="mt-6 flex justify-between">
        <button
          onClick={handleApplyAll}
          className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          모두 수정
        </button>
        <button
          onClick={onClose}
          className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-ink dark:text-pale-lavender rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default SpellCheckResultsModalContent;