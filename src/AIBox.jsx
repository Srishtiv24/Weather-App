import { useState, useEffect, useRef, useCallback } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PRESET_QUESTIONS = [
  { label: "🧥 What should I wear today?", key: "wear" },
  { label: "🌂 Will it rain today?", key: "rain" },
  { label: "🏃 Best outdoor activities?", key: "activities" },
  { label: "⚠️ Any weather warnings?", key: "warnings" },
];

function buildSystemPrompt(info, forecast) {
  const forecastSummary = forecast
    .slice(0, 5)
    .map((d) => {
      const name = DAYS[d.date.getDay()];
      const mid = d.descriptions[Math.floor(d.descriptions.length / 2)];
      return `${name}: ${Math.round(d.hi)}°/${Math.round(d.lo)}° ${mid}`;
    })
    .join(", ");
  return `You are a friendly weather assistant. Current weather context:
City: ${info.city}
Temperature: ${Math.round(info.temp)}°C (feels like ${Math.round(info.feelsLike)}°C)
Condition: ${info.weather}
Humidity: ${info.humidity}%
Wind: ${(info.wind || 0).toFixed(1)} m/s
High/Low: ${Math.round(info.tempMax)}°/${Math.round(info.tempMin)}°
5-day forecast: ${forecastSummary || "not available"}
Answer the user's question based on this weather data. Be concise, friendly, and practical. Use bullet points where helpful. Keep response under 150 words.`;
}

function buildUserPrompt(questionKey, customText, info) {
  const prompts = {
    wear: `What specific clothing items should I wear today given ${Math.round(info.temp)}°C and ${info.weather} conditions?`,
    rain: `Based on the current weather (${info.weather}, humidity ${info.humidity}%), is it likely to rain today? Should I carry an umbrella?`,
    activities: `What are the best outdoor activities I can do today given the weather in ${info.city}?`,
    warnings: `Are there any weather warnings or precautions I should be aware of for today in ${info.city}?`,
  };
  return customText || prompts[questionKey] || customText;
}

function formatAIText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/^#{1,3}\s+(.+)$/gm, "<strong>$1</strong>")
    .replace(
      /^[-•]\s+(.+)$/gm,
      '<div style="padding:2px 0 2px 10px;border-left:2px solid rgba(255,255,255,0.3);margin:3px 0">$1</div>'
    )
    .replace(/\n\n/g, "<br/>")
    .replace(/\n/g, "<br/>");
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 0" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "rgba(255,255,255,0.7)",
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-5px);opacity:1} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
}

// Typewriter that animates plain text char by char then renders formatted HTML at the end
function TypewriterMessage({ text }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Reset and start fresh every time text is set (new message)
    setVisibleCount(0);
    let count = 0;
    intervalRef.current = setInterval(() => {
      count += 1;
      setVisibleCount(count);
      if (count >= text.length) {
        clearInterval(intervalRef.current);
      }
    }, 45);
    return () => clearInterval(intervalRef.current);
  }, [text]); // only runs when text prop is set (once per message)

  const isTyping = visibleCount < text.length;
  const shown = text.slice(0, visibleCount);

  return (
    <span>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
      <span dangerouslySetInnerHTML={{ __html: formatAIText(shown) }} />
      {isTyping && (
        <span style={{
          display: "inline-block", width: 2, height: "1em",
          background: "rgba(255,255,255,0.85)", marginLeft: 2,
          verticalAlign: "text-bottom",
          animation: "blink 0.6s step-end infinite",
        }} />
      )}
    </span>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 10 }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, marginRight: 8, flexShrink: 0, marginTop: 2,
        }}>🌤</div>
      )}
      <div style={{
        maxWidth: "78%", padding: "10px 14px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: isUser ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)",
        border: "1px solid rgba(255,255,255,0.15)",
        fontSize: 13, lineHeight: 1.6, color: "#fff",
      }}>
        {msg.loading
          ? <TypingDots />
          : isUser
            ? <span>{msg.content}</span>
            : <TypewriterMessage text={msg.content} />
        }
      </div>
    </div>
  );
}

export default function AIBox({ info, forecast }) {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: `Hi! I'm your weather assistant for ${info.city}. It's currently ${Math.round(info.temp)}°C with ${info.weather}. Ask me anything or tap a quick question below!`,
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [usedPresets, setUsedPresets] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    setMessages([{
      role: "assistant",
      content: `Hi! I'm your weather assistant for ${info.city}. It's currently ${Math.round(info.temp)}°C with ${info.weather}. Ask me anything or tap a quick question below!`,
    }]);
    setUsedPresets([]);
  }, [info.city]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function askQuestion(questionKey = null, customText = null) {
    if (loading) return;
    const userText = customText || PRESET_QUESTIONS.find((q) => q.key === questionKey)?.label || "";
    const userPrompt = buildUserPrompt(questionKey, customText, info);
    const systemPrompt = buildSystemPrompt(info, forecast);
    if (questionKey) setUsedPresets((prev) => [...prev, questionKey]);

    // Add user msg + loading assistant msg
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userText },
      { role: "assistant", content: "", loading: true },
    ]);
    setLoading(true);
    setInput("");

    try {
      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      // Collect entire streamed response into a buffer first
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const raw = decoder.decode(value, { stream: true });
        const lines = raw.split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          const jsonStr = line.replace("data: ", "").trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const chunk = parsed.choices?.[0]?.delta?.content;
            if (chunk) fullText += chunk;
          } catch { /* skip */ }
        }
      }

      // Now set the complete text — TypewriterMessage will animate it from scratch
      setMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1
            ? { role: "assistant", content: fullText, loading: false }
            : m
        )
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1
            ? { role: "assistant", content: `Error: ${err.message}`, loading: false }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    askQuestion(null, text);
  }

  const glass = {
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: 20, padding: 20, marginBottom: 14, color: "#fff",
  };

  const availablePresets = PRESET_QUESTIONS.filter((q) => !usedPresets.includes(q.key));

  return (
    <div style={glass}>
      <div style={{ fontSize: 12, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 14 }}>
        Weather Assistant
      </div>

      <div style={{
        background: "rgba(0,0,0,0.2)", borderRadius: 16,
        padding: "14px 12px", maxHeight: 320, overflowY: "auto",
        marginBottom: 12, scrollbarWidth: "thin",
        scrollbarColor: "rgba(255,255,255,0.2) transparent",
      }}>
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      {availablePresets.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
          {availablePresets.map((q) => (
            <button key={q.key} onClick={() => askQuestion(q.key)} disabled={loading}
              style={{
                padding: "7px 12px", borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.12)", color: "#fff",
                fontSize: 12, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
                opacity: loading ? 0.5 : 1, transition: "background 0.2s", whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => !loading && (e.target.style.background = "rgba(255,255,255,0.22)")}
              onMouseLeave={(e) => (e.target.style.background = "rgba(255,255,255,0.12)")}
            >{q.label}</button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask anything about the weather..."
          style={{
            flex: 1, padding: "10px 14px", borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.25)",
            background: "rgba(255,255,255,0.12)", color: "#fff",
            fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none",
          }}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}
          style={{
            padding: "10px 16px", borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.25)",
            background: input.trim() ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)",
            color: "#fff", cursor: input.trim() && !loading ? "pointer" : "not-allowed",
            fontSize: 16, transition: "background 0.2s",
          }}
        >↑</button>
      </div>
    </div>
  );
}
