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

const placesList = document.getElementById('places-list');

function displayPlaces(places) {
  // Clear the existing list of places
  placesList.innerHTML = '';

  if (markers.length > 0) {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
  }

  places.forEach(place => {
    // Create a new marker for each place
    const marker = new google.maps.Marker({
      position: place.location,
      map: map,
      title: place.name,
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      },
    });

    // Show an info window with the place's name when clicked on the marker
    const infoWindow = new google.maps.InfoWindow({
      content: `<div><strong>${place.name}</strong></div><div>${place.address}</div><div>Rating: ${place.rating}</div><div>${place.type}</div>`
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    markers.push(marker);

    // Add the place to the list
    const listItem = document.createElement('li');
    listItem.textContent = place.name;
    listItem.addEventListener('click', () => {
      // Center the map on the selected place when clicked on the list item
      map.setCenter(place.location);
      map.setZoom(15);
      // Show the marker's info window when a list item is clicked
      infoWindow.open(map, marker);
    });

    placesList.appendChild(listItem);
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

async function getUserLocation() {
  return new Promise((resolve, reject) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        error => {
          console.error('Error getting user location:', error);
          reject(error);
        }
      );
    } else {
      reject(new Error('Geolocation is not available in this browser.'));
    }
  });
}
let lastClickedMarker = null;


function initMap() {
  getUserLocation()
    .then(userLocation => {
      map = new google.maps.Map(document.getElementById('map'), {
        center: userLocation,
        zoom: 15, // Adjust the zoom level as needed
      });

      // Add a marker for the user's location
      const userMarker = new google.maps.Marker({
        position: userLocation,
        map: map,
        title: 'Your Location',
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        },
      });

      // Display nearby tourist attractions for the user's location
      displayTouristAttractions(userLocation.lat, userLocation.lng);

      // Add a click event listener to the map
      map.addListener('click', event => {
        const clickedLocation = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };

        // Clear the marker of the previous clicked location, if it exists
        if (lastClickedMarker) {
          lastClickedMarker.setMap(null);
        }

        // Clear existing markers and display nearby tourist attractions for the clicked location
        clearMarkers();
        displayTouristAttractions(clickedLocation.lat, clickedLocation.lng);

        // Add a marker for the clicked location
        const clickedMarker = new google.maps.Marker({
          position: clickedLocation,
          map: map,
          title: 'Clicked Location',
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
          },
        });

        // Show an info window for the clicked marker
        const infoWindow = new google.maps.InfoWindow({
          content: 'Clicked Location',
        });

        infoWindow.open(map, clickedMarker);

        // Store the clicked marker in the lastClickedMarker variable
        lastClickedMarker = clickedMarker;
      });
    })
    .catch(error => {
      console.error('Error getting user location:', error);
      // If the user's location cannot be obtained, set a default location (e.g., city center)
      map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 0, lng: 0 },
        zoom: 2,
      });
    });
}

function clearMarkers() {
  markers.forEach(marker => marker.setMap(null));
  markers = [];
}

function loadGoogleMapsScript() {
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA5-NcZ6k10BAnfWLmmHlO1hFZO4aSmMWQ&libraries=places&callback=initMap`;
  script.defer = true;
  script.async = true;
  document.head.appendChild(script);
}

window.addEventListener('load', loadGoogleMapsScript);