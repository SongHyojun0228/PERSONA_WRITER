import React from 'react';
import { Modal } from './Modal';
import spiritIcon from '../assets/spirit.png';

interface PurchaseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  storyTitle: string;
  costInInspiration: number;
  currentUserInspiration: number;
}

export const PurchaseConfirmationModal: React.FC<PurchaseConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  storyTitle,
  costInInspiration,
  currentUserInspiration,
}) => {
  const hasEnoughInspiration = currentUserInspiration >= costInInspiration;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="영감 사용 확인">
      <div className="space-y-4 text-center">
        <p className="text-lg text-ink dark:text-pale-lavender">
          <span className="font-bold text-primary-accent dark:text-dark-accent">'{storyTitle}'</span> 글을 읽기 위해
        </p>
        <p className="text-lg text-ink dark:text-pale-lavender flex items-center justify-center">
          <span className="inline-flex items-center font-bold text-primary-accent dark:text-dark-accent text-xl">
            <img src={spiritIcon} alt="영감" className="h-6 w-6 mr-1" style={{ verticalAlign: 'middle' }} /> {costInInspiration}개
          </span>
          의 영감이 소모됩니다.
        </p>

        <p className="text-ink/80 dark:text-pale-lavender/80">
          현재 소유하신 영감 수: <br />
          <span className="inline-flex items-center font-bold text-lg">
            <img src={spiritIcon} alt="영감" className="h-5 w-5 mr-1" /> {currentUserInspiration}개
          </span>
        </p>

        <p className="text-lg font-semibold text-ink dark:text-pale-lavender">사용하시겠습니까?</p>

        {!hasEnoughInspiration && (
          <p className="text-red-500 font-bold">영감이 부족합니다. 영감을 충전해주세요!</p>
        )}

        <div className="flex justify-center space-x-4 pt-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-ink/20 dark:border-pale-lavender/20 text-ink dark:text-pale-lavender font-semibold rounded-lg hover:bg-ink/5 dark:hover:bg-pale-lavender/10 transition-colors"
          >
            아니요
          </button>
          <button
            onClick={onConfirm}
            disabled={!hasEnoughInspiration}
            className="px-6 py-2 bg-primary-accent text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            예
          </button>
        </div>
      </div>
    </Modal>
  );
};
