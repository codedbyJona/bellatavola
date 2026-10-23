import { useState } from 'react';

export default function Header({ user, onSignIn, onSignOut }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-emerald-950 text-white shadow-md">
      <div className="site-container relative flex min-h-[68px] items-center justify-between gap-3">
        <a className="brand" href="#home" aria-label="Bella Tavola home">
          <span className="brand-mark" aria-hidden="true">B</span>
          <span>Bella <span className="font-medium">Tavola</span></span>
        </a>
        <nav
          id="primary-navigation"
          className={`absolute left-0 top-full z-10 flex w-full flex-col gap-3 border-t border-white/10 bg-emerald-950 px-4 py-4 shadow-md sm:static sm:w-auto sm:flex-row sm:items-center sm:gap-5 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none md:gap-8 ${menuOpen ? 'flex' : 'hidden sm:flex'}`}
          aria-label="Main navigation"
        >
          <a className="nav-link" href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          <a className="nav-link" href="#menu" onClick={() => setMenuOpen(false)}>Menu</a>
          <a className="nav-link" href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a className="nav-link" href="#reservation" onClick={() => setMenuOpen(false)}>Reservation</a>
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <span className="hidden max-w-36 truncate text-xs text-white/75 md:inline" title={user.email}>
                {user.email}
              </span>
              <button className="auth-button" onClick={onSignOut} type="button">Sign out</button>
            </>
          ) : (
            <button className="auth-button" onClick={onSignIn} type="button">Sign in</button>
          )}
          <button
            className="grid h-10 w-10 place-content-center gap-1 rounded-full border border-white/25 bg-transparent sm:hidden"
            type="button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="h-px w-4 bg-white" />
            <span className="h-px w-4 bg-white" />
            <span className="h-px w-4 bg-white" />
          </button>
        </div>
      </div>
    </header>
  );
}
