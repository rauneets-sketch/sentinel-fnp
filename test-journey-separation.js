import axios from "axios";

async function testJourneySeparation() {
  console.log("🧪 Testing Journey Separation Logic...\n");

  try {
    const response = await axios.get("http://localhost:3000/api/test-results");
    const data = response.data;

    console.log("📊 Desktop Site Journey Analysis:");
    console.log(`Total Journeys: ${data.desktop.modules.length}`);
    console.log(`Expected: 17 journeys (20 total - 3 excluded: 6, 8, 19)\n`);

    // Check if journeys are properly separated
    data.desktop.modules.forEach((journey, index) => {
      console.log(`Journey ${index + 1}: ${journey.name}`);
      console.log(`  Status: ${journey.status}`);
      console.log(`  Steps: ${journey.steps.length}`);
      console.log(`  Passed: ${journey.passed}, Failed: ${journey.failed}`);
      console.log(`  Duration: ${journey.duration}ms\n`);
    });

    // Verify excluded journeys are not present
    const journeyNames = data.desktop.modules.map(j => j.name);
    const hasExcludedJourneys = journeyNames.some(name => 
      name.includes('Journey 6') || 
      name.includes('Journey 8') || 
      name.includes('Journey 19')
    );

    if (hasExcludedJourneys) {
      console.log("❌ ERROR: Excluded journeys (6, 8, 19) are still present!");
    } else {
      console.log("✅ SUCCESS: Excluded journeys (6, 8, 19) are properly filtered out!");
    }

    // Check if we have the expected journey names
    const expectedJourneys = [
      "Home Page Exploration",
      "Payment Methods Testing",
      "International Phone Number Change",
      "Reminder and FAQ Testing",
      "International Purchase",
      "Combinational Purchase",
      "Cake Variant Testing",
      "Coupon Testing",
      "Personalized Product Purchase",
      "Message Card Integration",
      "Product Exploration Journey",
      "Same SKU Product Exploration",
      "Search Based Purchase",
      "Personalized Product with Photo Upload",
      "Location Testing",
      "Spherical Home Page Icon Exploration",
      "Gmail OTP Login"
    ];

    console.log("\n📋 Journey Name Verification:");
    expectedJourneys.forEach((expectedName, index) => {
      const actualJourney = data.desktop.modules[index];
      if (actualJourney && actualJourney.name.includes(expectedName)) {
        console.log(`✅ ${expectedName} - Found`);
      } else {
        console.log(`❌ ${expectedName} - Missing or incorrect`);
      }
    });

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testJourneySeparation();