"use client";

import { useState } from "react";

export default function LocationButton({ onLocationFound, t }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGetLocation = async () => {
    setLoading(true);
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocode to get city name
          const response = await fetch(
            `/api/geocode?lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          if (response.ok && data.results && data.results.length > 0) {
            const city = data.results[0];
            onLocationFound({
              lat: latitude,
              lon: longitude,
              city: city
            });
          } else {
            // If reverse geocoding fails, still pass coordinates
            onLocationFound({
              lat: latitude,
              lon: longitude,
              city: null
            });
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          setError(t.errors.locationError);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError(t.errors.locationDenied);
            break;
          case error.POSITION_UNAVAILABLE:
            setError(t.errors.locationError);
            break;
          case error.TIMEOUT:
            setError("Location request timed out");
            break;
          default:
            setError(t.errors.locationError);
        }
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="mb-4">
      <button
        onClick={handleGetLocation}
        disabled={loading}
        aria-label={t.useMyLocation}
        className="
          w-full py-3 px-4
          bg-green-600 hover:bg-green-700
          text-white font-medium
          rounded-lg
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
          shadow-sm hover:shadow-md
          flex items-center justify-center gap-2
        "
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Getting location...</span>
          </>
        ) : (
          t.useMyLocation
        )}
      </button>

      {error && (
        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <p className="text-xs text-red-500 dark:text-red-500 mt-1">
            💡 Try searching for a city manually instead
          </p>
        </div>
      )}
    </div>
  );
}