import React, { useState, useEffect, useCallback } from 'react'
import { 
  fetchLatestJourney, 
  subscribeToJourneyUpdates, 
  unsubscribeFromJourneyUpdates,
  type JourneyStep,
  type JourneyRun 
} from '../lib/supabase'
import './PartnerPanelRealtime.css'

interface PartnerPanelRealtimeProps {
  className?: string
}

export const PartnerPanelRealtime: React.FC<PartnerPanelRealtimeProps> = ({ className }) => {
  const [journey, setJourney] = useState<JourneyRun | null>(null)
  const [steps, setSteps] = useState<JourneyStep[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Fetch initial data
  const loadJourneyData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Fetching latest journey data...')
      const { journey: latestJourney, steps: journeySteps } = await fetchLatestJourney()
      
      setJourney(latestJourney)
      setSteps(journeySteps)
      setLastUpdated(new Date())
      
      console.log('✅ Journey data loaded:', {
        journey: latestJourney?.name,
        stepsCount: journeySteps.length
      })
    } catch (err) {
      console.error('❌ Error loading journey data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load journey data')
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback(async (payload: any) => {
    console.log('📡 Processing INSTANT real-time update:', payload.eventType, payload.table)
    console.log('⚡ Data changed in database - updating dashboard immediately!')
    console.log('🚀 No waiting for automation schedule - this is instant!')
    
    // Re-fetch all data when any change occurs
    // This ensures we always have the latest complete dataset
    await loadJourneyData()
    
    setLastUpdated(new Date())
    
    // Show a brief visual indicator that data was updated
    console.log('✅ Dashboard updated with latest data from database')
  }, [loadJourneyData])

  // Set up real-time subscription
  useEffect(() => {
    let channel: any = null

    const setupRealtime = async () => {
      // Load initial data
      await loadJourneyData()

      // Set up real-time subscription
      channel = subscribeToJourneyUpdates(
        handleRealtimeUpdate,
        (error) => {
          console.error('❌ Real-time subscription error:', error)
          setError('Real-time connection failed')
          setIsConnected(false)
        }
      )

      setIsConnected(true)
    }

    setupRealtime()

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        unsubscribeFromJourneyUpdates(channel)
        setIsConnected(false)
      }
    }
  }, [loadJourneyData, handleRealtimeUpdate])

  // Calculate journey statistics
  const stats = React.useMemo(() => {
    if (!steps.length) {
      return {
        totalSteps: 0,
        passedSteps: 0,
        failedSteps: 0,
        runningSteps: 0,
        successRate: 0,
        totalDuration: 0,
        avgStepTime: 0
      }
    }

    const totalSteps = steps.length
    const passedSteps = steps.filter(s => s.status === 'PASSED').length
    const failedSteps = steps.filter(s => s.status === 'FAILED').length
    const runningSteps = steps.filter(s => s.status === 'RUNNING').length
    const successRate = totalSteps > 0 ? Math.round((passedSteps / totalSteps) * 100) : 0
    const totalDuration = steps.reduce((sum, step) => sum + (step.duration_ms || 0), 0)
    const avgStepTime = totalSteps > 0 ? Math.round(totalDuration / totalSteps) : 0

    return {
      totalSteps,
      passedSteps,
      failedSteps,
      runningSteps,
      successRate,
      totalDuration,
      avgStepTime
    }
  }, [steps])

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASSED': return '#22c55e'
      case 'FAILED': return '#ef4444'
      case 'RUNNING': return '#f59e0b'
      case 'PENDING': return '#6b7280'
      default: return '#6b7280'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASSED': return '✅'
      case 'FAILED': return '❌'
      case 'RUNNING': return '🔄'
      case 'PENDING': return '⏸️'
      default: return '❓'
    }
  }

  if (loading) {
    return (
      <div className={`partner-panel-realtime ${className || ''}`}>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading Partner Panel Journey...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`partner-panel-realtime ${className || ''}`}>
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Connection Error</h3>
          <p>{error}</p>
          <button onClick={loadJourneyData} className="retry-button">
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`partner-panel-realtime ${className || ''}`}>
      {/* Header with connection status */}
      <div className="panel-header">
        <div className="header-title">
          <h2>🤝 Partner Panel Journey</h2>
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            {isConnected ? 'Real-time Connected - Instant Updates!' : 'Disconnected'}
          </div>
        </div>
        
        <div className="update-info">
          {lastUpdated && (
            <div className="last-updated">
              Last Updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          <div className="update-frequency">
            <small>📡 Updates instantly when data changes in database</small>
          </div>
        </div>
      </div>

      {/* Journey Overview Card */}
      {journey && (
        <div className="journey-overview">
          <div className="journey-header">
            <h3>{journey.name || 'Partner Panel Complete Workflow'}</h3>
            <div className={`journey-status status-${journey.status?.toLowerCase()}`}>
              {getStatusIcon(journey.status)} {journey.status}
            </div>
          </div>
          
          <div className="journey-stats">
            <div className="stat-item">
              <span className="stat-label">Success Rate</span>
              <span className="stat-value">{stats.successRate}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Steps</span>
              <span className="stat-value">{stats.totalSteps}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Passed</span>
              <span className="stat-value passed">{stats.passedSteps}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Failed</span>
              <span className="stat-value failed">{stats.failedSteps}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Duration</span>
              <span className="stat-value">{stats.totalDuration}ms</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Avg Step Time</span>
              <span className="stat-value">{stats.avgStepTime}ms</span>
            </div>
          </div>
        </div>
      )}

      {/* Journey Steps */}
      <div className="journey-steps">
        <h4>Journey Steps ({steps.length})</h4>
        
        {steps.length === 0 ? (
          <div className="no-steps">
            <p>No journey steps found. Waiting for data...</p>
          </div>
        ) : (
          <div className="steps-list">
            {steps.map((step, index) => (
              <div 
                key={step.id || index} 
                className={`step-item status-${step.status?.toLowerCase()}`}
              >
                <div className="step-number">{index + 1}</div>
                
                <div className="step-content">
                  <div className="step-header">
                    <span className="step-name">{step.step_name}</span>
                    <div className="step-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(step.status) }}
                      >
                        {getStatusIcon(step.status)} {step.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="step-details">
                    <div className="step-category">
                      <span className="category-label">Category:</span>
                      <span className="category-value">{step.category}</span>
                    </div>
                    
                    <div className="step-duration">
                      <span className="duration-label">Duration:</span>
                      <span className="duration-value">{step.duration_ms}ms</span>
                    </div>
                    
                    {step.error_message && (
                      <div className="step-error">
                        <span className="error-label">Error:</span>
                        <span className="error-message">{step.error_message}</span>
                      </div>
                    )}
                    
                    {step.updated_at && (
                      <div className="step-timestamp">
                        <span className="timestamp-label">Updated:</span>
                        <span className="timestamp-value">
                          {new Date(step.updated_at).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Debug Information */}
      <div className="debug-section">
        <details>
          <summary>🔍 Debug: Journey Data (JSON)</summary>
          <pre className="debug-json">
            {JSON.stringify({ journey, steps, stats }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  )
}

export default PartnerPanelRealtime