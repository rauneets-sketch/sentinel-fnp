export interface JourneyStep {
  category?: string;
  action?: string;
  step_name?: string;
  status?: string;
  duration_ms?: number;
  error_message?: string;
  error_type?: string;
}

export interface Journey {
  id: number;
  name: string;
  steps: JourneyStep[];
  status?: string;
  passed?: number;
  failed?: number;
  duration?: number;
}

export const DESKTOP_JOURNEYS: Journey[] = [
  {
    id: 1,
    name: "Home Page Exploration",
    steps: [
      { category: "User Authentication", action: "Navigate to Login Page" },
      { category: "User Authentication", action: "Navigate to Login Page" },
      { category: "User Authentication", action: "Dismiss Notification Popup" },
      { category: "User Authentication", action: "Click Guest Login" },
      { category: "User Authentication", action: "Email Entry" },
      { category: "Homepage Setup", action: "Clear Cart" },
      { category: "Homepage Setup", action: "Set Delivery Location" },
      { category: "Product Discovery", action: "Navigate to Gift Finder" },
      { category: "Product Selection", action: "Navigate to Carnations" },
      { category: "Product Selection", action: "Navigate to Carnations" },
      { category: "Cart Management", action: "Add Product to Cart" },
      { category: "Payment Process", action: "Proceed to Payment" },
      { category: "Order Completion", action: "PNC Created Successfully" },
    ],
    status: "PASSED",
    passed: 1,
    failed: 0,
  },
  {
    id: 2,
    name: "Payment Methods Testing",
    steps: [
      { category: "Product Discovery", action: "Navigate to Cakes Section" },
      { category: "Product Selection", action: "Select Cake Product" },
      { category: "Delivery Setup", action: "Select Date & Time Slot" },
      { category: "Payment Process", action: "Proceed to Payment" },
      { category: "Payment Process", action: "Test QR Payment Method" },
      { category: "Payment Process", action: "Test UPI Payment Method" },
      { category: "Payment Process", action: "Test Card Payment Method" },
      { category: "Order Completion", action: "All Payment Methods Tested" },
    ],
    status: "PASSED",
    passed: 1,
    failed: 0,
  },
  {
    id: 3,
    name: "International Phone Number Change",
    steps: [
      { category: "Profile Management", action: "Navigate to Profile Page" },
      {
        category: "Profile Management",
        action: "Change International Phone Number",
      },
      { category: "Navigation", action: "Return to Homepage" },
      { category: "Product Discovery", action: "Navigate to Wedding Section" },
      { category: "Delivery Setup", action: "Set Wedding Delivery Date" },
      { category: "Address Management", action: "Edit Sender Phone Number" },
      { category: "Payment Process", action: "Proceed and Cancel Payment" },
      { category: "Order Completion", action: "Phone Number Change Completed" },
    ],
    status: "PASSED",
    passed: 1,
    failed: 0,
  },
  {
    id: 4,
    name: "Reminder and FAQ Testing",
    steps: [
      { category: "Navigation", action: "Navigate to Reminder Section" },
      { category: "Reminder Management", action: "Create New Reminder" },
      { category: "Reminder Management", action: "Schedule Gift" },
      { category: "Navigation", action: "Navigate to FAQ Section" },
      { category: "FAQ Management", action: "Explore FAQ Categories" },
      {
        category: "Order Completion",
        action: "Reminder and FAQ Flow Completed",
      },
    ],
    status: "PASSED",
    passed: 1,
    failed: 0,
  },
  {
    id: 5,
    name: "International Purchase",
    steps: [
      { category: "Navigation", action: "Navigate to International Section" },
      { category: "Location Setup", action: "Select UAE as Destination" },
      {
        category: "Location Setup",
        action: "Set International Delivery Location",
      },
      { category: "Product Selection", action: "Select International Product" },
      { category: "Delivery Setup", action: "Set International Delivery Date" },
      {
        category: "Cart Management",
        action: "Add International Product to Cart",
      },
      { category: "Payment Process", action: "Test International Payment" },
      {
        category: "Order Completion",
        action: "International Purchase Completed",
      },
    ],
    status: "PASSED",
    passed: 1,
    failed: 0,
  },
  {
    id: 7,
    name: "Combinational Purchase",
    steps: [
      { category: "User Authentication", action: "Navigate to Login Page" },
      {
        category: "Product Selection",
        action: "Navigate to Anniversary Product",
      },
      { category: "Product Selection", action: "Select Domestic Product" },
      { category: "Delivery Setup", action: "Set Domestic Delivery Date" },
      { category: "Cart Management", action: "Add Domestic Product to Cart" },
      { category: "Navigation", action: "Navigate to International Section" },
      { category: "Location Setup", action: "Select USA as Destination" },
      {
        category: "Product Selection",
        action: "Navigate to International Section",
      },
      {
        category: "Product Selection",
        action: "Select International Anniversary Product",
      },
      { category: "Delivery Setup", action: "Set International Delivery Date" },
      {
        category: "Cart Management",
        action: "Add International Product and Checkout",
      },
      { category: "Payment Process", action: "Test Combinational Payment" },
      {
        category: "Order Completion",
        action: "Combinational Purchase Completed",
      },
    ],
    status: "PASSED",
    passed: 1,
    failed: 0,
  },
  {
    id: 9,
    name: "Cake Variant Testing",
    steps: [
      { category: "User Authentication", action: "Navigate to Login Page" },
      {
        category: "Navigation",
        action: "Navigate to Fudge Brownie Cake Product",
      },
      { category: "Delivery Setup", action: "Set Cake Variant Delivery Date" },
      { category: "Variant Testing", action: "Change the Cake Variant" },
      { category: "Payment Process", action: "Proceed to Payment" },
      {
        category: "Payment Process",
        action: "Test QR Payment for Cake Variant",
      },
      {
        category: "Order Completion",
        action: "Cake Variant Testing Completed",
      },
    ],
    status: "PASSED",
    passed: 1,
    failed: 0,
  },
  {
    id: 10,
    name: "Invalid Coupon Testing",
    steps: [
      { category: "User Authentication", action: "Navigate to Login Page" },
      {
        category: "Navigation",
        action: "Navigate to Chocolate Truffle Cake Product",
      },
      { category: "Cart Management", action: "Add Product to Cart" },
      {
        category: "Coupon Testing",
        action: "Apply Invalid Coupon Code (INVALID10)",
      },
      {
        category: "Navigation",
        action: "Navigate to Chocolate Truffle Cake Product",
      },
    ],
    status: "PASSED",
    passed: 1,
    failed: 0,
  },
  {
    id: 11,
    name: "Valid Coupon Testing",
    steps: [
      {
        category: "Coupon Testing",
        action: "Apply Valid Coupon Code (GIFT10)",
      },
      { category: "Payment Process", action: "Proceed to Payment" },
      { category: "Payment Process", action: "Test QR Payment Method" },
      { category: "Order Completion", action: "Coupon Testing Completed" },
      { category: "Navigation", action: "Return to Homepage" },
    ],
    status: "PASSED",
    passed: 1,
    failed: 0,
  },
  {
    id: 12,
    name: "Personalized Product Purchase",
    steps: [
      {
        category: "Navigation",
        action: "Navigate to Personalized Water Bottle",
      },
      { category: "Personalization", action: 'Add Custom Text "ASTHA SINGH"' },
      {
        category: "Cart Management",
        action: "Add Personalized Product to Cart",
      },
      { category: "Payment Process", action: "Proceed to Payment Page" },
      { category: "Payment Process", action: "Test QR Payment Method" },
      { category: "Navigation", action: "Navigate Back to Homepage" },
      {
        category: "Order Completion",
        action: "Personalized Purchase Completed",
      },
      { category: "Navigation", action: "Navigate Back to Homepage" },
    ],
    status: "PASSED",
    passed: 1,
    failed: 0,
  },
  {
    id: 13,
    name: "Message Card Integration",
    steps: [
      { category: "Navigation", action: "Navigate to Celebration Bento Cake" },
      { category: "Delivery Setup", action: "Set Delivery Date and Time" },
      {
        category: "Message Card",
        action: "Add Free Message Card with Custom Text",
      },
      { category: "Payment Process", action: "Proceed to Payment Page" },
      { category: "Payment Process", action: "Test QR Payment Method" },
      { category: "Navigation", action: "Return to Homepage" },
      {
        category: "Order Completion",
        action: "Message Card Purchase Completed",
      },
    ],
    status: "PASSED",
    passed: 1,
    failed: 0,
  },
  {
    id: 14,
    name: "Product Exploration Journey",
    steps: [
      {
        category: "Product Navigation",
        action: "Navigate to Exotic Blue Orchid",
      },
      { category: "Photo Gallery", action: "Open Main Product Image" },
      {
        category: "Product Details",
        action: "Check Description & Instructions",
      },
      { category: "Journey Step", action: "I Navigate Back To Fnp Homepage" },
      { category: "Order Completion", action: "Product Exploration Completed" },
    ],
    status: "PASSED",
    passed: 1,
    failed: 0,
  },
  {
    id: 15,
    name: "Same SKU Product Exploration",
    steps: [
      {
        category: "Product Navigation",
        action: "Navigate to Jade Plant Product",
      },
      {
        category: "Delivery Setup",
        action: "Set Courier Delivery Date & Time Slot",
      },
      { category: "Cart Management", action: "Add Product to Cart (Courier)" },
      { category: "Journey Step", action: "I Navigate Back To Fnp Homepage" },
      {
        category: "Order Completion",
        action: "Same SKU Exploration Completed",
      },
    ],
    status: "PASSED",
    passed: 1,
    failed: 0,
  },
  {
    id: 16,
    name: "Search Based Purchase",
    steps: [
      {
        category: "Search Function",
        action: 'Search for "cake" in Search Bar',
      },
      { category: "Delivery Setup", action: "Set Delivery Date & Time Slot" },
      { category: "Cart Management", action: "Add Search Product to Cart" },
      { category: "Payment Process", action: "Test QR Payment Method" },
      {
        category: "Order Completion",
        action: "Search Based Purchase Completed",
      },
    ],
    status: "PASSED",
    passed: 1,
    failed: 0,
  },
  {
    id: 17,
    name: "Personalized Product with Upload 1 Photo Purchase",
    steps: [
      {
        category: "Navigation",
        action: "Navigate to Personalized Cushion Product",
      },
      {
        category: "Photo Upload",
        action: "Upload Custom Photo from Local Path",
      },
      {
        category: "Cart Management",
        action: "Add Personalized Product to Cart",
      },
      { category: "Payment Process", action: "Test QR Payment Method" },
      { category: "Navigation", action: "Navigate Back to Homepage" },
    ],
    status: "PASSED",
    passed: 1,
    failed: 0,
  },
  {
    id: 18,
    name: "Personalized Product with Upload 4 Photo Purchase",
    steps: [
      { category: "Navigation", action: "Navigate to Fridge Magnet Product" },
      {
        category: "Delivery Setup",
        action: "Set Delivery Date (15th) & Time Slot (8-9 AM)",
      },
      {
        category: "Photo Upload",
        action: "Upload 4 Custom Photos (photo1-4.jpg)",
      },
      { category: "Cart Management", action: "Add Fridge Magnet to Cart" },
      { category: "Payment Process", action: "Test QR Payment Method" },
      {
        category: "Order Completion",
        action: "Multi-Photo Upload Journey Completed",
      },
    ],
    status: "PASSED",
    passed: 1,
    failed: 0,
  },
  {
    id: 19,
    name: "Location Testing",
    steps: [
      {
        category: "Navigation",
        action: "Navigate to Homepage for Location Journey",
      },
      { category: "Location Change", action: "Select New Pincode Gurgaon" },
      { category: "Location Change", action: "Select Delhi Location" },
      {
        category: "Navigation",
        action: "Navigate to PLP and Select Existing Bangalore Pincode",
      },
      { category: "Location Change", action: "Select Gorakhpur Pincode" },
      {
        category: "Location Change",
        action: "Select Final Bangalore Location",
      },
      {
        category: "Navigation",
        action: "Return to Homepage After Location Testing",
      },
      { category: "Order Completion", action: "Location Testing Completed" },
      {
        category: "Navigation",
        action: "Navigate to Homepage for Icon Exploration",
      },
    ],
    status: "PASSED",
    passed: 1,
    failed: 0,
  },
];

