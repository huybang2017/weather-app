const toastr = require("toastr");
const asyncRequest = require("async-request");
const API_Key = "8ad64c32ebccf9d21359acb8a57a8238";

const getCountry = async (country) => {
  try {
    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${country}&appid=${API_Key}`;
    const res = await asyncRequest(url);
    const data = JSON.parse(res.body);
    const lat = data[0].lat;
    const lon = data[0].lon;
    const name = data[0].name;
    return { lat, lon, name };
  } catch (error) {
    console.log(error);
  }
};
const getWeather = async (country) => {
  try {
    const { lat, lon, name } = await getCountry(country);
    const tempK = 273.15;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_Key}`;
    const res = await asyncRequest(url);
    const data = JSON.parse(res.body);
    const weather = {
      name,
      temp: (data.main.temp - tempK).toFixed(3),
      wind: data.wind.speed,
      visibility: parseFloat(data.visibility / 1000),
      rain: data?.rain?.["1h"] || 0,
      clouds: data?.clouds?.all || 0,
      main: data.weather[0].main,
      description: data.weather[0].description,
    };
    return weather;
  } catch (error) {
    console.log(error);
  }
};
getWeather("vietnam");

// express
const express = require("express");
const app = express();
const path = require("path");

const pathPublic = path.join(__dirname, "./public");
// setup url
app.use(express.static(pathPublic));

// http://localhost:7000
app.get("/", async (req, res) => {
  const params = req.query;
  const weather = await getWeather(params.country);
  console.log(weather);

  if (params.country) {
    res.render("weather", {
      status: true,
      name: weather.name,
      temp: weather.temp,
      wind: weather.wind,
      visibility: weather.visibility,
      rain: weather.rain,
      clouds: weather.clouds,
      main: weather.main,
      description: weather.description,
    });
  } else {
    res.render("weather", {
      status: false,
    });
  }
});

app.set("view engine", "hbs");
const port = 7000;
app.listen(port, () => {
  console.log(`app run on http://localhost:${port}`);
});
