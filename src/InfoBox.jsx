import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import AcUnitOutlinedIcon from "@mui/icons-material/AcUnitOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import ThunderstormOutlinedIcon from "@mui/icons-material/ThunderstormOutlined";
import "./InfoBox.css";

export default function InfoBox({ info }) {
  const image = {
    sunny:
      "https://images.unsplash.com/12/sun-trees.jpg?q=80&w=1340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    haze: "https://images.unsplash.com/photo-1643948962441-c8947e0fe565?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    clear:
      "https://images.unsplash.com/photo-1464660439080-b79116909ce7?q=80&w=1502&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    snow: "https://images.unsplash.com/photo-1589218112660-81ef972e89e3?q=80&w=1330&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rainy:
      "https://images.unsplash.com/photo-1610741083757-1ae88e1a17f7?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    windy:
      "https://images.unsplash.com/photo-1470176519524-3c2f481c8c9c?q=80&w=1528&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    thunder:
      "https://images.unsplash.com/photo-1538169204832-1b461add30a5?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    overcast:
      "https://images.unsplash.com/photo-1604042403941-398c711e4218?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    fog: "https://plus.unsplash.com/premium_photo-1669613233557-1676c121fe73?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  };

  return (
    <div>
      <div className="infobox">
        <Card sx={{ maxWidth: 345 }} className="card">
          <CardMedia
            sx={{ height: 160 }}
            image={
              info.temp >= 40
                ? image.sunny // extreme heat
                : info.temp >= 30 && info.humidity >= 70
                ? image.thunder // hot + very humid → thunderstorm
                : info.temp >= 30 && info.humidity >= 50
                ? image.rainy // hot + humid → monsoon rains
                : info.temp >= 30
                ? image.sunny // hot but dry → sunny
                : info.temp >= 20
                ? image.clear // pleasant clear skies
                : info.temp >= 15
                ? image.overcast // mild, cloudy
                : info.temp >= 10
                ? image.haze // cool haze
                : info.temp >= 5
                ? image.fog // foggy chill
                : info.temp >= 0
                ? image.windy // cold winds
                : info.temp < 0
                ? image.snow // freezing snow
                : image.clear
            }
            title="city"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {info.city}
              &nbsp;
              {info.temp <= 10 ? (
                <AcUnitOutlinedIcon /> // ❄️ Cold → Snow/Ice
              ) : info.temp >= 30 && info.humidity >= 70 ? (
                <ThunderstormOutlinedIcon /> // ⛈ Hot + Humid → Thunderstorm
              ) : info.temp >= 25 && info.humidity >= 50 ? (
                <CloudOutlinedIcon /> // ☁️ Warm + Humid → Cloudy/Rainy
              ) : info.temp >= 25 ? (
                <WbSunnyOutlinedIcon /> // ☀️ Warm + Dry → Sunny
              ) : (
                <CloudOutlinedIcon /> // Default → Cloudy
              )}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              <p>Temperature={info.temp} &deg;C</p>
              <p>Humidity={info.humidity} </p>
              <p>Max Temperature={info.tempMax} &deg;C</p>
              <p>Min Temperature={info.tempMin} &deg;C</p>
              <p>
                The weather can be described as <i>{info.weather}</i> & feels
                like {info.feelsLike} &deg;C
              </p>
            </Typography>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
