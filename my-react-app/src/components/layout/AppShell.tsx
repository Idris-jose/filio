import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ToastContainer } from '../common/Toast';
import { FilesPage } from '../../pages/FilesPage';
import { RecentPage } from '../../pages/RecentPage';
import { StarredPage } from '../../pages/StarredPage';
import { SharedPage } from '../../pages/SharedPage';
import { TrashPage } from '../../pages/TrashPage';
import { HomePage } from '../../pages/HomePage';
import { AuthPage } from '../../pages/AuthPage';

function PageContent() {
  const { activePage, setActivePage } = useApp();

  switch (activePage) {
    case 'auth':     return <AuthPage onSuccess={() => setActivePage('home')} />;
    case 'home':     return <HomePage />;
    case 'recent':   return <RecentPage />;
    case 'starred':  return <StarredPage />;
    case 'shared':   return <SharedPage />;
    case 'trash':    return <TrashPage />;
    // Organization pages reuse FilesPage with filtered view
    case 'projects':
    case 'school':
    case 'work':
    case 'personal':
    case 'storage':
    case 'settings':
    case 'files':
    default:
      return <FilesPage />;
  }
}

export function AppShell() {
  const { sidebarOpen, setActivePage } = useApp();
  const { user, isGuest, loading } = useAuth();

  // Retro boot sequence while Supabase checks local session
  if (loading) {
    return (
      <div className="retro-boot-screen">
        <div className="retro-boot-box">
          <div className="retro-boot-spinner" />
          <p className="retro-boot-text">FOLIO_OS // CHECKING SYSTEM CREDENTIALS...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated and has not clicked guest mode, display the Auth Portal
  if (!user && !isGuest) {
    return (
      <>
        <AuthPage onSuccess={() => setActivePage('home')} />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="app-shell">
      <TopBar />
      <div className="app-shell__body">
        <Sidebar />
        <main
          className={`app-shell__main ${sidebarOpen ? 'app-shell__main--sidebar-open' : ''}`}
          id="main-content"
        >
          <PageContent />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
