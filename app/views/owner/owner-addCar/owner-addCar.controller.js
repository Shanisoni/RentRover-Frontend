/**
 * @description Add Car Controller - Manages the car addition process for owners
 * Handles car data collection, validation, and submission with image upload
 */
myApp.controller("AddCar", [
  "$scope",
  "ToastService",
  "CITIES", 
  "CATEGORIES",
  "FEATURES",
  "FUEL_TYPES",
  "CarService",
  "CarFactory",
  function (
    $scope,
    ToastService,
    CITIES,
    CATEGORIES,
    FEATURES,
    FUEL_TYPES,
    CarService,
    CarFactory
  ) {
    // ==========================================
    // State Management
    // ==========================================
    
    /**
     * @type {Array}
     * @description Available car categories from constants
     */
    $scope.categories = CATEGORIES;

    /**
     * @type {Array}
     * @description List of all possible features a car can have
     */
    $scope.availableFeatures = FEATURES;

    /**
     * @type {Array}
     * @description Currently selected features for the car (max 3)
     */
    $scope.selectedFeatures = [];

    /**
     * @type {Array}
     * @description Available fuel types from constants
     */
    $scope.fuelTypes = FUEL_TYPES;

    /**
     * @type {Array}
     * @description Available cities from constants
     */
    $scope.cities = CITIES;

    /**
     * @type {Object}
     * @description Car data object to be submitted
     */
    $scope.car = {};

    /**
     * @type {string}
     * @description Regex pattern for numeric validation
     */
    $scope.onlyNumbers = "/^[1-9][0-9]*$/";

    $scope.disabled = false; // Disable button state

    // ==========================================
    // Feature Management
    // ==========================================
    
    /**
     * @description Toggle a feature selection for the car
     * Maintains a maximum of 3 selected features
     * @param {string} feature - The feature to toggle
     */
    $scope.toggleFeature = function (feature) {
      let idx = $scope.selectedFeatures.indexOf(feature);

      // Is currently selected
      if (idx > -1) {
        $scope.selectedFeatures.splice(idx, 1);
      }
      // Is newly selected
      else if ($scope.selectedFeatures.length < 3) {
        $scope.selectedFeatures.push(feature);
      }
    };

    // ==========================================
    // Image Handling
    // ==========================================
    
    /**
     * @description Handle car image upload
     * Stores the selected file in the car object
     * @param {HTMLElement} element - The file input element
     */
    $scope.uploadImage = function (element) {
      $scope.car.image = element.files[0];
    };

    // ==========================================
    // Form Submission
    // ==========================================
    
    /**
     * @description Handle car data submission
     * Validates car data, creates FormData with image,
     * and submits to the server
     */
    $scope.addCar = function () {
      $scope.disabled = true;
      $scope.car.selectedFeatures = ($scope.selectedFeatures);
      
      // Basic validation
      let validationResult = CarFactory.validateCarData($scope.car);
      if (!validationResult.isValid) {
        $scope.disabled = false;
        ToastService.error(validationResult.errors[0], 3000);
        return;
      }
      const formData = new FormData();
      
      $scope.car.selectedFeatures = JSON.stringify($scope.selectedFeatures);

      for (const key in $scope.car) {
        formData.append(key, $scope.car[key]);
      }

      // Add car record
      CarService.addCarData(formData)
        .then(() => {
          $scope.car = {}; 
          $scope.selectedFeatures = []; 
          $scope.carForm.$setPristine();
          ToastService.success("Car added successfully", 3000); 
          $scope.disabled = false;
        })
        .catch((error) => {
          const errorMessage =
            error.data?.message || error.statusText || "Failed to add car";
          ToastService.error(errorMessage, 3000); 
          $scope.disabled = false;
        });
    };
  },
]);
