import { createClient } from "@supabase/supabase-js";

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

function generateMockTestResults() {
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
      total: 145,
      passed: 132,
      failed: 8,
      skipped: 5,
      duration: 1245,
      lastRun: new Date().toISOString(),
      totalSteps: 1000,
      modules: [
        createModule("Login", 12, 0, 145),
        createModule("Checkout", 18, 2, 234),
        createModule("Product Search", 25, 1, 189),
        createModule("Cart Operations", 20, 1, 167),
        createModule("Payment Flow", 15, 2, 298),
        createModule("User Profile", 22, 1, 134),
        createModule("Order History", 20, 1, 78),
      ],
    },
  };
}

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma",
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { platform } = req.query;
    const mockResults = generateMockTestResults();

    if (platform === "desktop") {
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
      res.status(200).json(mockResults.desktop);
    } else {
      res.status(200).json({
        message: "Not implemented specifically, use /api/test-results",
      });
    }
  } catch (error) {
    console.error("Error in /api/test-results/[platform]:", error);
    res.status(500).json({ error: error.message });
  }
}
