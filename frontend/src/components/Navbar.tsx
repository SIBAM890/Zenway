import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { SXLogo } from './SXLogo';

interface NavbarProps {
  activeStation: string;
  onStationChange: (station: string) => void;
  stationTabs: { name: string; code: string }[];
  onSelectStation: (station: { name: string; code: string }) => void;
}

export function Navbar({
  activeStation,
  onStationChange,
  stationTabs,
  onSelectStation,
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ name: string; code: string }[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced API search call (400ms)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await api.searchStations(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Failed to search stations:', err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escape key listener to close dropdown
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSearchResults([]);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', position: 'relative' }}>
      {/* Top Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        height: '50px',
        padding: '0 18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e8e8ec'
      }}>
        {/* Left Side */}
        <div
          onClick={() => {
            window.history.pushState({}, '', '/');
            const event = new Event('pushstate-changed');
            window.dispatchEvent(event);
          }}
          style={{
            fontSize: '15px',
            fontWeight: 700,
            color: '#0f172a',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <SXLogo size={34} withText />
        </div>

        {/* Right Side */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span className="live-indicator" style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#22c55e',
            display: 'inline-block'
          }}></span>
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#64748b'
          }}>
            indianrailapi · LIVE
          </span>
        </div>
      </div>

      {/* Search Bar Row */}
      <div ref={dropdownRef} style={{
        backgroundColor: '#ffffff',
        padding: '10px 18px',
        borderBottom: '1px solid #e8e8ec',
        position: 'relative',
        zIndex: 50
      }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <span style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748b',
            fontSize: '18px',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1
          }}>
            ⌕
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search station name or code..."
            style={{
              width: '100%',
              backgroundColor: '#f1f5f9',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 14px 10px 36px',
              fontSize: '14px',
              color: '#0f172a',
              outline: 'none',
              boxSizing: 'border-box',
              fontWeight: 500
            }}
          />
        </div>

        {/* Dropdown Results */}
        {searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '18px',
            right: '18px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
            zIndex: 100,
            maxHeight: '200px',
            overflowY: 'auto',
            marginTop: '4px'
          }}>
            {searchResults.map((result) => (
              <div
                key={result.code}
                onClick={() => {
                  onSelectStation(result);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background-color 0.2s',
                  backgroundColor: '#ffffff'
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                <span style={{ fontWeight: 600, color: '#0f172a' }}>
                  {result.name}
                </span>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  {result.code}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tab Row */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e8e8ec',
        padding: '8px 18px',
        display: 'flex',
        alignItems: 'center',
        overflowX: 'auto',
        gap: '8px'
      }}>
        {stationTabs.map((station) => {
          const isActive = activeStation === station.code;
          return (
            <button
              key={station.code}
              onClick={() => onStationChange(station.code)}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: '20px',
                color: isActive ? '#ffffff' : '#64748b',
                backgroundColor: isActive ? '#2563eb' : '#f1f5f9',
                border: 'none',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {station.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
