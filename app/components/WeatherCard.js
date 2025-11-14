"use client";

import { getWeatherIcon } from "./WeatherIcons";

export default function WeatherCard({ weather, t }) {
  if (!weather) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          {t.weatherCard.title}
        </h3>
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          {t.weatherCard.noData}
        </div>
      </div>
    );
  }

  const WeatherIcon = getWeatherIcon(weather.icon);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-md p-5 mb-4 border border-blue-100 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        {t.weatherCard.title}
      </h3>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {weather.city}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
            {weather.condition}
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <WeatherIcon className="w-16 h-16" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {t.weatherCard.temp}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {weather.temp !== null ? `${Math.round(weather.temp)}°C` : "N/A"}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {t.weatherCard.wind}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {weather.wind !== null ? `${Math.round(weather.wind)} m/s` : "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
}