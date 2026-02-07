import React, { useState, useEffect } from 'react';
import JourneyFailureTimeline from './JourneyFailureTimeline';
import { loadJourneyFailureData, JourneyFailureData } from '../data/journeyFailureData';
import './JourneyAnalyticsDashboard.css';

const JourneyAnalyticsDashboard: React.FC = () => {
  const [failureData, setFailureData] = useState<JourneyFailureData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await loadJourneyFailureData();
      setFailureData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load journey failure data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="journey-analytics-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading journey analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="journey-analytics-dashboard">
        <div className="error-container">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={loadData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalFailures = failureData.reduce((sum, item) => sum + item.failedAttempts, 0);
  const uniqueJourneys = new Set(failureData.map(item => item.journeyName)).size;
  const peakFailureTime = findPeakFailureTime(failureData);

  return (
    <div className="journey-analytics-dashboard">
      <div className="dashboard-header">
        <h1>Journey Failure Analysis</h1>
        <p className="subtitle">Time-based analysis of journey failures (24-Hour View)</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalFailures}</div>
          <div className="stat-label">Total Failures</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{uniqueJourneys}</div>
          <div className="stat-label">Unique Journeys</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{peakFailureTime}</div>
          <div className="stat-label">Peak Failure Time</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{failureData.length}</div>
          <div className="stat-label">Data Points</div>
        </div>
      </div>

      <JourneyFailureTimeline data={failureData} />

      <div className="data-table-section">
        <h2>Journey Details</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Journey Name</th>
                <th>Time</th>
                <th>Failed Attempts</th>
                <th>Total Steps</th>
                <th>Timeframe</th>
              </tr>
            </thead>
            <tbody>
              {failureData.map((item, index) => (
                <tr key={index}>
                  <td>{item.journeyName}</td>
                  <td>{item.time}</td>
                  <td className="failures-cell">{item.failedAttempts}</td>
                  <td>{item.totalSteps}</td>
                  <td>
                    <span className="timeframe-badge">{item.timeframe}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper function to find peak failure time
const findPeakFailureTime = (data: JourneyFailureData[]): string => {
  const timeMap = new Map<string, number>();
  
  data.forEach(item => {
    const hour = extractHourLabel(item.time);
    timeMap.set(hour, (timeMap.get(hour) || 0) + item.failedAttempts);
  });

  let maxFailures = 0;
  let peakTime = '12 AM';

  timeMap.forEach((failures, time) => {
    if (failures > maxFailures) {
      maxFailures = failures;
      peakTime = time;
    }
  });

  return peakTime;
};

// Helper function to extract hour label
const extractHourLabel = (timeString: string): string => {
  try {
    let hour: number;
    
    if (timeString.includes('T') || timeString.includes('-')) {
      hour = new Date(timeString).getHours();
    } else {
      hour = parseInt(timeString.split(':')[0], 10);
    }

    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  } catch {
    return 'Unknown';
  }
};

export default JourneyAnalyticsDashboard;
