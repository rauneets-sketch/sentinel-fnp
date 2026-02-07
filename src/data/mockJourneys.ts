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
      {
        category: "User Authentication",
        action: "Navigate to Login Page",
        status: "PASSED",
        duration_ms: 0.25,
      },
      {
        category: "User Authentication",
        action: "Dismiss Notification Popup",
        status: "PASSED",
        duration_ms: 0.25,
      },
      {
        category: "User Authentication",
        action: "Click Guest Login",
        status: "PASSED",
        duration_ms: 0.25,
      },
      {
        category: "User Authentication",
        action: "Email Entry",
        status: "PASSED",
        duration_ms: 0.25,
      },
      {
        category: "Homepage Setup",
        action: "Clear Cart",
        status: "PASSED",
        duration_ms: 0.25,
      },
      {
        category: "Homepage Setup",
        action: "Set Delivery Location",
        status: "PASSED",
        duration_ms: 0.25,
      },
      {
        category: "Product Discovery",
        action: "Navigate to Gift Finder",
        status: "PASSED",
        duration_ms: 0.25,
      },
      {
        category: "Product Selection",
        action: "Navigate to Carnations",
        status: "PASSED",
        duration_ms: 0.25,
      },
      {
        category: "Cart Management",
        action: "Add Product to Cart",
        status: "PASSED",
        duration_ms: 0.25,
      },
      {
        category: "Payment Process",
        action: "Proceed to Payment",
        status: "PASSED",
        duration_ms: 0.25,
      },
      {
        category: "Order Completion",
        action: "PNC Created Successfully",
        status: "PASSED",
        duration_ms: 0.25,
      },
    ],
    status: "PASSED",
    passed: 11,
    failed: 0,
    duration: 2.75,
  },
  {
    id: 2,
    name: "Payment Methods Testing",
    steps: [
      {
        category: "Product Discovery",
        action: "Navigate to Cakes Section",
        status: "PASSED",
        duration_ms: 0.25,
      },
      {
        category: "Product Selection",
        action: "Select Cake Product",
        status: "PASSED",
        duration_ms: 0.25,
      },
      {
        category: "Delivery Setup",
        action: "Select Date & Time Slot",
        status: "FAILED",
        duration_ms: 0.25,
      },
    ],
    status: "FAILED",
    passed: 2,
    failed: 1,
    duration: 0.75,
  },
];

