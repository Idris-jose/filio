import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FolderIcon } from '../components/folders/FolderIcon';
import { Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck, Terminal } from 'lucide-react';

interface AuthPageProps {
  onSuccess?: () => void;
  defaultMode?: 'signin' | 'signup';
}

export function AuthPage({ onSuccess, defaultMode = 'signin' }: AuthPageProps) {
  const { signIn, signUp, setGuestMode } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      setIsLoading(true);
      const { error, needsEmailConfirmation } = await signUp(email, password);
      setIsLoading(false);

      if (error) {
        setErrorMessage(error.message);
      } else {
        if (needsEmailConfirmation) {
          setSuccessMessage('Account registered! A verification email has been sent. Please check your inbox.');
        } else {
          setSuccessMessage('Account created successfully! Logging you into your workspace...');
          onSuccess?.();
        }
      }
    } else {
      setIsLoading(true);
      const { error } = await signIn(email, password);
      setIsLoading(false);

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage('Access granted. Loading workspace...');
        onSuccess?.();
      }
    }
  };

  const handleGuestAccess = () => {
    setGuestMode(true);
    onSuccess?.();
  };

  return (
    <div className="retro-auth-container">
      {/* Background ambient CRT lines & grid */}
      <div className="retro-auth-backdrop" />

      <div className="retro-auth-card">
        {/* Retro Window Titlebar */}
        <div className="retro-auth-header">
          <div className="retro-auth-header__left">
            <span className="retro-auth-header__icon"><Terminal size={14} /></span>
            <span className="retro-auth-header__title">FOLIO_OS // AUTHENTICATION_TERMINAL</span>
          </div>
          <div className="retro-window-controls">
            <span className="retro-win-btn retro-win-btn--min">_</span>
            <span className="retro-win-btn retro-win-btn--max">□</span>
            <span className="retro-win-btn retro-win-btn--close">✕</span>
          </div>
        </div>

        {/* Brand Banner */}
        <div className="retro-auth-brand">
          <div className="retro-auth-brand__icon-wrap">
            <FolderIcon color="amber" size={56} isOpen={mode === 'signup'} />
          </div>
          <div className="retro-auth-brand__text">
            <h1 className="retro-auth-title">FOLIO VIRTUAL ORGANIZER</h1>
            <p className="retro-auth-subtitle">
              {mode === 'signin' ? 'Sign in to access your desktop filing system' : 'Create an account to save files across sessions'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="retro-auth-tabs">
          <button
            type="button"
            className={`retro-auth-tab ${mode === 'signin' ? 'retro-auth-tab--active' : ''}`}
            onClick={() => { setMode('signin'); setErrorMessage(null); setSuccessMessage(null); }}
          >
            [ SIGN IN ]
          </button>
          <button
            type="button"
            className={`retro-auth-tab ${mode === 'signup' ? 'retro-auth-tab--active' : ''}`}
            onClick={() => { setMode('signup'); setErrorMessage(null); setSuccessMessage(null); }}
          >
            [ CREATE ACCOUNT ]
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="retro-auth-alert retro-auth-alert--error" role="alert">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="retro-auth-alert retro-auth-alert--success" role="alert">
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="retro-auth-form">
          <div className="retro-form-group">
            <label className="retro-label" htmlFor="auth-email">
              <Mail size={13} className="retro-label__icon" /> USER EMAIL
            </label>
            <div className="retro-input-wrapper">
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@workspace.lan"
                required
                autoComplete="email"
                className="retro-input"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="retro-form-group">
            <div className="retro-form-group__header">
              <label className="retro-label" htmlFor="auth-password">
                <Lock size={13} className="retro-label__icon" /> PASSWORD
              </label>
            </div>
            <div className="retro-input-wrapper">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                className="retro-input"
                disabled={isLoading}
              />
              <button
                type="button"
                className="retro-input-addon"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="retro-form-group">
              <label className="retro-label" htmlFor="auth-confirm-password">
                <ShieldCheck size={13} className="retro-label__icon" /> CONFIRM PASSWORD
              </label>
              <div className="retro-input-wrapper">
                <input
                  id="auth-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="new-password"
                  className="retro-input"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <div className="retro-auth-actions">
            <button
              type="submit"
              className="retro-btn retro-btn--primary retro-auth-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="retro-loading-text">AUTHENTICATING...</span>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'LOG IN TO DESKTOP' : 'CREATE WORKSPACE ACCOUNT'}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Guest access option */}
        <div className="retro-auth-footer">
          <div className="retro-auth-divider">
            <span>OR DEMO</span>
          </div>
          <button
            type="button"
            className="retro-btn retro-btn--ghost retro-guest-btn"
            onClick={handleGuestAccess}
          >
            CONTINUE AS GUEST WORKSPACE
          </button>
          <div className="retro-auth-security-note">
            SECURED VIA SUPABASE AUTHENTICATION
          </div>
        </div>
      </div>
    </div>
  );
}
