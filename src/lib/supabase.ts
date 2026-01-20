import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wnymknrycmldwqzdqoct.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndueW1rbnJ5Y21sZHdxemRxb2N0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzcwMDk1MywiZXhwIjoyMDgzMjc2OTUzfQ.HCK8yC6jRIb67LUxOEEXI_dLs_fXcLK6m4_50iN8tPU'

// Create Supabase client with real-time enabled
export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Types for our data structure
export interface JourneyStep {
  id?: number
  step_name: string
  category: string
  status: 'PASSED' | 'FAILED' | 'RUNNING' | 'PENDING'
  duration_ms: number
  error_message?: string
  created_at?: string
  updated_at?: string
  journey_run_id?: string
}

export interface JourneyRun {
  id: string
  name: string
  status: 'COMPLETED' | 'RUNNING' | 'FAILED'
  started_at: string
  completed_at?: string
  total_steps: number
  passed_steps: number
  failed_steps: number
  total_duration_ms: number
}

// Database table names
export const TABLES = {
  JOURNEY_STEPS: 'journey_steps',
  JOURNEY_RUNS: 'journey_runs'
} as const

// Fetch latest journey with all steps
export async function fetchLatestJourney(): Promise<{
  journey: JourneyRun | null
  steps: JourneyStep[]
}> {
  try {
    // Get the latest journey run
    const { data: latestRun, error: runError } = await supabase
      .from(TABLES.JOURNEY_RUNS)
      .select('*')
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    if (runError) {
      console.error('Error fetching latest journey run:', runError)
      return { journey: null, steps: [] }
    }

    if (!latestRun) {
      return { journey: null, steps: [] }
    }

    // Get all steps for this journey run
    const { data: steps, error: stepsError } = await supabase
      .from(TABLES.JOURNEY_STEPS)
      .select('*')
      .eq('journey_run_id', latestRun.id)
      .order('created_at', { ascending: true })

    if (stepsError) {
      console.error('Error fetching journey steps:', stepsError)
      return { journey: latestRun, steps: [] }
    }

    return {
      journey: latestRun,
      steps: steps || []
    }
  } catch (error) {
    console.error('Error in fetchLatestJourney:', error)
    return { journey: null, steps: [] }
  }
}

// Subscribe to real-time updates for journey steps
export function subscribeToJourneyUpdates(
  onUpdate: (payload: any) => void,
  onError?: (error: any) => void
) {
  console.log('🔄 Setting up real-time subscription for instant data updates...')
  
  const channel = supabase
    .channel('journey-updates')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to INSERT, UPDATE, DELETE
        schema: 'public',
        table: TABLES.JOURNEY_STEPS,
      },
      (payload) => {
        console.log('📡 INSTANT Real-time step update received:', payload)
        console.log('⚡ Dashboard will update immediately - no waiting for schedule!')
        onUpdate(payload)
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLES.JOURNEY_RUNS,
      },
      (payload) => {
        console.log('📡 INSTANT Real-time journey update received:', payload)
        console.log('⚡ Dashboard will update immediately - no waiting for schedule!')
        onUpdate(payload)
      }
    )
    .subscribe((status) => {
      console.log('📡 Real-time subscription status:', status)
      if (status === 'SUBSCRIBED') {
        console.log('✅ Successfully subscribed to INSTANT real-time updates')
        console.log('🚀 Dashboard will now update immediately when data changes in database')
        console.log('⏱️  No need to wait for automation schedule - updates are instant!')
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Real-time subscription error')
        onError?.(new Error('Real-time subscription failed'))
      }
    })

  return channel
}

// Unsubscribe from real-time updates
export function unsubscribeFromJourneyUpdates(channel: any) {
  if (channel) {
    console.log('🔄 Unsubscribing from real-time updates...')
    supabase.removeChannel(channel)
    console.log('✅ Successfully unsubscribed from real-time updates')
  }
}