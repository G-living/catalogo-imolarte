// Google Places API (New) - Implementación correcta
let placesService = null;
let sessionToken = null;

async function initGooglePlaces() {
    try {
        const { AutocompleteService } = await google.maps.importLibrary("places");
        const { Place } = await google.maps.importLibrary("places");
        
        placesService = new AutocompleteService();
        sessionToken = new google.maps.places.AutocompleteSessionToken();
        
        const addressInput = document.getElementById('address');
        const suggestionsDiv = document.getElementById('suggestions');
        
        let debounceTimer;
        addressInput.addEventListener('input', function(e) {
            clearTimeout(debounceTimer);
            const value = e.target.value;
            
            if (value.length < 3) {
                suggestionsDiv.innerHTML = '';
                suggestionsDiv.style.display = 'none';
                return;
            }
            
            debounceTimer = setTimeout(() => {
                placesService.getPlacePredictions({
                    input: value,
                    componentRestrictions: { country: 'co' },
                    sessionToken: sessionToken
                }, handlePredictions);
            }, 300);
        });
        
        function handlePredictions(predictions, status) {
            if (status !== 'OK' || !predictions) {
                suggestionsDiv.style.display = 'none';
                return;
            }
            
            suggestionsDiv.innerHTML = predictions.map(pred => 
                '<div class="suggestion-item" data-place-id="' + pred.place_id + '">' +
                pred.description + '</div>'
            ).join('');
            
            suggestionsDiv.style.display = 'block';
            
            document.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', async function() {
                    const placeId = this.dataset.placeId;
                    await selectPlace(placeId, Place);
                    suggestionsDiv.style.display = 'none';
                });
            });
        }
        
        async function selectPlace(placeId, Place) {
            const place = new Place({ id: placeId });
            await place.fetchFields({ fields: ['addressComponents', 'formattedAddress'] });
            
            const components = {};
            if (place.addressComponents) {
                place.addressComponents.forEach(comp => {
                    components[comp.types[0]] = comp.longText;
                });
            }
            
            let addr = components.route || '';
            if (components.street_number) addr += ' #' + components.street_number;
            if (!addr) addr = place.formattedAddress;
            
            document.getElementById('address').value = addr;
            document.getElementById('neighborhood').value = components.sublocality_level_1 || components.locality || '';
            document.getElementById('city').value = components.locality || 'Bogotá';
            
            sessionToken = new google.maps.places.AutocompleteSessionToken();
        }
        
        document.addEventListener('click', (e) => {
            if (!addressInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
                suggestionsDiv.style.display = 'none';
            }
        });
        
        console.log('✅ Google Places API (New) activado');
    } catch (error) {
        console.error('Error Google Places:', error);
    }
}
