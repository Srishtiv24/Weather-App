import { useState } from "react";

const API_URL = "https://api.openweathermap.org/data/2.5/weather";
const API_KEY = "4388497b490c913733329b09c3985dfc";

const WEATHER_ICONS = {
  thunder: "⛈", snow: "❄️", rain: "🌧", drizzle: "🌦",
  cloud: "⛅", fog: "🌫", haze: "🌫", mist: "🌫", clear: "☀️", default: "🌤",
};

function getIcon(desc) {
  const d = (desc || "").toLowerCase();
  for (const [key, icon] of Object.entries(WEATHER_ICONS)) {
    if (d.includes(key)) return icon;
  }
  return WEATHER_ICONS.default;
}

function getTempColor(temp) {
  if (temp >= 38) return "#e74c3c";
  if (temp >= 30) return "#e67e22";
  if (temp >= 22) return "#f1c40f";
  if (temp >= 15) return "#2ecc71";
  if (temp >= 5) return "#3498db";
  return "#74b9ff";
}

function CityCard({ city, onRemove, rank }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: 18,
        padding: 18,
        color: "#fff",
        position: "relative",
        flex: "1 1 140px",
        minWidth: 140,
        transition: "transform 0.2s",
      }}
    >
      <button
        onClick={onRemove}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "rgba(255,255,255,0.15)",
          border: "none",
          borderRadius: "50%",
          width: 22,
          height: 22,
          color: "#fff",
          cursor: "pointer",
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
        }}
      >
        ×
      </button>

      <div style={{ fontSize: 22, marginBottom: 4 }}>{getIcon(city.weather)}</div>
      <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, marginBottom: 2, lineHeight: 1.2 }}>
        {city.name}
      </div>
      <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 10 }}>{city.country}</div>

      <div
        style={{
          fontSize: 36,
          fontWeight: 300,
          fontFamily: "'Space Mono', monospace",
          color: getTempColor(Math.round(city.temp)),
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        {Math.round(city.temp)}°
      </div>

      <div style={{ fontSize: 11, opacity: 0.7, textTransform: "capitalize", marginBottom: 12 }}>
        {city.weather}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {[
          ["Humidity", `${city.humidity}%`],
          ["Wind", `${city.wind?.toFixed(1)} m/s`],
          ["Feels", `${Math.round(city.feelsLike)}°`],
        ].map(([label, val]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ opacity: 0.55 }}>{label}</span>
            <span style={{ fontWeight: 500 }}>{val}</span>
          </div>
        ))}
      </div>
      <br/>
      {rank === 0 && (
        <div
          style={{
            display: "inline-block",
            background: "rgba(255,215,0,0.25)",
            border: "1px solid rgba(255,215,0,0.4)",
            borderRadius: 20,
            fontSize: 10,
            padding: "2px 8px",
            marginBottom: 8,
            color: "#ffd700",
            letterSpacing: "0.5px",
          }}
        >
          WARMEST
        </div>
      )}

    </div>
    
  );
}

export default function MultiCityPanel() {
  const [cities, setCities] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function addCity() {
    const name = input.trim();
    if (!name) return;
    if (cities.length >= 3) {
      setError("Max 3 cities. Remove one first.");
      return;
    }
    if (cities.find((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setError("City already added.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const r = await fetch(
        `${API_URL}?q=${encodeURIComponent(name)}&appid=${API_KEY}&units=metric`
      );
      if (!r.ok) throw new Error("Not found");
      const d = await r.json();
      setCities((prev) => [
        ...prev,
        {
          name: d.name,
          country: d.sys.country,
          temp: d.main.temp,
          feelsLike: d.main.feels_like,
          humidity: d.main.humidity,
          weather: d.weather[0].description,
          wind: d.wind?.speed,
        },
      ]);
      setInput("");
    } catch {
      setError("City not found.");
    } finally {
      setLoading(false);
    }
  }

  function removeCity(i) {
    setCities((prev) => prev.filter((_, idx) => idx !== i));
  }

  const sorted = [...cities].sort((a, b) => b.temp - a.temp);
  const warmestName = sorted[0]?.name;

  const glass = {
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    color: "#fff",
  };

  return (
    <div style={glass}>
      <div
        style={{
          fontSize: 12,
          opacity: 0.7,
          textTransform: "uppercase",
          letterSpacing: "0.8px",
          marginBottom: 14,
        }}
      >
        Compare Cities
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCity()}
          placeholder={cities.length >= 3 ? "Max 3 cities" : "Add a city..."}
          disabled={cities.length >= 3}
          style={{
            flex: 1,
            padding: "9px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.25)",
            background: "rgba(255,255,255,0.12)",
            color: "#fff",
            fontSize: 14,
            fontFamily: "'DM Sans', sans-serif",
            outline: "none",
          }}
        />
        <button
          onClick={addCity}
          disabled={loading || cities.length >= 3}
          style={{
            padding: "9px 16px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.25)",
            background: "rgba(255,255,255,0.2)",
            color: "#fff",
            cursor: "pointer",
            fontSize: 14,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {loading ? "..." : "+ Pin"}
        </button>
      </div>

      {error && (
        <p style={{ color: "#ffeaa7", fontSize: 12, marginBottom: 10 }}>{error}</p>
      )}

      {cities.length === 0 && (
        <p style={{ fontSize: 13, opacity: 0.5, textAlign: "center", padding: "16px 0" }}>
          Pin up to 3 cities to compare side by side
        </p>
      )}

      {cities.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {cities.map((city, i) => (
            <CityCard
              key={city.name}
              city={city}
              onRemove={() => removeCity(i)}
              rank={city.name === warmestName ? 0 : -1}
            />
          ))}
        </div>
      )}

      {cities.length >= 2 && (
        <div
          style={{
            marginTop: 14,
            padding: "10px 14px",
            background: "rgba(255,255,255,0.12)",
            borderRadius: 12,
            fontSize: 13,
            opacity: 0.85,
          }}
        >
          Temperature spread:{" "}
          <strong>
            {Math.round(Math.max(...cities.map((c) => c.temp)) - Math.min(...cities.map((c) => c.temp)))}°C
          </strong>{" "}
          &nbsp;
          &nbsp;

          Warmest: <strong>{warmestName}</strong>
        </div>
      )}
    </div>
  );
}
