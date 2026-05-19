import React, { useState } from 'react';
import { LayoutDashboard, Search, AppWindow, FileText, MousePointerClick, BellRing } from 'lucide-react';

import Dashboard from './components/dashboard';
import DebounceSearch from './components/debounce_search';
import ModalDialog from './components/modal_dialog';
import ReactDocs from './components/react-docs';
import ScrollTemplates from './components/scroll_templates';
import ToastNotifications from './components/toast_notifications';

const COMPONENTS = [
  { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={18} />, component: <Dashboard /> },
  { id: 'search', name: 'Debounce Search', icon: <Search size={18} />, component: <DebounceSearch /> },
  { id: 'modal', name: 'Modal Dialog', icon: <AppWindow size={18} />, component: <ModalDialog /> },
  { id: 'toast', name: 'Toast Notifications', icon: <BellRing size={18} />, component: <ToastNotifications /> },
  { id: 'scroll', name: 'Scroll Templates', icon: <MousePointerClick size={18} />, component: <ScrollTemplates /> },
  { id: 'docs', name: 'React Docs', icon: <FileText size={18} />, component: <ReactDocs /> },
];

function App() {
  const [activeId, setActiveId] = useState('dashboard');

  const ActiveComponent = COMPONENTS.find(c => c.id === activeId)?.component;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '260px', backgroundColor: '#1e293b', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #334155' }}>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
            UI Components
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>Design Library Showcase</p>
        </div>
        
        <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
          {COMPONENTS.map((comp) => (
            <button
              key={comp.id}
              onClick={() => setActiveId(comp.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
                transition: 'all 0.2s',
                backgroundColor: activeId === comp.id ? '#38bdf820' : 'transparent',
                color: activeId === comp.id ? '#38bdf8' : '#cbd5e1',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => { if (activeId !== comp.id) e.currentTarget.style.backgroundColor = '#334155'; }}
              onMouseLeave={(e) => { if (activeId !== comp.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {comp.icon}
              {comp.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#0f172a', position: 'relative' }}>
        {ActiveComponent}
      </div>
    </div>
  );
}

export default App;
