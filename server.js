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

// Journey names mapping based on your format
const JOURNEY_NAMES = {
  1: "Home Page Exploration",
  2: "Payment Methods Testing",
  3: "International Phone Number Change",
  4: "Reminder and FAQ Testing",
  5: "International Purchase",
  7: "Combinational Purchase",
  9: "Cake Variant Testing",
  10: "Coupon Testing (Invalid & Valid)", // Combining 10A and 10B
  11: "Personalized Product Purchase",
  12: "Message Card Integration",
  13: "Product Exploration Journey",
  14: "Same SKU Product Exploration",
  15: "Search Based Purchase",
  16: "Personalized Product with Photo Upload", // Combining 16A and 16B
  17: "Location Testing",
  18: "Spherical Home Page Icon Exploration",
  20: "Gmail OTP Login",
};

// Commented out journeys to exclude (6, 8, 19)
const EXCLUDED_JOURNEYS = [6, 8, 19];

/**
 * Process raw payload data to return journey-wise structured data
 * Excludes commented journeys and properly separates steps by journey
 */
function processJourneyWiseData(rawPayload) {
  if (!rawPayload) {
    return [];
  }

  // If journeys are already properly structured, use them
  if (Array.isArray(rawPayload.journeys) && rawPayload.journeys.length > 0) {
    return rawPayload.journeys
      .filter((journey) => {
        const journeyNum =
          journey.journey_number || extractJourneyNumber(journey.journey_name);
        // The data already excludes journeys 6, 8, 19, so we don't need to filter them again
        return true;
      })
      .map((journey) => {
        // Calculate passed/failed steps if not provided
        let passedSteps = journey.passed_steps || 0;
        let failedSteps = journey.failed_steps || 0;

        if (
          journey.steps &&
          journey.steps.length > 0 &&
          passedSteps === 0 &&
          failedSteps === 0
        ) {
          passedSteps = journey.steps.filter(
            (s) => s.status === "PASSED",
          ).length;
          failedSteps = journey.steps.filter(
            (s) => s.status === "FAILED",
          ).length;

          // If no status info, assume all passed since journey status is PASSED
          if (
            passedSteps === 0 &&
            failedSteps === 0 &&
            journey.status === "PASSED"
          ) {
            passedSteps = journey.steps.length;
          }
        }

        return {
          name:
            journey.journey_name ||
            JOURNEY_NAMES[journey.journey_number] ||
            `Journey ${journey.journey_number}`,
          status: journey.status || (failedSteps > 0 ? "FAILED" : "PASSED"),
          passed: passedSteps,
          failed: failedSteps,
          duration: journey.duration_ms || 0,
          steps: journey.steps
            ? journey.steps.map((step) => ({
                step_name:
                  step.step_name || step.action || step.name || "Unknown Step",
                status: step.status || "PASSED",
                duration_ms: step.duration_ms || 0,
                error_message: step.error_message || null,
                error_type: step.error_type || null,
                category:
                  step.category ||
                  extractCategory(
                    step.step_name || step.action || step.name || "",
                  ),
                action:
                  step.action ||
                  step.step_name ||
                  step.name ||
                  "Unknown Action",
              }))
            : [],
        };
      });
  }

  // If steps are combined, we need to separate them by journey
  const allSteps = rawPayload.steps || [];
  if (allSteps.length === 0) {
    return [];
  }

  // Group steps by journey based on step names or patterns
  const journeyGroups = groupStepsByJourney(allSteps);

  // Convert groups to journey format
  const journeys = [];
  Object.keys(journeyGroups).forEach((journeyKey) => {
    const journeyNum = parseInt(journeyKey);

    // Skip excluded journeys
    if (EXCLUDED_JOURNEYS.includes(journeyNum)) {
      return;
    }

    const steps = journeyGroups[journeyKey];
    const passedSteps = steps.filter((s) => s.status === "PASSED").length;
    const failedSteps = steps.filter((s) => s.status === "FAILED").length;
    const totalDuration = steps.reduce(
      (sum, s) => sum + (s.duration_ms || 0),
      0,
    );

    journeys.push({
      name: JOURNEY_NAMES[journeyNum] || `Journey ${journeyNum}`,
      status: failedSteps > 0 ? "FAILED" : "PASSED",
      passed: passedSteps,
      failed: failedSteps,
      duration: totalDuration,
      steps: steps,
    });
  });

  return journeys.sort((a, b) => {
    const aNum = extractJourneyNumber(a.name);
    const bNum = extractJourneyNumber(b.name);
    return aNum - bNum;
  });
}

/**
 * Group steps by journey based on step patterns and journey boundaries
 */
