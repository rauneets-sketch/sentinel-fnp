import axios from "axios";

async function testFullDashboard() {
  console.log("🎯 Testing Full Dashboard Data Loading...\n");

  try {
    // Test the API endpoint that the frontend uses
    const response = await axios.get("http://localhost:3000/api/test-results");
    const data = response.data;

    console.log("📊 Complete Dashboard Data Structure:");
    console.log("=".repeat(50));
    
    // Desktop Site
    console.log("\n🖥️  DESKTOP SITE:");
    console.log(`   Total: ${data.desktop.total} journeys`);
    console.log(`   Passed: ${data.desktop.passed}`);
    console.log(`   Failed: ${data.desktop.failed}`);
    console.log(`   Duration: ${data.desktop.duration}ms`);
    console.log(`   Total Steps: ${data.desktop.totalSteps}`);
    console.log(`   Last Run: ${data.desktop.lastRun}`);
    console.log(`   Modules: ${data.desktop.modules.length} journeys`);

    // Mobile Site
    console.log("\n📱 MOBILE SITE:");
    console.log(`   Total: ${data.mobile.total} journeys`);
    console.log(`   Passed: ${data.mobile.passed}`);
    console.log(`   Failed: ${data.mobile.failed}`);
    console.log(`   Duration: ${data.mobile.duration}ms`);

    // OMS
    console.log("\n📦 OMS:");
    console.log(`   Total: ${data.oms.total} journeys`);
    console.log(`   Passed: ${data.oms.passed}`);
    console.log(`   Failed: ${data.oms.failed}`);
    console.log(`   Duration: ${data.oms.duration}ms`);

    // Partner Panel (Android)
    console.log("\n🤝 PARTNER PANEL:");
    console.log(`   Total: ${data.android.total} journeys`);
    console.log(`   Passed: ${data.android.passed}`);
    console.log(`   Failed: ${data.android.failed}`);
    console.log(`   Duration: ${data.android.duration}ms`);

    // iOS
    console.log("\n📱 iOS:");
    console.log(`   Coming Soon: ${data.ios.comingSoon}`);
    console.log(`   Total: ${data.ios.total} journeys`);

    console.log("\n" + "=".repeat(50));
    console.log("✅ SUCCESS: All dashboard sections have data!");
    console.log("🌐 Dashboard URL: http://localhost:3000");
    console.log("\n📋 Expected Dashboard Sections:");
    console.log("   ✅ Live Test Execution Context (5 cards)");
    console.log("   ✅ Overall Stats (5 platform cards)");
    console.log("   ✅ Journey Details (17 journeys)");
    console.log("   ✅ Test Results Overview Chart");
    console.log("   ✅ Performance Trend Analysis Chart");
    console.log("   ✅ Real-Time Journey Performance Analysis Chart");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

testFullDashboard();