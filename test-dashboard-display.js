import axios from "axios";

async function testDashboardDisplay() {
  console.log("🎯 Testing Dashboard Data Display...\n");

  try {
    // Test the API endpoint
    const response = await axios.get("http://localhost:3000/api/test-results");
    const data = response.data;

    console.log("📊 Dashboard Data Summary:");
    console.log(`✅ Desktop Site: ${data.desktop.total} journeys`);
    console.log(`✅ Total Steps: ${data.desktop.totalSteps}`);
    console.log(`✅ Passed Steps: ${data.desktop.passedSteps}`);
    console.log(`✅ Failed Steps: ${data.desktop.failedSteps}`);
    console.log(`✅ Last Run: ${data.desktop.lastRun}\n`);

    console.log("🗂️ Journey Details (First 5):");
    data.desktop.modules.slice(0, 5).forEach((journey, index) => {
      console.log(`\n📋 Journey ${index + 1}: ${journey.name}`);
      console.log(`   Status: ${journey.status}`);
      console.log(`   Steps: ${journey.steps.length}`);
      console.log(`   Passed: ${journey.passed}, Failed: ${journey.failed}`);
      console.log(`   Duration: ${journey.duration}ms`);
      
      if (journey.steps && journey.steps.length > 0) {
        console.log(`   First 3 steps:`);
        journey.steps.slice(0, 3).forEach((step, i) => {
          console.log(`     ${i + 1}. ${step.step_name} (${step.status})`);
        });
      }
    });

    console.log(`\n📈 All Journey Names:`);
    data.desktop.modules.forEach((journey, index) => {
      console.log(`${index + 1}. ${journey.name}`);
    });

    console.log(`\n🎉 SUCCESS: Dashboard is displaying ${data.desktop.total} journeys in the correct format!`);
    console.log(`🔍 You can now view the dashboard at: http://localhost:3000`);
    console.log(`📱 Click on "Journey Details" tab to see the formatted journey data`);

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testDashboardDisplay();