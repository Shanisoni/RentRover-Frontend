/**
 * @description User Booking Controller - Manages user's car rental booking operations
 * Handles booking listing, filtering, sorting, and duration calculations for user bookings
 */
myApp.controller("userBookingController", [
  "$scope",
  "BookingService",
  "ToastService",
  "PDFFactory",
  function ($scope, BookingService, ToastService, PDFFactory) {
    // ==========================================
    // State Management
    // ==========================================
    
    /**
     * @type {Array}
     * @description List of all bookings made by the user
     */
    $scope.bookings = [];

    /**
     * @type {string}
     * @description Search query for filtering bookings by car name
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
          ToastService.error("Unable to fetch bookings", 3000);
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
     * @param {number} currentPage - The page number to fetch
     */
    $scope.getUserBookings = function(currentPage) {
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
    // Utility Functions
    // ==========================================
    
    /**
     * @description Calculate the duration between two dates in days
     * @param {Date|string} startDate - Start date of the rental period
     * @param {Date|string} endDate - End date of the rental period
     * @returns {number} Number of days between the dates (minimum 1 day)
     */
    $scope.calculateDuration = function(startDate, endDate) {
      if (!startDate || !endDate) return 0;

      let start = new Date(startDate);
      let end = new Date(endDate);

      let diffTime = Math.abs(end - start);
      let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))+1;

      return diffDays;
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
        companyName: "EZYCAR",
        includeTerms: true
      });
      
      // Save the generated PDF
      doc.save(`invoice-${booking._id}.pdf`);
    };
  },
]);