export const MOBILE_JOURNEYS = [
  {
    id: 1,
    name: "Journey 1: Home Page Exploration",
    status: "PASSED",
    passed: 1,
    failed: 0,
    duration: 1000,
    steps: [
      { category: "User Authentication", action: "Navigate to Login Page" },
      { category: "User Authentication", action: "Navigate to Login Page" },
      { category: "User Authentication", action: "Dismiss Notification Popup" },
      { category: "User Authentication", action: "Click Guest Login" },
      { category: "User Authentication", action: "Email Entry" },
      { category: "Homepage Setup", action: "Clear Cart" },
      { category: "Homepage Setup", action: "Set Delivery Location" },
      { category: "Product Discovery", action: "Navigate to Gift Finder" },
      { category: "Product Selection", action: "Navigate to Carnations" },
      { category: "Product Selection", action: "Navigate to Carnations" },
      { category: "Cart Management", action: "Add Product to Cart" },
      { category: "Payment Process", action: "Proceed to Payment" },
      { category: "Order Completion", action: "PNC Created Successfully" },
    ],
  },
  {
    id: 2,
    name: "Journey 2: Payment Methods Testing",
    status: "PASSED",
    passed: 1,
    failed: 0,
    duration: 800,
    steps: [
      { category: "Product Discovery", action: "Navigate to Cakes Section" },
      { category: "Product Selection", action: "Select Cake Product" },
      { category: "Delivery Setup", action: "Select Date & Time Slot" },
      { category: "Payment Process", action: "Proceed to Payment" },
      { category: "Payment Process", action: "Test QR Payment Method" },
      { category: "Payment Process", action: "Test UPI Payment Method" },
      { category: "Payment Process", action: "Test Card Payment Method" },
      { category: "Order Completion", action: "All Payment Methods Tested" },
    ],
  },
  {
    id: 3,
    name: "Journey 3: International Phone Number Change",
    status: "PASSED",
    passed: 1,
    failed: 0,
    duration: 900,
    steps: [
      { category: "Profile Management", action: "Navigate to Profile Page" },
      {
        category: "Profile Management",
        action: "Change International Phone Number",
      },
      { category: "Navigation", action: "Return to Homepage" },
      { category: "Product Discovery", action: "Navigate to Wedding Section" },
      { category: "Delivery Setup", action: "Set Wedding Delivery Date" },
      { category: "Address Management", action: "Edit Sender Phone Number" },
      { category: "Payment Process", action: "Proceed and Cancel Payment" },
      { category: "Order Completion", action: "Phone Number Change Completed" },
    ],
  },
  {
    id: 4,
    name: "Journey 4: Reminder and FAQ Testing",
    status: "PASSED",
    passed: 1,
    failed: 0,
    duration: 600,
    steps: [
      { category: "Navigation", action: "Navigate to Reminder Section" },
      { category: "Reminder Management", action: "Create New Reminder" },
      { category: "Reminder Management", action: "Schedule Gift" },
      { category: "Navigation", action: "Navigate to FAQ Section" },
      { category: "FAQ Management", action: "Explore FAQ Categories" },
      {
        category: "Order Completion",
        action: "Reminder and FAQ Flow Completed",
      },
    ],
  },
  {
    id: 5,
    name: "Journey 5: International Purchase",
    status: "PASSED",
    passed: 1,
    failed: 0,
    duration: 850,
    steps: [
      { category: "Navigation", action: "Navigate to International Section" },
      { category: "Location Setup", action: "Select UAE as Destination" },
      {
        category: "Location Setup",
        action: "Set International Delivery Location",
      },
      { category: "Product Selection", action: "Select International Product" },
      { category: "Delivery Setup", action: "Set International Delivery Date" },
      {
        category: "Cart Management",
        action: "Add International Product to Cart",
      },
      { category: "Payment Process", action: "Test International Payment" },
      {
        category: "Order Completion",
        action: "International Purchase Completed",
      },
    ],
  },
  {
    id: 9,
    name: "Journey 9: Cake Variant Testing",
    status: "PASSED",
    passed: 1,
    failed: 0,
    duration: 700,
    steps: [
      { category: "User Authentication", action: "Navigate to Login Page" },
      {
        category: "Navigation",
        action: "Navigate to Fudge Brownie Cake Product",
      },
      { category: "Delivery Setup", action: "Set Cake Variant Delivery Date" },
      { category: "Variant Testing", action: "Change the Cake Variant" },
      { category: "Payment Process", action: "Proceed to Payment" },
      {
        category: "Payment Process",
        action: "Test QR Payment for Cake Variant",
      },
      {
        category: "Order Completion",
        action: "Cake Variant Testing Completed",
      },
    ],
  },
  {
    id: 10,
    name: "Journey 10A: Invalid Coupon Testing",
    status: "PASSED",
    passed: 1,
    failed: 0,
    duration: 500,
    steps: [
      { category: "User Authentication", action: "Navigate to Login Page" },
      {
        category: "Navigation",
        action: "Navigate to Chocolate Truffle Cake Product",
      },
      { category: "Cart Management", action: "Add Product to Cart" },
      {
        category: "Coupon Testing",
        action: "Apply Invalid Coupon Code (INVALID10)",
      },
      {
        category: "Navigation",
        action: "Navigate to Chocolate Truffle Cake Product",
      },
    ],
  },
  {
    id: 11,
    name: "Journey 10B: Valid Coupon Testing",
    status: "PASSED",
    passed: 1,
    failed: 0,
    duration: 600,
    steps: [
      {
        category: "Coupon Testing",
        action: "Apply Valid Coupon Code (GIFT10)",
      },
      { category: "Payment Process", action: "Proceed to Payment" },
      { category: "Payment Process", action: "Test QR Payment Method" },
      { category: "Order Completion", action: "Coupon Testing Completed" },
      { category: "Navigation", action: "Return to Homepage" },
    ],
  },
  {
    id: 12,
    name: "Journey 11: Personalized Product Purchase",
    status: "PASSED",
    passed: 1,
    failed: 0,
    duration: 750,
    steps: [
      {
        category: "Navigation",
        action: "Navigate to Personalized Water Bottle",
      },
      { category: "Personalization", action: 'Add Custom Text "ASTHA SINGH"' },
      {
        category: "Cart Management",
        action: "Add Personalized Product to Cart",
      },
      { category: "Payment Process", action: "Proceed to Payment Page" },
      { category: "Payment Process", action: "Test QR Payment Method" },
      { category: "Navigation", action: "Navigate Back to Homepage" },
      {
        category: "Order Completion",
        action: "Personalized Purchase Completed",
      },
    ],
  },
  {
    id: 13,
    name: "Journey 12: Message Card Integration",
    status: "PASSED",
    passed: 1,
    failed: 0,
    duration: 700,
    steps: [
      { category: "Navigation", action: "Navigate to Celebration Bento Cake" },
      { category: "Delivery Setup", action: "Set Delivery Date and Time" },
      {
        category: "Message Card",
        action: "Add Free Message Card with Custom Text",
      },
      { category: "Payment Process", action: "Proceed to Payment Page" },
      { category: "Payment Process", action: "Test QR Payment Method" },
      { category: "Navigation", action: "Return to Homepage" },
      {
        category: "Order Completion",
        action: "Message Card Purchase Completed",
      },
    ],
  },
  {
    id: 14,
    name: "Journey 13: Product Exploration Journey",
    status: "PASSED",
    passed: 1,
    failed: 0,
    duration: 500,
    steps: [
      {
        category: "Product Navigation",
        action: "Navigate to Exotic Blue Orchid",
      },
      { category: "Photo Gallery", action: "Open Main Product Image" },
      {
        category: "Product Details",
        action: "Check Description & Instructions",
      },
      { category: "Journey Step", action: "I Navigate Back To Fnp Homepage" },
      { category: "Order Completion", action: "Product Exploration Completed" },
    ],
  },
  {
    id: 15,
    name: "Journey 14: Same SKU Product Exploration",
    status: "PASSED",
    passed: 1,
    failed: 0,
    duration: 500,
    steps: [
      {
        category: "Product Navigation",
        action: "Navigate to Jade Plant Product",
      },
      {
        category: "Delivery Setup",
        action: "Set Courier Delivery Date & Time Slot",
      },
      { category: "Cart Management", action: "Add Product to Cart (Courier)" },
      { category: "Journey Step", action: "I Navigate Back To Fnp Homepage" },
      {
        category: "Order Completion",
        action: "Same SKU Exploration Completed",
      },
    ],
  },
  {
    id: 16,
    name: "Journey 15: Search Based Purchase",
    status: "PASSED",
    passed: 1,
    failed: 0,
    duration: 550,
    steps: [
      {
        category: "Search Function",
        action: 'Search for "cake" in Search Bar',
      },
      { category: "Delivery Setup", action: "Set Delivery Date & Time Slot" },
      { category: "Cart Management", action: "Add Search Product to Cart" },
      { category: "Payment Process", action: "Test QR Payment Method" },
      {
        category: "Order Completion",
        action: "Search Based Purchase Completed",
      },
    ],
  },
  {
    id: 17,
    name: "Journey 16A: Personalized Product with Upload 1 Photo Purchase",
    status: "PASSED",
    passed: 1,
    failed: 0,
    duration: 600,
    steps: [
      {
        category: "Navigation",
        action: "Navigate to Personalized Cushion Product",
      },
      {
        category: "Photo Upload",
        action: "Upload Custom Photo from Local Path",
      },
      {
        category: "Cart Management",
        action: "Add Personalized Product to Cart",
      },
      { category: "Payment Process", action: "Test QR Payment Method" },
      { category: "Navigation", action: "Navigate Back to Homepage" },
    ],
  },
  {
    id: 18,
    name: "Journey 16B: Personalized Product with Upload 4 Photo Purchase",
    status: "PASSED",
    passed: 1,
    failed: 0,
    duration: 650,
    steps: [
      { category: "Navigation", action: "Navigate to Fridge Magnet Product" },
      {
        category: "Delivery Setup",
        action: "Set Delivery Date (15th) & Time Slot (8-9 AM)",
      },
      {
        category: "Photo Upload",
        action: "Upload 4 Custom Photos (photo1-4.jpg)",
      },
      { category: "Cart Management", action: "Add Fridge Magnet to Cart" },
      { category: "Payment Process", action: "Test QR Payment Method" },
      {
        category: "Order Completion",
        action: "Multi-Photo Upload Journey Completed",
      },
    ],
  },
];

