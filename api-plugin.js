import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function getEnvConfig() {
  const envFiles = ['.dev.vars', '.env'];
  const config = {};
  for (const f of envFiles) {
    const fullPath = path.resolve(process.cwd(), f);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const idx = trimmed.indexOf('=');
          if (idx !== -1) {
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim();
            config[key] = val;
          }
        }
      }
    }
  }
  return config;
}

const ALLOWED_KV_KEYS = [
  'members',
  'news',
  'events',
  'board',
  'wiwa_gallery',
  'settings',
  'submissions'
];

// Write-through Cache für ultraschnelle Antwortzeiten bei voller Cloudflare KV Persistenz
const kvCache = new Map();
let kvCachePrimed = false;

export function apiPlugin() {
  const createApiMiddleware = () => async (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const pathname = url.pathname;

        if (!pathname.startsWith('/api/')) {
          return next();
        }

        const env = { ...process.env, ...getEnvConfig() };
        const accountId = env.CLOUDFLARE_ACCOUNT_ID || '';
        const apiToken = env.CLOUDFLARE_API_TOKEN || '';
        const kvNsId = env.KV_NAMESPACE_ID || '32548c4b7d414ff682b6446ac13595ef';
        const r2Bucket = env.R2_BUCKET_NAME || 'website-datein';
        const r2Folder = env.R2_PROJECT_FOLDER || 'gewerbeverein-weser-aue';
        const resendKey = env.RESEND_API_KEY || '';
        const adminPw = env.ADMIN_PASSWORD || env.Passwort || '';
        const emailRecipient = env.EMAIL_RECIPIENT || 'friese.scholz@gmail.com';

        res.setHeader('Content-Type', 'application/json');

        const parseJsonBody = () =>
          new Promise((resolve) => {
            const chunks = [];
            req.on('data', (chunk) => chunks.push(chunk));
            req.on('end', () => {
              try {
                const raw = Buffer.concat(chunks).toString('utf8');
                resolve(raw ? JSON.parse(raw) : {});
              } catch (e) {
                resolve({});
              }
            });
          });

        const kvGet = async (key, fallbackVal) => {
          if (kvCache.has(key)) {
            return kvCache.get(key);
          }
          if (!accountId || !apiToken || !kvNsId) return fallbackVal;
          try {
            const kvRes = await fetch(
              `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNsId}/values/${key}`,
              { headers: { Authorization: `Bearer ${apiToken}` } }
            );
            if (kvRes.ok) {
              const data = await kvRes.json();
              kvCache.set(key, data);
              return data;
            }
          } catch (e) {
            console.warn(`KV GET error for ${key}:`, e);
          }
          kvCache.set(key, fallbackVal);
          return fallbackVal;
        };

        const kvPut = async (key, value) => {
          kvCache.set(key, value);
          if (!accountId || !apiToken || !kvNsId) {
            throw new Error('KV Zugangsdaten nicht konfiguriert');
          }
          const kvRes = await fetch(
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
          if (!kvRes.ok) {
            const errText = await kvRes.text();
            throw new Error(`KV PUT Fehler (${key}): ${errText}`);
          }
          return true;
        };

        const uploadToR2 = async ({ filename, base64, folder = 'uploads' }) => {
          const isPdf =
            (filename && filename.toLowerCase().endsWith('.pdf')) ||
            base64.startsWith('data:application/pdf');

          const cleanName = (filename || 'datei_' + Date.now())
            .replace(/\.[^/.]+$/, '')
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .slice(0, 60);

          const safeFolder = (folder || 'uploads').replace(/[^a-zA-Z0-9_-]/g, '');

          if (isPdf) {
            const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '');
            const pdfBuffer = Buffer.from(cleanBase64, 'base64');
            const r2Key = `${r2Folder}/${safeFolder}/${cleanName}_${Date.now()}.pdf`;
            const r2Url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${r2Bucket}/objects/${r2Key}`;

            const r2Res = await fetch(r2Url, {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${apiToken}`,
                'Content-Type': 'application/pdf'
              },
              body: pdfBuffer
            });

            if (!r2Res.ok) {
              throw new Error('R2 PDF Upload fehlgeschlagen: ' + (await r2Res.text()));
            }
            return `https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/${r2Key}`;
          } else {
            // Bild -> Automatische Konvertierung zu WebP (Quality 85, max 1920px) via Pillow
            const tempIn = path.join('/tmp', `upload_${Date.now()}_raw`);
            const tempWebp = path.join('/tmp', `upload_${Date.now()}.webp`);
            const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '');
            fs.writeFileSync(tempIn, Buffer.from(cleanBase64, 'base64'));

            const pyScriptPath = path.join('/tmp', `conv_${Date.now()}.py`);
            fs.writeFileSync(
              pyScriptPath,
              `
from PIL import Image
im = Image.open('${tempIn}')
if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
    im = im.convert('RGBA')
else:
    im = im.convert('RGB')
if im.width > 1920 or im.height > 1920:
    im.thumbnail((1920, 1920), Image.Resampling.LANCZOS)
im.save('${tempWebp}', 'WEBP', quality=85)
`
            );
            execSync(`python3 ${pyScriptPath}`);
            try {
              fs.unlinkSync(pyScriptPath);
            } catch (e) {}

            const r2Key = `${r2Folder}/${safeFolder}/${cleanName}_${Date.now()}.webp`;
            const r2Url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${r2Bucket}/objects/${r2Key}`;
            const webpBuffer = fs.readFileSync(tempWebp);

            const r2Res = await fetch(r2Url, {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${apiToken}`,
                'Content-Type': 'image/webp'
              },
              body: webpBuffer
            });

            try {
              fs.unlinkSync(tempIn);
              fs.unlinkSync(tempWebp);
            } catch (e) {}

            if (!r2Res.ok) {
              throw new Error('R2 WebP Upload fehlgeschlagen: ' + (await r2Res.text()));
            }
            return `https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/${r2Key}`;
          }
        };

        try {
          // 1. GET /api/data -> Liest alle Vereinsdaten aus Cloudflare KV
          if (pathname === '/api/data' && req.method === 'GET') {
            const initMod = await import('./src/data/initialData.js');
            const [members, news, events, board, wiwaGallery, settings, submissions] =
              await Promise.all([
                kvGet('members', initMod.INITIAL_MEMBERS),
                kvGet('news', initMod.INITIAL_NEWS),
                kvGet('events', initMod.INITIAL_EVENTS),
                kvGet('board', initMod.INITIAL_BOARD),
                kvGet('wiwa_gallery', initMod.INITIAL_WIWA_GALLERY),
                kvGet('settings', initMod.INITIAL_SETTINGS),
                kvGet('submissions', [])
              ]);

            res.statusCode = 200;
            return res.end(
              JSON.stringify({
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
              })
            );
          }

          // 2. POST /api/admin/login -> Prüft Admin-Passwort
          if (pathname === '/api/admin/login' && req.method === 'POST') {
            const { password } = await parseJsonBody();
            if (password && adminPw && password === adminPw) {
              const token =
                'weser_aue_session_' +
                Date.now() +
                '_' +
                Math.random().toString(36).substring(2);
              res.statusCode = 200;
              return res.end(
                JSON.stringify({
                  success: true,
                  token,
                  message: 'Erfolgreich angemeldet'
                })
              );
            } else {
              res.statusCode = 401;
              return res.end(
                JSON.stringify({ success: false, error: 'Ungültiges Passwort' })
              );
            }
          }

          // 3. POST /api/admin/save -> Speichert einen Datensatz dauerhaft in Cloudflare KV
          if (pathname === '/api/admin/save' && req.method === 'POST') {
            const authHeader = req.headers['authorization'] || '';
            if (!authHeader.includes('weser_aue_session_')) {
              res.statusCode = 401;
              return res.end(
                JSON.stringify({ success: false, error: 'Nicht autorisiert' })
              );
            }

            const { key, value } = await parseJsonBody();
            if (!ALLOWED_KV_KEYS.includes(key)) {
              res.statusCode = 400;
              return res.end(
                JSON.stringify({
                  success: false,
                  error: `Ungültiger KV-Schlüssel: ${key}`
                })
              );
            }

            await kvPut(key, value);
            res.statusCode = 200;
            return res.end(
              JSON.stringify({
                success: true,
                key,
                message: `Daten (${key}) erfolgreich in Cloudflare KV gespeichert.`
              })
            );
          }

          // 4. POST /api/admin/upload -> Datei/Bild/PDF nach R2 hochladen
          if (pathname === '/api/admin/upload' && req.method === 'POST') {
            const authHeader = req.headers['authorization'] || '';
            if (!authHeader.includes('weser_aue_session_')) {
              res.statusCode = 401;
              return res.end(
                JSON.stringify({ success: false, error: 'Nicht autorisiert' })
              );
            }

            const { filename, base64, folder } = await parseJsonBody();
            if (!base64) {
              res.statusCode = 400;
              return res.end(
                JSON.stringify({ success: false, error: 'Keine Dateidaten empfangen' })
              );
            }

            const publicUrl = await uploadToR2({
              filename,
              base64,
              folder: folder || 'uploads'
            });
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, url: publicUrl }));
          }

          // 5. POST /api/submit-application -> Mitgliedsantrag / WiWA-Anmeldung / Kontakt
          if (pathname === '/api/submit-application' && req.method === 'POST') {
            const body = await parseJsonBody();
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
              res.statusCode = 400;
              return res.end(
                JSON.stringify({
                  success: false,
                  error: 'Bitte geben Sie Ihren Namen oder Ihr Unternehmen an.'
                })
              );
            }

            let attachmentUrl = '';
            if (fileBase64) {
              attachmentUrl = await uploadToR2({
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

            const existingSubmissions = await kvGet('submissions', []);
            const updatedSubmissions = [
              newSubmission,
              ...(Array.isArray(existingSubmissions) ? existingSubmissions : [])
            ];
            await kvPut('submissions', updatedSubmissions);

            // Optional: E-Mail über Resend senden
            if (resendKey) {
              try {
                const typeLabel =
                  type === 'wiwa_anmeldung'
                    ? 'WiWA Aussteller-Anmeldung'
                    : type === 'mitgliedsantrag'
                    ? 'Mitgliedsantrag Unternehmernetzwerk Weser-Aue e.V.'
                    : 'Kontaktanfrage';

                await fetch('https://api.resend.com/emails', {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${resendKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    from: 'Unternehmernetzwerk Weser-Aue <onboarding@resend.dev>',
                    to: [emailRecipient],
                    reply_to: email || undefined,
                    subject: `[Weser-Aue e.V.] ${typeLabel}: ${company || contactPerson}`,
                    html: `
                      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #FBF9F5; border: 1px solid #E5E0D5; border-radius: 12px;">
                        <h2 style="color: #083476; margin-top: 0;">${typeLabel}</h2>
                        <p><strong>Unternehmen:</strong> ${company || '–'}</p>
                        <p><strong>Ansprechpartner:</strong> ${contactPerson || '–'}</p>
                        <p><strong>E-Mail:</strong> ${email || '–'}</p>
                        <p><strong>Telefon:</strong> ${phone || '–'}</p>
                        <p><strong>Adresse / Ort:</strong> ${address || ''} ${city || ''}</p>
                        <p><strong>Branche / Kategorie:</strong> ${category || '–'}</p>
                        ${standSize ? `<p><strong>Gewünschte Standfläche (WiWA):</strong> ${standSize}</p>` : ''}
                        <p><strong>Nachricht:</strong><br/>${(message || '–').replace(/\n/g, '<br/>')}</p>
                        ${
                          attachmentUrl
                            ? `<p><strong>Hochgeladenes Dokument (R2):</strong> <a href="${attachmentUrl}">${attachmentUrl}</a></p>`
                            : ''
                        }
                      </div>
                    `
                  })
                });
              } catch (mailErr) {
                console.warn('Resend notification warning:', mailErr);
              }
            }

            res.statusCode = 200;
            return res.end(
              JSON.stringify({
                success: true,
                submission: newSubmission,
                message: 'Ihre Einsendung wurde erfolgreich gespeichert.'
              })
            );
          }

          res.statusCode = 404;
          return res.end(
            JSON.stringify({ success: false, error: 'API Endpunkt nicht gefunden' })
          );
        } catch (err) {
          console.error('API Error:', err);
          res.statusCode = 500;
          return res.end(
            JSON.stringify({
              success: false,
              error: 'Interner Serverfehler: ' + err.message
            })
          );
        }
  };

  return {
    name: 'weser-aue-api-backend',
    configureServer(server) {
      server.middlewares.use(createApiMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(createApiMiddleware());
    }
  };
}

