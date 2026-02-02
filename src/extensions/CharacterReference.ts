import { Mark, mergeAttributes } from '@tiptap/core';

export interface CharacterReferenceOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    characterReference: {
      /**
       * Set a character reference mark
       */
      setCharacterReference: (attributes: { characterId: string; characterName: string }) => ReturnType;
      /**
       * Toggle a character reference mark
       */
      toggleCharacterReference: (attributes: { characterId: string; characterName: string }) => ReturnType;
      /**
       * Unset a character reference mark
       */
      unsetCharacterReference: () => ReturnType;
    };
  }
}

export const CharacterReference = Mark.create<CharacterReferenceOptions>({
  name: 'characterReference',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      characterId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-character-id'),
        renderHTML: (attributes) => ({
          'data-character-id': attributes.characterId,
        }),
      },
      characterName: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-character-name'),
        renderHTML: (attributes) => ({
            'data-character-name': attributes.characterName,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-character-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { class: 'character-reference' }), 0];
  },

  addCommands() {
    return {
      setCharacterReference: (attributes) => ({ commands }) => {
        return commands.setMark(this.name, attributes);
      },
      toggleCharacterReference: (attributes) => ({ commands }) => {
        return commands.toggleMark(this.name, attributes);
      },
      unsetCharacterReference: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },
});
