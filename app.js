const express = require('express');
const axios = require('axios');
const { Client } = require('@googlemaps/google-maps-services-js');

const app = express();
const port = 8000;

app.set('view engine', 'pug');
app.use(express.static('public'));

// Your API keys for Google Places API and OpenWeatherMap API
const GOOGLE_PLACES_API_KEY = 'AIzaSyA5-NcZ6k10BAnfWLmmHlO1hFZO4aSmMWQ';
const OPENWEATHERMAP_API_KEY = '9cc3f3aee28ac952d5d4b661c8d1332c';

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

// Route for autocomplete search
app.get('/autocomplete/:query', async (req, res) => {
  const query = req.params.query;
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json`, {
      params: {
        input: query,
        key: GOOGLE_PLACES_API_KEY,
      },
    });
    res.json(response.data.predictions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch results.' });
  }
});

// Route for displaying tourist places and weather
app.get('/tourist/:place_id', async (req, res) => {
  const placeId = req.params.place_id;
  try {
    // Fetch tourist place details from Google Places API
    const placeResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
      params: {
        place_id: placeId,
        key: GOOGLE_PLACES_API_KEY,
      },
    });
    const placeDetails = placeResponse.data.result;

    // Get latitude and longitude for weather information
    const { lat, lng } = placeDetails.geometry.location;

    // Fetch weather information from OpenWeatherMap API
    const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        lat,
        lon: lng,
        appid: OPENWEATHERMAP_API_KEY,
      },
    });
    const weatherData = weatherResponse.data;

    res.render('index', { placeDetails, weatherData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});