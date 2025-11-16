// app/components/ChatPanel.js
"use client";

import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

export default function ChatPanel({
  chatHistory,
  onSendMessage,
  language,
  t,
  weather,
  category,
  loading
}) {
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Category display name mapping
  const getCategoryLabel = (cat) => {
    const labels = {
      fashion: { en: "Fashion", ja: "ファッション" },
      travel: { en: "Travel", ja: "旅行" },
      music: { en: "Music", ja: "音楽" },
      agri: { en: "Agriculture", ja: "農業" },
      agriculture: { en: "Agriculture", ja: "農業" },
      general: { en: "General", ja: "一般" }
    };
    return labels[cat]?.[language] || cat;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {language === "ja" ? "AI アシスタント" : "AI Assistant"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getCategoryLabel(category)} • {weather?.city || "Unknown location"}
              </p>
            </div>
          </div>

          {/* Info badge */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
              {language === "ja" ? "日本語" : "English"}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
      >
        {chatHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {language === "ja" ? "会話を開始" : "Start chatting"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {language === "ja" 
                  ? "質問を入力してください。天気情報に基づいた提案をお手伝いします。"
                  : "Type a message below. I'll help you with suggestions based on the weather."
                }
              </p>
            </div>
          </div>
        ) : (
          <>
            {chatHistory.map((message, index) => (
              <ChatMessage
                key={message.id || index}
                message={message}
                language={language}
                t={t}
              />
            ))}

            {/* Loading indicator (typing...) */}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
                    🤖
                  </div>
                  <div className="px-4 py-3 bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0">
        <ChatInput
          onSend={onSendMessage}
          language={language}
          t={t}
          disabled={loading}
        />
      </div>
    </div>
  );
}
