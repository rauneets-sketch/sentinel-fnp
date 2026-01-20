# Supabase Database Schema

## Required Tables for Real-time Partner Panel

### 1. `journey_runs` Table

```sql
CREATE TABLE journey_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL DEFAULT 'Partner Panel Complete Workflow',
  status VARCHAR(50) NOT NULL DEFAULT 'RUNNING' CHECK (status IN ('COMPLETED', 'RUNNING', 'FAILED')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_steps INTEGER DEFAULT 0,
  passed_steps INTEGER DEFAULT 0,
  failed_steps INTEGER DEFAULT 0,
  total_duration_ms INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. `journey_steps` Table

```sql
CREATE TABLE journey_steps (
  id SERIAL PRIMARY KEY,
  journey_run_id UUID NOT NULL REFERENCES journey_runs(id) ON DELETE CASCADE,
  step_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PASSED', 'FAILED', 'RUNNING', 'PENDING')),
  duration_ms INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Enable Real-time (Required for Live Updates)

```sql
-- Enable real-time for journey_runs table
ALTER PUBLICATION supabase_realtime ADD TABLE journey_runs;

-- Enable real-time for journey_steps table  
ALTER PUBLICATION supabase_realtime ADD TABLE journey_steps;
```

### 4. Row Level Security (RLS) Policies

```sql
-- Enable RLS on journey_runs
ALTER TABLE journey_runs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on journey_steps
ALTER TABLE journey_steps ENABLE ROW LEVEL SECURITY;

-- Allow read access to journey_runs
CREATE POLICY "Allow read access to journey_runs" ON journey_runs
  FOR SELECT USING (true);

-- Allow read access to journey_steps
CREATE POLICY "Allow read access to journey_steps" ON journey_steps
  FOR SELECT USING (true);

-- Allow insert/update for service role (for your automation)
CREATE POLICY "Allow insert/update for service role on journey_runs" ON journey_runs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow insert/update for service role on journey_steps" ON journey_steps
  FOR ALL USING (auth.role() = 'service_role');
```

### 5. Sample Data Insert (for Testing)

```sql
-- Insert a sample journey run
INSERT INTO journey_runs (id, name, status, started_at, total_steps, passed_steps, failed_steps, total_duration_ms)
VALUES (
  gen_random_uuid(),
  'Partner Panel Complete Workflow',
  'COMPLETED',
  NOW() - INTERVAL '1 hour',
  14,
  13,
  1,
  2847
);

-- Get the journey run ID for steps
-- Replace 'your-journey-id' with the actual ID from above
INSERT INTO journey_steps (journey_run_id, step_name, category, status, duration_ms) VALUES
  ('your-journey-id', 'Home', 'Navigation', 'PASSED', 427),
  ('your-journey-id', 'Sales', 'Sales', 'PASSED', 192),
  ('your-journey-id', 'Orders', 'Order Management', 'PASSED', 190),
  ('your-journey-id', 'Raise Ticket', 'Support', 'PASSED', 150),
  ('your-journey-id', 'My Tickets', 'Support', 'PASSED', 147),
  ('your-journey-id', 'Bulk Print', 'Operations', 'PASSED', 148),
  ('your-journey-id', 'Download Challan', 'Operations', 'PASSED', 126),
  ('your-journey-id', 'SLA', 'Performance', 'PASSED', 210),
  ('your-journey-id', 'Today', 'Delivery Tracking', 'PASSED', 162),
  ('your-journey-id', 'Tomorrow', 'Delivery Tracking', 'PASSED', 249),
  ('your-journey-id', 'Future', 'Delivery Tracking', 'PASSED', 249),
  ('your-journey-id', 'Out for delivery/Ready for', 'Delivery Status', 'PASSED', 159),
  ('your-journey-id', 'Delivery Attempted', 'Delivery Status', 'FAILED', 240),
  ('your-journey-id', 'Delivered', 'Delivery Status', 'PASSED', 236);
```

## Environment Variables Setup

### For Local Development (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### For Vercel Deployment
Add these environment variables in your Vercel dashboard:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

## Real-time Subscription Details

**🚀 INSTANT UPDATES - Dashboard responds immediately to database changes!**

The dashboard automatically subscribes to:
- `INSERT` events on `journey_steps` table
- `UPDATE` events on `journey_steps` table  
- `INSERT` events on `journey_runs` table
- `UPDATE` events on `journey_runs` table

### ⚡ When ANY of these events occur:
1. Dashboard receives real-time notification (within 1-2 seconds)
2. Automatically re-fetches the latest journey data
3. Updates the UI immediately
4. Shows new data without page refresh

### ⏱️ Important Timing Notes:
- **Automation Schedule**: Your system may run every 2 hours (or any interval)
- **Dashboard Updates**: Dashboard updates **INSTANTLY** when data arrives
- **No Waiting**: Dashboard is NOT tied to automation schedule
- **Real-time**: Whether you insert data every 2 hours, 30 minutes, or manually - dashboard always updates immediately

### 🎯 Example Scenarios:
```
Scenario 1: Automation runs every 2 hours
10:00 AM - Automation inserts data → Dashboard updates at 10:00:01 AM ✅
12:00 PM - Automation inserts data → Dashboard updates at 12:00:01 PM ✅

Scenario 2: Automation runs every 30 minutes  
10:00 AM - Automation inserts data → Dashboard updates at 10:00:01 AM ✅
10:30 AM - Automation inserts data → Dashboard updates at 10:30:01 AM ✅
11:00 AM - Automation inserts data → Dashboard updates at 11:00:01 AM ✅

Scenario 3: Manual data insertion
10:15 AM - Manual SQL insert → Dashboard updates at 10:15:01 AM ✅
```

**Key Point**: Dashboard reflects database state in real-time, regardless of insertion frequency!

## Testing Real-time Updates

To test the real-time functionality:

1. **Insert a new journey run:**
```sql
INSERT INTO journey_runs (name, status) 
VALUES ('Test Journey', 'RUNNING');
```

2. **Add steps to the journey:**
```sql
INSERT INTO journey_steps (journey_run_id, step_name, category, status, duration_ms)
VALUES ('your-journey-id', 'Test Step', 'Testing', 'PASSED', 500);
```

3. **Update step status:**
```sql
UPDATE journey_steps 
SET status = 'FAILED', error_message = 'Test error'
WHERE step_name = 'Test Step';
```

The dashboard should update automatically for each of these operations!