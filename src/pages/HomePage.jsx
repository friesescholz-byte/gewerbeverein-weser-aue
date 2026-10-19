import React from 'react';
import { useData } from '../context/DataContext';
import { WESERSCHLEIFE_IMAGE_URL } from '../data/initialData';

export default function HomePage({ onNavigate, onSelectNews }) {
  const { members, news, events } = useData();

  const latestNews = news.slice(0, 2);
  const upcomingEvents = events.slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">Ein starkes Netzwerk für die Wirtschaft in der Weser-Aue</h1>
            <p className="hero-subtitle">
              Im Unternehmernetzwerk Weser-Aue e.V. bündeln Betriebe, Handwerker, Händler und Dienstleister aus der gesamten Samtgemeinde ihre Kräfte. Wir fördern den persönlichen Dialog, stärken den Standort vor Ort und setzen gemeinsam Impulse für unsere Region.
            </p>
            <div className="hero-buttons">
              <a
                href="#join"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('join');
                }}
                className="btn btn-primary"
              >
                Mitglied werden
              </a>
              <a
                href="#events"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('events');
                }}
                className="btn btn-secondary"
              >
                Kommende Termine
              </a>
            </div>
          </div>
        </div>

        {/* Shape Divider Bottom */}
        <div className="custom-shape-divider-bottom">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0490F3" />
                <stop offset="50%" stopColor="var(--primary)" />
                <stop offset="100%" stopColor="#26890D" />
              </linearGradient>
            </defs>
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              fill="url(#wave-gradient)"
              opacity=".4"
              transform="scale(1, -1) translate(0, -120)"
            ></path>
            <path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              fill="url(#wave-gradient)"
              opacity=".8"
              transform="scale(1, -1) translate(0, -120)"
            ></path>
            <path
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
              fill="var(--bg-light)"
              transform="scale(1, -1) translate(0, -120)"
            ></path>
          </svg>
        </div>
      </section>

      {/* Aus dem Netzwerk: Aktuelles & Termine */}
      <section id="aktuelles" className="section bg-light">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge">Aus dem Netzwerk</span>
            <h2 className="section-title">Neuigkeiten & kommende Termine</h2>
            <p className="section-description">
              Von der Mitgliederversammlung über Fachvorträge und Unternehmensbesuche bis hin zu regionalen Projekten – hier informieren wir Sie übersichtlich über alle aktuellen Entwicklungen und Veranstaltungen unseres Vereins.
            </p>
            <p className="section-highlight">
              Aktuelle Berichte und Termine aus der Weser-Aue direkt im Überblick.
            </p>
          </div>

          <div className="members-grid">
            {/* Aktuelles Spalte */}
            <div className="news-column">
              <h3 className="column-title">
                <i className="fa-regular fa-newspaper"></i> Aktuelles
              </h3>
              <div className="news-cards">
                {latestNews.map((item) => {
                  const previewImg = item.image || (item.images && item.images[0]) || '';
                  const shortText =
                    item.excerpt && item.excerpt.length > 130
                      ? item.excerpt.substring(0, 130) + '...'
                      : item.excerpt;
                  return (
                    <article key={item.id} className="news-card">
                      <div
                        className="news-image-placeholder"
                        style={
                          previewImg
                            ? { backgroundImage: `url('${previewImg}')` }
                            : undefined
                        }
                      >
                        {!previewImg && <i className="fa-regular fa-image"></i>}
                      </div>
                      <div className="news-content">
                        <span className="news-date">{item.date}</span>
                        <h4 className="news-title">{item.title}</h4>
                        <p className="news-excerpt">{shortText}</p>
                        <button
                          type="button"
                          onClick={() => onSelectNews(item)}
                          className="text-link"
                        >
                          Weiterlesen <i className="fa-solid fa-arrow-right"></i>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="column-footer">
                <a
                  href="#news"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('news');
                  }}
                  className="btn btn-outline"
                >
                  Alle Beiträge ansehen
                </a>
              </div>
            </div>

            {/* Termine Spalte */}
            <div className="events-column" id="termine">
              <h3 className="column-title">
                <i className="fa-regular fa-calendar-days"></i> Nächste Termine
              </h3>
              <div className="events-list">
                {upcomingEvents.map((ev) => (
                  <div key={ev.id} className="event-item">
                    <div className="event-date-box">
                      <span className="event-day">{ev.day || '01'}</span>
                      <span className="event-month">{ev.month || 'JAN'}</span>
                    </div>
                    <div className="event-details">
                      <h4 className="event-title">{ev.title}</h4>
                      <p className="event-meta">
                        <span>
                          <i className="fa-regular fa-clock"></i> {ev.time || 'Termin folgt'}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="column-footer">
                <a
                  href="#events"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('events');
                  }}
                  className="btn btn-outline"
                >
                  Zum Veranstaltungskalender
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Für Betriebe: Ihre Vorteile im Netzwerk */}
      <section id="mitglied-werden" className="section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge">Für Betriebe & Selbstständige</span>
            <h2 className="section-title">Gute Gründe für eine Mitgliedschaft</h2>
            <p className="section-description">
              Als Teil des Unternehmernetzwerks Weser-Aue profitieren Sie von kurzen Wegen zu anderen Unternehmen, gemeinsamen Standort-Aktionen und einer starken Präsenz in Marklohe, Liebenau, Balge, Binnen und Pennigsehl.
            </p>
            <p className="section-highlight">
              Gemeinsam erreichen wir in unserer Samtgemeinde mehr als jeder Einzelne allein.
            </p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fa-solid fa-handshake"></i>
              </div>
              <h3 className="benefit-title">Direkte Vernetzung</h3>
              <p className="benefit-text">
                Knüpfen Sie wertvolle Kontakte zu Inhabern, Handwerkern und Entscheidern aus der gesamten Weser-Aue.
              </p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fa-solid fa-bullhorn"></i>
              </div>
              <h3 className="benefit-title">Regionale Präsenz</h3>
              <p className="benefit-text">
                Präsentieren Sie Ihren Betrieb dauerhaft und prominent in unserem Online-Mitgliederverzeichnis.
              </p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fa-regular fa-comments"></i>
              </div>
              <h3 className="benefit-title">Erfahrungsaustausch</h3>
              <p className="benefit-text">
                Tauschen Sie sich auf Augenhöhe über aktuelle Herausforderungen, Ideen und Kooperationen aus.
              </p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fa-solid fa-calendar-check"></i>
              </div>
              <h3 className="benefit-title">Veranstaltungen & Impulse</h3>
              <p className="benefit-text">
                Besuchen Sie unsere Betriebsbesichtigungen, Infoabende und geselligen Unternehmertreffen.
              </p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fa-solid fa-rocket"></i>
              </div>
              <h3 className="benefit-title">Wirtschaftsschau WiWA</h3>
              <p className="benefit-text">
                Nutzen Sie unsere große Leistungsschau WiWA als Bühne für Ihre Produkte und Dienstleistungen.
              </p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className="fa-solid fa-people-group"></i>
              </div>
              <h3 className="benefit-title">Starke Stimme vor Ort</h3>
              <p className="benefit-text">
                Wir vertreten die Anliegen der heimischen Wirtschaft geschlossen gegenüber Politik und Verwaltung.
              </p>
            </div>
          </div>

          <div className="text-center mt-4">
            <a
              href="#join"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('join');
              }}
              className="btn btn-primary btn-large"
            >
              Jetzt Mitgliedsantrag herunterladen
            </a>
          </div>
        </div>
      </section>

      {/* Über uns (Full-bleed Right Side Image with Angled Divider Line) */}
      <section id="ueber-uns" className="about-split-section text-white">
        <div className="container about-split-container">
          <div className="about-split-content">
            <span className="section-badge badge-light">Über das Netzwerk</span>
            <h2 className="section-title">
              Seit 1992 für Handel, Handwerk und Dienstleistung vor Ort
            </h2>
            <p className="section-description text-light">
              Seit über drei Jahrzehnten setzen wir uns aktiv für die wirtschaftliche Entwicklung unserer Heimat ein. Im Unternehmernetzwerk Weser-Aue e.V. engagieren sich heute etablierte Familienbetriebe, moderne Dienstleister und junge Unternehmen Seite an Seite für eine lebendige Region.
            </p>
            <p className="section-highlight text-primary-light">
              Verwurzelt an der Weser – gemeinsam engagiert für unsere Zukunft.
            </p>
            <div className="about-stats">
              <div className="stat-item">
                <span className="stat-number">1992</span>
                <span className="stat-label">Gründungsjahr</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">~{members.length}</span>
                <span className="stat-label">Mitgliedsbetriebe</span>
              </div>
            </div>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('about');
              }}
              className="btn btn-outline-light mt-3"
            >
              Vorstand & Historie kennenlernen
            </a>
          </div>
        </div>

        {/* Full-bleed Right Image with Angled Diagonal Edge */}
        <div className="about-split-image-wrap">
          <div
            className="about-split-image"
            style={{ backgroundImage: `url('${WESERSCHLEIFE_IMAGE_URL}')` }}
            role="img"
            aria-label="Luftaufnahme der Weserschleife in der Samtgemeinde Weser-Aue"
          />
        </div>
      </section>

      {/* WiWA Teaser */}
      <section id="wiwa" className="section">
        <div className="container">
          <div className="gafa-banner">
            <div className="gafa-content">
              <span className="section-badge">Wirtschaftsschau</span>
              <h2 className="section-title">WiWA – Die Leistungsschau der Weser-Aue</h2>
              <p className="section-description" style={{ color: 'rgba(255,255,255,0.88)' }}>
                Auf der Wirtschaftsschau Weser-Aue (WiWA) zeigen unsere heimischen Betriebe, Vereine und Institutionen an einem ganzen Wochenende, welche Kompetenz und Vielfalt in unserer Samtgemeinde steckt – mit direktem Austausch für die ganze Familie.
              </p>
              <p className="section-highlight" style={{ color: '#6cb2ff' }}>
                Die Schaufenster-Bühne für Unternehmen aus der gesamten Region.
              </p>
              <div className="gafa-buttons">
                <a
                  href="#wiwa"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('wiwa');
                  }}
                  className="btn btn-primary btn-large"
                >
                  Infos & Aussteller-Anmeldung zur WiWA
                </a>
              </div>
            </div>
            <div className="gafa-visual">
              <div className="gafa-logo-mock">WiWA</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
