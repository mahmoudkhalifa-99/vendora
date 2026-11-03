import { lazy, StrictMode, Suspense, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const AdminPage = lazy(() => import('./admin/AdminPage'));

const isAdminHash = () => window.location.hash.startsWith('#/admin');

function Root() {
  const [admin, setAdmin] = useState(isAdminHash());
  useEffect(() => {
    const on = () => setAdmin(isAdminHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  if (!admin) return <App />;
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-slate-500">جاري التحميل...</div>}>
      <AdminPage />
    </Suspense>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
