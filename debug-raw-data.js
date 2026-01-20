import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wnymknrycmldwqzdqoct.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndueW1rbnJ5Y21sZHdxemRxb2N0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzcwMDk1MywiZXhwIjoyMDgzMjc2OTUzfQ.HCK8yC6jRIb67LUxOEEXI_dLs_fXcLK6m4_50iN8tPU";

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function debugRawData() {
  console.log("🔍 Debugging Raw Data Structure...\n");

  try {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);
    const endOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const { data: rawLogs, error: rawLogsError } = await supabase
      .from("raw_test_logs")
      .select("*")
      .gte("executed_at", yesterday.toISOString())
      .lt("executed_at", endOfToday.toISOString())
      .order("executed_at", { ascending: false });

    if (rawLogsError) {
      console.error("Error fetching raw_test_logs:", rawLogsError);
      return;
    }

    console.log(`Found ${rawLogs.length} raw logs`);

    let desktopRawLog = null;
    if (rawLogs && rawLogs.length > 0) {
      console.log("Available logs:");
      rawLogs.forEach((log, index) => {
        console.log(`Log ${index + 1}:`);
        console.log(`  System: ${log.raw_payload?.metadata?.system || 'UNKNOWN'}`);
        console.log(`  Framework: ${log.framework}`);
        console.log(`  Environment: ${log.environment}`);
        console.log(`  Executed: ${log.executed_at}`);
        console.log("");
      });
      
      // Use the first available log for analysis
      desktopRawLog = rawLogs[0];
    }

    if (desktopRawLog) {
      console.log("📋 Raw Payload Structure:");
      console.log("Keys:", Object.keys(desktopRawLog.raw_payload));
      
      const rawPayload = desktopRawLog.raw_payload;
      
      if (rawPayload.journeys) {
        console.log(`\n📊 Journeys Array (${rawPayload.journeys.length} items):`);
        rawPayload.journeys.forEach((journey, index) => {
          console.log(`Journey ${index + 1}:`);
          console.log(`  Name: ${journey.journey_name}`);
          console.log(`  Number: ${journey.journey_number}`);
          console.log(`  Status: ${journey.status}`);
          console.log(`  Steps: ${journey.steps ? journey.steps.length : 0}`);
          
          if (journey.steps && journey.steps.length > 0) {
            console.log(`  First 3 steps:`);
            journey.steps.slice(0, 3).forEach((step, i) => {
              console.log(`    ${i + 1}. ${step.step_name || step.name || step.action || JSON.stringify(step)}`);
            });
          }
          console.log("");
        });
      }

      if (rawPayload.steps) {
        console.log(`\n🔧 Steps Array (${rawPayload.steps.length} items):`);
        console.log("First 10 steps:");
        rawPayload.steps.slice(0, 10).forEach((step, index) => {
          console.log(`  ${index + 1}. ${step.step_name || step.name}`);
        });
      }

      if (rawPayload.metadata) {
        console.log(`\n📝 Metadata:`);
        console.log(JSON.stringify(rawPayload.metadata, null, 2));
      }
    } else {
      console.log("❌ No desktop raw log found");
    }

  } catch (error) {
    console.error("❌ Debug failed:", error.message);
  }
}

debugRawData();