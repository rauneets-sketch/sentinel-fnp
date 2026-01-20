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
    const limit = parseInt(req.query.limit || "20");
    const failures = await fetchRecentFailuresManual(limit);
    res.status(200).json(failures);
  } catch (error) {
    console.error("Error in /api/recent-failures:", error);
    res.status(500).json({ error: "Failed to fetch recent failures" });
  }
}
