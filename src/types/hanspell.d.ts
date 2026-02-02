declare module 'hanspell' {
  export interface HanspellResult { // Add 'export' here
    token: string;
    suggestions: string[];
    info: string;
    type: number; // 0 for correct, others for different error types
    start: number; // 0-indexed character start position
    end: number;   // 0-indexed character end position
    context: string; // Made context required
  }

  type HanspellCheckCallback = (partialResults: HanspellResult[]) => void;
  type HanspellEndCallback = () => void;
  type HanspellErrorCallback = (error: Error) => void;

  interface HanspellModule {
    spellCheckByDAUM: (
      sentence: string,
      timeout: number,
      check: HanspellCheckCallback,
      end: HanspellEndCallback,
      error: HanspellErrorCallback
    ) => void;
    spellCheckByPNU: (
      sentence: string,
      timeout: number,
      check: HanspellCheckCallback,
      end: HanspellEndCallback,
      error: HanspellErrorCallback
    ) => void;
  }

  const hanspell: HanspellModule;
  export default hanspell;
}