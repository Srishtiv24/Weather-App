import InfoBox from './InfoBox';
import SearchBox from './SearchBox';
import { useState } from 'react';

export default function WeatherInfo() {
    const [info,setInfo] =useState({
        city:"Delhi",
        feelsLike: 24.84,
        temp: 25.05,
        tempMax: 25.05,
        tempMin: 25.05,
        humidity: 47,
        weather: "haze",
      });

      function updateInfo(newInfo)
      {
        setInfo(newInfo);
      }

return (
    <>
    <SearchBox updateInfo={updateInfo}/>
    <InfoBox info={info}/> 
    </>
  );
}