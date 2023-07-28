const searchInput = document.getElementById('search');
const results = document.getElementById('results');
let map;
let markers = [];

searchInput.addEventListener('input', async (e) => {
  results.innerHTML = '';
  const query = e.target.value;
  if (query.length >= 3) {
    const response = await fetch(`/autocomplete/${query}`);
    const data = await response.json();
    data.forEach((result) => {
      const li = document.createElement('li');
      li.textContent = result.description;
      li.addEventListener('click', () => {
        searchInput.value = result.description;
        results.innerHTML = '';
        getPlaceDetails(result.place_id);
      });
      results.appendChild(li);
    });
  }
});

function displayPlaces(places) {
  if (markers.length > 0) {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
  }

  places.forEach(place => {
    const marker = new google.maps.Marker({
      position: place.location,
      map: map,
      title: place.name,
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      },
    });
    markers.push(marker);
  });
}

async function displayTouristAttractions(lat, lng) {
  try {
    const response = await fetch(`/tourist_attractions/${lat}/${lng}`);
    const data = await response.json();
    const touristAttractions = data.touristAttractions;
    displayPlaces(touristAttractions);
  } catch (error) {
    console.error('Error fetching nearby tourist attractions:', error);
  }
}

function getPlaceDetails(placeId) {
  if (markers.length > 0) {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
  }

  const service = new google.maps.places.PlacesService(document.createElement('div'));
  service.getDetails({ placeId }, (placeDetails, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      const location = placeDetails.geometry.location;
      map.setCenter(location);
      map.setZoom(15);
      const marker = new google.maps.Marker({
        position: location,
        map: map,
        title: placeDetails.name,
      });
      markers.push(marker);

      // Display nearby tourist attractions for the selected place
      displayTouristAttractions(location.lat(), location.lng());
    }
  });
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 0, lng: 0 },
    zoom: 2,
  });
}

function loadGoogleMapsScript() {
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA5-NcZ6k10BAnfWLmmHlO1hFZO4aSmMWQ&libraries=places&callback=initMap`;
  script.defer = true;
  script.async = true;
  document.head.appendChild(script);
}

window.addEventListener('load', loadGoogleMapsScript);