export const OMS_JOURNEYS: Journey[] = [
  {
    id: 1,
    name: "OMS Order Creation",
    steps: [
      { category: "Order Management", action: "Navigate to OMS Dashboard" },
      { category: "Order Management", action: "Create New Order" },
      { category: "Customer Details", action: "Enter Customer Information" },
      { category: "Product Selection", action: "Select Products" },
      { category: "Delivery Setup", action: "Set Delivery Details" },
      { category: "Order Completion", action: "Order Created Successfully" },
    ],
  },
  {
    id: 2,
    name: "OMS Order Tracking",
    steps: [
      { category: "Order Management", action: "Navigate to Orders List" },
      { category: "Order Tracking", action: "Search Order by ID" },
      { category: "Order Tracking", action: "View Order Status" },
      { category: "Order Tracking", action: "Track Delivery" },
      { category: "Order Completion", action: "Order Tracking Complete" },
    ],
  },
  {
    id: 3,
    name: "OMS Payment Processing",
    steps: [
      { category: "Order Management", action: "Navigate to Pending Orders" },
      { category: "Payment Process", action: "Process Payment" },
      { category: "Payment Process", action: "Verify Payment Status" },
      { category: "Order Management", action: "Update Order Status" },
      { category: "Order Completion", action: "Payment Processing Complete" },
    ],
  },
  {
    id: 4,
    name: "OMS Inventory Management",
    steps: [
      { category: "Inventory", action: "Navigate to Inventory" },
      { category: "Inventory", action: "Check Stock Levels" },
      { category: "Inventory", action: "Update Product Stock" },
      { category: "Inventory", action: "View Stock History" },
      { category: "Order Completion", action: "Inventory Management Complete" },
    ],
  },
  {
    id: 5,
    name: "OMS Refund Processing",
    steps: [
      { category: "Order Management", action: "Navigate to Orders" },
      { category: "Refund Management", action: "Select Order for Refund" },
      { category: "Refund Management", action: "Process Refund" },
      { category: "Refund Management", action: "Verify Refund Status" },
      { category: "Order Completion", action: "Refund Processing Complete" },
    ],
  },
  {
    id: 6,
    name: "OMS Report Generation",
    steps: [
      { category: "Reporting", action: "Navigate to Reports" },
      { category: "Reporting", action: "Select Report Type" },
      { category: "Reporting", action: "Set Date Range" },
      { category: "Reporting", action: "Generate Report" },
      { category: "Reporting", action: "Download Report" },
      { category: "Order Completion", action: "Report Generation Complete" },
    ],
  },
  {
    id: 7,
    name: "OMS Bulk Order Upload",
    steps: [
      { category: "Order Management", action: "Navigate to Bulk Upload" },
      { category: "Order Management", action: "Select CSV File" },
      { category: "Order Management", action: "Validate Orders" },
      { category: "Order Management", action: "Upload Orders" },
      { category: "Order Completion", action: "Bulk Upload Complete" },
    ],
  },
  {
    id: 8,
    name: "OMS Customer Management",
    steps: [
      { category: "Customer Management", action: "Navigate to Customers" },
      { category: "Customer Management", action: "Search Customer" },
      { category: "Customer Management", action: "View Customer Details" },
      { category: "Customer Management", action: "Update Customer Info" },
      { category: "Order Completion", action: "Customer Management Complete" },
    ],
  },
  {
    id: 9,
    name: "OMS Delivery Assignment",
    steps: [
      { category: "Delivery Management", action: "Navigate to Deliveries" },
      { category: "Delivery Management", action: "View Pending Deliveries" },
      { category: "Delivery Management", action: "Assign Delivery Partner" },
      { category: "Delivery Management", action: "Update Delivery Status" },
      { category: "Order Completion", action: "Delivery Assignment Complete" },
    ],
  },
  {
    id: 10,
    name: "OMS Return Management",
    steps: [
      { category: "Return Management", action: "Navigate to Returns" },
      { category: "Return Management", action: "Create Return Request" },
      { category: "Return Management", action: "Verify Return Items" },
      { category: "Return Management", action: "Process Return" },
      { category: "Order Completion", action: "Return Management Complete" },
    ],
  },
];

