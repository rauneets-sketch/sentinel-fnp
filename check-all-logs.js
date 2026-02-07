import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wnymknrycmldwqzdqoct.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndueW1rbnJ5Y21sZHdxemRxb2N0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzcwMDk1MywiZXhwIjoyMDgzMjc2OTUzfQ.HCK8yC6jRIb67LUxOEEXI_dLs_fXcLK6m4_50iN8tPU";

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function checkAllLogs() {
  console.log("🔍 Checking All Available Logs...\n");

  try {
    // Get all logs from the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const { data: rawLogs, error: rawLogsError } = await supabase
      .from("raw_test_logs")
      .select("*")
      .gte("executed_at", sevenDaysAgo.toISOString())
      .order("executed_at", { ascending: false });

    if (rawLogsError) {
      console.error("Error fetching raw_test_logs:", rawLogsError);
      return;
    }

    console.log(`Found ${rawLogs.length} logs in the last 7 days\n`);

    rawLogs.forEach((log, index) => {
      console.log(`=== LOG ${index + 1} ===`);
      console.log(`ID: ${log.log_id}`);
      console.log(`System: ${log.raw_payload?.metadata?.system || 'UNKNOWN'}`);
      console.log(`Framework: ${log.framework}`);
      console.log(`Environment: ${log.environment}`);
      console.log(`Executed: ${log.executed_at}`);
      
      if (log.raw_payload?.journeys) {
        console.log(`Journeys: ${log.raw_payload.journeys.length}`);
        if (log.raw_payload.journeys.length > 0) {
          console.log(`First Journey: ${log.raw_payload.journeys[0].journey_name}`);
          console.log(`Last Journey: ${log.raw_payload.journeys[log.raw_payload.journeys.length - 1].journey_name}`);
        }
      } else if (log.raw_payload?.steps) {
        console.log(`Steps: ${log.raw_payload.steps.length}`);
      } else {
        console.log("No journeys or steps found");
      }
      console.log("");
    });

  } catch (error) {
    console.error("❌ Check failed:", error.message);
  }
}

checkAllLogs();