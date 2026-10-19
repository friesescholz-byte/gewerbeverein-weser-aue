import React from 'react';
import { useData } from '../context/DataContext';

export default function AboutPage({ onOpenLegal }) {
  const { board, members } = useData();

  const getRoleIcon = (role = '') => {
    const r = role.toLowerCase();
    if (r.includes('1. vorsitz') || r.includes('erste')) return 'fa-user-tie';
    if (r.includes('2. vorsitz') || r.includes('stellv')) return 'fa-user-check';
    if (r.includes('kassen') || r.includes('schatz') || r.includes('finanz'))
      return 'fa-coins';
    if (r.includes('schrift') || r.includes('presse')) return 'fa-pen-nib';
    if (r.includes('kassenprüf')) return 'fa-magnifying-glass-chart';
    return 'fa-users-gear';
  };

  return (
    <div>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <h1 className="page-title">Über uns & Vorstand</h1>
          <p className="page-subtitle">
            Das Unternehmernetzwerk Weser-Aue e.V. verbindet Tradition und Aufbruch: Wir vernetzen die Wirtschaft vor Ort, vertreten gemeinsame Standortinteressen und fördern den direkten Dialog in unserer Samtgemeinde.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section bg-light">
        <div className="container">
          {/* History Section (Timeline) */}
          <div style={{ marginBottom: '100px' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <span
                style={{
                  color: 'var(--primary)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  fontSize: '0.9rem',
                  display: 'block',
                  marginBottom: '10px'
                }}
              >
                Meilensteine
              </span>
              <h2
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color: 'var(--secondary)',
                  fontSize: '2.5rem',
                  fontWeight: 800
                }}
              >
                Entwicklung unseres Netzwerks
              </h2>
            </div>

            <div className="timeline">
              {/* 1992 */}
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-date">1992</div>
                  <h3>Gründung & erste Impulse</h3>
                  <p>
                    Engagierte Kaufleute, Handwerksmeister und Selbstständige schließen sich zusammen, um den Wirtschaftsstandort vor Ort zu stärken. Ziel von Beginn an: Die Vielfalt der regionalen Betriebe sichtbar zu machen und ein verlässliches Sprachrohr gegenüber der Kommunalpolitik zu schaffen.
                  </p>
                </div>
              </div>

              {/* 1993 - 2024 */}
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-date">1993 - 2024</div>
                  <h3>Drei Jahrzehnte gelebte Gemeinschaft</h3>
                  <p>
                    Durch regelmäßige Leistungsschauen, Fachvorträge, Betriebsbesichtigungen und regionale Aktionen wächst der Verein kontinuierlich. Über Branchen- und Ortsgrenzen hinweg entsteht ein belastbares Netzwerk aus Familienbetrieben, Dienstleistern und Gewerbetreibenden.
                  </p>
                </div>
              </div>

              {/* 2025 */}
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-date">2025</div>
                  <h3>Große Wirtschaftsschau WiWA</h3>
                  <p>
                    Mit der <strong>WiWA (Wirtschaftsschau Weser-Aue)</strong> präsentieren zahlreiche Aussteller aus Handwerk, Handel, Dienstleistung und Vereinen an zwei besucherstarken Tagen, welche wirtschaftliche Stärke und Innovationskraft in unserer Region steckt.
                  </p>
                </div>
              </div>

              {/* Heute */}
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-date">Heute</div>
                  <h3>Unternehmernetzwerk Weser-Aue e.V.</h3>
                  <p>
                    Passend zur gesamten <strong>Samtgemeinde Weser-Aue</strong> stellt sich der Verein mit neuem Namen und moderner Ausrichtung für die Zukunft auf: Als <strong>Unternehmernetzwerk Weser-Aue e.V.</strong> vereinen wir heute rund {members.length} aktive Mitgliedsbetriebe aus Marklohe, Liebenau, Balge, Binnen und Pennigsehl.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Board Section */}
          <div className="board-section">
            <div className="board-header">
              <h2>Vorstand & Ansprechpartner</h2>
              <p
                style={{
                  color: 'var(--text-muted)',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}
              >
                Unser Vorstandsteam engagiert sich ehrenamtlich für die Belange der Mitgliedsbetriebe und steht Ihnen bei Fragen rund um das Netzwerk gerne zur Verfügung.
              </p>
            </div>

            <div className="board-grid">
              {board.map((person) => (
                <div key={person.id} className="board-card">
                  <div className="board-icon">
                    <i className={`fa-solid ${getRoleIcon(person.role)}`}></i>
                  </div>
                  <div className="board-role">{person.role}</div>
                  <h3 className="board-name">{person.name}</h3>
                  <div className="board-contact">
                    {person.company && (
                      <div className="contact-item">
                        <i className="fa-solid fa-building"></i>
                        <span>{person.company}</span>
                      </div>
                    )}
                    {person.city && (
                      <div className="contact-item">
                        <i className="fa-solid fa-location-dot"></i>
                        <span>{person.city}</span>
                      </div>
                    )}
                    {person.phone && (
                      <div className="contact-item">
                        <i className="fa-solid fa-phone"></i>
                        <a href={`tel:${person.phone.replace(/[^0-9+]/g, '')}`}>
                          {person.phone}
                        </a>
                      </div>
                    )}
                    {person.email && (
                      <div className="contact-item">
                        <i className="fa-solid fa-envelope"></i>
                        <a href={`mailto:${person.email}`}>{person.email}</a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {onOpenLegal && (
              <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <button
                  type="button"
                  onClick={() => onOpenLegal('satzung')}
                  className="btn btn-outline"
                >
                  <i className="fa-regular fa-file-lines" style={{ marginRight: '8px' }}></i>
                  Vereinssatzung einsehen
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
