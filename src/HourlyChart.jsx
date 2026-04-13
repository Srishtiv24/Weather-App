export default function HourlyChart({ hourlyData, timezoneOffset = 0 }) {
  if (!hourlyData || hourlyData.length === 0) return null;

  const data = hourlyData.slice(0, 24);
  const temps = data.map((d) => Math.round(d.temp));
  const minTemp = Math.min(...temps) - 2;
  const maxTemp = Math.max(...temps) + 2;

  const W = 900, H = 110;
  const padL = 8, padR = 8, padT = 20, padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const getX = (i) => padL + (i / (data.length - 1)) * chartW;
  const getY = (t) => padT + chartH - ((t - minTemp) / (maxTemp - minTemp)) * chartH;

  const points = data.map((d, i) => [getX(i), getY(Math.round(d.temp))]);

  function smoothPath(pts) {
    if (pts.length < 2) return "";
    let d = `M ${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const cpx = (pts[i][0] + pts[i + 1][0]) / 2;
      d += ` C ${cpx},${pts[i][1]} ${cpx},${pts[i + 1][1]} ${pts[i + 1][0]},${pts[i + 1][1]}`;
    }
    return d;
  }

  const linePath = smoothPath(points);
  const areaPath =
    linePath +
    ` L ${points[points.length - 1][0]},${padT + chartH} L ${points[0][0]},${padT + chartH} Z`;

  function getIcon(desc, isNight) {
    const d = (desc || "").toLowerCase();
    if (d.includes("rain") || d.includes("drizzle")) return "🌧";
    if (d.includes("thunder")) return "⛈";
    if (d.includes("snow")) return "❄️";
    if (d.includes("cloud")) return "⛅";
    if (d.includes("fog") || d.includes("haze")) return "🌫";
    return isNight ? "🌙" : "☀️";
  }

  const labelIndices = data.map((_, i) => i).filter((i) => i % 3 === 0);

  const glass = {
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: 20,
    padding: "18px 4px 10px",
    marginBottom: 14,
    color: "#fff",
    overflowX: "auto",
    scrollbarWidth: "none",
  };

  return (
    <div style={glass}>
      <div style={{
        fontSize: 12,
        opacity: 0.7,
        textTransform: "uppercase",
        letterSpacing: "0.8px",
        marginBottom: 8,
        paddingLeft: 16,
      }}>
        24-Hour Temperature
      </div>

      <div style={{ overflowX: "auto", scrollbarWidth: "none" }}>
        <svg width={W} height={H} style={{ display: "block", minWidth: W }} viewBox={`0 0 ${W} ${H}`}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
            <line key={i} x1={padL} y1={padT + frac * chartH} x2={W - padR} y2={padT + frac * chartH}
              stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          ))}

          {/* Area fill */}
          <path d={areaPath} fill="url(#areaGrad)" />

          {/* Line */}
          <path d={linePath} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots + labels */}
          {labelIndices.map((i) => {
            const [x, y] = points[i];
            const hour = new Date((data[i].dt + timezoneOffset) * 1000).getUTCHours();
            const label = hour === 0 ? "12am" : hour === 12 ? "12pm" : hour > 12 ? `${hour - 12}pm` : `${hour}am`;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={3.5} fill="white" opacity="0.9" />
                <text x={x} y={y - 8} textAnchor="middle" fill="rgba(255,255,255,0.95)"
                  fontSize="11" fontFamily="'DM Sans', sans-serif" fontWeight="500">
                  {temps[i]}°
                </text>
                <text x={x} y={H - 10} textAnchor="middle" fill="rgba(255,255,255,0.55)"
                  fontSize="10" fontFamily="'DM Sans', sans-serif">
                  {label}
                </text>
              </g>
            );
          })}

          {/* Weather icons every 6h */}
          {data.map((d, i) => ({ d, i }))
            .filter(({ i }) => i % 6 === 0)
            .map(({ d, i }) => {
              const x = points[i][0];
              const hour = new Date((d.dt + timezoneOffset) * 1000).getUTCHours();
              const isNightHour = hour < 6 || hour >= 19;
              return (
                <text key={i} x={x} y={H - 22} textAnchor="middle"
                  fontSize="13" fontFamily="'DM Sans', sans-serif">
                  {getIcon(d.description, isNightHour)}
                </text>
              );
            })}
        </svg>
      </div>
    </div>
  );
}