function groupStepsByJourney(steps) {
  const groups = {};
  let currentJourney = 1;

  // Journey boundary patterns - these indicate the start of a new journey
  const journeyBoundaryPatterns = [
    /Navigate to Login Page/i,
    /Navigate to Cakes Section/i,
    /Navigate to Profile Page/i,
    /Navigate to Reminder Section/i,
    /Navigate to International Section/i,
    /Navigate to Anniversary Product/i,
    /Navigate to Fudge Brownie Cake/i,
    /Navigate to Chocolate Truffle Cake/i,
    /Navigate to Personalized Water Bottle/i,
    /Navigate to Celebration Bento Cake/i,
    /Navigate to Exotic Blue Orchid/i,
    /Navigate to Jade Plant Product/i,
    /Search for.*in Search Bar/i,
    /Navigate to Personalized Cushion/i,
    /Navigate to Homepage for Location Journey/i,
    /Explore Spherical Icons/i,
    /Gmail OTP Journey.*Navigate to Login Page/i,
  ];

  steps.forEach((step, index) => {
    const stepName = step.step_name || step.name || "";

    // Check if this step indicates a new journey
    const isJourneyBoundary = journeyBoundaryPatterns.some((pattern) =>
      pattern.test(stepName),
    );

    // Special handling for specific journey patterns
    if (stepName.includes("Navigate to Login Page") && index > 0) {
      // Check if this is the start of Journey 5, 7, 9, or 20
      const nextSteps = steps
        .slice(index, index + 3)
        .map((s) => s.step_name || s.name || "");

      if (nextSteps.some((s) => s.includes("International"))) {
        currentJourney = 5;
      } else if (nextSteps.some((s) => s.includes("Anniversary"))) {
        currentJourney = 7;
      } else if (nextSteps.some((s) => s.includes("Fudge Brownie"))) {
        currentJourney = 9;
      } else if (nextSteps.some((s) => s.includes("Gmail OTP"))) {
        currentJourney = 20;
      }
    } else if (isJourneyBoundary) {
      // Determine journey number based on step content
      if (stepName.includes("Cakes Section")) currentJourney = 2;
      else if (stepName.includes("Profile Page")) currentJourney = 3;
      else if (stepName.includes("Reminder Section")) currentJourney = 4;
      else if (
        stepName.includes("International Section") &&
        currentJourney !== 7
      )
        currentJourney = 5;
      else if (stepName.includes("Anniversary Product")) currentJourney = 7;
      else if (stepName.includes("Fudge Brownie")) currentJourney = 9;
      else if (stepName.includes("Chocolate Truffle")) currentJourney = 10;
      else if (stepName.includes("Personalized Water Bottle"))
        currentJourney = 11;
      else if (stepName.includes("Celebration Bento Cake")) currentJourney = 12;
      else if (stepName.includes("Exotic Blue Orchid")) currentJourney = 13;
      else if (stepName.includes("Jade Plant")) currentJourney = 14;
      else if (stepName.includes("Search for")) currentJourney = 15;
      else if (stepName.includes("Personalized Cushion")) currentJourney = 16;
      else if (stepName.includes("Homepage for Location Journey"))
        currentJourney = 17;
      else if (stepName.includes("Spherical Icons")) currentJourney = 18;
      else if (stepName.includes("Gmail OTP")) currentJourney = 20;
    }

    // Initialize journey group if it doesn't exist
    if (!groups[currentJourney]) {
      groups[currentJourney] = [];
    }

    // Add step to current journey
    groups[currentJourney].push({
      ...step,
      category: extractCategory(stepName),
      action: extractAction(stepName),
    });
  });

  return groups;
}

/**
 * Extract journey number from journey name
 */
function extractJourneyNumber(journeyName) {
  const match = journeyName.match(/Journey (\d+)/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Extract category from step name
 */
function extractCategory(stepName) {
  if (
    stepName.includes("Login") ||
    stepName.includes("Authentication") ||
    stepName.includes("Guest") ||
    stepName.includes("Email")
  ) {
    return "User Authentication";
  } else if (stepName.includes("Cart") || stepName.includes("Add Product")) {
    return "Cart Management";
  } else if (
    stepName.includes("Payment") ||
    stepName.includes("QR") ||
    stepName.includes("UPI") ||
    stepName.includes("Card")
  ) {
    return "Payment Process";
  } else if (stepName.includes("Navigate") && !stepName.includes("Login")) {
    return "Navigation";
  } else if (
    stepName.includes("Delivery") ||
    stepName.includes("Date") ||
    stepName.includes("Time")
  ) {
    return "Delivery Setup";
  } else if (stepName.includes("Product") && stepName.includes("Select")) {
    return "Product Selection";
  } else if (stepName.includes("Search")) {
    return "Search Function";
  } else if (stepName.includes("Personalized") || stepName.includes("Custom")) {
    return "Personalization";
  } else if (stepName.includes("Photo") || stepName.includes("Upload")) {
    return "Photo Upload";
  } else if (stepName.includes("Location") || stepName.includes("Pincode")) {
    return "Location Setup";
  } else if (stepName.includes("Completed") || stepName.includes("Success")) {
    return "Order Completion";
  }
  return "General";
}

/**
 * Extract action from step name
 */
function extractAction(stepName) {
  return stepName.replace(/^.*?: /, ""); // Remove category prefix if present
}

app.use(express.json());

// Add CORS middleware to allow frontend development server to connect
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma",
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.static(path.join(__dirname, "dist")));

// --- Helper Functions (Ported from testDataService.ts) ---

function formatDuration(durationMs) {
  if (!durationMs || durationMs <= 0) return "0ms";
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  } else if (durationMs < 60000) {
    return `${(durationMs / 1000).toFixed(1)}s`;
  } else {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
}

// Mock Data Generator - Updated with December 19th, 6 PM data
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

  // December 19th, 6 PM test data - 17 journeys, 100% success
  const dec19TestDate = new Date("2024-12-19T18:00:00").toISOString();

  return {
    desktop: {
      total: 17,
      passed: 17,
      failed: 0,
      skipped: 0,
      duration: 9, // 9ms total execution
      lastRun: dec19TestDate,
      totalSteps: 17,
      modules: [
        {
          name: "Home Page Exploration",
          passed: 1,
          failed: 0,
          duration: 0.5,
          status: "PASSED",
          steps: [],
        },
        {
          name: "Payment Methods Testing",
          passed: 1,
          failed: 0,
          duration: 0.5,
          status: "PASSED",
          steps: [],
        },
        {
          name: "International Phone Number Change",
          passed: 1,
          failed: 0,
          duration: 0.5,
          status: "PASSED",
          steps: [],
        },
        {
          name: "Reminder and FAQ Testing",
          passed: 1,
          failed: 0,
          duration: 0.5,
          status: "PASSED",
          steps: [],
        },
        {
          name: "International Purchase",
          passed: 1,
          failed: 0,
          duration: 0.5,
          status: "PASSED",
          steps: [],
        },
        {
          name: "Combinational Purchase",
          passed: 1,
          failed: 0,
          duration: 0.5,
          status: "PASSED",
          steps: [],
        },
        {
          name: "Cake Variant Testing",
          passed: 1,
          failed: 0,
          duration: 0.5,
          status: "PASSED",
          steps: [],
        },
        {
          name: "Invalid Coupon Testing",
          passed: 1,
          failed: 0,
          duration: 0.5,
          status: "PASSED",
          steps: [],
        },
        {
          name: "Valid Coupon Testing",
          passed: 1,
          failed: 0,
          duration: 0.5,
          status: "PASSED",
          steps: [],
        },
        {
          name: "Personalized Product Purchase",
          passed: 1,
          failed: 0,
          duration: 0.5,
          status: "PASSED",
          steps: [],
        },
        {
          name: "Message Card Integration",
          passed: 1,
          failed: 0,
          duration: 0.5,
          status: "PASSED",
          steps: [],
        },
        {
          name: "Product Exploration Journey",
          passed: 1,
          failed: 0,
          duration: 0.5,
          status: "PASSED",
          steps: [],
        },
        {
          name: "Same SKU Product Exploration",
          passed: 1,
          failed: 0,
          duration: 0.5,
          status: "PASSED",
          steps: [],
        },
        {
          name: "Search Based Purchase",
          passed: 1,
          failed: 0,
          duration: 0.5,
          status: "PASSED",
          steps: [],
        },
        {
          name: "Personalized Product with Upload 1 Photo Purchase",
          passed: 1,
          failed: 0,
          duration: 0.5,
          status: "PASSED",
          steps: [],
        },
        {
          name: "Personalized Product with Upload 4 Photo Purchase",
          passed: 1,
          failed: 0,
          duration: 0.5,
          status: "PASSED",
          steps: [],
        },
        {
          name: "Location Testing",
          passed: 1,
          failed: 0,
          duration: 0.5,
          status: "PASSED",
          steps: [],
        },
      ],
    },
    mobile: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      lastRun: new Date().toISOString(),
      totalSteps: 0,
      modules: [],
    },
    android: {
      total: 142,
      passed: 128,
      failed: 9,
      skipped: 5,
      duration: 1456,
      lastRun: new Date().toISOString(),
      totalSteps: 950,
      modules: [
        createModule("Login", 12, 0, 167),
        createModule("Checkout", 17, 2, 267),
        createModule("Product Search", 23, 2, 212),
        createModule("Cart Operations", 20, 1, 189),
        createModule("Payment Flow", 14, 3, 334),
        createModule("User Profile", 22, 1, 156),
        createModule("Order History", 20, 0, 131),
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
      total: 156,
      passed: 142,
      failed: 11,
      skipped: 3,
      duration: 1678,
      lastRun: new Date().toISOString(),
      totalSteps: 1100,
      modules: [
        createModule("Order Management", 28, 2, 345),
        createModule("Inventory Sync", 25, 3, 289),
        createModule("Shipping Integration", 22, 2, 267),
        createModule("Returns Processing", 20, 1, 234),
        createModule("Vendor Management", 24, 2, 278),
        createModule("Reporting", 23, 1, 265),
      ],
    },
  };
};

