import React from 'react';
import { Modal } from './Modal';

interface InspirationShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InspirationShopModal: React.FC<InspirationShopModalProps> = ({ isOpen, onClose }) => {
  const pricingTiers = [
    { amount: '1,000원', inspiration: 10, bonus: 0, description: '(100원당 1개)' },
    { amount: '5,000원', inspiration: 55, bonus: 5, description: '(기본 50개 + 보너스 5개)' },
    { amount: '10,000원', inspiration: 115, bonus: 15, description: '(기본 100개 + 보너스 15개)' },
    { amount: '30,000원', inspiration: 360, bonus: 60, description: '(기본 300개 + 보너스 60개)' },
    { amount: '50,000원', inspiration: 625, bonus: 125, description: '(기본 500개 + 보너스 125개)' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="영감 구매">
      <div className="space-y-4">
        <p className="text-ink/80 dark:text-pale-lavender/80">
          더 많은 영감을 구매하여 당신의 이야기를 풍성하게 만드세요!
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pricingTiers.map((tier, index) => (
            <div key={index} className="border border-ink/20 dark:border-pale-lavender/20 rounded-lg p-4 hover:bg-ink/5 dark:hover:bg-pale-lavender/10 transition-colors">
              <h3 className="text-xl font-semibold text-primary-accent dark:text-dark-accent">{tier.amount}</h3>
              <p className="text-3xl font-bold my-2">{tier.inspiration} 영감</p>
              {tier.bonus > 0 && <p className="text-sm text-green-600 dark:text-green-400">보너스 {tier.bonus}개 포함!</p>}
              <p className="text-sm text-ink/60 dark:text-pale-lavender/60">{tier.description}</p>
              <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                구매하기
              </button>
            </div>
          ))}
        </div>
        <p className="text-sm text-ink/60 dark:text-pale-lavender/60 mt-4">
          * 구매 시 회원님의 계정에 영감이 즉시 추가됩니다.
        </p>
      </div>
    </Modal>
  );
};