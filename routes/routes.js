const express = require('express');
const { Client } = require('@googlemaps/google-maps-services-js');
const axios = require('axios');
const router = express.Router();

require('dotenv').config();

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

router.get('/', async (req, res) => {
  res.render('index');
});

// Route for autocomplete search
router.get('/autocomplete/:query', async (req, res) => {
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

router.get('/search', async (req, res) => {
  const city = req.query.city;

  // Fetch places using Google Places API text search
  const client = new Client({});
  try {
    const placesResponse = await client.textSearch({
      params: {
        query: `${city}`,
        key: GOOGLE_PLACES_API_KEY,
      },
    });

    const places = placesResponse.data.results.slice(0, 5).map(place => ({
      name: place.name,
      location: place.geometry.location,
      address: place.formatted_address,
    }));

    res.json({ places });
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ error: 'Failed to fetch places.' });
  }
});

router.get('/tourist_attractions/:lat/:lng', async (req, res) => {
  const { lat, lng } = req.params;

  // Fetch nearby tourist attractions using Google Places API nearby search
  const client = new Client({});
  try {
    const placesResponse = await client.placesNearby({
      params: {
        location: `${lat},${lng}`,
        radius: 5000,
        key: GOOGLE_PLACES_API_KEY,
        type:[ 'tourist_attraction', 'amusement_park', 'aquarium', 'art_gallery', 'bowling_alley', 'cafe', 'campground',
        'zoo', 'shopping_mall', 'restaurant', 'museum', 'movie_theater', 'point_of_interest', 'landmark',
        'natural_feature', 'place_of_worship', 'town_square', 'bakery' ]
      },
    });

    const touristAttractions = placesResponse.data.results.slice(0, 10000).map(attraction => ({
      name: attraction.name,
      location: attraction.geometry.location,
      address: attraction.vicinity,
    }));

    res.json({ touristAttractions });
  } catch (error) {
    console.error('Error fetching nearby tourist attractions:', error);
    res.status(500).json({ error: 'Failed to fetch nearby tourist attractions.' });
  }
});

module.exports = router;


