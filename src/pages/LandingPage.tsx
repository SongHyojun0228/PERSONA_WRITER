import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { Footer } from '../components/Footer';

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'AI 글쓰기 어시스턴트',
    description: 'AI가 다음 전개를 제안하고, 문장을 다듬어주며, 막힌 부분을 함께 풀어나갑니다.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: '캐릭터 관리 & 인물관계도',
    description: '등장인물을 체계적으로 관리하고, 인물 간의 관계를 시각적으로 정리하세요.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: '페이지 단위 관리',
    description: '작품을 페이지 단위로 나누어 체계적으로 관리하고, 통합본으로 묶어보세요.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    title: '커뮤니티 발행 & 공유',
    description: '완성된 이야기를 이야기 광장에 발행하고, 독자들과 소통하세요.',
  },
];

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-paper dark:bg-midnight text-ink dark:text-pale-lavender">
      {/* Header */}
      <header className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold text-primary-accent dark:text-dark-accent">
              Persona Writer
            </h1>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-primary-accent dark:bg-dark-accent hover:opacity-90 transition-opacity"
              >
                로그인
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-accent/10 via-transparent to-primary-accent/5 dark:from-dark-accent/10 dark:to-dark-accent/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              <span className="text-primary-accent dark:text-dark-accent">AI</span>와 함께{' '}
              <br className="hidden sm:block" />
              당신만의 이야기를 만드세요
            </h2>
            <p className="mt-6 text-lg md:text-xl text-ink/70 dark:text-pale-lavender/70 max-w-2xl mx-auto">
              캐릭터를 만들고, 복선을 심고, AI의 도움을 받아 완성도 높은 이야기를 써보세요.
              Persona Writer가 당신의 창작을 돕겠습니다.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3 text-lg font-semibold rounded-xl text-white bg-primary-accent dark:bg-dark-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary-accent/25 dark:shadow-dark-accent/25"
              >
                무료로 시작하기
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto px-8 py-3 text-lg font-semibold rounded-xl border-2 border-primary-accent/30 dark:border-dark-accent/30 text-primary-accent dark:text-dark-accent hover:bg-primary-accent/5 dark:hover:bg-dark-accent/5 transition-colors"
              >
                기능 살펴보기
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-primary-accent dark:text-dark-accent">
              창작을 위한 모든 도구
            </h3>
            <p className="mt-4 text-lg text-ink/60 dark:text-pale-lavender/60">
              이야기를 구상하고, 쓰고, 발행하기까지 — 모든 과정을 하나의 공간에서.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-primary-accent/5 dark:bg-dark-accent/10 hover:bg-primary-accent/10 dark:hover:bg-dark-accent/15 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-accent/10 dark:bg-dark-accent/20 text-primary-accent dark:text-dark-accent flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-bold mb-2">{feature.title}</h4>
                <p className="text-sm text-ink/70 dark:text-pale-lavender/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PWA Install Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-primary-accent dark:text-dark-accent">
              앱으로 설치하기
            </h3>
            <p className="mt-4 text-lg text-ink/60 dark:text-pale-lavender/60">
              앱스토어 없이, 브라우저에서 바로 설치하세요. 앱처럼 빠르고 편리하게 사용할 수 있습니다.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-primary-accent/5 dark:bg-dark-accent/10 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-primary-accent/10 dark:bg-dark-accent/20 text-primary-accent dark:text-dark-accent flex items-center justify-center mb-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold mb-2">Android</h4>
              <p className="text-sm text-ink/70 dark:text-pale-lavender/70 leading-relaxed">
                Chrome 메뉴(⋮)에서<br /><strong>"앱 설치"</strong>를 선택하세요
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-primary-accent/5 dark:bg-dark-accent/10 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-primary-accent/10 dark:bg-dark-accent/20 text-primary-accent dark:text-dark-accent flex items-center justify-center mb-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold mb-2">iPhone / iPad</h4>
              <p className="text-sm text-ink/70 dark:text-pale-lavender/70 leading-relaxed">
                Safari 공유 버튼(□↑)에서<br /><strong>"홈 화면에 추가"</strong>를 선택하세요
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-primary-accent/5 dark:bg-dark-accent/10 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-primary-accent/10 dark:bg-dark-accent/20 text-primary-accent dark:text-dark-accent flex items-center justify-center mb-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold mb-2">PC (Chrome / Edge)</h4>
              <p className="text-sm text-ink/70 dark:text-pale-lavender/70 leading-relaxed">
                주소창 오른쪽의<br /><strong>설치 아이콘(⊕)</strong>을 클릭하세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-r from-primary-accent/10 to-primary-accent/5 dark:from-dark-accent/15 dark:to-dark-accent/5">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              지금 바로 첫 이야기를 시작해보세요
            </h3>
            <p className="text-ink/60 dark:text-pale-lavender/60 mb-8">
              가입은 무료이며, 바로 글을 쓰기 시작할 수 있습니다.
            </p>
            <Link
              to="/login"
              className="inline-block px-8 py-3 text-lg font-semibold rounded-xl text-white bg-primary-accent dark:bg-dark-accent hover:opacity-90 transition-opacity"
            >
              시작하기
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
