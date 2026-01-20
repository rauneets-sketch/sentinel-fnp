import axios from "axios";

async function testPartnerPanelIntegration() {
  console.log("🎯 Testing Partner Panel Integration in Main Dashboard...\n");

  try {
    // Test the main API endpoint
    const response = await axios.get("http://localhost:3000/api/test-results");
    const data = response.data;

    console.log("📊 Partner Panel Data Analysis:");
    console.log("=".repeat(50));
    
    // Check Partner Panel data (mapped to android key)
    const partnerPanel = data.android;
    
    if (partnerPanel) {
      console.log(`✅ Partner Panel Found: ${partnerPanel.total} journey(s)`);
      console.log(`📈 Status: ${partnerPanel.passed} passed, ${partnerPanel.failed} failed`);
      console.log(`⏱️  Duration: ${partnerPanel.duration}ms`);
      console.log(`📅 Last Run: ${partnerPanel.lastRun}`);
      
      if (partnerPanel.modules && partnerPanel.modules.length > 0) {
        const journey = partnerPanel.modules[0];
        console.log(`\n🗂️ Journey Details:`);
        console.log(`   Name: ${journey.name}`);
        console.log(`   Status: ${journey.status}`);
        console.log(`   Steps: ${journey.steps ? journey.steps.length : 0}`);
        
        if (journey.steps && journey.steps.length > 0) {
          console.log(`\n📋 Journey Steps (${journey.steps.length} total):`);
          
          // Expected steps in order
          const expectedSteps = [
            "Home", "Sales", "Orders", "Raise Ticket", "My Tickets", 
            "Bulk Print", "Download Challan", "SLA", "Today", "Tomorrow", 
            "Future", "Out for delivery / Ready for", "Delivery Attempted", "Delivered"
          ];
          
          let correctOrder = true;
          journey.steps.forEach((step, index) => {
            const stepName = step.step_name || step.name;
            const expectedName = expectedSteps[index];
            const isCorrect = stepName === expectedName;
            
            if (!isCorrect) correctOrder = false;
            
            console.log(`   ${index + 1}. ${stepName} (${step.duration_ms || step.duration}ms) ${isCorrect ? '✅' : '❌'}`);
          });
          
          console.log(`\n🔍 Step Order Verification: ${correctOrder ? '✅ CORRECT' : '❌ INCORRECT'}`);
          console.log(`📊 Expected: 14 steps, Found: ${journey.steps.length} steps`);
          
          // Check specific durations
          const homeStep = journey.steps.find(s => (s.step_name || s.name) === "Home");
          const deliveredStep = journey.steps.find(s => (s.step_name || s.name) === "Delivered");
          
          if (homeStep) {
            const homeDuration = homeStep.duration_ms || homeStep.duration;
            console.log(`🏠 Home Step Duration: ${homeDuration}ms ${homeDuration === 397 ? '✅' : '❌'}`);
          }
          
          if (deliveredStep) {
            const deliveredDuration = deliveredStep.duration_ms || deliveredStep.duration;
            console.log(`📦 Delivered Step Duration: ${deliveredDuration}ms ${deliveredDuration === 227 ? '✅' : '❌'}`);
          }
        }
      }
    } else {
      console.log("❌ Partner Panel data not found");
    }

    console.log("\n" + "=".repeat(50));
    console.log("🎉 INTEGRATION TEST RESULTS:");
    console.log("=".repeat(50));
    
    const checks = [
      { test: partnerPanel && partnerPanel.total === 1, name: "Single Journey" },
      { test: partnerPanel && partnerPanel.modules && partnerPanel.modules[0]?.name === "Partner Panel Journey", name: "Journey Name" },
      { test: partnerPanel && partnerPanel.modules && partnerPanel.modules[0]?.steps?.length === 14, name: "14 Steps" },
      { test: partnerPanel && partnerPanel.modules && partnerPanel.modules[0]?.steps?.[0]?.step_name === "Home", name: "First Step: Home" },
      { test: partnerPanel && partnerPanel.modules && partnerPanel.modules[0]?.steps?.[13]?.step_name === "Delivered", name: "Last Step: Delivered" }
    ];
    
    checks.forEach(check => {
      console.log(`${check.test ? '✅' : '❌'} ${check.name}: ${check.test ? 'PASS' : 'FAIL'}`);
    });
    
    const passedChecks = checks.filter(c => c.test).length;
    console.log(`\n📊 Overall Score: ${passedChecks}/${checks.length} checks passed`);
    
    console.log("\n🌐 Dashboard Access:");
    console.log("   Main Dashboard: http://localhost:3000");
    console.log("   Click 'Partner Panel' tab to see the single journey with 14 steps");
    
    console.log("\n🔴 Critical Verification:");
    console.log("   ❗ Must show ONLY ONE journey in Partner Panel tab");
    console.log("   ❗ Journey name must be 'Partner Panel Journey'");
    console.log("   ❗ Must have exactly 14 steps in correct order");
    console.log("   ❗ All steps should show correct durations");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
    }
  }
}

testPartnerPanelIntegration();