import { useState } from "react";
import SearchBox from "./SearchBox";
import InfoBox from "./InfoBox";
import ForecastBox from "./ForecastBox";
import AIBox from "./AIBox";
import WeatherBackground from "./WeatherBackground";
import HourlyChart from "./HourlyChart";
import MultiCityPanel from "./MultiCityPanel";

const API_URL = "https://api.openweathermap.org/data/2.5";
const API_KEY = "4388497b490c913733329b09c3985dfc";

function getBackground(temp, weather, timezone) {
  const now = new Date(
    Date.now() + (timezone || 0) * 1000 + new Date().getTimezoneOffset() * 60000
  );
  const h = now.getHours();
  const isNight = h < 6 || h >= 19;
  if (isNight) return "linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)";
  const w = (weather || "").toLowerCase();
  if (w.includes("thunder") || w.includes("storm")) return "linear-gradient(135deg,#2d3436,#6c5ce7,#341f97)";
  if (w.includes("snow")) return "linear-gradient(135deg,#dfe6e9,#b2bec3,#74b9ff)";
  if (w.includes("rain") || w.includes("drizzle")) return "linear-gradient(135deg,#4a4e69,#636e72,#2d3436)";
  if (w.includes("fog") || w.includes("haze") || w.includes("mist")) return "linear-gradient(135deg,#8d9db6,#b2bec3,#636e72)";
  if (temp >= 35) return "linear-gradient(135deg,#f39c12,#e74c3c,#c0392b)";
  if (temp >= 28) return "linear-gradient(135deg,#fdcb6e,#e17055,#d63031)";
  if (temp >= 20) return "linear-gradient(135deg,#74b9ff,#0984e3,#6c5ce7)";
  if (temp >= 10) return "linear-gradient(135deg,#a29bfe,#636e72,#2d3436)";
  return "linear-gradient(135deg,#dfe6e9,#b2bec3,#636e72)";
}

function isNightTime(timezone) {
  const now = new Date(
    Date.now() + (timezone || 0) * 1000 + new Date().getTimezoneOffset() * 60000
  );
  const h = now.getHours();
  return h < 6 || h >= 19;
}

export default function WeatherInfo() {
  const [info, setInfo] = useState({
    city: "Delhi", country: "IN",
    feelsLike: 24.84, temp: 38.05,
    tempMax: 25.05, tempMin: 25.05,
    humidity: 47, weather: "haze",
    wind: 2.1, timezone: 19800,
  });
  const [forecast, setForecast] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function fetchAll(city = null, lat = null, lon = null) {
    setLoading(true);
    setError(false);
    try {
      const loc = lat && lon ? `lat=${lat}&lon=${lon}` : `q=${encodeURIComponent(city)}`;
      const [r1, r2] = await Promise.all([
        fetch(`${API_URL}/weather?${loc}&appid=${API_KEY}&units=metric`),
        fetch(`${API_URL}/forecast?${loc}&appid=${API_KEY}&units=metric`),
      ]);
      if (!r1.ok) throw new Error("City not found");
      const d1 = await r1.json();
      const d2 = await r2.json();

      setInfo({
        city: d1.name, country: d1.sys.country,
        temp: d1.main.temp, tempMax: d1.main.temp_max,
        tempMin: d1.main.temp_min, humidity: d1.main.humidity,
        feelsLike: d1.main.feels_like,
        weather: d1.weather[0].description,
        wind: d1.wind.speed, timezone: d1.timezone,
      });

      // Hourly - next 24 entries from forecast (each 3h apart)
      const hourly = d2.list.slice(0, 24).map((item) => ({
        dt: item.dt,
        temp: item.main.temp,
        description: item.weather[0].description,
      }));
      setHourlyData(hourly);

      // Daily forecast grouped by day
      const daily = {};
      d2.list.forEach((item) => {
        const d = new Date(item.dt * 1000);
        const key = d.toDateString();
        if (!daily[key]) daily[key] = { date: d, hi: -999, lo: 999, descriptions: [] };
        if (item.main.temp > daily[key].hi) daily[key].hi = item.main.temp;
        if (item.main.temp < daily[key].lo) daily[key].lo = item.main.temp;
        daily[key].descriptions.push(item.weather[0].description);
      });
      setForecast(Object.values(daily).slice(0, 5));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const bg = getBackground(info.temp, info.weather, info.timezone);
  const isNight = isNightTime(info.timezone);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bg,
        transition: "background 1s ease",
        padding: "20px",
        fontFamily: "'DM Sans', sans-serif",
        position: "relative",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400&display=swap"
        rel="stylesheet"
      />

      <WeatherBackground condition={info.weather} temp={info.temp} isNight={isNight} />

      <div style={{ maxWidth: "70%", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <SearchBox onSearch={fetchAll} loading={loading} error={error} />
        <InfoBox info={info} />
        {hourlyData.length > 0 && <HourlyChart hourlyData={hourlyData} isNight={isNightTime}/>}
        {forecast.length > 0 && <ForecastBox forecast={forecast} />}
        <MultiCityPanel />
        {info.temp && <AIBox info={info} forecast={forecast} />}
      </div>
    </div>
  );
}
