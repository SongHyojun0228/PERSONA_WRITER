import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import tippy, { type Instance, type Props } from 'tippy.js';
import { type Character } from '../data/mock';
import MentionList from './MentionList';

export const CharacterMentions = Extension.create({
  name: 'characterMentions',

  addOptions() {
    return {
      project: null, // Add project as an option
      suggestion: {
        char: '@',
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }: {query: string}) => {
            const { project } = this.options; // Access project from extension options
            if (!project || !project.characters) {
                return [];
            }
            return project.characters
                .filter((char: Character) =>
                    char.name.toLowerCase().startsWith(query.toLowerCase())
                )
                .map((char: Character) => ({
                    id: char.id,
                    label: char.name,
                }));
        },

        command: ({ editor, range, props }: {editor: any, range: any, props: any}) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertContent([
              {
                type: 'text',
                text: props.label,
                marks: [
                  {
                    type: 'characterReference',
                    attrs: {
                      characterId: props.id,
                      characterName: props.label,
                    },
                  },
                ],
              },
              {
                type: 'text',
                text: ' ',
              },
            ])
            .run();
        },

        render: () => {
          let component: ReactRenderer;
          let popup: Instance<Props>[];

          return {
            onStart: (props) => {
              component = new ReactRenderer(MentionList, {
                props,
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect as any,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            },

            onUpdate(props) {
              component.updateProps(props);

              if (!props.clientRect) {
                return;
              }

              popup[0].setProps({
                getReferenceClientRect: props.clientRect as any,
              });
            },

            onKeyDown(props) {
              if (props.event.key === 'Escape') {
                popup[0].hide();
                return true;
              }
              return (component.ref as any)?.onKeyDown(props);
            },

            onExit() {
              popup[0].destroy();
              component.destroy();
            },
          };
        },
      }),
    ];
  },
});