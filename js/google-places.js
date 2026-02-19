// js/google-places.js – Google Places API autocomplete for address

import { CONFIG } from './config.js';
import { showToast } from './ui.js';

// Places API key (replace with yours – free tier OK for low volume)
const PLACES_API_KEY = 'AIzaSyD...'; // ← your key

// Init autocomplete
export function initGooglePlaces() {
  if (!document.getElementById('address')) return;

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${PLACES_API_KEY}&libraries=places`;
  script.async = true;
  script.onload = () => {
    const autocomplete = new google.maps.places.Autocomplete(document.getElementById('address'), {
      types: ['address'],
      componentRestrictions: { country: 'CO' }
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.address_components) {
        // Fill address, barrio, city if needed
        document.getElementById('address').value = place.formatted_address;
        // Extract barrio, city if separate fields
        // e.g. document.getElementById('barrio').value = place.address_components.find(c => c.types.includes('neighborhood'))?.long_name;
      }
    });
  };
  script.onerror = () => showToast('Error al cargar Google Places – ingresa dirección manualmente', 'warning');

  document.head.appendChild(script);
}