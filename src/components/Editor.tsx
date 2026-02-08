import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Link from "@tiptap/extension-link";
import Blockquote from "@tiptap/extension-blockquote";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import MenuBar from "./MenuBar";
import { Modal } from "./Modal";
import SpellCheckResultsModalContent from "./SpellCheckResultsModalContent";
import "./Editor.css";
import { useEditorContext } from '../context/EditorContext';
import { useProjectContext } from '../context/ProjectContext';
import { useEffect, useState, useCallback } from "react";
import { LoadingSpinner } from "./LoadingSpinner";

interface TiptapEditorProps {
  content: string;
  onUpdate: (newContent: string) => void;
}

interface HanspellError {
  token: string;
  suggestions: string[];
  info: string;
  type: number;
  context: string;
}

const TiptapEditor = ({ content, onUpdate }: TiptapEditorProps) => {
  const { setEditorContent, highlightCommandRef } = useEditorContext();
  const { project } = useProjectContext();

  const [isSpellCheckModalOpen, setIsSpellCheckModalOpen] = useState(false);
  const [spellCheckResults, setSpellCheckResults] = useState<HanspellError[]>([]);
  const [isSpellCheckLoading, setIsSpellCheckLoading] = useState(false);

  const [isPacingModalOpen, setIsPacingModalOpen] = useState(false);
  const [pacingAnalysisResult, setPacingAnalysisResult] = useState("");
  const [isPacingLoading, setIsPacingLoading] = useState(false);

  const [isConsistencyModalOpen, setIsConsistencyModalOpen] = useState(false);
  const [consistencyAnalysisResult, setConsistencyAnalysisResult] = useState("");
  const [isConsistencyLoading, setIsConsistencyLoading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        blockquote: false, // Disable default to use custom
        horizontalRule: false, // Disable default to use custom
      }),
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-accent dark:text-dark-accent underline',
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-primary-accent dark:border-dark-accent pl-4 italic',
        },
      }),
      HorizontalRule,
    ],
    editorProps: {
      attributes: { spellcheck: 'true' },
    },
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onUpdate(html);
      setEditorContent(html);
    },
  });

  const applyCorrection = useCallback((originalText: string, correctedText: string, context: string) => {
    if (!editor) return;
    const fullEditorText = editor.getText();
    const contextStartIndex = fullEditorText.indexOf(context);
    if (contextStartIndex === -1) {
      console.warn("Context from hanspell not found in current editor text. Editor content might have changed since the spell check was run.");
      return;
    }
    const originalTextStartIndexInContext = context.indexOf(originalText);
    if (originalTextStartIndexInContext === -1) {
        console.warn("Original text not found within its context from hanspell. This is unexpected.");
        return;
    }
    const from = contextStartIndex + originalTextStartIndexInContext;
    const to = from + originalText.length;
    editor.chain().focus().setTextSelection({ from: from + 1, to: to + 1 }).insertContent(correctedText).run();
  }, [editor]);

  const handleApplyAllCorrection = useCallback((corrections: { originalText: string; correctedText: string; context: string }[]) => {
    if (!editor) return;
    const sortedCorrections = [...corrections].sort((a, b) => {
        const textA = editor.getText();
        const fromA = textA.indexOf(a.context) + a.context.indexOf(a.originalText);
        const textB = editor.getText();
        const fromB = textB.indexOf(b.context) + b.context.indexOf(b.originalText);
        return fromB - fromA;
    });
    sortedCorrections.forEach(c => applyCorrection(c.originalText, c.correctedText, c.context));
    setIsSpellCheckModalOpen(false);
  }, [editor, applyCorrection, setIsSpellCheckModalOpen]);

  const handleSpellCheck = useCallback(async () => {
    if (!editor) return;
    const text = editor.getText();
    if (!text.trim()) {
      alert("맞춤법 검사를 할 내용이 없습니다.");
      return;
    }
    setIsSpellCheckLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/spellcheck`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang: "ko" }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const results: HanspellError[] = await response.json();
      setSpellCheckResults(results.filter((r: any) => r.type !== 0));
      setIsSpellCheckModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch spell check results:", error);
      alert("맞춤법 검사 중 오류가 발생했습니다.");
    } finally {
      setIsSpellCheckLoading(false);
    }
  }, [editor]);

  const handlePacingCheck = useCallback(async () => {
    if (!editor) return;
    const text = editor.getText();
    if (!text.trim()) {
      alert("분석할 텍스트가 없습니다.");
      return;
    }
    setIsPacingLoading(true);
    setPacingAnalysisResult("");
    setIsPacingModalOpen(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/check-pacing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      if (!response.body) throw new Error("Response body is empty");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setPacingAnalysisResult((prev) => prev + chunk);
      }
    } catch (error) {
      console.error("Failed to fetch pacing analysis:", error);
      setPacingAnalysisResult("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsPacingLoading(false);
    }
  }, [editor]);

  const handleConsistencyCheck = useCallback(async () => {
    if (!editor || !project) return;
    const storyText = editor.getText();
    if (!storyText.trim()) {
      alert("분석할 텍스트가 없습니다.");
      return;
    }
    if (!project.characters || project.characters.length === 0) {
      alert("분석할 캐릭터 정보가 없습니다. 먼저 캐릭터 시트를 작성해주세요.");
      return;
    }
    const characterSheet = project.characters
      .map(char => `이름: ${char.name}\n성격: ${char.personality}\n설명: ${char.description}`)
      .join('\n\n');
    setIsConsistencyLoading(true);
    setConsistencyAnalysisResult("");
    setIsConsistencyModalOpen(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/check-consistency`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyText, characterSheet }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      if (!response.body) throw new Error("Response body is empty");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setConsistencyAnalysisResult((prev) => prev + chunk);
      }
    } catch (error) {
      console.error("Failed to fetch consistency analysis:", error);
      setConsistencyAnalysisResult("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsConsistencyLoading(false);
    }
  }, [editor, project]);

  useEffect(() => {
    if (!editor) return;
    setEditorContent(editor.getHTML());
    highlightCommandRef.current = (fullTag: string) => {
      let foundPos: { from: number; to: number } | null = null;
      editor.state.doc.descendants((node, pos) => {
        if (foundPos) return false;
        if (!node.isText) return true;
        const from = node.textContent.indexOf(fullTag);
        if (from >= 0) {
          foundPos = { from: pos + from, to: pos + from + fullTag.length };
        }
        return !foundPos;
      });
      if (foundPos) {
        editor.chain().focus().setTextSelection(foundPos).scrollIntoView().run();
      }
    };
    return () => {
      highlightCommandRef.current = () => {};
    };
  }, [editor, setEditorContent, highlightCommandRef]);

  return (
    <div className="flex flex-col h-full">
      <MenuBar 
        editor={editor} 
        onSpellCheck={handleSpellCheck} 
        onPacingCheck={handlePacingCheck} 
        onConsistencyCheck={handleConsistencyCheck}
      />
      <div className="flex-1 overflow-y-auto relative">
        <EditorContent editor={editor} className="h-full" />
      </div>

      {(isSpellCheckLoading || isPacingLoading || isConsistencyLoading) && (
        <div className="fixed inset-0 bg-midnight/80 dark:bg-midnight/90 backdrop-blur-sm flex justify-center items-center z-50">
          <LoadingSpinner
            size="lg"
            text={
              isPacingLoading
                ? "글의 리듬감을 분석하고 있습니다..."
                : isConsistencyLoading
                ? "캐릭터 일관성을 분석하고 있습니다..."
                : "맞춤법을 검사하고 있습니다..."
            }
          />
        </div>
      )}

      <Modal
        isOpen={isSpellCheckModalOpen}
        onClose={() => { setIsSpellCheckModalOpen(false); setIsSpellCheckLoading(false); }}
        title="맞춤법 검사 결과"
      >
        <SpellCheckResultsModalContent
          results={spellCheckResults}
          onApplyCorrection={(original, corrected, context) => {
            applyCorrection(original, corrected, context);
            setIsSpellCheckModalOpen(false);
          }}
          onApplyAllCorrection={handleApplyAllCorrection}
          onClose={() => { setIsSpellCheckModalOpen(false); setIsSpellCheckLoading(false); }}
        />
      </Modal>

      <Modal
        isOpen={isPacingModalOpen}
        onClose={() => { setIsPacingModalOpen(false); setIsPacingLoading(false); }}
        title="글의 리듬감 분석"
      >
        <div className="max-h-96 overflow-y-auto whitespace-pre-wrap">
          {isPacingLoading ? (
            <p className="text-primary-accent font-bold text-lg">
              글의 리듬감을 분석 중입니다<span className="animate-bounce-dot">.</span><span className="animate-bounce-dot">.</span><span className="animate-bounce-dot">.</span>
            </p>
          ) : (
            pacingAnalysisResult || "분석 중..."
          )}
        </div>
      </Modal>
      
      <Modal
        isOpen={isConsistencyModalOpen}
        onClose={() => { setIsConsistencyModalOpen(false); setIsConsistencyLoading(false); }}
        title="캐릭터 일관성 분석"
      >
        <div className="max-h-96 overflow-y-auto whitespace-pre-wrap">
          {isConsistencyLoading ? (
            <p className="text-primary-accent font-bold text-lg">
              캐릭터 일관성을 분석 중입니다<span className="animate-bounce-dot">.</span><span className="animate-bounce-dot">.</span><span className="animate-bounce-dot">.</span>
            </p>
          ) : (
            consistencyAnalysisResult || "분석 중..."
          )}
        </div>
      </Modal>
    </div>
  );
};

export default TiptapEditor;