export const MOBILE_JOURNEYS = [
  {
    id: 1,
    name: "Home Page Exploration",
    status: "PASSED",
    passed: 14,
    failed: 0,
    duration: 5753,
    steps: [
      {
        category: "Navigation",
        action: "am on the FNP website",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "User Authentication",
        action: "Navigate to Login Page",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "User Authentication",
        action: "Click Guest Login",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "User Authentication",
        action: "Email Entry",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "User Authentication",
        action: "OTP Entry",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Homepage Setup",
        action: "Clear Cart",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Homepage Setup",
        action: "Set Delivery Location",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Product Discovery",
        action: "Navigate to PLP",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Product Discovery",
        action: "Apply Filters & Browse (Enchanting Orchid Celebration)",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Delivery Setup",
        action: "Select Date & Time Slot",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Cart Management",
        action: "Add Product to Cart",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Payment Process",
        action: "Proceed to Payment",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Order Completion",
        action: "Generate Order Number",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Homepage Setup",
        action: "Clear Cart",
        status: "PASSED",
        duration_ms: 410.98,
      },
    ],
  },
  {
    id: 2,
    name: "Payment Methods Testing",
    status: "FAILED",
    passed: 6,
    failed: 1,
    duration: 2877,
    steps: [
      {
        category: "Product Discovery",
        action: "navigate to cake products",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Product Selection",
        action: "select a cake for purchase",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Delivery Setup",
        action: "set delivery date and proceed to payment",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Payment Process",
        action: "should be on the payment page",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Payment Process",
        action: "test card payment method",
        status: "FAILED",
        duration_ms: 410.98,
      },
      {
        category: "Order Completion",
        action: "should have completed all payment method tests",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Homepage Setup",
        action: "Clear Cart",
        status: "PASSED",
        duration_ms: 410.98,
      },
    ],
  },
  {
    id: 3,
    name: "International Phone Number Change",
    status: "PASSED",
    passed: 9,
    failed: 0,
    duration: 3699,
    steps: [
      {
        category: "Profile Management",
        action: "navigate to my profile",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Profile Management",
        action: "change my international phone number",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Navigation",
        action: "navigate back to homepage",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Product Selection",
        action: "select a wedding product",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Delivery Setup",
        action: "set wedding delivery date and add to cart",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Address Management",
        action: "edit sender phone number in DA page",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Payment Process",
        action: "proceed to wedding payment and cancel",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Order Completion",
        action: "should have completed the phone number change flow",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Homepage Setup",
        action: "Clear Cart",
        status: "PASSED",
        duration_ms: 410.98,
      },
    ],
  },
  {
    id: 4,
    name: "Set New Reminder Testing",
    status: "PASSED",
    passed: 5,
    failed: 0,
    duration: 2055,
    steps: [
      {
        category: "Navigation",
        action: "navigate to reminder section",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Reminder Management",
        action: "create a new reminder",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Reminder Management",
        action: "schedule a gift",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Order Completion",
        action: "should have completed the reminder and FAQ flow",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Homepage Setup",
        action: "Clear Cart",
        status: "PASSED",
        duration_ms: 410.98,
      },
    ],
  },
  {
    id: 5,
    name: "International Purchase",
    status: "PASSED",
    passed: 10,
    failed: 0,
    duration: 4110,
    steps: [
      {
        category: "Navigation",
        action: "navigate to international section",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Product Discovery",
        action: "select birthday category",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Location Setup",
        action: "set international delivery location",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Product Selection",
        action: "select international product",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Delivery Setup",
        action: "set international delivery date and explore details",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Cart Management",
        action: "add international product to cart",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Payment Process",
        action: "test international payment",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Order Completion",
        action: "should have completed the international purchase flow",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Homepage Setup",
        action: "Clear Cart",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "User Authentication",
        action: "Navigate to Login Page",
        status: "PASSED",
        duration_ms: 410.98,
      },
    ],
  },
  {
    id: 9,
    name: "Cake Variant Testing",
    status: "PASSED",
    passed: 2,
    failed: 0,
    duration: 822,
    steps: [
      {
        category: "Product Discovery",
        action: "navigate to Fudge Brownie Cake product",
        status: "PASSED",
        duration_ms: 410.98,
      },
      {
        category: "Delivery Setup",
        action: "set cake variant delivery date and add to cart with add-ons",
        status: "PASSED",
        duration_ms: 410.98,
      },
    ],
  },
];

export const OMS_JOURNEYS: Journey[] = [
  {
    id: 1,
    name: "OMS Complete Workflow",
    status: "PASSED",
    passed: 11,
    failed: 0,
    duration: 5350,
    steps: [
      {
        category: "Order Management",
        action: "Create New Order",
        status: "PASSED",
        duration_ms: 500,
      },
      {
        category: "Order Tracking",
        action: "Track Order Status",
        status: "PASSED",
        duration_ms: 400,
      },
      {
        category: "Payment Process",
        action: "Process Payment",
        status: "PASSED",
        duration_ms: 600,
      },
      {
        category: "Inventory",
        action: "Manage Inventory",
        status: "PASSED",
        duration_ms: 450,
      },
      {
        category: "Refund Management",
        action: "Process Refund",
        status: "PASSED",
        duration_ms: 550,
      },
      {
        category: "Reporting",
        action: "Generate Report",
        status: "PASSED",
        duration_ms: 350,
      },
      {
        category: "Order Management",
        action: "Bulk Upload Orders",
        status: "PASSED",
        duration_ms: 700,
      },
      {
        category: "Customer Management",
        action: "Manage Customers",
        status: "PASSED",
        duration_ms: 400,
      },
      {
        category: "Delivery Management",
        action: "Assign Delivery",
        status: "PASSED",
        duration_ms: 500,
      },
      {
        category: "Return Management",
        action: "Manage Returns",
        status: "PASSED",
        duration_ms: 450,
      },
      {
        category: "Vendor Management",
        action: "Manage Vendors",
        status: "PASSED",
        duration_ms: 400,
      },
    ],
  },
];

