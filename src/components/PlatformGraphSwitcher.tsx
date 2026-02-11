import React, { useState } from 'react';
import './PlatformGraphSwitcher.css';
import PlatformSpecificChart from './PlatformSpecificChart';
import JourneyFailureTimeline from './JourneyFailureTimeline';

type PlatformType = 'desktop' | 'mobile' | 'oms' | 'partner' | 'overall';
type GraphType = 'trend' | 'failures';

interface PlatformGraphSwitcherProps {
  initialPlatform?: PlatformType;
}

const PlatformGraphSwitcher: React.FC<PlatformGraphSwitcherProps> = ({ 
  initialPlatform = 'overall' 
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>(initialPlatform);
  const [selectedGraph, setSelectedGraph] = useState<GraphType>('trend');

  const platforms = [
    { id: 'overall' as PlatformType, name: 'Overall', icon: 'fa-chart-line', color: '#4f46e5' },
    { id: 'desktop' as PlatformType, name: 'Desktop', icon: 'fa-laptop-code', color: '#3b82f6' },
    { id: 'mobile' as PlatformType, name: 'Mobile', icon: 'fa-mobile-screen', color: '#8b5cf6' },
    { id: 'oms' as PlatformType, name: 'OMS', icon: 'fa-boxes-stacked', color: '#f59e0b' },
    { id: 'partner' as PlatformType, name: 'Partner Panel', icon: 'fa-handshake', color: '#10b981' },
  ];

  const graphs = [
    { id: 'trend' as GraphType, name: 'Pass & Fail Trend', icon: 'fa-chart-line' },
    { id: 'failures' as GraphType, name: 'Failure Timeline', icon: 'fa-clock' },
  ];

  const currentPlatform = platforms.find(p => p.id === selectedPlatform);
  const currentGraph = graphs.find(g => g.id === selectedGraph);

  const handlePlatformChange = (platformId: PlatformType) => {
    setSelectedPlatform(platformId);
  };

  const handleGraphChange = (graphId: GraphType) => {
    setSelectedGraph(graphId);
  };

  const renderGraph = () => {
    switch (selectedGraph) {
      case 'trend':
        return <PlatformSpecificChart platform={selectedPlatform} />;
      case 'failures':
        return <JourneyFailureTimeline />;
      default:
        return <PlatformSpecificChart platform={selectedPlatform} />;
    }
  };

  return (
    <div className="platform-graph-switcher">
      <div className="graph-header">
        <div className="graph-title-section">
          <i className={`fas ${currentGraph?.icon}`} />
          <span className="graph-title">{currentGraph?.name}</span>
          <span className="platform-badge" style={{ backgroundColor: currentPlatform?.color }}>
            <i className={`fas ${currentPlatform?.icon}`} />
            {currentPlatform?.name}
          </span>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs-section">
          <div className="tabs-label">Platform:</div>
          <div className="tabs-group">
            {platforms.map(platform => (
              <button
                key={platform.id}
                className={`tab-button ${selectedPlatform === platform.id ? 'active' : ''}`}
                onClick={() => handlePlatformChange(platform.id)}
                style={{ 
                  '--tab-color': platform.color,
                  borderColor: selectedPlatform === platform.id ? platform.color : 'transparent'
                } as React.CSSProperties}
              >
                <i className={`fas ${platform.icon}`} style={{ color: platform.color }} />
                <span>{platform.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="tabs-divider"></div>

        <div className="tabs-section">
          <div className="tabs-label">Graph Type:</div>
          <div className="tabs-group">
            {graphs.map(graph => (
              <button
                key={graph.id}
                className={`tab-button ${selectedGraph === graph.id ? 'active' : ''}`}
                onClick={() => handleGraphChange(graph.id)}
              >
                <i className={`fas ${graph.icon}`} />
                <span>{graph.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="graph-content">
        {renderGraph()}
      </div>
    </div>
  );
};

export default PlatformGraphSwitcher;
