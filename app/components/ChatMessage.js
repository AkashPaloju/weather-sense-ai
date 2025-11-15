// app/components/ChatMessage.js
"use client";

/**
 * ChatMessage - Renders a single chat message bubble
 * Displays either EN or JP text based on language toggle
 */
export default function ChatMessage({ message, language }) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const isSystem = message.role === "system";

  // Determine which text to display based on language
  const displayText = language === "ja" ? message.text_jp : message.text_en;

  // System messages (if any) - centered, gray
  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400 max-w-md text-center">
          {displayText}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
        }`}>
          {isUser ? '👤' : '🤖'}
        </div>

        {/* Message bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Role label */}
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-1">
            {isUser ? (language === "ja" ? "あなた" : "You") : "AI"}
          </div>

          {/* Message content */}
          <div className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'
          }`}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {displayText || (language === "ja" ? "メッセージがありません" : "No message")}
            </p>
          </div>

          {/* Timestamp (optional - can be added later) */}
          {message.timestamp && (
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 px-1">
              {new Date(message.timestamp).toLocaleTimeString(language === "ja" ? "ja-JP" : "en-US", {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
