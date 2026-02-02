import { Editor } from '@tiptap/react';
import {
  FlagIcon,
  Heading1Icon,
  Heading2Icon,
  ListIcon,
  ListOrderedIcon,
  SpellCheckIcon,
  ConsistencyCheckIcon,
} from './Icons';
import { useProjectContext } from '../context/ProjectContext';

interface MenuBarProps {
  editor: Editor | null;
  onSpellCheck: () => void;
  onPacingCheck: () => void;
  onConsistencyCheck: () => void;
}

const MenuBar = ({ editor, onSpellCheck, onPacingCheck, onConsistencyCheck }: MenuBarProps) => {
  const { addForeshadow } = useProjectContext();

  if (!editor) {
    return null;
  }

  const handleAddForeshadow = () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ').trim();

    if (selectedText) {
        addForeshadow(selectedText);
    }
  };

  const colors = ['#8B5CF6', '#EF4444', '#10B981', '#3B82F6', '#F97316'];

  return (
    <div className="flex items-center p-2 border-b border-ink/10 dark:border-pale-lavender/10 space-x-2">

      {/* Headings */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-primary-accent/20 dark:bg-dark-accent/30' : ''}`}
        aria-label="Heading 1"
      >
        <h1 className="text-lg font-bold">H1</h1>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-primary-accent/20 dark:bg-dark-accent/30' : ''}`}
        aria-label="Heading 2"
      >
        <h2 className="text-base font-bold">H2</h2>
      </button>
      <button /* NEW H3 Button */
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-primary-accent/20 dark:bg-dark-accent/30' : ''}`}
        aria-label="Heading 3"
      >
        <h3 className="text-sm font-bold">H3</h3> {/* text-sm for H3 size */}
      </button>

      <div className="h-6 border-l border-ink/10 dark:border-pale-lavender/10 mx-2"></div>

      {/* Bold */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded ${editor.isActive('bold') ? 'bg-primary-accent/20 dark:bg-dark-accent/30' : ''}`}
        aria-label="Bold"
      >
        <strong>B</strong>
      </button>

      {/* Italic */}
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded ${editor.isActive('italic') ? 'bg-primary-accent/20 dark:bg-dark-accent/30' : ''}`}
        aria-label="Italic"
      >
        <em>I</em>
      </button>
      
      <div className="h-6 border-l border-ink/10 dark:border-pale-lavender/10 mx-2"></div>

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-primary-accent/20 dark:bg-dark-accent/30' : ''}`}
        aria-label="Bullet list"
      >
        <ListOrderedIcon className="w-5 h-5" /> {/* Swap icon */}
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-primary-accent/20 dark:bg-dark-accent/30' : ''}`}
        aria-label="Ordered list"
      >
        <ListIcon className="w-5 h-5" /> {/* Swap icon */}
      </button>
      
      <div className="h-6 border-l border-ink/10 dark:border-pale-lavender/10 mx-2"></div>
      
      {/* Color picker */}
      <div className="relative group p-1">
        <button className="p-1 rounded text-xl flex items-center justify-center" aria-label="Text color">
          🎨
        </button>
        <div className="absolute top-[calc(100%+4px)] left-0 hidden group-hover:flex bg-paper dark:bg-midnight border border-ink/10 dark:border-pale-lavender/10 rounded-lg p-2 shadow-lg space-x-1 z-10">
          {colors.map(color => (
            <button
              key={color}
              onClick={() => editor.chain().focus().setColor(color).run()}
              className={`w-6 h-6 rounded-full border-2 ${editor.isActive('textStyle', { color }) ? 'border-primary-accent dark:border-dark-accent' : 'border-transparent'}`}
              style={{ backgroundColor: color }}
              aria-label={`Set color to ${color}`}
            />
          ))}
          <button
            onClick={() => editor.chain().focus().unsetColor().run()}
            className="p-1 text-xs"
            aria-label="Unset color"
          >
            Reset
          </button>
        </div>
      </div>
      
      <div className="h-6 border-l border-ink/10 dark:border-pale-lavender/10 mx-2"></div>

      {/* Foreshadow Button */}
      <button
        onClick={handleAddForeshadow}
        className="p-2 rounded"
        aria-label="Add foreshadowing"
        title="선택한 텍스트를 복선으로 추가"
      >
        <FlagIcon className="w-5 h-5" />
      </button>

      <div className="h-6 border-l border-ink/10 dark:border-pale-lavender/10 mx-2"></div>

      {/* Spell Check Button */}
      <button
        onClick={onSpellCheck}
        className="p-2 rounded"
        aria-label="Spell Check"
        title="맞춤법 검사"
      >
        <SpellCheckIcon className="w-5 h-5" />
      </button>
      
      <div className="h-6 border-l border-ink/10 dark:border-pale-lavender/10 mx-2"></div>

      {/* Pacing Check Button */}
      <button
        onClick={onPacingCheck}
        className="p-2 rounded text-xl flex items-center justify-center" // text-xl for emoji size
        aria-label="Pacing Check"
        title="글의 리듬감 검사"
      >
        🎵
      </button>

      <div className="h-6 border-l border-ink/10 dark:border-pale-lavender/10 mx-2"></div>

      {/* Character Consistency Check Button */}
      <button
        onClick={onConsistencyCheck}
        className="p-2 rounded"
        aria-label="Character Consistency Check"
        title="캐릭터 일관성 검사"
      >
        <ConsistencyCheckIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default MenuBar;
