import { useState } from 'react';
import type { CrowdRiskAssessment } from '../types/surge';
import { HelpCircle, Info } from 'lucide-react';

interface RiskGaugeProps {
  score?: number;
  riskLevel?: string;
  description?: string;
  etaMinutes?: number | null;
  
  variant?: 'banner' | 'circular';
  assessment?: CrowdRiskAssessment;
  platformName?: string;
}

export function RiskGauge({
  score = 0,
  riskLevel = 'normal',
  description = '',
  etaMinutes = null,
  variant = 'banner',
  assessment,
  platformName = ''
}: RiskGaugeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (variant === 'circular' && assessment) {
    const { score: assessScore, level, contributing_factors, calculated_at } = assessment;

    // Determine colors based on risk level
    const getColorScheme = () => {
      switch (level) {
        case 'Critical':
          return {
            stroke: '#EF4444', // Red
            bg: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            text: '#F87171',
            fill: 'fill-red-500',
          };
        case 'Elevated':
          return {
            stroke: '#F59E0B', // Amber
            bg: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            text: '#FBBF24',
            fill: 'fill-amber-500',
          };
        default:
          return {
            stroke: '#10B981', // Green
            bg: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            text: '#34D399',
            fill: 'fill-emerald-500',
          };
      }
    };

    const scheme = getColorScheme();
    
    // Calculate SVG gauge progress variables
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (assessScore / 100) * circumference;

    return (
      <div 
        style={{
          backgroundColor: '#0D160F',
          border: scheme.border,
          borderRadius: '12px',
          padding: '24px',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="hover:shadow-2xl hover:-translate-y-0.5"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', fontWeight: 600 }}>Sensor Grid</span>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>{platformName}</h3>
          </div>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            padding: '2px 8px',
            borderRadius: '12px',
            backgroundColor: scheme.bg,
            color: scheme.text,
            border: `1px solid ${scheme.stroke}30`
          }}>
            {level}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 0', position: 'relative' }}>
          <svg style={{ width: '144px', height: '144px', transform: 'rotate(-90deg)' }}>
            {/* Background track circle */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="#122216"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Active progress circle */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke={scheme.stroke}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>

          {/* Score overlay */}
          <div style={{ position: 'absolute', textAlign: 'center' }}>
            <span style={{ fontSize: '30px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>{assessScore}%</span>
            <span style={{ display: 'block', fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginTop: '2px' }}>Surge Capacity</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', borderTop: '1px solid #1C3B24', paddingTop: '12px', marginTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Info size={12} className="text-slate-500" />
            <span>Click to audit formula</span>
          </div>
          <span style={{ fontSize: '10px', color: '#64748b' }}>
            Updated: {new Date(calculated_at).toLocaleTimeString()}
          </span>
        </div>

        {/* Expandable Explainability Panel */}
        {isExpanded && (
          <div 
            style={{
              marginTop: '16px',
              padding: '16px',
              backgroundColor: '#080E09',
              border: '1px solid #1C3B24',
              borderRadius: '8px',
              fontSize: '13px',
              textAlign: 'left'
            }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inner elements
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#4ade80', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              <HelpCircle size={14} />
              Explainability Formula Audit
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#cbd5e1', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #142618', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Platform Limit (Capacity):</span>
                <span style={{ fontWeight: 600, color: '#ffffff' }}>{contributing_factors.platform_capacity} pax</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #142618', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Typical Base Load (Offpeak):</span>
                <span style={{ fontWeight: 600, color: '#ffffff' }}>{contributing_factors.typical_load} pax</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #142618', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Expected Delayed Influx (30m):</span>
                <span style={{ fontWeight: 600, color: '#FF8A8A' }}>
                  +{contributing_factors.expected_passengers_from_delayed_trains} pax
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #142618', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Active Delayed Trains:</span>
                <span style={{ fontWeight: 600, color: '#ffffff' }}>{contributing_factors.delayed_trains_count}</span>
              </div>

              {contributing_factors.delayed_train_numbers && contributing_factors.delayed_train_numbers.length > 0 && (
                <div style={{ padding: '4px 0' }}>
                  <span style={{ color: '#64748b', display: 'block', marginBottom: '4px' }}>Contributing Trains:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {contributing_factors.delayed_train_numbers.map((tnum) => (
                      <span key={tnum} style={{ backgroundColor: '#1C3B24', color: '#ffffff', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', border: '1px solid #2D5E3B' }}>
                        T-{tnum}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ paddingTop: '8px', borderTop: '1px solid #1C3B24', marginTop: '8px' }}>
                <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Formula Execution:</span>
                <div style={{ backgroundColor: '#050906', padding: '8px', borderRadius: '6px', border: '1px solid #142618', fontFamily: 'monospace', fontSize: '10px', color: '#4ADE80', wordBreak: 'break-all' }}>
                  score = min(100, (({contributing_factors.typical_load} + {contributing_factors.expected_passengers_from_delayed_trains}) / {contributing_factors.platform_capacity}) * 100)<br />
                  score = min(100, ({contributing_factors.typical_load + contributing_factors.expected_passengers_from_delayed_trains} / {contributing_factors.platform_capacity}) * 100) = <span style={{ fontWeight: 700, color: '#ffffff' }}>{assessScore}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Determine background color based on riskLevel
  const getBackgroundStyle = () => {
    switch (riskLevel.toLowerCase()) {
      case 'critical':
        return 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)';
      case 'elevated':
        return 'linear-gradient(135deg, #92400e 0%, #d97706 100%)';
      case 'normal':
      default:
        return 'linear-gradient(135deg, #065f46 0%, #10b981 100%)';
    }
  };

  // Determine title based on riskLevel
  const getTitle = () => {
    switch (riskLevel.toLowerCase()) {
      case 'critical':
        return 'Critical — act now';
      case 'elevated':
        return 'Elevated — monitor closely';
      case 'normal':
      default:
        return 'Normal — all clear';
    }
  };

  return (
    <div style={{
      borderRadius: '14px',
      padding: '18px 20px',
      background: getBackgroundStyle(),
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: '12px',
      alignItems: 'center',
      width: '100%',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle background SVG illustration */}
      <svg
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          opacity: 0.08,
          pointerEvents: 'none',
          height: '100%',
          overflow: 'hidden'
        }}
        viewBox="0 0 300 120"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="0" y1="100" x2="300" y2="100" />
        <line x1="0" y1="108" x2="300" y2="108" />
        <path d="M 0 30 L 120 30 C 135 30, 145 40, 145 55 L 145 100 L 0 100 Z" />
        <rect x="15" y="45" width="20" height="20" rx="3" />
        <rect x="45" y="45" width="20" height="20" rx="3" />
        <rect x="75" y="45" width="20" height="20" rx="3" />
        <rect x="105" y="45" width="20" height="20" rx="3" />
        <line x1="200" y1="30" x2="200" y2="100" />
        <line x1="200" y1="30" x2="280" y2="30" />
        <circle cx="170" cy="70" r="5" />
        <line x1="170" y1="75" x2="170" y2="90" />
        <line x1="165" y1="80" x2="175" y2="80" />
        <line x1="170" y1="90" x2="167" y2="100" />
        <line x1="170" y1="90" x2="173" y2="100" />
        <circle cx="220" cy="65" r="5" />
        <line x1="220" y1="70" x2="220" y2="85" />
        <line x1="215" y1="75" x2="225" y2="75" />
        <line x1="220" y1="85" x2="217" y2="98" />
        <line x1="220" y1="85" x2="223" y2="98" />
        <circle cx="250" cy="72" r="5" />
        <line x1="250" y1="77" x2="250" y2="92" />
        <line x1="245" y1="82" x2="255" y2="82" />
        <line x1="250" y1="92" x2="247" y2="100" />
        <line x1="250" y1="92" x2="253" y2="100" />
      </svg>
      {/* Left side */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span style={{
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.6)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '4px'
        }}>
          Surge risk
        </span>
        <h2 style={{
          fontSize: '22px',
          fontWeight: 600,
          color: '#fff',
          letterSpacing: '-0.01em',
          lineHeight: '1.1',
          margin: 0
        }}>
          {getTitle()}
        </h2>
        <p style={{
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.65)',
          marginTop: '6px',
          lineHeight: '1.5',
          margin: 0
        }}>
          {description}
        </p>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <span style={{
          fontSize: '10px',
          color: 'rgba(255, 255, 255, 0.6)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em'
        }}>
          Score
        </span>
        <span style={{
          fontSize: '44px',
          fontWeight: 600,
          color: '#fff',
          letterSpacing: '-0.02em',
          lineHeight: '1',
          textAlign: 'right'
        }}>
          {score}
        </span>
        <span style={{
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.6)',
          textAlign: 'right'
        }}>
          / 100
        </span>
        <span style={{
          fontSize: '10px',
          color: 'rgba(255, 255, 255, 0.9)',
          marginTop: '6px',
          fontWeight: 600,
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          padding: '3px 8px',
          borderRadius: '10px',
          textAlign: 'right'
        }}>
          {etaMinutes !== null ? `Surge: ~${etaMinutes}m` : "No surge expected"}
        </span>
      </div>
    </div>
  );
}
