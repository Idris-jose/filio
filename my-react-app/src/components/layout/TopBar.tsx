import React, { useRef, useState, useEffect } from 'react';
import { Search, Bell, Menu, X, LogOut, LogIn, UserCheck, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Breadcrumbs } from './Breadcrumbs';

// Pixel-art folder logo inline SVG
function FolioLogo() {
  return (
    <svg width="28" height="22" viewBox="0 0 28 22" className="pixel-art" aria-hidden="true">
      {/* Folder tab */}
      <polygon points="1,3 1,2 2,2 2,1 9,1 9,2 10,2 10,3 11,3 11,6 1,6" fill="#f0b429" stroke="#2a2520" strokeWidth="1.5" strokeLinejoin="miter" />
      {/* Body */}
      <rect x="1" y="5" width="26" height="16" fill="#f0b429" stroke="#2a2520" strokeWidth="1.5" />
      {/* Highlight */}
      <rect x="2" y="6" width="24" height="2" fill="#fbd155" opacity="0.5" />
    </svg>
  );
}

export function TopBar() {
  const { searchQuery, setSearchQuery, toggleSidebar, sidebarOpen, addToast, setActivePage } = useApp();
  const { user, isGuest, signOut, setGuestMode } = useAuth();
  const searchRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchRef.current?.focus();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    addToast('Signed out of virtual workspace', 'info');
  };

  const handleOpenAuth = () => {
    setMenuOpen(false);
    setGuestMode(false);
    setActivePage('auth');
  };

  const userInitial = user?.email ? user.email.slice(0, 2).toUpperCase() : 'GS';

  return (
    <header className="topbar" onKeyDown={handleKeyDown} role="banner">
      {/* Left: hamburger + logo */}
      <div className="topbar__left">
        <button
          className="topbar__hamburger focus-ring"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        <div className="topbar__brand" onClick={() => setActivePage('home')} role="button" tabIndex={0} style={{ cursor: 'pointer' }}>
          <FolioLogo />
          <span className="topbar__brand-name">Folio</span>
        </div>

        {/* Breadcrumb */}
        <div className="topbar__breadcrumb">
          <Breadcrumbs />
        </div>
      </div>

      {/* Center: Search */}
      <div className="topbar__search">
        <Search size={14} className="topbar__search-icon" aria-hidden="true" />
        <input
          ref={searchRef}
          className="topbar__search-input"
          type="search"
          placeholder="Search files and folders…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          aria-label="Search files and folders"
          id="global-search"
        />
        <kbd className="topbar__kbd">Ctrl+K</kbd>
      </div>

      {/* Right: notifications, auth user */}
      <div className="topbar__right" ref={menuRef}>
        <button className="topbar__icon-btn focus-ring" aria-label="Notifications" onClick={() => addToast('System status: Normal. All files synchronized.', 'info')}>
          <Bell size={16} />
          <span className="topbar__notif-dot" aria-label="Notifications active" />
        </button>

        {user ? (
          <div className="topbar__user-container">
            <button
              className="topbar__avatar focus-ring"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={`User account: ${user.email}`}
              title={user.email}
            >
              {userInitial}
            </button>

            {menuOpen && (
              <div className="retro-user-dropdown">
                <div className="retro-user-dropdown__header">
                  <span className="retro-user-dropdown__status-tag">
                    <UserCheck size={12} /> AUTHENTICATED
                  </span>
                  <div className="retro-user-dropdown__email" title={user.email}>
                    {user.email}
                  </div>
                </div>

                <div className="retro-user-dropdown__divider" />

                <button
                  type="button"
                  className="retro-user-dropdown__item retro-user-dropdown__item--danger"
                  onClick={handleSignOut}
                >
                  <LogOut size={14} />
                  <span>LOG OUT</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="topbar__guest-container">
            <button
              className="retro-btn retro-btn--sm retro-btn--secondary"
              onClick={handleOpenAuth}
              title="Sign In or Create Account"
            >
              <LogIn size={13} />
              <span>SIGN IN</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
