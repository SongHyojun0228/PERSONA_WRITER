import React from 'react';
import { type Character } from '../data/mock';

interface CharacterPopoverProps {
  character: Character | null;
}

const CharacterPopover: React.FC<CharacterPopoverProps> = ({ character }) => {
  if (!character) {
    return null;
  }

  return (
    <div
      className="z-10 p-4 bg-paper dark:bg-forest-sub border border-ink/10 dark:border-pale-lavender/10 rounded-lg shadow-xl w-64"
    >
      <h3 className="font-bold text-lg text-primary-accent dark:text-dark-accent mb-2">{character.name}</h3>
      <div className="text-sm space-y-1">
        <p><span className="font-semibold">성격:</span> {character.personality || 'N/A'}</p>
        <p><span className="font-semibold">설명:</span> {character.description || 'N/A'}</p>
      </div>
    </div>
  );
};

export default CharacterPopover;
