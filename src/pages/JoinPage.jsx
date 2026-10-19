import React, { useState } from 'react';
import { useData } from '../context/DataContext';

export default function JoinPage({ onOpenLegal }) {
  const { submitApplication, uploadFile } = useData();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    city: 'Marklohe',
    category: 'Handwerk & Bau',
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
        <title>Mitgliedsantrag - Unternehmernetzwerk Weser-Aue e.V.</title>
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
        <h1>Beitrittserklärung / Mitgliedsantrag</h1>
        <div class="sub">Unternehmernetzwerk Weser-Aue e.V.</div>
        <p>Hiermit beantrage(n) ich / wir die Aufnahme als ordentliches Mitglied im Unternehmernetzwerk Weser-Aue e.V.:</p>
        <div class="box">
          <div class="row"><span class="label">Firmenname / Betrieb:</span><div class="line"></div></div>
          <div class="row"><span class="label">Inhaber / Ansprechpartner (Vor- und Nachname):</span><div class="line"></div></div>
          <div class="row"><span class="label">Branche / Gewerk:</span><div class="line"></div></div>
          <div class="row"><span class="label">Straße & Hausnummer:</span><div class="line"></div></div>
          <div class="row"><span class="label">PLZ & Ort:</span><div class="line"></div></div>
          <div class="row"><span class="label">Telefon, E-Mail & Website:</span><div class="line"></div></div>
        </div>
        <div class="box">
          <div class="row"><span class="label">SEPA-Lastschriftmandat (IBAN & Kreditinstitut):</span><div class="line"></div></div>
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
      setErrorMsg('Bitte geben Sie Ihren Namen und Ihre E-Mail-Adresse an.');
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
        type: 'membership',
        name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        category: formData.category,
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
        city: 'Marklohe',
        category: 'Handwerk & Bau',
        message: '',
        privacy: false
      });
      setSelectedFile(null);
    } catch (err) {
      setErrorMsg(err.message || 'Fehler beim Senden des Antrags.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <h1 className="page-title">Mitglied im Netzwerk werden</h1>
          <p className="page-subtitle">
            Gestalten Sie den Wirtschaftsstandort Weser-Aue aktiv mit und profitieren Sie vom engen Austausch unter Betrieben. In drei kurzen Schritten zu Ihrer Mitgliedschaft.
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
              <h3 className="step-title">Antrag herunterladen</h3>
              <p className="step-desc">
                Öffnen und speichern Sie die Beitrittserklärung des Unternehmernetzwerks Weser-Aue e.V. als PDF.
              </p>
              <button
                type="button"
                onClick={handleDownloadForm}
                className="btn btn-outline step-action"
              >
                <i className="fa-solid fa-file-pdf" style={{ marginRight: '8px' }}></i>
                Beitrittsformular herunterladen
              </button>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Daten vervollständigen</h3>
              <p className="step-desc">
                Ergänzen Sie Ihre Betriebsdaten bequem am Computer oder klassisch per Hand und unterschreiben Sie den Bogen.
              </p>
              <div className="step-action step-action-dummy">
                <i className="fa-solid fa-pen" style={{ marginRight: '8px' }}></i>
                Digital oder ausgedruckt
              </div>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Direkt absenden</h3>
              <p className="step-desc">
                Übermitteln Sie den unterschriebenen Antrag unkompliziert über das Formular unten an unseren Vorstand.
              </p>
              <a
                href="#upload-section"
                className="btn btn-primary step-action"
              >
                <i className="fa-solid fa-arrow-down" style={{ marginRight: '8px' }}></i>
                Jetzt online einreichen
              </a>
            </div>
          </div>

          {/* Upload Form Section */}
          <div id="upload-section" className="upload-form-container">
            <div className="form-header">
              <h2>Beitrittserklärung online übermitteln</h2>
              <p>
                Senden Sie Ihren ausgefüllten Mitgliedsantrag auf direktem Weg an den Vereinsvorstand.
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
                  Herzlichen Dank für Ihren Aufnahmeantrag!
                </h3>
                <p style={{ marginBottom: '20px', color: 'var(--text-main)' }}>
                  Ihre Unterlagen wurden erfolgreich an den Vorstand des Unternehmernetzwerks Weser-Aue e.V. übertragen. Wir heißen Sie schon bald herzlich willkommen!
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedSuccess(false)}
                  className="btn btn-outline"
                >
                  Weiteres Dokument senden
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
                    <label className="form-label" htmlFor="applicant-name">
                      Vor- und Nachname *
                    </label>
                    <input
                      type="text"
                      id="applicant-name"
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
                    <label className="form-label" htmlFor="company-name">
                      Name Ihres Betriebs (Optional)
                    </label>
                    <input
                      type="text"
                      id="company-name"
                      className="form-control"
                      placeholder="Musterbetrieb GmbH"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label" htmlFor="applicant-email">
                      E-Mail-Adresse für Rückfragen *
                    </label>
                    <input
                      type="email"
                      id="applicant-email"
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
                      Unterschriebener Mitgliedsantrag (PDF, JPG oder PNG)
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
                        <p>Datei hierher ziehen oder klicken zum Auswählen</p>
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
                        Ich willige ein, dass meine Angaben und die beigefügte Datei zur Bearbeitung meines Aufnahmeantrags vom Unternehmernetzwerk Weser-Aue e.V. gespeichert und verarbeitet werden. Weitere Hinweise finden Sie in der{' '}
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
                      {submitting ? 'Wird übermittelt...' : 'Mitgliedsantrag jetzt absenden'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
