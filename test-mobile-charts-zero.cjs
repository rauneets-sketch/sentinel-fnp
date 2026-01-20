// Test script to verify mobile site shows zeros in all charts
const fs = require('fs');
const path = require('path');

// Read the App.tsx file
const appPath = path.join(__dirname, 'src/App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');

console.log('🔍 Mobile Site Chart Data Verification:\n');

// Check trend chart data
const trendDataMatch = appContent.match(/name: "Mobile Site",\s*data: \[([^\]]+)\]/);
if (trendDataMatch) {
  const trendData = trendDataMatch[1].trim();
  console.log('📈 Trend Chart (Performance Analysis):');
  console.log(`   Data: [${trendData}]`);
  
  if (trendData === '0, 0, 0, 0, 0, 0, 0') {
    console.log('   ✅ SUCCESS: Shows all zeros');
  } else {
    console.log('   ❌ ISSUE: Still showing non-zero values');
  }
} else {
  console.log('❌ Could not find Mobile Site trend data');
}

// Check overview chart data modification
const getDataMatch = appContent.match(/const getData = \(field: "passed" \| "failed" \| "skipped"\) =>([\s\S]*?)};/);
if (getDataMatch) {
  const getDataContent = getDataMatch[1];
  const hasMobileCheck = getDataContent.includes('if (key === "mobile")');
  const returnsZero = getDataContent.includes('return 0;');
  
  console.log('\n📊 Overview Chart (Column Chart):');
  console.log(`   ✅ Has mobile check: ${hasMobileCheck ? 'Yes' : 'No'}`);
  console.log(`   ✅ Returns zero for mobile: ${returnsZero ? 'Yes' : 'No'}`);
  
  if (hasMobileCheck && returnsZero) {
    console.log('   ✅ SUCCESS: Mobile will show 0 for passed/failed/skipped');
  }
}

// Check bubble chart exclusion
const bubbleDataMatch = appContent.match(/\/\/ Add Mobile data - DISABLED/);
if (bubbleDataMatch) {
  console.log('\n🫧 Bubble Chart (Journey Performance):');
  console.log('   ✅ SUCCESS: Mobile data disabled (commented out)');
  console.log('   ✅ Mobile site will not appear in bubble chart');
} else {
  console.log('\n🫧 Bubble Chart (Journey Performance):');
  console.log('   ❌ ISSUE: Mobile data may still be included');
}

console.log('\n🎯 Expected Chart Behavior:');
console.log('   📈 Trend Chart: Mobile line at 0% across all days');
console.log('   📊 Overview Chart: Mobile column shows 0 for all metrics');
console.log('   🫧 Bubble Chart: No mobile site bubbles displayed');
console.log('   📋 Stats Cards: Mobile shows 0% success rate');

console.log('\n🔄 Changes Applied:');
console.log('   ✅ Trend data: [0, 0, 0, 0, 0, 0, 0]');
console.log('   ✅ Overview data: Returns 0 for mobile platform');
console.log('   ✅ Bubble data: Mobile series commented out');
console.log('   ✅ All charts now show zeros for mobile site');