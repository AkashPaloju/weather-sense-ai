// app/lib/i18n.js
// Internationalization translations - Extended for category support

export const translations = {
  en: {
    appName: "WeatherSense AI",
    language: "Language",
    category: "Category",
    startVoice: "🎙️ Start Voice Input",
    listening: "Listening...",
    transcript: "Transcript (editable)",
    searchCity: "Search city...",
    useMyLocation: "📍 Use My Location",
    fetchWeather: "Fetch Weather",
    sendToAI: "Generate Suggestions",
    clear: "Clear",
    
    // Category labels
    categories: {
      fashion: "Fashion",
      agri: "Agriculture",
      travel: "Travel",
      music: "Music"
    },
    
    weatherCard: {
      title: "Current Weather",
      temp: "Temperature",
      condition: "Condition",
      wind: "Wind",
      noData: "No weather data"
    },
    
    aiSuggestions: {
      title: "AI Suggestions",
      noResults: "No suggestions yet",
      loading: "Generating suggestions...",
      error: "Failed to generate suggestions",
      copy: "Copy",
      download: "Download",
      speak: "Speak",
      regenerate: "Regenerate",
      history: "History",
      metadata: "Metadata",
      fullResponse: "Full Response"
    },
    
    errors: {
      speechNotSupported: "Speech recognition not supported in this browser. Please use Chrome or Edge.",
      locationDenied: "Location access denied. Please search for a city manually.",
      locationError: "Could not get your location. Please try searching manually.",
      weatherFailed: "Could not fetch weather data. You can still get AI suggestions.",
      noResults: "No cities found",
      networkError: "Network error. Please check your connection and try again.",
      translationFailed: "Translation unavailable — showing English version"
    },
    
    placeholders: {
      transcript: "Your voice input will appear here...",
      city: "Tokyo, London, New York..."
    },
    
    helpers: {
      selectCategory: "Select a category to get weather-based suggestions",
      categorySelected: "Category selected",
      readyToGenerate: "Ready to generate suggestions",
      tryAgain: "Try Again"
    }
  },
  
  ja: {
    appName: "ウェザーセンスAI",
    language: "言語",
    category: "カテゴリー",
    startVoice: "🎙️ 音声入力を開始",
    listening: "聞いています...",
    transcript: "テキスト（編集可能）",
    searchCity: "都市を検索...",
    useMyLocation: "📍 現在地を使用",
    fetchWeather: "天気を取得",
    sendToAI: "提案を生成",
    clear: "クリア",
    
    // Category labels
    categories: {
      fashion: "ファッション",
      agri: "農業",
      travel: "旅行",
      music: "音楽"
    },
    
    weatherCard: {
      title: "現在の天気",
      temp: "気温",
      condition: "状態",
      wind: "風速",
      noData: "天気データなし"
    },
    
    aiSuggestions: {
      title: "AI提案",
      noResults: "まだ提案がありません",
      loading: "提案を生成中...",
      error: "提案の生成に失敗しました",
      copy: "コピー",
      download: "ダウンロード",
      speak: "読み上げ",
      regenerate: "再生成",
      history: "履歴",
      metadata: "メタデータ",
      fullResponse: "完全なレスポンス"
    },
    
    errors: {
      speechNotSupported: "このブラウザは音声認識をサポートしていません。ChromeまたはEdgeをご使用ください。",
      locationDenied: "位置情報へのアクセスが拒否されました。手動で都市を検索してください。",
      locationError: "位置情報を取得できませんでした。手動で検索してください。",
      weatherFailed: "天気データを取得できませんでした。AI提案は引き続き利用できます。",
      noResults: "都市が見つかりません",
      networkError: "ネットワークエラーです。接続を確認して、もう一度お試しください。",
      translationFailed: "翻訳が利用できません — 英語版を表示しています"
    },
    
    placeholders: {
      transcript: "音声入力がここに表示されます...",
      city: "東京、大阪、京都..."
    },
    
    helpers: {
      selectCategory: "カテゴリを選択して、天気に基づいた提案を取得します",
      categorySelected: "カテゴリが選択されました",
      readyToGenerate: "提案を生成する準備ができました",
      tryAgain: "再試行"
    }
  }
};

export const getTranslation = (lang) => {
  return translations[lang] || translations.en;
};

// Helper to get category label in current language
export const getCategoryLabel = (categoryId, lang) => {
  const t = getTranslation(lang);
  return t.categories[categoryId] || categoryId;
};