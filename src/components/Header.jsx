import React, { useState, useEffect } from 'react';
import { HEADER_LOGO_URL } from '../data/initialData';

export default function Header({ currentPage, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Startseite' },
    { id: 'news', label: 'Aktuelles' },
    { id: 'events', label: 'Termine' },
    { id: 'members', label: 'Mitglieder' },
    { id: 'about', label: 'Über uns' },
    { id: 'wiwa', label: 'WiWA' }
  ];

  const handleNav = (pageId) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`} id="header">
      <div className="container header-container">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            handleNav('home');
          }}
          className="logo"
        >
          <img
            src={HEADER_LOGO_URL}
            alt="Unternehmernetzwerk Weser-Aue e.V."
          />
        </a>

        <nav className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`} id="nav-menu">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.id} className="nav-item">
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav(item.id);
                  }}
                  className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="nav-actions">
            <a
              href="#join"
              onClick={(e) => {
                e.preventDefault();
                handleNav('join');
              }}
              className="btn btn-outline"
            >
              Mitglied werden
            </a>
          </div>
        </nav>

        <button
          className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}
          id="hamburger"
          aria-label="Menü öffnen"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>
    </header>
  );
}
