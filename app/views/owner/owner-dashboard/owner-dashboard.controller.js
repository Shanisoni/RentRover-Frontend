/**
 * @description Owner Dashboard Controller - Manages the car owner's main dashboard view
 * Handles car management, bookings overview, and revenue tracking
 */
myApp.controller("OwnerDashboardController", [
  "$scope",
  "$q",
  "DashboardService",
  "ToastService",
  "$uibModal",
  "BookingService",
  "CarService",
  "BiddingService",
  "BidFactory",
  function (
    $scope,
    $q,
    DashboardService,
    ToastService,
    $uibModal,
    BookingService,
    CarService,
    BiddingService,
    BidFactory
  ) {
    // ==========================================
    // State Management
    // ==========================================
    
    // Search and filter states
    $scope.search = "";
    $scope.fuelFilter = "";
    $scope.selectedCity = "";
    $scope.categoryFilter = "";
    
    // Sort options
    $scope.sortOptions = [
      { value: "basePrice", label: "Price: High to Low" },
      { value: "carName", label: "Name (Z-A)" },
      { value: "travelled", label: "Kilometers Travelled" },
    ];
    $scope.sortOption = "basePrice"; // Default sort option
    
    // Pagination states
    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.maxSize = 5;
    $scope.itemsPerPage = 3;
    
    // Data states
    $scope.cars = [];
    $scope.cities = [];
    $scope.categories = [];
    $scope.fuelTypes = [];
    
    // Dashboard metrics
    $scope.activeBookings = 0;
    $scope.totalCars = 0;
    $scope.paidBookings = 0;
    $scope.unpaidBookings = 0;
    $scope.totalRevenue = 0;

    // ==========================================
    // Initialization
    // ==========================================
    
    /**
     * @description Initialize the dashboard by fetching all necessary data in parallel
     * Loads cars, bookings count, cities, categories, and fuel types
     * Also calculates dashboard metrics like revenue and booking stats
     */
    $scope.init = function () {
      $scope.isLoading = true;
      async.parallel({
        // Fetch all cars
        cars: function (callback) {
          CarService.getCars({sortBy: "basePrice"})
            .then(function (allCars) {
              callback(null, allCars);
            })
            .catch(function (err) {
              callback(err);
            });
        },
        // Fetch booking statistics
        bookings: function (callback) {
          BookingService.getBookingsCount()
            .then(function (acceptedBookings) {
              callback(null, acceptedBookings);
            })
            .catch(function (err) {
              callback(err);
            });
        },
        // Fetch available cities
        cities: function (callback) {
          DashboardService.getCities()
            .then((cities) => {
              callback(null, cities);
            })
            .catch(function (err) {
              callback(err);
            });
        },
        // Fetch car categories
        categories: function (callback) {
          DashboardService.getCategories()
            .then((categories) => {
              callback(null, categories);
            })
            .catch(function (err) {
              callback(err);
            });
        },
        // Fetch fuel types
        fuelTypes: function (callback) {
          DashboardService.getFuelTypes()
            .then((fuelTypes) => {
              callback(null, fuelTypes);
            })
            .catch(function (err) {
              callback(err);
            });
        },
      }, function (err, results) {
        if (err) {
          ToastService.error("Error loading dashboard data", 3000);
          return;
        }
        
        try {
          // Update scope with fetched data using safe access
          $scope.cars = results.cars?.cars || [];
          $scope.cities = results.cities?.cities || [];
          $scope.categories = results.categories?.categories || [];
          $scope.fuelTypes = results.fuelTypes?.fuelTypes || [];
          $scope.totalItems = results.cars?.metadata?.total || 0;

          // Process booking statistics
          const bookingsGroupArray = results.bookings?.data || [];
          
          // Reset dashboard metrics
          $scope.totalCars = $scope.cars.length || 0;
          $scope.activeBookings = 0;
          $scope.paidBookings = 0;
          $scope.unpaidBookings = 0;
          $scope.totalRevenue = 0;

          // Calculate booking metrics
          if (bookingsGroupArray.length > 0) {
            bookingsGroupArray.forEach(group => {
              if (group._id === 'paid') {
                $scope.paidBookings = group.count || 0;
                $scope.totalRevenue += group.totalRevenue || 0;
              } else if (group._id === 'pending') {
                $scope.unpaidBookings = group.count || 0;
                $scope.totalRevenue += group.totalRevenue || 0;
              }
              $scope.activeBookings += group.count || 0;
            });
          }

        } catch (error) {
          ToastService.error("Error displaying dashboard data", 3000);
        } finally {
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
      if ($scope.currentPage) params.page = currentPage;
      if ($scope.itemsPerPage) params.limit = $scope.itemsPerPage;

      // Fetch filtered cars
      CarService.getCars(params)
        .then((response) => {
          $scope.cars = response.cars;
          $scope.totalItems = response.metadata.total;
          $scope.currentPage = response.metadata.page;
        })
        .catch((error) => {
          ToastService.error(error, 3000);
        });
    };

    // ==========================================
    // Car Management
    // ==========================================

    /**
     * @description Enable a previously disabled car
     * @param {Object} car - The car object to enable
     */
    $scope.enableCar = function(car) {
      CarService.updateCar(car._id, {isDisabled: false})
        .then(function() {
          car.isDisabled = false;
          ToastService.success("Car enabled successfully", 3000);
        })
        .catch(function(error) {
          ToastService.error("Failed to enable car", 3000);
        });
    };


    $scope.openBestBidsModal = function(car) {
      BiddingService.getBestBidsByCarId(car._id)
        .then((allBids) => {
          const bestBids = BidFactory.recommendBids(allBids.bids);
          let modalInstance = $uibModal.open({
            animation: true,
            component: 'bestBidsModal',
            resolve: {
              dataObject: function () {
                return bestBids.selectedBids;
              },
              maxProfit: function () {
                return bestBids.maxProfit;
              }
            },
          });
      
          modalInstance.result.then(
            function (response) {
              console.log("Modal closed with response:", response);
            },
            function () {
              console.log("Modal dismissed.");
            }
          );
        })
        .catch((error) => {
          console.error(error);
        });
    };

    /**
     * @description Open modal to view all bookings for a specific car
     * @param {Object} car - The car object to view bookings for
     */
    $scope.openBookingsModal = function(car) {
      BookingService.getBookingsByCarId(car._id)
        .then((allBookings) => {
          let modalInstance = $uibModal.open({
            animation: true,
            component: 'bookingDetailsModal',
            resolve: {
              dataObject: function () {
                return allBookings;
              },
            },
          });
      
          modalInstance.result.then(
            function (response) {
              console.log("Modal closed with response:", response);
            },
            function () {
              console.log("Modal dismissed.");
            }
          );
        })
        .catch((error) => {
          console.error(error);
        });
    };

    /**
     * @description Open confirmation modal before disabling a car
     * @param {Object} car - The car object to be disabled
     */
    $scope.openDeleteWarnModal = function(car) {
      let modalInstance = $uibModal.open({
        component: 'deleteAlertModal',
        backdrop: 'static',
        size: 'md',
        resolve: {
          car: function() {
            return car;
          }
        }
      });
      
      modalInstance.result.then(function(result) {
        if (result && result.confirmed) {
          car.isDeleting = true; // Show loading indicator
          
          CarService.deleteCar(car._id)
            .then(function() {
              car.isDisabled = true;
              ToastService.success("Car disabled successfully", 3000);
            })
            .catch(function(error) {
              ToastService.error("Failed to delete car", 3000);
            })
            .finally(function() {
              car.isDeleting = false; // Remove loading indicator
            });
        }
      });
    };



    /**
     * @description Opens a modal to edit car price
     * @param {Object} car - The car object to edit
     */
    $scope.openEditCarModel = function(car) {
      
      let modalInstance = $uibModal.open({
        component: 'editCarPriceModal',
        backdrop: 'static',
        size: 'md',
        resolve: {
          car: function() {
            return car;
          }
        }
      });
      
      modalInstance.result.then(function(result) {
        if (result && result.success) {
          // Create updated car object with new price
          let updateCar = result.updateCar;
          
        
          CarService.updateCar(car._id, updateCar)
            .then(function(response) {
              Object.assign(car, response.car);
              ToastService.success("Car details updated successfully", 3000);
            })
            .catch(function(error) {
              ToastService.error("Failed to update car details", 3000);
            });
        }
      });
    };

    $scope.getBestBidsByCarId = function(carId) {
      BiddingService.getBestBidsByCarId(carId)
        .then(function(response) {
          console.log("response",response);
          const bestBids = BidFactory.recommendBids(response.bids);
          console.log("bestBids",bestBids);
        })
        .catch(function(error) {
          console.error(error);
        });
    };

  },
]);
