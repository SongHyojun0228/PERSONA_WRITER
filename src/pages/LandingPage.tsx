import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { Footer } from '../components/Footer';
import { useInView } from '../hooks/useInView';

/* ───────────────────── data ───────────────────── */

const features = [
  {
    icon: '🤖',
    title: 'AI 글쓰기 어시스턴트',
    description: 'AI가 다음 전개를 제안하고, 문장을 다듬어주며, 막힌 부분을 함께 풀어나갑니다.',
  },
  {
    icon: '👥',
    title: '캐릭터 관리 & 인물관계도',
    description: '등장인물을 체계적으로 관리하고, 인물 간의 관계를 시각적으로 정리하세요.',
  },
  {
    icon: '📄',
    title: '페이지 단위 관리',
    description: '작품을 페이지 단위로 나누어 체계적으로 관리하고, 통합본으로 묶어보세요.',
  },
  {
    icon: '✏️',
    title: '리치 텍스트 에디터',
    description: '제목, 본문, 이미지까지 — 풍부한 편집 기능으로 이야기에 생명을 불어넣으세요.',
  },
  {
    icon: '🔍',
    title: '복선 추적',
    description: '심어둔 복선을 놓치지 마세요. 텍스트를 선택하면 복선으로 등록하고 추적할 수 있습니다.',
  },
  {
    icon: '🎨',
    title: 'AI 표지 생성',
    description: '작품 내용을 기반으로 AI가 자동으로 아름다운 표지를 만들어 줍니다.',
  },
];

const steps = [
  { num: '01', title: '캐릭터를 만드세요', desc: '이름, 성격, 배경을 설정하고 인물관계도를 그려보세요.' },
  { num: '02', title: 'AI와 함께 쓰세요', desc: '막히는 부분은 AI에게 물어보고, 다음 전개를 제안받으세요.' },
  { num: '03', title: '세상에 발행하세요', desc: '완성된 이야기를 이야기 광장에 공유하고 독자와 소통하세요.' },
];

const showcaseTabs = [
  { id: 'editor', label: '에디터', img: '/screenshots/editor-new.png', alt: 'Persona Writer 에디터 화면 - AI 어시스턴트와 리치 텍스트 편집기' },
  { id: 'community', label: '이야기 광장', img: '/screenshots/community-new.png', alt: '이야기 광장 - 발행된 작품 목록과 커뮤니티' },
  { id: 'projects', label: '작품 목록', img: '/screenshots/projects-new.png', alt: '내 작품 목록 관리 화면' },
  { id: 'spellcheck', label: '맞춤법 검사', img: '/screenshots/spellcheck.png', alt: 'AI 맞춤법 검사 기능' },
];

const stats = [
  { value: '100+', label: '활동 작가' },
  { value: '500+', label: '발행된 이야기' },
  { value: '무료', label: '이용 가격' },
  { value: 'PWA', label: '앱 설치 지원' },
];

/* ───────────────────── helper ───────────────────── */

function Section({ children, className = '', id, ariaLabel }: { children: React.ReactNode; className?: string; id?: string; ariaLabel?: string }) {
  const { ref, isInView } = useInView();
  return (
    <section
      id={id}
      ref={ref}
      aria-label={ariaLabel}
      className={`transition-opacity duration-700 ${isInView ? 'opacity-100' : 'opacity-0'} ${className}`}
    >
      {children}
    </section>
  );
}

/* ───────────────────── JSON-LD ───────────────────── */

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Persona Writer',
  url: 'https://persona-writer.vercel.app',
  description: '캐릭터를 만들고, 복선을 심고, AI의 도움을 받아 완성도 높은 이야기를 써보세요. 무료 AI 소설 쓰기 플랫폼.',
  applicationCategory: 'CreativeWork',
  operatingSystem: 'Web, Android, iOS',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KRW',
  },
  featureList: [
    'AI 글쓰기 어시스턴트',
    '캐릭터 관리 및 인물관계도',
    '페이지 단위 관리',
    '리치 텍스트 에디터',
    '복선 추적',
    'AI 표지 생성',
  ],
  inLanguage: 'ko',
};