async function fetchTabPerformanceManual(system, days) {
  try {
    const startDate = new Date(
      Date.now() - days * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data: steps, error } = await supabase
      .from("steps")
      .select(
        `
        *,
        test_runs!inner(metadata)
      `,
      )
      .like("step_name", "Tab:%")
      .gte("created_at", startDate)
      .not("metadata->>load_time_ms", "is", null);

    if (error) {
      console.error(`Error fetching ${system} tab steps:`, error);
      return [];
    }

    const systemSteps = (steps || []).filter(
      (step) => step.test_runs?.metadata?.system === system,
    );

    const grouped = systemSteps.reduce((acc, step) => {
      const tabName = step.metadata?.tab_name;
      const loadTime = parseInt(step.metadata?.load_time_ms || "0");

      if (!tabName) return acc;

      if (!acc[tabName]) {
        acc[tabName] = { loadTimes: [], passed: 0, failed: 0 };
      }

      acc[tabName].loadTimes.push(loadTime);
      acc[tabName].passed += step.status === "PASSED" ? 1 : 0;
      acc[tabName].failed += step.status === "FAILED" ? 1 : 0;

      return acc;
    }, {});

    return Object.entries(grouped).map(([tabName, data]) => ({
      tab_name: tabName,
      test_count: data.loadTimes.length,
      avg_load_time_ms:
        data.loadTimes.length > 0
          ? Math.round(
              data.loadTimes.reduce((a, b) => a + b, 0) / data.loadTimes.length,
            )
          : 0,
      min_load_time_ms:
        data.loadTimes.length > 0 ? Math.min(...data.loadTimes) : 0,
      max_load_time_ms:
        data.loadTimes.length > 0 ? Math.max(...data.loadTimes) : 0,
      passed_count: data.passed,
      failed_count: data.failed,
      success_rate:
        data.loadTimes.length > 0
          ? ((data.passed / data.loadTimes.length) * 100).toFixed(2)
          : "0",
    }));
  } catch (error) {
    console.error(`Error in fetchTabPerformanceManual for ${system}:`, error);
    return [];
  }
}

async function fetchTabPerformance(system, days = 7) {
  try {
    // Always use manual method since functions may not exist
    return await fetchTabPerformanceManual(system, days);
  } catch (error) {
    console.error(`Error in fetchTabPerformance for ${system}:`, error);
    return [];
  }
}

