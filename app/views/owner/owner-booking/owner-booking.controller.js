/**
 * @description Owner Booking Controller - Manages car booking operations for owners
 * Handles booking listing, odometer updates, invoice generation, and status tracking
 */
myApp.controller("ownerBookingController", [
  "$scope",
  "ToastService",
  "BookingService",
  "PDFFactory",
  function (
    $scope,
    ToastService,
    BookingService,
    PDFFactory
  ) {
    // ==========================================
    // State Management
    // ==========================================
    
    /**
     * @type {Array}
     * @description List of all bookings for the owner's cars
     */
    $scope.bookings = [];

    /**
     * @type {string}
     * @description Search query for filtering bookings
     */
    $scope.search = "";

    /**
     * @type {string}
     * @description Current sort option for booking listing
     */
    $scope.sortOption = "bidAmount"; // Default sort by bid amount

    /**
     * @type {string}
     * @description Selected filter for booking status
     */
    $scope.selectedFilter = ""; // Default no status filter

    // Pagination states
    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.maxSize = 5;
    $scope.itemsPerPage = 10;

    /**
     * @type {Array}
     * @description Available sorting options for booking listing
     */
    $scope.sortOptions = [
      { value: "bidAmount", label: "Price: High to Low" },
      { value: "createdAt", label: "Created Date: New to Old" },
      { value: "-createdAt", label: "Created Date: Old to New" },
    ];

    /**
     * @type {Object}
     * @description Booking status filter options
     */
    $scope.filterBookings = {
      pending: "pending",
      paid: "paid",
    };

    /**
     * @type {Date}
     * @description Current date for comparisons
     */
    $scope.today = new Date();

    // ==========================================
    // Initialization
    // ==========================================
    
    /**
     * @description Initialize the booking dashboard
     * Loads initial booking data and sets up the view
     */
    $scope.init = function() {
      $scope.isLoading = true;
      BookingService.getAllBookings({sortBy: "bidAmount"})
        .then((response) => {
          $scope.bookings = response.bookings;
          $scope.totalItems = response.metadata.total;
        })
        .catch((e) => {
          ToastService.error("Unable to fetch Bookings", 3000);
        })
        .finally(() => {
          $scope.isLoading = false;
        });
    };

    // ==========================================
    // Data Operations
    // ==========================================
    
    /**
     * @description Fetch filtered bookings based on current search, filter, and sort options
     * Updates the booking listing with paginated results
     * @param {number} currentPage - The page number to fetch (defaults to 1)
     */
    $scope.getUserBookings = function(currentPage = 1) {
      // Build query parameters
      let param = {};
      if ($scope.search) param.carName = $scope.search;
      if ($scope.selectedFilter) param.status = $scope.selectedFilter;
      if ($scope.sortOption) param.sortBy = $scope.sortOption;
      if ($scope.itemsPerPage) param.limit = $scope.itemsPerPage;
      param.page = currentPage;

      // Fetch filtered bookings
      BookingService.getAllBookings(param)
        .then((response) => {
          $scope.bookings = response.bookings;
          $scope.totalItems = response.metadata.total;
          $scope.currentPage = response.metadata.page;
        })
        .catch((e) => {
          ToastService.error("Unable to fetch bookings", 3000);
        });
    };

    // ==========================================
    // Odometer Management
    // ==========================================
    
    /**
     * @description Check if start odometer reading should be shown for a booking
     * @param {Object} booking - The booking to check
     * @returns {boolean} True if start odometer should be shown
     */
    $scope.shouldShowStartOdometer = function(booking) {
      const startDate = new Date(booking.startDate);
      const today = new Date();
      return $scope.formatLocalDate(today) >= $scope.formatLocalDate(startDate);
    };

    /**
     * @description Check if end odometer reading should be shown for a booking
     * @param {Object} booking - The booking to check
     * @returns {boolean} True if end odometer should be shown
     */
    $scope.shouldShowEndOdometer = function(booking) {
      const endDate = new Date(booking.endDate);
      const today = new Date();
      return $scope.formatLocalDate(today) >= $scope.formatLocalDate(endDate);
    };

    /**
     * @description Save odometer reading for a booking
     * Updates start or end odometer value and recalculates total amount
     * @param {Object} booking - The booking to update
     * @param {string} type - Type of odometer reading ('start' or 'end')
     */
    $scope.saveOdometerValue = function(booking, type) {
      let odometerValue;
      if (type === 'start') {
        odometerValue = booking.startOdometerValue;
      } else if (type === 'end') {
        odometerValue = booking.endOdometerValue;
      }
      BookingService.updateStartOdometer(booking._id, odometerValue, type, booking.car._id)
        .then((updatedBooking) => {
          // Update booking with new values
          booking.car.travelled = updatedBooking.booking.car.travelled;
          booking.startOdometer = updatedBooking.booking.startOdometer; 
          booking.endOdometer = updatedBooking.booking.endOdometer;
          booking.paymentStatus = updatedBooking.booking.paymentStatus;
          booking.totalAmount = updatedBooking.booking.totalAmount;
          booking.distanceTravelled = updatedBooking.booking.distanceTravelled;
          if(updatedBooking.booking.hasOwnProperty('lateDays')) {
            booking.lateDays = updatedBooking.booking.lateDays;
          }
          if(updatedBooking.booking.hasOwnProperty('lateFee')) {
            booking.lateFee = updatedBooking.booking.lateFee;
          }
    
         
          ToastService.success("Odometer value updated successfully", 3000);
        })
        .catch((e) => {
          ToastService.error("Error updating odometer value", 3000);
        });
    };

    // ==========================================
    // Date Utilities
    // ==========================================
    
    /**
     * @description Calculate duration between two dates in days
     * @param {Date|string} startDate - Start date
     * @param {Date|string} endDate - End date
     * @returns {number} Number of days (minimum 1)
     */
    $scope.calculateDuration = function(startDate, endDate) {
      if (!startDate || !endDate) return 0;

      let start = new Date(startDate);
      let end = new Date(endDate);

      let diffTime = Math.abs(end - start);
      let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))+1;

      return diffDays;
    };

    /**
     * @description Check if a date is on or before today
     * @param {string} dateStr - Date to check
     * @returns {boolean} True if date is on or before today
     */
    $scope.isOnOrBeforeToday = function(dateStr) {
      const inputDate = $scope.formatLocalDate(dateStr);
      const todayDate = $scope.formatLocalDate(new Date());
      return inputDate <= todayDate;
    };
    
    /**
     * @description Check if a date is today
     * @param {string} dateStr - Date to check
     * @returns {boolean} True if date is today
     */
    $scope.isToday = function(dateStr) {
      const inputDate = $scope.formatLocalDate(dateStr);
      const todayDate = $scope.formatLocalDate(new Date());
      return inputDate === todayDate;
    };
    
    /**
     * @description Format a date as YYYY-MM-DD
     * @param {Date|string} dateStr - Date to format
     * @returns {string} Formatted date string
     */
    $scope.formatLocalDate = function(dateStr) {
      const date = new Date(dateStr);
      return date.getFullYear() + '-' +
             String(date.getMonth() + 1).padStart(2, '0') + '-' +
             String(date.getDate()).padStart(2, '0');
    };

    // ==========================================
    // Invoice Generation
    // ==========================================
    
    /**
     * @description Generate and display a PDF invoice for a booking
     * @param {Object} booking - The booking to generate invoice for
     */
    $scope.getInvoice = function(booking) {
      // Use the PDF Generator utility to create a professional invoice
      const doc = PDFFactory.generateBookingInvoice(booking, {
        // You can override default options here if needed
        companyName: "RentRover",
        includeTerms: true
      });
      
      // Save the generated PDF
      doc.save(`invoice-${booking._id}.pdf`);
    };

    // Initialize controller
    $scope.init();
  },
]);
