const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getForecastIcon(desc) {
  const d = (desc || "").toLowerCase();
  if (d.includes("thunder") || d.includes("storm")) return "⛈";
  if (d.includes("snow")) return "❄️";
  if (d.includes("rain") || d.includes("drizzle")) return "🌧";
  if (d.includes("fog") || d.includes("haze") || d.includes("mist")) return "🌫";
  if (d.includes("cloud")) return "⛅";
  return "☀️";
}

export default function ForecastBox({ forecast }) {
  const glass = {
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    color: "#fff",
  };

  const scrollRow = {
    display: "flex",
    gap: 10,
    overflowX: "auto",
    paddingBottom: 4,
    scrollbarWidth: "none",
  };

  return (
    <div style={glass}>
      <div style={{ fontSize: 12, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>
        5-Day Forecast
      </div>
      <div style={scrollRow}>
        {forecast.map((day, i) => {
          const isToday = i === 0;
          const name = isToday ? "Today" : DAYS[day.date.getDay()];//day.date is js obj and .getDay will return a index of day
          const midDesc = day.descriptions[Math.floor(day.descriptions.length / 2)];
          return (
            <div
              key={i}
              style={{
                background: isToday ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)",
                border: isToday ? "1px solid rgba(255,255,255,0.4)" : "1px solid transparent",
                borderRadius: 14,
                padding: "12px 10px",
                textAlign: "center",
                minWidth: 72,
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>{name}</div>
              <div style={{ fontSize: 24, margin: "4px 0" }}>{getForecastIcon(midDesc)}</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{Math.round(day.hi)}°</div>
              <div style={{ fontSize: 12, opacity: 0.65 }}>{Math.round(day.lo)}°</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
