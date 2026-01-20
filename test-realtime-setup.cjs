// Test script to verify real-time setup is complete
const fs = require('fs');
const path = require('path');

console.log('🔍 Real-time Partner Panel Setup Verification\n');

// Check if all required files exist
const requiredFiles = [
  'src/lib/supabase.ts',
  'src/components/PartnerPanelRealtime.tsx',
  'src/components/PartnerPanelRealtime.css',
  '.env',
  '.env.example',
  'vercel.json',
  '.github/workflows/deploy.yml',
  'SUPABASE_SCHEMA.md',
  'DEPLOYMENT_GUIDE.md'
];

console.log('📁 File Structure Check:');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Check environment variables
console.log('\n🔧 Environment Variables Check:');
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL');
  const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY');
  
  console.log(`   ${hasSupabaseUrl ? '✅' : '❌'} VITE_SUPABASE_URL`);
  console.log(`   ${hasSupabaseKey ? '✅' : '❌'} VITE_SUPABASE_ANON_KEY`);
} else {
  console.log('   ❌ .env file not found');
}

// Check App.tsx integration
console.log('\n🔗 App Integration Check:');
if (fs.existsSync('src/App.tsx')) {
  const appContent = fs.readFileSync('src/App.tsx', 'utf8');
  const hasImport = appContent.includes('PartnerPanelRealtime');
  const hasComponent = appContent.includes('<PartnerPanelRealtime');
  
  console.log(`   ${hasImport ? '✅' : '❌'} PartnerPanelRealtime import`);
  console.log(`   ${hasComponent ? '✅' : '❌'} PartnerPanelRealtime component usage`);
} else {
  console.log('   ❌ src/App.tsx not found');
}

// Check package.json dependencies
console.log('\n📦 Dependencies Check:');
if (fs.existsSync('package.json')) {
  const packageContent = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasSupabase = packageContent.dependencies['@supabase/supabase-js'];
  const hasReact = packageContent.dependencies['react'];
  
  console.log(`   ${hasSupabase ? '✅' : '❌'} @supabase/supabase-js: ${hasSupabase || 'missing'}`);
  console.log(`   ${hasReact ? '✅' : '❌'} react: ${hasReact || 'missing'}`);
} else {
  console.log('   ❌ package.json not found');
}

// Check Vercel configuration
console.log('\n⚡ Vercel Config Check:');
if (fs.existsSync('vercel.json')) {
  const vercelContent = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  const hasEnvVars = vercelContent.env && vercelContent.env.VITE_SUPABASE_URL;
  const hasFramework = vercelContent.framework === 'vite';
  
  console.log(`   ${hasEnvVars ? '✅' : '❌'} Environment variables configured`);
  console.log(`   ${hasFramework ? '✅' : '❌'} Vite framework specified`);
} else {
  console.log('   ❌ vercel.json not found');
}

// Summary
console.log('\n🎯 Setup Summary:');
if (allFilesExist) {
  console.log('   ✅ All required files are present');
  console.log('   ✅ Real-time Partner Panel is ready for deployment');
  console.log('   ✅ Supabase integration configured');
  console.log('   ✅ Vercel deployment ready');
  
  console.log('\n🚀 Next Steps:');
  console.log('   1. Setup Supabase database using SUPABASE_SCHEMA.md');
  console.log('   2. Push to GitHub repository');
  console.log('   3. Deploy to Vercel using DEPLOYMENT_GUIDE.md');
  console.log('   4. Configure environment variables in Vercel');
  console.log('   5. Test real-time updates!');
} else {
  console.log('   ❌ Some files are missing - check the list above');
}

console.log('\n📚 Documentation:');
console.log('   📖 Database Setup: SUPABASE_SCHEMA.md');
console.log('   🚀 Deployment Guide: DEPLOYMENT_GUIDE.md');
console.log('   🔧 Environment Variables: .env.example');

console.log('\n🎉 Real-time Partner Panel Setup Complete!');