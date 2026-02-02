import { useTheme } from '../hooks/useTheme';
import { SunIcon, MoonIcon } from './Icons';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-primary-accent text-white dark:bg-dark-accent dark:text-midnight hover:opacity-80 transition-opacity"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
    </button>
  );
};
