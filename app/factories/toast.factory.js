/**
 * @description Toast Service Factory - Manages toast notifications in the application
 * Provides methods for displaying error, success, and info messages using Toastify
 * @module ToastService
 */
myApp.factory("ToastService", [function() {
  // Initialize factory object
  let factory = {};

  /**
   * Default configuration for all toast notifications
  */
  const defaultOptions = {
    close: true,
    gravity: 'top',
    position: 'right',
    stopOnFocus: true
  };

  /**
   * Display an error toast notification
   * @param {string} message - The error message to display
   * @param {number} time - Duration in milliseconds to show the toast
   */
  factory.error = function(message, time) {
    Toastify({
      ...defaultOptions,
      duration: time,
      text: message,
      backgroundColor: '#f44336' // Material Design red
    }).showToast();
  };

  /**
   * Display a success toast notification
   * @param {string} message - The success message to display
   * @param {number} time - Duration in milliseconds to show the toast
   */
  factory.success = function(message, time) {
    Toastify({
      ...defaultOptions,
      duration: time,
      text: message,
      backgroundColor: '#4caf50' // Material Design green
    }).showToast();
  };

  /**
   * Display an info toast notification
   * @param {string} message - The info message to display
   * @param {number} time - Duration in milliseconds to show the toast
   */
  factory.info = function(message, time) {
    Toastify({
      ...defaultOptions,
      duration: time,
      text: message,
      backgroundColor: '#F0AD4E' 
    }).showToast();
  };

  return factory;
}]);
