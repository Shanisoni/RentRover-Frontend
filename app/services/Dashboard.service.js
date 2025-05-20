/**
 * @description Dashboard Service - Handles common dashboard operations and field data retrieval
 * Provides methods for fetching categories, fuel types, cities, and current location
 */
myApp.service("DashboardService", [
  "$q",
  "LocationFactory",
  "$http",
  "BASE_URL",
  function ($q, LocationFactory, $http, BASE_URL) {
    // ==========================================
    // Field Data Operations
    // ==========================================
    
    /**
     * @description Fetch available car categories from the server
     * @returns {Promise<Array>} Promise resolving to list of car categories
     */
    this.getCategories = function () {
      let deferred = $q.defer();
      $http
        .get(`${BASE_URL}/api/field/getCategories`)
        .then((response) => {
          deferred.resolve(response.data);
        })
        .catch((error) => {
          deferred.reject(error);
        });
      return deferred.promise;
    };

    /**
     * @description Fetch available fuel types from the server
     * @returns {Promise<Array>} Promise resolving to list of fuel types
     */
    this.getFuelTypes = function () {
      let deferred = $q.defer();
      $http
        .get(`${BASE_URL}/api/field/getFuelTypes`)
        .then((response) => {
          deferred.resolve(response.data);
        })
        .catch((error) => {
          deferred.reject(error);
        });
      return deferred.promise;
    };

    // ==========================================
    // Location Operations
    // ==========================================
    
    /**
     * @description Fetch list of available cities from the server
     * @returns {Promise<Array>} Promise resolving to list of cities
     */
    this.getCities = function () {
      let deferred = $q.defer();
      $http
        .get(`${BASE_URL}/api/field/getCities`)
        .then((response) => {
          deferred.resolve(response.data);
        })
        .catch((error) => {
          deferred.reject(error);
        });
      return deferred.promise;
    };

    /**
     * @description Get the current city based on geolocation
     * Uses LocationFactory to determine user's current location
     * @returns {Promise<Object>} Promise resolving to current city details
     */
    this.getCurrentCity = function () {
      const deferred = $q.defer();
      LocationFactory.getCityUsingGeolocation()
        .then((current) => {
          return deferred.resolve(current);
        })
        .catch((error) => {
          return deferred.reject(error);
        });
      return deferred.promise;
    };

  },
]);
