import { useState, useEffect, useCallback } from 'react';

const tourSteps = [
  {
    target: '[data-tour="ai-assistant"]',
    title: 'AI 어시스턴트',
    description: '글쓰기 중 막히는 부분이 있다면 AI에게 도움을 요청하세요. 다음 전개 제안, 문장 다듬기 등을 도와줍니다.',
    position: 'left' as const,
  },
  {
    target: '[data-tour="foreshadow"]',
    title: '복선 리스트',
    description: '에디터에서 텍스트를 선택하면 복선으로 등록할 수 있어요. 이야기의 복선을 놓치지 마세요.',
    position: 'left' as const,
  },
  {
    target: '[data-tour="character-sheet"]',
    title: '캐릭터 시트',
    description: '등장인물을 체계적으로 관리하세요. 캐릭터의 성격, 외모, 배경을 기록할 수 있습니다.',
    position: 'right' as const,
  },
  {
    target: '[data-tour="publish"]',
    title: '작품 발행',
    description: '작품이 완성되면 이야기 광장에 발행하여 독자들과 공유하세요.',
    position: 'left' as const,
  },
];

interface EditorTooltipsProps {
  onComplete: () => void;
}

export const EditorTooltips = ({ onComplete }: EditorTooltipsProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const updatePosition = useCallback(() => {
    const step = tourSteps[currentStep];
    const targetEl = document.querySelector(step.target);

    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      let top = rect.top + rect.height / 2;
      let left: number;

      if (step.position === 'left') {
        left = rect.left - 320;
      } else {
        left = rect.right + 16;
      }

      // Clamp to viewport
      top = Math.max(80, Math.min(top - 60, window.innerHeight - 200));
      left = Math.max(16, Math.min(left, window.innerWidth - 320));

      setTooltipPosition({ top, left });
      setIsVisible(true);
    } else {
      // If target element not found, skip to next or complete
      if (currentStep < tourSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete();
      }
    }
  }, [currentStep, onComplete]);

  useEffect(() => {
    // Delay to let the page render
    const timer = setTimeout(updatePosition, 500);
    return () => clearTimeout(timer);
  }, [updatePosition]);

  const handleNext = () => {
    setIsVisible(false);
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const step = tourSteps[currentStep];

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[60] bg-black/30 pointer-events-auto" onClick={onComplete} />

      {/* Highlight target */}
      <HighlightTarget selector={step.target} />

      {/* Tooltip */}
      <div
        className="fixed z-[70] w-72 bg-paper dark:bg-forest-sub rounded-xl shadow-2xl border border-ink/10 dark:border-pale-lavender/10 p-5 transition-all duration-300"
        style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
      >
        <h3 className="text-base font-bold text-ink dark:text-pale-lavender mb-2">
          {step.title}
        </h3>
        <p className="text-sm text-ink/70 dark:text-pale-lavender/70 leading-relaxed mb-4">
          {step.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink/40 dark:text-pale-lavender/40">
            {currentStep + 1} / {tourSteps.length}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={onComplete}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-ink/50 dark:text-pale-lavender/50 hover:text-ink dark:hover:text-pale-lavender transition-colors"
            >
              건너뛰기
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg text-white bg-primary-accent dark:bg-dark-accent hover:opacity-90 transition-opacity"
            >
              {currentStep === tourSteps.length - 1 ? '완료' : '다음'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const HighlightTarget = ({ selector }: { selector: string }) => {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const el = document.querySelector(selector);
    if (el) {
      setRect(el.getBoundingClientRect());
    }
  }, [selector]);

  if (!rect) return null;

  return (
    <div
      className="fixed z-[65] rounded-lg ring-4 ring-primary-accent dark:ring-dark-accent pointer-events-none"
      style={{
        top: rect.top - 4,
        left: rect.left - 4,
        width: rect.width + 8,
        height: rect.height + 8,
      }}
    />
  );
};
