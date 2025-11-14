
# AI Weather Assistant 🌤️🤖

A modern, responsive Next.js application that combines real-time weather data with AI-powered suggestions. Features voice input in English and Japanese, city autocomplete with geocoding, and personalized travel recommendations based on weather conditions.

![AI Weather Assistant](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)

## ✨ Features

### 🎙️ Voice Input

* **Multi-language support** : English and Japanese speech recognition
* **Real-time transcription** : Editable transcript area
* **Browser compatibility check** : Graceful fallback for unsupported browsers

### 🌍 Location & Weather

* **City autocomplete** : Smart search with up to 7 suggestions
* **Geolocation support** : One-click "Use My Location" with proper permission handling
* **Weather icons** : Beautiful SVG icons mapped to OpenWeather conditions
* **Real-time weather data** : Temperature, conditions, wind speed

### 🤖 AI-Powered Suggestions

* **Context-aware recommendations** : Based on weather and user input
* **Multi-language responses** : English and Japanese AI outputs
* **Interactive features** :
* 📋 Copy to clipboard
* 💾 Download as text file
* 🔊 Text-to-speech (TTS)
* 🔄 Regenerate suggestions
* **History tracking** : Keep track of previous suggestions

### 🎨 Modern UI/UX

* **Responsive design** :
* Desktop: Side-by-side layout (35% controls / 65% suggestions)
* Mobile: Stacked layout optimized for touch
* **Dark mode support** : Automatic theme switching
* **Accessibility** : ARIA labels, keyboard navigation, focus states
* **Loading states** : Skeleton screens and smooth transitions

## 🚀 Quick Start

### Prerequisites

