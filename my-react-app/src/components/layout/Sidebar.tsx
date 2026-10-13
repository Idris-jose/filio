import React from 'react';
import {
  Home, Files, Clock, Star, Share2,
  FolderOpen, BookOpen, Briefcase, User,
  Trash2, HardDrive, Settings, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StorageUsage } from './StorageUsage';

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  group: 'main' | 'org' | 'util';
};

const navItems: NavItem[] = [
  // Main
  { id: 'home',    label: 'Home',         icon: <Home size={15} />,      group: 'main' },
  { id: 'files',   label: 'My Files',     icon: <Files size={15} />,     group: 'main' },
  { id: 'recent',  label: 'Recent',       icon: <Clock size={15} />,     group: 'main' },
  { id: 'starred', label: 'Starred',      icon: <Star size={15} />,      group: 'main' },
  { id: 'shared',  label: 'Shared',       icon: <Share2 size={15} />,    group: 'main' },
  // Organization
  { id: 'projects', label: 'Projects',   icon: <FolderOpen size={15} />, group: 'org' },
  { id: 'school',   label: 'School',     icon: <BookOpen size={15} />,   group: 'org' },
  { id: 'work',     label: 'Work',       icon: <Briefcase size={15} />,  group: 'org' },
  { id: 'personal', label: 'Personal',   icon: <User size={15} />,       group: 'org' },
  // Utilities
  { id: 'trash',    label: 'Trash',      icon: <Trash2 size={15} />,     group: 'util' },
  { id: 'storage',  label: 'Storage',    icon: <HardDrive size={15} />,  group: 'util' },
  { id: 'settings', label: 'Settings',  icon: <Settings size={15} />,    group: 'util' },
];

export function Sidebar() {
  const { activePage, setActivePage, sidebarOpen, toggleSidebar } = useApp();

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : 'sidebar--closed'}`} aria-label="Navigation">
        {/* Collapse button */}
        <button
          className="sidebar__collapse-btn"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          title={sidebarOpen ? 'Collapse' : 'Expand'}
        >
          {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        <nav className="sidebar__nav" aria-label="Main navigation">
          {/* Main group */}
          <div className="sidebar__group">
            {sidebarOpen && <p className="sidebar__group-label">MAIN</p>}
            {navItems.filter(i => i.group === 'main').map(item => (
              <SidebarItem key={item.id} item={item} isActive={activePage === item.id} />
            ))}
          </div>

          {/* Organization group */}
          <div className="sidebar__group">
            {sidebarOpen && <p className="sidebar__group-label">ORGANIZE</p>}
            {navItems.filter(i => i.group === 'org').map(item => (
              <SidebarItem key={item.id} item={item} isActive={activePage === item.id} />
            ))}
          </div>

          {/* Utilities group */}
          <div className="sidebar__group">
            {sidebarOpen && <p className="sidebar__group-label">UTILITIES</p>}
            {navItems.filter(i => i.group === 'util').map(item => (
              <SidebarItem key={item.id} item={item} isActive={activePage === item.id} />
            ))}
          </div>
        </nav>

        {/* Storage usage */}
        {sidebarOpen && (
          <div className="sidebar__footer">
            <StorageUsage />
          </div>
        )}
      </aside>
    </>
  );
}

function SidebarItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const { setActivePage, sidebarOpen } = useApp();

  return (
    <button
      className={`sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''} focus-ring`}
      onClick={() => setActivePage(item.id)}
      aria-current={isActive ? 'page' : undefined}
      title={!sidebarOpen ? item.label : undefined}
    >
      <span className="sidebar__nav-icon">{item.icon}</span>
      {sidebarOpen && <span className="sidebar__nav-label">{item.label}</span>}
    </button>
  );
}
