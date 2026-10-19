import React from 'react';
import { useData } from '../context/DataContext';

export default function NewsPage({ onSelectNews }) {
  const { news } = useData();

  return (
    <div>
      {/* Page Header */}
      <section className="page-hero">
        <div className="container">
          <h1 className="page-title">Berichte & Aktuelles</h1>
          <p className="page-subtitle">
            Einblicke in unsere Vereinsarbeit, Rückblicke auf gemeinsame Veranstaltungen und aktuelle Meldungen aus dem Unternehmernetzwerk Weser-Aue.
          </p>
        </div>
      </section>

      {/* News Grid Section */}
      <section className="section bg-light">
        <div className="container">
          <div className="news-grid-page">
            {news.map((item) => {
              const previewImg = item.image || (item.images && item.images[0]) || '';
              const shortExcerpt =
                item.excerpt && item.excerpt.length > 150
                  ? item.excerpt.substring(0, 150) + '...'
                  : item.excerpt;

              return (
                <article key={item.id} className="news-card-large">
                  <div
                    className="news-card-img"
                    style={
                      previewImg
                        ? { backgroundImage: `url('${previewImg}')` }
                        : undefined
                    }
                  />
                  <div className="news-card-content">
                    <span className="news-date">{item.date}</span>
                    <h3 className="news-title">{item.title}</h3>
                    <p className="news-excerpt">{shortExcerpt}</p>
                    <button
                      type="button"
                      onClick={() => onSelectNews(item)}
                      className="btn btn-outline"
                    >
                      Beitrag vollständig lesen
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
