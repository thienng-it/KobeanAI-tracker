import React from 'react';
import { NavLink } from 'react-router';
import { LayoutDashboard, List, BrainCircuit, Terminal, ShieldAlert, Cpu, Sun, Moon, BookOpen } from 'lucide-react';
import './Sidebar.css';
import { useThemeStore } from '../../stores/useThemeStore.ts';

export const Sidebar: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();

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
    <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
            KobeanAI <span style={{ color: 'var(--color-primary)' }}>Tracker</span>
          </span>
        </div>
      </div>
      <nav className="sidebar-nav" style={{ flex: 1 }}>
        {navItems.map(item => (
          <NavLink 
            key={item.path}
            to={item.path} 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
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
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-surface-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </aside>
  );
};
