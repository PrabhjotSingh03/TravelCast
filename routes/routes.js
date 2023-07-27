const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

router.get('/', async (req, res) => {
  res.render('index');
});

router.get('/search', async (req, res) => {
  const city = req.query.city;

  // Fetch tourist places using Google Places API
  const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=tourist+attractions+in+${city}&key=AIzaSyA5-NcZ6k10BAnfWLmmHlO1hFZO4aSmMWQ`;
  const placesResponse = await fetch(placesUrl);
  const placesData = await placesResponse.json();
  const touristPlaces = placesData.results.slice(0, 5).map(place => ({
    name: place.name,
    address: place.formatted_address,
    photos: place.photos ? place.photos.slice(0, 4).map(photo => photo.photo_reference) : []
  }));

  // Fetch weather information using OpenWeather API
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${OPENWEATHER_API_KEY}`;
  const weatherResponse = await fetch(weatherUrl);
  const weatherData = await weatherResponse.json();
  const weather = {
    temperature: weatherData.main.temp,
    description: weatherData.weather[0].description,
    icon: weatherData.weather[0].icon
  };

  res.json({ touristPlaces, weather });
});

module.exports = router;        

