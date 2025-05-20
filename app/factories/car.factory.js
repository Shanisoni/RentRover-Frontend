/**
 * CarFactory - Manages car data validation and creation
 * Provides methods for validating car properties and creating car objects
 */
myApp.factory('CarFactory', [
  '$q', 
  'CITIES', 
  'FUEL_TYPES', 
  'CATEGORIES',
  'FEATURES', 
  function($q, CITIES, FUEL_TYPES, CATEGORIES, FEATURES) {
    // ==========================================
    // Validation Rules
    // ==========================================
    
    /**
     * Constants used for validation
     */
    const VALIDATION_RULES = {
      MIN_PRICE: 1,                                             // Minimum price in dollars
      MAX_PRICE: 50000,                                         // Maximum price in dollars
      LICENSE_PLATE_REGEX: /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/,  // Format: MH02AB1234
      ALLOWED_FUEL_TYPES: FUEL_TYPES,                           // List of valid fuel types
      ALLOWED_CATEGORIES: CATEGORIES,                           // List of valid car categories
      ALLOWED_CITIES: CITIES,                                   // List of available service cities
      MIN_FINE_PERCENTAGE: 0,                                   // Minimum fine percentage
      MAX_FINE_PERCENTAGE: 100                                  // Maximum fine percentage
    };
    
    // ==========================================
    // Car Constructor
    // ==========================================
    
    /**
     * Car constructor - Creates a new car with validation
     * @param {Object} data - Car data to initialize with
     */
    function Car(data) {
      // Use empty object if no data provided
      data = data || {};
      
      // Initialize and validate each property
      this._id = data._id || null;
      this.carName = this.validateCarName(data.carName);
      this.numberPlate = this.validateNumberPlate(data.numberPlate);
      this.category = this.validateCategory(data.category);
      this.fuelType = this.validateFuelType(data.fuelType);
      this.basePrice = this.validatePrice(data.basePrice, 'Base price');
      this.pricePerKm = this.validatePrice(data.pricePerKm, 'Price per km');
      this.outStationCharges = this.validatePrice(data.outStationCharges, 'Outstation charges');
      this.travelled = this.validateTravelled(data.travelled);
      this.city = this.validateCity(data.city);
      this.selectedFeatures = this.validateSelectedFeatures(data.selectedFeatures);
      this.finePercentage = this.validateFinePercentage(data.finePercentage);
      this.imageUrl = data.imageUrl || null;
      this.image = data.image || null;
      this.isDisabled = data.isDisabled || false;
    }
    
    // ==========================================
    // Validation Methods
    // ==========================================
    
   
      /**
       * Validates car name
       * @param {string} name - Car name to validate
       * @returns {string} Validated car name
       * @throws {Error} If validation fails
       */
      Car.prototype.validateCarName = function(name) {
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
          throw new Error('Car name is required');
        }
        if (name.trim().length < 3) {
          throw new Error('Car name must be at least 3 characters long');
        }
        return name.trim();
      },
      
      /**
       * Validates license plate number format
       * @param {string} plate - License plate to validate
       * @returns {string} Validated license plate
       * @throws {Error} If validation fails
       */
      Car.prototype.validateNumberPlate = function(plate) {
        if (!plate || typeof plate !== 'string' || plate.trim().length === 0) {
          throw new Error('License plate number is required');
        }
        
        const cleanPlate = plate.trim().toUpperCase();
        if (!VALIDATION_RULES.LICENSE_PLATE_REGEX.test(cleanPlate)) {
          throw new Error('Invalid license plate format. Example: MH02AB1234');
        }
        
        return cleanPlate;
      },
      
      /**
       * Validates car category
       * @param {string} category - Category to validate
       * @returns {string} Validated category
       * @throws {Error} If validation fails
       */
      Car.prototype.validateCategory = function(category) {
        if (!category || !VALIDATION_RULES.ALLOWED_CATEGORIES.includes(category)) {
          throw new Error(`Invalid category. Must be one of: ${VALIDATION_RULES.ALLOWED_CATEGORIES.join(', ')}`);
        }
        return category;
      },
      
      /**
       * Validates fuel type
       * @param {string} fuelType - Fuel type to validate
       * @returns {string} Validated fuel type
       * @throws {Error} If validation fails
       */
      Car.prototype.validateFuelType = function(fuelType) {
        if (!fuelType || !VALIDATION_RULES.ALLOWED_FUEL_TYPES.includes(fuelType)) {
          throw new Error(`Invalid fuel type. Must be one of: ${VALIDATION_RULES.ALLOWED_FUEL_TYPES.join(', ')}`);
        }
        return fuelType;
      },
      
      /**
       * Validates price fields
       * @param {number|string} price - Price to validate
       * @param {string} fieldName - Name of price field for error messages
       * @returns {number} Validated price
       * @throws {Error} If validation fails
       */
      Car.prototype.validatePrice = function(price, fieldName) {
        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice < VALIDATION_RULES.MIN_PRICE) {
          throw new Error(`${fieldName} must be at least ${VALIDATION_RULES.MIN_PRICE}`);
        }
        
        if (numPrice > VALIDATION_RULES.MAX_PRICE) {
          throw new Error(`${fieldName} cannot exceed ${VALIDATION_RULES.MAX_PRICE}`);
        }
        
        return numPrice;
      },
      
      /**
       * Validates fine percentage
       * @param {number|string} percentage - Fine percentage to validate
       * @returns {number} Validated fine percentage (defaults to 50%)
       * @throws {Error} If validation fails
       */
      Car.prototype.validateFinePercentage = function(percentage) {
        const numPercentage = parseFloat(percentage);
        if (isNaN(numPercentage)) {
          // Default value if not provided
          return 50;
        }
        
        if (numPercentage < VALIDATION_RULES.MIN_FINE_PERCENTAGE) {
          throw new Error(`Fine percentage must be at least ${VALIDATION_RULES.MIN_FINE_PERCENTAGE}`);
        }
        
        if (numPercentage > VALIDATION_RULES.MAX_FINE_PERCENTAGE) {
          throw new Error(`Fine percentage cannot exceed ${VALIDATION_RULES.MAX_FINE_PERCENTAGE}`);
        }
        
        return numPercentage;
      },
      
      /**
       * Validates kilometers travelled
       * @param {number|string} travelled - Kilometers travelled to validate
       * @returns {number} Validated traveled kilometers
       * @throws {Error} If validation fails
       */
      Car.prototype.validateTravelled = function(travelled) {
        const numTravelled = parseInt(travelled, 10);
        
        if (isNaN(numTravelled) || numTravelled < 0) {
          throw new Error('Kilometers travelled must be 0 or greater');
        }
        return numTravelled;
      },
      
      /**
       * Validates city
       * @param {string} city - City to validate
       * @returns {string} Validated city
       * @throws {Error} If validation fails
       */
      Car.prototype.validateCity = function(city) {
        if (!city || !VALIDATION_RULES.ALLOWED_CITIES.includes(city)) {
          throw new Error(`Invalid city. Must be one of: ${VALIDATION_RULES.ALLOWED_CITIES.join(', ')}`);
        }
        return city;
      },
      
      /**
       * Validates car features list
       * @param {Array} features - List of features to validate
       * @returns {Array} Validated features list
       * @throws {Error} If validation fails
       */
      Car.prototype.validateSelectedFeatures = function(selectedFeatures) {
        if (!selectedFeatures || !Array.isArray(selectedFeatures) || selectedFeatures.length === 0) {
          throw new Error('At least one feature is required');
        }
        
        if (selectedFeatures.length > 3) {
          throw new Error('Maximum 3 features allowed');
        }
        
        return selectedFeatures;
      },
      
      /**
       * Validates all car properties together
       * Collects errors instead of throwing
       * @returns {Object} Validation result with errors list
       * @returns {boolean} result.isValid - Whether all validations passed
       * @returns {Array} result.errors - List of error messages
       * @returns {string} result.message - Combined error message or success message
       */
      Car.prototype.validate = function() {
        const errors = [];
        
        // Try validating each field, collecting errors
        try { this.validateCarName(this.carName); } 
        catch (e) { errors.push(e.message); }
        
        try { this.validateNumberPlate(this.numberPlate); } 
        catch (e) { errors.push(e.message); }
        
        try { this.validateCategory(this.category); } 
        catch (e) { errors.push(e.message); }
        
        try { this.validateFuelType(this.fuelType); } 
        catch (e) { errors.push(e.message); }
        
        try { this.validatePrice(this.basePrice, 'Base price'); } 
        catch (e) { errors.push(e.message); }
        
        try { this.validatePrice(this.pricePerKm, 'Price per km'); } 
        catch (e) { errors.push(e.message); }
        
        try { this.validatePrice(this.outStationCharges, 'Outstation charges'); } 
        catch (e) { errors.push(e.message); }
        
        try { this.validateFinePercentage(this.finePercentage); } 
        catch (e) { errors.push(e.message); }
        
        try { this.validateTravelled(this.travelled); } 
        catch (e) { errors.push(e.message); }
        
        try { this.validateCity(this.city); } 
        catch (e) { errors.push(e.message); }
        
        try { this.validateSelectedFeatures(this.selectedFeatures); } 
        catch (e) { errors.push(e.message); }
        
        // Check if image exists
        if (!this.image && !this.imageUrl) {
          errors.push('Car image is required');
        }
        
        return {
          isValid: errors.length === 0,
          errors: errors,
          message: errors.length > 0 ? errors.join('. ') : 'Car data is valid'
        };
      }
   
    
    // ==========================================
    // Factory Public API
    // ==========================================
    
    return {
      /**
       * Creates a new car instance with validation
       * @param {Object} data - Car data to create from
       * @returns {Promise<Car>} Promise resolving to car instance
       */
      createCar: function(data) {
        const deferred = $q.defer();
        try {
          const car = new Car(data);
          deferred.resolve(car);
        } catch (error) {
          deferred.reject(error);
        }
        return deferred.promise;
      },
      
      /**
       * Validates car data without creating a car instance
       * @param {Object} data - Car data to validate
       * @returns {Object} Validation result object
       * @returns {boolean} result.isValid - Whether validation passed
       * @returns {Array} result.errors - List of validation errors
       * @returns {string} result.message - Combined error message
       */
      validateCarData: function(data) {
        try {
          const car = new Car(data);
          return car.validate();
        } catch (error) {
          return {
            isValid: false,
            errors: [error.message],
            message: error.message
          };
        }
      }
    };
  }
]);