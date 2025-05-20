/**
 * @description Car Service - Handles car-related operations and data management
 * Provides methods for car CRUD operations, data retrieval, and booking date management
 */
myApp.service('CarService', [
  "$http",
  "$q",
  "BASE_URL",
  function($http, $q,BASE_URL) {
    // ==========================================
    // Car Management
    // ==========================================
    
    /**
     * @description Add a new car to the system
     * @param {Object|FormData} car - Car data, either as object or FormData for image upload
     * @returns {Promise<Object>} Promise resolving to the created car details
     */
    this.addCarData = function(car) {
      let deferred = $q.defer();
      
      // Configure request for FormData if needed
      let config = {};
      if (car instanceof FormData) {
        config = {
          transformRequest: angular.identity,
          headers: {
            'Content-Type': undefined
          }
        };
      }
      
      $http.post(`${BASE_URL}/api/car/addCar`, car, config)
        .then((response) => {
          deferred.resolve(response.data);
        })
        .catch((error) => {
          deferred.reject(error);
        });
      return deferred.promise;
    };

    /**
     * @description Fetch cars with optional filtering parameters
     * @param {Object} params - Query parameters for filtering cars
     * @returns {Promise<Object>} Promise resolving to {cars: Array, metadata: Object}
     */
    this.getCars = function(params) {
      let deferred = $q.defer();
      let config = { params };
      
      $http.get(`${BASE_URL}/api/car/getCars`, config)
        .then((response) => {
          let carsData = response.data;
          console.log("carsData",carsData);
          // Add fuel pump data to each car
          carsData.cars.forEach((car) => {
            const fuelData = this.getFuelPumpData(car.fuelType);
            car.fuelPump = fuelData.icon;
            car.fuelPumpStyle = fuelData.style;
          });

          deferred.resolve(response.data);
        })
        .catch((error) => {
          deferred.reject(error);
        });
      
      return deferred.promise;
    };

    /**
     * @description Get fuel pump icon and style based on fuel type
     * @param {string} fuelType - Type of fuel ('Electric' or other)
     * @returns {Object} Object containing icon path and style properties
     * @private
     */
    this.getFuelPumpData = function(fuelType) {
      return fuelType == "Electric"
        ? {
            icon: "assets/img/electric.png",
            style: { width: "66%", opacity: 0.9 },
          }
        : { 
            icon: "assets/img/fuel.png", 
            style: {} 
          };
    };

    /**
     * @description Fetch details of a specific car
     * @param {string} id - ID of the car to fetch
     * @returns {Promise<Object>} Promise resolving to car details
     */
    this.getCar = function(id) {
      let deferred = $q.defer();
      
      $http.get(`${BASE_URL}/api/car/carId/${id}`)
        .then((response) => {
          deferred.resolve(response.data);
        })
        .catch((error) => {
          deferred.reject(error);
        });
      return deferred.promise;
    };

    /**
     * @description Update car details
     * @param {string} id - ID of the car to update
     * @param {Object} car - Updated car data
     * @returns {Promise<Object>} Promise resolving to updated car details
     */
    this.updateCar = function(id, car) {
      let deferred = $q.defer();
      
      $http.patch(`${BASE_URL}/api/car/updateCar/${id}`, car)
        .then((response) => {
          deferred.resolve(response.data);
        })
        .catch((error) => {
          deferred.reject(error);
        });
      return deferred.promise;
    };

    /**
     * @description Delete a car from the system
     * @param {string} id - ID of the car to delete
     * @returns {Promise<Object>} Promise resolving to deletion confirmation
     */
    this.deleteCar = function(id) {
      let deferred = $q.defer();
      
      $http.post(`${BASE_URL}/api/car/deleteCar/${id}`, {})
        .then((response) => {
          deferred.resolve(response.data);
        })
        .catch((error) => {
          deferred.reject(error);
        });
      return deferred.promise;
    };

    // ==========================================
    // Booking Date Management
    // ==========================================
    
    /**
     * @description Get dates when a car is already booked
     * @param {string} id - ID of the car to check
     * @returns {Promise<Array>} Promise resolving to array of booked dates
     */
    this.getBookedDates = function(id) {
      let deferred = $q.defer();
      
      $http.get(`${BASE_URL}/api/booking/bookedDates/${id}`)
        .then((response) => {
          deferred.resolve(response.data);
        })
        .catch((error) => {
          deferred.reject(error);
        });
      return deferred.promise;
    };
  }
]);