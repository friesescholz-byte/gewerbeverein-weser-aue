import React from 'react';
import { LOGO_URL } from '../data/initialData';

export default function Footer({ onNavigate, onOpenLegal }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <img
              src={LOGO_URL}
              alt="Unternehmernetzwerk Weser-Aue e.V. Logo"
              className="footer-logo"
              style={{ height: '115px', width: 'auto', marginBottom: '20px' }}
            />
            <p className="footer-text">
              Vernetzt in der Samtgemeinde Weser-Aue. Ihre starke Gemeinschaft für Handel, Handwerk, Gewerbe und Dienstleistung vor Ort.
            </p>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-links">
              <li>
                <a
                  href="#home"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('home');
                  }}
                >
                  Startseite
                </a>
              </li>
              <li>
                <a
                  href="#news"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('news');
                  }}
                >
                  Aktuelles & Berichte
                </a>
              </li>
              <li>
                <a
                  href="#members"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('members');
                  }}
                >
                  Mitgliederverzeichnis
                </a>
              </li>
              <li>
                <a
                  href="#join"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('join');
                  }}
                >
                  Mitglied werden
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Netzwerk</h4>
            <ul className="footer-links">
              <li>
                <a
                  href="#about"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('about');
                  }}
                >
                  Über uns & Vorstand
                </a>
              </li>
              <li>
                <a
                  href="#wiwa"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('wiwa');
                  }}
                >
                  WiWA Wirtschaftsschau
                </a>
              </li>
              <li>
                <a
                  href="#events"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('events');
                  }}
                >
                  Termine & Veranstaltungen
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Rechtliches</h4>
            <ul className="footer-links">
              <li>
                <button onClick={() => onOpenLegal('impressum')}>Impressum</button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('datenschutz')}>Datenschutz</button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('satzung')}>Satzung</button>
              </li>
              <li>
                <a
                  href="#admin"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('admin');
                  }}
                >
                  Vorstands-Login (Admin)
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Unternehmernetzwerk Weser-Aue e.V. – Alle Rechte vorbehalten.</p>
          <a
            href="https://scholz-friese-webdesign.de/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              opacity: 0.85,
              textDecoration: 'none'
            }}
          >
            by Scholz &amp; Friese Webdesign
          </a>
        </div>
      </div>
    </footer>
  );
}
