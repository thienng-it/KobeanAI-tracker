import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import SetupWizardPage from './pages/SetupWizardPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import SessionsPage from './pages/SessionsPage.tsx';
import SkillsPage from './pages/SkillsPage.tsx';
import SkillEditorPage from './pages/SkillEditorPage.tsx';
import AgentsConfigPage from './pages/AgentsConfigPage.tsx';
import CommandsPage from './pages/CommandsPage.tsx';
import RulesPage from './pages/RulesPage.tsx';
import McpsPage from './pages/McpsPage.tsx';
import PluginsPage from './pages/PluginsPage.tsx';
import HooksPage from './pages/HooksPage.tsx';
import MemoryPage from './pages/MemoryPage.tsx';
import DocsPage from './pages/DocsPage.tsx';
import WikiPage from './pages/WikiPage.tsx';
import { AppLayout } from './components/layout/AppLayout.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';
import { useThemeStore } from './stores/useThemeStore.ts';

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/setup" element={<SetupWizardPage />} />
        
        {/* Routes with Sidebar & Header */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/skills/new" element={<SkillEditorPage />} />
          <Route path="/skills/:id/edit" element={<SkillEditorPage />} />
          <Route path="/mcps" element={<McpsPage />} />
          <Route path="/plugins" element={<PluginsPage />} />
          <Route path="/hooks" element={<HooksPage />} />
          <Route path="/memory" element={<MemoryPage />} />
          <Route path="/commands" element={<CommandsPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/settings/agents" element={<AgentsConfigPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/wiki" element={<WikiPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
