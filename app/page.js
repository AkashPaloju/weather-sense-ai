// app/page.js
"use client";

import { useState } from "react";
import VoiceInput from "./components/VoiceInput";
import CitySearch from "./components/CitySearch";
import LocationButton from "./components/LocationButton";
import WeatherCard from "./components/WeatherCard";
import CategoryTabs from "./components/CategoryTabs";
import LanguageToggle from "./components/LanguageToggle";
import SuggestionsPanel from "./components/SuggestionsPanel";
import { getTranslation } from "./lib/i18n";

export default function Home() {
  // UI Language (for labels, not AI response)
  const [language, setLanguage] = useState("en");
  
  // Category selection
  const [category, setCategory] = useState("travel");
  
  // User input
  const [transcript, setTranscript] = useState("");
  
  // Location & Weather
  const [selectedCity, setSelectedCity] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  
  // AI Suggestions state
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [apiError, setApiError] = useState("");
  
  const t = getTranslation(language);

  // Fetch weather by city or coordinates
  const fetchWeather = async (params) => {
    setWeatherError("");
    setWeatherLoading(true);
    console.log("Fetching weather with params:", params);
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
        // Override the city name with user's selection if available
        if (params.selectedCity) {
          data.city = params.selectedCity.display;
          data.selectedCityObject = params.selectedCity; // Store full object
        }
        setWeather(data);
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

  const handleFetchWeather = () => {
    if (selectedCity) {
      fetchWeather({ lat: selectedCity.lat, lon: selectedCity.lon, selectedCity: selectedCity });
    }
  };

  // Generate AI suggestions
  const generateSuggestions = async () => {
    setLoading(true);
    setApiError("");

    try {
      // Get weather if not already fetched
      let weatherData = weather;
      if (!weatherData && selectedCity) {
        weatherData = await fetchWeather({ 
          lat: selectedCity.lat, 
          lon: selectedCity.lon 
        });
      }

      // Fallback weather if none available
      if (!weatherData) {
        weatherData = {
          city: selectedCity?.display || "Unknown Location",
          temp: null,
          condition: "unknown",
          wind: null
        };
      }

      // Build request payload
      const payload = {
        category: category,
        user_text: transcript || (language === "ja" ? "今日のおすすめは？" : "What do you recommend today?"),
        weather: weatherData
      };

      console.log("Sending to API:", payload);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setSuggestions(data);
        setApiError("");
      } else {
        setApiError(data.error || "Failed to generate suggestions");
        setSuggestions(null);
      }
    } catch (error) {
      console.error("AI generation error:", error);
      setApiError(error.message || "Network error. Please try again.");
      setSuggestions(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTranscript("");
    setSelectedCity(null);
    setWeather(null);
    setWeatherError("");
    setSuggestions(null);
    setApiError("");
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t.appName}
              </h1>
              <LanguageToggle language={language} onChange={setLanguage} />
            </div>

            {/* STEP 1: City Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <span className="inline-flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold">1</span>
                  {t.searchCity}
                </span>
              </label>
              <CitySearch onSelectCity={handleCitySelect} t={t} />
            </div>

            {/* Location Button */}
            <LocationButton onLocationFound={handleLocationFound} t={t} />

            {/* Weather Card */}
            <WeatherCard weather={weather} t={t} weatherLoading={weatherLoading} />

            {weatherError && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ {weatherError}
              </div>
            )}

            {/* Fetch Weather Button */}
            <button
              onClick={handleFetchWeather}
              disabled={!selectedCity}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              🔄 {t.fetchWeather}
            </button>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

            {/* STEP 2: Category Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <span className="inline-flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold">2</span>
                  {t.category}
                </span>
              </label>
              <CategoryTabs 
                selected={category} 
                onChange={setCategory}
                language={language}
              />
            </div>

            {/* STEP 3: Voice Input & Transcript */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <span className="inline-flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-bold">3</span>
                  {language === "ja" ? "音声入力または質問" : "Voice Input or Question"}
                </span>
              </label>
              <VoiceInput 
                onTranscript={setTranscript} 
                language={language}
                t={t}
              />
            </div>

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

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={generateSuggestions}
                disabled={loading || !transcript.trim()}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {loading ? t.aiSuggestions.loading : "✨ " + t.sendToAI}
              </button>

              <button
                onClick={handleClear}
                className="w-full py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-all duration-200"
              >
                🗑️ {t.clear}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - AI Suggestions (65%) */}
        <div className="bg-gray-50 dark:bg-gray-900 overflow-y-auto">
          <div className="p-8">
            <SuggestionsPanel
              suggestions={suggestions}
              loading={loading}
              error={apiError}
              language={language}
              t={t}
              onRetry={generateSuggestions}
            />
          </div>
        </div>
      </div>

      {/* Mobile: Stacked layout */}
      <div className="lg:hidden">
        {/* Controls Section (Top) */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="p-4 space-y-4 max-h-[40vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {t.appName}
              </h1>
              <LanguageToggle language={language} onChange={setLanguage} />
            </div>

            {/* Category Selection */}
            <CategoryTabs 
              selected={category} 
              onChange={setCategory}
              language={language}
            />

            {/* Category Selection */}
            <CategoryTabs 
              selected={category} 
              onChange={setCategory}
              language={language}
            />

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
                onClick={generateSuggestions}
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

        {/* Suggestions Section (Bottom) */}
        <div className="p-4 min-h-[60vh]">
          <SuggestionsPanel
            suggestions={suggestions}
            loading={loading}
            error={apiError}
            language={language}
            t={t}
            onRetry={generateSuggestions}
          />
        </div>
      </div>
    </div>
  );
}
