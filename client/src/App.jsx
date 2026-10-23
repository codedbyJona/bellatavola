import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from './api.js';
import AuthDialog from './components/AuthDialog.jsx';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import MainContent from './components/MainContent.jsx';

export default function App() {
  const [items, setItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState('');
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authStatus, setAuthStatus] = useState('');

  const loadMenu = useCallback(async (signal) => {
    setMenuLoading(true);
    setMenuError('');
    try {
      const data = await apiFetch('/api/items', { signal });
      setItems(data);
    } catch (error) {
      if (error.name !== 'AbortError') setMenuError(error.message);
    } finally {
      if (!signal?.aborted) setMenuLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadMenu(controller.signal);
    apiFetch('/api/auth/me', { signal: controller.signal })
      .then((result) => setUser(result.user))
      .catch((error) => {
        if (error.name !== 'AbortError') setAuthStatus('Sign-in status is temporarily unavailable.');
      });
    return () => controller.abort();
  }, [loadMenu]);

  async function handleSignOut() {
    setAuthStatus('');
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      setAuthStatus(error.message);
    }
  }

  return (
    <>
      <Header user={user} onSignIn={() => setAuthOpen(true)} onSignOut={handleSignOut} />
      {authStatus && (
        <p className="bg-amber-50 px-4 py-2 text-center text-sm text-amber-950" role="status">
          {authStatus}
        </p>
      )}
      <Hero />
      <MainContent
        error={menuError}
        items={items}
        loading={menuLoading}
        onRetry={() => loadMenu()}
      />
      <Footer />
      {authOpen && (
        <AuthDialog
          onAuthenticated={(authenticatedUser) => {
            setUser(authenticatedUser);
            setAuthStatus('');
          }}
          onClose={() => setAuthOpen(false)}
        />
      )}
    </>
  );
}
