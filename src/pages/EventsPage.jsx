import React from 'react';
import { useData } from '../context/DataContext';

export default function EventsPage() {
  const { events } = useData();

  const handleDownloadICS = (ev) => {
    const title = ev.title || 'Veranstaltung Unternehmernetzwerk Weser-Aue e.V.';
    const location = ev.location || 'Samtgemeinde Weser-Aue';
    const desc = (ev.description || '').replace(/\n/g, '\\n');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Unternehmernetzwerk Weser-Aue e.V.//DE',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `LOCATION:${location}`,
      `DESCRIPTION:${desc}`,
      'DTSTART:20260515T170000Z',
      'DTEND:20260515T200000Z',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Page Header */}
      <section className="page-hero">
        <div className="container">
          <h1 className="page-title">Veranstaltungskalender</h1>
          <p className="page-subtitle">
            Ob Unternehmertreffen, Jahreshauptversammlung oder Wirtschaftsschau – hier finden Sie alle anstehenden Termine unseres Netzwerks in der Samtgemeinde Weser-Aue.
          </p>
        </div>
      </section>

      {/* Events Section */}
      <section className="section bg-light">
        <div className="container">
          <div className="events-page-grid">
            {events.map((ev) => (
              <div key={ev.id} className="event-tile">
                <div className="event-tile-header">
                  <div className="event-tile-date">
                    <span className="day">{ev.day || '01'}</span>
                    <span className="month">{ev.month || 'JAN'}</span>
                  </div>
                  <h3 className="event-tile-title">{ev.title}</h3>
                </div>
                <div className="event-tile-body">
                  <div className="event-tile-meta">
                    <span>
                      <i className="fa-regular fa-clock"></i> {ev.time || 'Uhrzeit folgt'}
                    </span>
                    <span>
                      <i className="fa-solid fa-location-dot"></i>{' '}
                      {ev.location || 'Samtgemeinde Weser-Aue'}
                    </span>
                  </div>
                  <p className="event-tile-desc">{ev.description}</p>
                  <div className="event-tile-footer">
                    <button
                      type="button"
                      onClick={() => handleDownloadICS(ev)}
                      className="btn btn-outline"
                      style={{ width: '100%', textAlign: 'center' }}
                    >
                      <i
                        className="fa-regular fa-calendar-plus"
                        style={{ marginRight: '8px' }}
                      ></i>
                      Termin im Kalender speichern
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
