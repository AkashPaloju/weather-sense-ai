// Utility functions for the AI Weather Assistant

/**
 * Format date for display
 * @param {number} timestamp - Unix timestamp
 * @param {string} locale - Locale string (en-US, ja-JP)
 * @returns {string} Formatted date string
 */
export function formatDate(timestamp, locale = 'en-US') {
  return new Date(timestamp).toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if speech synthesis is supported
 * @returns {boolean}
 */
export function isSpeechSynthesisSupported() {
  return 'speechSynthesis' in window;
}

/**
 * Check if speech recognition is supported
 * @returns {boolean}
 */
export function isSpeechRecognitionSupported() {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

/**
 * Check if geolocation is supported
 * @returns {boolean}
 */
export function isGeolocationSupported() {
  return 'geolocation' in navigator;
}

/**
 * Parse AI response that might have markdown code fences
 * @param {string} text - Raw text response
 * @returns {Object} Parsed JSON object
 */
export function parseAIResponse(text) {
  try {
    // Remove markdown code fences
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    // Return a fallback structure
    return {
      title: 'AI Response',
      bullets: [text],
      summary: '',
      raw: text,
    };
  }
}

/**
 * Safely copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        textArea.remove();
        return true;
      } catch (error) {
        console.error('Fallback copy failed:', error);
        textArea.remove();
        return false;
      }
    }
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    return false;
  }
}

/**
 * Download text as a file
 * @param {string} text - Text content
 * @param {string} filename - Filename for download
 */
export function downloadTextFile(text, filename = 'ai-suggestion.txt') {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validate environment variables
 * @returns {Object} Validation results
 */
export function validateEnvVars() {
  const required = ['OPENWEATHER_KEY', 'OPENROUTER_API_KEY'];
  const missing = [];
  
  required.forEach(key => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Format weather condition for display
 * @param {string} condition - Raw condition string
 * @returns {string} Formatted condition
 */
export function formatWeatherCondition(condition) {
  if (!condition) return 'Unknown';
  return condition
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Calculate "feels like" temperature with wind chill
 * @param {number} temp - Temperature in Celsius
 * @param {number} windSpeed - Wind speed in m/s
 * @returns {number} Feels like temperature
 */
export function calculateFeelsLike(temp, windSpeed) {
  // Simple wind chill calculation
  const windKmh = windSpeed * 3.6;
  if (temp < 10 && windKmh > 4.8) {
    const feelsLike = 13.12 + 0.6215 * temp - 11.37 * Math.pow(windKmh, 0.16) + 0.3965 * temp * Math.pow(windKmh, 0.16);
    return Math.round(feelsLike * 10) / 10;
  }
  return temp;
}

/**
 * Get time of day greeting
 * @param {string} language - Language code (en, ja)
 * @returns {string} Greeting message
 */
export function getGreeting(language = 'en') {
  const hour = new Date().getHours();
  
  if (language === 'ja') {
    if (hour < 12) return 'おはようございます';
    if (hour < 18) return 'こんにちは';
    return 'こんばんは';
  }
  
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Rate limit checker
 * @param {string} key - Unique key for the rate limit
 * @param {number} limit - Number of attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} Whether action is allowed
 */
export function checkRateLimit(key, limit = 5, windowMs = 60000) {
  if (typeof window === 'undefined') return true;
  
  const now = Date.now();
  const storageKey = `rateLimit_${key}`;
  const stored = window.sessionStorage.getItem(storageKey);
  
  let attempts = stored ? JSON.parse(stored) : [];
  
  // Filter out old attempts
  attempts = attempts.filter(timestamp => now - timestamp < windowMs);
  
  if (attempts.length >= limit) {
    return false;
  }
  
  attempts.push(now);
  window.sessionStorage.setItem(storageKey, JSON.stringify(attempts));
  
  return true;
}