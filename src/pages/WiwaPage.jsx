import React, { useState } from 'react';
import { useData } from '../context/DataContext';

export default function WiwaPage({ onOpenLegal }) {
  const { wiwaGallery, submitApplication, uploadFile } = useData();
  const [visibleCount, setVisibleCount] = useState(6);
  const [lightboxImg, setLightboxImg] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    boothType: 'Innenstand im Festzelt',
    message: '',
    privacy: false
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDownloadForm = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8" />
        <title>WiWA Aussteller-Anmeldung - Unternehmernetzwerk Weser-Aue e.V.</title>
        <style>
          body { font-family: Arial, sans-serif; color: #1a1a1a; max-width: 750px; margin: 40px auto; padding: 20px; line-height: 1.5; }
          h1 { color: #083476; margin-bottom: 5px; }
          .sub { color: #666; margin-bottom: 30px; font-size: 14px; }
          .box { border: 1px solid #ccc; padding: 18px; border-radius: 8px; margin-bottom: 20px; }
          .row { margin-bottom: 14px; }
          .label { font-weight: bold; font-size: 13px; color: #083476; display: block; margin-bottom: 4px; }
          .line { border-bottom: 1px solid #888; height: 24px; width: 100%; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom:20px; text-align:right;">
          <button onclick="window.print()" style="background:#083476;color:#fff;border:none;padding:10px 18px;border-radius:6px;cursor:pointer;font-weight:bold;">Als PDF drucken / speichern</button>
        </div>
        <h1>WiWA – Wirtschaftsschau Weser-Aue</h1>
        <div class="sub">Aussteller-Anmeldung · Unternehmernetzwerk Weser-Aue e.V.</div>
        <div class="box">
          <div class="row"><span class="label">Unternehmen / Betrieb:</span><div class="line"></div></div>
          <div class="row"><span class="label">Ansprechpartner (Vor- und Nachname):</span><div class="line"></div></div>
          <div class="row"><span class="label">Straße & Hausnummer:</span><div class="line"></div></div>
          <div class="row"><span class="label">PLZ & Ort:</span><div class="line"></div></div>
          <div class="row"><span class="label">Telefon & E-Mail:</span><div class="line"></div></div>
        </div>
        <div class="box">
          <div class="row"><span class="label">Gewünschte Standfläche:</span>
            <p>[  ] Innenstand im Gewerbezelt &nbsp;&nbsp;&nbsp; [  ] Freigelände / Außenfläche &nbsp;&nbsp;&nbsp; [  ] Kombinationsstand</p>
          </div>
          <div class="row"><span class="label">Benötigte Breite × Tiefe (in Metern) / Strombedarf:</span><div class="line"></div></div>
        </div>
        <div class="box">
          <div class="row"><span class="label">Ort, Datum & rechtsverbindliche Unterschrift:</span><div class="line" style="height:45px;"></div></div>
        </div>
      </body>
      </html>
    `);
    win.document.close();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.name || !formData.email) {
      setErrorMsg('Bitte füllen Sie Ihren Namen und Ihre E-Mail-Adresse aus.');
      return;
    }
    setSubmitting(true);
    try {
      let uploadedFileUrl = '';
      if (selectedFile) {
        try {
          const upRes = await uploadFile(selectedFile, 'submissions');
          if (upRes && upRes.url) uploadedFileUrl = upRes.url;
        } catch {
          // Continue even if file upload fallback is used
        }
      }

      await submitApplication({
        type: 'wiwa',
        name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        boothType: formData.boothType,
        fileName: selectedFile ? selectedFile.name : '',
        fileUrl: uploadedFileUrl,
        message: formData.message
      });

      setSubmittedSuccess(true);
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        boothType: 'Innenstand im Festzelt',
        message: '',
        privacy: false
      });
      setSelectedFile(null);
    } catch (err) {
      setErrorMsg(err.message || 'Fehler beim Senden der Anmeldung.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <h1 className="page-title">WiWA – Wirtschaftsschau Weser-Aue</h1>
          <p className="page-subtitle">
            Präsentieren Sie Ihr Unternehmen auf unserer großen regionalen Leistungsschau! Hier finden Sie alle Rückblicke sowie die Unterlagen für Ihre Aussteller-Anmeldung.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section bg-light">
        <div className="container">
          {/* 3 Steps */}
          <div className="steps-container">
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Unterlagen laden</h3>
              <p className="step-desc">
                Speichern Sie das Anmeldeformular für Aussteller bequem als PDF-Dokument auf Ihrem Gerät.
              </p>
              <button
                type="button"
                onClick={handleDownloadForm}
                className="btn btn-outline step-action"
              >
                <i className="fa-solid fa-file-pdf" style={{ marginRight: '8px' }}></i>
                Anmeldeformular herunterladen
              </button>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Angaben eintragen</h3>
              <p className="step-desc">
                Tragen Sie Ihre gewünschte Standfläche und Kontaktdaten direkt am Bildschirm oder ausgedruckt ein.
              </p>
              <div className="step-action step-action-dummy">
                <i className="fa-solid fa-pen" style={{ marginRight: '8px' }}></i>
                Am PC oder handschriftlich
              </div>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Online übermitteln</h3>
              <p className="step-desc">
                Reichen Sie den ausgefüllten Bogen direkt über unser untenstehendes Formular beim Organisationsteam ein.
              </p>
              <a
                href="#upload-section"
                className="btn btn-primary step-action"
              >
                <i className="fa-solid fa-arrow-down" style={{ marginRight: '8px' }}></i>
                Zum Einreichungsformular
              </a>
            </div>
          </div>

          {/* WiWA Photo Gallery */}
          <div style={{ marginTop: '80px', marginBottom: '80px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color: 'var(--secondary)',
                  fontSize: '2.2rem',
                  fontWeight: 800,
                  marginBottom: '10px'
                }}
              >
                Einblicke in die WiWA
              </h2>
              <p
                style={{
                  color: 'var(--text-muted)',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}
              >
                Bilder und Eindrücke unserer Wirtschaftsschau Weser-Aue mit starken Betrieben, persönlicher Beratung und bester Stimmung auf dem Gelände.
              </p>
            </div>

            <div className="wiwa-photo-grid">
              {wiwaGallery.slice(0, visibleCount).map((photo) => (
                <div
                  key={photo.id}
                  className="wiwa-photo-item"
                  onClick={() => setLightboxImg(photo.url)}
                >
                  <img
                    src={photo.url}
                    alt={photo.title || 'WiWA Impression'}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            {visibleCount < wiwaGallery.length && (
              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="btn btn-outline"
                  style={{ padding: '12px 30px' }}
                >
                  <i className="fa-solid fa-plus" style={{ marginRight: '8px' }}></i>
                  Weitere Bilder anzeigen
                </button>
              </div>
            )}
          </div>

          {/* Upload Form Section */}
          <div id="upload-section" className="upload-form-container">
            <div className="form-header">
              <h2>WiWA-Anmeldung direkt absenden</h2>
              <p>
                Laden Sie hier Ihre ausgefüllten Aussteller-Unterlagen für das WiWA-Organisationsteam hoch.
              </p>
            </div>

            {submittedSuccess ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '30px 20px',
                  background: '#ebf3ff',
                  borderRadius: '12px',
                  color: 'var(--primary)'
                }}
              >
                <i
                  className="fa-solid fa-circle-check"
                  style={{ fontSize: '3rem', marginBottom: '16px', display: 'block' }}
                ></i>
                <h3 style={{ marginBottom: '10px', color: 'var(--primary)' }}>
                  Ihre WiWA-Anmeldung ist eingegangen!
                </h3>
                <p style={{ marginBottom: '20px', color: 'var(--text-main)' }}>
                  Vielen Dank! Wir haben Ihre Unterlagen erhalten und melden uns zeitnah bezüglich der Standplanung bei Ihnen.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedSuccess(false)}
                  className="btn btn-outline"
                >
                  Weitere Anmeldung übermitteln
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {errorMsg && (
                  <div
                    style={{
                      padding: '12px 16px',
                      background: '#ffebec',
                      color: '#c1121f',
                      borderRadius: '8px',
                      marginBottom: '20px',
                      fontSize: '0.95rem'
                    }}
                  >
                    {errorMsg}
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="wiwa-name">
                      Ansprechpartner (Vor- und Nachname) *
                    </label>
                    <input
                      type="text"
                      id="wiwa-name"
                      className="form-control"
                      required
                      placeholder="Max Mustermann"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="wiwa-company">
                      Name des Betriebs / Unternehmens
                    </label>
                    <input
                      type="text"
                      id="wiwa-company"
                      className="form-control"
                      placeholder="Musterbetrieb GmbH"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label" htmlFor="wiwa-email">
                      E-Mail-Adresse für die Bestätigung *
                    </label>
                    <input
                      type="email"
                      id="wiwa-email"
                      className="form-control"
                      required
                      placeholder="info@musterbetrieb.de"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">
                      Ausgefüllter Anmeldebogen (PDF, JPG oder PNG)
                    </label>
                    <div className="file-upload-wrapper">
                      <input
                        type="file"
                        className="file-upload-input"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          setSelectedFile(
                            e.target.files && e.target.files[0]
                              ? e.target.files[0]
                              : null
                          )
                        }
                      />
                      <div className="file-upload-content">
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        <p>Dokument hier ablegen oder per Klick auswählen</p>
                        <span>Unterstützte Formate: PDF, JPG, PNG (max. 10 MB)</span>
                      </div>
                    </div>
                    {selectedFile && (
                      <div className="file-name-display" style={{ display: 'block' }}>
                        Ausgewählte Datei: {selectedFile.name}
                      </div>
                    )}
                  </div>

                  <div className="form-group full-width">
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        fontSize: '0.9rem',
                        color: 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="checkbox"
                        required
                        style={{ marginTop: '4px' }}
                        checked={formData.privacy}
                        onChange={(e) =>
                          setFormData({ ...formData, privacy: e.target.checked })
                        }
                      />
                      <span>
                        Ich bin damit einverstanden, dass meine Angaben und hochgeladenen Dokumente zur Organisation der WiWA durch das Unternehmernetzwerk Weser-Aue e.V. verarbeitet werden. Details finden Sie in unserer{' '}
                        <button
                          type="button"
                          onClick={() => onOpenLegal && onOpenLegal('datenschutz')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            padding: 0,
                            font: 'inherit'
                          }}
                        >
                          Datenschutzerklärung
                        </button>
                        . *
                      </span>
                    </label>
                  </div>

                  <div className="form-group full-width" style={{ marginBottom: 0 }}>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn btn-primary submit-btn"
                    >
                      <i
                        className="fa-solid fa-paper-plane"
                        style={{ marginRight: '8px' }}
                      ></i>
                      {submitting
                        ? 'Wird übermittelt...'
                        : 'Aussteller-Anmeldung absenden'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Simple Lightbox for Gallery */}
      {lightboxImg && (
        <div
          className="modal-overlay active"
          onClick={() => setLightboxImg(null)}
        >
          <button
            type="button"
            className="modal-close"
            onClick={() => setLightboxImg(null)}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          <img
            src={lightboxImg}
            alt="WiWA Großansicht"
            style={{
              maxWidth: '90vw',
              maxHeight: '88vh',
              borderRadius: '12px',
              objectFit: 'contain'
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
