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
    const { system } = req.query;
    const systemUpper = system.toUpperCase();

    if (systemUpper !== "OMS" && systemUpper !== "PARTNER_PANEL") {
      return res
        .status(400)
        .json({ error: "Invalid system. Use 'OMS' or 'PARTNER_PANEL'" });
    }

    const days = parseInt(req.query.days || "7");
    const tabPerformance = await fetchTabPerformanceManual(systemUpper, days);
    res.status(200).json(tabPerformance);
  } catch (error) {
    console.error("Error in /api/tab-performance:", error);
    res.status(500).json({ error: "Failed to fetch tab performance" });
  }
}
