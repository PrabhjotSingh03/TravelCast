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

function getPlaceDetails(placeId) {
  if (markers.length > 0) {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
  }

  const request = {
    placeId: placeId,
    fields: ['name', 'formatted_address', 'geometry', 'photos'],
  };

  const service = new google.maps.places.PlacesService(document.createElement('div'));
  service.getDetails(request, (placeDetails, status) => {
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
    }
  });
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 0, lng: 0 },
    zoom: 2,
  });
}

// Load Google Maps API asynchronously with a callback
function loadGoogleMapsScript() {
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA5-NcZ6k10BAnfWLmmHlO1hFZO4aSmMWQ&libraries=places&callback=initMap`;
  script.defer = true;
  script.async = true;
  document.head.appendChild(script);
}

window.addEventListener('load', loadGoogleMapsScript);