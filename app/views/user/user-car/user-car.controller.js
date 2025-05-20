/**
 * @description User Car Controller - Manages car details viewing and bidding operations
 * Handles car information display, date selection, bid placement, and chat initiation
 */
myApp.controller("carController", [
  "$stateParams",
  "$scope",
  "ToastService",
  "chatService",
  "$q",
  "$timeout",
  "CarService",
  "BiddingService",
  "$state",
  "BidFactory",
  function (
    $stateParams,
    $scope,
    ToastService,
    chatService,
    $q,
    $timeout,
    CarService,
    BiddingService,
    $state,
    BidFactory
  ) {
    // ==========================================
    // State Management
    // ==========================================
    
    /**
     * @type {Object}
     * @description Current car details being viewed
     */
    $scope.car = {};

    /**
     * @type {string}
     * @description Today's date in YYYY-MM-DD format for date validation
     */
    $scope.today = new Date().toISOString().split("T")[0];

    /**
     * @type {boolean}
     * @description Tracks if the date picker has been initialized
     */
    $scope.flatpickrInitialized = false;
    $scope.disableSubmit = false;

    // ==========================================
    // Initialization
    // ==========================================
    
    /**
     * @description Initialize the car details view
     * Loads car data and sets up the initial state
     */
    $scope.init = function() {
      $scope.isLoading = true;
      getCarById()
        .then((car) => {
          $scope.car = car;
          $scope.car.tripType = "inCity";
        })
        .catch((e) => {
          ToastService.error(e, 3000);
        })
        .finally(() => {
          $scope.isLoading = false;
        });
    };

    /**
     * @description Fetch car details by ID from the URL parameters
     * @returns {Promise} Promise resolving to car details
     * @private
     */
    function getCarById() {
      let deferred = $q.defer();
      let carId = $stateParams.id;
      CarService.getCar(carId)
        .then((response) => {
          deferred.resolve(response.car);
        })
        .catch((e) => {
          deferred.reject(e);
        });
      return deferred.promise;
    }

    // ==========================================
    // Date Picker Management
    // ==========================================
    
    /**
     * @description Initialize the date picker with booked dates blocked
     * Called when the date range input is focused
     */
    $scope.setupDatePickers = function() {
      if (!$scope.flatpickrInitialized) {
        $scope.loadingDates = true;
        
        CarService.getBookedDates($scope.car._id)
          .then((response) => {
            initializeFlatpickr(response.dates || []);
            $scope.flatpickrInitialized = true;
          })
          .catch((error) => {
            ToastService.error("Failed to load unavailable dates. Please try again.", 3000);
            initializeFlatpickr([]);
          })
          .finally(() => {
            $scope.loadingDates = false;
          });
      }
    };

    /**
     * @description Initialize flatpickr date picker with range selection and blocked dates
     * @param {Array<string>} bookedDates - Array of dates that are already booked
     * @private
     */
    function initializeFlatpickr(bookedDates) {
      const uniqueDates = [...new Set(bookedDates)];
      
      const rangePicker = flatpickr("#dateRangePicker", {
        mode: "range",
        minDate: "today",
        disable: uniqueDates,
        dateFormat: "Y-m-d",
        onClose: function(selectedDates, dateStr, instance) {
          $timeout(function() {
            if (selectedDates.length === 2) {
              if (hasBlockedDateInRange(selectedDates[0], selectedDates[1], uniqueDates)) {
                instance.clear();
                ToastService.warning("Your date range includes unavailable dates. Please select a different range.", 3000);
              } else {
                $scope.car.startDate = formatDate(selectedDates[0]);
                $scope.car.endDate = formatDate(selectedDates[1]);
              }
            } else if (selectedDates.length === 1) {
              $scope.car.startDate = formatDate(selectedDates[0]);
              $scope.car.endDate = null;
            } else {
              $scope.car.startDate = null;
              $scope.car.endDate = null;
            }
          });
        }
      });
      
      $scope.rangePicker = rangePicker;
    }

    /**
     * @description Format a date object to YYYY-MM-DD string
     * @param {Date} date - Date to format
     * @returns {string} Formatted date string
     * @private
     */
    function formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    /**
     * @description Check if any blocked dates exist in the selected range
     * @param {Date} startDate - Start date of the range
     * @param {Date} endDate - End date of the range
     * @param {Array<string>} blockedDates - Array of blocked dates
     * @returns {boolean} True if range contains blocked dates
     * @private
     */
    function hasBlockedDateInRange(startDate, endDate, blockedDates) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const currentDate = new Date(start);
      
      while (currentDate <= end) {
        if (blockedDates.includes(formatDate(currentDate))) {
          return true;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return false;
    }

    // ==========================================
    // Pricing and Duration Calculations
    // ==========================================
    
    /**
     * @description Calculate the duration of the booking in days
     * @returns {number} Number of days between start and end dates (inclusive)
     */
    $scope.calculateDays = function() {
      if (!$scope.car.startDate || !$scope.car.endDate) return 0;
      
      const start = new Date($scope.car.startDate);
      const end = new Date($scope.car.endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return 0;
      }
      
      if ($scope.car.startDate === $scope.car.endDate) {
        return 1; // Same day booking counts as one day
      }
      
      const diffTime = Math.abs(end - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end dates
    };
    
    /**
     * @description Calculate the total price for the booking
     * @returns {number} Total price based on duration and bid/base amount
     */
    $scope.calculatePrice = function() {
      const days = $scope.calculateDays();
      return days * ($scope.car.bidAmount || $scope.car.basePrice || 0);
    };

    // ==========================================
    // Bid Management
    // ==========================================
    
    /**
     * @description Place a bid for the car rental
     * Validates dates and bid amount before submission
     */
    $scope.addBid = function() {
      $scope.disableSubmit = true;
      if (!$scope.car.startDate || !$scope.car.endDate) {
        ToastService.error("Please select both start and end dates", 3000);
        return;
      }
      
      if (!$scope.car.bidAmount || $scope.car.bidAmount < $scope.car.basePrice) {
        ToastService.error("Bid amount must be at least the base price", 3000);
        return;
      }

      let bid = {
        carId: $scope.car._id,
        startDate: $scope.car.startDate,
        endDate: $scope.car.endDate,
        bidAmount: $scope.car.bidAmount,
        tripType: $scope.car.tripType,
        basePrice: $scope.car.basePrice,
      };

      let result = BidFactory.validateBidData(bid);
      if (!result.isValid) {
        ToastService.error(result.errors, 3000);
        return;
      }

      BiddingService.addBid(bid)
        .then((response) => {
          $scope.disableSubmit = false;


          
          // Reset date picker if exists
          if ($scope.rangePicker) {
            $scope.rangePicker.clear();
          }
          $scope.car.startDate = null;
          $scope.car.endDate = null;
          $scope.car.bidAmount = null;
          $scope.car.tripType = "inCity";
          
          $scope.carForm.$setPristine();
          ToastService.info("Bid addition in progress, check email for confirmation", 3000);
        })
        .catch((error) => {
          $scope.disableSubmit = false;
          ToastService.error("Failed to place bid. Please try again.", 3000);
        });
    };

    // ==========================================
    // Chat Management
    // ==========================================
    
    /**
     * @description Initiate a chat with the car owner
     * @param {Object} owner - The owner to chat with
     * @param {Object} car - The car being discussed
     */
    $scope.chat = function(owner, car) {
      chatService.addChat(owner, car)
        .then((response) => {
          $state.go("userChat");
        })
        .catch((error) => {
          ToastService.error(error.data.message || "Failed to start chat. Please try again.", 3000);
        });
    };
  },
]);
