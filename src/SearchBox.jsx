import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useState } from "react";
import "./SearchBox.css"

export default function SearchBox({updateInfo}) {
    const [city,setCity] = useState("");
    const [error,setError] = useState(false);
    const API_URL="https://api.openweathermap.org/data/2.5/weather";
    const API_KEY="4388497b490c913733329b09c3985dfc";

    let getWeatherInfo=async ()=>{
        try{
        let response=await fetch(`${API_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        let jsonResponse=await response.json();
        let result={
            city:city,
            temp:jsonResponse.main.temp,
            tempMax:jsonResponse.main.temp_max,
            tempMin:jsonResponse.main.temp_min,
            humidity:jsonResponse.main.humidity,
            feelsLike:jsonResponse.main.feels_like,
            weather:jsonResponse.weather[0].description
        }
        setError(false);
        console.log(result);
        return result;
    }

    catch (err)
    {   
        throw err;
    }}

    function handleChange(event)
    {  
        setCity(event.target.value);
    }

    async function handleSubmit(event)
    {  try{
       event.preventDefault();
       console.log(city);
       let newInfo=await getWeatherInfo();
       console.log(newInfo);
       updateInfo(newInfo);
       setCity("");
    }
    catch(err)
       {setError(true);}
    }

  return (
    <div  className="searchBox">
      <form onSubmit={handleSubmit} class="input"> 
        <h3>Search for the weather</h3>
        <TextField onChange={handleChange} value={city} id="city" label="City Name" variant="outlined" required />
        <br></br>
        <br></br>
        <Button variant="contained" type="submit">Search</Button>
        {error && <p style={{color:"red"}}>No such place in our API</p>}
      </form>
    </div>
  );
}
