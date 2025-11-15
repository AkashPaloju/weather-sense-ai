// app/components/ChatPanel.js
"use client";

import { useState, useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

/**
 * ChatPanel - Main chat interface
 * Displays conversation history and handles new messages
 */
export default function ChatPanel({
  initialHistory = [],
  category,
  weather,
  language,
  t,
  onClose
}) {
  const [chatHistory, setChatHistory] = useState(initialHistory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (message) => {
    if (!message.trim() || loading) return;

    setError("");

    // Add user message to history (store raw message)
    const userMessage = {
      role: "user",
      text_en: message, // Will be translated by backend if JP
      text_jp: message, // Store raw input as JP fallback
      timestamp: Date.now()
    };

    setChatHistory(prev => [...prev, userMessage]);

    setLoading(true);

    try {
      // Build history for API (ENGLISH ONLY as per strict contract)
      const apiHistory = chatHistory.map(msg => ({
        role: msg.role,
        text: msg.text_en // STRICT: Always send English text
      }));

      // Call /api/chat
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: apiHistory,
          message: message, // Raw user input (EN or JP)
          context: {
            category: category || "general",
            weather: weather || {}
          }
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Add assistant reply to history (store both EN and JP)
        const assistantMessage = {
          role: "assistant",
          text_en: data.reply_en || "No response",
          text_jp: data.reply_jp || data.reply_en || "応答なし",
          timestamp: Date.now(),
          _meta: data._meta
        };

        console.log(data);

        // If user message was JP, update its text_en with any translation hint
        // (Optional: backend could return user_message_en in future)
        setChatHistory(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
            if (updated[lastIndex].role === "user") {
                updated[lastIndex] = {
                    ...updated[lastIndex],
                    text_en: data.message_en || updated[lastIndex].text_en
                };
            }
            return [...updated, assistantMessage];
        });

      } else {
        setError(data.error || "Failed to get response");
      }
    } catch (err) {
      console.error("Chat API error:", err);
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm(language === "ja" ? "チャット履歴をクリアしますか？" : "Clear chat history?")) {
      // Keep only initial messages (first 2)
      setChatHistory(initialHistory);
    }
  };

  const handleExportChat = () => {
    const text = chatHistory.map(msg => {
      const displayText = language === "ja" ? msg.text_jp : msg.text_en;
      const role = msg.role === "user" ? (language === "ja" ? "あなた" : "You") : "AI";
      return `${role}: ${displayText}`;
    }).join("\n\n");

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              aria-label="Back to suggestions"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === "ja" ? "💬 チャットモード" : "💬 Chat Mode"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === "ja" 
                  ? `${category ? t?.categories?.[category] || category : "一般"} • ${weather?.city || "場所不明"}`
                  : `${category || "General"} • ${weather?.city || "Unknown location"}`
                }
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportChat}
              aria-label="Export chat"
              title={language === "ja" ? "エクスポート" : "Export"}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>

            <button
              onClick={handleClearChat}
              aria-label="Clear chat"
              title={language === "ja" ? "クリア" : "Clear"}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-1"
      >
        {chatHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {language === "ja" ? "会話を開始" : "Start a conversation"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {language === "ja" 
                  ? "メッセージを入力してチャットを開始してください"
                  : "Type a message to start chatting"
                }
              </p>
            </div>
          </div>
        ) : (
          <>
            {chatHistory.map((msg, index) => (
              <ChatMessage
                key={index}
                message={msg}
                language={language}
              />
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                    🤖
                  </div>
                  <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
                ⚠️ {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0">
        <ChatInput
          onSend={handleSendMessage}
          language={language}
          t={t}
          disabled={loading}
        />
      </div>
    </div>
  );
}