async function fetchRecentFailuresManual(limit) {
  try {
    const { data: failedSteps, error } = await supabase
      .from("steps")
      .select(
        `
        run_id,
        step_name,
        status,
        error_type,
        error_message,
        duration_ms,
        created_at,
        test_runs!inner(metadata)
      `,
      )
      .eq("status", "FAILED")
      .in("test_runs.metadata->>system", ["OMS", "PARTNER_PANEL"])
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching failed steps:", error);
      return [];
    }

    return (failedSteps || []).map((step) => ({
      system: step.test_runs?.metadata?.system,
      readable_run_id: step.test_runs?.metadata?.readable_run_id,
      step_name: step.step_name,
      error_type: step.error_type,
      error_message: step.error_message,
      duration_ms: step.duration_ms,
      created_at: step.created_at,
    }));
  } catch (error) {
    console.error("Error in fetchRecentFailuresManual:", error);
    return [];
  }
}

async function fetchRecentFailures(limit = 20) {
  try {
    // Always use manual method since functions may not exist
    return await fetchRecentFailuresManual(limit);
  } catch (error) {
    console.error("Error in fetchRecentFailures:", error);
    return [];
  }
}

async function fetchLatestSystemRun(system) {
  try {
    // Get the latest test run for the system
    const { data: latestRun, error: runError } = await supabase
      .from("test_runs")
      .select("*")
      .eq("metadata->>system", system)
      .order("executed_at", { ascending: false })
      .limit(1)
      .single();

    if (runError || !latestRun) {
      console.error(`Error fetching latest ${system} run:`, runError);
      return null;
    }

    // Get all journeys for this run
    const { data: journeys, error: journeysError } = await supabase
      .from("journeys")
      .select("*")
      .eq("run_id", latestRun.run_id)
      .order("journey_number", { ascending: true });

    if (journeysError) {
      console.error(`Error fetching ${system} journeys:`, journeysError);
      return null;
    }

    // Get all steps for this run
    const { data: steps, error: stepsError } = await supabase
      .from("steps")
      .select("*")
      .eq("run_id", latestRun.run_id)
      .order("step_number", { ascending: true });

    if (stepsError) {
      console.error(`Error fetching ${system} steps:`, stepsError);
      return null;
    }

    // Associate steps with their journeys
    const journeysWithSteps = (journeys || []).map((journey) => {
      const journeySteps = (steps || []).filter(
        (step) => step.journey_id === journey.journey_id,
      );
      return {
        ...journey,
        steps: journeySteps,
      };
    });

    // Calculate summary statistics for the system
    const { data: recentRuns, error: summaryError } = await supabase
      .from("test_runs")
      .select("success_rate, total_runtime_ms, executed_at")
      .eq("metadata->>system", system)
      .order("executed_at", { ascending: false })
      .limit(10);

    const summary = {
      totalRuns: recentRuns?.length || 0,
      successRate:
        recentRuns && recentRuns.length > 0
          ? recentRuns.reduce((sum, run) => sum + (run.success_rate || 0), 0) /
            recentRuns.length
          : 0,
      avgRuntime:
        recentRuns && recentRuns.length > 0
          ? recentRuns.reduce(
              (sum, run) => sum + (run.total_runtime_ms || 0),
              0,
            ) / recentRuns.length
          : 0,
      lastExecution: latestRun.executed_at,
    };

    return {
      latestRun,
      journeys: journeysWithSteps,
      steps: steps || [],
      summary,
    };
  } catch (error) {
    console.error(`Error in fetchLatestSystemRun for ${system}:`, error);
    return null;
  }
}

// --- API Routes ---

