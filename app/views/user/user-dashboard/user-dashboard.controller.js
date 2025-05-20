/**
 * @description User Dashboard Controller - Manages the user's main dashboard view for car rentals
 */
myApp.controller("UserController", [
  "$scope",
  "LocationFactory",
  "ToastService",
  "$q",
  "DashboardService",
  "$state",
  "CarService",
  function ($scope, LocationFactory, ToastService, $q, DashboardService, $state, CarService) {
    // ==========================================
    // State Management
    // ==========================================
    
    // Search and filter states
    $scope.search = "";
    $scope.fuelFilter = "";
    $scope.selectedCity = ""; 
    $scope.categoryFilter = "";
    
    // Pagination states
    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.maxSize = 5;
    $scope.itemsPerPage = 3;
    
    // Sort options
    $scope.sortOptions = [
      { value: "", label: "Sort" },
      { value: "basePrice", label: "Price: High to Low" },
      { value: "carName", label: "Name (Z-A)" },
      { value: "travelled", label: "Kilometers Travelled" },
    ];
    $scope.sortOption = "";
    
    // Data states
    $scope.fuelTypes = [];
    $scope.cities = [];
    $scope.categories = [];
    $scope.carsInSelectedCity = []; 
    $scope.isLoading = false;

    // ==========================================
    // Initialization
    // ==========================================
    
    /**
     * @description Initialize the dashboard by fetching all necessary data using async waterfall
     * First fetches cities, categories, fuel types, and current city in parallel
     * Then fetches cars for the current city
     */
    $scope.init = function () {
      $scope.isLoading = true;
      async.waterfall([
        // Step 1: Fetch all required data in parallel
        function (callback) {
          async.parallel({
            cities: function (cb) {
              DashboardService.getCities()
                .then((cities) => cb(null, cities));
            },
            categories: function (cb) {
              DashboardService.getCategories()
                .then((categories) => cb(null, categories));
            },
            fuelTypes: function (cb) {
              DashboardService.getFuelTypes()
                .then((fuelTypes) => cb(null, fuelTypes));
            },
            currentCity: function (cb) {
              DashboardService.getCurrentCity()
                .then((currentCity) => cb(null, currentCity));
            },
          }, function (err, result) {
            if (err) return callback(err);
            callback(null, result);
          });
        },
        // Step 2: Fetch cars for the current city
        function (values, callback) {
          let findObject = {};
          if (values.currentCity) findObject.city = values.currentCity;
          
          CarService.getCars(findObject)
            .then((cars) => {
              let finalResult = {
                cities: values.cities,
                categories: values.categories,
                fuelTypes: values.fuelTypes,
                currentCity: values.currentCity,
                cars: cars,
              };
              callback(null, finalResult);
            });
        },
      ], function (err, result) {
        if (err) {
          $scope.isLoading = false;
          ToastService.error(err, 3000);
        } else {
          // Update scope with fetched data
          $scope.carsInSelectedCity = result.cars.cars;
          $scope.fuelTypes = result.fuelTypes.fuelTypes;
          $scope.cities = result.cities.cities;
          $scope.categories = result.categories.categories;
          $scope.selectedCity = result.currentCity.charAt(0).toUpperCase() + 
                              result.currentCity.slice(1).toLowerCase();
          $scope.totalItems = result.cars.metadata.total;
          $scope.isLoading = false;
        }
      });
    };

    // ==========================================
    // Data Operations
    // ==========================================

    /**
     * @description Fetch cars data based on current filters, sort options, and pagination
     * @param {number} currentPage - The page number to fetch (defaults to 1)
     */
    $scope.getCarsData = function(currentPage = 1) {
      // Build query parameters
      let params = {};
      if ($scope.search) params.carName = $scope.search;
      if ($scope.fuelFilter) params.fuelType = $scope.fuelFilter;
      if ($scope.categoryFilter) params.category = $scope.categoryFilter;
      if ($scope.selectedCity) params.city = $scope.selectedCity;
      if ($scope.sortOption) params.sortBy = $scope.sortOption;
      if ($scope.itemsPerPage) params.limit = $scope.itemsPerPage;
      params.page = currentPage;

      // Fetch filtered cars
      CarService.getCars(params)
        .then((response) => {
          $scope.carsInSelectedCity = response.cars;
          $scope.totalItems = response.metadata.total;
          $scope.currentPage = response.metadata.page;
        })
        .catch((error) => {
          ToastService.error(error, 3000);
        });
    };

    // ==========================================
    // Navigation
    // ==========================================

    /**
     * @description Navigate to car details page for a specific car
     * @param {string} carId - The ID of the car to view details for
     */
    $scope.goToCarDetails = function(carId) {
      $state.go('carDetails', { id: carId });
    };
  },
]);
