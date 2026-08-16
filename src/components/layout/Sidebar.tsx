import React, { useRef, useState, useEffect } from 'react';
import { NavLink } from 'react-router';
import { 
  LayoutDashboard, 
  List, 
  BrainCircuit, 
  Terminal, 
  ShieldAlert, 
  Cpu, 
  Sun, 
  Moon, 
  BookOpen, 
  PanelLeftClose, 
  PanelLeftOpen,
  Library,
  Boxes,
  Puzzle
} from 'lucide-react';
import './Sidebar.css';
import { useThemeStore } from '../../stores/useThemeStore';
import { useLayoutStore } from '../../stores/useLayoutStore';

export const Sidebar: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { isSidebarOpen, sidebarWidth, setSidebarWidth, toggleSidebar } = useLayoutStore();
  
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !isSidebarOpen) return;
      e.preventDefault();
      setSidebarWidth(e.clientX);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isSidebarOpen, setSidebarWidth]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Sessions', path: '/sessions', icon: <List size={20} /> },
    { name: 'Skills', path: '/skills', icon: <BrainCircuit size={20} /> },
    { name: 'MCPs', path: '/mcps', icon: <Boxes size={20} /> },
    { name: 'Plugins', path: '/plugins', icon: <Puzzle size={20} /> },
    { name: 'Commands', path: '/commands', icon: <Terminal size={20} /> },
    { name: 'Rules', path: '/rules', icon: <ShieldAlert size={20} /> },
    { name: 'Agents', path: '/settings/agents', icon: <Cpu size={20} /> },
    { name: 'Docs & Guide', path: '/docs', icon: <BookOpen size={20} /> },
    { name: 'Wiki', path: '/wiki', icon: <Library size={20} /> },
  ];

  const currentWidth = isSidebarOpen ? `${sidebarWidth}px` : '68px';

  return (
    <aside 
      ref={sidebarRef}
      className={`sidebar ${!isSidebarOpen ? 'collapsed' : ''} ${isResizing ? 'resizing' : ''}`} 
      style={{ 
        width: currentWidth,
        minWidth: currentWidth,
        maxWidth: isSidebarOpen ? '480px' : '68px',
        transition: isResizing ? 'none' : 'width var(--duration-normal) var(--ease-spring-smooth), min-width var(--duration-normal) var(--ease-spring-smooth)',
      }}
    >
      <div className="sidebar-inner" style={{ 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
      }}>
        {/* Header with logo & collapse/expand toggle */}
        <div className="sidebar-header" style={{
          padding: isSidebarOpen ? '36px var(--space-4) var(--space-3)' : '36px 0 var(--space-3)',
          justifyContent: isSidebarOpen ? 'space-between' : 'center',
          gap: '8px'
        }}>
          {isSidebarOpen ? (
            <>
              <div className="sidebar-logo" style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                <span style={{ fontSize: '1.0625rem', fontWeight: 700, letterSpacing: '-0.3px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', display: 'block' }}>
                  KobeanAI <span style={{ color: 'var(--color-primary)' }}>Tracker</span>
                </span>
              </div>
              <button 
                onClick={toggleSidebar}
                className="sidebar-toggle-btn"
                title="Collapse to icons only"
                style={{ flexShrink: 0, padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <PanelLeftClose size={16} />
              </button>
            </>
          ) : (
            <button 
              onClick={toggleSidebar}
              className="sidebar-toggle-btn collapsed-toggle"
              title="Expand Sidebar"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-brand-primary)',
                backgroundColor: 'var(--color-bg-surface-hover)',
                border: '1px solid var(--color-border-subtle)',
                cursor: 'pointer'
              }}
            >
              <PanelLeftOpen size={18} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav" style={{
          padding: isSidebarOpen ? 'var(--space-4) var(--space-3)' : 'var(--space-4) var(--space-2)',
          alignItems: isSidebarOpen ? 'stretch' : 'center'
        }}>
          {navItems.map(item => (
            <NavLink 
              key={item.path}
              to={item.path} 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''} ${!isSidebarOpen ? 'icon-only' : ''}`}
              title={!isSidebarOpen ? item.name : undefined}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {isSidebarOpen && <span className="sidebar-link-text">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer with Theme Toggle */}
        <div style={{ 
          padding: isSidebarOpen ? 'var(--space-4)' : 'var(--space-4) var(--space-2)', 
          borderTop: '1px solid var(--color-border-subtle)',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button 
            onClick={toggleTheme}
            title={!isSidebarOpen ? (theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode') : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarOpen ? 'flex-start' : 'center',
              gap: 'var(--space-2)',
              width: isSidebarOpen ? '100%' : '42px',
              height: isSidebarOpen ? 'auto' : '42px',
              padding: isSidebarOpen ? 'var(--space-2)' : '0',
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-md)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-surface-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            {isSidebarOpen && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
        </div>
      </div>
      
      {/* Drag handle for resizing (only active when expanded) */}
      {isSidebarOpen && (
        <div 
          className="sidebar-drag-handle"
          onMouseDown={() => setIsResizing(true)}
        />
      )}
    </aside>
  );
};
