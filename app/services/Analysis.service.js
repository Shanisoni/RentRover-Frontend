/**
 * @description Service for handling owner analytics API calls
 */
myApp.service('AnalysisService', ['$http','BASE_URL','$q', function($http, BASE_URL, $q) {

  this.getTopEarningCategories = function(params) {
    let deferred = $q.defer();
    $http.get(`${BASE_URL}/api/analysis/owner/top-categories`, {params}).then((response) => {
      deferred.resolve(response.data);
    })
    .catch((error) => {
      deferred.reject(error);
    });
    return deferred.promise;
  }

  this.getTopEarningCities = function(params) {
    let deferred = $q.defer();
    $http.get(`${BASE_URL}/api/analysis/owner/top-earning-cities`, {params}).then((response) => {
      deferred.resolve(response.data);
    })
    .catch((error) => {
      deferred.reject(error);
    });
    return deferred.promise;
  }

  this.getTopTravelledCities = function(params) {
    let deferred = $q.defer();
    $http.get(`${BASE_URL}/api/analysis/owner/top-travelled-cities`, {params}).then((response) => {
      deferred.resolve(response.data);
    })
    .catch((error) => {
      deferred.reject(error);
    });
    return deferred.promise;
  }

  this.getTopTravelledCategories = function(params) {
    let deferred = $q.defer();
    $http.get(`${BASE_URL}/api/analysis/owner/top-travelled-categories`, {params}).then((response) => {
      deferred.resolve(response.data);
    })
    .catch((error) => {
      deferred.reject(error);
    });
    return deferred.promise;
  }

  this.getTopBookedCars = function(params) {
    let deferred = $q.defer();
    $http.get(`${BASE_URL}/api/analysis/owner/top-booked-cars`, {params}).then((response) => {
      deferred.resolve(response.data);
    })
    .catch((error) => {
      deferred.reject(error);
    });
    return deferred.promise;
  }

  this.getOwnerBookingTrend = function(params) {
    let deferred = $q.defer();
    $http.get(`${BASE_URL}/api/analysis/owner/booking-trend`, {params}).then((response) => {
      deferred.resolve(response.data);
    })
    .catch((error) => {
      deferred.reject(error);
    });
    return deferred.promise;
  }

  this.getTripTypeAnalysis = function(params) {
    let deferred = $q.defer();
    $http.get(`${BASE_URL}/api/analysis/owner/trip-type-analysis`, {params}).then((response) => {
      deferred.resolve(response.data);
    })
    .catch((error) => {
      deferred.reject(error);
    });
    return deferred.promise;
  }

  this.getLateReturnsAnalysis = function(params) {
    let deferred = $q.defer();
    $http.get(`${BASE_URL}/api/analysis/owner/late-returns-analysis`, {params}).then((response) => {
      deferred.resolve(response.data);
    })
    .catch((error) => {
      deferred.reject(error);
    });
    return deferred.promise;
  }

  this.getPerformanceAnalysis = function(params) {
    let deferred = $q.defer();
    $http.get(`${BASE_URL}/api/analysis/owner/performance-analysis`, {params}).then((response) => {
      deferred.resolve(response.data);
    })
    .catch((error) => {
      deferred.reject(error);
    });
    return deferred.promise;
  }

  this.getCarFeatureAnalysis = function(params) {
    let deferred = $q.defer();
    $http.get(`${BASE_URL}/api/analysis/owner/car-features`, {params})
      .then((response) => {
        deferred.resolve(response.data);
      })
      .catch((error) => {
        deferred.reject(error);
      });
    return deferred.promise;
  };

  this.getRevenueAnalysis = function(params) {
    let deferred = $q.defer();
    $http.get(`${BASE_URL}/api/analysis/admin/revenue-summary`, {params}).then((response) => {
      console.log(response.data);
      deferred.resolve(response.data);
    })
    .catch((error) => {
      deferred.reject(error);
    });
    return deferred.promise;    
  }

  this.getTopOwners = function(params) {
    let deferred = $q.defer();
    $http.get(`${BASE_URL}/api/analysis/admin/top-owners`, {params}).then((response) => {
      deferred.resolve(response.data);
    })
    .catch((error) => {
      deferred.reject(error);
    });
    return deferred.promise;    
  }

  this.getTopRenters = function(params) {
    let deferred = $q.defer();
    $http.get(`${BASE_URL}/api/analysis/admin/top-renters`, {params}).then((response) => {
      deferred.resolve(response.data);
    })
    .catch((error) => {
      deferred.reject(error);
    });
    return deferred.promise;    
  }

  this.getBookingsByStatus = function(params) {
    let deferred = $q.defer();
    $http.get(`${BASE_URL}/api/analysis/admin/bookings-by-status`, {params}).then((response) => {
      deferred.resolve(response.data);
    })
    .catch((error) => {
      deferred.reject(error);
    });
    return deferred.promise;    
  }

  this.getBookingTrend = function(params) {
    let deferred = $q.defer();
    $http.get(`${BASE_URL}/api/analysis/admin/booking-trend`, {params}).then((response) => {
      deferred.resolve(response.data);
    })
    .catch((error) => {
      deferred.reject(error);
    });
    return deferred.promise;    
  }

  this.getCategoryDistribution = function(params) {
    let deferred = $q.defer();
    $http.get(`${BASE_URL}/api/analysis/admin/category-distribution`, {params}).then((response) => {
      deferred.resolve(response.data);
    })
    .catch((error) => {
      deferred.reject(error);
    });
    return deferred.promise;    
  }

  this.getCityDistribution = function(params) {
    let deferred = $q.defer();
    $http.get(`${BASE_URL}/api/analysis/admin/city-distribution`, {params}).then((response) => {
      deferred.resolve(response.data);
    })
    .catch((error) => {
      deferred.reject(error);
    });
    return deferred.promise;    
  }

  this.getUserGrowth = function(params) {
    let deferred = $q.defer();
    $http.get(`${BASE_URL}/api/analysis/admin/user-growth`, {params}).then((response) => {
      deferred.resolve(response.data);
    })
    .catch((error) => {
      deferred.reject(error);
    });
    return deferred.promise;    
  }
  
  
  
  
}]); 