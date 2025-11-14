"use client";

import { useState } from "react";

export default function SuggestionCard({ 
  suggestion, 
  t, 
  language,
  onRegenerate,
  showRaw = false 
}) {
  const [speaking, setSpeaking] = useState(false);
  const [showRawOutput, setShowRawOutput] = useState(false);

  const handleCopy = () => {
    const text = `${suggestion.title || ""}\n\n${
      suggestion.bullets?.map((b, i) => `${i + 1}. ${b}`).join("\n") || ""
    }\n\n${suggestion.summary || ""}`;
    
    navigator.clipboard.writeText(text).then(() => {
      alert(language === "ja" ? "コピーしました！" : "Copied!");
    });
  };

  const handleDownload = () => {
    const text = `${suggestion.title || ""}\n\n${
      suggestion.bullets?.map((b, i) => `${i + 1}. ${b}`).join("\n") || ""
    }\n\n${suggestion.summary || ""}`;
    
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-suggestion-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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

    const text = `${suggestion.title}. ${
      suggestion.bullets?.join(". ") || ""
    }. ${suggestion.summary || ""}`;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "ja" ? "ja-JP" : "en-US";
    utterance.rate = 0.9;
    
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  if (suggestion.error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
          {t.aiSuggestions.error}
        </h3>
        <p className="text-sm text-red-600 dark:text-red-400">
          {suggestion.error}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Header with actions */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex-1">
          {suggestion.title || t.aiSuggestions.title}
        </h3>
        
        <div className="flex gap-2 ml-4">
          <button
            onClick={handleCopy}
            aria-label={t.aiSuggestions.copy}
            title={t.aiSuggestions.copy}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          
          <button
            onClick={handleDownload}
            aria-label={t.aiSuggestions.download}
            title={t.aiSuggestions.download}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          
          <button
            onClick={handleSpeak}
            aria-label={speaking ? "Stop" : t.aiSuggestions.speak}
            title={speaking ? "Stop" : t.aiSuggestions.speak}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${
              speaking ? "bg-blue-100 dark:bg-blue-900" : ""
            }`}
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bullets */}
      {suggestion.bullets && suggestion.bullets.length > 0 && (
        <div className="mb-4 space-y-3">
          {suggestion.bullets.map((bullet, index) => (
            <div 
              key={index}
              className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
            >
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {index + 1}
              </span>
              <p className="flex-1 text-gray-800 dark:text-gray-200 leading-relaxed">
                {bullet}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {suggestion.summary && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg mb-4">
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
            {suggestion.summary}
          </p>
        </div>
      )}

      {/* Regenerate button */}
      {onRegenerate && (
        <button
          onClick={onRegenerate}
          className="w-full mt-4 py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        >
          🔄 {t.aiSuggestions.regenerate}
        </button>
      )}

      {/* Raw output toggle (for debugging) */}
      {showRaw && suggestion.raw && (
        <div className="mt-4">
          <button
            onClick={() => setShowRawOutput(!showRawOutput)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            {showRawOutput ? "▼" : "▶"} Raw Output
          </button>
          
          {showRawOutput && (
            <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-x-auto">
              {JSON.stringify(suggestion.raw, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}