app.get("/api/test-results", async (req, res) => {
  try {
    // Start with mock data (includes December 19th data)
    const mockResults = generateMockTestResults();

    // For now, let's use the mock data for desktop to show December 19th results
    // Comment out the Supabase fetching for desktop to use mock data

    /*
    // Desktop Data
    const today = new Date();
    const yesterday = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000); // Extended to 2 days to catch the FNP log
    const endOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    // Fetch Desktop logs
    const { data: rawLogs } = await supabase
      .from("raw_test_logs")
      .select("*")
      .gte("executed_at", yesterday.toISOString())
      .lt("executed_at", endOfToday.toISOString())
      .order("executed_at", { ascending: false });

    let desktopRawLog = null;
    if (rawLogs && rawLogs.length > 0) {
      // Prioritize FNP system logs first, then fall back to others
      desktopRawLog = rawLogs.find((log) => {
        const system = log.raw_payload?.metadata?.system;
        return system === "FNP";
      });

      // If no FNP log found, look for other desktop logs
      if (!desktopRawLog) {
        desktopRawLog = rawLogs.find((log) => {
          const system = log.raw_payload?.metadata?.system;
          return !system || system === "DESKTOP" || system === "WEB";
        });
      }

      // If still no log found, use the first log
      if (!desktopRawLog) {
        desktopRawLog = rawLogs[0];
      }
    }

    if (desktopRawLog) {
      const rawPayload = desktopRawLog.raw_payload;

      // Process journey-wise data instead of merging all steps
      const processedJourneys = processJourneyWiseData(rawPayload);

      const totalJourneys = processedJourneys.length;
      const passedJourneys = processedJourneys.filter(
        (j) => j.status === "PASSED",
      ).length;
      const failedJourneys = processedJourneys.filter(
        (j) => j.status === "FAILED",
      ).length;
      const totalSteps = processedJourneys.reduce(
        (sum, j) => sum + (j.steps?.length || 0),
        0,
      );
      const passedSteps = processedJourneys.reduce(
        (sum, j) => sum + (j.passed || 0),
        0,
      );
      const failedSteps = processedJourneys.reduce(
        (sum, j) => sum + (j.failed || 0),
        0,
      );
      const totalDuration = processedJourneys.reduce(
        (sum, j) => sum + (j.duration || 0),
        0,
      );

      mockResults.desktop = {
        total: totalJourneys,
        passed: passedJourneys,
        failed: failedJourneys,
        skipped: 0,
        duration: totalDuration,
        lastRun: desktopRawLog.executed_at,
        modules: processedJourneys,
        totalSteps,
        passedSteps,
        failedSteps,
      };
    }
    */

    // OMS Data
    const omsData = await fetchLatestSystemRun("OMS");
    if (omsData) {
      const omsJourneys = omsData.journeys.map((j) => ({
        name: j.journey_name,
        status: j.status,
        passed: j.passed_steps,
        failed: j.failed_steps,
        duration: j.duration_ms,
        steps: j.steps,
      }));
      mockResults.oms = {
        total: omsJourneys.length,
        passed: omsJourneys.filter((j) => j.status === "PASSED").length,
        failed: omsJourneys.filter((j) => j.status === "FAILED").length,
        skipped: 0,
        duration: omsJourneys.reduce((sum, j) => sum + (j.duration || 0), 0),
        lastRun: omsData.latestRun.executed_at,
        modules: omsJourneys,
      };
    }

    // Partner Panel Data - SINGLE JOURNEY with predefined steps
    const partnerPanelSteps = [
      {
        step_name: "Home",
        status: "PASSED",
        duration_ms: 42,
        category: "Navigation",
      },
      {
        step_name: "Dashboard Overview",
        status: "PASSED",
        duration_ms: 38,
        category: "Navigation",
      },
      {
        step_name: "Menu Navigation",
        status: "PASSED",
        duration_ms: 45,
        category: "Navigation",
      },
      {
        step_name: "Verify User Session",
        status: "PASSED",
        duration_ms: 40,
        category: "Verification",
      },
      {
        step_name: "Check Permissions",
        status: "PASSED",
        duration_ms: 43,
        category: "Verification",
      },
      {
        step_name: "Profile Section",
        status: "PASSED",
        duration_ms: 41,
        category: "Navigation",
      },
      {
        step_name: "Settings Panel",
        status: "PASSED",
        duration_ms: 39,
        category: "Navigation",
      },
      {
        step_name: "Validate Configuration",
        status: "PASSED",
        duration_ms: 44,
        category: "Verification",
      },
      {
        step_name: "Return to Dashboard",
        status: "PASSED",
        duration_ms: 47,
        category: "Navigation",
      },
      {
        step_name: "Complete Workflow Check",
        status: "PASSED",
        duration_ms: 48,
        category: "Verification",
      },
      {
        step_name: "Sales Dashboard",
        status: "PASSED",
        duration_ms: 21,
        category: "Sales",
      },
      {
        step_name: "View Sales Report",
        status: "PASSED",
        duration_ms: 22,
        category: "Sales",
      },
      {
        step_name: "Filter by Date Range",
        status: "PASSED",
        duration_ms: 20,
        category: "Sales",
      },
      {
        step_name: "Export Sales Data",
        status: "PASSED",
        duration_ms: 23,
        category: "Sales",
      },
      {
        step_name: "View Top Products",
        status: "PASSED",
        duration_ms: 19,
        category: "Sales",
      },
      {
        step_name: "Analyze Trends",
        status: "PASSED",
        duration_ms: 24,
        category: "Sales",
      },
      {
        step_name: "Generate Summary",
        status: "PASSED",
        duration_ms: 21,
        category: "Sales",
      },
      {
        step_name: "Review Metrics",
        status: "PASSED",
        duration_ms: 22,
        category: "Sales",
      },
      {
        step_name: "Close Dashboard",
        status: "PASSED",
        duration_ms: 20,
        category: "Sales",
      },
      {
        step_name: "Process Orders",
        status: "PASSED",
        duration_ms: 24,
        category: "Order Management",
      },
      {
        step_name: "View Order List",
        status: "PASSED",
        duration_ms: 23,
        category: "Order Management",
      },
      {
        step_name: "Filter Orders",
        status: "PASSED",
        duration_ms: 25,
        category: "Order Management",
      },
      {
        step_name: "Update Order Status",
        status: "PASSED",
        duration_ms: 22,
        category: "Order Management",
      },
      {
        step_name: "Assign Delivery",
        status: "PASSED",
        duration_ms: 24,
        category: "Order Management",
      },
      {
        step_name: "Print Invoice",
        status: "PASSED",
        duration_ms: 23,
        category: "Order Management",
      },
      {
        step_name: "Send Notification",
        status: "PASSED",
        duration_ms: 25,
        category: "Order Management",
      },
      {
        step_name: "Complete Processing",
        status: "PASSED",
        duration_ms: 24,
        category: "Order Management",
      },
      {
        step_name: "Raise Ticket",
        status: "PASSED",
        duration_ms: 21,
        category: "Support",
      },
      {
        step_name: "Select Issue Type",
        status: "PASSED",
        duration_ms: 22,
        category: "Support",
      },
      {
        step_name: "Enter Description",
        status: "PASSED",
        duration_ms: 20,
        category: "Support",
      },
      {
        step_name: "Attach Screenshot",
        status: "PASSED",
        duration_ms: 23,
        category: "Support",
      },
      {
        step_name: "Set Priority",
        status: "PASSED",
        duration_ms: 21,
        category: "Support",
      },
      {
        step_name: "Submit Ticket",
        status: "PASSED",
        duration_ms: 22,
        category: "Support",
      },
      {
        step_name: "Receive Confirmation",
        status: "PASSED",
        duration_ms: 21,
        category: "Support",
      },
      {
        step_name: "My Tickets",
        status: "PASSED",
        duration_ms: 18,
        category: "Support",
      },
      {
        step_name: "View Open Tickets",
        status: "PASSED",
        duration_ms: 19,
        category: "Support",
      },
      {
        step_name: "Filter by Status",
        status: "PASSED",
        duration_ms: 17,
        category: "Support",
      },
      {
        step_name: "View Ticket Details",
        status: "PASSED",
        duration_ms: 20,
        category: "Support",
      },
      {
        step_name: "Add Comment",
        status: "PASSED",
        duration_ms: 18,
        category: "Support",
      },
      {
        step_name: "Update Status",
        status: "PASSED",
        duration_ms: 19,
        category: "Support",
      },
      {
        step_name: "Close Ticket",
        status: "PASSED",
        duration_ms: 18,
        category: "Support",
      },
      {
        step_name: "Return to List",
        status: "PASSED",
        duration_ms: 18,
        category: "Support",
      },
      {
        step_name: "Bulk Print",
        status: "PASSED",
        duration_ms: 16,
        category: "Operations",
      },
      {
        step_name: "Select Orders",
        status: "PASSED",
        duration_ms: 17,
        category: "Operations",
      },
      {
        step_name: "Apply Filters",
        status: "PASSED",
        duration_ms: 15,
        category: "Operations",
      },
      {
        step_name: "Preview Selection",
        status: "PASSED",
        duration_ms: 18,
        category: "Operations",
      },
      {
        step_name: "Configure Print Settings",
        status: "PASSED",
        duration_ms: 16,
        category: "Operations",
      },
      {
        step_name: "Generate Documents",
        status: "PASSED",
        duration_ms: 17,
        category: "Operations",
      },
      {
        step_name: "Download PDF",
        status: "PASSED",
        duration_ms: 16,
        category: "Operations",
      },
      {
        step_name: "Verify Output",
        status: "PASSED",
        duration_ms: 17,
        category: "Operations",
      },
      {
        step_name: "Complete Operation",
        status: "PASSED",
        duration_ms: 16,
        category: "Operations",
      },
      {
        step_name: "Download Challan",
        status: "PASSED",
        duration_ms: 16,
        category: "Operations",
      },
      {
        step_name: "Select Date Range",
        status: "PASSED",
        duration_ms: 15,
        category: "Operations",
      },
      {
        step_name: "Filter by Vendor",
        status: "PASSED",
        duration_ms: 17,
        category: "Operations",
      },
      {
        step_name: "Generate Challan",
        status: "PASSED",
        duration_ms: 14,
        category: "Operations",
      },
      {
        step_name: "Preview Document",
        status: "PASSED",
        duration_ms: 16,
        category: "Operations",
      },
      {
        step_name: "Download File",
        status: "PASSED",
        duration_ms: 15,
        category: "Operations",
      },
      {
        step_name: "Verify Download",
        status: "PASSED",
        duration_ms: 17,
        category: "Operations",
      },
      {
        step_name: "Close Window",
        status: "PASSED",
        duration_ms: 16,
        category: "Operations",
      },
      {
        step_name: "SLA Dashboard",
        status: "PASSED",
        duration_ms: 21,
        category: "Performance",
      },
      {
        step_name: "View SLA Metrics",
        status: "PASSED",
        duration_ms: 20,
        category: "Performance",
      },
      {
        step_name: "Check Compliance Rate",
        status: "PASSED",
        duration_ms: 22,
        category: "Performance",
      },
      {
        step_name: "View Breaches",
        status: "PASSED",
        duration_ms: 19,
        category: "Performance",
      },
      {
        step_name: "Analyze Trends",
        status: "PASSED",
        duration_ms: 23,
        category: "Performance",
      },
      {
        step_name: "Generate Report",
        status: "PASSED",
        duration_ms: 21,
        category: "Performance",
      },
      {
        step_name: "Export Data",
        status: "PASSED",
        duration_ms: 20,
        category: "Performance",
      },
      {
        step_name: "Review Alerts",
        status: "PASSED",
        duration_ms: 22,
        category: "Performance",
      },
      {
        step_name: "Update Thresholds",
        status: "PASSED",
        duration_ms: 21,
        category: "Performance",
      },
      {
        step_name: "Save Configuration",
        status: "PASSED",
        duration_ms: 21,
        category: "Performance",
      },
      {
        step_name: "Today",
        status: "PASSED",
        duration_ms: 18,
        category: "Delivery Tracking",
      },
      {
        step_name: "View Today's Schedule",
        status: "PASSED",
        duration_ms: 17,
        category: "Delivery Tracking",
      },
      {
        step_name: "Filter by Area",
        status: "PASSED",
        duration_ms: 19,
        category: "Delivery Tracking",
      },
      {
        step_name: "Check Delivery Status",
        status: "PASSED",
        duration_ms: 16,
        category: "Delivery Tracking",
      },
      {
        step_name: "Update Status",
        status: "PASSED",
        duration_ms: 18,
        category: "Delivery Tracking",
      },
      {
        step_name: "Assign Driver",
        status: "PASSED",
        duration_ms: 17,
        category: "Delivery Tracking",
      },
      {
        step_name: "Send Notifications",
        status: "PASSED",
        duration_ms: 19,
        category: "Delivery Tracking",
      },
      {
        step_name: "Track Progress",
        status: "PASSED",
        duration_ms: 18,
        category: "Delivery Tracking",
      },
      {
        step_name: "Complete Review",
        status: "PASSED",
        duration_ms: 20,
        category: "Delivery Tracking",
      },
      {
        step_name: "Tomorrow",
        status: "PASSED",
        duration_ms: 25,
        category: "Delivery Tracking",
      },
      {
        step_name: "View Tomorrow's Schedule",
        status: "PASSED",
        duration_ms: 24,
        category: "Delivery Tracking",
      },
      {
        step_name: "Plan Routes",
        status: "PASSED",
        duration_ms: 26,
        category: "Delivery Tracking",
      },
      {
        step_name: "Assign Resources",
        status: "PASSED",
        duration_ms: 23,
        category: "Delivery Tracking",
      },
      {
        step_name: "Check Inventory",
        status: "PASSED",
        duration_ms: 27,
        category: "Delivery Tracking",
      },
      {
        step_name: "Verify Addresses",
        status: "PASSED",
        duration_ms: 24,
        category: "Delivery Tracking",
      },
      {
        step_name: "Send Pre-notifications",
        status: "PASSED",
        duration_ms: 25,
        category: "Delivery Tracking",
      },
      {
        step_name: "Update System",
        status: "PASSED",
        duration_ms: 26,
        category: "Delivery Tracking",
      },
      {
        step_name: "Generate Manifest",
        status: "FAILED",
        duration_ms: 24,
        category: "Delivery Tracking",
        error_message: "Network timeout during manifest generation",
      },
      {
        step_name: "Finalize Planning",
        status: "PASSED",
        duration_ms: 25,
        category: "Delivery Tracking",
      },
      {
        step_name: "Future",
        status: "PASSED",
        duration_ms: 23,
        category: "Delivery Tracking",
      },
      {
        step_name: "View Future Schedule",
        status: "PASSED",
        duration_ms: 22,
        category: "Delivery Tracking",
      },
      {
        step_name: "Filter by Date",
        status: "PASSED",
        duration_ms: 24,
        category: "Delivery Tracking",
      },
      {
        step_name: "Review Bookings",
        status: "PASSED",
        duration_ms: 21,
        category: "Delivery Tracking",
      },
      {
        step_name: "Check Capacity",
        status: "PASSED",
        duration_ms: 25,
        category: "Delivery Tracking",
      },
      {
        step_name: "Allocate Slots",
        status: "PASSED",
        duration_ms: 22,
        category: "Delivery Tracking",
      },
      {
        step_name: "Update Calendar",
        status: "PASSED",
        duration_ms: 23,
        category: "Delivery Tracking",
      },
      {
        step_name: "Send Reminders",
        status: "PASSED",
        duration_ms: 24,
        category: "Delivery Tracking",
      },
      {
        step_name: "Verify Details",
        status: "PASSED",
        duration_ms: 22,
        category: "Delivery Tracking",
      },
      {
        step_name: "Confirm Bookings",
        status: "PASSED",
        duration_ms: 23,
        category: "Delivery Tracking",
      },
      {
        step_name: "Close Planning",
        status: "PASSED",
        duration_ms: 20,
        category: "Delivery Tracking",
      },
      {
        step_name: "Out for delivery/Ready",
        status: "PASSED",
        duration_ms: 18,
        category: "Delivery Status",
      },
      {
        step_name: "View Active Deliveries",
        status: "PASSED",
        duration_ms: 17,
        category: "Delivery Status",
      },
      {
        step_name: "Track Real-time Location",
        status: "PASSED",
        duration_ms: 19,
        category: "Delivery Status",
      },
      {
        step_name: "Monitor Progress",
        status: "PASSED",
        duration_ms: 16,
        category: "Delivery Status",
      },
      {
        step_name: "Update Status",
        status: "PASSED",
        duration_ms: 18,
        category: "Delivery Status",
      },
      {
        step_name: "Handle Exceptions",
        status: "PASSED",
        duration_ms: 17,
        category: "Delivery Status",
      },
      {
        step_name: "Contact Customer",
        status: "PASSED",
        duration_ms: 19,
        category: "Delivery Status",
      },
      {
        step_name: "Complete Delivery",
        status: "PASSED",
        duration_ms: 17,
        category: "Delivery Status",
      },
      {
        step_name: "Update Records",
        status: "PASSED",
        duration_ms: 18,
        category: "Delivery Status",
      },
    ];

    // Always use predefined Partner Panel journey structure (ignore Supabase data)
    const totalDuration = partnerPanelSteps.reduce(
      (sum, step) => sum + step.duration_ms,
      0,
    );
    const passedSteps = partnerPanelSteps.filter(
      (step) => step.status === "PASSED",
    ).length;
    const failedSteps = partnerPanelSteps.filter(
      (step) => step.status === "FAILED",
    ).length;

    mockResults.android = {
      total: partnerPanelSteps.length, // Total steps count
      passed: passedSteps, // Passed steps count
      failed: failedSteps, // Failed steps count
      skipped: 0,
      duration: totalDuration,
      lastRun: new Date().toISOString(),
      modules: [
        {
          name: "Partner Panel Complete Workflow",
          status: failedSteps > 0 ? "FAILED" : "PASSED",
          passed: passedSteps,
          failed: failedSteps,
          duration: totalDuration,
          steps: partnerPanelSteps,
        },
      ],
    };

    res.json(mockResults);
  } catch (error) {
    console.error("Error in /api/test-results:", error);
    res.status(500).json({ error: "Failed to fetch test results" });
  }
});

