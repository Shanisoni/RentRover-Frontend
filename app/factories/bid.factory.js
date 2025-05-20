/**
 * BidFactory - Manages bid validation and creation
 * Provides methods for validating bid properties, creating bid objects,
 * and utility functions for bid-related operations
 */
myApp.factory('BidFactory', ['$q', function($q) {
  // ==========================================
  // Validation Rules
  // ==========================================
  
  /**
   * Constants used for validation
   */
  const VALIDATION_RULES = {
    TRIP_TYPES: ['inCity', 'outStation'] // Valid trip types
  };
  
  // ==========================================
  // Bid Constructor
  // ==========================================
  
  /**
   * Bid constructor - Creates a new bid with validation
   */
  function Bid(data) {
    // Use empty object if no data provided
    data = data || {};
    
    // Initialize and validate each property
    this._id = data._id || null;
    this.carId = this.validateCarId(data.carId);
    this.bidAmount = this.validateBidAmount(data.bidAmount, data.basePrice);
    this.startDate = this.validateStartDate(data.startDate);
    this.endDate = this.validateEndDate(data.endDate, data.startDate);
    this.status = data.status || 'pending';
    this.tripType = this.validateTripType(data.tripType);
    
    // Calculate rental duration in days
    if (this.startDate && this.endDate) {
      this.days = this.calculateDays(this.startDate, this.endDate);
    }
  }
  
  // ==========================================
  // Validation Methods
  // ==========================================
  
    /**
     * Validates car ID
     * @param {string} carId - Car ID to validate
     * @returns {string} Validated car ID
     * @throws {Error} If validation fails
     */
    Bid.prototype.validateCarId = function(carId) {
      if (!carId) {
        throw new Error('Car ID is required');
      }
      return carId;
    },
    
    /**
     * Validates bid amount
     * @param {number|string} amount - Bid amount to validate
     * @param {number|string} basePrice - Car's base price for comparison
     * @returns {number} Validated bid amount
     * @throws {Error} If validation fails
     */
    Bid.prototype.validateBidAmount = function(amount, basePrice) {
      if (!amount) {
        throw new Error('Bid amount is required');
      }
      
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount)) {
        throw new Error('Bid amount must be a number');
      }
      
      // Ensure bid is higher than the base price
      if (basePrice && numAmount <= parseFloat(basePrice)) {
        throw new Error(`Bid amount must be greater than the base price of ${basePrice}`);
      }
      
      return numAmount;
    },
    
    /**
     * Validates start date for a booking
     * @param {string|Date} date - Start date to validate
     * @returns {string} Validated start date
     * @throws {Error} If validation fails
     */
    Bid.prototype.validateStartDate = function(date) {
      if (!date) {
        throw new Error('Start date is required');
      }
      
      const dateObj = new Date(date);
      if (dateObj.toString() === 'Invalid Date') {
        throw new Error('Start date is invalid');
      }
      
      // Set time to beginning of day for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const startDate = new Date(dateObj);
      startDate.setHours(0, 0, 0, 0);
      
      // Prevent past dates
      if (startDate < today) {
        throw new Error('Start date cannot be in the past');
      }
      
      return date;
    },
    
    /**
     * Validates end date for a booking
     * @param {string|Date} endDate - End date to validate
     * @param {string|Date} startDate - Start date for comparison
     * @returns {string} Validated end date
     * @throws {Error} If validation fails
     */
    Bid.prototype.validateEndDate = function(endDate, startDate) {
      if (!endDate) {
        throw new Error('End date is required');
      }
      
      const endDateObj = new Date(endDate);
      if (endDateObj.toString() === 'Invalid Date') {
        throw new Error('End date is invalid');
      }
      
      // Check that end date is after start date
      if (startDate) {
        const startDateObj = new Date(startDate);
        startDateObj.setHours(0, 0, 0, 0);
        endDateObj.setHours(0, 0, 0, 0);
        
        if (endDateObj < startDateObj) {
          throw new Error('End date must be after start date');
        }
      }
      
      return endDate;
    },
    
    /**
     * Validates trip type
     * @param {string} tripType - Trip type to validate
     * @returns {string} Validated trip type or default value
     * @throws {Error} If validation fails
     */
    Bid.prototype.validateTripType = function(tripType) {
      
      if (!VALIDATION_RULES.TRIP_TYPES.includes(tripType)) {
        throw new Error(`Invalid trip type. Must be one of: ${VALIDATION_RULES.TRIP_TYPES.join(', ')}`);
      }
      
      return tripType;
    },
    
    /**
     * Calculates number of days between two dates
     * @param {string|Date} startDate - Start date
     * @param {string|Date} endDate - End date
     * @returns {number} Number of days
     */
    Bid.prototype.calculateDays = function(startDate, endDate) {
      if (!startDate || !endDate) {
        return 0;
      }
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))+1;
    },
    
    /**
     * Validates all bid properties together
     * Collects errors instead of throwing
     * @returns {Object} Validation result with errors list
     * @returns {boolean} result.isValid - Whether all validations passed
     * @returns {Array} result.errors - List of error messages
     * @returns {string} result.message - Combined error message or success message
     */
    Bid.prototype.validate = function() {
      const errors = [];
      
      // Try validating each field, collecting errors
      try { this.validateCarId(this.carId); } 
      catch (e) { errors.push(e.message); }
      
      try { this.validateBidAmount(this.bidAmount, this.basePrice); } 
      catch (e) { errors.push(e.message); }
      
      try { this.validateStartDate(this.startDate); } 
      catch (e) { errors.push(e.message); }
      
      try { this.validateEndDate(this.endDate, this.startDate); } 
      catch (e) { errors.push(e.message); }
      
      try { this.validateTripType(this.tripType); } 
      catch (e) { errors.push(e.message); }
      
      return {
        isValid: errors.length === 0,
        errors: errors,
        message: errors.length > 0 ? errors.join('. ') : 'Bid data is valid'
    };
  };
  
  // ==========================================
  // Factory Public API
  // ==========================================
  
  return {
    /**
     * Creates a new bid instance with validation
     */
    createBid: function(data) {
      const deferred = $q.defer();
      try {
        const bid = new Bid(data);
        deferred.resolve(bid);
      } catch (error) {
        deferred.reject(error);
      }
      return deferred.promise;
    },
    
    /**
     * Validates bid data without creating a bid instance
     */
    validateBidData: function(data) {
      try {
        const bid = new Bid(data);
        return bid.validate();
      } catch (error) {
        return {
          isValid: false,
          errors: [error.message],
          message: error.message
        };
      }
    },
    
    /**
     * Calculate days between two dates (utility function)
     * @param {string|Date} startDate - Start date
     * @param {string|Date} endDate - End date
     * @returns {number} Number of days between the dates
     */
    calculateDays: function(startDate, endDate) {
      if (!startDate || !endDate) {
        return 0;
      }
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    


    recommendBids: function (bids) {
    
      function latestNonConflict(i) {
          let low = 0, high = i - 1;
          while (low <= high) {
              const mid = Math.floor((low + high) / 2);
              if (new Date(bids[mid].endDate) < new Date(bids[i].startDate)) {
                  if (mid + 1 <= high && new Date(bids[mid + 1].endDate) < new Date(bids[i].startDate)) {
                      low = mid + 1;
                  } else {
                      return mid;
                  }
              } else {
                  high = mid - 1;
              }
          }
          return -1;
      }
    
      const n = bids?.length;
      if(n === 0) return {
        maxProfit: 0,
        selectedBids: []
      };
      const dp = new Array(n).fill(0);
      const path = new Array(n).fill(null);
    
      const getProfit = (bid) => {
          const start = new Date(bid.startDate);
          const end = new Date(bid.endDate);
          const durationDays = (end - start) / (1000 * 60 * 60 * 24)+1;
          let profit = bid.bidAmount * durationDays;
          if(bid.tripType === 'outStation') profit += (bid.car.outStationCharges * durationDays);
          return profit;
      };
    
      dp[0] = getProfit(bids[0]);
      path[0] = [0];
    
      for (let i = 1; i < n; i++) {
          const inclProfit = getProfit(bids[i]);
          console.log("inclProfit",inclProfit);
          const l = latestNonConflict(i);
          const incl = inclProfit + (l !== -1 ? dp[l] : 0);
    
          if (incl > dp[i - 1]) {
              dp[i] = incl;
              path[i] = l !== -1 ? [...path[l], i] : [i];
          } else {
              dp[i] = dp[i - 1];
              path[i] = [...path[i - 1]];
          }
      }
    
      const selectedIndices = path[n - 1];
      const selectedBids = selectedIndices.map(i => bids[i]);
    
      return {
          maxProfit: dp[n - 1],
          selectedBids
      };
    }
    
  
  };
}]);