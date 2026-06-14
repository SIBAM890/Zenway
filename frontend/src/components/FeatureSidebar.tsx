import React, { useState, useEffect } from 'react';
import { ShieldAlert, Briefcase, History, Lock } from 'lucide-react';
import { SXLogo } from './SXLogo';

interface SidebarNavItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  isActive: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

function SidebarNavItem({ icon, title, subtitle, isActive, disabled = false, onClick }: SidebarNavItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    margin: '4px 8px',
    borderRadius: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    borderLeft: isActive ? '4px solid #2563eb' : '4px solid transparent',
    backgroundColor: isActive ? '#eff6ff' : (isHovered && !disabled ? '#f8fafc' : 'transparent'),
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.5 : 1,
    userSelect: 'none',
  };

  const textContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 600,
    color: disabled ? '#94a3b8' : (isActive ? '#2563eb' : '#334155'),
    lineHeight: '1.25',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '11px',
    color: disabled ? '#cbd5e1' : '#64748b',
    marginTop: '2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const iconWrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '20px',
    height: '20px',
    color: disabled ? '#cbd5e1' : (isActive ? '#2563eb' : '#64748b'),
  };

  return (
    <div
      style={itemStyle}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={disabled ? "Coming in Round 2" : undefined}
    >
      <div style={iconWrapperStyle}>{icon}</div>
      <div style={textContainerStyle}>
        <div style={titleStyle}>{title}</div>
        <div style={subtitleStyle}>{subtitle}</div>
      </div>
    </div>
  );
}

export function FeatureSidebar() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('pushstate-changed', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('pushstate-changed', handleLocationChange);
    };
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    const event = new Event('pushstate-changed');
    window.dispatchEvent(event);
  };

  const handleAuditClick = () => {
    if (window.location.pathname !== '/dashboard') {
      window.history.pushState({}, '', '/dashboard');
      window.dispatchEvent(new Event('pushstate-changed'));
      
      // Delay slightly to allow Dashboard.tsx DOM to mount, then scroll
      setTimeout(() => {
        const el = Array.from(document.querySelectorAll('h3')).find(h => h.textContent?.includes('Audit Log') || h.textContent?.includes('Audit'));
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
      }, 200);
    } else {
      const el = Array.from(document.querySelectorAll('h3')).find(h => h.textContent?.includes('Audit Log') || h.textContent?.includes('Audit'));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    }
  };

  return (
    <div style={{
      width: '280px',
      minWidth: '280px',
      height: '100vh',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      padding: '24px 0',
      boxSizing: 'border-box',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Brand / Logo */}
      <div 
        onClick={() => navigate('/')} 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0 24px',
          cursor: 'pointer',
          marginBottom: '28px',
          paddingBottom: '20px',
          borderBottom: '1px solid #f1f5f9'
        }}
      >
        <SXLogo size={32} withText variant="light" />
      </div>

      {/* CORE MODULES Section */}
      <div style={{
        textTransform: 'uppercase',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: '#94a3b8',
        marginTop: '8px',
        marginBottom: '6px',
        paddingLeft: '24px'
      }}>
        Core Modules
      </div>
      
      <SidebarNavItem
        icon={<ShieldAlert size={18} />}
        title="Crowd Surge Control"
        subtitle="Station Safety Dashboard"
        isActive={currentPath === '/dashboard'}
        onClick={() => navigate('/dashboard')}
      />

      <SidebarNavItem
        icon={<Briefcase size={18} />}
        title="Ops & Crew"
        subtitle="Crew, Freight & Concierge"
        isActive={currentPath === '/ops-dashboard'}
        onClick={() => navigate('/ops-dashboard')}
      />

      {/* MONITORING Section */}
      <div style={{
        textTransform: 'uppercase',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: '#94a3b8',
        marginTop: '24px',
        marginBottom: '6px',
        paddingLeft: '24px'
      }}>
        Monitoring
      </div>

      <SidebarNavItem
        icon={<History size={18} />}
        title="Audit Trail"
        subtitle="Event & Alert History"
        isActive={false}
        onClick={handleAuditClick}
      />

      <SidebarNavItem
        icon={<Lock size={18} />}
        title="Incident Command"
        subtitle="Coming in Round 2"
        isActive={false}
        disabled={true}
      />

      {/* Tag/Team info at bottom */}
      <div style={{
        marginTop: 'auto',
        padding: '16px 24px 0 24px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '4px'
      }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#475569',
          letterSpacing: '0.02em'
        }}>
          Coding_Aghoris
        </div>
        <div style={{
          fontSize: '10px',
          fontWeight: 500,
          color: '#94a3b8'
        }}>
          FAR AWAY 2026
        </div>
      </div>
    </div>
  );
}
