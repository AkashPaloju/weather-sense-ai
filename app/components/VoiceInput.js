"use client";

import { useState, useEffect } from "react";

export default function VoiceInput({ onTranscript, language, t }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
    }
  }, []);

  const startRecognition = () => {
    setError("");
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(t.errors.speechNotSupported);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "ja" ? "ja-JP" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      onTranscript(transcript);
      setListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setError(`Error: ${event.error}`);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start recognition:", err);
      setError(err.message);
      setListening(false);
    }
  };

  if (!supported) {
    return (
      <div className="mb-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm text-yellow-800 dark:text-yellow-200">
          {t.errors.speechNotSupported}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <button
        onClick={startRecognition}
        disabled={listening}
        aria-label={listening ? t.listening : t.startVoice}
        className={`
          w-full py-4 px-6 rounded-xl font-medium text-lg
          transition-all duration-200 transform
          ${listening 
            ? 'bg-red-500 hover:bg-red-600 text-white scale-105 animate-pulse' 
            : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800
          shadow-lg hover:shadow-xl
        `}
      >
        {listening ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-3 h-3 bg-white rounded-full animate-bounce"></span>
            {t.listening}
          </span>
        ) : (
          t.startVoice
        )}
      </button>
      
      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}