/* ───────────────────── component ───────────────────── */

export const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('editor');
  const activeShowcase = showcaseTabs.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-paper dark:bg-midnight text-ink dark:text-pale-lavender">
      {/* JSON-LD 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ─── 1. Sticky Header ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-paper/80 dark:bg-midnight/80 border-b border-primary-accent/10 dark:border-dark-accent/10" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="#" className="text-xl font-bold text-primary-accent dark:text-dark-accent" aria-label="Persona Writer 홈">
              Persona Writer
            </a>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink/70 dark:text-pale-lavender/70" aria-label="메인 네비게이션">
              <a href="#features" className="hover:text-primary-accent dark:hover:text-dark-accent transition-colors">기능</a>
              <a href="#how-it-works" className="hover:text-primary-accent dark:hover:text-dark-accent transition-colors">사용법</a>
              <a href="#showcase" className="hover:text-primary-accent dark:hover:text-dark-accent transition-colors">미리보기</a>
              <a href="#community" className="hover:text-primary-accent dark:hover:text-dark-accent transition-colors">커뮤니티</a>
            </nav>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link
                to="/login"
                className="px-5 py-2 text-sm font-semibold rounded-lg text-white bg-primary-accent dark:bg-dark-accent hover:opacity-90 transition-opacity"
              >
                시작하기
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* spacer for fixed header */}
      <div className="h-16" aria-hidden="true" />

      <main>
        {/* ─── 2. Hero Section ─── */}
        <section className="relative overflow-hidden py-20 md:py-28 lg:py-36" aria-label="소개">
          {/* decorative blurs */}
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-primary-accent/20 dark:bg-dark-accent/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-primary-accent/10 dark:bg-dark-accent/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
              {/* left — text */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                  당신의 이야기에
                  <br />
                  <span className="animate-gradient-text bg-gradient-to-r from-primary-accent via-purple-400 to-primary-accent dark:from-dark-accent dark:via-purple-300 dark:to-dark-accent whitespace-nowrap">
                    AI의 날개를
                  </span>{' '}
                  달아주세요
                </h1>
                <p className="mt-6 text-lg md:text-xl text-ink/70 dark:text-pale-lavender/70 max-w-lg">
                  캐릭터를 만들고, 복선을 심고, AI의 도움을 받아 완성도 높은 이야기를 써보세요.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 md:justify-start justify-center">
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-8 py-3.5 text-lg font-semibold rounded-xl text-white bg-primary-accent dark:bg-dark-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary-accent/25 dark:shadow-dark-accent/25 animate-pulse-glow"
                  >
                    무료로 시작하기
                  </Link>
                  <a
                    href="#features"
                    className="w-full sm:w-auto px-8 py-3.5 text-lg font-semibold rounded-xl border-2 border-primary-accent/30 dark:border-dark-accent/30 text-primary-accent dark:text-dark-accent hover:bg-primary-accent/5 dark:hover:bg-dark-accent/5 transition-colors"
                  >
                    기능 살펴보기
                  </a>
                </div>
              </div>

              {/* right — screenshot */}
              <figure className="flex-1 relative">
                <div className="animate-float">
                  <img
                    src="/screenshots/editor-new.png"
                    alt="Persona Writer 에디터 — AI 어시스턴트, 복선 추적, 리치 텍스트 편집기가 포함된 글쓰기 화면"
                    className="rounded-2xl shadow-2xl shadow-primary-accent/10 dark:shadow-dark-accent/10 border border-primary-accent/10 dark:border-dark-accent/10"
                    width={800}
                    height={500}
                    loading="eager"
                  />
                </div>
                {/* floating badges */}
                <div className="absolute -bottom-4 -left-4 sm:bottom-4 sm:-left-6 bg-white dark:bg-forest-sub px-4 py-2 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2" aria-hidden="true">
                  <span className="text-primary-accent dark:text-dark-accent text-lg">🤖</span>
                  AI 어시스턴트
                </div>
                <div className="absolute -top-4 -right-4 sm:top-4 sm:-right-6 bg-white dark:bg-forest-sub px-4 py-2 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2" aria-hidden="true">
                  <span className="text-primary-accent dark:text-dark-accent text-lg">📖</span>
                  복선 추적
                </div>
              </figure>
            </div>
          </div>
        </section>

        {/* ─── 3. Features Grid ─── */}
        <Section id="features" ariaLabel="주요 기능" className="py-20 md:py-28 bg-primary-accent/[0.02] dark:bg-dark-accent/[0.03]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-accent dark:text-dark-accent">
                창작을 위한 모든 도구
              </h2>
              <p className="mt-4 text-lg text-ink/60 dark:text-pale-lavender/60">
                이야기를 구상하고, 쓰고, 발행하기까지 — 모든 과정을 하나의 공간에서.
              </p>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" role="list">
              {features.map((f, i) => (
                <article
                  key={f.title}
                  role="listitem"
                  className="group p-6 rounded-2xl bg-white dark:bg-forest-sub/60 border border-primary-accent/10 dark:border-dark-accent/10 hover:shadow-xl hover:shadow-primary-accent/10 dark:hover:shadow-dark-accent/10 hover:-translate-y-1 transition-all duration-300 opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}
                >
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                  <p className="text-sm text-ink/70 dark:text-pale-lavender/70 leading-relaxed">{f.description}</p>
                </article>
              ))}
            </div>
          </div>
        </Section>

        {/* ─── 4. How It Works ─── */}
        <Section id="how-it-works" ariaLabel="사용 방법" className="py-20 md:py-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-accent dark:text-dark-accent">
                간단한 3단계
              </h2>
              <p className="mt-4 text-lg text-ink/60 dark:text-pale-lavender/60">
                누구나 쉽게 시작할 수 있습니다.
              </p>
            </header>
            <ol className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-4 list-none p-0">
              {steps.map((s, i) => (
                <li key={s.num} className="flex-1 flex flex-col items-center text-center relative">
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[calc(100%-20%)] h-0.5 bg-gradient-to-r from-primary-accent/40 to-primary-accent/10 dark:from-dark-accent/40 dark:to-dark-accent/10" aria-hidden="true" />
                  )}
                  <div className="w-16 h-16 rounded-full bg-primary-accent/10 dark:bg-dark-accent/15 flex items-center justify-center text-2xl font-bold text-primary-accent dark:text-dark-accent mb-4 relative z-10" aria-hidden="true">
                    {s.num}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                  <p className="text-sm text-ink/60 dark:text-pale-lavender/60 max-w-xs">{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </Section>

        {/* ─── 5. App Showcase ─── */}
        <Section id="showcase" ariaLabel="앱 미리보기" className="py-20 md:py-28 bg-primary-accent/[0.02] dark:bg-dark-accent/[0.03]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-accent dark:text-dark-accent">
                미리 둘러보세요
              </h2>
              <p className="mt-4 text-lg text-ink/60 dark:text-pale-lavender/60">
                Persona Writer의 주요 화면들을 확인해보세요.
              </p>
            </header>

            {/* tabs */}
            <div className="flex justify-center gap-2 mb-8 flex-wrap" role="tablist" aria-label="스크린샷 탭">
              {showcaseTabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-accent dark:bg-dark-accent text-white shadow-lg shadow-primary-accent/25 dark:shadow-dark-accent/25'
                      : 'bg-primary-accent/5 dark:bg-dark-accent/10 text-ink/70 dark:text-pale-lavender/70 hover:bg-primary-accent/10 dark:hover:bg-dark-accent/15'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* screenshot */}
            <figure
              id={`panel-${activeShowcase.id}`}
              role="tabpanel"
              className="rounded-2xl overflow-hidden border border-primary-accent/10 dark:border-dark-accent/10 shadow-2xl shadow-primary-accent/5 dark:shadow-dark-accent/5"
            >
              <img
                src={activeShowcase.img}
                alt={activeShowcase.alt}
                className="w-full"
                loading="lazy"
              />
            </figure>
          </div>
        </Section>

        {/* ─── 6. Community Preview ─── */}
        <Section id="community" ariaLabel="커뮤니티 소개" className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
              {/* left — screenshot */}
              <figure className="flex-1">
                <img
                  src="/screenshots/community-new.png"
                  alt="이야기 광장 — 발행된 작품을 탐색하고 좋아요와 댓글로 소통하는 커뮤니티 화면"
                  className="rounded-2xl shadow-xl border border-primary-accent/10 dark:border-dark-accent/10"
                  width={800}
                  height={500}
                  loading="lazy"
                />
              </figure>
              {/* right — text */}
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-bold text-primary-accent dark:text-dark-accent mb-6">
                  이야기 광장에서 만나요
                </h2>
                <ul className="space-y-4">
                  {[
                    '완성된 작품을 커뮤니티에 발행하세요',
                    '다른 작가들의 이야기를 읽고 좋아요를 남기세요',
                    '댓글로 피드백을 주고받으세요',
                    '인기 작품과 신작을 한눈에 확인하세요',
                  ].map((text) => (
                    <li key={text} className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-primary-accent dark:text-dark-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-ink/80 dark:text-pale-lavender/80">{text}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/login"
                  className="inline-block mt-8 px-6 py-3 text-sm font-semibold rounded-xl text-white bg-primary-accent dark:bg-dark-accent hover:opacity-90 transition-opacity"
                >
                  광장 둘러보기
                </Link>
              </div>
            </div>
          </div>
        </Section>

        {/* ─── 7. Stats / Social Proof ─── */}
        <Section ariaLabel="서비스 현황" className="py-20 md:py-28 bg-primary-accent/[0.02] dark:bg-dark-accent/[0.03]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className="text-center opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}
                >
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="text-4xl md:text-5xl font-extrabold text-primary-accent dark:text-dark-accent">
                    {s.value}
                  </dd>
                  <dd className="mt-2 text-sm text-ink/60 dark:text-pale-lavender/60 font-medium">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Section>

        {/* ─── 8. PWA Install ─── */}
        <Section ariaLabel="앱 설치 안내" className="py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <aside className="rounded-3xl bg-gradient-to-br from-primary-accent/10 via-primary-accent/5 to-transparent dark:from-dark-accent/15 dark:via-dark-accent/5 dark:to-transparent p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-primary-accent dark:text-dark-accent mb-3">
                앱으로 설치하기
              </h2>
              <p className="text-center text-ink/60 dark:text-pale-lavender/60 mb-10">
                앱스토어 없이, 브라우저에서 바로 설치하세요.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { platform: 'Android', icon: '📱', instruction: 'Chrome 메뉴(⋮)에서 "앱 설치"를 선택하세요' },
                  { platform: 'iPhone / iPad', icon: '📱', instruction: 'Safari 공유 버튼(□↑)에서 "홈 화면에 추가"를 선택하세요' },
                  { platform: 'PC (Chrome / Edge)', icon: '💻', instruction: '주소창 오른쪽의 설치 아이콘(⊕)을 클릭하세요' },
                ].map((p) => (
                  <article key={p.platform} className="bg-white/60 dark:bg-forest-sub/40 rounded-2xl p-6 text-center">
                    <div className="text-3xl mb-3" aria-hidden="true">{p.icon}</div>
                    <h3 className="font-bold mb-2">{p.platform}</h3>
                    <p className="text-sm text-ink/70 dark:text-pale-lavender/70">{p.instruction}</p>
                  </article>
                ))}
              </div>
            </aside>
          </div>
        </Section>

        {/* ─── 9. Final CTA ─── */}
        <section className="py-20 md:py-28" aria-label="시작하기">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-r from-primary-accent to-purple-500 dark:from-dark-accent dark:to-purple-400 p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                지금 바로 첫 이야기를 시작해보세요
              </h2>
              <p className="text-white/80 text-lg mb-8">
                가입은 무료이며, 바로 글을 쓰기 시작할 수 있습니다.
              </p>
              <Link
                to="/login"
                className="inline-block px-8 py-3.5 text-lg font-semibold rounded-xl bg-white text-primary-accent hover:bg-white/90 transition-colors shadow-lg"
              >
                시작하기
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
