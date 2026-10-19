import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';

export default function MembersPage() {
  const { members } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return [...members]
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'de'))
      .filter((m) => {
        if (!q) return true;
        return (
          (m.name && m.name.toLowerCase().includes(q)) ||
          (m.category && m.category.toLowerCase().includes(q)) ||
          (m.city && m.city.toLowerCase().includes(q)) ||
          (m.address && m.address.toLowerCase().includes(q)) ||
          (m.contactPerson && m.contactPerson.toLowerCase().includes(q)) ||
          (m.description && m.description.toLowerCase().includes(q))
        );
      });
  }, [members, searchTerm]);

  return (
    <div>
      {/* Page Hero */}
      <section className="page-hero" style={{ paddingBottom: '60px' }}>
        <div className="container">
          <h1 className="page-title">Mitgliederverzeichnis</h1>
          <p className="page-subtitle">
            Kompetenz direkt vor Ort: Lernen Sie die angeschlossenen Handwerksbetriebe, Fachhändler, Dienstleister und Unternehmen aus der Samtgemeinde Weser-Aue kennen.
          </p>

          {/* Search Bar */}
          <div className="member-search-container">
            <div className="search-input-wrapper">
              <i className="fa-solid fa-search search-icon"></i>
              <input
                type="text"
                id="member-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Betrieb, Branche oder Ort in der Weser-Aue suchen..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section bg-light" style={{ paddingTop: '40px' }}>
        <div className="container">
          {filteredMembers.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                background: 'white',
                borderRadius: '16px',
                color: '#666'
              }}
            >
              <i
                className="fa-solid fa-magnifying-glass"
                style={{ fontSize: '2rem', color: '#ccc', marginBottom: '15px', display: 'block' }}
              ></i>
              <h3>Kein passender Betrieb gefunden</h3>
              <p>Zu Ihrer Suchanfrage „{searchTerm}“ liegt aktuell kein Eintrag im Verzeichnis vor.</p>
            </div>
          ) : (
            <div className="members-page-grid">
              {filteredMembers.map((member) => {
                const addressLine = [member.street, `${member.zip || ''} ${member.city || ''}`.trim()]
                  .filter(Boolean)
                  .join(', ') || member.address;

                const cleanWeb = member.website
                  ? member.website.replace(/^https?:\/\//, '').replace(/\/$/, '')
                  : '';
                const webHref = member.website
                  ? member.website.startsWith('http')
                    ? member.website
                    : `https://${member.website}`
                  : '';

                return (
                  <div key={member.id} className="member-tile">
                    <div className="member-logo-wrapper">
                      {member.logo ? (
                        <img
                          src={member.logo}
                          alt={`${member.name} Logo`}
                          loading="lazy"
                        />
                      ) : (
                        <i
                          className="fa-solid fa-building"
                          style={{ fontSize: '2.5rem', color: '#ccc' }}
                        ></i>
                      )}
                    </div>

                    <h3 className="member-name">{member.name}</h3>

                    <div className="member-details">
                      {addressLine && (
                        <div className="member-detail-item">
                          <i className="fa-solid fa-location-dot"></i>
                          <span>{addressLine}</span>
                        </div>
                      )}
                      {member.phone && (
                        <div className="member-detail-item">
                          <i className="fa-solid fa-phone"></i>
                          <a href={`tel:${member.phone.replace(/[^0-9+]/g, '')}`}>
                            {member.phone}
                          </a>
                        </div>
                      )}
                      {member.email && (
                        <div className="member-detail-item">
                          <i className="fa-solid fa-envelope"></i>
                          <a href={`mailto:${member.email}`}>{member.email}</a>
                        </div>
                      )}
                      {member.website && (
                        <div className="member-detail-item">
                          <i className="fa-solid fa-globe"></i>
                          <a href={webHref} target="_blank" rel="noopener noreferrer">
                            {cleanWeb}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="member-tags">
                      {member.category && (
                        <span className="member-tag">{member.category}</span>
                      )}
                      {member.city && (
                        <span className="member-tag">{member.city}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
