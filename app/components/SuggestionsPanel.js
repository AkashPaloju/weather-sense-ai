// app/components/SuggestionsPanel.js
"use client";

import { useState } from "react";
import ResultCard from "./ResultCard";

/**
 * SuggestionsPanel - Displays AI suggestions in selected language (EN or JP)
 * Shows both results with language toggle, metadata, and error states
 */
export default function SuggestionsPanel({ 
  suggestions, 
  loading, 
  error,
  language,
  t,
  onRetry 
}) {
  const [showMeta, setShowMeta] = useState(false);

  // Loading State
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
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

  // Error State
  if (error && !suggestions) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-8 shadow-lg">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-red-500 dark:text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">
            {t.aiSuggestions.error}
          </h3>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              🔄 {language === "ja" ? "再試行" : "Try Again"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Empty State
  if (!suggestions) {
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
            ? "カテゴリーを選択し、音声入力または都市を選択して、AIの提案を取得してください。"
            : "Select a category, use voice input or select a city to get AI suggestions."}
        </p>
      </div>
    );
  }

  // Success State - Show results
  const { en, jp, _meta } = suggestions;
  
  // Determine which result to show based on language
  const currentResult = language === "ja" ? jp : en;
  const alternateResult = language === "ja" ? en : jp;

  // Check if translation failed
  const translationFailed = _meta && _meta.translationSuccess === false;

  return (
    <div className="space-y-6">
      {/* Main Result Card */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.aiSuggestions.title}
          </h2>
          
          {/* Language Badge */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
              {language === "ja" ? "日本語" : "English"}
            </span>
          </div>
        </div>

        {/* Translation Warning */}
        {translationFailed && language === "ja" && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-2">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>翻訳が利用できません</strong> — 英語版を表示しています
            </div>
          </div>
        )}

        {/* Result Card */}
        <ResultCard 
          result={translationFailed && language === "ja" ? en : currentResult}
          language={language}
          t={t}
        />
      </div>

      {/* Metadata Section (Developer Toggle) */}
      {_meta && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={() => setShowMeta(!showMeta)}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <span>{showMeta ? "▼" : "▶"}</span>
            <span>{language === "ja" ? "メタデータ" : "Metadata"}</span>
          </button>

          {showMeta && (
            <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Model:</span>
                  <span className="ml-2 font-mono text-gray-900 dark:text-white">
                    {_meta.model || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Translation:</span>
                  <span className={`ml-2 font-medium ${
                    _meta.translationSuccess 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {_meta.translationSuccess ? "✓ Success" : "✗ Failed"}
                  </span>
                </div>
              </div>

              {_meta.tokens && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <div>Prompt Tokens: {_meta.tokens.promptTokenCount || 0}</div>
                    <div>Response Tokens: {_meta.tokens.candidatesTokenCount || 0}</div>
                    <div>Total: {_meta.tokens.totalTokenCount || 0}</div>
                  </div>
                </div>
              )}

              {/* Raw JSON Toggle */}
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  {language === "ja" ? "完全なレスポンス" : "Full Response"}
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                  {JSON.stringify({ en, jp, _meta }, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}

      {/* Model Attribution Footer */}
      {_meta && _meta.model && (
        <div className="text-center">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            {language === "ja" ? "生成元: " : "Powered by "}
            <span className="font-mono">{_meta.model}</span>
          </p>
        </div>
      )}
    </div>
  );
}
