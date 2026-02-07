import puppeteer from 'puppeteer';

async function verifyDashboardComplete() {
  console.log("🎯 Verifying Complete Dashboard Functionality...\n");

  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false, // Set to true if you don't want to see the browser
      defaultViewport: { width: 1920, height: 1080 }
    });
    
    const page = await browser.newPage();
    
    // Enable console logging from the page
    page.on('console', msg => {
      console.log(`🌐 Browser Console: ${msg.text()}`);
    });
    
    // Navigate to dashboard
    console.log("📍 Navigating to dashboard...");
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Wait a bit for all components to load
    await page.waitForTimeout(3000);
    
    // Check if all main sections exist
    console.log("\n🔍 Checking dashboard sections...");
    
    const sections = [
      { selector: '#liveStatsGrid', name: 'Live Test Execution Context' },
      { selector: '#statsGrid', name: 'Overall Stats' },
      { selector: '.journey-details-container', name: 'Journey Details' },
      { selector: '#overviewChart', name: 'Overview Chart' },
      { selector: '#trendChart', name: 'Trend Chart' },
      { selector: '#bubbleChart', name: 'Bubble Chart' }
    ];
    
    for (const section of sections) {
      const element = await page.$(section.selector);
      if (element) {
        const content = await page.evaluate(el => el.innerHTML, element);
        const hasContent = content.trim().length > 0;
        console.log(`${hasContent ? '✅' : '⚠️ '} ${section.name}: ${hasContent ? 'Has content' : 'Empty'}`);
      } else {
        console.log(`❌ ${section.name}: Element not found`);
      }
    }
    
    // Check journey details specifically
    console.log("\n🗂️ Checking Journey Details...");
    const journeyItems = await page.$$('.journey-item');
    console.log(`📋 Found ${journeyItems.length} journey items`);
    
    if (journeyItems.length > 0) {
      // Click on first journey to expand it
      await journeyItems[0].click();
      await page.waitForTimeout(1000);
      
      const steps = await page.$$('.step-item');
      console.log(`📝 First journey has ${steps.length} steps`);
    }
    
    // Take a screenshot for verification
    await page.screenshot({ 
      path: 'dashboard-screenshot.png', 
      fullPage: true 
    });
    console.log("\n📸 Screenshot saved as 'dashboard-screenshot.png'");
    
    console.log("\n🎉 Dashboard verification complete!");
    console.log("🌐 Dashboard is running at: http://localhost:3000");
    
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available, if not provide manual instructions
try {
  verifyDashboardComplete();
} catch (error) {
  console.log("📋 Manual Verification Instructions:");
  console.log("1. Open your browser and go to: http://localhost:3000");
  console.log("2. Check that you can see:");
  console.log("   ✅ Live Test Execution Context (5 colored cards at top)");
  console.log("   ✅ Overall section (5 platform success rate cards)");
  console.log("   ✅ Journey Details (17 expandable journey items)");
  console.log("   ✅ Test Results Overview Chart (3D column chart)");
  console.log("   ✅ Performance Trend Analysis Chart (line chart)");
  console.log("   ✅ Real-Time Journey Performance Analysis (bubble chart)");
  console.log("3. Try expanding a journey to see its steps");
  console.log("4. Check browser console (F12) for any errors");
}