export const PARTNER_PANEL_JOURNEYS: Journey[] = [
  {
    id: 1,
    name: "Partner Panel Complete Workflow",
    steps: [
      { category: "Navigation", action: "Home", duration_ms: 427 },
      { category: "Sales", action: "Sales", duration_ms: 192 },
      { category: "Order Management", action: "Orders", duration_ms: 190 },
      { category: "Support", action: "Raise Ticket", duration_ms: 150 },
      { category: "Support", action: "My Tickets", duration_ms: 147 },
      { category: "Operations", action: "Bulk Print", duration_ms: 148 },
      { category: "Operations", action: "Download Challan", duration_ms: 126 },
      { category: "Performance", action: "SLA", duration_ms: 210 },
      { category: "Delivery Tracking", action: "Today", duration_ms: 162 },
      { category: "Delivery Tracking", action: "Tomorrow", duration_ms: 249 },
      { category: "Delivery Tracking", action: "Future", duration_ms: 249 },
      {
        category: "Delivery Status",
        action: "Out for delivery/Ready for",
        duration_ms: 159,
      },
      {
        category: "Delivery Status",
        action: "Delivery Attempted",
        duration_ms: 240,
      },
      { category: "Delivery Status", action: "Delivered", duration_ms: 236 },
    ],
  },
];
