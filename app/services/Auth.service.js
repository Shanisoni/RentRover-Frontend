/**
 * @description Authentication Service - Manages user authentication and authorization
 * Provides methods for user registration, login, profile management, and role-based access control
 */
myApp.service("AuthService", [
  "$q", 
  "$state",
  "$http",
  "ToastService", 
  "BASE_URL",
  function($q, $state, $http, ToastService,BASE_URL) {
    // ==========================================
    // User Authentication
    // ==========================================
    
    /**
     * @description Register a new user in the system
     * @param {Object} user - User registration data
     * @param {string} user.email - User's email address
     * @param {string} user.password - User's password
     * @param {string} user.name - User's full name
     * @param {string} user.role - User's role (e.g., 'owner', 'renter')
     * @returns {Promise<Object>} Promise resolving to registration response
     */
    this.registerUser = function(user) {
      let deferred = $q.defer();
      
      $http.post(`${BASE_URL}/api/auth/signup`, user)
        .then((response) => {
          deferred.resolve(response);
        })
        .catch((error) => {
          deferred.reject(error);
        });
      return deferred.promise;
    };

    /**
     * @description Authenticate user and return JWT token
     * @param {Object} loginData - User login credentials
     * @param {string} loginData.email - User's email address
     * @param {string} loginData.password - User's password
     * @returns {Promise<Object>} Promise resolving to login response with auth token
     */
    this.loginUser = function(loginData) {
      let deferred = $q.defer();
      
      $http.post(`${BASE_URL}/api/auth/login`, loginData)
        .then((response) => {
          // Return the complete response data without storing token
          deferred.resolve(response.data);
        })
        .catch((error) => {
          deferred.reject(error);
        });
      return deferred.promise;
    };

    // ==========================================
    // User Profile and Authorization
    // ==========================================
    
    /**
     * @description Fetch the current user's profile data
     * @returns {Promise<Object>} Promise resolving to user profile data
     */
    this.userProfile = function() {
      let deferred = $q.defer();
      
      $http.get(`${BASE_URL}/api/auth/profile`)
        .then((response) => {
          deferred.resolve(response.data.userData);
        })
        .catch((error) => {
          deferred.reject(error);
        });
      return deferred.promise;
    };

    /**
     * @description Check if user has required role and handle authorization
     * @param {string} requiredRole - Role required for access (e.g., 'owner', 'renter')
     * @returns {Promise<void>} Promise resolving if authorized, rejecting if not
     */
    this.requireRole = function(requiredRole) {
      const deferred = $q.defer();
      
      $http.get(`${BASE_URL}/api/auth/profile`)
        .then((response) => {
          let user = response.data.userData;
          if (user.role === requiredRole) {
            deferred.resolve();
          } else {
            throw new Error("Unauthorized");
          }
        })
        .catch((error) => {
          ToastService.error(error.data?.message || "Unauthorized", 3000);
          $state.go("auth");
          deferred.reject();
        });
      return deferred.promise;
    };

    /**
     * @description Log out the current user by clearing token and redirecting
     * Removes JWT token from sessionStorage and redirects to auth page
     */
    this.logout = function() {
      // Clear token from sessionStorage
      sessionStorage.removeItem('token');
      
      // Display logout success message
      ToastService.success("Logged out successfully", 3000);
      
      // Redirect to auth page
      $state.go("auth");
    };
  }
]);