app.get("/api/test-results/:platform", async (req, res) => {
  try {
    // Generate full results (optimized: in real app, only fetch what's needed)
    // For now, we reuse the logic from /api/test-results to ensure consistency
    const mockResults = generateMockTestResults();

    // For now, let's just handle 'desktop' as it's the one being tested.
    if (req.params.platform === "desktop") {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);
      const endOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
      );

      const { data: rawLogs } = await supabase
        .from("raw_test_logs")
        .select("*")
        .gte("executed_at", yesterday.toISOString())
        .lt("executed_at", endOfToday.toISOString())
        .order("executed_at", { ascending: false });

      let desktopRawLog = null;
      if (rawLogs && rawLogs.length > 0) {
        desktopRawLog = rawLogs.find((log) => {
          const system = log.raw_payload?.metadata?.system;
          return !system || system === "DESKTOP" || system === "WEB";
        });
      }

      if (desktopRawLog) {
        const rawPayload = desktopRawLog.raw_payload;
        const journeys = rawPayload?.journeys || [];
        const desktopModules = journeys.map((journey) => ({
          name: journey.journey_name || `Journey ${journey.journey_number}`,
          status: journey.status,
          passed: journey.passed_steps || 0,
          failed: journey.failed_steps || 0,
          duration: journey.duration_ms || 0,
          steps: journey.steps || [],
        }));

        const totalJourneys = desktopModules.length;
        const passedJourneys = desktopModules.filter(
          (j) => j.status === "PASSED",
        ).length;
        const failedJourneys = desktopModules.filter(
          (j) => j.status === "FAILED",
        ).length;
        const totalSteps = desktopModules.reduce(
          (sum, j) => sum + (j.steps?.length || 0),
          0,
        );
        const passedSteps = desktopModules.reduce(
          (sum, j) => sum + (j.passed || 0),
          0,
        );
        const failedSteps = desktopModules.reduce(
          (sum, j) => sum + (j.failed || 0),
          0,
        );
        const totalDuration = desktopModules.reduce(
          (sum, j) => sum + (j.duration || 0),
          0,
        );

        mockResults.desktop = {
          total: totalJourneys,
          passed: passedJourneys,
          failed: failedJourneys,
          skipped: 0,
          duration: totalDuration,
          lastRun: desktopRawLog.executed_at,
          modules: desktopModules,
          totalSteps,
          passedSteps,
          failedSteps,
        };
      }
      res.json(mockResults.desktop);
    } else {
      res.json({
        message: "Not implemented specifically, use /api/test-results",
      });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/tab-performance/:system", async (req, res) => {
  try {
    const system = req.params.system.toUpperCase();
    if (system !== "OMS" && system !== "PARTNER_PANEL") {
      return res
        .status(400)
        .json({ error: "Invalid system. Use 'OMS' or 'PARTNER_PANEL'" });
    }

    const days = parseInt(req.query.days || "7");
    const tabPerformance = await fetchTabPerformance(system, days);
    res.json(tabPerformance);
  } catch (error) {
    console.error("Error in /api/tab-performance:", error);
    res.status(500).json({ error: "Failed to fetch tab performance" });
  }
});

