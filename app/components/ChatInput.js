// app/components/ChatInput.js
"use client";

import { useState, useRef } from "react";

/**
 * ChatInput - Input box for chat messages
 * Supports text input, Enter to send, and optional voice input
 */
export default function ChatInput({ onSend, language, t, disabled = false }) {
  const [message, setMessage] = useState("");
  const [listening, setListening] = useState(false);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setMessage("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    // Enter without shift = send
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert(t?.errors?.speechNotSupported || "Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "ja" ? "ja-JP" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(prev => prev + (prev ? ' ' : '') + transcript);
      setListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="flex items-end gap-2">
        {/* Voice input button */}
        <button
          onClick={listening ? stopVoiceInput : startVoiceInput}
          disabled={disabled}
          aria-label={listening ? "Stop listening" : "Start voice input"}
          className={`flex-shrink-0 p-3 rounded-lg transition-all duration-200 ${
            listening
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={language === "ja" ? "メッセージを入力..." : "Type a message..."}
          disabled={disabled}
          rows={1}
          className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 overflow-y-auto disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minHeight: '44px' }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          aria-label="Send message"
          className="flex-shrink-0 p-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg transition-all duration-200 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>

      {/* Helper text */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        {language === "ja" ? "Enter で送信 • Shift+Enter で改行" : "Press Enter to send • Shift+Enter for new line"}
      </div>
    </div>
  );
}
