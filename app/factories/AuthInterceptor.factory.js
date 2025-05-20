/**
 * AuthInterceptor Factory - Handles authentication token management for HTTP requests
 * Automatically adds JWT authorization headers to outgoing HTTP requests
 */
myApp.factory('AuthInterceptor', ['$q', function($q) {
  return {
    /**
     * Intercepts outgoing HTTP requests and adds auth token
     * @param {Object} config - The HTTP request configuration object
     * @returns {Object} Modified config with authorization header
     */
    request: function(config) {
      // Get authentication token from session storage
      const token = sessionStorage.getItem('token');
      
      // If token exists, add it to the Authorization header
      if (token) {
        config.headers['Authorization'] = 'Bearer ' + token;
      }
      
      return config;
    },   
  };
}]);
