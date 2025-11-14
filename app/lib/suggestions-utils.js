// app/lib/suggestions-utils.js
/**
 * Utility functions for handling AI suggestions edge cases
 */

/**
 * Normalize bullets array - ensure exactly 3 bullets
 * @param {Array} bullets - Original bullets array
 * @param {string} language - Current language (en/ja)
 * @returns {Array} Normalized array with exactly 3 bullets
 */
export function normalizeBullets(bullets, language = 'en') {
  const fallbackText = language === 'ja' 
    ? '必要に応じて調整してください。' 
    : 'Adjust as needed.';
  
  let normalized = Array.isArray(bullets) ? [...bullets] : [];
  
  // Truncate if more than 3
  if (normalized.length > 3) {
    normalized = normalized.slice(0, 3);
  }
  
  // Pad if less than 3
  while (normalized.length < 3) {
    normalized.push(fallbackText);
  }
  
  return normalized;
}

/**
 * Validate suggestion object structure
 * @param {Object} suggestion - Suggestion object to validate
 * @returns {boolean} Whether the suggestion is valid
 */
export function isValidSuggestion(suggestion) {
  if (!suggestion || typeof suggestion !== 'object') {
    return false;
  }
  
  // Must have at least title or bullets
  const hasTitle = typeof suggestion.title === 'string' && suggestion.title.trim().length > 0;
  const hasBullets = Array.isArray(suggestion.bullets) && suggestion.bullets.length > 0;
  
  return hasTitle || hasBullets;
}

/**
 * Extract JSON from text that might have markdown code fences
 * @param {string} text - Text that might contain JSON
 * @returns {Object|null} Parsed JSON or null
 */
export function extractJSON(text) {
  if (!text) return null;
  
  try {
    // Try direct parse first
    return JSON.parse(text);
  } catch (e) {
    // Try to extract from code fences
    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e2) {
        return null;
      }
    }
    
    // Try to find JSON object in text
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch (e3) {
        return null;
      }
    }
    
    return null;
  }
}

/**
 * Create fallback suggestion when API fails
 * @param {string} category - Selected category
 * @param {Object} weather - Weather data
 * @param {string} language - Current language
 * @returns {Object} Fallback suggestion object
 */
export function createFallbackSuggestion(category, weather, language = 'en') {
  const categoryLabels = {
    en: {
      fashion: 'Fashion',
      agri: 'Agriculture',
      travel: 'Travel',
      music: 'Music'
    },
    ja: {
      fashion: 'ファッション',
      agri: '農業',
      travel: '旅行',
      music: '音楽'
    }
  };
  
  const categoryLabel = categoryLabels[language][category] || category;
  const cityName = weather?.city || (language === 'ja' ? '不明な場所' : 'Unknown Location');
  
  if (language === 'ja') {
    return {
      title: `${cityName}の${categoryLabel}提案`,
      bullets: [
        '天気に適した活動を選択してください',
        '地域の条件を考慮してください',
        '必要に応じて計画を調整してください'
      ],
      summary: 'AIサービスは現在利用できません。後でもう一度お試しください。',
      reason: 'これは一時的なフォールバックメッセージです。'
    };
  }
  
  return {
    title: `${categoryLabel} Suggestions for ${cityName}`,
    bullets: [
      'Choose activities appropriate for the weather',
      'Consider local conditions and forecasts',
      'Adjust your plans as needed'
    ],
    summary: 'AI service is currently unavailable. Please try again later.',
    reason: 'This is a temporary fallback message.'
  };
}

/**
 * Rate limit check for regenerate button
 * @param {number} lastRequestTime - Timestamp of last request
 * @param {number} cooldownMs - Cooldown period in milliseconds
 * @returns {Object} { allowed: boolean, remainingMs: number }
 */
export function checkRateLimit(lastRequestTime, cooldownMs = 3000) {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  
  if (elapsed < cooldownMs) {
    return {
      allowed: false,
      remainingMs: cooldownMs - elapsed
    };
  }
  
  return {
    allowed: true,
    remainingMs: 0
  };
}

/**
 * Format weather object for API request
 * Ensures all required fields are present
 * @param {Object} weather - Raw weather object
 * @returns {Object} Formatted weather object
 */
export function formatWeatherForAPI(weather) {
  if (!weather) {
    return {
      city: 'Unknown',
      temp: null,
      condition: 'unknown',
      wind: null
    };
  }
  
  return {
    city: weather.city || 'Unknown',
    temp: typeof weather.temp === 'number' ? weather.temp : null,
    condition: weather.condition || 'unknown',
    wind: typeof weather.wind === 'number' ? weather.wind : null
  };
}