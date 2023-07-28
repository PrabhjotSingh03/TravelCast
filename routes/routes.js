const express = require('express');
const fetch = require('node-fetch');
const { Client } = require('@googlemaps/google-maps-services-js');

const router = express.Router();

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

router.get('/', async (req, res) => {
  res.render('index');
});

router.get('/search', async (req, res) => {
  const city = req.query.city;

  // Fetch tourist places using Google Places API
  const client = new Client({});
  const placesResponse = await client.textSearch({
    params: {
      query: `tourist attractions in ${city}`,
      key: AIzaSyA5-NcZ6k10BAnfWLmmHlO1hFZO4aSmMWQ,
    },
  });
  const touristPlaces = placesResponse.data.results.slice(0, 5).map(place => ({
    name: place.name,
    address: place.formatted_address,
    photos: place.photos ? place.photos.slice(0, 4).map(photo => photo.photo_reference) : []
  }));

  // Fetch weather information using OpenWeather API
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=9cc3f3aee28ac952d5d4b661c8d1332c`;
  const weatherResponse = await fetch(weatherUrl);
  const Data = await weatherResponse.json();
  const weather = {
    temperature: Data.main.temp,
    description: Data.weather[0].description,
    icon: Data.weather[0].icon
  };

  res.json({ touristPlaces, weather });
});

module.exports = router;