import { useState, useEffect } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatAIText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(
      /^#{1,3}\s+(.+)$/gm,
      '<div style="font-size:11px;opacity:0.65;text-transform:uppercase;letter-spacing:0.8px;margin:14px 0 5px">$1</div>'
    )
    .replace(
      /^[-•]\s+(.+)$/gm,
      '<div style="padding:3px 0 3px 12px;border-left:2px solid rgba(255,255,255,0.35);margin:3px 0">$1</div>'
    )
    .replace(/\n\n/g, "<br/>")
    .replace(/\n/g, " ");
}

export default function AIBox({ info, forecast }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!info?.temp) return;
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info.city, info.weather]);

  async function fetchSummary() {
    setLoading(true);
    setSummary("");

    const forecastSummary = forecast
      .slice(0, 5)
      .map((d) => {
        const name = DAYS[d.date.getDay()];
        const mid = d.descriptions[Math.floor(d.descriptions.length / 2)];
        return `${name}: ${Math.round(d.hi)}°/${Math.round(d.lo)}° ${mid}`;
      })
      .join(", ");

    const prompt = `Current weather in ${info.city}: ${Math.round(info.temp)}°C (feels like ${Math.round(info.feelsLike)}°C), ${info.weather}, humidity ${info.humidity}%, wind ${(info.wind || 0).toFixed(1)} m/s.
5-day outlook: ${forecastSummary || "not available"}.

Respond as a friendly weather assistant. Provide:
1. A 2-sentence weather summary
2. Clothing recommendations (list 3 specific items)
3. Activity suggestions (2-3 activities suitable for this weather)
4. Any weather warnings if relevant (UV, rain, extreme heat etc.)

Keep it conversational and practical. Format with clear sections using markdown headings and bullet points.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      setSummary(data.content[0].text);
    } catch {
      setSummary("Could not load AI summary. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const glass = {
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    color: "#fff",
  };

  const innerCard = {
    background: "rgba(0,0,0,0.2)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 16,
  };

  return (
    <div style={glass}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 12, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.8px" }}>
          AI Weather Assistant
        </div>
        {!loading && summary && (
          <button
            onClick={fetchSummary}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 8,
              color: "#fff",
              fontSize: 12,
              padding: "4px 10px",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Refresh ↻
          </button>
        )}
      </div>

      <div style={innerCard}>
        {loading ? (
          <div style={{ fontSize: 14, opacity: 0.75 }}>
            ✦ Analyzing weather conditions...
          </div>
        ) : (
          <div
            style={{ fontSize: 14, lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: formatAIText(summary) }}
          />
        )}
      </div>
    </div>
  );
}
