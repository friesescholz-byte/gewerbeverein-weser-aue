import React, { useState } from 'react';
import {
  Lock,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Save,
  Upload,
  CheckCircle2,
  Database,
  Newspaper,
  Calendar,
  Building2,
  Users,
  Images,
  Settings,
  Inbox,
  FileText,
  ExternalLink,
  Search,
  X
} from 'lucide-react';
import { useData } from '../context/DataContext';

const ADMIN_HASH_HEX = '300e7d187e12bad07942782791114eff37beacc819f4bc4f30460849e7a7f6a3';

async function sha256Hex(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default function AdminPage({ onNavigate }) {
  const {
    members,
    news,
    events,
    board,
    wiwaGallery,
    settings,
    submissions,
    saveKeyToKV,
    uploadFileToR2
  } = useData();

  const [token, setToken] = useState(
    () => sessionStorage.getItem('weser_aue_admin_token') || ''
  );
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState('news');
  const [statusToast, setStatusToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Edit states
  const [editingNews, setEditingNews] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [editingBoard, setEditingBoard] = useState(null);
  const [newWiwaPhoto, setNewWiwaPhoto] = useState({
    category: 'Ausstellerzelt',
    caption: '',
    url: ''
  });
  const [settingsDraft, setSettingsDraft] = useState(settings);

  const showToast = (msg, isError = false) => {
    setStatusToast({ msg, isError });
    setTimeout(() => setStatusToast(null), 4500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.token) {
          sessionStorage.setItem('weser_aue_admin_token', data.token);
          setToken(data.token);
          setPasswordInput('');
          setSettingsDraft(settings);
          return;
        }
      }

      // Kryptografischer SHA-256 Hash-Vergleich als Fallback
      const inputHash = await sha256Hex(passwordInput.trim());
      if (inputHash === ADMIN_HASH_HEX) {
        const fallbackToken = 'weser_aue_session_' + Date.now();
        sessionStorage.setItem('weser_aue_admin_token', fallbackToken);
        setToken(fallbackToken);
        setPasswordInput('');
        setSettingsDraft(settings);
        return;
      }

      setLoginError('Ungültiges Passwort. Bitte versuchen Sie es erneut.');
    } catch (err) {
      const inputHash = await sha256Hex(passwordInput.trim());
      if (inputHash === ADMIN_HASH_HEX) {
        const fallbackToken = 'weser_aue_session_' + Date.now();
        sessionStorage.setItem('weser_aue_admin_token', fallbackToken);
        setToken(fallbackToken);
        setPasswordInput('');
        return;
      }
      setLoginError('Anmeldung fehlgeschlagen: ' + err.message);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('weser_aue_admin_token');
    setToken('');
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="rounded-2xl border border-[#E5E0D5] bg-white p-8 space-y-6 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5] flex items-center justify-center text-[#083476]">
            <Lock className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#083476]">
              Vorstands-Verwaltung
            </span>
            <h1 className="font-editorial text-3xl text-[#0B192C]">
              Admin-Dashboard Login
            </h1>
            <p className="text-xs text-[#0B192C]/65">
              Alle Änderungen im Dashboard werden direkt online gespeichert und sind
              sofort für alle Besucher sichtbar.
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#0B192C]/70 mb-1.5">
                Admin-Passwort
              </label>
              <input
                type="password"
                required
                autoFocus
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Passwort eingeben..."
                className="w-full px-4 py-3 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm focus:outline-none focus:border-[#083476]"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 px-4 rounded-lg bg-[#083476] hover:bg-[#0B192C] text-white text-sm font-semibold transition-colors"
            >
              {loggingIn ? 'Prüfe Zugangsdaten...' : 'Anmelden'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ============================================================================
  // HANDLERS FÜR KV & R2 SPEICHERUNG
  // ============================================================================

  // 1. NEWS SPEICHERN
  const handleSaveNewsItem = async (e) => {
    e.preventDefault();
    if (!editingNews.title) return;
    try {
      setSaving(true);
      const exists = news.some((n) => n.id === editingNews.id);
      const updated = exists
        ? news.map((n) => (n.id === editingNews.id ? editingNews : n))
        : [editingNews, ...news];
      await saveKeyToKV('news', updated, token);
      setEditingNews(null);
      showToast('Beitrag erfolgreich gespeichert!');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNewsItem = async (id) => {
    if (!window.confirm('Diesen Beitrag wirklich dauerhaft löschen?')) return;
    try {
      setSaving(true);
      const updated = news.filter((n) => n.id !== id);
      await saveKeyToKV('news', updated, token);
      showToast('Beitrag erfolgreich gelöscht.');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadNewsImage = async (file) => {
    if (!file || !editingNews) return;
    try {
      setUploading(true);
      const r2Url = await uploadFileToR2(file, 'news', token);
      setEditingNews({
        ...editingNews,
        images: [...(editingNews.images || []), r2Url]
      });
      showToast('Bild erfolgreich hochgeladen!');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setUploading(false);
    }
  };

  // 2. TERMINE SPEICHERN
  const handleSaveEventItem = async (e) => {
    e.preventDefault();
    if (!editingEvent.title) return;
    try {
      setSaving(true);
      const exists = events.some((ev) => ev.id === editingEvent.id);
      const updated = exists
        ? events.map((ev) => (ev.id === editingEvent.id ? editingEvent : ev))
        : [...events, editingEvent];
      await saveKeyToKV('events', updated, token);
      setEditingEvent(null);
      showToast('Termin erfolgreich gespeichert!');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEventItem = async (id) => {
    if (!window.confirm('Diesen Termin wirklich löschen?')) return;
    try {
      setSaving(true);
      const updated = events.filter((ev) => ev.id !== id);
      await saveKeyToKV('events', updated, token);
      showToast('Termin erfolgreich gelöscht.');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  // 3. MITGLIEDER SPEICHERN
  const handleSaveMemberItem = async (e) => {
    e.preventDefault();
    if (!editingMember.name) return;
    try {
      setSaving(true);
      const exists = members.some((m) => m.id === editingMember.id);
      const updated = exists
        ? members.map((m) => (m.id === editingMember.id ? editingMember : m))
        : [editingMember, ...members];
      await saveKeyToKV('members', updated, token);
      setEditingMember(null);
      showToast('Mitgliedsbetrieb erfolgreich gespeichert!');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMemberItem = async (id) => {
    if (!window.confirm('Diesen Mitgliedsbetrieb wirklich entfernen?')) return;
    try {
      setSaving(true);
      const updated = members.filter((m) => m.id !== id);
      await saveKeyToKV('members', updated, token);
      showToast('Mitgliedsbetrieb erfolgreich entfernt.');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadMemberLogo = async (file) => {
    if (!file || !editingMember) return;
    try {
      setUploading(true);
      const r2Url = await uploadFileToR2(file, 'logos', token);
      setEditingMember({ ...editingMember, logo: r2Url });
      showToast('Firmenlogo erfolgreich hochgeladen!');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setUploading(false);
    }
  };

  // 4. VORSTAND SPEICHERN
  const handleSaveBoardItem = async (e) => {
    e.preventDefault();
    if (!editingBoard.name) return;
    try {
      setSaving(true);
      const exists = board.some((b) => b.id === editingBoard.id);
      const updated = exists
        ? board.map((b) => (b.id === editingBoard.id ? editingBoard : b))
        : [...board, editingBoard];
      await saveKeyToKV('board', updated, token);
      setEditingBoard(null);
      showToast('Vorstandsdaten erfolgreich gespeichert!');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBoardItem = async (id) => {
    if (!window.confirm('Vorstandsmitglied wirklich löschen?')) return;
    try {
      setSaving(true);
      const updated = board.filter((b) => b.id !== id);
      await saveKeyToKV('board', updated, token);
      showToast('Vorstandsmitglied gelöscht.');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  // 5. WiWA GALERIE SPEICHERN
  const handleAddWiwaPhoto = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      const r2Url = await uploadFileToR2(file, 'wiwa', token);
      const newEntry = {
        id: 'wiwa_' + Date.now(),
        url: r2Url,
        category: newWiwaPhoto.category || 'Ausstellerzelt',
        title: `WiWA – ${newWiwaPhoto.category}`,
        caption: newWiwaPhoto.caption || file.name.replace(/\.[^/.]+$/, '')
      };
      const updated = [newEntry, ...wiwaGallery];
      await saveKeyToKV('wiwa_gallery', updated, token);
      setNewWiwaPhoto({ ...newWiwaPhoto, caption: '' });
      showToast('Foto erfolgreich zur WiWA-Galerie hinzugefügt!');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteWiwaPhoto = async (id) => {
    if (!window.confirm('Dieses Foto aus der WiWA-Galerie entfernen?')) return;
    try {
      setSaving(true);
      const updated = wiwaGallery.filter((img) => img.id !== id);
      await saveKeyToKV('wiwa_gallery', updated, token);
      showToast('Foto aus der Galerie entfernt.');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  // 6. EINSTELLUNGEN & PDFs SPEICHERN
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await saveKeyToKV('settings', settingsDraft, token);
      showToast('Vereinseinstellungen erfolgreich gespeichert!');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadSettingPdf = async (file, fieldName) => {
    if (!file) return;
    try {
      setUploading(true);
      const r2Url = await uploadFileToR2(file, 'dokumente', token);
      const updatedSettings = { ...settingsDraft, [fieldName]: r2Url };
      setSettingsDraft(updatedSettings);
      await saveKeyToKV('settings', updatedSettings, token);
      showToast('Dokument erfolgreich hochgeladen!');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setUploading(false);
    }
  };

  // 7. EINSENDUNGEN / ANTRÄGE VERWALTEN
  const handleConvertSubmissionToMember = async (sub) => {
    const newMem = {
      id: 'mem_' + Date.now(),
      name: sub.company || sub.contactPerson,
      category: sub.category || 'Dienstleistung & Beratung',
      tags: [sub.category || 'Dienstleistung & Beratung'],
      city: sub.city || 'Samtgemeinde Weser-Aue',
      address: `${sub.address || ''}\n${sub.city || ''}`.trim(),
      contactPerson: sub.contactPerson || '',
      phone: sub.phone || '',
      email: sub.email || '',
      website: '',
      description: sub.message || '',
      logo:
        sub.attachmentUrl && sub.attachmentUrl.endsWith('.webp') ? sub.attachmentUrl : ''
    };
    try {
      setSaving(true);
      await saveKeyToKV('members', [newMem, ...members], token);
      const updatedSubs = submissions.map((s) =>
        s.id === sub.id ? { ...s, status: 'Aufgenommen' } : s
      );
      await saveKeyToKV('submissions', updatedSubs, token);
      showToast(`${newMem.name} wurde erfolgreich als Mitglied übernommen!`);
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubmission = async (id) => {
    if (!window.confirm('Einsendung wirklich löschen?')) return;
    try {
      setSaving(true);
      const updated = submissions.filter((s) => s.id !== id);
      await saveKeyToKV('submissions', updated, token);
      showToast('Einsendung gelöscht.');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  const filteredAdminMembers = members.filter((m) => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.city && m.city.toLowerCase().includes(q)) ||
      (m.category && m.category.toLowerCase().includes(q))
    );
  });

  const tabs = [
    { id: 'news', label: 'Aktuelles', icon: Newspaper, count: news.length },
    { id: 'events', label: 'Termine', icon: Calendar, count: events.length },
    { id: 'members', label: 'Mitglieder', icon: Building2, count: members.length },
    { id: 'board', label: 'Vorstand', icon: Users, count: board.length },
    { id: 'wiwa', label: 'WiWA-Galerie', icon: Images, count: wiwaGallery.length },
    { id: 'settings', label: 'Satzung, PDFs & Infos', icon: Settings },
    { id: 'submissions', label: 'Anträge & Postfach', icon: Inbox, count: submissions.length }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Top Bar with KV/R2 Status */}
      <div className="rounded-2xl border border-[#E5E0D5] bg-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#26890D]">
            <Database className="w-4 h-4" strokeWidth={1.5} />
            <span>Zentrale Datenverwaltung aktiv</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl text-[#0B192C]">
            Vorstands- & Admin-Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="px-4 py-2 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] hover:bg-[#F3EFE6] text-xs font-semibold text-[#0B192C]"
          >
            Zur Website
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Abmelden</span>
          </button>
        </div>
      </div>

      {/* Status Toast */}
      {statusToast && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            statusToast.isError
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-[#EEF8EB] border-[#26890D]/30 text-[#1D6B0A]'
          }`}
        >
          <div className="flex items-center gap-2.5 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />
            <span>{statusToast.msg}</span>
          </div>
          <button onClick={() => setStatusToast(null)} className="text-xs underline">
            Schließen
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E5E0D5] pb-4">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors ${
                isActive
                  ? 'bg-[#083476] text-white'
                  : 'bg-white border border-[#E5E0D5] text-[#0B192C]/80 hover:bg-[#F3EFE6]'
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={1.5} />
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#F3EFE6] text-[#0B192C]/70'
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: AKTUELLES / NEWS                                              */}
      {/* ==================================================================== */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-editorial text-3xl text-[#0B192C]">
              Aktuelle Beiträge verwalten ({news.length})
            </h2>
            <button
              onClick={() =>
                setEditingNews({
                  id: 'news_' + Date.now(),
                  title: '',
                  date: new Date().toLocaleDateString('de-DE'),
                  category: 'Vereinsleben',
                  excerpt: '',
                  content: '',
                  images: []
                })
              }
              className="px-4 py-2.5 rounded-lg bg-[#083476] text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              <span>Neuen Beitrag anlegen</span>
            </button>
          </div>

          {editingNews && (
            <form
              onSubmit={handleSaveNewsItem}
              className="rounded-2xl border-2 border-[#083476] bg-white p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-3">
                <h3 className="font-semibold text-base text-[#0B192C]">Beitrag bearbeiten</h3>
                <button
                  type="button"
                  onClick={() => setEditingNews(null)}
                  className="text-xs text-[#0B192C]/60 hover:text-[#0B192C]"
                >
                  Abbrechen
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1">Überschrift *</label>
                  <input
                    type="text"
                    required
                    value={editingNews.title}
                    onChange={(e) =>
                      setEditingNews({ ...editingNews, title: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Datum (z. B. 19.10.2026)</label>
                  <input
                    type="text"
                    value={editingNews.date}
                    onChange={(e) =>
                      setEditingNews({ ...editingNews, date: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Kategorie</label>
                  <input
                    type="text"
                    value={editingNews.category}
                    onChange={(e) =>
                      setEditingNews({ ...editingNews, category: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Foto hochladen (Beitragsbild)
                  </label>
                  <label className="flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-dashed border-[#083476] bg-[#FBF9F5] cursor-pointer text-xs font-semibold text-[#083476]">
                    <span>{uploading ? 'Lädt hoch...' : '+ Bild hochladen'}</span>
                    <Upload className="w-4 h-4" strokeWidth={1.5} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadNewsImage(e.target.files?.[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {Array.isArray(editingNews.images) && editingNews.images.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {editingNews.images.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative w-24 h-16 rounded-lg overflow-hidden border border-[#E5E0D5] group"
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setEditingNews({
                            ...editingNews,
                            images: editingNews.images.filter((_, i) => i !== idx)
                          })
                        }
                        className="absolute top-1 right-1 p-1 rounded bg-red-600 text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1">Kurzfassung (Vorschau)</label>
                <textarea
                  rows={2}
                  value={editingNews.excerpt}
                  onChange={(e) =>
                    setEditingNews({ ...editingNews, excerpt: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Vollständiger Text</label>
                <textarea
                  rows={5}
                  value={editingNews.content}
                  onChange={(e) =>
                    setEditingNews({ ...editingNews, content: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-[#26890D] text-white text-xs font-semibold inline-flex items-center gap-2"
              >
                <Save className="w-4 h-4" strokeWidth={1.5} />
                <span>{saving ? 'Speichert...' : 'Beitrag speichern'}</span>
              </button>
            </form>
          )}

          <div className="space-y-3">
            {news.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-[#E5E0D5] bg-white flex items-center justify-between gap-4"
              >
                <div>
                  <div className="text-xs text-[#083476] font-semibold">
                    {item.date} · {item.category}
                  </div>
                  <div className="font-semibold text-base text-[#0B192C]">{item.title}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditingNews(item)}
                    className="p-2 rounded-lg border border-[#E5E0D5] hover:bg-[#F3EFE6] text-[#083476]"
                  >
                    <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => handleDeleteNewsItem(item.id)}
                    className="p-2 rounded-lg border border-[#E5E0D5] hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: TERMINE / EVENTS                                              */}
      {/* ==================================================================== */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-editorial text-3xl text-[#0B192C]">
              Termine verwalten ({events.length})
            </h2>
            <button
              onClick={() =>
                setEditingEvent({
                  id: 'event_' + Date.now(),
                  title: '',
                  date: '2026-11-20',
                  time: '19:00',
                  location: '',
                  category: 'Vereinstermin',
                  description: ''
                })
              }
              className="px-4 py-2.5 rounded-lg bg-[#083476] text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              <span>Neuen Termin hinzufügen</span>
            </button>
          </div>

          {editingEvent && (
            <form
              onSubmit={handleSaveEventItem}
              className="rounded-2xl border-2 border-[#083476] bg-white p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-3">
                <h3 className="font-semibold text-base">Termin bearbeiten</h3>
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="text-xs text-[#0B192C]/60"
                >
                  Abbrechen
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1">Veranstaltungstitel *</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.title}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, title: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Kategorie</label>
                  <input
                    type="text"
                    value={editingEvent.category}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, category: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Datum</label>
                  <input
                    type="date"
                    value={editingEvent.date}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, date: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Uhrzeit</label>
                  <input
                    type="text"
                    value={editingEvent.time}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, time: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Veranstaltungsort</label>
                  <input
                    type="text"
                    value={editingEvent.location}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, location: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Beschreibung</label>
                <textarea
                  rows={3}
                  value={editingEvent.description}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-[#26890D] text-white text-xs font-semibold inline-flex items-center gap-2"
              >
                <Save className="w-4 h-4" strokeWidth={1.5} />
                <span>{saving ? 'Speichert...' : 'Termin speichern'}</span>
              </button>
            </form>
          )}

          <div className="space-y-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-xl border border-[#E5E0D5] bg-white flex items-center justify-between gap-4"
              >
                <div>
                  <div className="text-xs text-[#26890D] font-semibold">
                    {ev.date} · {ev.time} Uhr · {ev.location}
                  </div>
                  <div className="font-semibold text-base text-[#0B192C]">{ev.title}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingEvent(ev)}
                    className="p-2 rounded-lg border border-[#E5E0D5] hover:bg-[#F3EFE6] text-[#083476]"
                  >
                    <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => handleDeleteEventItem(ev.id)}
                    className="p-2 rounded-lg border border-[#E5E0D5] hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: MITGLIEDER (83 BETRIEBE)                                      */}
      {/* ==================================================================== */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-editorial text-3xl text-[#0B192C]">
              Mitgliedsbetriebe verwalten ({members.length})
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#083476] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Mitglied suchen..."
                  className="pl-9 pr-3 py-2 rounded-lg border border-[#E5E0D5] bg-white text-xs"
                />
              </div>
              <button
                onClick={() =>
                  setEditingMember({
                    id: 'mem_' + Date.now(),
                    name: '',
                    category: 'Handwerk & Bau',
                    tags: ['Handwerk & Bau'],
                    city: 'Marklohe',
                    address: '',
                    contactPerson: '',
                    phone: '',
                    email: '',
                    website: '',
                    description: '',
                    logo: ''
                  })
                }
                className="px-4 py-2.5 rounded-lg bg-[#083476] text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" strokeWidth={1.5} />
                <span>Neues Mitglied</span>
              </button>
            </div>
          </div>

          {editingMember && (
            <form
              onSubmit={handleSaveMemberItem}
              className="rounded-2xl border-2 border-[#083476] bg-white p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-3">
                <h3 className="font-semibold text-base">
                  Mitgliedsbetrieb bearbeiten: {editingMember.name || 'Neu'}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="text-xs text-[#0B192C]/60"
                >
                  Abbrechen
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Firmenname *</label>
                  <input
                    type="text"
                    required
                    value={editingMember.name}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Branche / Kategorie</label>
                  <input
                    type="text"
                    value={editingMember.category}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Ort</label>
                  <input
                    type="text"
                    value={editingMember.city}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, city: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Ansprechpartner</label>
                  <input
                    type="text"
                    value={editingMember.contactPerson}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, contactPerson: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Telefon</label>
                  <input
                    type="text"
                    value={editingMember.phone}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">E-Mail</label>
                  <input
                    type="text"
                    value={editingMember.email}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, email: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Website</label>
                  <input
                    type="text"
                    value={editingMember.website}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, website: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Anschrift</label>
                  <input
                    type="text"
                    value={editingMember.address}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, address: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Firmenlogo (Upload)
                  </label>
                  <label className="flex items-center justify-between px-3 py-2 rounded-lg border border-dashed border-[#083476] bg-[#FBF9F5] cursor-pointer text-xs font-semibold text-[#083476]">
                    <span>{uploading ? 'Lädt hoch...' : 'Logo auswählen & hochladen'}</span>
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadMemberLogo(e.target.files?.[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Leistungen / Beschreibung</label>
                <textarea
                  rows={3}
                  value={editingMember.description}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-[#26890D] text-white text-xs font-semibold inline-flex items-center gap-2"
              >
                <Save className="w-4 h-4" strokeWidth={1.5} />
                <span>{saving ? 'Speichert...' : 'Mitgliedsbetrieb speichern'}</span>
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredAdminMembers.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-xl border border-[#E5E0D5] bg-white flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {m.logo && (
                    <img
                      src={m.logo}
                      alt=""
                      className="w-10 h-10 object-contain rounded border border-[#E5E0D5] bg-[#FBF9F5] p-1 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-[#0B192C] truncate">{m.name}</div>
                    <div className="text-xs text-[#0B192C]/60 truncate">
                      {m.category} · {m.city}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setEditingMember(m)}
                    className="p-2 rounded-lg border border-[#E5E0D5] hover:bg-[#F3EFE6] text-[#083476]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteMemberItem(m.id)}
                    className="p-2 rounded-lg border border-[#E5E0D5] hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: VORSTAND & BEISITZER                                          */}
      {/* ==================================================================== */}
      {activeTab === 'board' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-editorial text-3xl text-[#0B192C]">
              Vorstand & Beisitzer ({board.length})
            </h2>
            <button
              onClick={() =>
                setEditingBoard({
                  id: 'board_' + Date.now(),
                  role: 'Beisitzer/in',
                  name: '',
                  company: '',
                  address: '',
                  phone: '',
                  email: '',
                  isExecutive: false,
                  placeholderNote: ''
                })
              }
              className="px-4 py-2.5 rounded-lg bg-[#083476] text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              <span>Vorstandsmitglied hinzufügen</span>
            </button>
          </div>

          {editingBoard && (
            <form
              onSubmit={handleSaveBoardItem}
              className="rounded-2xl border-2 border-[#083476] bg-white p-6 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Amt / Rolle *</label>
                  <input
                    type="text"
                    required
                    value={editingBoard.role}
                    onChange={(e) =>
                      setEditingBoard({ ...editingBoard, role: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={editingBoard.name}
                    onChange={(e) =>
                      setEditingBoard({ ...editingBoard, name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Unternehmen / Beruf</label>
                  <input
                    type="text"
                    value={editingBoard.company}
                    onChange={(e) =>
                      setEditingBoard({ ...editingBoard, company: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Anschrift</label>
                  <input
                    type="text"
                    value={editingBoard.address}
                    onChange={(e) =>
                      setEditingBoard({ ...editingBoard, address: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Telefon</label>
                  <input
                    type="text"
                    value={editingBoard.phone}
                    onChange={(e) =>
                      setEditingBoard({ ...editingBoard, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">E-Mail</label>
                  <input
                    type="text"
                    value={editingBoard.email}
                    onChange={(e) =>
                      setEditingBoard({ ...editingBoard, email: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isExec"
                  checked={!!editingBoard.isExecutive}
                  onChange={(e) =>
                    setEditingBoard({ ...editingBoard, isExecutive: e.target.checked })
                  }
                />
                <label htmlFor="isExec" className="text-xs font-semibold">
                  Gehört zum geschäftsführenden Vorstand
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-lg bg-[#26890D] text-white text-xs font-semibold inline-flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Speichert...' : 'Vorstandsmitglied speichern'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBoard(null)}
                  className="px-4 py-2.5 rounded-lg border border-[#E5E0D5] text-xs"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {board.map((person) => (
              <div
                key={person.id}
                className="p-4 rounded-xl border border-[#E5E0D5] bg-white flex items-center justify-between gap-4"
              >
                <div>
                  <span className="text-xs font-semibold text-[#083476]">{person.role}</span>
                  <div className="font-semibold text-base text-[#0B192C]">{person.name}</div>
                  <div className="text-xs text-[#0B192C]/65">{person.company}</div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setEditingBoard(person)}
                    className="p-2 rounded-lg border border-[#E5E0D5] hover:bg-[#F3EFE6] text-[#083476]"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBoardItem(person.id)}
                    className="p-2 rounded-lg border border-[#E5E0D5] hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: WiWA-GALERIE (R2 + KV)                                        */}
      {/* ==================================================================== */}
      {activeTab === 'wiwa' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E5E0D5] bg-white p-6 space-y-4">
            <h2 className="font-editorial text-3xl text-[#0B192C]">
              Neues Foto zur WiWA-Galerie hochladen
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold mb-1">Album / Kategorie</label>
                <select
                  value={newWiwaPhoto.category}
                  onChange={(e) =>
                    setNewWiwaPhoto({ ...newWiwaPhoto, category: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                >
                  <option value="Eröffnung & Bürgerfrühstück">Eröffnung & Bürgerfrühstück</option>
                  <option value="Ausstellerzelt">Ausstellerzelt</option>
                  <option value="Außengelände">Außengelände</option>
                  <option value="Rahmenprogramm">Rahmenprogramm</option>
                  <option value="Aufbau & Organisation">Aufbau & Organisation</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Bildunterschrift</label>
                <input
                  type="text"
                  value={newWiwaPhoto.caption}
                  onChange={(e) =>
                    setNewWiwaPhoto({ ...newWiwaPhoto, caption: e.target.value })
                  }
                  placeholder="z. B. Messestand im Zelt..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                />
              </div>
              <div>
                <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#083476] hover:bg-[#0B192C] text-white text-xs font-semibold cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? 'Wird hochgeladen...' : 'Foto auswählen & hochladen'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleAddWiwaPhoto(e.target.files?.[0])}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {wiwaGallery.map((img) => (
              <div
                key={img.id}
                className="rounded-xl border border-[#E5E0D5] bg-white overflow-hidden flex flex-col justify-between"
              >
                <div className="aspect-4/3 bg-[#F3EFE6]">
                  <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold text-[#083476] truncate">
                      {img.category}
                    </div>
                    <div className="text-xs font-medium text-[#0B192C] truncate">
                      {img.caption}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteWiwaPhoto(img.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-red-600 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 6: SATZUNG, PDF-DOKUMENTE & VEREINSDATEN (PLATZHALTER)           */}
      {/* ==================================================================== */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-8">
          <div className="rounded-2xl border border-[#E5E0D5] bg-white p-6 sm:p-8 space-y-6">
            <h2 className="font-editorial text-3xl text-[#0B192C]">
              Offizielle PDF-Dokumente hinterlegen
            </h2>
            <p className="text-sm text-[#0B192C]/70">
              Laden Sie hier die neue Vereinssatzung, das neue Beitrittsformular oder die
              WiWA-Anmeldeunterlagen als PDF hoch. Die Dokumente werden sofort gespeichert und
              auf der Website verknüpft.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Satzung PDF */}
              <div className="p-5 rounded-xl border border-[#E5E0D5] bg-[#FBF9F5] space-y-3">
                <div className="font-semibold text-sm text-[#0B192C] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#083476]" />
                  <span>1. Vereinssatzung (PDF)</span>
                </div>
                {settingsDraft.satzungPdfUrl ? (
                  <a
                    href={settingsDraft.satzungPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#26890D] font-semibold inline-flex items-center gap-1 underline"
                  >
                    <span>Aktuelles PDF öffnen</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <p className="text-xs text-[#0B192C]/55">Aktuell: Platzhalter aktiv</p>
                )}
                <label className="w-full py-2 px-3 rounded-lg bg-white border border-[#E5E0D5] hover:border-[#083476] text-xs font-semibold text-[#083476] flex items-center justify-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Satzung (PDF) hochladen</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) =>
                      handleUploadSettingPdf(e.target.files?.[0], 'satzungPdfUrl')
                    }
                    className="hidden"
                  />
                </label>
              </div>

              {/* Mitgliedsantrag PDF */}
              <div className="p-5 rounded-xl border border-[#E5E0D5] bg-[#FBF9F5] space-y-3">
                <div className="font-semibold text-sm text-[#0B192C] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#26890D]" />
                  <span>2. Mitgliedsantrag (PDF)</span>
                </div>
                {settingsDraft.mitgliedsantragPdfUrl ? (
                  <a
                    href={settingsDraft.mitgliedsantragPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#26890D] font-semibold inline-flex items-center gap-1 underline"
                  >
                    <span>Aktuelles PDF öffnen</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <p className="text-xs text-[#0B192C]/55">Aktuell: Platzhalter aktiv</p>
                )}
                <label className="w-full py-2 px-3 rounded-lg bg-white border border-[#E5E0D5] hover:border-[#083476] text-xs font-semibold text-[#083476] flex items-center justify-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Mitgliedsantrag (PDF) hochladen</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) =>
                      handleUploadSettingPdf(e.target.files?.[0], 'mitgliedsantragPdfUrl')
                    }
                    className="hidden"
                  />
                </label>
              </div>

              {/* WiWA Anmeldung PDF */}
              <div className="p-5 rounded-xl border border-[#E5E0D5] bg-[#FBF9F5] space-y-3">
                <div className="font-semibold text-sm text-[#0B192C] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0490F3]" />
                  <span>3. WiWA-Anmeldung (PDF)</span>
                </div>
                {settingsDraft.wiwaAnmeldungPdfUrl ? (
                  <a
                    href={settingsDraft.wiwaAnmeldungPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#26890D] font-semibold inline-flex items-center gap-1 underline"
                  >
                    <span>Aktuelles PDF öffnen</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <p className="text-xs text-[#0B192C]/55">Aktuell: Platzhalter aktiv</p>
                )}
                <label className="w-full py-2 px-3 rounded-lg bg-white border border-[#E5E0D5] hover:border-[#083476] text-xs font-semibold text-[#083476] flex items-center justify-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>WiWA-Anmeldung (PDF) hochladen</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) =>
                      handleUploadSettingPdf(e.target.files?.[0], 'wiwaAnmeldungPdfUrl')
                    }
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Stammdaten & Platzhalter */}
          <div className="rounded-2xl border border-[#E5E0D5] bg-white p-6 sm:p-8 space-y-5">
            <h2 className="font-editorial text-3xl text-[#0B192C]">
              Vereins-Stammdaten & Platzhalter bearbeiten
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Vereinsname</label>
                <input
                  type="text"
                  value={settingsDraft.associationName || ''}
                  onChange={(e) =>
                    setSettingsDraft({ ...settingsDraft, associationName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Vereinsregister-Nummer (Impressum)
                </label>
                <input
                  type="text"
                  value={settingsDraft.registerNumber || ''}
                  onChange={(e) =>
                    setSettingsDraft({ ...settingsDraft, registerNumber: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Straße & Hausnummer (Geschäftsstelle)
                </label>
                <input
                  type="text"
                  value={settingsDraft.addressStreet || ''}
                  onChange={(e) =>
                    setSettingsDraft({ ...settingsDraft, addressStreet: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">PLZ & Ort</label>
                <input
                  type="text"
                  value={settingsDraft.addressZipCity || ''}
                  onChange={(e) =>
                    setSettingsDraft({ ...settingsDraft, addressZipCity: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Telefon</label>
                <input
                  type="text"
                  value={settingsDraft.phone || ''}
                  onChange={(e) =>
                    setSettingsDraft({ ...settingsDraft, phone: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Offizielle E-Mail</label>
                <input
                  type="text"
                  value={settingsDraft.email || ''}
                  onChange={(e) =>
                    setSettingsDraft({ ...settingsDraft, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Nächster WiWA-Termin / Statusanzeige
              </label>
              <input
                type="text"
                value={settingsDraft.wiwaNextDate || ''}
                onChange={(e) =>
                  setSettingsDraft({ ...settingsDraft, wiwaNextDate: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-lg bg-[#26890D] hover:bg-[#1D6B0A] text-white text-xs font-semibold inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Speichert...' : 'Alle Einstellungen speichern'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ==================================================================== */}
      {/* TAB 7: EINGEGANGENE ANTRÄGE & WIWA-ANMELDUNGEN (`submissions`)       */}
      {/* ==================================================================== */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <h2 className="font-editorial text-3xl text-[#0B192C]">
            Eingegangene Mitgliedsanträge & WiWA-Anmeldungen ({submissions.length})
          </h2>

          {submissions.length === 0 ? (
            <div className="p-10 rounded-2xl border border-[#E5E0D5] bg-white text-center text-sm text-[#0B192C]/60">
              Noch keine Online-Einsendungen vorhanden. Sobald jemand das Beitritts- oder
              WiWA-Formular absendet, erscheint der Eintrag inklusive beigefügter Dokumente
              hier.
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-6 rounded-2xl border border-[#E5E0D5] bg-white space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E0D5] pb-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded ${
                          sub.type === 'wiwa_anmeldung'
                            ? 'bg-[#EEF8EB] text-[#26890D]'
                            : 'bg-[#F3EFE6] text-[#083476]'
                        }`}
                      >
                        {sub.type === 'wiwa_anmeldung'
                          ? 'WiWA Aussteller-Anmeldung'
                          : 'Mitgliedsantrag'}
                      </span>
                      <span className="text-xs text-[#0B192C]/55">
                        {new Date(sub.createdAt).toLocaleString('de-DE')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {sub.type === 'mitgliedsantrag' && sub.status !== 'Aufgenommen' && (
                        <button
                          onClick={() => handleConvertSubmissionToMember(sub)}
                          className="px-3 py-1.5 rounded-lg bg-[#26890D] text-white text-xs font-semibold"
                        >
                          + Direkt als Mitglied übernehmen
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteSubmission(sub.id)}
                        className="p-1.5 rounded-lg border border-[#E5E0D5] text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                    <div>
                      <strong className="block text-[#0B192C]">Unternehmen:</strong>
                      <span>{sub.company || '–'}</span>
                    </div>
                    <div>
                      <strong className="block text-[#0B192C]">Ansprechpartner:</strong>
                      <span>{sub.contactPerson || '–'}</span>
                    </div>
                    <div>
                      <strong className="block text-[#0B192C]">Kontakt:</strong>
                      <span>
                        {sub.email} · {sub.phone}
                      </span>
                    </div>
                  </div>

                  {sub.message && (
                    <p className="text-xs sm:text-sm text-[#0B192C]/80 bg-[#FBF9F5] p-3.5 rounded-xl border border-[#E5E0D5]">
                      {sub.message}
                    </p>
                  )}

                  {sub.attachmentUrl && (
                    <div>
                      <a
                        href={sub.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-[#083476] underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Beigefügtes Dokument öffnen</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
