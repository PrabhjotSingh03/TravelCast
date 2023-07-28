const express = require('express');
const axios = require('axios');
const { Client } = require('@googlemaps/google-maps-services-js');

const app = express();
const port = 8000;

app.set('view engine', 'pug');
app.use(express.static('public'));

// Your API keys for Google Places API and OpenWeatherMap API
const GOOGLE_PLACES_API_KEY = 'AIzaSyA5-NcZ6k10BAnfWLmmHlO1hFZO4aSmMWQ';

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

// Route for autocomplete search
app.get('/autocomplete/:query', async (req, res) => {
  const query = req.params.query;
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
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

// Route for displaying tourist places

app.get('/tourist_attractions/:lat/:lng', async (req, res) => {
  const { lat, lng } = req.params;

  // Fetch nearby places using Google Places API nearby search
  const client = new Client({});
  try {
    const placesResponse = await client.placesNearby({
      params: {
        location: `${lat},${lng}`,
        radius: 5000, // 5000 meters (5 kilometers) radius around the selected city
        key: GOOGLE_PLACES_API_KEY,
        type: [
          'tourist_attraction', 'amusement_park', 'aquarium', 'art_gallery', 'bowling_alley', 'cafe', 'campground',
          'zoo', 'shopping_mall', 'restaurant', 'museum', 'movie_theater', 'point_of_interest', 'landmark',
          'natural_feature', 'place_of_worship', 'town_square', 'bakery'
        ],
      },
    });

    const touristAttractions = placesResponse.data.results.slice(0, 100).map(attraction => ({
      name: attraction.name,
      location: attraction.geometry.location,
      address: attraction.vicinity,
      type: attraction.types,
    }));

    res.json({ touristAttractions });
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    res.status(500).json({ error: 'Failed to fetch nearby places.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

