// app/page.js - V3 WeatherSense AI
"use client";

import { useState } from "react";
import CitySearch from "./components/CitySearch";
import LocationButton from "./components/LocationButton";
import WeatherCard from "./components/WeatherCard";
import LanguageToggle from "./components/LanguageToggle";
import HomePanel from "./components/HomePanel";
import { getTranslation } from "./lib/i18n";
import Image from "next/image";
import logoImage from "/public/logo.png";

export default function Home() {
  // UI Language (for labels, not AI response)
  const [language, setLanguage] = useState("en");
  
  // Location & Weather
  const [selectedCity, setSelectedCity] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  
  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentCategory, setCurrentCategory] = useState("general");
  const [chatLoading, setChatLoading] = useState(false);
  
  const t = getTranslation(language);

  // Fetch weather by city or coordinates
  const fetchWeather = async (params) => {
    setWeatherError("");
    setWeatherLoading(true);
    
    try {
      let url;
      if (params.lat && params.lon) {
        url = `/api/weather?lat=${params.lat}&lon=${params.lon}`;
      } else if (typeof params === "string") {
        url = `/api/weather?city=${encodeURIComponent(params)}`;
      } else {
        throw new Error("Invalid city or coordinates");
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        // Override city name with user's selection if available
        if (params.selectedCity) {
          data.city = params.selectedCity.display;
          data.selectedCityObject = params.selectedCity;
        }
        setWeather(data);
        
        // Reset chat when weather changes
        setChatOpen(false);
        setChatHistory([]);
        
        setWeatherLoading(false);
        return data;
      } else {
        setWeatherError(t.errors.weatherFailed);
        setWeatherLoading(false);
        return null;
      }
    } catch (error) {
      console.error("Weather fetch error:", error);
      setWeatherError(t.errors.weatherFailed);
      setWeatherLoading(false);
      return null;
    }
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    fetchWeather({ lat: city.lat, lon: city.lon, selectedCity: city });
  };

  const handleLocationFound = (location) => {
    if (location.city) {
      setSelectedCity(location.city);
    }
    fetchWeather({ lat: location.lat, lon: location.lon });
  };

  const handleRefreshWeather = () => {
    if (selectedCity) {
      fetchWeather({ 
        lat: selectedCity.lat, 
        lon: selectedCity.lon, 
        selectedCity: selectedCity 
      });
    }
  };

  // Helper: Format structured result to assistant text
  const formatStructuredToAssistantText = (structured) => {
    if (!structured) return "";
    
    const parts = [];
    
    if (structured.title) {
      parts.push(`${structured.title}`);
    }
    
    if (Array.isArray(structured.bullets) && structured.bullets.length > 0) {
      const bulletText = structured.bullets
        .map((b, i) => `${i + 1}. ${b}`)
        .join('\n');
      parts.push(bulletText);
    }
    
    if (structured.summary) {
      parts.push(structured.summary);
    }
    
    return parts.join('\n\n');
  };

  // Starter button click handler
  const handleStarterClick = async (kind) => {
    if (!weather) return;
    
    // Map starter button to category and user text
    const starterMap = {
      outfit: {
        category: "fashion",
        text_en: `Suggest an outfit for the weather in ${weather.city}`,
        text_ja: `${weather.city}の天気に合った服装を提案してください`
      },
      travel: {
        category: "travel",
        text_en: `Suggest travel or outing ideas for the weather in ${weather.city}`,
        text_ja: `${weather.city}の天気に合った旅行やお出かけのアイデアを提案してください`
      },
      music: {
        category: "music",
        text_en: `Recommend a music vibe or playlist for the weather in ${weather.city}`,
        text_ja: `${weather.city}の天気に合った音楽の雰囲気やプレイリストを推薦してください`
      },
      agriculture: {
        category: "agri",
        text_en: `Give crop or farming advice for the weather in ${weather.city}`,
        text_ja: `${weather.city}の天気に基づいた作物や農作業のアドバイスをください`
      }
    };

    const starter = starterMap[kind];
    if (!starter) return;

    setChatLoading(true);
    setCurrentCategory(starter.category);

    try {
      // Call /api/generate
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_text: language === "ja" ? starter.text_ja : starter.text_en,
          weather: weather,
          category: starter.category
        })
      });

      const data = await response.json();

      if (response.ok && data.en) {
        // Format assistant messages from structured data
        const assistantTextEN = formatStructuredToAssistantText(data.en);
        const assistantTextJP = data.jp ? formatStructuredToAssistantText(data.jp) : assistantTextEN;

        // Seed chat history
        const now = Date.now();
        const initialHistory = [
          {
            id: `user_${now}`,
            role: "user",
            text_en: starter.text_en,
            text_jp: starter.text_ja,
            timestamp: now
          },
          {
            id: `assistant_${now}`,
            role: "assistant",
            text_en: assistantTextEN,
            text_jp: assistantTextJP,
            timestamp: now + 1
          }
        ];

        setChatHistory(initialHistory);
        setChatOpen(true);
      } else {
        // Fallback: show error in chat
        const errorMessage = data.error || "Failed to generate suggestions";
        const now = Date.now();
        
        setChatHistory([
          {
            id: `user_${now}`,
            role: "user",
            text_en: starter.text_en,
            text_jp: starter.text_ja,
            timestamp: now
          },
          {
            id: `assistant_${now}`,
            role: "assistant",
            text_en: `Sorry, I encountered an error: ${errorMessage}`,
            text_jp: `申し訳ありませんが、エラーが発生しました: ${errorMessage}`,
            timestamp: now + 1
          }
        ]);
        setChatOpen(true);
      }
    } catch (error) {
      console.error("Starter click error:", error);
      
      // Show error in chat
      const now = Date.now();
      setChatHistory([
        {
          id: `user_${now}`,
          role: "user",
          text_en: starter.text_en,
          text_jp: starter.text_ja,
          timestamp: now
        },
        {
          id: `assistant_${now}`,
          role: "assistant",
          text_en: `Network error: ${error.message}. Please try again.`,
          text_jp: `ネットワークエラー: ${error.message}。もう一度お試しください。`,
          timestamp: now + 1
        }
      ]);
      setChatOpen(true);
    } finally {
      setChatLoading(false);
    }
  };

  // Send chat message handler
  const handleSendMessage = async (message) => {
    if (!message.trim() || chatLoading) return;

    setChatLoading(true);

    // Immediately add user message to chat (will update text_en after API response)
    const now = Date.now();
    const tempUserId = `user_${now}`;
    
    const tempUserMessage = {
      id: tempUserId,
      role: "user",
      text_en: message, // Will be updated if translation occurs
      text_jp: message, // Store raw input
      timestamp: now
    };

    setChatHistory(prev => [...prev, tempUserMessage]);

    try {
      // Build history for API (only send English text)
      const historyForAPI = chatHistory.map(msg => ({
        role: msg.role,
        text: msg.text_en
      }));

      // Call /api/chat
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: historyForAPI,
          message: message,
          context: {
            category: currentCategory,
            weather: weather
          }
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Update user message with canonical English text from backend
        const userMessageEN = data.message_en || message;
        
        // Create assistant message
        const assistantMessage = {
          id: `assistant_${Date.now()}`,
          role: "assistant",
          text_en: data.reply_en || "I apologize, but I couldn't generate a response.",
          text_jp: data.reply_jp || data.reply_en || "申し訳ありませんが、応答を生成できませんでした。",
          timestamp: Date.now()
        };

        // Update chat history: update user message and add assistant message
        setChatHistory(prev => {
          const updated = prev.map(msg => 
            msg.id === tempUserId 
              ? { ...msg, text_en: userMessageEN }
              : msg
          );
          return [...updated, assistantMessage];
        });
      } else {
        // Error response - add error message to chat
        const errorMessage = {
          id: `assistant_${Date.now()}`,
          role: "assistant",
          text_en: `Error: ${data.error || "Failed to get response"}`,
          text_jp: `エラー: ${data.error || "応答の取得に失敗しました"}`,
          timestamp: Date.now()
        };

        setChatHistory(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Chat message error:", error);
      
      // Network error - add error message to chat
      const errorMessage = {
        id: `assistant_${Date.now()}`,
        role: "assistant",
        text_en: `Network error: ${error.message}. Please try again.`,
        text_jp: `ネットワークエラー: ${error.message}。もう一度お試しください。`,
        timestamp: Date.now()
      };

      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop: Side by side layout */}
      <div className="hidden lg:grid lg:grid-cols-layout h-screen">
        {/* Left Panel - Controls (35%) */}
        <div className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header with Language Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Image src={logoImage} alt="WeatherSense AI Logo" className="w-12 h-12" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t.appName}
                </h1>
              </div>
              <LanguageToggle language={language} onChange={setLanguage} />
            </div>

            {/* City Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t.searchCity}
              </label>
              <CitySearch onSelectCity={handleCitySelect} t={t} />
            </div>

            {/* Location Button */}
            <LocationButton onLocationFound={handleLocationFound} t={t} />

            {/* Weather Card */}
            <WeatherCard 
              weather={weather} 
              t={t} 
              weatherLoading={weatherLoading} 
            />

            {weatherError && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ {weatherError}
              </div>
            )}

            {/* Refresh Weather Button */}
            {weather && (
              <button
                onClick={handleRefreshWeather}
                disabled={weatherLoading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {weatherLoading ? "Refreshing..." : t.fetchWeather}
              </button>
            )}
          </div>
        </div>

        {/* Right Panel - Home/Chat (65%) */}
        <div className="bg-gray-50 dark:bg-gray-900 overflow-hidden">
          <HomePanel
            weather={weather}
            chatOpen={chatOpen}
            chatHistory={chatHistory}
            chatLoading={chatLoading}
            currentCategory={currentCategory}
            language={language}
            t={t}
            onStarterClick={handleStarterClick}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>

      {/* Mobile: Stacked layout */}
      <div className="lg:hidden">
        {/* Controls Section (Top) */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image src={logoImage} alt="WeatherSense AI Logo" className="w-10 h-10" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t.appName}
                </h1>
              </div>
              <LanguageToggle language={language} onChange={setLanguage} />
            </div>

            {/* City Search */}
            <CitySearch onSelectCity={handleCitySelect} t={t} />

            {/* Location Button */}
            <LocationButton onLocationFound={handleLocationFound} t={t} />

            {/* Compact Weather */}
            {weather && (
              <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-3 text-sm">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {weather.city}: {weather.temp !== null ? `${Math.round(weather.temp)}°C` : "N/A"}
                </div>
                <div className="text-gray-600 dark:text-gray-300 capitalize">
                  {weather.condition}
                </div>
              </div>
            )}

            {/* Refresh Button */}
            {weather && (
              <button
                onClick={handleRefreshWeather}
                disabled={weatherLoading}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            )}
          </div>
        </div>

        {/* Home/Chat Section (Bottom) */}
        <div className="min-h-[60vh]">
          <HomePanel
            weather={weather}
            chatOpen={chatOpen}
            chatHistory={chatHistory}
            chatLoading={chatLoading}
            currentCategory={currentCategory}
            language={language}
            t={t}
            onStarterClick={handleStarterClick}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
}