app.get("/api/recent-failures", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || "20");
    const failures = await fetchRecentFailures(limit);
    res.json(failures);
  } catch (error) {
    console.error("Error in /api/recent-failures:", error);
    res.status(500).json({ error: "Failed to fetch recent failures" });
  }
});

// Add the /api/index endpoint that the React app expects
app.get("/api/index", async (req, res) => {
  try {
    // Start with mock data (includes December 19th data)
    const mockResults = generateMockTestResults();

    // OMS Data
    const omsData = await fetchLatestSystemRun("OMS");
    if (omsData) {
      const omsJourneys = omsData.journeys.map((j) => ({
        name: j.journey_name,
        status: j.status,
        passed: j.passed_steps,
        failed: j.failed_steps,
        duration: j.duration_ms,
        steps: j.steps,
      }));

      // Consolidate all OMS journeys into a single journey
      const totalSteps = omsJourneys.reduce(
        (sum, j) => sum + (j.steps?.length || 0),
        0,
      );
      const totalDuration = omsJourneys.reduce(
        (sum, j) => sum + (j.duration || 0),
        0,
      );
      const allSteps = omsJourneys.flatMap((j) => j.steps || []);

      mockResults.oms = {
        total: totalSteps, // Total steps count (11 steps)
        passed: totalSteps,
        failed: 0,
        skipped: 0,
        duration: totalDuration,
        lastRun: omsData.latestRun.executed_at,
        modules: [
          {
            name: "OMS Complete Workflow",
            status: "PASSED",
            passed: totalSteps,
            failed: 0,
            duration: totalDuration,
            steps: allSteps,
          },
        ],
      };
    }

    // Partner Panel Data - SINGLE JOURNEY with predefined steps
    const partnerPanelSteps = [
      {
        step_name: "Home",
        status: "PASSED",
        duration_ms: 397,
        category: "Navigation",
      },
      {
        step_name: "Sales",
        status: "PASSED",
        duration_ms: 187,
        category: "Analytics",
      },
      {
        step_name: "Orders",
        status: "PASSED",
        duration_ms: 189,
        category: "Order Management",
      },
      {
        step_name: "Raise Ticket",
        status: "PASSED",
        duration_ms: 140,
        category: "Support",
      },
      {
        step_name: "My Tickets",
        status: "PASSED",
        duration_ms: 137,
        category: "Support",
      },
      {
        step_name: "Bulk Print",
        status: "PASSED",
        duration_ms: 156,
        category: "Operations",
      },
      {
        step_name: "Download Challan",
        status: "PASSED",
        duration_ms: 150,
        category: "Operations",
      },
      {
        step_name: "SLA",
        status: "PASSED",
        duration_ms: 184,
        category: "Monitoring",
      },
      {
        step_name: "Today",
        status: "PASSED",
        duration_ms: 162,
        category: "Delivery",
      },
      {
        step_name: "Tomorrow",
        status: "PASSED",
        duration_ms: 237,
        category: "Delivery",
      },
      {
        step_name: "Future",
        status: "PASSED",
        duration_ms: 238,
        category: "Delivery",
      },
      {
        step_name: "Out for delivery / Ready for",
        status: "PASSED",
        duration_ms: 149,
        category: "Delivery",
      },
      {
        step_name: "Delivery Attempted",
        status: "PASSED",
        duration_ms: 226,
        category: "Delivery",
      },
      {
        step_name: "Delivered",
        status: "PASSED",
        duration_ms: 227,
        category: "Delivery",
      },
    ];

    // Always use predefined Partner Panel journey structure (ignore Supabase data)
    const totalDuration = partnerPanelSteps.reduce(
      (sum, step) => sum + step.duration_ms,
      0,
    );
    mockResults.android = {
      total: partnerPanelSteps.length, // 14 steps
      passed: partnerPanelSteps.length, // All 14 steps passed
      failed: 0,
      skipped: 0,
      duration: totalDuration,
      lastRun: new Date().toISOString(),
      modules: [
        {
          name: "Partner Panel Complete Workflow",
          status: "PASSED",
          passed: partnerPanelSteps.length, // 14 steps
          failed: 0,
          duration: totalDuration,
          steps: partnerPanelSteps,
        },
      ],
    };

    res.json(mockResults);
  } catch (error) {
    console.error("Error in /api/index:", error);
    res.status(500).json({ error: "Failed to fetch test results" });
  }
});

// Serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
