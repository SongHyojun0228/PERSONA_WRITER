import { type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-paper dark:bg-forest-sub rounded-lg shadow-xl p-8 w-full max-w-md m-4 transform transition-all"
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-ink dark:text-pale-lavender">{title}</h2>
          <button onClick={onClose} className="text-ink/50 dark:text-pale-lavender/50 hover:text-ink dark:hover:text-pale-lavender">&times;</button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};
