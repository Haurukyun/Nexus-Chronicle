import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Global uncaught error listener to prevent silent blank/blue screen
if (typeof window !== 'undefined') {
  const showErrorBanner = (title: string, message: string, stack?: string) => {
    let container = document.getElementById('__app_fatal_error__');
    if (!container) {
      container = document.createElement('div');
      container.id = '__app_fatal_error__';
      container.style.cssText = 'position:fixed;inset:0;background:#0f172a;color:#f8fafc;padding:32px;z-index:999999;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;overflow:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;';
      document.body.appendChild(container);
    }
    container.innerHTML = `
      <div style="max-width:700px;width:100%;background:#1e293b;border:2px solid #ef4444;border-radius:16px;padding:24px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
        <h2 style="color:#ef4444;font-size:18px;font-weight:bold;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:0.05em;">${title}</h2>
        <p style="color:#fca5a5;font-size:14px;margin:0 0 16px 0;word-break:break-word;">${message}</p>
        ${stack ? `<pre style="background:#090d16;color:#e2e8f0;padding:12px;border-radius:8px;font-size:11px;overflow:auto;max-height:240px;margin:0 0 16px 0;white-space:pre-wrap;">${stack}</pre>` : ''}
        <button onclick="window.location.reload()" style="background:#ef4444;color:white;border:none;padding:8px 16px;border-radius:8px;font-weight:bold;font-size:12px;cursor:pointer;text-transform:uppercase;">Reload Chronicle</button>
      </div>
    `;
  };

  window.addEventListener('error', (e) => {
    console.error('GLOBAL_WINDOW_ERROR:', e.error || e.message);
    showErrorBanner('Application Error', e.message || 'Unknown error occurred', e.error?.stack);
  });

  window.addEventListener('unhandledrejection', (e) => {
    console.error('GLOBAL_UNHANDLED_REJECTION:', e.reason);
    showErrorBanner('Unhandled Promise Rejection', e.reason?.message || String(e.reason), e.reason?.stack);
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary fallbackLabel="A critical issue occurred during Chronicle Codex startup.">
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
