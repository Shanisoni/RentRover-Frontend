/**
 * Location Factory - Gets user's city location and checks if service is available there
 */
myApp.factory("LocationFactory", ['$q', '$http', 'CITIES', function($q, $http, CITIES) {
  // List of cities where our service is available
  const metroCities = CITIES;

  
  function getCityUsingGeolocation() {
    const deferred = $q.defer();

    // Check if browser can get location
    if (!navigator.geolocation) {
      deferred.reject("Geolocation not supported by your browser");
      return deferred.promise;
    }

    // Get user's location coordinates
    navigator.geolocation.getCurrentPosition(
      // When location is found
      position => {
        // Create URL to get city name from coordinates
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`;
        
        // Get city name from coordinates
        $http.get(url)
          .then(response => {
            const address = response.data?.address;
            if (!address) {
              deferred.reject("Unable to fetch city data");
              return;
            }

            // Try to get city name, fallback to town or village
            let city = address.city || address.town || address.village;
            const state = address.state;

            // Check if we provide service in this city
            if ((city && metroCities.includes(city)) || state === "Delhi") {
              // Format city name (first letter capital)
              city = city ? city.charAt(0).toUpperCase() + city.slice(1).toLowerCase() : "Delhi";
              deferred.resolve(city);
            } else {
              deferred.resolve("Our service is not available in your location");
            }
          })
          .catch(() => deferred.reject("Error fetching city data"));
      },
      // When location access fails
      error => deferred.reject("Error getting location: " + error.message)
    );

    return deferred.promise;
  }

  // Make the function available to other parts of the app
  return {
    getCityUsingGeolocation
  };
}]);