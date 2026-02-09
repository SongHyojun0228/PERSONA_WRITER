import { useState } from 'react';

interface OnboardingModalProps {
  onComplete: () => void;
}

const steps = [
  {
    title: '환영합니다!',
    description: 'Persona Writer에 오신 것을 환영합니다.\n이곳에서 AI의 도움을 받아 당신만의 이야기를 만들어보세요.',
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    title: 'AI 어시스턴트',
    description: 'AI가 다음 전개를 제안하고, 문장을 다듬어주며,\n창작의 막힌 부분을 함께 풀어나갑니다.\n에디터 우측에서 언제든 AI에게 질문할 수 있어요.',
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: '캐릭터와 인물관계',
    description: '등장인물을 캐릭터 시트로 체계적으로 관리하고,\n인물 간의 관계를 시각적으로 정리하세요.\n복선 리스트로 이야기의 복선도 놓치지 않아요.',
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: '앱으로 설치하기',
    description: 'Persona Writer를 앱처럼 사용할 수 있어요!\n\nAndroid: Chrome 메뉴(⋮) > "앱 설치"\niPhone: Safari 공유(□↑) > "홈 화면에 추가"\nPC: 주소창 오른쪽 설치 아이콘(⊕) 클릭',
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
  {
    title: '첫 작품을 시작해보세요!',
    description: '준비가 되셨나요?\n작품 목록에서 "새 작품 시작하기"를 눌러\n당신만의 이야기를 시작해보세요.',
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
];

export const OnboardingModal = ({ onComplete }: OnboardingModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onComplete} />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-paper dark:bg-forest-sub rounded-2xl shadow-2xl overflow-hidden">
        {/* Skip button */}
        <button
          onClick={onComplete}
          className="absolute top-4 right-4 text-sm text-ink/50 dark:text-pale-lavender/50 hover:text-ink dark:hover:text-pale-lavender transition-colors z-10"
        >
          건너뛰기
        </button>

        {/* Content */}
        <div className="p-8 pt-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary-accent/10 dark:bg-dark-accent/20 text-primary-accent dark:text-dark-accent flex items-center justify-center">
            {step.icon}
          </div>
          <h2 className="text-2xl font-bold text-ink dark:text-pale-lavender mb-4">
            {step.title}
          </h2>
          <p className="text-ink/70 dark:text-pale-lavender/70 leading-relaxed whitespace-pre-line">
            {step.description}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center space-x-2 pb-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-primary-accent dark:bg-dark-accent'
                  : 'bg-ink/20 dark:bg-pale-lavender/20'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 pt-2">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm font-medium rounded-lg text-ink/60 dark:text-pale-lavender/60 hover:text-ink dark:hover:text-pale-lavender disabled:opacity-0 transition-all"
          >
            이전
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 text-sm font-semibold rounded-lg text-white bg-primary-accent dark:bg-dark-accent hover:opacity-90 transition-opacity"
          >
            {currentStep === steps.length - 1 ? '시작하기' : '다음'}
          </button>
        </div>
      </div>
    </div>
  );
};
