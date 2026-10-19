// Erstellt und lädt eine .ics Kalenderdatei für einen Vereinstermin herunter
export function downloadEventIcs(event) {
  if (!event || !event.date) return;

  const cleanDate = event.date.replace(/-/g, '');
  const timeParts = (event.time || '19:00').split(':');
  const hh = (timeParts[0] || '19').padStart(2, '0');
  const mm = (timeParts[1] || '00').padStart(2, '0');
  const startDt = `${cleanDate}T${hh}${mm}00`;
  const endHh = String(Math.min(23, parseInt(hh, 10) + 2)).padStart(2, '0');
  const endDt = `${cleanDate}T${endHh}${mm}00`;

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Unternehmernetzwerk Weser-Aue e.V.//DE',
    'BEGIN:VEVENT',
    `UID:${event.id || Date.now()}@unternehmernetzwerk-weser-aue.de`,
    `DTSTAMP:${cleanDate}T120000Z`,
    `DTSTART:${startDt}`,
    `DTEND:${endDt}`,
    `SUMMARY:${(event.title || 'Termin').replace(/,/g, '\\,')}`,
    `LOCATION:${(event.location || 'Samtgemeinde Weser-Aue').replace(/,/g, '\\,')}`,
    `DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n').replace(/,/g, '\\,')}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsLines], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute(
    'download',
    `${(event.title || 'termin').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatGermanDate(dateStr) {
  if (!dateStr) return '';
  if (dateStr.includes('.')) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  return `${d}.${m}.${y}`;
}

export function getMonthShortName(dateStr) {
  const months = [
    'JAN',
    'FEB',
    'MÄR',
    'APR',
    'MAI',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OKT',
    'NOV',
    'DEZ'
  ];
  if (!dateStr) return { day: '--', month: '---', year: '' };
  if (dateStr.includes('-')) {
    const [y, m, d] = dateStr.split('-');
    const idx = Math.max(0, Math.min(11, parseInt(m, 10) - 1));
    return { day: d, month: months[idx], year: y };
  }
  if (dateStr.includes('.')) {
    const [d, m, y] = dateStr.split('.');
    const idx = Math.max(0, Math.min(11, parseInt(m, 10) - 1));
    return { day: d, month: months[idx], year: y };
  }
  return { day: '--', month: '---', year: '' };
}
