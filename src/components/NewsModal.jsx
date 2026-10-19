import React, { useState, useEffect } from 'react';

export default function NewsModal({ article, onClose }) {
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    setSlideIdx(0);
  }, [article]);

  if (!article) return null;

  const images =
    article.images && article.images.length > 0
      ? article.images
      : article.image
      ? [article.image]
      : [];

  const paragraphs = (article.content || article.excerpt || '')
    .split(/\n\n+/)
    .filter(Boolean);

  return (
    <div
      className="modal-overlay active"
      onClick={onClose}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close"
          aria-label="Schließen"
          onClick={onClose}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* Image Slider */}
        {images.length > 0 && (
          <div className="modal-slider-container">
            <div
              className="modal-slider-track"
              style={{ transform: `translateX(-${slideIdx * 100}%)` }}
            >
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="slider-image"
                  style={{ backgroundImage: `url('${imgUrl}')` }}
                />
              ))}
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="slider-btn slider-prev"
                  aria-label="Vorheriges Bild"
                  onClick={() =>
                    setSlideIdx((prev) => (prev - 1 + images.length) % images.length)
                  }
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <button
                  type="button"
                  className="slider-btn slider-next"
                  aria-label="Nächstes Bild"
                  onClick={() => setSlideIdx((prev) => (prev + 1) % images.length)}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
                <div className="slider-dots">
                  {images.map((_, idx) => (
                    <span
                      key={idx}
                      className={`slider-dot ${idx === slideIdx ? 'active' : ''}`}
                      onClick={() => setSlideIdx(idx)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Text Content */}
        <div className="modal-text-container">
          <span className="modal-date">{article.date}</span>
          <h2 className="modal-title">{article.title}</h2>
          <div className="modal-body">
            {paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
