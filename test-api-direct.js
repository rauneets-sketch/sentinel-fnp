import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wnymknrycmldwqzdqoct.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndueW1rbnJ5Y21sZHdxemRxb2N0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzcwMDk1MywiZXhwIjoyMDgzMjc2OTUzfQ.HCK8yC6jRIb67LUxOEEXI_dLs_fXcLK6m4_50iN8tPU";

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
  20: "Gmail OTP Login"
};

function extractCategory(stepName) {
  if (stepName.includes('Login') || stepName.includes('Authentication') || stepName.includes('Guest') || stepName.includes('Email')) {
    return 'User Authentication';
  } else if (stepName.includes('Cart') || stepName.includes('Add Product')) {
    return 'Cart Management';
  } else if (stepName.includes('Payment') || stepName.includes('QR') || stepName.includes('UPI') || stepName.includes('Card')) {
    return 'Payment Process';
  } else if (stepName.includes('Navigate') && !stepName.includes('Login')) {
    return 'Navigation';
  } else if (stepName.includes('Delivery') || stepName.includes('Date') || stepName.includes('Time')) {
    return 'Delivery Setup';
  } else if (stepName.includes('Product') && stepName.includes('Select')) {
    return 'Product Selection';
  } else if (stepName.includes('Search')) {
    return 'Search Function';
  } else if (stepName.includes('Personalized') || stepName.includes('Custom')) {
    return 'Personalization';
  } else if (stepName.includes('Photo') || stepName.includes('Upload')) {
    return 'Photo Upload';
  } else if (stepName.includes('Location') || stepName.includes('Pincode')) {
    return 'Location Setup';
  } else if (stepName.includes('Completed') || stepName.includes('Success')) {
    return 'Order Completion';
  }
  return 'General';
}

function processJourneyWiseData(rawPayload) {
  if (!rawPayload) {
    return [];
  }

  // If journeys are already properly structured, use them
  if (Array.isArray(rawPayload.journeys) && rawPayload.journeys.length > 0) {
    return rawPayload.journeys
      .filter(journey => {
        // The data already excludes journeys 6, 8, 19, so we don't need to filter them again
        return true;
      })
      .map(journey => {
        // Calculate passed/failed steps if not provided
        let passedSteps = journey.passed_steps || 0;
        let failedSteps = journey.failed_steps || 0;
        
        if (journey.steps && journey.steps.length > 0 && (passedSteps === 0 && failedSteps === 0)) {
          passedSteps = journey.steps.filter(s => s.status === "PASSED").length;
          failedSteps = journey.steps.filter(s => s.status === "FAILED").length;
          
          // If no status info, assume all passed since journey status is PASSED
          if (passedSteps === 0 && failedSteps === 0 && journey.status === "PASSED") {
            passedSteps = journey.steps.length;
          }
        }
        
        return {
          name: journey.journey_name || JOURNEY_NAMES[journey.journey_number] || `Journey ${journey.journey_number}`,
          status: journey.status || (failedSteps > 0 ? "FAILED" : "PASSED"),
          passed: passedSteps,
          failed: failedSteps,
          duration: journey.duration_ms || 0,
          steps: journey.steps ? journey.steps.map(step => ({
            step_name: step.step_name || step.action || step.name || 'Unknown Step',
            status: step.status || 'PASSED',
            duration_ms: step.duration_ms || 0,
            error_message: step.error_message || null,
            error_type: step.error_type || null,
            category: step.category || extractCategory(step.step_name || step.action || step.name || ''),
            action: step.action || step.step_name || step.name || 'Unknown Action'
          })) : [],
        };
      });
  }

  return [];
}

async function testApiDirect() {
  console.log("🧪 Testing API Logic Directly...\n");

  try {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
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

    console.log(`Found ${rawLogs.length} logs`);

    let desktopRawLog = null;
    if (rawLogs && rawLogs.length > 0) {
      // Prioritize FNP system logs first, then fall back to others
      desktopRawLog = rawLogs.find((log) => {
        const system = log.raw_payload?.metadata?.system;
        return system === "FNP";
      });
      
      console.log(`Selected log: ${desktopRawLog ? desktopRawLog.raw_payload?.metadata?.system : 'None'}`);
      
      if (desktopRawLog) {
        const rawPayload = desktopRawLog.raw_payload;
        
        // Process journey-wise data instead of merging all steps
        const processedJourneys = processJourneyWiseData(rawPayload);
        
        console.log(`\n📊 Processed Journeys: ${processedJourneys.length}`);
        
        processedJourneys.forEach((journey, index) => {
          console.log(`Journey ${index + 1}: ${journey.name}`);
          console.log(`  Status: ${journey.status}`);
          console.log(`  Steps: ${journey.steps.length}`);
          console.log(`  Passed: ${journey.passed}, Failed: ${journey.failed}`);
          console.log("");
        });
      }
    }

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testApiDirect();