/**
 * @description Owner Bidding Controller - Manages car bidding operations for owners
 * Handles bid listing, filtering, accepting/rejecting bids, and status updates
 */
myApp.controller("ownerBiddingController", [
  "$scope",
  "BiddingService",
  "ToastService",
  function ($scope, BiddingService, ToastService) {
    // ==========================================
    // State Management
    // ==========================================
    
    /**
     * @type {Array}
     * @description List of all bids for the owner's cars
     */
    $scope.biddings = [];

    /**
     * @type {string}
     * @description Search query for filtering bids
     */
    $scope.search = "";

    /**
     * @type {string}
     * @description Current sort option for bid listing
     */
    $scope.sortOption = "bidAmount"; // Default sort by bid amount

    /**
     * @type {string}
     * @description Selected filter for bid status
     */
    $scope.selectedFilter = ""; // Default no status filter

    /**
     * @type {boolean}
     * @description Controls the visibility of filter panel on mobile
     */
    $scope.isFilterVisible = false;

    // Pagination states
    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.maxSize = 5;
    $scope.itemsPerPage = 10;

    /**
     * @type {Array}
     * @description Available sorting options for bid listing
     */
    $scope.sortOptions = [
      { value: "bidAmount", label: "Price: High to Low" },
      { value: "createdAt", label: "Created Date: New to Old" },
      { value: "-createdAt", label: "Created Date: Old to New" },
    ];

    /**
     * @type {Object}
     * @description Bid status filter options
     */
    $scope.filterBid = {
      pending: "pending",
      rejected: "rejected",
      accepted: "accepted",
    };

    // ==========================================
    // Initialization
    // ==========================================
    
    /**
     * @description Initialize the bidding dashboard
     * Loads initial bid data and sets up the view
     */
    $scope.init = function() {
      $scope.isLoading = true;
      BiddingService.getAllBids()
        .then((response) => {
          $scope.biddings = response.bids;
          $scope.totalItems = response.metadata.total;
        })
        .catch((e) => {
          ToastService.error("Unable to fetch Biddings", 3000);
        })
        .finally(() => {
          $scope.isLoading = false;
        });
    };

    // ==========================================
    // Data Operations
    // ==========================================
    
    /**
     * @description Fetch filtered bids based on current search, filter, and sort options
     * Updates the bid listing with paginated results
     * @param {number} currentPage - The page number to fetch (defaults to 1)
     */
    $scope.getUserBiddings = function(currentPage = 1) {
      // Build query parameters
      let param = {};
      if ($scope.search) param.carName = $scope.search;
      if ($scope.selectedFilter) param.status = $scope.selectedFilter;
      if ($scope.sortOption) param.sortBy = $scope.sortOption;
      if ($scope.itemsPerPage) param.limit = $scope.itemsPerPage;
      param.page = currentPage;

      // Fetch filtered bids
      BiddingService.getAllBids(param)
        .then((response) => {
          console.log(`response:`, response);
          $scope.biddings = response.bids;
          $scope.totalItems = response.metadata.total;
          $scope.currentPage = response.metadata.page;
        })
        .catch((e) => {
          console.log(`param:`, param);
          console.log(`e:`, e);
          ToastService.error("Unable to fetch Biddings", 3000);
        });
    };

    // ==========================================
    // Bid Management
    // ==========================================
    
    /**
     * @description Accept a bid and handle overlapping bid rejections
     * Updates the accepted bid's status and rejects any overlapping bids
     * @param {Object} bid - The bid to accept
     */
    $scope.acceptBid = function(bid) {
      BiddingService.acceptBid(bid._id)
        .then((response) => {
          bid.status = "accepted";
          // If there are overlapping bids that were rejected
          if (response.data.rejectedBidIds.length !== 0) {
            updateBiddingStatusInView(response.data.rejectedBidIds);
          }
        })
        .catch((error) => {
          ToastService.error("Bid not approved", 3000);
        });
    };

    /**
     * @description Reject a bid
     * Updates the bid's status to rejected
     * @param {Object} bid - The bid to reject
     */
    $scope.rejectBid = function(bid) {
      BiddingService.rejectBid(bid._id)
        .then(() => {
          bid.status = "rejected";
          ToastService.success("Bid rejected", 3000);
        })
        .catch((e) => {
          ToastService.error("Bid not rejected", 3000);
        });
    };

    /**
     * @description Update the status of rejected bids in the view
     * Updates local bid objects to reflect their rejected status
     * @param {Array<string>} rejectedBids - Array of rejected bid IDs
     * @private
     */
    function updateBiddingStatusInView(rejectedBids) {
      rejectedBids.forEach((id) => {
        let bid = $scope.biddings.find((b) => b._id === id);
        if (bid) {
          bid.status = "rejected";
        }
      });
    }

    // Initialize controller
    $scope.init();
  },
]);