export const ANDROID_JOURNEYS: Journey[] = [
  {
    id: 1,
    name: "Home Page Exploration",
    status: "FAILED",
    passed: 6,
    failed: 1,
    duration: 964700,
    steps: [
      {
        category: "User Authentication",
        action: "Perform Login",
        status: "PASSED",
        duration_ms: 137814,
      },
      {
        category: "Homepage Setup",
        action: "Set Delivery Location",
        status: "PASSED",
        duration_ms: 137814,
      },
      {
        category: "Product Discovery",
        action: "Scroll to Gift Finder",
        status: "PASSED",
        duration_ms: 137814,
      },
      {
        category: "Product Discovery",
        action: "Select Product",
        status: "PASSED",
        duration_ms: 137814,
      },
      {
        category: "Delivery Setup",
        action: "Select Date & Time Slot",
        status: "PASSED",
        duration_ms: 137814,
      },
      {
        category: "Cart Management",
        action: "Add to Cart",
        status: "PASSED",
        duration_ms: 137814,
      },
      {
        category: "Payment Process",
        action: "Process Payment",
        status: "FAILED",
        duration_ms: 137814,
      },
    ],
  },
];

export const PARTNER_PANEL_JOURNEYS: Journey[] = [
  {
    id: 1,
    name: "Partner Panel Complete Workflow",
    status: "PASSED",
    passed: 14,
    failed: 0,
    duration: 3373,
    steps: [
      {
        category: "OMS Tab Testing",
        action: "PNC-NEW",
        status: "PASSED",
        duration_ms: 295,
      },
      {
        category: "OMS Tab Testing",
        action: "PNI-NEW",
        status: "PASSED",
        duration_ms: 305,
      },
      {
        category: "OMS Tab Testing",
        action: "ABC-NEW",
        status: "PASSED",
        duration_ms: 262,
      },
      {
        category: "OMS Tab Testing",
        action: "ORDER-NOT-PAID",
        status: "PASSED",
        duration_ms: 914,
      },
      {
        category: "OMS Tab Testing",
        action: "PDF LOG",
        status: "PASSED",
        duration_ms: 1364,
      },
      {
        category: "OMS Tab Testing",
        action: "BulkInvoiceShipment",
        status: "PASSED",
        duration_ms: 152,
      },
      {
        category: "OMS Tab Testing",
        action: "Order Entry",
        status: "PASSED",
        duration_ms: 880,
      },
      {
        category: "OMS Tab Testing",
        action: "Bulk DHL Challan",
        status: "PASSED",
        duration_ms: 229,
      },
      {
        category: "OMS Tab Testing",
        action: "Bulk Component Print",
        status: "PASSED",
        duration_ms: 134,
      },
      {
        category: "OMS Tab Testing",
        action: "Order Allocation Failure Report",
        status: "PASSED",
        duration_ms: 219,
      },
      {
        category: "OMS Tab Testing",
        action: "Coupon Check",
        status: "PASSED",
        duration_ms: 137,
      },
      {
        category: "Verification",
        action: "Verify All Tabs Loaded",
        status: "PASSED",
        duration_ms: 50,
      },
      {
        category: "Performance",
        action: "Check Response Times",
        status: "PASSED",
        duration_ms: 45,
      },
      {
        category: "Completion",
        action: "Complete Partner Panel Testing",
        status: "PASSED",
        duration_ms: 40,
      },
    ],
  },
];
