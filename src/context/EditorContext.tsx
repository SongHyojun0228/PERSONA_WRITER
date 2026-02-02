import { createContext, useState, useContext, type ReactNode, useRef } from 'react';

// Define a function type for the command
type HighlightCommand = (fullTag: string) => void;

interface EditorContextType {
  editorContent: string;
  setEditorContent: (content: string) => void;
  // Use a ref to hold the command function to avoid re-renders
  highlightCommandRef: React.MutableRefObject<HighlightCommand>;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [editorContent, setEditorContent] = useState<string>('');
  
  // Create a ref to hold the highlight function.
  // The default function does nothing. The editor will later set the real implementation.
  const highlightCommandRef = useRef<HighlightCommand>(() => {});

  return (
    <EditorContext.Provider value={{ editorContent, setEditorContent, highlightCommandRef }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  return context;
};
