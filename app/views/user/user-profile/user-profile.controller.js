/**
 * @description User Profile Controller - Manages user profile data and authentication
 * Handles profile data fetching and user logout functionality
 */
myApp.controller("userProfileController", [
  "$scope",
  "AuthService",
  "ToastService",
  "$q",
  function ($scope, AuthService, ToastService, $q) {
    // ==========================================
    // State Management
    // ==========================================
    
    /**
     * @type {Object}
     * @description Holds the user profile data after fetching
     */
    $scope.user = null;

    // ==========================================
    // Initialization
    // ==========================================
    
    /**
     * @description Initialize the user profile by fetching user data
     * Sets up the initial state of the profile view
     */
    $scope.init = function() {
      getUserProfile()
        .then(function(user) {
          $scope.user = user;
        })
        .catch(function(err) {
          ToastService.error("Error fetching user profile", 3000);
        });
    };

    // ==========================================
    // Data Operations
    // ==========================================
    
    /**
     * @description Fetch the user profile data from the server
     * @private
     * @returns {Promise} A promise that resolves with the user profile data
     */
    let getUserProfile = function() {
      let deferred = $q.defer();
      
      AuthService.userProfile()
        .then(function(user) {
          deferred.resolve(user);
        })
        .catch(function(err) {
          deferred.reject(err);
        });
        
      return deferred.promise;
    };

    // ==========================================
    // Authentication
    // ==========================================
    
    /**
     * @description Log out the current user and redirect to authentication page
     * Clears session data and navigates user away from protected routes
     */
    $scope.logout = function() {
      AuthService.logout();
    };

    // Initialize controller
    $scope.init();
  }
]);