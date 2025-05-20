/**
 * @description User Factory - Manages user data validation and preparation
 * Provides comprehensive validation for user signup and login processes
 * Uses prototype pattern for efficient method sharing across user instances
 * @module UserFactory
 */
myApp.factory('UserFactory', ['$q', 'ToastService', function($q, ToastService) {
  let currentUser = null;

  /**
   * User constructor function - Creates a new user instance with validation methods
   */
  function User(userData) {
    // Initialize with empty object if no data provided
    userData = userData || {};
    
    // Basic user properties needed for authentication
    this.firstName = userData.firstName || '';
    this.lastName = userData.lastName || '';
    this.email = userData.email || '';
    this.password = userData.password || '';
    this.confirmPassword = userData.confirmPassword || '';
    this.phone = userData.phone || '';
    this.role = userData.role || 'user'; // default role
  }
  
  // ==========================================
  // Validation Methods
  // ==========================================
  
  /**
   * Validate email format using regex
   * @returns {Object} Validation result
   * @returns {boolean} result.isValid - Whether the email is valid
   * @returns {string} result.message - Validation message
   */
  User.prototype.validateEmail = function() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!this.email) {
      return {
        isValid: false,
        message: 'Email is required'
      };
    }
    
    if (!emailRegex.test(this.email)) {
      return {
        isValid: false,
        message: 'Please enter a valid email address'
      };
    }
    
    return {
      isValid: true,
      message: 'Email is valid'
    };
  };
  
  /**
   * Validate password strength and complexity
  */
  User.prototype.validatePassword = function() {
    if (!this.password) {
      return {
        isValid: false,
        message: 'Password is required'
      };
    }
    
    if (this.password.length < 8) {
      return {
        isValid: false,
        message: 'Password must be at least 8 characters long'
      };
    }
    
    // Check for password complexity
    const hasUppercase = /[A-Z]/.test(this.password);
    const hasLowercase = /[a-z]/.test(this.password);
    const hasNumber = /[0-9]/.test(this.password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(this.password);
    
    if (!(hasUppercase && hasLowercase && hasNumber)) {
      return {
        isValid: false,
        message: 'Password must include at least one uppercase letter, one lowercase letter, and one number'
      };
    }
    
    // Suggest adding a special character if not present
    if (!hasSpecial) {
      return {
        isValid: true,
        message: 'Password is valid, but adding a special character would make it stronger',
        suggestion: true
      };
    }
    
    return {
      isValid: true,
      message: 'Password is strong'
    };
  };
  
  /**
   * Validate password confirmation matches password
   */
  User.prototype.validatePasswordMatch = function() {
    if (!this.confirmPassword) {
      return {
        isValid: false,
        message: 'Please confirm your password'
      };
    }
    
    if (this.password !== this.confirmPassword) {
      return {
        isValid: false,
        message: 'Passwords do not match'
      };
    }
    
    return {
      isValid: true,
      message: 'Passwords match'
    };
  };
  
  /**
   * Validate phone number format
    * Accepts formats: +91 9876543210, 9876543210, 987-654-3210
   */
  User.prototype.validatePhone = function() {
    const phoneRegex = /^(\+\d{1,3}\s?)?\d{10}$|^\d{3}[-.]?\d{3}[-.]?\d{4}$/;
    
    if (!this.phone) {
      return {
        isValid: false,
        message: 'Phone number is required'
      };
    }
    
    if (!phoneRegex.test(this.phone)) {
      return {
        isValid: false,
        message: 'Please enter a valid phone number'
      };
    }
    
    return {
      isValid: true,
      message: 'Phone number is valid'
    };
  };
  
  /**
   * Validate user's first and last name
   * Checks for minimum length and valid characters
   * @returns {Object} Validation result
   * @returns {boolean} result.isValid - Whether the name is valid
   * @returns {string} result.message - Validation message
   */
  User.prototype.validateName = function() {
    if (!this.firstName || !this.lastName) {
      return {
        isValid: false,
        message: 'Both first name and last name are required'
      };
    }
    
    if (this.firstName.length < 2 || this.lastName.length < 2) {
      return {
        isValid: false,
        message: 'Names must be at least 2 characters long'
      };
    }
    
    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[A-Za-z\s\-']+$/;
    if (!nameRegex.test(this.firstName) || !nameRegex.test(this.lastName)) {
      return {
        isValid: false,
        message: 'Names should contain only letters, spaces, apostrophes, and hyphens'
      };
    }
    
    return {
      isValid: true,
      message: 'Name is valid'
    };
  };
  
  // ==========================================
  // Validation Aggregators
  // ==========================================
  
  /**
   * Validate all required fields for login
   * @returns {Object} Validation results
   * @returns {boolean} results.isValid - Whether all validations passed
   * @returns {Object} results.validations - Individual validation results
   * @returns {string} results.message - Overall validation message
   */
  User.prototype.validateLogin = function() {
    const validations = {
      email: this.validateEmail(),
      password: {
        isValid: !!this.password,
        message: this.password ? 'Password provided' : 'Password is required'
      }
    };
    
    const isValid = Object.values(validations).every(v => v.isValid);
    
    return {
      isValid: isValid,
      validations: validations,
      message: isValid ? 'Login data is valid' : 'Invalid login data'
    };
  };
  
  /**
   * Validate all required fields for signup
   * @returns {Object} Validation results
   * @returns {boolean} results.isValid - Whether all validations passed
   * @returns {Object} results.validations - Individual validation results
   * @returns {string} results.message - Overall validation message
   */
  User.prototype.validateSignup = function() {
    const validations = {
      email: this.validateEmail(),
      name: this.validateName(),
      password: this.validatePassword(),
      passwordMatch: this.validatePasswordMatch(),
      phone: this.validatePhone()
    };
    
    const isValid = Object.values(validations).every(v => v.isValid);
    
    return {
      isValid: isValid,
      validations: validations,
      message: isValid ? 'Signup data is valid' : 'Invalid signup data'
    };
  };
  
  /**
   * Get user's full name
   * @returns {string} Concatenated first and last name
   */
  User.prototype.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
  };

  // ==========================================
  // Factory Helper Functions
  // ==========================================
  
  /**
   * Prepare user data for signup API call
   * Validates all fields and formats data for API
   * @param {Object} data - Raw user input data
   * @returns {Object} Prepared user object and validation status
   * @returns {boolean} result.isValid - Whether the data is valid
   * @returns {Object} [result.user] - Prepared user object if valid
   * @returns {string} [result.message] - Error message if invalid
   * @returns {Object} [result.validation] - Validation details if invalid
   */
  const prepareUserForSignup = function(data) {
    const user = new User(data);
    const validation = user.validateSignup();
    
    if (!validation.isValid) {
      return {
        isValid: false,
        message: validation.message || 'Invalid signup data',
        validation: validation
      };
    }
    
    // Set verification status based on role
    if (user.role === "user") {
      user.verified = true;
    } else if (user.role === "owner") {
      user.verified = false;
    }
    
    // Set full name
    user.name = user.getFullName();
    
    // Remove fields not needed for API
    const preparedUser = { ...user };
    delete preparedUser.confirmPassword;
    delete preparedUser.firstName;
    delete preparedUser.lastName;
    
    return {
      isValid: true,
      user: preparedUser
    };
  };
  
  /**
   * Validate login credentials
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Object} Validation result
   * @returns {boolean} result.isValid - Whether credentials are valid
   * @returns {string} result.message - Validation message
   * @returns {Object} result.validation - Detailed validation results
   */
  const validateLoginCredentials = function(credentials) {
    const user = new User(credentials);
    const validation = user.validateLogin();
    
    return {
      isValid: validation.isValid,
      message: validation.message,
      validation: validation
    };
  };
  
  // Return factory API
  return {
    /**
     * Create a new user instance
     * @param {Object} data - User data
     * @returns {User} New user instance
     */
    createUser: function(data) {
      return new User(data);
    },
    
    /**
     * Validate login credentials
     * @type {Function}
     */
    validateLogin: validateLoginCredentials,
    
    /**
     * Prepare user data for signup
     * @type {Function}
     */
    prepareForSignup: prepareUserForSignup
  };
}]);