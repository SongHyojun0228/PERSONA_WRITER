import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="py-8 border-t border-ink/10 dark:border-pale-lavender/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-4">
          {/* Kakao Channel Button */}
          <a
            href="http://pf.kakao.com/_SzEzX"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
            style={{ backgroundColor: '#FEE500', color: '#191919' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.794 5.11 4.504 6.46-.176.652-.638 2.363-.73 2.727-.112.448.164.442.345.321.142-.095 2.264-1.538 3.178-2.167.556.08 1.13.122 1.703.122 5.523 0 10-3.463 10-7.463C22 6.463 17.523 3 12 3z" />
            </svg>
            <span>카카오톡 채널 추가</span>
          </a>

          {/* Links */}
          <div className="flex items-center space-x-4 text-sm text-ink/50 dark:text-pale-lavender/50">
            <Link
              to="/notices"
              className="hover:text-primary-accent dark:hover:text-dark-accent transition-colors"
            >
              공지사항
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-sm text-ink/50 dark:text-pale-lavender/50">
            &copy; {new Date().getFullYear()} Persona Writer. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
