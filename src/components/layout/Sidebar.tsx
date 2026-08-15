import React, { useRef, useState, useEffect } from 'react';
import { NavLink } from 'react-router';
import { LayoutDashboard, List, BrainCircuit, Terminal, ShieldAlert, Cpu, Sun, Moon, BookOpen, PanelLeftClose } from 'lucide-react';
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
      if (!isResizing) return;
      // Prevent text selection while resizing
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
  }, [isResizing, setSidebarWidth]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Sessions', path: '/sessions', icon: <List size={20} /> },
    { name: 'Skills', path: '/skills', icon: <BrainCircuit size={20} /> },
    { name: 'Commands', path: '/commands', icon: <Terminal size={20} /> },
    { name: 'Rules', path: '/rules', icon: <ShieldAlert size={20} /> },
    { name: 'Agents', path: '/settings/agents', icon: <Cpu size={20} /> },
    { name: 'Docs & Guide', path: '/docs', icon: <BookOpen size={20} /> },
  ];

  return (
    <aside 
      ref={sidebarRef}
      className={`sidebar ${!isSidebarOpen ? 'collapsed' : ''} ${isResizing ? 'resizing' : ''}`} 
      style={{ 
        width: isSidebarOpen ? `${sidebarWidth}px` : '0px',
        minWidth: isSidebarOpen ? `${sidebarWidth}px` : '0px',
        transition: isResizing ? 'none' : 'width var(--duration-normal) var(--ease-spring-smooth), min-width var(--duration-normal) var(--ease-spring-smooth)',
      }}
    >
      <div className="sidebar-inner" style={{ 
        width: `${sidebarWidth}px`, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        opacity: isSidebarOpen ? 1 : 0,
        transition: isResizing ? 'none' : 'opacity var(--duration-fast) ease',
      }}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>
              KobeanAI <span style={{ color: 'var(--color-primary)' }}>Tracker</span>
            </span>
          </div>
          <button 
            onClick={toggleSidebar}
            className="sidebar-toggle-btn"
            title="Collapse Sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink 
              key={item.path}
              to={item.path} 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span style={{ whiteSpace: 'nowrap' }}>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--color-border-subtle)' }}>
          <button 
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              width: '100%',
              padding: 'var(--space-2)',
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-md)',
              transition: 'background 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-surface-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>
      
      {/* Drag handle for resizing */}
      <div 
        className="sidebar-drag-handle"
        onMouseDown={() => setIsResizing(true)}
        style={{
          display: isSidebarOpen ? 'block' : 'none',
        }}
      />
    </aside>
  );
};
