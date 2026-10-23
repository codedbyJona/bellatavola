import { useState } from 'react';
import { apiFetch } from '../api.js';

export default function AuthDialog({ onClose, onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await apiFetch(`/api/auth/${mode === 'login' ? 'login' : 'signup'}`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      onAuthenticated(result.user);
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="dialog-close" onClick={onClose} type="button" aria-label="Close sign-in dialog">×</button>
        <p className="eyebrow">A seat at our table</p>
        <h2 className="mb-5 font-serif text-3xl text-stone-800" id="auth-title">
          {mode === 'login' ? 'Welcome back' : 'Create an account'}
        </h2>
        <div className="mb-5 flex gap-2">
          {['login', 'signup'].map((nextMode) => (
            <button
              className={`filter-button ${mode === nextMode ? 'filter-button-active' : ''}`}
              key={nextMode}
              type="button"
              aria-pressed={mode === nextMode}
              onClick={() => {
                setMode(nextMode);
                setError('');
              }}
            >
              {nextMode === 'login' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Email</span>
            <input
              autoComplete="email"
              autoFocus
              maxLength={254}
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="form-field">
            <span>Password</span>
            <input
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={8}
              maxLength={72}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          {error && <p className="text-sm text-red-800" role="alert">{error}</p>}
          <button className="primary-button w-full disabled:cursor-wait disabled:opacity-60" disabled={submitting} type="submit">
            {submitting ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </section>
    </div>
  );
}
