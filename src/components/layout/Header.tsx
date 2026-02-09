import { Link } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle';
import { NotificationBell } from '../NotificationBell';
import { useAuth } from '../../context/AuthContext';
import spiritIcon from '../../assets/spirit.png';
import { useState, type ReactNode } from 'react';
import { InspirationShopModal } from '../InspirationShopModal';

interface HeaderProps {
  children?: ReactNode;
}

export const Header = ({ children }: HeaderProps) => {
  const { username, inspirationCount } = useAuth();
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);

  return (
    <header className="flex justify-between items-center p-4 border-b border-ink/10 dark:border-pale-lavender/10">
      <Link to="/">
        <h1 className="text-lg sm:text-xl font-bold text-primary-accent dark:text-dark-accent whitespace-nowrap">
          Persona Writer
        </h1>
      </Link>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {children}
        {username && (
          <>
            <Link to="/my-page" className="hidden sm:flex items-center space-x-2 text-ink dark:text-pale-lavender hover:text-primary-accent dark:hover:text-dark-accent transition-colors duration-200">
              <span className="font-medium">{username}</span>
            </Link>
            {inspirationCount !== null && (
              <div
                className="flex items-center space-x-1 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setIsShopModalOpen(true)} // Open modal on click
                title="영감 구매"
              >
                <img src={spiritIcon} alt="Inspiration" className="h-5 w-5" />
                <span className="text-sm font-semibold">{inspirationCount}</span>
              </div>
            )}
          </>
        )}
        <NotificationBell />
        <ThemeToggle />
      </div>

      {/* Render the InspirationShopModal */}
      <InspirationShopModal
        isOpen={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
      />
    </header>
  );
};
