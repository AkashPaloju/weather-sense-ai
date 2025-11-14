// app/components/ResultCard.js
"use client";

import { useState } from "react";

/**
 * ResultCard - Displays a single AI suggestion result
 * Shows title, 3 bullets with icons, summary, and reason
 * Includes Copy, Download, and Speak (TTS) functionality
 */
export default function ResultCard({ result, language, t }) {
  const [speaking, setSpeaking] = useState(false);

  if (!result) {
    return null;
  }

  // Ensure we have exactly 3 bullets (pad or truncate)
  let bullets = Array.isArray(result.bullets) ? [...result.bullets] : [];
  if (bullets.length > 3) {
    bullets = bullets.slice(0, 3);
  }
  while (bullets.length < 3) {
    bullets.push(language === "ja" ? "必要に応じて調整してください。" : "Adjust as needed.");
  }

  const handleCopy = async () => {
    const text = `${result.title || ""}\n\n${
      bullets.map((b, i) => `${i + 1}. ${b}`).join("\n")
    }\n\n${result.summary || ""}\n\n${result.reason || ""}`;
    
    try {
      await navigator.clipboard.writeText(text);
      alert(language === "ja" ? "コピーしました！" : "Copied!");
    } catch (err) {
      console.error("Copy failed:", err);
      alert(language === "ja" ? "コピーに失敗しました" : "Copy failed");
    }
  };

  const handleDownload = () => {
    const text = `${result.title || ""}\n\n${
      bullets.map((b, i) => `${i + 1}. ${b}`).join("\n")
    }\n\n${result.summary || ""}\n\n${result.reason || ""}`;
    
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
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

    const text = `${result.title}. ${bullets.join(". ")}. ${result.summary || ""}`;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "ja" ? "ja-JP" : "en-US";
    utterance.rate = 0.9;
    
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  // Bullet icons (rotating set)
  const bulletIcons = ["💡", "⚡", "🎯"];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Header with action buttons */}
      <div className="flex items-start justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex-1 pr-4">
          {result.title || t.aiSuggestions.title}
        </h3>
        
        <div className="flex gap-2">
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

      {/* Bullets Section */}
      {bullets && bullets.length > 0 && (
        <div className="mb-6 space-y-3">
          {bullets.map((bullet, index) => (
            <div 
              key={index}
              className="flex gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-blue-100 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <span className="flex-shrink-0 text-2xl" role="img" aria-label={`Point ${index + 1}`}>
                {bulletIcons[index]}
              </span>
              <p className="flex-1 text-gray-800 dark:text-gray-200 leading-relaxed pt-1">
                {bullet}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Summary Section */}
      {result.summary && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                {language === "ja" ? "概要" : "Summary"}
              </h4>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                {result.summary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reason Section (if available) */}
      {result.reason && (
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded-r-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-1">
                {language === "ja" ? "理由" : "Why This Works"}
              </h4>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm">
                {result.reason}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
