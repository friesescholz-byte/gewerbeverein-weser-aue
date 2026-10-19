import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LegalModal from './components/LegalModal';
import NewsModal from './components/NewsModal';
import MemberModal from './components/MemberModal';

import HomePage from './pages/HomePage';
import NewsPage from './pages/NewsPage';
import EventsPage from './pages/EventsPage';
import MembersPage from './pages/MembersPage';
import AboutPage from './pages/AboutPage';
import WiwaPage from './pages/WiwaPage';
import JoinPage from './pages/JoinPage';
import AdminPage from './pages/AdminPage';

const HASH_TO_PAGE = {
  '#home': 'home',
  '#aktuelles': 'news',
  '#news': 'news',
  '#termine': 'events',
  '#events': 'events',
  '#mitglieder': 'members',
  '#members': 'members',
  '#ueber-uns': 'about',
  '#about': 'about',
  '#wiwa': 'wiwa',
  '#mitglied-werden': 'join',
  '#join': 'join',
  '#admin': 'admin'
};

const PAGE_TO_HASH = {
  home: '#home',
  news: '#aktuelles',
  events: '#termine',
  members: '#mitglieder',
  about: '#ueber-uns',
  wiwa: '#wiwa',
  join: '#mitglied-werden',
  admin: '#admin'
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [activeNewsModal, setActiveNewsModal] = useState(null);
  const [activeMemberModal, setActiveMemberModal] = useState(null);
  const [activeLegalModal, setActiveLegalModal] = useState(null);

  useEffect(() => {
    const syncFromLocation = () => {
      if (window.location.pathname === '/admin') {
        setCurrentPage('admin');
        return;
      }
      const h = window.location.hash.toLowerCase();
      if (h && HASH_TO_PAGE[h]) {
        setCurrentPage(HASH_TO_PAGE[h]);
      }
    };
    syncFromLocation();
    window.addEventListener('hashchange', syncFromLocation);
    return () => window.removeEventListener('hashchange', syncFromLocation);
  }, []);

  const handleNavigate = (pageId) => {
    setCurrentPage(pageId);
    const targetHash = PAGE_TO_HASH[pageId] || '#home';
    if (window.location.hash !== targetHash) {
      window.history.pushState(null, '', targetHash);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectNews={(article) => setActiveNewsModal(article)}
          />
        )}

        {currentPage === 'news' && (
          <NewsPage
            onSelectNews={(article) => setActiveNewsModal(article)}
          />
        )}

        {currentPage === 'events' && <EventsPage />}

        {currentPage === 'members' && (
          <MembersPage
            onSelectMember={(member) => setActiveMemberModal(member)}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage
            onNavigate={handleNavigate}
            onOpenLegal={(type) => setActiveLegalModal(type)}
          />
        )}

        {currentPage === 'wiwa' && (
          <WiwaPage onOpenLegal={(type) => setActiveLegalModal(type)} />
        )}

        {currentPage === 'join' && (
          <JoinPage onOpenLegal={(type) => setActiveLegalModal(type)} />
        )}

        {currentPage === 'admin' && (
          <div style={{ paddingTop: '90px' }}>
            <AdminPage onNavigate={handleNavigate} />
          </div>
        )}
      </main>

      <Footer
        onNavigate={handleNavigate}
        onOpenLegal={(type) => setActiveLegalModal(type)}
      />

      {/* Modals */}
      <NewsModal
        article={activeNewsModal}
        onClose={() => setActiveNewsModal(null)}
      />
      <MemberModal
        member={activeMemberModal}
        onClose={() => setActiveMemberModal(null)}
      />
      <LegalModal
        activeType={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
      />
    </div>
  );
}
