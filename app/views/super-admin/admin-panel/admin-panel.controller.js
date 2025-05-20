myApp.controller("SuperAdminAnalysisController", [
  "$scope",
  "$timeout",
  "$state",
  "AuthService",
  "ConfigService",
  "ToastService",
  "AnalysisService",
  function (
    $scope,
    $timeout,
    $state,
    AuthService,
    ConfigService,
    ToastService,
    AnalysisService
  ) {
    $scope.analytics = null;
    $scope.error = null;
    $scope.isLoading = false;

    // Date range configuration - simplified to match owner analysis
    $scope.dateRange = {
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: new Date()
    };

    $scope.startOpened = false;
    $scope.endOpened = false;

    // Date picker options
    $scope.dateOptions = {
      startingDay: 1,
      showWeeks: false,
    };

    // Preset date range filters
    $scope.setLastMonth = function () {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 1);

      $scope.dateRange.startDate = startDate;
      $scope.dateRange.endDate = endDate;
      $scope.updateDateRange();
    };

    $scope.setLastThreeMonths = function () {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 3);

      $scope.dateRange.startDate = startDate;
      $scope.dateRange.endDate = endDate;
      $scope.updateDateRange();
    };

    $scope.setThisYear = function () {
      const endDate = new Date();
      const startDate = new Date(endDate.getFullYear(), 0, 1); // January 1st of current year

      $scope.dateRange.startDate = startDate;
      $scope.dateRange.endDate = endDate;
      $scope.updateDateRange();
    };

    $scope.dismissError = function () {
      $scope.error = null;
    };

    $scope.init = function () {
      $scope.isLoading = true;
      $scope.loadAnalytics();
    };

    $scope.updateDateRange = function () {
      if (!$scope.dateRange.startDate || !$scope.dateRange.endDate) {
        ToastService.error("Please select both start and end dates", 3000);
        return;
      }

      // Validate date range
      if ($scope.dateRange.startDate > $scope.dateRange.endDate) {
        ToastService.error("Start date cannot be greater than end date", 3000);
        return;
      }

      $scope.isLoading = true;
      $scope.loadAnalytics();
    };

    // Update loadAnalytics to directly use dateRange
    $scope.loadAnalytics = function () {
      async.parallel(
        {
          revenueSummary: function (callback) {
            AnalysisService.getRevenueAnalysis($scope.dateRange)
              .then((response) => {
                if (response.success) {
                  callback(null, response.data);
                } else {
                  callback(new Error("Failed to load revenue summary"));
                }
              })
              .catch((error) => {
                callback(error);
              });
          },
          topOwners: function (callback) {
            AnalysisService.getTopOwners($scope.dateRange)
              .then((response) => {
                if (response.success) {
                  const formattedData = processTopOwners(response.data);
                  callback(null, formattedData);
                } else {
                  callback(new Error("Failed to load top owners"));
                }
              })
              .catch((error) => {
                callback(error);
              });
          },
          topRenters: function (callback) {
            AnalysisService.getTopRenters($scope.dateRange)
              .then((response) => {
                if (response.success) {
                  const formattedData = processTopRenters(response.data);
                  callback(null, formattedData);
                } else {
                  callback(new Error("Failed to load top renters"));
                }
              })
              .catch((error) => {
                callback(error);
              });
          },
          bookingsByStatus: function (callback) {
            AnalysisService.getBookingsByStatus($scope.dateRange)
              .then((response) => {
                if (response.success) {
                  // Transform the raw booking status data to chart-friendly format
                  const formattedData = processBookingsByStatusData(response.data);
                  callback(null, formattedData);
                } else {
                  callback(new Error("Failed to load bookings by status"));
                }
              })
              .catch((error) => {
                callback(error);
              });
          },
          bookingTrend: function (callback) {
            AnalysisService.getBookingTrend($scope.dateRange)
              .then((response) => {
                if (response.success) {
                  // Transform the raw booking trend data
                  const formattedData = processBookingTrendData(response.data);
                  callback(null, formattedData);
                } else {
                  callback(new Error("Failed to load booking trend"));
                }
              })
              .catch((error) => {
                callback(error);
              });
          },
          categoryDistribution: function (callback) {
            AnalysisService.getCategoryDistribution($scope.dateRange)
              .then((response) => {
                if (response.success) {
                  const formattedData = processCategoryDistribution(response.data);
                  callback(null, formattedData);
                } else {
                  callback(new Error("Failed to load category distribution"));
                }
              })
              .catch((error) => {
                callback(error);
              });
          },
          cityDistribution: function (callback) {
            AnalysisService.getCityDistribution($scope.dateRange)
              .then((response) => {
                if (response.success) {
                  const formattedData = processCityDistribution(response.data);
                  callback(null, formattedData);
                } else {
                  callback(new Error("Failed to load city distribution"));
                }
              })
              .catch((error) => {
                callback(error);
              });
          },
          userGrowth: function (callback) {
            AnalysisService.getUserGrowth($scope.dateRange)
              .then((response) => {
                if (response.success) {
                  const formattedData = processUserGrowth(response.data);
                  callback(null, formattedData);
                } else {
                  callback(new Error("Failed to load user growth"));
                }
              })
              .catch((error) => {
                callback(error);
              });
          },
        },
        function (err, results) {
          if (err) {
            ToastService.error("Error loading dashboard data", 3000);
          } else {
            try {
              $scope.analytics = results;
              console.log("Analytics data loaded successfully", $scope.analytics);
              $scope.renderCharts();
            } catch (error) {
              ToastService.error("Error loading dashboard data", 3000);
            }
          }
          $scope.isLoading = false;
        }
      );
    };

    // Function to process booking trend data for chart
    function processBookingTrendData(data) {
      if (!data || !Array.isArray(data) || data.length === 0) {
        return {
          labels: [],
          bookingValues: [],
          revenueValues: []
        };
      }
      
     
      
      // Extract the required data in arrays
      const labels = data.map(item => {
        // Format the date to display better in chart
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      
      const bookingValues = data.map(item => item.bookings);
      const revenueValues = data.map(item => item.revenue);
      
      return {
        labels: labels,
        bookingValues: bookingValues,
        revenueValues: revenueValues
      };
    }

    // Add this function to process the booking status data
    function processBookingsByStatusData(data) {
      if (!data || !Array.isArray(data) || data.length === 0) {
        return {
          labels: [],
          values: []
        };
      }
      
      // Extract the status labels and count values from the data
      const labels = data.map(item => item.paymentStatus.charAt(0).toUpperCase() + item.paymentStatus.slice(1)); // Capitalize first letter
      const values = data.map(item => item.count);
      
      return {
        labels: labels,
        values: values
      };
    }

    // Add these processing functions to your controller

    // Process category distribution data
    function processCategoryDistribution(data) {
      if (!data || !Array.isArray(data) || data.length === 0) {
        return {
          labels: [],
          values: []
        };
      }
      
      // Extract the category labels and counts
      const labels = data.map(item => item.category);
      const values = data.map(item => item.count);
      
      return {
        labels: labels,
        values: values
      };
    }

    // Process city distribution data
    function processCityDistribution(data) {
      if (!data || !Array.isArray(data) || data.length === 0) {
        return {
          labels: [],
          values: []
        };
      }
      
      // Extract the city labels and counts
      const labels = data.map(item => item.city);
      const values = data.map(item => item.count);
      
      return {
        labels: labels,
        values: values
      };
    }

    // Process top owners data
    function processTopOwners(data) {
      if (!data || !Array.isArray(data) || data.length === 0) {
        return {
          labels: [],
          values: []
        };
      }
      
      // Extract owner names and revenue
      const labels = data.map(item => item.ownerName);
      const values = data.map(item => item.revenue);
      
      return {
        labels: labels,
        values: values
      };
    }

    // Process top renters data
    function processTopRenters(data) {
      if (!data || !Array.isArray(data) || data.length === 0) {
        return {
          labels: [],
          values: []
        };
      }
      
      // Extract renter names and spent amount
      const labels = data.map(item => item.userName);
      const values = data.map(item => item.spent);
      
      return {
        labels: labels,
        values: values
      };
    }

    // Process user growth data
    function processUserGrowth(data) {
      if (!data || !Array.isArray(data) || data.length === 0) {
        return {
          labels: [],
          ownerCounts: [],
          renterCounts: [],
          totalUsers: []
        };
      }
      
      // Sort data by date
      data.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Extract the dates, owner counts, and renter counts
      const labels = data.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      
      const ownerCounts = data.map(item => item.owners);
      const renterCounts = data.map(item => item.renters);
      const totalUsers = data.map(item => item.owners + item.renters);
      
      return {
        labels: labels,
        ownerCounts: ownerCounts,
        renterCounts: renterCounts,
        totalUsers: totalUsers
      };
    }

    const formatData = function (data) {
      if (!data || !data.length) return [];
      return data.map((item) => {
        return {
          label: item.label,
          value: item.value,
        };
      });
    };

    // Chart.js configuration and rendering
    $scope.renderCharts = function () {
      // Make sure analytics data exists
      if (!$scope.analytics) return;

      $timeout(function () {
        if (!window.chartInstances) window.chartInstances = {};
        renderRevenueTrend();
        renderTopOwners();
        renderTopRenters();
        renderBookingsByStatus();
        renderCategoryDistribution();
        renderCityDistribution();
        renderUserGrowth();
      }, 100);
    };

    // Helper function to destroy existing chart instances
    function destroyChart(chartId) {
      if (window.chartInstances && window.chartInstances[chartId]) {
        window.chartInstances[chartId].destroy();
      }
    }

    // Individual chart rendering functions
    function renderRevenueTrend() {
      if (
        !$scope.analytics.bookingTrend ||
        !$scope.analytics.bookingTrend.labels
      )
        return;

      destroyChart("revenueTrend");

      const ctx = document.getElementById("revenueTrend").getContext("2d");

      // Create chart instance and store reference

      window.chartInstances["revenueTrend"] = new Chart(ctx, {
        type: "line",
        data: {
          labels: $scope.analytics.bookingTrend.labels,
          datasets: [
            {
              label: "Revenue (₹)",
              data: $scope.analytics.bookingTrend.revenueValues,
              borderColor: "rgba(54, 162, 235, 1)",
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              yAxisID: "y",
            },
            {
              label: "Bookings",
              data: $scope.analytics.bookingTrend.bookingValues,
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              yAxisID: "y1",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "index",
            intersect: false,
          },
          stacked: false,
          scales: {
            y: {
              type: "linear",
              display: true,
              position: "left",
              title: {
                display: true,
                text: "Revenue (₹)",
              },
              ticks: {
                callback: function (value) {
                  return "₹" + value.toLocaleString();
                },
              },
            },
            y1: {
              type: "linear",
              display: true,
              position: "right",
              title: {
                display: true,
                text: "Bookings",
              },
              grid: {
                drawOnChartArea: false,
              },
              ticks: {
                precision: 0,
                callback: function (value) {
                  return Math.round(value);
                },
              },
            },
          },
          plugins: {
            title: {
              display: true,
              text: "Revenue & Booking Trend",
              font: { size: 16 },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || "";
                  if (label) label += ": ";

                  if (context.dataset.label.includes("Revenue")) {
                    return label + "₹" + context.raw.toLocaleString();
                  }
                  return label + Math.round(context.raw);
                },
              },
            },
          },
        },
      });
    }

    function renderTopOwners() {
      if (!$scope.analytics.topOwners || !$scope.analytics.topOwners.labels)
        return;

      destroyChart("topOwners");

      const ctx = document.getElementById("topOwners").getContext("2d");

      window.chartInstances["topOwners"] = new Chart(ctx, {
        type: "bar",
        data: {
          labels: $scope.analytics.topOwners.labels,
          datasets: [
            {
              label: "Revenue (₹)",
              data: $scope.analytics.topOwners.values,
              backgroundColor: [
                "rgba(255, 99, 132, 0.7)",
                "rgba(54, 162, 235, 0.7)",
                "rgba(255, 206, 86, 0.7)",
                "rgba(75, 192, 192, 0.7)",
                "rgba(153, 102, 255, 0.7)",
                "rgba(255, 159, 64, 0.7)",
                "rgba(201, 203, 207, 0.7)",
                "rgba(255, 159, 64, 0.7)",
                "rgba(54, 162, 235, 0.7)",
                "rgba(255, 99, 132, 0.7)",
              ],
              borderColor: [
                "rgb(255, 99, 132)",
                "rgb(54, 162, 235)",
                "rgb(255, 206, 86)",
                "rgb(75, 192, 192)",
                "rgb(153, 102, 255)",
                "rgb(255, 159, 64)",
                "rgb(201, 203, 207)",
                "rgb(255, 159, 64)",
                "rgb(54, 162, 235)",
                "rgb(255, 99, 132)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: "Top 10 Car Owners by Revenue",
              font: { size: 16 },
            },
          },
        },
      });
    }

    function renderTopRenters() {
      if (!$scope.analytics.topRenters || !$scope.analytics.topRenters.labels)
        return;

      destroyChart("topRenters");

      const ctx = document.getElementById("topRenters").getContext("2d");

      window.chartInstances["topRenters"] = new Chart(ctx, {
        type: "bar",
        data: {
          labels: $scope.analytics.topRenters.labels,
          datasets: [
            {
              label: "Amount Spent (₹)",
              data: $scope.analytics.topRenters.values,
              backgroundColor: [
                "rgba(75, 192, 192, 0.7)",
                "rgba(153, 102, 255, 0.7)",
                "rgba(255, 159, 64, 0.7)",
                "rgba(201, 203, 207, 0.7)",
                "rgba(255, 99, 132, 0.7)",
                "rgba(54, 162, 235, 0.7)",
                "rgba(255, 206, 86, 0.7)",
                "rgba(75, 192, 192, 0.7)",
                "rgba(153, 102, 255, 0.7)",
                "rgba(255, 159, 64, 0.7)",
              ],
              borderColor: [
                "rgb(75, 192, 192)",
                "rgb(153, 102, 255)",
                "rgb(255, 159, 64)",
                "rgb(201, 203, 207)",
                "rgb(255, 99, 132)",
                "rgb(54, 162, 235)",
                "rgb(255, 206, 86)",
                "rgb(75, 192, 192)",
                "rgb(153, 102, 255)",
                "rgb(255, 159, 64)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: "Top 10 Renters by Spending",
              font: { size: 16 },
            },
          },
        },
      });
    }

    function renderBookingsByStatus() {
      if (
        !$scope.analytics.bookingsByStatus ||
        !$scope.analytics.bookingsByStatus.labels
      )
        return;

      destroyChart("bookingsByStatus");

      const ctx = document.getElementById("bookingsByStatus").getContext("2d");

      // Status colors
      const statusColors = {
        pending: "rgba(255, 206, 86, 0.7)",
        confirmed: "rgba(54, 162, 235, 0.7)",
        ongoing: "rgba(75, 192, 192, 0.7)",
        completed: "rgba(153, 102, 255, 0.7)",
        cancelled: "rgba(255, 99, 132, 0.7)",
        rejected: "rgba(201, 203, 207, 0.7)",
      };

      // Status border colors
      const statusBorderColors = {
        pending: "rgb(255, 206, 86)",
        confirmed: "rgb(54, 162, 235)",
        ongoing: "rgb(75, 192, 192)",
        completed: "rgb(153, 102, 255)",
        cancelled: "rgb(255, 99, 132)",
        rejected: "rgb(201, 203, 207)",
      };

      // Generate colors based on status
      const backgroundColors = $scope.analytics.bookingsByStatus.labels.map(
        (status) =>
          statusColors[status.toLowerCase()] || "rgba(201, 203, 207, 0.7)"
      );

      const borderColors = $scope.analytics.bookingsByStatus.labels.map(
        (status) =>
          statusBorderColors[status.toLowerCase()] || "rgb(201, 203, 207)"
      );

      window.chartInstances["bookingsByStatus"] = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: $scope.analytics.bookingsByStatus.labels,
          datasets: [
            {
              data: $scope.analytics.bookingsByStatus.values,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: "Bookings by Status",
              font: { size: 16 },
            },
            legend: {
              position: "bottom",
              labels: {
                padding: 20,
              },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const label = context.label || "";
                  const value = context.formattedValue;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((context.raw / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                },
              },
            },
          },
          cutout: "65%",
        },
      });
    }

    function renderCategoryDistribution() {
      if (
        !$scope.analytics.categoryDistribution ||
        !$scope.analytics.categoryDistribution.labels
      )
        return;

      destroyChart("categoryDistribution");

      const ctx = document
        .getElementById("categoryDistribution")
        .getContext("2d");

      // Category colors
      const colorPalette = [
        "rgba(255, 99, 132, 0.7)",
        "rgba(54, 162, 235, 0.7)",
        "rgba(255, 206, 86, 0.7)",
        "rgba(75, 192, 192, 0.7)",
        "rgba(153, 102, 255, 0.7)",
        "rgba(255, 159, 64, 0.7)",
        "rgba(201, 203, 207, 0.7)",
      ];

      const borderColorPalette = [
        "rgb(255, 99, 132)",
        "rgb(54, 162, 235)",
        "rgb(255, 206, 86)",
        "rgb(75, 192, 192)",
        "rgb(153, 102, 255)",
        "rgb(255, 159, 64)",
        "rgb(201, 203, 207)",
      ];

      // Generate colors for each category
      const backgroundColors = [];
      const borderColors = [];

      $scope.analytics.categoryDistribution.labels.forEach((_, index) => {
        const colorIndex = index % colorPalette.length;
        backgroundColors.push(colorPalette[colorIndex]);
        borderColors.push(borderColorPalette[colorIndex]);
      });

      window.chartInstances["categoryDistribution"] = new Chart(ctx, {
        type: "pie",
        data: {
          labels: $scope.analytics.categoryDistribution.labels,
          datasets: [
            {
              data: $scope.analytics.categoryDistribution.values,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: "Car Categories Distribution",
              font: { size: 16 },
            },
            legend: {
              position: "bottom",
              labels: {
                padding: 20,
              },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const label = context.label || "";
                  const value = context.formattedValue;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((context.raw / total) * 100);
                  return `${label}: ${value} cars (${percentage}%)`;
                },
              },
            },
          },
        },
      });
    }

    function renderCityDistribution() {
      if (
        !$scope.analytics.cityDistribution ||
        !$scope.analytics.cityDistribution.labels
      )
        return;

      destroyChart("cityDistribution");

      const ctx = document.getElementById("cityDistribution").getContext("2d");

      window.chartInstances["cityDistribution"] = new Chart(ctx, {
        type: "bar",
        data: {
          labels: $scope.analytics.cityDistribution.labels,
          datasets: [
            {
              label: "Cars Available",
              data: $scope.analytics.cityDistribution.values,
              backgroundColor: "rgba(54, 162, 235, 0.7)",
              borderColor: "rgb(54, 162, 235)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: "Cars by City",
              font: { size: 16 },
            },
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return `${context.raw} cars available`;
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Number of Cars",
              },
              ticks: {
                precision: 0,
                callback: function (value) {
                  return Math.round(value);
                },
              },
            },
          },
        },
      });
    }

    function renderUserGrowth() {
      if (!$scope.analytics.userGrowth || !$scope.analytics.userGrowth.labels)
        return;

      destroyChart("userGrowth");

      const ctx = document.getElementById("userGrowth").getContext("2d");

      window.chartInstances["userGrowth"] = new Chart(ctx, {
        type: "line",
        data: {
          labels: $scope.analytics.userGrowth.labels,
          datasets: [
            {
              label: "Total New Users",
              data: $scope.analytics.userGrowth.totalUsers,
              borderColor: "rgba(54, 162, 235, 1)",
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderWidth: 2,
              fill: true,
              tension: 0.4,
            },
            {
              label: "New Car Owners",
              data: $scope.analytics.userGrowth.ownerCounts,
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderWidth: 2,
              fill: true,
              tension: 0.4,
            },
            {
              label: "New Renters",
              data: $scope.analytics.userGrowth.renterCounts,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderWidth: 2,
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: "User Growth Over Time",
              font: { size: 16 },
            },
            tooltip: {
              mode: "index",
              intersect: false,
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || "";
                  if (label) label += ": ";
                  return label + Math.round(context.raw);
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Number of New Users",
              },
              ticks: {
                precision: 0,
                callback: function (value) {
                  return Math.round(value);
                },
              },
            },
            x: {
              title: {
                display: true,
                text: "Date",
              },
            },
          },
          interaction: {
            mode: "nearest",
            axis: "x",
            intersect: false,
          },
        },
      });
    }

    // Logout function
    $scope.logout = function () {
      AuthService.logout();
      $state.go("auth");
    };

    // Initialize configuration
    $scope.config = {
      features: [],
      cities: [],
      categories: [],
      fuelTypes: [],
    };

    // Add new feature
    $scope.addFeature = function () {
      if (!$scope.newFeature) return;

      ConfigService.addFeature($scope.newFeature)
        .then(function (response) {
          ToastService.success("Feature added successfully", 3000);
          $scope.newFeature = "";
        })
        .catch(function (error) {
          ToastService.error("Error adding feature:", 3000);
        });
    };

    // Add new city
    $scope.addCity = function () {
      if (!$scope.newCity) return;

      ConfigService.addCity($scope.newCity)
        .then(function (response) {
          ToastService.success("City added successfully", 3000);
          $scope.newCity = "";
        })
        .catch(function (error) {
          ToastService.error("Error adding city:", 3000);
        });
    };

    // Add new category
    $scope.addCategory = function () {
      console.log("category", $scope.newCategory);
      if (!$scope.newCategory) return;

      ConfigService.addCategory($scope.newCategory)
        .then(function (response) {
          ToastService.success("Category added successfully", 3000);
          $scope.newCategory = "";
        })
        .catch(function (error) {
          ToastService.error(error, 3000);
        });
    };

    // Add new fuel type
    $scope.addFuelType = function () {
      if (!$scope.newFuelType) return;

      ConfigService.addFuelType($scope.newFuelType)
        .then(function (response) {
          ToastService.success(
            response.data.message || "Fuel type added successfully",
            3000
          );
          $scope.newFuelType = "";
        })
        .catch(function (error) {
          ToastService.error("Error adding fuel type:", 3000);
        });
    };
  },
]);
