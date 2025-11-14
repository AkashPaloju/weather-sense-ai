"use client";

import { useState } from "react";
import SuggestionCard from "./SuggestionCard";

export default function AISuggestions({ 
  currentSuggestion, 
  loading, 
  history = [],
  t,
  language,
  onRegenerate 
}) {
  const [showHistory, setShowHistory] = useState(false);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-3">
            <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              {t.aiSuggestions.loading}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!currentSuggestion && history.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
        <div className="mb-4">
          <svg className="w-20 h-20 mx-auto text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {t.aiSuggestions.noResults}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          {language === "ja" 
            ? "音声入力または都市を選択して、AIの提案を取得してください。"
            : "Use voice input or select a city to get AI suggestions."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Suggestion */}
      {currentSuggestion && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t.aiSuggestions.title}
          </h2>
          <SuggestionCard
            suggestion={currentSuggestion}
            t={t}
            language={language}
            onRegenerate={onRegenerate}
            showRaw={true}
          />
        </div>
      )}

      {/* History Section */}
      {history.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <span>{showHistory ? "▼" : "▶"}</span>
            <span>{t.aiSuggestions.history} ({history.length})</span>
          </button>

          {showHistory && (
            <div className="space-y-4">
              {history.map((item, index) => (
                <div 
                  key={index}
                  className="opacity-75 hover:opacity-100 transition-opacity"
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {new Date(item.timestamp).toLocaleString(language === "ja" ? "ja-JP" : "en-US")}
                  </div>
                  <SuggestionCard
                    suggestion={item.suggestion}
                    t={t}
                    language={language}
                    showRaw={false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}