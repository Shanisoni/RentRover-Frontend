/**
 * @description PDF Generation Factory - Handles all PDF document generation
 * Provides methods for creating various types of PDF documents like invoices and reports
 */
myApp.factory('PDFFactory', ['$window', function($window) {
  const { jsPDF } = $window.jspdf;
  
  /**
   * @description Generate a professional invoice PDF for a booking
   * @param {Object} booking - The booking object with all details
   * @param {Object} options - Additional options for invoice customization
   * @returns {Object} jsPDF document object that can be saved or opened
   */
  function generateBookingInvoice(booking, options = {}) {

    console.log("booking",booking);
    const doc = new jsPDF();
    
    // Default options
    const defaultOptions = {
      includeCompanyLogo: true,
      showDetailedCalculations: true,
      includeTerms: true,
      companyName: "EZYCAR",
      companyAddress: "Kirti Nagar, Delhi, India",
      companyContact: "+91 1234567890",
      companyEmail: "support@ezycar.com",
      companyWebsite: "www.ezycar.com"
    };
    
    // Merge default options with provided options
    const settings = {...defaultOptions, ...options};
    
    // Colors
    const primaryColor = [41, 128, 185]; // #2980b9
    const secondaryColor = [52, 73, 94]; // #34495e
    const accentColor = [231, 76, 60];   // #e74c3c
    
    // Spacing
    const lineGap = 6;
    const sectionGap = 10;
    let y = 15;
    
    // Helper functions
    const formatCurrency = (amount) => {
      const formattedNumber = parseFloat(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2
      });
      return `Rs. ${formattedNumber}`;
    };
    
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    });
    
    // Calculate booking values
    const duration = calculateDuration(booking.startDate, booking.endDate);
    const baseRentalCost = booking.car.basePrice * duration;
    const bidTotalAmount = booking.bidAmount * duration;
    const distanceCost = (booking.distanceTravelled || 0) * booking.car.pricePerKm;
    const outstationCharges = booking.tripType === 'outStation' ? (booking.car.outStationCharges * duration) : 0;
    const lateFees = booking.lateFee || 0;
    
    // Use bid amount instead of base rental in the final calculation
    const subtotal = booking.totalAmount;
    const totalAmount = subtotal;
    
    // Set document properties
    doc.setProperties({
      title: `EZYCAR Invoice ${booking._id}`,
      subject: 'Car Rental Invoice',
      author: 'EZYCAR',
      keywords: 'invoice, car rental',
      creator: 'EZYCAR PDF Generator'
    });

    // Header section with company info
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(settings.companyName, 20, y + 5);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(settings.companyAddress, 20, y + 12);
    doc.text(`Tel: ${settings.companyContact} | Email: ${settings.companyEmail}`, 20, y + 18);
    
    // Invoice title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 170, y + 10, { align: "right" });
    
    y += 45;

    // Invoice details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    // Invoice details box
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(249, 249, 249);
    doc.roundedRect(90, y, 100, 25, 1, 1, 'FD');
    
    doc.setFont("helvetica", "bold");
    doc.text("Invoice Number:", 92, y + 5);
    doc.text("Invoice Date:", 92, y + 11);
    doc.text("Booking ID:", 92, y + 17);
    
    doc.setFont("helvetica", "normal");
    doc.text(`INV-${booking._id}`, 185, y + 5, { align: "right" });
    doc.text(formatDate(booking.updatedAt), 185, y + 11, { align: "right" });
    doc.text(booking._id, 185, y + 17, { align: "right" });
    
    // Customer details
    doc.setFillColor(241, 241, 241);
    doc.roundedRect(20, y, 60, 25, 1, 1, 'FD');
    
    doc.setFont("helvetica", "bold");
    doc.text("Billed To:", 22, y + 5);
    
    doc.setFont("helvetica", "normal");
    doc.text(booking.user.name, 22, y + 11);
    doc.text(booking.user.email, 22, y + 17);
    doc.text(booking.user.phone || "No phone provided", 22, y + 23);
    
    y += 35;

    // Car & Booking summary
    doc.setFillColor(52, 73, 94);
    doc.rect(20, y, 170, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("BOOKING DETAILS", 105, y + 5, { align: "center" });
    
    y += 10;
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Create a table for booking summary
    doc.setFillColor(245, 245, 245);
    doc.rect(20, y, 170, 30, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.text("Car:", 22, y + 5);
    doc.text("Category:", 22, y + 11);
    doc.text("Fuel Type:", 22, y + 17);
    doc.text("Trip Type:", 22, y + 23);
    
    doc.setFont("helvetica", "normal");
    doc.text(booking.car.carName, 50, y + 5);
    doc.text(booking.car.category, 50, y + 11);
    doc.text(booking.car.fuelType, 50, y + 17);
    doc.text(booking.tripType === 'outStation' ? 'Outstation' : 'In-City', 50, y + 23);
    
    doc.setFont("helvetica", "bold");
    doc.text("Duration:", 100, y + 5);
    doc.text("Start Date:", 100, y + 11);
    doc.text("End Date:", 100, y + 17);
    doc.text("Bid Amount:", 100, y + 23);
    
    doc.setFont("helvetica", "normal");
    doc.text(`${duration} days`, 140, y + 5);
    doc.text(formatDate(booking.startDate), 140, y + 11);
    doc.text(formatDate(booking.endDate), 140, y + 17);
    doc.text(formatCurrency(booking.bidAmount), 140, y + 23);
    
    y += 32;
    
    // Charges breakdown header
    doc.setFillColor(52, 73, 94);
    doc.rect(20, y, 170, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("CHARGES BREAKDOWN", 105, y + 5, { align: "center" });
    
    y += 10;
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Table headers for charges
    doc.setFillColor(230, 230, 230);
    doc.rect(20, y, 110, 8, 'F');
    doc.rect(130, y, 60, 8, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.text("Description", 25, y + 5);
    doc.text("Amount", 165, y + 5, { align: "right" });
    
    y += 10;
    
    // Table rows for charges
    doc.setFont("helvetica", "normal");
    
    // Base rental
    doc.text(`Base Rental (${formatCurrency(booking.car.basePrice)} × ${duration} days)`, 25, y + 5);
    doc.text(formatCurrency(baseRentalCost), 165, y + 5, { align: "right" });
    
    y += 8;

    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    
    y += 5;
    
    // Bid amount
    doc.text(`Bid Amount (${formatCurrency(booking.bidAmount)} × ${duration} days)`, 25, y + 5);
    doc.text(formatCurrency(bidTotalAmount), 165, y + 5, { align: "right" });
    
    y += 8;
    
    // Distance charge
    doc.text(`Distance Charge (${booking.distanceTravelled || 0} km × ${formatCurrency(booking.car.pricePerKm)})`, 25, y + 5);
    doc.text(formatCurrency(distanceCost), 165, y + 5, { align: "right" });
    
    y += 8;
    
    // Outstation charges if applicable
    if (booking.tripType === 'outStation') {
      doc.text(`Outstation Charges (${formatCurrency(booking.car.outStationCharges)} × ${duration} days)`, 25, y + 5);
      doc.text(formatCurrency(outstationCharges), 165, y + 5, { align: "right" });
      y += 8;
    }
    
    // Late fees if applicable
    if (lateFees > 0) {
      const finePercentage = booking.car.finePercentage || 50;
      doc.text(`Late Return Fees (${booking.lateDays || 0} days × (${formatCurrency(booking.bidAmount)} + (${formatCurrency(booking.bidAmount)} × ${finePercentage}%)))`, 25, y + 5);
      doc.text(formatCurrency(lateFees), 165, y + 5, { align: "right" });
      y += 8;
    }
    
    // Subtotal
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    y += 5;
    
    doc.setFont("helvetica", "bold");
    doc.text("Subtotal", 25, y + 5);
    doc.text(formatCurrency(subtotal), 165, y + 5, { align: "right" });
    
    y += 8;
    
    // Total
    doc.setDrawColor(0, 0, 0);
    doc.line(130, y, 190, y);
    y += 5;
    
    doc.setFillColor(231, 76, 60);
    doc.rect(130, y, 60, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL", 135, y + 5);
    doc.text(formatCurrency(totalAmount), 188, y + 5, { align: "right" });
    
    y += 12;
    
    // Add pricing explanation note
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("Note: This is a system-generated invoice and does not require a signature.", 20, y + 5);
    
    y += 15;
    
    // Payment status
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(
      booking.paymentStatus === 'paid' ? 46 : 243, 
      booking.paymentStatus === 'paid' ? 204 : 156, 
      booking.paymentStatus === 'paid' ? 113 : 18
    );
    doc.roundedRect(20, y, 170, 10, 1, 1, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(
      booking.paymentStatus === 'paid' ? "PAYMENT COMPLETED" : "PAYMENT PENDING", 
      105, y + 6, { align: "center" }
    );
    
    y += 20;
    
    // Footer
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 280, 210, 17, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for choosing EZYCAR for your journey!", 105, 288, { align: "center" });
    doc.text(settings.companyWebsite, 105, 292, { align: "center" });
    
    return doc;
  }

  /**
   * @description Calculate duration between two dates in days
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @returns {number} Number of days (minimum 1)
   */
  function calculateDuration(startDate, endDate) {
    if (!startDate || !endDate) return 0;

    let start = new Date(startDate);
    let end = new Date(endDate);

    let diffTime = Math.abs(end - start);
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return diffDays;
  }

  return {
    generateBookingInvoice,
    calculateDuration
  };
}]); 