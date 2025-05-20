/**
 * @description Owner Analysis Controller - Manages analytics dashboard for car owners
 * Handles data visualization, date range filtering, and chart rendering
 */
myApp.controller("OwnerAnalysisController", [
  "$scope",
  "$timeout",
  "AnalysisService",
  function ($scope, $timeout, AnalysisService) {
    $scope.analytics = {};

    const barColors = ["#4BC0C0", "#9966FF", "#FF9F40", "#C9CBCF", "#7AC36A", "#5A9BD4", "#CE0058"];
    const pieColors = ["#4BC0C0", "#9966FF", "#FF9F40", "#C9CBCF", "#7AC36A", "#5A9BD4", "#CE0058"];

    // Initialize date range with proper Date objects
    $scope.dateRange = {
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: new Date()
    };

    $scope.isLoading = false;

    $scope.init = function () {
      $scope.isLoading = true;
      $scope.currentTabIndex = 0;
    };

    $scope.loadAnalyticsCharts = function (func1, func2, first, second) {
      $scope.analytics = {};
      $scope.isLoading = true;

      async.parallel(
        [
          function (callback) {
            AnalysisService[func1]($scope.dateRange)
              .then(function (response) {
                callback(null, response);
              })
              .catch(function (error) {
                callback(error);
              });
          },
          function (callback) {
            AnalysisService[func2]($scope.dateRange)
              .then(function (response) {
                callback(null, response);
              })
              .catch(function (error) {
                callback(error);
              });
          },
        ],
        function (err, results) {
          if (err) {
            $scope.error = err.message || "Error loading analytics data";
            $scope.isLoading = false;
            return;
          }
          $scope.isLoading = false;
          $scope.analytics[first] = $scope.processAnalyticsChartsData(results[0].data);
          $scope.analytics[second] = $scope.processAnalyticsChartsData(results[1].data);
          $scope.renderCharts();
        }
      );
    };

    $scope.loadAnalyticsTables = function (func1, first) {
      $scope.analytics = {};
      AnalysisService[func1]($scope.dateRange)
        .then(function (response) {
          $scope.analytics[first]=response.data;
          $scope.processAnalyticsTablesData();
          $scope.renderCharts();
        });
    };

    $scope.processAnalyticsChartsData = function (data) {
      if (!data || !Array.isArray(data)) {
        return {
          labels: [],
          values: [],
        };
      }

      let labels = [];
      let values = [];

      data.forEach((item) => {
        labels.push(item.category || item.city || item.carName || item.date);
        values.push(item.revenue || item.distance || item.count || 0);
      });

      return {
        labels: labels,
        values: values,
      };
    };

    /**
     * @description Process analytics data for visualization
     */
    $scope.processAnalyticsTablesData = function() {
      (`$scope.analytics:`, $scope.analytics);
      // Process Trip Type Analysis
      if ($scope.analytics.tripTypeAnalysis) {
        $scope.tripTypeChartData = {
          labels: $scope.analytics.tripTypeAnalysis.map(item => item.tripType),
          values: $scope.analytics.tripTypeAnalysis.map(item => item.metrics.totalRevenue),
          bookings: $scope.analytics.tripTypeAnalysis.map(item => item.metrics.totalBookings),
          avgRevenue: $scope.analytics.tripTypeAnalysis.map(item => item.metrics.avgRevenue),
          avgDistance: $scope.analytics.tripTypeAnalysis.map(item => item.metrics.avgDistance)
        };
      }

      // Process performance Analysis
      if ($scope.analytics.performanceAnalysis) {
        $scope.performanceChartData = {
          labels: $scope.analytics.performanceAnalysis.map(item => item.carName),
          totalDistance: $scope.analytics.performanceAnalysis.map(item => item.metrics.totalDistance || 0),
          avgDistance: $scope.analytics.performanceAnalysis.map(item => item.metrics.avgTripDistance || 0),
          totalTrips: $scope.analytics.performanceAnalysis.map(item => item.metrics.totalTrips || 0),
          maxDistance: $scope.analytics.performanceAnalysis.map(item => item.metrics.maxTripDistance || 0),
        };
        (`$scope.performanceChartData:`, $scope.performanceChartData);
      }

      // Process Car Feature Analysis
      if ($scope.analytics.carFeatureAnalysis) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $scope.featureChartData = {
          labels: $scope.analytics.carFeatureAnalysis.map(item => `${item.feature} ${monthNames[item.month - 1]} ${item.year}`),
          values: $scope.analytics.carFeatureAnalysis.map(item => item.count),
        };
      }
    };

    $scope.renderCharts = function () {
      if (!$scope.analytics) return;

      $timeout(function () {
        // Remove old chart instances first
        if (window.chartInstances) {
          Object.keys(window.chartInstances).forEach((key) => {
            window.chartInstances[key].destroy();
            delete window.chartInstances[key];
          });
        }

        // Top Categories Chart
        if ($scope.analytics.topCategories?.labels?.length > 0) {
          $scope.renderChart(
            "topCategories",
            $scope.analytics.topCategories.labels,
            [
              {
                label: "Revenue by Category",
                data: $scope.analytics.topCategories.values,
                type: "bar",
              },
            ],
            "bar",
            "Top Revenue Categories"
          );
        }

        // Top Earning Cities Chart
        if ($scope.analytics.topEarningCities?.labels?.length > 0) {
          $scope.renderChart(
            "topEarningCities",
            $scope.analytics.topEarningCities.labels,
            [
              {
                data: $scope.analytics.topEarningCities.values,
              },
            ],
            "pie",
            "Top Earning Cities"
          );
        }

        // Top Travelled Cities Chart
        if ($scope.analytics.topTravelledCities?.labels?.length > 0) {
          $scope.renderChart(
            "topTravelledCities",
            $scope.analytics.topTravelledCities.labels,
            [
              {
                data: $scope.analytics.topTravelledCities.values,
              },
            ],
            "pie",
            "Most Travelled Cities (km)"
          );
        }

        // Top Travelled Categories Chart
        if ($scope.analytics.topTravelledCategories?.labels?.length > 0) {
          $scope.renderChart(
            "topTravelledCategories",
            $scope.analytics.topTravelledCategories.labels,
            [
              {
                label: "Distance by Category",
                data: $scope.analytics.topTravelledCategories.values,
              },
            ],
            "bar",
            "Distance Travelled by Category (km)"
          );
        }

        // Top Booked Cars Chart
        if ($scope.analytics.topBookedCars?.labels?.length > 0) {
          $scope.renderChart(
            "topBookedCars",
            $scope.analytics.topBookedCars.labels,
            [
              {
                label: "Number of Bookings",
                data: $scope.analytics.topBookedCars.values,
              },
            ],
            "bar",
            "Most Booked Cars"
          );
        }

        // Booking Trend Chart
        if ($scope.analytics.bookingTrend?.labels?.length > 0) {
          $scope.renderChart(
            "bookingTrend",
            $scope.analytics.bookingTrend.labels,
            [
              {
                label: "Bookings Over Time",
                data: $scope.analytics.bookingTrend.values,
                tension: 0.4,
              },
            ],
            "line",
            "Booking Trend"
          );
        }

        // Trip Type Analysis Chart
        if ($scope.analytics.tripTypeAnalysis && $scope.analytics.tripTypeAnalysis.length > 0) {
          (`$scope.tripTypeChartData:`, $scope.tripTypeChartData);
          $scope.renderChart(
            "tripTypeChart",
            $scope.tripTypeChartData.labels,
            [
              {
                label: "Total Revenue",
                data: $scope.tripTypeChartData.values,
                type: "bar",
                yAxisID: "y1",
              },
              {
                label: "Total Bookings",
                data: $scope.tripTypeChartData.bookings,
                type: "line",
                yAxisID: "y2",
              },
            ],
            "mixed",
            "Trip Type Analysis"
          );
        }

        // performance Analysis Chart
        if ($scope.analytics.performanceAnalysis && $scope.analytics.performanceAnalysis.length > 0) {
          (`$scope.performanceChartData:`, $scope.performanceChartData);
          $scope.renderChart(
            "performanceChart",
            $scope.performanceChartData.labels,
            [
              {
                label: "Total Trips",
                data: $scope.performanceChartData.totalTrips,
              },
              {
                label: "Total Distance",
                data: $scope.performanceChartData.totalDistance,
              },
              {
                label: "Average Distance",
                data: $scope.performanceChartData.avgDistance,
              },
              {
                label: "Max Trip Distance",
                data: $scope.performanceChartData.maxDistance,
              },
              
            ],
            "bar",
            "Performance Analysis"
          );
        }

        // Feature Analysis Chart
        if ($scope.analytics.carFeatureAnalysis && $scope.analytics.carFeatureAnalysis.length > 0) {
          $scope.renderChart(
            "featureAnalysisChart",
            $scope.featureChartData.labels,
            [
              {
                label: "Number of Bookings",
                data: $scope.featureChartData.values,
              }
            ],
            "bar",
            "Most Popular Car Feature by Month"
          );
        }
      }, 0);
    };

    // Function to format large numbers with K, M, B suffixes
    $scope.formatLabels = function(value) {
      if (value >= 1000000000) return (value / 1000000000).toFixed(1) + 'B';
      if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
      if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
      return value;
    };

    $scope.renderChart = function (
      elementId,
      labels,
      datasets,
      chartType,
      chartTitle
    ) {
      let ctx = document.getElementById(elementId);

      if (!ctx) {
        console.error(`Canvas element with ID ${elementId} not found`);
        return;
      }

      ctx = ctx.getContext("2d");

      // Configure scales based on chart type
      let scales = {};
      if (chartType === "mixed") {
        scales = {
          y1: {
            type: "linear",
            display: true,
            position: "left",
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return $scope.formatLabels(value);
              }
            }
          },
          y2: {
            type: "linear",
            display: true,
            position: "right",
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return $scope.formatLabels(value);
              }
            }
          },
        };
      } else if (chartType !== "pie") {
        const allValues = datasets.map(dataset => dataset.data).flat();
        const maxValue = Math.max(...allValues);
        console.log(`maxValue:`, maxValue);
        const stepSize = maxValue > 10 ? Math.pow(10, Math.floor(Math.log10(maxValue / 10))) : 1;
        console.log(`stepSize:`, stepSize);
        scales = {
          y: {
            type: 'linear',
            beginAtZero: true,
            ticks: {
              stepSize: stepSize,
              callback: function(value) {
                return $scope.formatLabels(Math.round(value));
              }
            }
          }
        }
      }

      // Configure chart data
      let chartData = {
        labels: labels,
        datasets: datasets.map((dataset, index) => ({
          ...dataset,
          backgroundColor:
            chartType === "pie"
              ? pieColors
              : dataset.type === "line"
              ? "rgba(75, 192, 192, 0.2)"
              : barColors[index % barColors.length],
          borderColor:
            chartType === "pie"
              ? pieColors
              : dataset.type === "line"
              ? "rgba(75, 192, 192, 1)"
              : barColors[index % barColors.length],
          borderWidth: 1,
          fill: dataset.type === "line",
        })),
      };

      // Configure chart options
      let chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: scales,
        plugins: {
          legend: {
            display:
              chartType === "pie" ||
              chartType === "mixed" ||
              datasets.length > 1,
            position: "top",
          },
          title: {
            display: true,
            text: chartTitle,
            font: {
              size: 16,
            },
          },
        },
      };

      // Clean up existing chart instance
      if (window.chartInstances && window.chartInstances[elementId]) {
        window.chartInstances[elementId].destroy();
      }

      // Create and store new chart instance
      if (!window.chartInstances) window.chartInstances = {};
      window.chartInstances[elementId] = new Chart(ctx, {
        type: chartType === "mixed" ? "bar" : chartType,
        data: chartData,
        options: chartOptions,
      });
    };

    // Shared function to load tab data
    function loadTabData(index) {
      switch (index) {
        case 0:
          $scope.loadAnalyticsCharts("getTopEarningCategories", "getTopEarningCities", "topCategories", "topEarningCities");
          break;
        case 1:
          $scope.loadAnalyticsCharts("getTopTravelledCategories", "getTopTravelledCities", "topTravelledCategories", "topTravelledCities");
          break;
        case 2:
          $scope.loadAnalyticsCharts("getTopBookedCars", "getOwnerBookingTrend", "topBookedCars", "bookingTrend");
          break;
        case 3:
          $scope.loadAnalyticsTables("getTripTypeAnalysis", "tripTypeAnalysis");
          break;
        case 4:
          $scope.loadAnalyticsTables("getPerformanceAnalysis", "performanceAnalysis");
          break;
        case 5:
          $scope.loadAnalyticsTables("getCarFeatureAnalysis", "carFeatureAnalysis");
          break;
        case 6:
          $scope.loadAnalyticsTables("getLateReturnsAnalysis", "lateReturnsAnalysis");
          break;
      }
    }

    $scope.updateDateRange = function() {
      if($scope.dateRange.startDate > $scope.dateRange.endDate){
        ToastService.error("Start date cannot be greater than end date", 3000);
        return;
      }
      loadTabData($scope.currentTabIndex);
    };

    $scope.formatCurrency = function(value) {
      return value ? `₹${value.toFixed(2)}` : '₹0.00';
    };

    $scope.onTabSelect = function (index) {
      if ($scope.currentTabIndex === index) {
        return;
      }
      $scope.currentTabIndex = index;
      loadTabData(index);
    };
  },
]);
