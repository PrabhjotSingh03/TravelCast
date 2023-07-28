const express = require('express');
const { Client } = require('@googlemaps/google-maps-services-js');

const router = express.Router();

const GOOGLE_PLACES_API_KEY = 'AIzaSyA5-NcZ6k10BAnfWLmmHlO1hFZO4aSmMWQ';

router.get('/', async (req, res) => {
  res.render('index');
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
        radius: 5000, // 5000 meters (5 kilometers) radius around the selected city
        key: GOOGLE_PLACES_API_KEY,
        type: 'tourist_attraction', // Filter results to include only tourist attractions
      },
    });

    const touristAttractions = placesResponse.data.results.slice(0, 5).map(attraction => ({
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


