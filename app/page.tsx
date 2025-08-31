"use client";

import { useState } from "react";

export default function TranslatorPage() {
  const [inputText, setInputText] = useState("");
  const [targetLang, setTargetLang] = useState("French");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    setLoading(true);
    setTranslatedText("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Translate this into ${targetLang}: ${inputText}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Server error");
      }

      // ✅ Try to stream if available
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let result = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          result += decoder.decode(value, { stream: true });
          setTranslatedText(result);
        }
      } else {
        // ✅ Fallback: normal JSON
        const data = await response.json();
        if (data?.output?.text) {
          setTranslatedText(data.output.text);
        } else {
          setTranslatedText("⚠️ No translation received.");
        }
      }
    } catch (err: any) {
      console.error("Translation error:", err);
      setTranslatedText("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          🌍 AI Language Translator
        </h1>

        {/* Input Text */}
        <textarea
          className="w-full p-4 border rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          rows={4}
          placeholder="Enter text to translate..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        {/* Language Selector */}
        <select
          className="w-full p-3 border rounded-xl mb-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
        >
          <option>French</option>
          <option>Spanish</option>
          <option>German</option>
          <option>Japanese</option>
          <option>Hindi</option>
        </select>

        {/* Button */}
        <button
          onClick={handleTranslate}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "Translating..." : "Translate"}
        </button>

        {/* Output */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Translated Text:
          </h2>
          <div className="p-4 bg-gray-100 rounded-xl min-h-[100px] whitespace-pre-wrap">
            {translatedText || "⚡ Your translation will appear here..."}
          </div>
        </div>
      </div>
    </main>
  );
}
