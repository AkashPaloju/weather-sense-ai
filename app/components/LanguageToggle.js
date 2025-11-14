// app/components/LanguageToggle.js
"use client";

/**
 * LanguageToggle - EN/JP language selector
 * Toggles between English and Japanese UI
 */
export default function LanguageToggle({ language, onChange }) {
  const languages = [
    { code: "en", label: "EN", fullLabel: "English" },
    { code: "ja", label: "日本語", fullLabel: "Japanese" }
  ];

  return (
    <div 
      className="inline-flex rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 p-1"
      role="radiogroup"
      aria-label="Language selection"
    >
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onChange(lang.code)}
          role="radio"
          aria-checked={language === lang.code}
          aria-label={`Switch to ${lang.fullLabel}`}
          className={`
            px-4 py-2 rounded-md font-medium text-sm
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${language === lang.code
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }
          `}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
