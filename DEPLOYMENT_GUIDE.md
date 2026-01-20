# 🚀 Deployment Guide: GitHub → Vercel with Supabase Real-time

## 📋 Prerequisites

- GitHub account
- Vercel account  
- Supabase project with database setup
- Node.js 18+ installed locally

## 🗄️ Step 1: Setup Supabase Database

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and anon key

2. **Run Database Schema**
   - Open Supabase SQL Editor
   - Copy and run the SQL from `SUPABASE_SCHEMA.md`
   - This creates the required tables and enables real-time

3. **Enable Real-time**
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE journey_runs;
   ALTER PUBLICATION supabase_realtime ADD TABLE journey_steps;
   ```

## 📁 Step 2: Prepare Project for GitHub

1. **Initialize Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Real-time Partner Panel Dashboard"
   ```

2. **Create GitHub Repository**
   - Go to GitHub and create new repository
   - Don't initialize with README (we already have files)

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

## ⚡ Step 3: Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)

1. **Connect GitHub**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables**
   ```
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = your-anon-key-here
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-app.vercel.app`

### Option B: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login and Deploy**
   ```bash
   vercel login
   vercel --prod
   ```

3. **Set Environment Variables**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

## 🔄 Step 4: Setup Continuous Deployment

The included GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically deploy on every push to main branch.

**Required GitHub Secrets:**
- `VITE_SUPABASE_URL`: Your Supabase URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
- `VERCEL_TOKEN`: Your Vercel token (optional, for GitHub Actions)
- `VERCEL_ORG_ID`: Your Vercel org ID (optional)
- `VERCEL_PROJECT_ID`: Your Vercel project ID (optional)

## 🧪 Step 5: Test Real-time Functionality

1. **Open Your Deployed App**
   - Navigate to your Vercel URL
   - Go to the "Real-time Partner Panel Dashboard" section

2. **Test Real-time Updates**
   - Open Supabase SQL Editor
   - Insert test data:
   ```sql
   -- Insert new journey
   INSERT INTO journey_runs (name, status) 
   VALUES ('Live Test Journey', 'RUNNING');
   
   -- Add a step (use the journey ID from above)
   INSERT INTO journey_steps (journey_run_id, step_name, category, status, duration_ms)
   VALUES ('your-journey-id', 'Live Test Step', 'Testing', 'PASSED', 300);
   ```

3. **Verify Auto-Update**
   - Watch your dashboard update automatically
   - No page refresh should be needed
   - New data should appear within 1-2 seconds

## 🔧 Step 6: Configure Your Automation System

Update your existing automation system to write data to Supabase:

```javascript
// Example: Insert journey run
const { data: journey } = await supabase
  .from('journey_runs')
  .insert({
    name: 'Partner Panel Complete Workflow',
    status: 'RUNNING',
    started_at: new Date().toISOString()
  })
  .select()
  .single();

// Example: Insert journey steps
const steps = [
  { step_name: 'Home', category: 'Navigation', status: 'PASSED', duration_ms: 427 },
  { step_name: 'Sales', category: 'Sales', status: 'PASSED', duration_ms: 192 },
  // ... more steps
];

for (const step of steps) {
  await supabase
    .from('journey_steps')
    .insert({
      journey_run_id: journey.id,
      ...step
    });
}
```

## 📊 Step 7: Monitoring and Maintenance

1. **Monitor Vercel Deployments**
   - Check Vercel dashboard for build status
   - Monitor function logs for errors

2. **Monitor Supabase**
   - Check Supabase dashboard for database health
   - Monitor real-time connections

3. **Update Environment Variables**
   - Rotate Supabase keys periodically
   - Update Vercel environment variables as needed

## 🎯 Expected Results

After successful deployment:

✅ **Dashboard Features:**
- Real-time updates without page refresh
- Single Partner Panel journey display
- Mobile site showing zeros
- Live connection status indicator
- Automatic data refresh every 2 hours

✅ **Real-time Capabilities:**
- Instant updates when Supabase data changes
- WebSocket connection to Supabase
- Automatic reconnection on connection loss
- Debug JSON view for data verification

✅ **Production Ready:**
- Optimized Vite build
- Environment variables properly configured
- CI/CD pipeline with GitHub Actions
- Scalable Vercel hosting

## 🚨 Troubleshooting

**Real-time not working?**
- Check Supabase real-time is enabled for tables
- Verify environment variables are set correctly
- Check browser console for WebSocket errors

**Build failing?**
- Ensure all dependencies are in package.json
- Check TypeScript errors
- Verify environment variables are available during build

**Data not showing?**
- Check Supabase table structure matches schema
- Verify RLS policies allow read access
- Check network tab for API call errors

## 🎉 Success!

Your real-time Partner Panel dashboard is now live and will automatically update whenever your automation system pushes new data to Supabase!