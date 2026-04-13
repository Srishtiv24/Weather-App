const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function getWeatherIcon(desc, temp, isNight = false) {
  const d = (desc || "").toLowerCase();

  if (d.includes("thunder") || d.includes("storm")) return "⛈";
  if (d.includes("snow")) return "❄️";
  if (d.includes("rain") || d.includes("drizzle")) return "🌧";
  if (d.includes("fog") || d.includes("haze") || d.includes("mist")) return "🌫";
  if (d.includes("cloud")) return "⛅";

    return isNight ? "🌙" : "☀️";
  }


function getLocalTime(timezone) {
  const now = new Date(
    Date.now() + (timezone || 0) * 1000 + new Date().getTimezoneOffset() * 60000
  );
  const h = now.getHours();
  const isNight = h < 6 || h >= 19;
  const hDisp = h % 12 || 12;
  const mDisp = String(now.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const dayStr = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
  return { label: `${hDisp}:${mDisp} ${ampm} · ${dayStr}`, isNight };
}

export default function InfoBox({ info }) {
  const { label, isNight } = getLocalTime(info.timezone);
  const icon = getWeatherIcon(info.weather, info.temp,isNight);

  const glass = {
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    color: "#fff",
  };

  const badge = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: "5px 12px",
    fontSize: 13,
    marginBottom: 10,
  };

  const metaGrid = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 16,
  };

  const metaItem = {
    background: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "10px 14px",
  };

  return (
    <div style={glass}>
      <div style={badge}>
        {isNight ? "🌙" : "☀️"} {label}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.5 }}>
            {info.city}{info.country ? `, ${info.country}` : ""}
          </div>
          <div style={{ fontSize: 68, fontWeight: 300, fontFamily: "'Space Mono', monospace", lineHeight: 1 }}>
            {Math.round(info.temp)}°C
          </div>
          <div style={{ fontSize: 15, opacity: 0.85, textTransform: "capitalize", marginTop: 4 }}>
            {info.weather}
          </div>
        </div>
        <div style={{ fontSize: 56, lineHeight: 1 }}>{icon}</div>
      </div>

      <div style={metaGrid}>
        <div style={metaItem}>
          <div style={{ fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.8px" }}>Feels like</div>
          <div style={{ fontSize: 18, fontWeight: 500, marginTop: 2 }}>{Math.round(info.feelsLike)}°C</div>
        </div>
        <div style={metaItem}>
          <div style={{ fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.8px" }}>Humidity</div>
          <div style={{ fontSize: 18, fontWeight: 500, marginTop: 2 }}>{info.humidity}%</div>
        </div>
        <div style={metaItem}>
          <div style={{ fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.8px" }}>High / Low</div>
          <div style={{ fontSize: 18, fontWeight: 500, marginTop: 2 }}>
            {Math.round(info.tempMax)}° / {Math.round(info.tempMin)}°
          </div>
        </div>
        <div style={metaItem}>
          <div style={{ fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.8px" }}>Wind</div>
          <div style={{ fontSize: 18, fontWeight: 500, marginTop: 2 }}>{(info.wind || 0).toFixed(1)} m/s</div>
        </div>
      </div>
    </div>
  );
}
