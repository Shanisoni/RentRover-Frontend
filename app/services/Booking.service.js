/**
 * @description Booking Service - Handles car booking operations and management
 * Provides methods for booking retrieval, updates, and analytics
 */
myApp.service("BookingService", [
  "$http", 
  "$q", 
  "BASE_URL",
  function($http, $q,BASE_URL) {
    // ==========================================
    // Booking Retrieval
    // ==========================================
    
    /**
     * @description Fetch all bookings with optional filtering parameters
     * @param {Object} params - Query parameters for filtering bookings
     * @returns {Promise<Object>} Promise resolving to {bookings: Array, metadata: Object}
     */
    this.getAllBookings = function(params) {
      let deferred = $q.defer();
      let config = { params };
      
      $http.get(`${BASE_URL}/api/booking/getAllBookings`, config)
        .then((response) => {
          deferred.resolve(response.data);
        })
        .catch((error) => {
          deferred.reject(error);
        });
      return deferred.promise;
    };

    /**
     * @description Get total count of bookings for analytics
     * @returns {Promise<Object>} Promise resolving to booking count statistics
     */
    this.getBookingsCount = function() {
      let deferred = $q.defer();
      
      $http.get(`${BASE_URL}/api/analysis/owner/booking-count`)
        .then((response) => {
          deferred.resolve(response.data);
        })
        .catch((error) => {
          deferred.reject(error);
        });
      return deferred.promise;
    };

    /**
     * @description Fetch all bookings for a specific car
     * @param {string} carId - ID of the car to get bookings for
     * @returns {Promise<Array>} Promise resolving to array of bookings
     */
    this.getBookingsByCarId = function(carId) {
      let deferred = $q.defer();
      
      $http.get(`${BASE_URL}/api/booking/getBookingsByCarId/${carId}`)
        .then((response) => {
          deferred.resolve(response.data);
        })
        .catch((error) => {
          deferred.reject(error);
        });
      return deferred.promise;
    };

    // ==========================================
    // Booking Updates
    // ==========================================
    
    /**
     * @description Update odometer reading for a booking
     * @param {string} bookingId - ID of the booking to update
     * @param {number} odometerValue - New odometer reading value
     * @param {string} odometerType - Type of reading ('start' or 'end')
     * @param {string} carId - ID of the car associated with the booking
     * @returns {Promise<Object>} Promise resolving to updated booking details
     */
    this.updateStartOdometer = function(bookingId, odometerValue, odometerType, carId) {
      let deferred = $q.defer();
      
      let updateObject = {
        bookingId,
        odometerValue,
        odometerType,
        carId
      };
   
      $http.patch(`${BASE_URL}/api/booking/updateBooking/${bookingId}`, updateObject)
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