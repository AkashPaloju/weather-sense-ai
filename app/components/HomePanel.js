// app/components/HomePanel.js
"use client";

import ChatPanel from "./ChatPanel";
import logoImage from "/public/logo.png";
import Image from "next/image";

export default function HomePanel({
  weather,
  chatOpen,
  chatHistory,
  chatLoading,
  currentCategory,
  language,
  t,
  onStarterClick,
  onSendMessage
}) {
  
  // State 1: No weather - show welcome screen
  if (!weather) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <Image src={logoImage} alt="WeatherSense AI Logo" className="mx-auto w-24 h-24 md:w-48 md:h-48" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {language === "ja" ? "WeatherSense AIへようこそ" : "Welcome to WeatherSense AI"}
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {language === "ja" 
              ? "始めるには、左側で都市を検索してください。天気データに基づいたパーソナライズされた提案を取得できます。"
              : "To get started, search for a city on the left. Get personalized suggestions based on weather data."
            }
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>
              {language === "ja" 
                ? "検索またはユーザーロケーションを使用" 
                : "Search or use your location"
              }
            </span>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Weather loaded but chat not open - show starter buttons
  if (!chatOpen) {
    return (
      <div className="flex items-center justify-center h-full p-4 md:p-8">
        <div className="text-center max-w-2xl w-full">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
              {language === "ja" 
                ? `${weather.city}の天気` 
                : `Weather in ${weather.city}`
              }
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
              {language === "ja" 
                ? "以下のプロンプトから始めましょう"
                : "Get started with these prompts"
              }
            </p>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-500 mt-2">
              {language === "ja"
                ? `現在の天気: ${weather.temp !== null ? Math.round(weather.temp) + "°C" : "N/A"}, ${weather.condition}`
                : `Current weather: ${weather.temp !== null ? Math.round(weather.temp) + "°C" : "N/A"}, ${weather.condition}`
              }
            </p>
          </div>

          {/* Starter Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
            {/* Outfit Button */}
            <button
              onClick={() => onStarterClick("outfit")}
              disabled={chatLoading}
              className="group relative p-4 md:p-6 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 hover:from-pink-100 hover:to-purple-100 dark:hover:from-pink-900/30 dark:hover:to-purple-900/30 border-2 border-pink-200 dark:border-pink-800 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 active:scale-95"
              aria-label={language === "ja" ? "服装の提案" : "Outfit suggestions"}
            >
              <div className="text-3xl md:text-4xl mb-2 md:mb-3">👗</div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">
                {language === "ja" ? "服装" : "Outfit"}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                {language === "ja" 
                  ? "天気に合った服装の提案"
                  : "What should I wear today?"
                }
              </p>
              <div className="absolute top-2 md:top-3 right-2 md:right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-pink-600 dark:text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </button>

            {/* Travel Button */}
            <button
              onClick={() => onStarterClick("travel")}
              disabled={chatLoading}
              className="group relative p-4 md:p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 active:scale-95"
              aria-label={language === "ja" ? "旅行の提案" : "Travel suggestions"}
            >
              <div className="text-3xl md:text-4xl mb-2 md:mb-3">✈️</div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">
                {language === "ja" ? "旅行" : "Travel"}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                {language === "ja" 
                  ? "おすすめの外出や旅行先"
                  : "Where should I go today?"
                }
              </p>
              <div className="absolute top-2 md:top-3 right-2 md:right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </button>

            {/* Music Button */}
            <button
              onClick={() => onStarterClick("music")}
              disabled={chatLoading}
              className="group relative p-4 md:p-6 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 hover:from-green-100 hover:to-teal-100 dark:hover:from-green-900/30 dark:hover:to-teal-900/30 border-2 border-green-200 dark:border-green-800 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 active:scale-95"
              aria-label={language === "ja" ? "音楽の提案" : "Music suggestions"}
            >
              <div className="text-3xl md:text-4xl mb-2 md:mb-3">🎵</div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">
                {language === "ja" ? "音楽" : "Music"}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                {language === "ja" 
                  ? "天気に合った音楽の雰囲気"
                  : "What should I listen to?"
                }
              </p>
              <div className="absolute top-2 md:top-3 right-2 md:right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </button>

            {/* Agriculture Button */}
            <button
              onClick={() => onStarterClick("agriculture")}
              disabled={chatLoading}
              className="group relative p-4 md:p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 hover:from-yellow-100 hover:to-orange-100 dark:hover:from-yellow-900/30 dark:hover:to-orange-900/30 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 active:scale-95"
              aria-label={language === "ja" ? "農業のアドバイス" : "Agriculture advice"}
            >
              <div className="text-3xl md:text-4xl mb-2 md:mb-3">🌾</div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">
                {language === "ja" ? "農業" : "Agriculture"}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                {language === "ja" 
                  ? "作物や農作業のアドバイス"
                  : "What should I do on the farm?"
                }
              </p>
              <div className="absolute top-2 md:top-3 right-2 md:right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </button>
          </div>

          {/* Loading indicator */}
          {chatLoading && (
            <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400 py-4">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">
                {language === "ja" ? "準備中..." : "Preparing your conversation..."}
              </span>
            </div>
          )}

          {/* Helper text */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {language === "ja"
                ? "クリックすると、天気データに基づいたAI会話が始まります"
                : "Click a button to start an AI conversation based on current weather"
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Chat is open - render ChatPanel
  return (
    <ChatPanel
      chatHistory={chatHistory}
      onSendMessage={onSendMessage}
      language={language}
      t={t}
      weather={weather}
      category={currentCategory}
      loading={chatLoading}
    />
  );
}
