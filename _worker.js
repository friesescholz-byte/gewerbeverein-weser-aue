import {
  INITIAL_MEMBERS,
  INITIAL_NEWS,
  INITIAL_EVENTS,
  INITIAL_BOARD,
  INITIAL_WIWA_GALLERY,
  INITIAL_SETTINGS
} from './src/data/initialData.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400'
};

const ALLOWED_KV_KEYS = [
  'members',
  'news',
  'events',
  'board',
  'wiwa_gallery',
  'settings',
  'submissions'
];

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

async function kvGetKey(env, key, fallbackVal) {
  // 1. Direct Cloudflare KV Binding
  if (env.WESER_AUE_KV && typeof env.WESER_AUE_KV.get === 'function') {
    try {
      const val = await env.WESER_AUE_KV.get(key, 'json');
      if (val !== null && val !== undefined) {
        return val;
      }
    } catch (e) {
      console.warn(`KV Binding GET error (${key}):`, e);
    }
  }

  // 2. REST API Fallback
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = env.CLOUDFLARE_API_TOKEN;
  const kvNsId = env.KV_NAMESPACE_ID || '32548c4b7d414ff682b6446ac13595ef';

  if (accountId && apiToken && kvNsId) {
    try {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNsId}/values/${key}`,
        { headers: { Authorization: `Bearer ${apiToken}` } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data !== null && data !== undefined) {
          return data;
        }
      }
    } catch (e) {
      console.warn(`KV REST GET error (${key}):`, e);
    }
  }

  return fallbackVal;
}

async function kvPutKey(env, key, value) {
  // 1. Direct Cloudflare KV Binding
  if (env.WESER_AUE_KV && typeof env.WESER_AUE_KV.put === 'function') {
    await env.WESER_AUE_KV.put(key, JSON.stringify(value));
    return true;
  }

  // 2. REST API Fallback
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = env.CLOUDFLARE_API_TOKEN;
  const kvNsId = env.KV_NAMESPACE_ID || '32548c4b7d414ff682b6446ac13595ef';

  if (accountId && apiToken && kvNsId) {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNsId}/values/${key}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(value)
      }
    );
    if (!res.ok) {
      throw new Error(`KV REST PUT Fehler (${key}): ` + (await res.text()));
    }
    return true;
  }

  throw new Error('Keine KV-Anbindung konfiguriert');
}

async function uploadToR2Worker(env, { filename, base64, folder = 'uploads' }) {
  const r2Folder = env.R2_PROJECT_FOLDER || 'gewerbeverein-weser-aue';
  const isPdf =
    (filename && filename.toLowerCase().endsWith('.pdf')) ||
    base64.startsWith('data:application/pdf');

  const cleanName = (filename || 'datei_' + Date.now())
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 60);

  const safeFolder = (folder || 'uploads').replace(/[^a-zA-Z0-9_-]/g, '');
  const ext = isPdf ? 'pdf' : 'webp';
  const contentType = isPdf ? 'application/pdf' : 'image/webp';
  const r2Key = `${r2Folder}/${safeFolder}/${cleanName}_${Date.now()}.${ext}`;

  const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '');
  const binaryString = atob(cleanBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // 1. Direct R2 Bucket Binding
  if (env.R2_BUCKET && typeof env.R2_BUCKET.put === 'function') {
    await env.R2_BUCKET.put(r2Key, bytes.buffer, {
      httpMetadata: { contentType }
    });
    return `https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/${r2Key}`;
  }

  // 2. REST API Fallback
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = env.CLOUDFLARE_API_TOKEN;
  const bucketName = env.R2_BUCKET_NAME || 'website-datein';

  if (accountId && apiToken) {
    const r2Url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${r2Key}`;
    const res = await fetch(r2Url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': contentType
      },
      body: bytes.buffer
    });
    if (!res.ok) {
      throw new Error('R2 REST Upload Fehler: ' + (await res.text()));
    }
    return `https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/${r2Key}`;
  }

  throw new Error('Kein R2 Speicher verfügbar');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname.startsWith('/api/')) {
      try {
        // 1. GET /api/data
        if (url.pathname === '/api/data' && request.method === 'GET') {
          const [members, news, events, board, wiwaGallery, settings, submissions] =
            await Promise.all([
              kvGetKey(env, 'members', INITIAL_MEMBERS),
              kvGetKey(env, 'news', INITIAL_NEWS),
              kvGetKey(env, 'events', INITIAL_EVENTS),
              kvGetKey(env, 'board', INITIAL_BOARD),
              kvGetKey(env, 'wiwa_gallery', INITIAL_WIWA_GALLERY),
              kvGetKey(env, 'settings', INITIAL_SETTINGS),
              kvGetKey(env, 'submissions', [])
            ]);

          return jsonResponse({
            success: true,
            source: 'kv',
            data: {
              members,
              news,
              events,
              board,
              wiwaGallery,
              settings,
              submissions
            }
          });
        }

        // 2. POST /api/admin/login
        if (url.pathname === '/api/admin/login' && request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const adminPw = env.ADMIN_PASSWORD || env.Passwort;

          if (body.password && adminPw && body.password === adminPw) {
            const token =
              'weser_aue_session_' +
              Date.now() +
              '_' +
              Math.random().toString(36).substring(2);
            return jsonResponse({
              success: true,
              token,
              message: 'Erfolgreich angemeldet'
            });
          }
          return jsonResponse({ success: false, error: 'Ungültiges Passwort' }, 401);
        }

        // 3. POST /api/admin/save
        if (url.pathname === '/api/admin/save' && request.method === 'POST') {
          const authHeader = request.headers.get('authorization') || '';
          if (!authHeader.includes('weser_aue_session_')) {
            return jsonResponse({ success: false, error: 'Nicht autorisiert' }, 401);
          }

          const body = await request.json().catch(() => ({}));
          const { key, value } = body;
          if (!ALLOWED_KV_KEYS.includes(key)) {
            return jsonResponse(
              { success: false, error: `Ungültiger KV-Schlüssel: ${key}` },
              400
            );
          }

          await kvPutKey(env, key, value);
          return jsonResponse({
            success: true,
            key,
            message: `Daten (${key}) erfolgreich in Cloudflare KV gespeichert.`
          });
        }

        // 4. POST /api/admin/upload
        if (url.pathname === '/api/admin/upload' && request.method === 'POST') {
          const authHeader = request.headers.get('authorization') || '';
          if (!authHeader.includes('weser_aue_session_')) {
            return jsonResponse({ success: false, error: 'Nicht autorisiert' }, 401);
          }

          const body = await request.json().catch(() => ({}));
          const { filename, base64, folder } = body;
          if (!base64) {
            return jsonResponse(
              { success: false, error: 'Keine Dateidaten empfangen' },
              400
            );
          }

          const publicUrl = await uploadToR2Worker(env, {
            filename,
            base64,
            folder: folder || 'uploads'
          });
          return jsonResponse({ success: true, url: publicUrl });
        }

        // 5. POST /api/submit-application
        if (url.pathname === '/api/submit-application' && request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const {
            type = 'mitgliedsantrag',
            company = '',
            contactPerson = '',
            email = '',
            phone = '',
            address = '',
            city = '',
            category = '',
            standSize = '',
            message = '',
            fileBase64 = '',
            fileName = ''
          } = body;

          if (!contactPerson && !company) {
            return jsonResponse(
              {
                success: false,
                error: 'Bitte geben Sie Ihren Namen oder Ihr Unternehmen an.'
              },
              400
            );
          }

          let attachmentUrl = '';
          if (fileBase64) {
            attachmentUrl = await uploadToR2Worker(env, {
              filename: fileName || 'antrag.pdf',
              base64: fileBase64,
              folder: 'antraege'
            });
          }

          const newSubmission = {
            id: 'sub_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            createdAt: new Date().toISOString(),
            type,
            company,
            contactPerson,
            email,
            phone,
            address,
            city,
            category,
            standSize,
            message,
            attachmentUrl,
            status: 'Neu'
          };

          const existing = await kvGetKey(env, 'submissions', []);
          const updated = [
            newSubmission,
            ...(Array.isArray(existing) ? existing : [])
          ];
          await kvPutKey(env, 'submissions', updated);

          return jsonResponse({
            success: true,
            submission: newSubmission,
            message: 'Ihre Einsendung wurde erfolgreich gespeichert.'
          });
        }

        return jsonResponse(
          { success: false, error: 'API-Endpunkt nicht gefunden' },
          404
        );
      } catch (err) {
        return jsonResponse(
          { success: false, error: 'Serverfehler: ' + err.message },
          500
        );
      }
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
