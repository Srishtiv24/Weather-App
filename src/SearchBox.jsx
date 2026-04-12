import { useState } from "react";
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import "./SearchBox.css" ;
export default function SearchBox({ onSearch, loading, error }) {
  const [city, setCity] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = city.trim();
    if (trimmed) {
      onSearch(trimmed);
      setCity("");
    }
  }

  function handleGeo() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        onSearch(null, pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setGeoLoading(false);
        alert("Location access denied. Please allow location access.");
      }
    );
  }

  const glassStyle = {
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: 16,
    padding: "16px 20px",
    marginBottom: 14,
  };

  const inputStyle = {
    flex: 1,
    padding: "11px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.3)",
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    minWidth: 0,
  };

  const btnStyle = {
    padding: "11px 20px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.3)",
    background: "rgba(255,255,255,0.2)",
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: "nowrap",
    transition: "background 0.2s",
  };

  const geoBtnStyle = {
    ...btnStyle,
    padding: "11px 14px",
    fontSize: 18,
  };

  return (
    <div style={glassStyle}>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10 }}>
        <input
          style={inputStyle}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Search city..."
        />
        <button type="submit" style={btnStyle} disabled={loading}>
          {loading ? "..." : "Search"}
        </button>
        <button
          type="button"
          style={geoBtnStyle}
          onClick={handleGeo}
          title="Use my location"
          disabled={geoLoading}
        >
          {geoLoading ? "..." : <LocationSearchingIcon/>}
        </button>
      </form>
      {error && (
        <p style={{ color: "#ffeaa7", fontSize: 13, marginTop: 8 }}>
          City not found. Try a different name.
        </p>
      )}
    </div>
  );
}
