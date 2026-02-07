import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase Setup
const supabaseUrl =
  process.env.SUPABASE_URL || "https://wnymknrycmldwqzdqoct.supabase.co";
const supabaseKey =
  process.env.SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndueW1rbnJ5Y21sZHdxemRxb2N0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzcwMDk1MywiZXhwIjoyMDgzMjc2OTUzfQ.HCK8yC6jRIb67LUxOEEXI_dLs_fXcLK6m4_50iN8tPU";

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

app.use(express.json());

// Add CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma",
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.static(path.join(__dirname, "dist")));

// Mock Data Generator with correct Partner Panel data
const generateMockTestResults = () => {
  const generateMockSteps = (count, passed) => {
    return Array.from({ length: count }, (_, i) => ({
      name: `Step ${i + 1}`,
      status: i < passed ? "PASSED" : "FAILED",
      duration: Math.floor(Math.random() * 1000),
      step_name: `Step ${i + 1}`,
    }));
  };

  const createModule = (name, passed, failed, duration) => ({
    name,
    passed,
    failed,
    duration,
    status: failed > 0 ? "FAILED" : "PASSED",
    steps: generateMockSteps(passed + failed, passed),
  });

  return {
    desktop: {
      total: 16,
      passed: 16,
      failed: 0,
      skipped: 0,
      duration: 7, // Total execution: 7ms as specified
      lastRun: new Date().toISOString(),
      totalSteps: 16,
      modules: [
        createModule("Home Page Exploration", 14, 0, 1115),
        createModule("Payment Methods Testing", 8, 0, 611),
        createModule("International Phone Number Change", 8, 0, 618),
        createModule("Reminder and FAQ Testing", 6, 0, 470),
        createModule("International Purchase", 8, 0, 620),
        createModule("Combinational Purchase", 13, 0, 1002),
        createModule("Cake Variant Testing", 7, 0, 541),
        createModule("Coupon Testing", 10, 0, 763),
        createModule("Personalized Product Purchase", 8, 0, 618),
        createModule("Message Card Integration", 7, 0, 542),
        createModule("Product Exploration Journey", 5, 0, 388),
        createModule("Same SKU Product Exploration", 5, 0, 388),
        createModule("Search Based Purchase", 5, 0, 382),
        createModule("Photo Upload Purchases", 11, 0, 780),
        createModule("Location Testing", 9, 0, 415),
        createModule("Spherical Home Page Icon Exploration", 2, 0, 160),
        createModule("Gmail OTP Login", 6, 0, 490),
      ],
    },
    mobile: {
      total: 111,
      passed: 111,
      failed: 0,
      skipped: 0,
      duration: 8850,
      lastRun: new Date().toISOString(),
      totalSteps: 111,
      modules: [
        createModule("Home Page Exploration & Order Completion", 12, 0, 1000),
        createModule("Payment Methods Testing", 7, 0, 800),
        createModule("International Phone Number Change", 10, 0, 900),
        createModule("Set New Reminder & FAQ Testing", 6, 0, 600),
        createModule("International Purchase Flow", 9, 0, 850),
        createModule("Cake Variant Testing", 8, 0, 700),
        createModule("Coupon Testing", 7, 0, 500),
        createModule("Personalized Text Product", 7, 0, 750),
        createModule("Message Card Purchase", 6, 0, 700),
        createModule("Product Exploration Journey", 6, 0, 500),
        createModule(
          "Same SKU Delivery Comparison (Courier + Hand Delivery)",
          7,
          0,
          500,
        ),
        createModule("Search, Filter & Order Completion", 7, 0, 550),
        createModule(
          "Photo Upload Personalization (Single + Multiple)",
          10,
          0,
          600,
        ),
        createModule("Spherical Home Page Icon Exploration", 4, 0, 650),
        createModule("Gmail OTP", 5, 0, 400),
      ],
    },
    android: {
      total: 14,
      passed: 14,
      failed: 0,
      skipped: 0,
      duration: 3373,
      lastRun: new Date().toISOString(),
      totalSteps: 14,
      modules: [
        {
          name: "Partner Panel Complete Workflow",
          passed: 14,
          failed: 0,
          duration: 3373,
          status: "PASSED",
          steps: [
            {
              step_name: "PNC-NEW",
              status: "PASSED",
              duration_ms: 295,
              category: "OMS Tab Testing",
            },
            {
              step_name: "PNI-NEW",
              status: "PASSED",
              duration_ms: 305,
              category: "OMS Tab Testing",
            },
            {
              step_name: "ABC-NEW",
              status: "PASSED",
              duration_ms: 262,
              category: "OMS Tab Testing",
            },
            {
              step_name: "ORDER-NOT-PAID",
              status: "PASSED",
              duration_ms: 914,
              category: "OMS Tab Testing",
            },
            {
              step_name: "PDF LOG",
              status: "PASSED",
              duration_ms: 1364,
              category: "OMS Tab Testing",
            },
            {
              step_name: "BulkInvoiceShipment",
              status: "PASSED",
              duration_ms: 152,
              category: "OMS Tab Testing",
            },
            {
              step_name: "Order Entry",
              status: "PASSED",
              duration_ms: 880,
              category: "OMS Tab Testing",
            },
            {
              step_name: "Bulk DHL Challan",
              status: "PASSED",
              duration_ms: 229,
              category: "OMS Tab Testing",
            },
            {
              step_name: "Bulk Component Print",
              status: "PASSED",
              duration_ms: 134,
              category: "OMS Tab Testing",
            },
            {
              step_name: "Order Allocation Failure Report",
              status: "PASSED",
              duration_ms: 219,
              category: "OMS Tab Testing",
            },
            {
              step_name: "Coupon Check",
              status: "PASSED",
              duration_ms: 137,
              category: "OMS Tab Testing",
            },
            {
              step_name: "Verify All Tabs Loaded",
              status: "PASSED",
              duration_ms: 50,
              category: "Verification",
            },
            {
              step_name: "Check Response Times",
              status: "PASSED",
              duration_ms: 45,
              category: "Performance",
            },
            {
              step_name: "Complete Partner Panel Testing",
              status: "PASSED",
              duration_ms: 40,
              category: "Completion",
            },
          ],
        },
      ],
    },
    ios: {
      comingSoon: true,
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      lastRun: new Date().toISOString(),
      modules: [],
    },
    oms: {
      total: 11,
      passed: 11,
      failed: 0,
      skipped: 0,
      duration: 5350,
      lastRun: new Date().toISOString(),
      totalSteps: 11,
      modules: [
        {
          name: "OMS Complete Workflow",
          passed: 11,
          failed: 0,
          duration: 5350,
          status: "PASSED",
          steps: [
            {
              step_name: "Create New Order",
              status: "PASSED",
              duration_ms: 500,
              category: "Order Management",
            },
            {
              step_name: "Track Order Status",
              status: "PASSED",
              duration_ms: 400,
              category: "Order Tracking",
            },
            {
              step_name: "Process Payment",
              status: "PASSED",
              duration_ms: 600,
              category: "Payment Process",
            },
            {
              step_name: "Manage Inventory",
              status: "PASSED",
              duration_ms: 450,
              category: "Inventory",
            },
            {
              step_name: "Process Refund",
              status: "PASSED",
              duration_ms: 550,
              category: "Refund Management",
            },
            {
              step_name: "Generate Report",
              status: "PASSED",
              duration_ms: 350,
              category: "Reporting",
            },
            {
              step_name: "Bulk Upload Orders",
              status: "PASSED",
              duration_ms: 700,
              category: "Order Management",
            },
            {
              step_name: "Manage Customers",
              status: "PASSED",
              duration_ms: 400,
              category: "Customer Management",
            },
            {
              step_name: "Assign Delivery",
              status: "PASSED",
              duration_ms: 500,
              category: "Delivery Management",
            },
            {
              step_name: "Manage Returns",
              status: "PASSED",
              duration_ms: 450,
              category: "Return Management",
            },
            {
              step_name: "Manage Vendors",
              status: "PASSED",
              duration_ms: 400,
              category: "Vendor Management",
            },
          ],
        },
      ],
    },
  };
};

// API Routes
app.get("/api/test-results", async (req, res) => {
  try {
    const mockResults = generateMockTestResults();
    res.json(mockResults);
  } catch (error) {
    console.error("Error in /api/test-results:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/index", async (req, res) => {
  try {
    const mockResults = generateMockTestResults();
    res.json(mockResults);
  } catch (error) {
    console.error("Error in /api/index:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Serve React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔧 API: http://localhost:${PORT}/api/test-results`);
});
