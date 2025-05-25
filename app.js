/**
 * @description Main application module configuration
 * Initializes the Angular application with required dependencies and HTTP interceptor setup
 */


/**
 * @type {Object}
 * @description Angular module instance for the main application
 * @requires ui.router - For client-side routing
 * @requires ui.bootstrap - For Bootstrap UI components
 */
const myApp = angular.module('myApp', [
  'ui.router',    // Handles client-side routing
  'ui.bootstrap'  // Bootstrap UI components
]);


/**
 * @description Configure HTTP interceptors for the application
 * Sets up the AuthInterceptor to handle authentication for all HTTP requests
 */
myApp.config(['$httpProvider', function($httpProvider) {

  $httpProvider.interceptors.push('AuthInterceptor');
}]);



myApp.controller('MainController', ['$scope', 'AuthService', 'ToastService', 
function($scope, AuthService, ToastService) {
  
  let socket = null;
  let currentUser = null;


  const initSocket = function(user) {
    if (!socket) {
      socket = io("https://ezycar-hosted-1.onrender.com");
      currentUser = user;
      
      socket.emit('joinUserRoom', user._id);
      
      // Listen for new bid notifications
      socket.on('newBid', function(data) {
        // Only show notification if it's for the current user
        if (data.userId === currentUser._id) {
          ToastService.success(data.message || 'Bid placed successfully!', 3000);
        }
      });
      
      // Handle connection error
      socket.on('connect_error', function(error) {
        console.error('Socket connection error:', error);
      });
    }
  };



  
  // Initialize on app start
  $scope.init = function() {
    AuthService.userProfile().then((user) => {
      if (user) {
        initSocket(user);
      }
    })
    .catch((error) => {
      console.log("Please login");
    });
  };

  $scope.init();
}]);