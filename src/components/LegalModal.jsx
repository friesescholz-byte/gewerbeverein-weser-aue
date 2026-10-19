import React from 'react';
import { X, FileText, Download, Info } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function LegalModal({ activeType, onClose }) {
  const { settings, board } = useData();

  if (!activeType) return null;

  const executiveBoard = board.filter((b) => b.isExecutive);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0B192C]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white border border-neutral-200 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200 flex items-center justify-between bg-[#f8f9fa]">
          <div>
            <span className="text-xs uppercase tracking-[0.14em] text-[#083476] font-semibold">
              Rechtliche Informationen
            </span>
            <h2 className="text-2xl font-bold text-[#1a1a1a]" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {activeType === 'impressum' && 'Impressum'}
              {activeType === 'datenschutz' && 'Datenschutzerklärung'}
              {activeType === 'satzung' && 'Vereinssatzung'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 text-[#1a1a1a]"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm leading-relaxed text-[#4a4a4a]">
          {activeType === 'impressum' && (
            <>
              <div className="p-4 rounded-xl bg-[#f8f9fa] border border-neutral-200 flex items-start gap-3">
                <Info className="w-5 h-5 text-[#083476] shrink-0 mt-0.5" strokeWidth={1.5} />
                <div className="text-xs text-[#4a4a4a]">
                  <strong>Hinweis:</strong> Die aktuelle Registergericht-Nummer sowie die Geschäftsstellen-Anschrift des{' '}
                  <em>{settings.associationName}</em> können jederzeit im Admin-Dashboard unter „Einstellungen & Dokumente“ gepflegt werden.
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-base text-[#1a1a1a] mb-1">
                  Angaben gemäß § 5 DDG
                </h3>
                <p className="font-medium text-[#1a1a1a]">{settings.associationName}</p>
                <p>{settings.addressStreet}</p>
                <p>{settings.addressZipCity}</p>
              </div>

              <div>
                <h3 className="font-semibold text-base text-[#1a1a1a] mb-2">
                  Vertreten durch den geschäftsführenden Vorstand:
                </h3>
                <ul className="space-y-1.5">
                  {executiveBoard.map((member) => (
                    <li key={member.id}>
                      <strong>{member.role}:</strong> {member.name} ({member.company})
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-base text-[#1a1a1a] mb-1">Kontakt</h3>
                <p>Telefon: {settings.phone}</p>
                <p>E-Mail: {settings.email}</p>
              </div>

              <div>
                <h3 className="font-semibold text-base text-[#1a1a1a] mb-1">Registereintrag</h3>
                <p>Eintragung im Vereinsregister.</p>
                <p>Registergericht: {settings.registerCourt}</p>
                <p>Registernummer: {settings.registerNumber}</p>
              </div>
            </>
          )}

          {activeType === 'datenschutz' && (
            <>
              <h3 className="font-semibold text-base text-[#1a1a1a]">
                1. Datenschutz auf einen Blick
              </h3>
              <p>
                Der Schutz Ihrer persönlichen Daten ist dem {settings.associationName} ein
                wichtiges Anliegen. Wir behandeln Ihre personenbezogenen Daten vertraulich und
                entsprechend der gesetzlichen Datenschutzvorschriften (DSGVO) sowie dieser
                Datenschutzerklärung.
              </p>

              <h3 className="font-semibold text-base text-[#1a1a1a]">
                2. Verantwortliche Stelle
              </h3>
              <p>
                Verantwortlich für die Datenverarbeitung auf dieser Website ist:
                <br />
                <strong>{settings.associationName}</strong>
                <br />
                {settings.addressStreet}, {settings.addressZipCity}
                <br />
                E-Mail: {settings.email}
              </p>

              <h3 className="font-semibold text-base text-[#1a1a1a]">
                3. Datenerfassung auf unserer Website (Mitgliedsanträge & WiWA-Anmeldungen)
              </h3>
              <p>
                Wenn Sie uns per Online-Formular (Mitgliedsantrag, WiWA-Ausstelleranmeldung oder
                Kontaktanfrage) Anfragen zukommen lassen, werden Ihre Angaben aus dem Formular
                inklusive der von Ihnen dort angegebenen Kontaktdaten und hochgeladenen Dokumente
                zwecks Bearbeitung der Anfrage durch den Vereinsvorstand verschlüsselt übertragen
                und gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung an Dritte
                weiter.
              </p>
            </>
          )}

          {activeType === 'satzung' && (
            <>
              <div className="p-5 rounded-xl bg-[#f8f9fa] border border-neutral-200 space-y-3">
                <div className="flex items-center gap-2.5 text-[#083476] font-semibold">
                  <FileText className="w-5 h-5" strokeWidth={1.5} />
                  <span>Satzung des {settings.associationName}</span>
                </div>
                <p className="text-sm text-[#4a4a4a]">{settings.satzungStatusNote}</p>

                {settings.satzungPdfUrl ? (
                  <div className="pt-2">
                    <a
                      href={settings.satzungPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#083476] text-white text-sm font-semibold hover:bg-[#052352] transition-colors"
                    >
                      <Download className="w-4 h-4" strokeWidth={1.5} />
                      <span>Aktuelle Vereinssatzung als PDF herunterladen</span>
                    </a>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-neutral-100 text-[#4a4a4a] text-xs font-medium">
                    <span>
                      [Platzhalter: Sobald die neue Satzung im Admin-Dashboard als PDF hochgeladen
                      wird, erscheint hier der direkte Download-Link.]
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="font-semibold text-base text-[#1a1a1a]">
                  Grundzüge & Vereinszweck
                </h3>
                <p>
                  <strong>§ 1 Name und Sitz:</strong> Der Verein führt den Namen{' '}
                  <em>„{settings.associationName}“</em> und hat seinen Sitz in der Samtgemeinde
                  Weser-Aue.
                </p>
                <p>
                  <strong>§ 2 Zweck und Aufgaben:</strong> Der Verein verfolgt den Zweck, die
                  wirtschaftlichen, kulturellen und gemeinschaftlichen Interessen von Handel,
                  Handwerk, Industrie, Gastronomie sowie Dienstleistungs- und Freiberuflerbetrieben
                  in der Samtgemeinde Weser-Aue (Marklohe, Liebenau, Balge, Binnen, Pennigsehl und
                  Umland) zu fördern und gegenüber Öffentlichkeit, Politik und Verwaltung zu
                  vertreten.
                </p>
                <p>
                  <strong>§ 3 Mitgliedschaft:</strong> Mitglied kann jeder Gewerbetreibende,
                  Freiberufler, landwirtschaftliche Betrieb sowie jede juristische Person und
                  Institution werden, die sich den Zielen des Unternehmernetzwerks Weser-Aue e.V.
                  verbunden fühlt.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
