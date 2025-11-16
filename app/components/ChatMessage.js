// app/components/ChatMessage.js
"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function ChatMessage({ message, language, t }) {
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  
  // Determine which text to display based on language
  const displayText = language === "ja" && message.text_jp 
    ? message.text_jp 
    : message.text_en;

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString(language === "ja" ? "ja-JP" : "en-US", {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Copy message text (strip markdown for clipboard)
  const handleCopy = async () => {
    try {
      // Strip markdown for clipboard
      const plainText = displayText
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        .replace(/`([^`]+)`/g, '$1');
      
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  // Text-to-speech
  const handleSpeak = () => {
    if (!window.speechSynthesis) {
      alert(language === "ja" 
        ? "音声合成はサポートされていません" 
        : "Speech synthesis not supported"
      );
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    // Strip markdown for TTS
    const plainText = displayText
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/`([^`]+)`/g, '$1');

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = language === "ja" ? "ja-JP" : "en-US";
    utterance.rate = 0.9;
    
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
        }`}>
          {isUser ? '👤' : '🤖'}
        </div>

        {/* Message bubble and metadata */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Message content with markdown support */}
          <div className={`px-4 py-3 rounded-2xl shadow-sm ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-sm'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-sm'
          }`}>
            <ReactMarkdown
              components={{
                // Paragraph
                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                
                // Bold text
                strong: ({node, ...props}) => (
                  <strong className={`font-semibold ${isUser ? 'text-white' : 'text-gray-900 dark:text-white'}`} {...props} />
                ),
                
                // Italic text
                em: ({node, ...props}) => (
                  <em className="italic" {...props} />
                ),
                
                // Inline code
                code: ({node, inline, ...props}) => 
                  inline 
                    ? <code className={`px-1 py-0.5 rounded text-xs font-mono ${
                        isUser 
                          ? 'bg-blue-700 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`} {...props} />
                    : <code className={`block p-2 rounded text-xs font-mono my-2 ${
                        isUser 
                          ? 'bg-blue-700 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`} {...props} />,
                
                // Lists
                ul: ({node, ...props}) => (
                  <ul className="list-disc ml-4 my-2 space-y-1" {...props} />
                ),
                ol: ({node, ...props}) => (
                  <ol className="list-decimal ml-4 my-2 space-y-1" {...props} />
                ),
                li: ({node, ...props}) => (
                  <li className="text-sm" {...props} />
                ),
                
                // Links (open in new tab)
                a: ({node, ...props}) => (
                  <a 
                    className={`underline hover:no-underline ${
                      isUser ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  />
                ),
                
                // Blockquotes
                blockquote: ({node, ...props}) => (
                  <blockquote 
                    className={`border-l-4 pl-3 my-2 italic ${
                      isUser 
                        ? 'border-blue-400 text-blue-100' 
                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                    }`}
                    {...props}
                  />
                ),
              }}
            >
              {displayText || (language === "ja" ? "メッセージがありません" : "No message")}
            </ReactMarkdown>
          </div>

          {/* Metadata and actions */}
          <div className={`flex items-center gap-2 mt-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Timestamp */}
            {message.timestamp && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {formatTime(message.timestamp)}
              </span>
            )}

            {/* Action buttons (only for assistant messages) */}
            {!isUser && (
              <div className="flex items-center gap-1">
                {/* Copy button */}
                <button
                  onClick={handleCopy}
                  aria-label={t?.aiSuggestions?.copy || "Copy"}
                  title={t?.aiSuggestions?.copy || "Copy"}
                  className={`p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors ${
                    copied ? 'bg-green-100 dark:bg-green-900/30' : ''
                  }`}
                >
                  {copied ? (
                    <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>

                {/* Speak button */}
                <button
                  onClick={handleSpeak}
                  aria-label={speaking ? "Stop" : (t?.aiSuggestions?.speak || "Speak")}
                  title={speaking ? "Stop" : (t?.aiSuggestions?.speak || "Speak")}
                  className={`p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors ${
                    speaking ? "bg-blue-100 dark:bg-blue-900" : ""
                  }`}
                >
                  <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
