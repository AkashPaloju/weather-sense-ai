// Internationalization translations
export const translations = {
  en: {
    appName: "AI Weather Assistant",
    language: "Language",
    startVoice: "🎙️ Start Voice Input",
    listening: "Listening...",
    transcript: "Transcript (editable)",
    searchCity: "Search city...",
    useMyLocation: "📍 Use My Location",
    fetchWeather: "Fetch Weather",
    sendToAI: "Send to AI",
    clear: "Clear",
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
      history: "History"
    },
    errors: {
      speechNotSupported: "Speech recognition not supported in this browser. Please use Chrome or Edge.",
      locationDenied: "Location access denied. Please search for a city manually.",
      locationError: "Could not get your location. Please try searching manually.",
      weatherFailed: "Could not fetch weather data. You can still get AI suggestions.",
      noResults: "No cities found"
    },
    placeholders: {
      transcript: "Your voice input will appear here...",
      city: "Tokyo, London, New York..."
    }
  },
  ja: {
    appName: "AI天気アシスタント",
    language: "言語",
    startVoice: "🎙️ 音声入力を開始",
    listening: "聞いています...",
    transcript: "テキスト（編集可能）",
    searchCity: "都市を検索...",
    useMyLocation: "📍 現在地を使用",
    fetchWeather: "天気を取得",
    sendToAI: "AIに送信",
    clear: "クリア",
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
      history: "履歴"
    },
    errors: {
      speechNotSupported: "このブラウザは音声認識をサポートしていません。ChromeまたはEdgeをご使用ください。",
      locationDenied: "位置情報へのアクセスが拒否されました。手動で都市を検索してください。",
      locationError: "位置情報を取得できませんでした。手動で検索してください。",
      weatherFailed: "天気データを取得できませんでした。AI提案は引き続き利用できます。",
      noResults: "都市が見つかりません"
    },
    placeholders: {
      transcript: "音声入力がここに表示されます...",
      city: "東京、大阪、京都..."
    }
  }
};

export const getTranslation = (lang) => {
  return translations[lang] || translations.en;
};