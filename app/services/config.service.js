myApp.service('ConfigService', ['$http','BASE_URL', function($http,BASE_URL) {

      // Add new feature
      this.addFeature = function(featureName) {
        return $http.post(`${BASE_URL}/api/field/addNewFeature`, { featureName });
      },

      // Add new city
      this.addCity = function(cityName) {
        return $http.post(`${BASE_URL}/api/field/addNewCity`, { cityName });
      },

      // Add new category
      this.addCategory = function(categoryName) {
        return $http.post(`${BASE_URL}/api/field/addNewCategory`, { categoryName });
      },

      // Add new fuel type
      this.addFuelType = function(fuelName) {
        return $http.post(`${BASE_URL}/api/field/addNewFuelType`, { fuelName });
      }
  }]); 