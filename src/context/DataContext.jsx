import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  INITIAL_MEMBERS,
  INITIAL_NEWS,
  INITIAL_EVENTS,
  INITIAL_BOARD,
  INITIAL_WIWA_GALLERY,
  INITIAL_SETTINGS
} from '../data/initialData';

const DataContext = createContext(null);

// Client-seitige Bild-Komprimierung zu WebP (max 1920px, Quality 85) vor dem Upload nach R2
async function convertImageFileToWebpBase64(file) {
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ base64: reader.result, filename: file.name });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1920;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const webpDataUrl = canvas.toDataURL('image/webp', 0.85);
        const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
        resolve({ base64: webpDataUrl, filename: cleanName });
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function DataProvider({ children }) {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [news, setNews] = useState(INITIAL_NEWS);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [wiwaGallery, setWiwaGallery] = useState(INITIAL_WIWA_GALLERY);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kvStatus, setKvStatus] = useState('connecting');

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/data');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          if (Array.isArray(json.data.members) && json.data.members.length > 0) {
            setMembers(json.data.members);
          }
          if (Array.isArray(json.data.news)) {
            setNews(json.data.news);
          }
          if (Array.isArray(json.data.events)) {
            setEvents(json.data.events);
          }
          if (Array.isArray(json.data.board)) {
            setBoard(json.data.board);
          }
          if (Array.isArray(json.data.wiwaGallery)) {
            setWiwaGallery(json.data.wiwaGallery);
          }
          if (json.data.settings && typeof json.data.settings === 'object') {
            setSettings({ ...INITIAL_SETTINGS, ...json.data.settings });
          }
          if (Array.isArray(json.data.submissions)) {
            setSubmissions(json.data.submissions);
          }
          setKvStatus('connected');
        }
      } else {
        setKvStatus('fallback');
      }
    } catch (err) {
      console.warn('Fehler beim Laden aus KV, nutze Initialdaten:', err);
      setKvStatus('fallback');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Speichert eine Sektion dauerhaft in Cloudflare KV (kein Browser-LocalStorage!)
  const saveKeyToKV = async (key, value, adminToken) => {
    const res = await fetch('/api/admin/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ key, value })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Speichern in Cloudflare KV fehlgeschlagen');
    }

    // State synchronisieren
    if (key === 'members') setMembers(value);
    if (key === 'news') setNews(value);
    if (key === 'events') setEvents(value);
    if (key === 'board') setBoard(value);
    if (key === 'wiwa_gallery') setWiwaGallery(value);
    if (key === 'settings') setSettings(value);
    if (key === 'submissions') setSubmissions(value);

    return data;
  };

  // Lädt ein Bild (automatisch als WebP) oder PDF dauerhaft in Cloudflare R2 hoch
  const uploadFileToR2 = async (file, folder = 'uploads', adminToken) => {
    const { base64, filename } = await convertImageFileToWebpBase64(file);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        filename,
        base64,
        folder
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Upload nach Cloudflare R2 fehlgeschlagen');
    }
    return data.url;
  };

  // Öffentliches Formular für Mitgliedsantrag / WiWA-Anmeldung (speichert in R2 + KV)
  const submitApplication = async (formPayload, attachedFile = null) => {
    let fileBase64 = '';
    let fileName = '';

    if (attachedFile) {
      const converted = await convertImageFileToWebpBase64(attachedFile);
      fileBase64 = converted.base64;
      fileName = converted.filename;
    }

    const res = await fetch('/api/submit-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formPayload,
        fileBase64,
        fileName
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Übermittlung fehlgeschlagen');
    }

    if (data.submission) {
      setSubmissions((prev) => [data.submission, ...prev]);
    }
    return data;
  };

  return (
    <DataContext.Provider
      value={{
        members,
        news,
        events,
        board,
        wiwaGallery,
        settings,
        submissions,
        loading,
        kvStatus,
        refreshData: fetchAllData,
        saveKeyToKV,
        uploadFileToR2,
        submitApplication
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within a DataProvider');
  }
  return ctx;
}
