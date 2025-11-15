"use client";

import { useState, useEffect, useRef } from "react";

export default function CitySearch({ onSelectCity, t }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const debounceTimer = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const isSelectingRef = useRef(false); // Use ref instead of state!

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    // CRITICAL: Skip if we just selected something
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }

    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      setError("");
      
      try {
        const response = await fetch(`/api/geocode?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (response.ok) {
          setSuggestions(data.results || []);
          setShowDropdown(true);
          setSelectedIndex(-1);
        } else {
          setError(data.error || t.errors.noResults);
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Geocoding error:", err);
        setError(t.errors.noResults);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, t]);

  const handleSelectCity = (city) => {
    // Step 1: Set the ref flag FIRST (synchronous)
    isSelectingRef.current = true;
    
    // Step 2: Clear debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    
    // Step 3: Update query
    setQuery(city.display);
    
    // Step 4: Close dropdown and clear suggestions
    setShowDropdown(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    
    // Step 5: Notify parent
    onSelectCity(city);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectCity(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Highlight matching substring
  const highlightMatch = (text, query) => {
    if (!query) return text;
    
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;
    
    return (
      <>
        {text.substring(0, index)}
        <span className="bg-yellow-200 dark:bg-yellow-700 font-semibold">
          {text.substring(index, index + query.length)}
        </span>
        {text.substring(index + query.length)}
      </>
    );
  };

  return (
    <div className="relative mb-4" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            // Only show dropdown if we have suggestions and not just selected
            if (suggestions.length > 0 && !isSelectingRef.current) {
              setShowDropdown(true);
            }
          }}
          placeholder={t.placeholders.city}
          aria-label={t.searchCity}
          className="
            w-full px-4 py-3 pr-10
            border-2 border-gray-300 dark:border-gray-600
            rounded-lg
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
          "
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="
          absolute z-10 w-full mt-1
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-lg shadow-xl
          max-h-64 overflow-y-auto
        ">
          {suggestions.slice(0, 7).map((city, index) => (
            <button
              key={`${city.lat}-${city.lon}`}
              onClick={() => handleSelectCity(city)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`
                w-full px-4 py-3 text-left
                transition-colors duration-150
                ${index === selectedIndex 
                  ? 'bg-blue-50 dark:bg-blue-900/30' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }
                ${index > 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''}
              `}
            >
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {highlightMatch(city.display, query)}
              </div>
              {city.timezone && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {city.timezone}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* No results message - only show if actively searching */}
      {showDropdown && query.length >= 2 && suggestions.length === 0 && !loading && !isSelectingRef.current && (
        <div className="
          absolute z-10 w-full mt-1
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-lg shadow-xl
          px-4 py-3
          text-gray-500 dark:text-gray-400
          text-sm
        ">
          {error || t.errors.noResults}
        </div>
      )}
    </div>
  );
}
