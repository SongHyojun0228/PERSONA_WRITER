import { useState, useRef, useEffect } from "react";
import { PaperAirplaneIcon } from "./Icons";
import { useProjectContext } from "../context/ProjectContext";
import { useAuth } from "../context/AuthContext";
import { TypingIndicator } from "./TypingIndicator";

type Message = {
  id: number;
  sender: "user" | "ai";
  text: string;
};

const quickPrompts = [
  "다음 전개 제안해줘",
  "이 문장 더 나은 표현으로 바꿔줘",
  "오타 체크해줘",
  "감정 묘사 추가해줘",
  "대화 장면 개선해줘",
  "배경 묘사 풍부하게"
];

export const AIChat = () => {
  const { project } = useProjectContext();
  const { username } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "ai", text: `${username}님 안녕하세요! 글쓰기에 도움이 필요하신가요?` },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'; // Set to scrollHeight
    }
  }, [input]); // Re-run when input changes

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    // Auto-send after a brief delay to allow state update
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleSendMessage = async () => {
    if (input.trim() === "" || isLoading) return;

    const newUserMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: input,
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsLoading(true);

    // Prepare history for the API
    const history = messages.map((msg) => ({
      role: msg.sender,
      parts: [{ text: msg.text }],
    }));

    // Prepare context for the API
    const characterSheetContent = project?.characters
      .map(
        (c) => `
- Name: ${c.name || "N/A"}
- Gender: ${c.gender || "N/A"}
- Personality: ${c.personality || "N/A"}
- Description: ${c.description || "N/A"}
      `,
      )
      .join("");

    const storyContext = {
      settings: project?.settings.content || "",
      characterSheet: characterSheetContent || "Not provided.",
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history,
          context: storyContext,
          username: username, // Add username to the request body
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to get a response from the server.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponseText = "";
      const aiMessageId = Date.now() + 1;

      // Add a placeholder for the AI message
      setMessages((prev) => [
        ...prev,
        { id: aiMessageId, sender: "ai", text: "..." },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        aiResponseText += decoder.decode(value, { stream: true });

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, text: aiResponseText } : msg,
          ),
        );
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: "오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-primary-accent/5 dark:bg-dark-accent/10 rounded-lg">
      <div
        ref={chatContainerRef}
        className="flex-1 p-4 space-y-4 overflow-y-auto"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl whitespace-pre-wrap break-words ${
                message.sender === "user"
                  ? "bg-primary-accent text-white dark:bg-dark-accent dark:text-midnight"
                  : "bg-paper text-ink dark:bg-midnight dark:text-dark-accent"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-primary-accent/10 dark:bg-dark-accent/20">
              <TypingIndicator />
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="p-2 border-t border-b border-ink/10 dark:border-pale-lavender/10 flex flex-wrap gap-2">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickPrompt(prompt)}
            disabled={isLoading}
            className="px-3 py-1 text-xs bg-primary-accent/10 dark:bg-dark-accent/20 text-primary-accent dark:text-dark-accent rounded-full hover:bg-primary-accent hover:text-white dark:hover:bg-dark-accent dark:hover:text-midnight transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="p-2 border-t border-ink/10">
        <div className="flex items-center">
          <textarea
            ref={textareaRef} // Assign ref to textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              isLoading ? "AI가 답변 중입니다..." : "AI에게 메시지 보내기..."
            }
            className="flex-1 bg-transparent focus:outline-none px-2 text-ink placeholder:text-ink/50 resize-none" // Removed overflow-y-auto
            disabled={isLoading}
          ></textarea>
          <button
            onClick={handleSendMessage}
            className="p-2 rounded-full text-primary-accent hover:bg-primary-accent/10 disabled:opacity-50"
            disabled={isLoading}
          >
            <PaperAirplaneIcon />
          </button>
        </div>
      </div>
    </div>
  );
};
