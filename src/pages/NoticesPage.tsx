import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ThemeToggle } from '../components/ThemeToggle';

interface Notice {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
}

export const NoticesPage = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notices:', error);
      } else {
        setNotices(data as Notice[]);
      }
      setLoading(false);
    };

    fetchNotices();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-paper dark:bg-midnight text-ink dark:text-pale-lavender">
      {/* Header */}
      <header className="w-full border-b border-ink/10 dark:border-pale-lavender/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-ink/60 dark:text-pale-lavender/60 hover:text-primary-accent dark:hover:text-dark-accent transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <Link to="/">
                <h1 className="text-xl font-bold text-primary-accent dark:text-dark-accent">
                  Persona Writer
                </h1>
              </Link>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-extrabold text-primary-accent dark:text-dark-accent mb-8">
          공지사항
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-accent dark:border-dark-accent" />
          </div>
        ) : notices.length === 0 ? (
          <p className="text-center py-16 text-ink/50 dark:text-pale-lavender/50">
            아직 공지사항이 없습니다.
          </p>
        ) : (
          <div className="space-y-3">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="border border-ink/10 dark:border-pale-lavender/10 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleExpand(notice.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-ink/5 dark:hover:bg-pale-lavender/5 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    {notice.is_pinned && (
                      <span className="flex-shrink-0 text-base" title="고정 공지">
                        📌
                      </span>
                    )}
                    <span className="font-medium truncate">{notice.title}</span>
                  </div>
                  <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
                    <span className="text-sm text-ink/40 dark:text-pale-lavender/40">
                      {new Date(notice.created_at).toLocaleDateString('ko-KR')}
                    </span>
                    <svg
                      className={`w-4 h-4 text-ink/40 dark:text-pale-lavender/40 transition-transform ${
                        expandedId === notice.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {expandedId === notice.id && (
                  <div className="px-5 pb-5 pt-2 border-t border-ink/10 dark:border-pale-lavender/10">
                    <div
                      className="prose dark:prose-invert prose-sm max-w-none text-ink/80 dark:text-pale-lavender/80 whitespace-pre-wrap"
                    >
                      {notice.content}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
