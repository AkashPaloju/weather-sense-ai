// app/components/CategoryTabs.js
"use client";

/**
 * CategoryTabs - 4 specialized category selection
 * Categories: Fashion, Agriculture, Travel, Music
 */
export default function CategoryTabs({ selected, onChange, language }) {
  const categories = [
    { 
      id: "fashion", 
      icon: "👗",
      label: { en: "Fashion", ja: "ファッション" }
    },
    { 
      id: "agri", 
      icon: "🌾",
      label: { en: "Agriculture", ja: "農業" }
    },
    { 
      id: "travel", 
      icon: "✈️",
      label: { en: "Travel", ja: "旅行" }
    },
    { 
      id: "music", 
      icon: "🎵",
      label: { en: "Music", ja: "音楽" }
    }
  ];

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        {language === "ja" ? "カテゴリー" : "Category"}
      </label>
      
      <div className="grid grid-cols-2 gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`
              relative py-3 px-4 rounded-lg font-medium text-sm
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${selected === cat.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md scale-105'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm'
              }
            `}
            aria-pressed={selected === cat.id}
            aria-label={`Select ${cat.label.en} category`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl" role="img" aria-label={cat.label.en}>
                {cat.icon}
              </span>
              <span>{cat.label[language]}</span>
            </div>
            
            {/* Selected indicator */}
            {selected === cat.id && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
      
      {/* Helper text */}
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {language === "ja" 
          ? "カテゴリを選択して、天気に基づいた提案を取得します"
          : "Select a category to get weather-based suggestions"
        }
      </p>
    </div>
  );
}