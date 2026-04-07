import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './providers/ThemeProvider';
import { ToastProvider } from './providers/ToastProvider';
import { seedTemplatesIfNeeded } from './lib/db';
import defaultTemplates from './data/templates.json';
import Dashboard from './pages/Dashboard';
import ScratchPadPage from './pages/ScratchPadPage';
import './App.css';

function App() {
  useEffect(() => {
    seedTemplatesIfNeeded(defaultTemplates as any);
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scratch/:id?" element={<ScratchPadPage />} />
            {/* 兼容旧链接，重定向到草稿纸 */}
            <Route path="/editor/:id?" element={<Navigate to="/scratch" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
