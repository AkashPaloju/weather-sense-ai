"use client";

import { useState, useRef } from "react";
import VoiceInput from "./components/VoiceInput";
import CitySearch from "./components/CitySearch";
import LocationButton from "./components/LocationButton";
import WeatherCard from "./components/WeatherCard";
import AISuggestions from "./components/AISuggestions";
import { getTranslation } from "./lib/i18n";

export default function Home() {
  const [language, setLanguage] = useState("en");
  const [transcript, setTranscript] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);
  const [weather, setWeather] = useState(null);
  const [currentSuggestion, setCurrentSuggestion] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  const [lastRegenerateTime, setLastRegenerateTime] = useState(0);

  const t = getTranslation(language);

  // Fetch weather by city or coordinates
  const fetchWeather = async (cityOrCoords) => {
    setWeatherError("");
    try {
      let url;
      if (cityOrCoords.lat && cityOrCoords.lon) {
        url = `/api/weather?lat=${cityOrCoords.lat}&lon=${cityOrCoords.lon}`;
      } else if (typeof cityOrCoords === "string") {
        url = `/api/weather?city=${encodeURIComponent(cityOrCoords)}`;
      } else {
        throw new Error("Invalid city or coordinates");
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setWeather(data);
        return data;
      } else {
        setWeatherError(t.errors.weatherFailed);
        return null;
      }
    } catch (error) {
      console.error("Weather fetch error:", error);
      setWeatherError(t.errors.weatherFailed);
      return null;
    }
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    fetchWeather({ lat: city.lat, lon: city.lon });
  };

  const handleLocationFound = (location) => {
    if (location.city) {
      setSelectedCity(location.city);
    }
    fetchWeather({ lat: location.lat, lon: location.lon });
  };

  const handleFetchWeather = () => {
    if (selectedCity) {
      fetchWeather({ lat: selectedCity.lat, lon: selectedCity.lon });
    }
  };

  const generateAISuggestions = async (regenerate = false) => {
    // Rate limit regenerate to once per 3 seconds
    if (regenerate) {
      const now = Date.now();
      if (now - lastRegenerateTime < 3000) {
        alert(language === "ja" 
          ? "少し待ってから再試行してください" 
          : "Please wait a moment before regenerating"
        );
        return;
      }
      setLastRegenerateTime(now);
    }

    setLoading(true);

    try {
      // Get weather if not already fetched
      let weatherData = weather;
      if (!weatherData && selectedCity) {
        weatherData = await fetchWeather({ 
          lat: selectedCity.lat, 
          lon: selectedCity.lon 
        });
      }

      // If still no weather, use a fallback
      if (!weatherData) {
        weatherData = {
          city: selectedCity?.display || "Unknown",
          temp: null,
          condition: "unknown",
          wind: null
        };
      }

      const requestBody = {
        user_text: transcript || (language === "ja" ? "今日の天気は？" : "What's the weather today?"),
        weather: weatherData,
        theme: "travel"
      };

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        // Try to parse if it's raw text
        let suggestion;
        if (data.title && data.bullets) {
          suggestion = data;
        } else if (data.raw) {
          try {
            suggestion = JSON.parse(data.raw);
          } catch {
            suggestion = { 
              title: language === "ja" ? "AI応答" : "AI Response",
              bullets: [data.raw],
              summary: "",
              raw: data.raw 
            };
          }
        } else {
          suggestion = data;
        }

        setCurrentSuggestion(suggestion);
        
        // Add to history (only if not regenerating)
        if (!regenerate) {
          setHistory(prev => [{
            suggestion,
            timestamp: Date.now()
          }, ...prev].slice(0, 10)); // Keep last 10
        }
      } else {
        setCurrentSuggestion({ 
          error: data.error || t.aiSuggestions.error 
        });
      }
    } catch (error) {
      console.error("AI generation error:", error);
      setCurrentSuggestion({ 
        error: t.aiSuggestions.error + ": " + error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendToAI = () => {
    generateAISuggestions(false);
  };

  const handleRegenerate = () => {
    generateAISuggestions(true);
  };

  const handleClear = () => {
    setTranscript("");
    setSelectedCity(null);
    setWeather(null);
    setWeatherError("");
    setCurrentSuggestion(null);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "ja" : "en");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop: Side by side layout */}
      <div className="hidden lg:grid lg:grid-cols-layout h-screen">
        {/* Left Panel - Controls (35%) */}
        <div className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t.appName}
              </h1>
              <button
                onClick={toggleLanguage}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium text-sm transition-colors"
                aria-label={t.language}
              >
                {language === "en" ? "EN" : "日本語"}
              </button>
            </div>

            {/* Voice Input */}
            <VoiceInput 
              onTranscript={setTranscript} 
              language={language}
              t={t}
            />

            {/* Transcript */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t.transcript}
              </label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={4}
                placeholder={t.placeholders.transcript}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
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
            <WeatherCard weather={weather} t={t} />

            {weatherError && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ {weatherError}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleFetchWeather}
                disabled={!selectedCity}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {t.fetchWeather}
              </button>

              <button
                onClick={handleSendToAI}
                disabled={loading || !transcript.trim()}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {loading ? t.aiSuggestions.loading : t.sendToAI}
              </button>

              <button
                onClick={handleClear}
                className="w-full py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-all duration-200"
              >
                {t.clear}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - AI Suggestions (65%) */}
        <div className="bg-gray-50 dark:bg-gray-900 overflow-y-auto">
          <div className="p-8">
            <AISuggestions
              currentSuggestion={currentSuggestion}
              loading={loading}
              history={history}
              t={t}
              language={language}
              onRegenerate={handleRegenerate}
            />
          </div>
        </div>
      </div>

      {/* Mobile: Stacked layout */}
      <div className="lg:hidden">
        {/* Controls Section (Top 30-40%) */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="p-4 space-y-4 max-h-[40vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {t.appName}
              </h1>
              <button
                onClick={toggleLanguage}
                className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium text-sm transition-colors"
              >
                {language === "en" ? "EN" : "日本語"}
              </button>
            </div>

            {/* Voice Input */}
            <VoiceInput 
              onTranscript={setTranscript} 
              language={language}
              t={t}
            />

            {/* Transcript */}
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={2}
              placeholder={t.placeholders.transcript}
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm resize-none"
            />

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

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSendToAI}
                disabled={loading || !transcript.trim()}
                className="flex-1 py-2 px-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white text-sm font-medium rounded-lg"
              >
                {loading ? "..." : t.sendToAI}
              </button>
              <button
                onClick={handleClear}
                className="py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium rounded-lg"
              >
                {t.clear}
              </button>
            </div>
          </div>
        </div>

        {/* Suggestions Section (Bottom 60-70%) */}
        <div className="p-4 min-h-[60vh]">
          <AISuggestions
            currentSuggestion={currentSuggestion}
            loading={loading}
            history={history}
            t={t}
            language={language}
            onRegenerate={handleRegenerate}
          />
        </div>
      </div>
    </div>
  );
}