* Node.js 18+ and npm/yarn
* OpenWeather API key ([Get one here](https://openweathermap.org/api))
* OpenRouter API key ([Get one here](https://openrouter.ai/))

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd ai-weather-assistant
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
OPENWEATHER_KEY=your_openweather_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openrouter/gpt-4o-mini
```

4. **Run the development server**

```bash
npm run dev
# or
yarn dev
```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000/)

## 🎬 Demo Script (60-90 seconds)

Follow this script to showcase all features:

### Step 1: Voice Input (15 seconds)

1. Select language (English or 日本語)
2. Click the microphone button 🎙️
3. Say: "What should I do today?" (EN) or "今日は何をすればいいですか？" (JP)
4. Watch the transcript appear

### Step 2: City Search (15 seconds)

1. Type "Tokyo" in the search box
2. See autocomplete suggestions with highlighted matches
3. Select "Tokyo, Tokyo, Japan"
4. Or click "📍 Use My Location" (grant permission if prompted)

### Step 3: Weather Fetch (10 seconds)

1. Click "Fetch Weather"
2. See weather card update with:
   * City name
   * Temperature
   * Weather condition with icon
   * Wind speed

### Step 4: AI Suggestions (20 seconds)

1. Click "Send to AI"
2. Watch loading animation
3. See AI-generated suggestions with:
   * Title
   * 3 bullet point recommendations
   * Summary paragraph

### Step 5: Interactive Features (20 seconds)

1. Click 🔊 **Speak** - Hear TTS read the suggestions
2. Click 📋 **Copy** - Copy to clipboard
3. Click 💾 **Download** - Download as text file
4. Click 🔄 **Regenerate** - Get new suggestions
5. Scroll down to see **History** of previous suggestions

### Step 6: Mobile Test (10 seconds)

1. Resize browser to mobile width
2. See responsive stacked layout
3. Test all features work on mobile

## 🏗️ Project Structure

```
ai-weather-assistant/
├── app/
│   ├── api/
│   │   ├── geocode/
│   │   │   └── route.js          # Geocoding API (Open-Meteo)
│   │   ├── weather/
│   │   │   └── route.js          # Weather API (OpenWeather)
│   │   └── generate/
│   │       └── route.js          # AI generation API (OpenRouter)
│   ├── components/
│   │   ├── __tests__/
│   │   │   ├── VoiceInput.test.js
│   │   │   └── CitySearch.test.js
│   │   ├── VoiceInput.js         # Voice recognition component
│   │   ├── CitySearch.js         # Autocomplete search
│   │   ├── LocationButton.js     # Geolocation button
│   │   ├── WeatherCard.js        # Weather display
│   │   ├── WeatherIcons.js       # SVG weather icons
│   │   ├── SuggestionCard.js     # AI suggestion card
│   │   └── AISuggestions.js      # Suggestions container
│   ├── lib/
│   │   └── i18n.js              # Internationalization
│   ├── layout.js                # Root layout
│   ├── page.js                  # Main page
│   └── globals.css              # Global styles
├── .env.example                 # Environment template
├── .env.local                   # Your API keys (gitignored)
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.js            # PostCSS configuration
├── jest.config.js               # Jest configuration
├── jest.setup.js                # Jest setup
├── package.json                 # Dependencies
└── README.md                    # This file
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Test Coverage

The project includes unit tests for:

* ✅ VoiceInput component
* ✅ CitySearch component with debouncing
* ✅ Keyboard navigation
* ✅ Error handling
* ✅ Accessibility features

## 🔧 API Endpoints

### GET `/api/geocode`

**Autocomplete search:**

```
GET /api/geocode?query=Tokyo
```

**Reverse geocoding:**

```
GET /api/geocode?lat=35.68&lon=139.76
```

**Response:**

```json
{
  "results": [
    {
      "name": "Tokyo",
      "country": "Japan",
      "admin1": "Tokyo",
      "lat": 35.6762,
      "lon": 139.6503,
      "timezone": "Asia/Tokyo",
      "display": "Tokyo, Tokyo, Japan"
    }
  ]
}
```

### GET `/api/weather`

**By city:**

```
GET /api/weather?city=Tokyo
```

**By coordinates:**

```
GET /api/weather?lat=35.68&lon=139.76
```

**Response:**

```json
{
  "city": "Tokyo",
  "temp": 22.5,
  "condition": "clear sky",
  "wind": 3.2,
  "icon": "01d"
}
```

### POST `/api/generate`

**Request:**

```json
{
  "user_text": "What should I do today?",
  "weather": {
    "city": "Tokyo",
    "temp": 22.5,
    "condition": "clear sky",
    "wind": 3.2
  },
  "theme": "travel"
}
```

**Response:**

```json
{
  "title": "Perfect Day for Tokyo Exploration",
  "bullets": [
    "Visit Senso-ji Temple in the pleasant weather",
    "Enjoy a picnic in Ueno Park",
    "Take a sunset stroll in Shibuya"
  ],
  "summary": "With clear skies and comfortable temperatures, it's an ideal day for outdoor activities in Tokyo."
}
```

## 🎨 Customization

### Adding New Languages

Edit `app/lib/i18n.js`:

```javascript
export const translations = {
  en: { /* English translations */ },
  ja: { /* Japanese translations */ },
  es: { /* Add Spanish */ },
  // Add more languages...
};
```

### Customizing Weather Icons

Edit `app/components/WeatherIcons.js` to modify or add new SVG icons:

```javascript
export const CustomIcon = ({ className }) => (
  <svg className={className}>
    {/* Your custom SVG */}
  </svg>
);
```

### Changing AI Model

Update `.env.local`:

```env
OPENROUTER_MODEL=openrouter/claude-3-sonnet
```

## 🌐 Browser Support

* ✅ Chrome/Edge (Recommended - full speech support)
* ✅ Firefox (Limited speech support)
* ✅ Safari (iOS 14.5+, limited speech support)
* ⚠️ Speech recognition requires HTTPS in production

## 📱 Responsive Breakpoints

* **Mobile** : < 1024px (stacked layout)
* **Desktop** : ≥ 1024px (side-by-side layout)

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com/)
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Other Platforms

The app works on any platform supporting Next.js:

* Netlify
* Railway
* Render
* AWS Amplify

## 🔐 Environment Variables

| Variable               | Required | Description                     |
| ---------------------- | -------- | ------------------------------- |
| `OPENWEATHER_KEY`    | ✅ Yes   | OpenWeather API key             |
| `OPENROUTER_API_KEY` | ✅ Yes   | OpenRouter API key              |
| `OPENROUTER_MODEL`   | ❌ No    | AI model (default: gpt-4o-mini) |

## 🐛 Troubleshooting

### Speech Recognition Not Working

* **Check browser** : Use Chrome/Edge for best support
* **Check HTTPS** : Speech API requires secure context
* **Check permissions** : Allow microphone access

### Weather Not Loading

* **Verify API key** : Check `.env.local` has valid `OPENWEATHER_KEY`
* **Check network** : Open browser DevTools → Network tab
* **Rate limits** : OpenWeather free tier has request limits

### AI Suggestions Failing

* **Verify API key** : Check `OPENROUTER_API_KEY` is valid
* **Check model** : Ensure `OPENROUTER_MODEL` is supported
* **Inspect response** : Look for error messages in browser console

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues or questions:

* Open an issue on GitHub
* Check existing issues for solutions

## 🙏 Acknowledgments

* [Next.js](https://nextjs.org/) - React framework
* [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
* [OpenWeather](https://openweathermap.org/) - Weather data
* [Open-Meteo](https://open-meteo.com/) - Geocoding
* [OpenRouter](https://openrouter.ai/) - AI API gateway

---

**Built with ❤️ using Next.js 15, React 18, and Tailwind CSS**
