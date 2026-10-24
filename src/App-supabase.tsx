// @ts-nocheck
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Clock,
  MapPin,
  Zap,
  Volume2,
  Car,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Info,
  Lock,
  Check,
  X,
  Phone,
  Mail,
  User,
  FileText,
  Sliders,
  Award,
  Leaf,
  Search,
  ExternalLink,
  MessageCircle,
  KeyRound,
  LogOut,
  PlusCircle,
  ShieldAlert,
  Bell,
  BellRing,
  Smartphone,
  Wallet,
  Receipt,
  Navigation,
  Send,
  Edit3,
  Download,
  RefreshCw,
  CheckCheck,
  CreditCard,
  TrendingUp,
  Wrench,
  Globe
} from 'lucide-react';

// --- SAFE RUNTIME ENV & SUPABASE CLIENT (Works in Preview + Vercel Vite) ---
const getRuntimeEnv = () => {
  try {
    const metaEnv = (0, eval)('typeof import.meta !== "undefined" ? import.meta.env : undefined');
    if (metaEnv) return metaEnv;
  } catch (_e) {
    // Ignore in es2015 preview environments
  }
  return {};
};

const runtimeEnv = getRuntimeEnv();
const envUrl = runtimeEnv.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const envKey = runtimeEnv.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
const isPlaceholderSupabase = envUrl.includes('placeholder.supabase.co');

// Lightweight compatible Supabase client (uses real Supabase REST/Auth/Realtime when keys are set, or local fallback in Preview)
const createUniversalSupabaseClient = (baseUrl, apiKey) => {
  const STORAGE_KEY = 'zuriglanz_supabase_session';
  const LOCAL_BOOKINGS_KEY = 'zuriglanz_local_bookings';
  const LOCAL_EXPENSES_KEY = 'zuriglanz_local_expenses';
  const LOCAL_SETTINGS_KEY = 'zuriglanz_local_settings';
  const authListeners = new Set();
  const realtimeChannels = new Set();

  const getStoredSession = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const buildHeaders = (extra = {}) => {
    const sess = getStoredSession();
    const token = sess?.access_token || apiKey;
    return {
      apikey: apiKey,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...extra
    };
  };

  const readLocal = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const writeLocal = (key, val) => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {
      // ignore storage quota errors
    }
  };

  return {
    auth: {
      getSession: async () => ({ data: { session: getStoredSession() }, error: null }),
      onAuthStateChange: (cb) => {
        authListeners.add(cb);
        return {
          data: {
            subscription: {
              unsubscribe: () => authListeners.delete(cb)
            }
          }
        };
      },
      signInWithPassword: async ({ email, password }) => {
        if (isPlaceholderSupabase) {
          if (email && password) {
            const demoSession = {
              access_token: 'demo-token',
              user: { email }
            };
            writeLocal(STORAGE_KEY, demoSession);
            authListeners.forEach((cb) => cb('SIGNED_IN', demoSession));
            return { data: { session: demoSession }, error: null };
          }
          return { data: null, error: { message: 'Введіть email та пароль' } };
        }
        try {
          const res = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: { apikey: apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const data = await res.json();
          if (!res.ok) {
            return { data: null, error: { message: data.error_description || data.msg || 'Login failed' } };
          }
          writeLocal(STORAGE_KEY, data);
          authListeners.forEach((cb) => cb('SIGNED_IN', data));
          return { data: { session: data }, error: null };
        } catch (err) {
          return { data: null, error: { message: err.message } };
        }
      },
      signOut: async () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
        authListeners.forEach((cb) => cb('SIGNED_OUT', null));
        return { error: null };
      }
    },
    rpc: async (fnName) => {
      if (isPlaceholderSupabase) {
        const list = readLocal(LOCAL_BOOKINGS_KEY, []);
        return {
          data: list
            .filter((b) => b.status !== 'declined')
            .map((b) => ({ date: b.date, slot: b.slot })),
          error: null
        };
      }
      try {
        const res = await fetch(`${baseUrl}/rest/v1/rpc/${fnName}`, {
          method: 'POST',
          headers: buildHeaders()
        });
        const data = await res.json();
        return { data: res.ok ? data : null, error: res.ok ? null : data };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    from: (table) => {
      const state = {
        table,
        method: 'GET',
        queryParams: [],
        bodyData: null,
        singleRow: false
      };

      const execute = async () => {
        if (isPlaceholderSupabase) {
          const storageKey =
            table === 'bookings'
              ? LOCAL_BOOKINGS_KEY
              : table === 'expenses'
              ? LOCAL_EXPENSES_KEY
              : LOCAL_SETTINGS_KEY;

          if (table === 'settings') {
            const current = readLocal(LOCAL_SETTINGS_KEY, { id: 1, cost_per_km: 0.7 });
            if (state.method === 'PATCH' && state.bodyData) {
              const updated = { ...current, ...state.bodyData };
              writeLocal(LOCAL_SETTINGS_KEY, updated);
              return { data: updated, error: null };
            }
            return { data: current, error: null };
          }

          let rows = readLocal(storageKey, []);
          if (state.method === 'GET') {
            return { data: rows, error: null };
          }
          if (state.method === 'POST') {
            const newRow = {
              id: state.bodyData?.id || crypto.randomUUID(),
              created_at: new Date().toISOString(),
              ...state.bodyData
            };
            rows = [newRow, ...rows];
            writeLocal(storageKey, rows);
            if (table === 'bookings') {
              realtimeChannels.forEach((ch) => ch.trigger('INSERT', newRow));
            }
            return { data: newRow, error: null };
          }
          if (state.method === 'PATCH') {
            const eqFilter = state.queryParams.find((p) => p.startsWith('id=eq.'));
            const targetId = eqFilter ? eqFilter.replace('id=eq.', '') : null;
            rows = rows.map((r) => (String(r.id) === String(targetId) ? { ...r, ...state.bodyData } : r));
            writeLocal(storageKey, rows);
            if (table === 'bookings') {
              realtimeChannels.forEach((ch) => ch.trigger('UPDATE', state.bodyData));
            }
            return { data: rows, error: null };
          }
          if (state.method === 'DELETE') {
            const eqFilter = state.queryParams.find((p) => p.startsWith('id=eq.'));
            const targetId = eqFilter ? eqFilter.replace('id=eq.', '') : null;
            rows = rows.filter((r) => String(r.id) !== String(targetId));
            writeLocal(storageKey, rows);
            return { data: rows, error: null };
          }
        }

        try {
          const qs = state.queryParams.length ? `?${state.queryParams.join('&')}` : '';
          const headers = buildHeaders(
            state.singleRow
              ? { Accept: 'application/vnd.pgrst.object+json' }
              : { Prefer: 'return=representation' }
          );
          const res = await fetch(`${baseUrl}/rest/v1/${table}${qs}`, {
            method: state.method,
            headers,
            body: state.bodyData ? JSON.stringify(state.bodyData) : undefined
          });
          const text = await res.text();
          const data = text ? JSON.parse(text) : null;
          return { data: res.ok ? data : null, error: res.ok ? null : data };
        } catch (err) {
          return { data: null, error: err };
        }
      };

      const builder = {
        select: (cols = '*') => {
          state.method = 'GET';
          state.queryParams.push(`select=${encodeURIComponent(cols)}`);
          return builder;
        },
        order: (col, { ascending = true } = {}) => {
          state.queryParams.push(`order=${col}.${ascending ? 'asc' : 'desc'}`);
          return builder;
        },
        eq: (col, val) => {
          state.queryParams.push(`${col}=eq.${encodeURIComponent(val)}`);
          return builder;
        },
        maybeSingle: () => {
          state.singleRow = true;
          return builder;
        },
        insert: (payload) => {
          state.method = 'POST';
          state.bodyData = payload;
          return builder;
        },
        update: (payload) => {
          state.method = 'PATCH';
          state.bodyData = payload;
          return builder;
        },
        delete: () => {
          state.method = 'DELETE';
          return builder;
        },
        then: (resolve, reject) => execute().then(resolve, reject)
      };

      return builder;
    },
    channel: (name) => {
      const handlers = [];
      const chObj = {
        name,
        on: (_type, filter, callback) => {
          handlers.push({ filter, callback });
          return chObj;
        },
        subscribe: () => {
          realtimeChannels.add(chObj);
          return chObj;
        },
        trigger: (event, newRecord) => {
          handlers.forEach((h) => {
            if (h.filter?.event === event || h.filter?.event === '*') {
              h.callback({ new: newRecord });
            }
          });
        }
      };
      return chObj;
    },
    removeChannel: (ch) => {
      realtimeChannels.delete(ch);
    }
  };
};

const supabase = createUniversalSupabaseClient(envUrl, envKey);

// --- BASE LOCATION: ZÜRICH (CITY CENTRE) & 30 KM RADIUS ---
const BASE_COORD = { lat: 47.3779, lon: 8.5403 };
const MAX_RADIUS_KM = 30;

// Calculate distance in km between two coordinates (Haversine)
const calcDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Web Audio API notification sound (works on Android without external MP3 files)
const playNotificationSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes = [587.33, 880, 1174.66]; // D5 -> A5 -> D6 chime
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);
      gain.gain.setValueAtTime(0.001, now + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.28, now + idx * 0.14 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 0.36);
    });
  } catch (e) {
    console.debug('Audio play blocked until user interaction:', e);
  }
};

// Fallback addresses within 30 km of Zürich (including ZH, AG, ZG, SZ)
const ZURICH_STREETS_DB = [
  { street: 'Limmattalstrasse 210', plz: '8049', city: 'Zürich', distKm: 2.1 },
  { street: 'Bahnhofstrasse 10', plz: '8001', city: 'Zürich', distKm: 4.5 },
  { street: 'Seestrasse 120', plz: '8002', city: 'Zürich', distKm: 4.9 },
  { street: 'Hardturmstrasse 161', plz: '8005', city: 'Zürich', distKm: 2.3 },
  { street: 'Albisriederstrasse 199', plz: '8047', city: 'Zürich', distKm: 1.4 },
  { street: 'Schaffhauserstrasse 350', plz: '8050', city: 'Zürich', distKm: 5.8 },
  { street: 'Zürcherstrasse 112', plz: '8952', city: 'Schlieren', distKm: 2.9 },
  { street: 'Löwenstrasse 18', plz: '8953', city: 'Dietikon', distKm: 6.4 },
  { street: 'Bernstrasse 88', plz: '8953', city: 'Dietikon', distKm: 6.8 },
  { street: 'Landstrasse 70', plz: '5430', city: 'Wettingen', distKm: 14.5 },
  { street: 'Badenerstrasse 15', plz: '5400', city: 'Baden', distKm: 16.2 },
  { street: 'Zürcherstrasse 40', plz: '5600', city: 'Lenzburg', distKm: 25.8 },
  { street: 'Bremgarterstrasse 25', plz: '5620', city: 'Bremgarten (AG)', distKm: 15.1 },
  { street: 'Bahnhofstrasse 12', plz: '8902', city: 'Urdorf', distKm: 4.2 },
  { street: 'Zugerstrasse 50', plz: '8810', city: 'Horgen', distKm: 16.4 },
  { street: 'Alte Landstrasse 110', plz: '8800', city: 'Thalwil', distKm: 11.2 },
  { street: 'Seestrasse 65', plz: '8700', city: 'Küsnacht (ZH)', distKm: 10.5 },
  { street: 'Seestrasse 40', plz: '8702', city: 'Zollikon', distKm: 7.9 },
  { street: 'Überlandstrasse 100', plz: '8600', city: 'Dübendorf', distKm: 11.4 },
  { street: 'Bankstrasse 14', plz: '8610', city: 'Uster', distKm: 19.2 },
  { street: 'Schaffhauserstrasse 55', plz: '8302', city: 'Kloten', distKm: 11.8 },
  { street: 'Bahnhofstrasse 19', plz: '8180', city: 'Bülach', distKm: 18.7 },
  { street: 'Baarerstrasse 45', plz: '6300', city: 'Zug', distKm: 24.6 },
  { street: 'Rathausstrasse 14', plz: '6340', city: 'Baar', distKm: 22.1 },
  { street: 'Churerstrasse 80', plz: '8808', city: 'Pfäffikon (SZ)', distKm: 28.4 },
  { street: 'Zürcherstrasse 45', plz: '8400', city: 'Winterthur', distKm: 24.9 }
];

const POPULAR_CAR_MAKES = [
  'VW Golf', 'VW Polo', 'VW Passat Variant', 'VW Tiguan', 'VW T-Roc', 'VW Touareg', 'VW Multivan',
  'Skoda Octavia', 'Skoda Octavia Kombi', 'Skoda Superb Combi', 'Skoda Karoq', 'Skoda Kodiaq', 'Skoda Fabia',
  'Seat Leon', 'Seat Ateca', 'Cupra Formentor',
  'BMW 1er', 'BMW 3er', 'BMW 3er Touring', 'BMW 5er', 'BMW X1', 'BMW X3', 'BMW X5', 'BMW X7',
  'Mercedes-Benz A-Klasse', 'Mercedes-Benz C-Klasse', 'Mercedes-Benz E-Klasse', 'Mercedes-Benz GLA',
  'Mercedes-Benz GLC', 'Mercedes-Benz GLE', 'Mercedes-Benz V-Klasse',
  'Audi A3', 'Audi A4', 'Audi A4 Avant', 'Audi A6 Avant', 'Audi Q3', 'Audi Q5', 'Audi Q7',
  'Tesla Model 3', 'Tesla Model Y', 'Tesla Model X',
  'Porsche Macan', 'Porsche Cayenne', 'Porsche Taycan',
  'Volvo V60', 'Volvo XC40', 'Volvo XC60', 'Volvo XC90',
  'Toyota Yaris', 'Toyota Corolla', 'Toyota RAV4', 'Hyundai Tucson', 'Hyundai Kona', 'Kia Sportage',
  'Ford Focus', 'Ford Kuga', 'Opel Corsa', 'Opel Astra', 'Renault Clio', 'Peugeot 3008', 'Mazda CX-5',
  'Land Rover Defender', 'Range Rover', 'Mini Cooper', 'Mini Countryman'
];

// --- PRICING TIERS & ADDONS ---
const BODY_TIERS = [
  { id: 'compact', labelKey: 'sizeCompact', price: 0, example: 'VW Golf, Tesla Model 3, BMW 3er' },
  { id: 'suv', labelKey: 'sizeSuv', price: 30, example: 'Skoda Octavia Kombi, BMW X3, Audi Q5' },
  { id: 'large', labelKey: 'sizeLarge', price: 60, example: 'BMW X5/X7, Mercedes GLE, VW Multivan' }
];

// --- AUTOMATIC VEHICLE CATEGORY DETECTION ---
const LARGE_MODELS = [
  'x ?[567]', 'ix', 'gle', 'gls', 'g ?klasse', 'g ?class', 'g ?wagen', 'v ?klasse', 'v ?class',
  'vito', 'viano', 'sprinter', 'eqv', 'q7', 'q8', 'multivan', 'caravelle', 'california',
  'transporter', 'touareg', 'touran', 'sharan', 'caddy', 'allspace', 'id ?buzz', 'amarok',
  'crafter', 'cayenne', 'xc ?90', 'ex ?90', 'kodiaq', 'tarraco', '5008', 'model ?x',
  'land ?cruiser', 'defender', 'range ?rover', 'discovery', 'santa ?fe', 'palisade',
  'sorento', 'grand ?cherokee', 'wrangler', 'ranger', 'hilux', 'navara', 'transit', 'galaxy',
  's ?max', 'espace', 'alhambra', 'zafira', 'trafic', 'vivaro', 'jumper', 'ducato', 'boxer',
  'grand ?scenic', 'urus', 'bentayga', 'cullinan', 'ev9', 'pathfinder', 'sienna'
];
const SUV_MODELS = [
  'x ?[1234]', 'ix ?[123]', 'touring', 'avant', 'variant', 'kombi', 'combi', 'estate', 'wagon',
  'sportwagon', 'shooting ?brake', 'break', 'sw', 't ?modell', 'tourer', 'sports ?tourer',
  'turismo', 'gla', 'glb', 'glc', 'eqa', 'eqb', 'eqc', 'q[2345]', 'e ?tron', 'tiguan', 't ?roc',
  't ?cross', 'taigo', 'id ?[45]', 'karoq', 'kamiq', 'enyaq', 'ateca', 'arona', 'formentor',
  'model ?y', 'macan', 'xc ?[246]0', 'ex ?[34]0', 'ec ?40', 'c ?40', 'v ?[69]0', 'v ?40',
  'cross ?country', '2008', '3008', 'captur', 'kadjar', 'austral', 'arkana', 'koleos', 'kuga',
  'puma', 'ecosport', 'edge', 'mokka', 'grandland', 'crossland', 'frontera', 'rav ?4', 'c ?hr',
  'yaris ?cross', 'corolla ?cross', 'bz ?4x', 'tucson', 'kona', 'bayon', 'ioniq ?5', 'sportage',
  'niro', 'ev ?6', 'xceed', 'stonic', 'cx ?[0-9]+', 'mx ?30', 'qashqai', 'juke', 'x ?trail',
  'ariya', 'vitara', 's ?cross', 'forester', 'outback', 'xv', 'cr ?v', 'hr ?v', 'zr ?v', 'compass',
  'renegade', 'avenger', 'evoque', 'velar', 'discovery ?sport', 'f ?pace', 'e ?pace', 'i ?pace',
  'nx', 'rx', 'ux', 'stelvio', 'tonale', 'duster', 'jogger', 'stepway', 'bigster', '500 ?x',
  'c3 ?aircross', 'c5 ?aircross', 'berlingo', 'countryman', 'clubman', 'kangoo', 'partner'
];
const COMPACT_MODELS = [
  'golf', 'polo', 'up', 'passat', 'arteon', 'jetta', 'id ?3', 'model ?3', 'model ?s',
  '[1-8] ?er', '[1-8] ?series', 'i[3-8]', 'z4', 'm[2-8]', 'a[1-8]', 's[3-8]', 'rs ?[3-7]', 'tt',
  'r8', '[abcmes] ?klasse', '[abcmes] ?class', 'cla', 'cls', 'slk', 'amg ?gt', 'eqe', 'eqs',
  'corsa', 'astra', 'insignia', 'adam', 'fiesta', 'focus', 'mustang', 'mondeo', '500', '500e',
  'panda', 'tipo', 'clio', 'megane', 'twingo', 'zoe', '208', '308', '508', '107', '108', '206',
  '207', '306', 'c1', 'c3', 'c4', 'c5', 'yaris', 'corolla', 'aygo', 'camry', 'prius', 'civic',
  'jazz', 'accord', 'i10', 'i20', 'i30', 'i40', 'ceed', 'rio', 'picanto', 'fabia', 'octavia',
  'superb', 'rapid', 'citigo', 'ibiza', 'leon', 'mii', 'mazda ?[236]', 'swift', 'ignis', 'baleno',
  'impreza', 'legacy', '911', '718', 'boxster', 'cayman', 'panamera', 'taycan', 'carrera', 'giulia',
  'giulietta', 'mito', 'mini', 'cooper', 'leaf', 'e ?up', 'e ?golf', 'ioniq ?6'
];
const normalizeCarText = (text) =>
  ' ' + String(text).toLowerCase().replace(/[-_.\/]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
const matchesAny = (normalized, list) =>
  list.some((p) => new RegExp('(?:^|\\s)(?:' + p + ')(?:\\s|$)').test(normalized));
const detectBodyTier = (text) => {
  const n = normalizeCarText(text);
  if (n.trim().length < 2) return null;
  if (matchesAny(n, LARGE_MODELS)) return 'large';
  if (matchesAny(n, SUV_MODELS)) return 'suv';
  if (matchesAny(n, COMPACT_MODELS)) return 'compact';
  return null;
};

const ADDONS = [
  {
    id: 'extractor',
    titleKey: 'addonExtractor',
    descKey: 'addonExtractorDesc',
    price: 30
  },
  {
    id: 'polish',
    titleKey: 'addonPolish',
    descKey: 'addonPolishDesc',
    price: 65
  },
  {
    id: 'pet',
    titleKey: 'addonPet',
    descKey: 'addonPetDesc',
    price: 45
  }
];

// --- TRANSLATIONS (DE / EN ONLY FOR PUBLIC SITE) ---
const TRANSLATIONS = {
  de: {
    brandSubtitle: 'Mobile Autoaufbereitung · Zürich + 30 km Umkreis',
    heroBadge: 'Umweltfreundliche Waterless-Technologie · Vor-Ort-Service',
    heroTitle: 'Schweizer Präzision für Ihr Fahrzeug – direkt bei Ihnen vor Ort.',
    heroDesc:
      '4–5 Stunden intensive Innen- & Aussenpflege ohne Wasserabfluss (100% Gewässerschutz-konform). Wir kommen zu Ihrem Parkplatz in Zürich und im Umkreis von 30 km (inkl. ZH, AG, ZG).',
    bookNowBtn: 'Termin online buchen',
    viewPackagesBtn: 'Preise & Leistungen',
    adminToggle: 'Inhaber-Login',
    statsTime: '4–5 Std.',
    statsTimeSub: 'Fokus pro Fahrzeug',
    statsBase: 'Ab 150 CHF',
    statsBaseSub: 'Pauschale inkl. Anfahrt (30 km)',
    statsEco: '100% Legal',
    statsEcoSub: 'Waterless Gewässerschutz',

    pricingTitle: 'Transparente Pauschale & Zusatzleistungen',
    pricingSubtitle: 'Keine versteckten Kosten. Anfahrt im Umkreis von 30 km ab Zürich ist inklusive.',
    basePackageTitle: 'ZüriGlanz Essential Pauschale',
    basePackagePrice: '150 CHF',
    basePackageTime: 'Dauer: ca. 4–5 Stunden · Inkl. Anfahrt ab Zürich (30 km Umkreis)',
    includedInterior: 'Innenraum-Pflege inklusive:',
    intItem1: 'Gründliches Staubsaugen des gesamten Innenraums & Kofferraums',
    intItem2: 'Tiefenreinigung aller Armaturen, Konsolen & Türverkleidungen',
    intItem3: 'Antistatik-Versiegelung gegen schnelle Neuverschmutzung',
    includedExterior: 'Aussen-Pflege (Waterless Eco) inklusive:',
    extItem1: 'Schonende wasserlose Aussenwäsche (Lack-schonende Polymer-Technik)',
    extItem2: 'Hochglanz-Wachsversiegelung für langanhaltenden Lackschutz',
    extItem3: 'Anti-Regen-Versiegelung (Hydrophober Effekt) auf den Scheiben',

    sizeTierTitle: 'Fahrzeuggrösse',
    sizeCompact: 'Kompakt / Limousine / Coupé',
    sizeSuv: 'Kombi / Kompakt-SUV',
    sizeLarge: 'Grosser SUV / 7-Sitzer / Van',

    addonsTitle: 'Optionale Upgrades (Wählbar bei Buchung)',
    addonExtractor: 'Sitz-Tiefenreinigung mit Extraktor (Nasssauger)',
    addonExtractorDesc: 'Entfernt Flecken, Schweiss & Gerüche tief aus den Polstern.',
    addonPolish: 'Lokale Kratzer-Politur (Sichtbare Kratzer)',
    addonPolishDesc: 'Maschinelle Hochglanz-Politur von sichtbaren oberflächlichen Kratzern.',
    addonPet: 'Tierhaarentfernung & Intensiv-Innenraum',
    addonPetDesc: 'Spezialbürsten-Reinigung bei starker Verschmutzung oder Hundehaaren.',

    wizardTitle: 'Termin-Reservierung (Zürich + 30 km Umkreis)',
    step1Label: '1. Standort-Check',
    step2Label: '2. Zustand & Umwelt',
    step3Label: '3. Fahrzeug & Paket',
    step4Label: '4. Datum & Zeit',
    step5Label: '5. Adresse & Kontakt',

    gateTitle: 'Technische Voraussetzungen vor Ort',
    gateSubtitle:
      'Damit wir 4–5 Stunden höchste Qualität liefern können, bestätigen Sie bitte folgende 3 Punkte:',
    q1Title: '1. Parkplatz für Ihr Auto + unser Servicefahrzeug',
    q1Desc:
      'Haben Sie einen privaten Parkplatz / Vorplatz, wo wir Ihr Auto reinigen UND unser Service-Auto mit Materialien direkt daneben parkieren können?',
    q2Title: '2. Geräuschentwicklung (Nachbarschaft / Hausordnung)',
    q2Desc:
      'Ist sichergestellt, dass das Geräusch von Staubsauger oder Extraktor während der Reinigung Ihre Nachbarn nicht stört?',
    q3Title: '3. Stromanschluss (230V) in max. 30m Distanz',
    q3Desc:
      'Gibt es eine normale Steckdose im Umkreis von 30 Metern vom Fahrzeug (wir bringen eine 30m Kabelrolle mit)?',
    yesOption: 'Ja, vorhanden / kein Problem',
    noOption: 'Nein, leider nicht',
    gateBlockedMsg:
      'Hinweis: Für die mobile Aufbereitung vor Ort müssen alle 3 Bedingungen erfüllt sein. Bitte prüfen Sie einen alternativen Standort (z.B. Arbeitsplatz oder Einfahrt von Freunden).',

    envTitle: 'Äusserer Verschmutzungsgrad & Umweltschutz',
    envDisclaimerTitle: 'Wichtiger Umweltschutz-Disclaimer (Gewässerschutz CH)',
    envDisclaimerText:
      'Stark verschmutzte Fahrzeuge können zum Schutz der Umwelt nicht bedient werden, da unsere Aussenwäsche nach wasserloser Technologie (Waterless) erfolgt. Dicke Schlamm- oder Erdkrusten müssen vorab an einer SB-Waschbox abgespült werden.',
    dirtLevelLabel: 'Wie stark ist Ihr Fahrzeug aussen verschmutzt?',
    dirtLight: 'Leicht (Staub, Blütenpollen, Fingerabdrücke)',
    dirtNormal: 'Normal (Alltagsschmutz, Wasserflecken, Strassenfilm)',
    dirtHeavy: 'Stark verschmutzt (Schlamm, Salzkruste, Offroad-Dreck) – Nicht direkt buchbar!',
    heavyDirtBlockedMsg:
      'Stark verschmutzte Fahrzeuge können nicht mit wasserloser Technik gereinigt werden. Bitte spülen Sie groben Schlamm vorab in einer SB-Waschbox ab und wählen Sie danach "Normal".',
    heavyDirtConfirm:
      'Ich bestätige, dass mein Fahrzeug aussen nicht stark mit Schlamm/Erde verkrustet ist (Umweltschutz bei wasserloser Reinigung).',

    carDetailsTitle: 'Ihr Fahrzeug & gewünschte Leistungen',
    carMakeLabel: 'Marke & Modell (mind. 3 Zeichen) *',
    carMakePlaceholder: 'z.B. BMW X3, Tesla Model Y, VW Golf',
    carYearLabel: 'Baujahr (1970–2027) *',
    selectBodyType: 'Fahrzeugkategorie wählen:',
    selectAddons: 'Zusatzleistungen hinzufügen:',
    priceSummary: 'Geschätzter Gesamtpreis',
    durationSummary: 'Geschätzte Arbeitszeit: 4 – 5 Stunden',

    dateTimeTitle: 'Wunschdatum & Zeitfenster wählen',
    dateTimeSubtitle:
      'Wir vergeben exklusiv 2 Termine pro Tag für maximale Sorgfalt ohne Zeitdruck.',
    selectDateLabel: 'Datum wählen (Montag – Samstag):',
    sundayBlocked: 'Sonntage sind aufgrund der gesetzlichen Ruhezeiten in der Schweiz gesperrt.',
    selectSlotLabel: 'Verfügbares Zeitfenster (4 Std. Block):',
    slotMorning: 'Vormittag: 08:00 – 12:00 Uhr',
    slotAfternoon: 'Nachmittag: 14:00 – 18:00 Uhr',
    slotBooked: 'Bereits reserviert',
    slotAvailable: 'Verfügbar',

    contactTitle: 'Einsatzort (Umkreis 30 km ab Zürich) & Kontaktdaten',
    addressSearchLabel: 'Adresse suchen (30 km Umkreis ab Zürich – inkl. ZH, AG, ZG) *',
    addressSearchPlaceholder: 'Tippen Sie z.B. Badenerstrasse 690, Wettingen, Zug, Schlieren...',
    searchingRadiusMsg: 'Suche Adressen im 30 km Umkreis von Zürich...',
    streetLabel: 'Strasse & Hausnummer *',
    plzLabel: 'PLZ (4 Ziffern) *',
    cityLabel: 'Ort (max. 30 km ab Zürich) *',
    nameLabel: 'Vor- & Nachname (ohne Zahlen) *',
    phoneLabel: 'Schweizer Telefon / WhatsApp (+41...) *',
    emailLabel: 'E-Mail-Adresse *',
    notesLabel:
      'Wünsche / Hinweise (z.B. Kratzer an der Fahrertür, Besucherparkplatz Nr. 4)',
    finalNotice:
      'Ihre Buchung erfordert eine kurze Bestätigung unsererseits. Sie erhalten in Kürze eine Rückmeldung per WhatsApp/Telefon.',
    submitBookingBtn: 'Termin verbindlich anfragen',
    nextBtn: 'Weiter',
    backBtn: 'Zurück',

    errCarMake: 'Bitte geben Sie eine gültige Automarke & Modell an (mind. 3 Buchstaben).',
    errStreetNumber: 'Bitte geben Sie Strasse UND Hausnummer an (z.B. Badenerstrasse 690).',
    errPlzSwiss: 'Bitte eine gültige 4-stellige Schweizer PLZ eingeben (z.B. 8001, 5400, 6300).',
    errOutOfRadius:
      'Diese Adresse liegt ausserhalb unseres 30 km Service-Radius ab Zürich. Bitte wählen Sie einen Ort innerhalb von 30 km.',
    errFullName: 'Bitte Vor- und Nachname eingeben (mind. 2 Wörter, keine Zahlen).',
    errPhoneCh: 'Bitte gültige Schweizer Nummer eingeben (z.B. +41 79 123 45 67).',
    errEmail: 'Bitte eine gültige E-Mail-Adresse eingeben (z.B. name@domain.ch).',

    bookingSuccessTitle: 'Termin-Anfrage erfolgreich gesendet!',
    bookingSuccessText:
      'Vielen Dank! Wir haben Ihre Angaben erhalten. Der Termin hat aktuell den Status "Wartet auf Bestätigung". Ich melde mich in Kürze bei Ihnen.',
    newBookingBtn: 'Weitere Buchung erstellen',

    adminTitle: 'Inhaber-Cockpit · Buchungsverwaltung',
    adminSub:
      'Geheime Verwaltungsansicht für ZüriGlanz (Basis Zürich · 30 km Umkreis). Bestätigen Sie Termine oder kontaktieren Sie Kunden direkt per WhatsApp.',
    statusPending: 'Wartet auf Bestätigung',
    statusConfirmed: 'Bestätigt',
    statusDeclined: 'Abgelehnt',
    confirmBtn: 'Bestätigen',
    declineBtn: 'Ablehnen',
    deleteBtn: 'Löschen',
    noBookings: 'Noch keine Buchungen in dieser Ansicht.'
  },
  en: {
    brandSubtitle: 'Mobile Car Detailing · Zürich + 30 km Radius',
    heroBadge: 'Eco-Friendly Waterless Tech · Doorstep Service',
    heroTitle: 'Swiss Precision Car Care — Right at Your Doorstep.',
    heroDesc:
      '4–5 hours of dedicated interior & exterior craftsmanship per vehicle. Compliant with Swiss environmental laws. We come directly to your parking spot within a 30 km radius of Zürich (ZH, AG, ZG).',
    bookNowBtn: 'Book Appointment',
    viewPackagesBtn: 'Pricing & Services',
    adminToggle: 'Owner Login',
    statsTime: '4–5 Hrs',
    statsTimeSub: 'Dedicated per car',
    statsBase: 'From 150 CHF',
    statsBaseSub: 'Flat rate incl. 30 km travel',
    statsEco: 'Eco-Safe',
    statsEcoSub: 'Waterless Technology',

    pricingTitle: 'Transparent Flat Rate & Custom Upgrades',
    pricingSubtitle: 'No hidden fees. Call-out within a 30 km radius of Zürich is included.',
    basePackageTitle: 'ZüriGlanz Essential Care (Pauschale)',
    basePackagePrice: '150 CHF',
    basePackageTime: 'Duration: approx. 4–5 hours · Includes travel within 30 km of Zürich',
    includedInterior: 'Interior Care Included:',
    intItem1: 'Thorough deep vacuuming of entire cabin, carpets & trunk',
    intItem2: 'Detailed cleaning of all panels, dashboard, vents & consoles',
    intItem3: 'Anti-static cockpit treatment to repel dust',
    includedExterior: 'Exterior Care (Waterless Eco) Included:',
    extItem1: 'Scratch-safe waterless polymer exterior wash',
    extItem2: 'Protective carnauba/polymer wax application for deep gloss',
    extItem3: 'Hydrophobic Anti-Rain coating on windshield & glass',

    sizeTierTitle: 'Vehicle Size Tier',
    sizeCompact: 'Compact / Sedan / Coupé',
    sizeSuv: 'Station Wagon (Kombi) / Mid-SUV',
    sizeLarge: 'Large SUV / 7-Seater / Van',

    addonsTitle: 'Optional Upgrades (Selectable during booking)',
    addonExtractor: 'Deep Seat Extraction (Wet Extractor Cleaning)',
    addonExtractorDesc:
      'Removes deep stains, spills, and odors from fabric seats or deep cleans leather.',
    addonPolish: 'Spot Scratch Polishing (Visible Scratches)',
    addonPolishDesc:
      'Machine polishing of visible surface scratches and scuffs on doors/panels.',
    addonPet: 'Pet Hair Removal & Heavy Interior Sanitization',
    addonPetDesc: 'Specialized extraction of stubborn pet hair or heavy cabin soiling.',

    wizardTitle: 'Book Your Mobile Detailing Slot (30 km Radius)',
    step1Label: '1. Site Pre-Check',
    step2Label: '2. Dirt & Eco Policy',
    step3Label: '3. Vehicle & Add-ons',
    step4Label: '4. Date & Slot',
    step5Label: '5. Address & Contact',

    gateTitle: 'On-Site Requirements Check',
    gateSubtitle:
      'Before choosing a slot, please confirm that your location meets these 3 conditions:',
    q1Title: '1. Parking Space for Your Car + Our Service Vehicle',
    q1Desc:
      'Do you have a parking spot/driveway where we can clean your car AND park our work vehicle with equipment right next to it?',
    q2Title: '2. Vacuum & Extractor Noise (Neighbors)',
    q2Desc:
      'Will the sound of our vacuum or extractor during the session be acceptable without disturbing your neighbors?',
    q3Title: '3. Power Outlet (230V) within 30 Meters',
    q3Desc: 'Do you have access to a standard power socket within a 30-meter radius of the car?',
    yesOption: 'Yes, available / no issue',
    noOption: 'No',
    gateBlockedMsg:
      'Important: All 3 conditions are required for mobile service. If unavailable at home, many clients book us at their workplace parking or a friend’s driveway.',

    envTitle: 'Exterior Dirtiness & Environmental Protection',
    envDisclaimerTitle: 'Environmental Protection Disclaimer (Waterless Wash)',
    envDisclaimerText:
      'Heavily soiled exteriors cannot be serviced to protect the environment, as our exterior wash uses waterless technology. Vehicles covered in thick mud must be rinsed at a self-wash station first.',
    dirtLevelLabel: 'Select the current exterior condition of your car:',
    dirtLight: 'Light (Dust, pollen, fingerprints)',
    dirtNormal: 'Moderate (Normal road film, rain spots)',
    dirtHeavy: 'Heavily Soiled (Thick mud, off-road dirt) – Cannot be serviced waterlessly!',
    heavyDirtBlockedMsg:
      'Heavily mud-caked cars cannot be serviced due to environmental protection rules for waterless washing. Please rinse heavy mud at a self-wash station first, then select "Moderate".',
    heavyDirtConfirm:
      'I confirm that my car exterior is not covered in thick mud and complies with the waterless environmental protection policy.',

    carDetailsTitle: 'Vehicle Information & Services',
    carMakeLabel: 'Car Make & Model (min. 3 chars) *',
    carMakePlaceholder: 'e.g. Porsche Macan, Audi A4, Tesla Model 3',
    carYearLabel: 'Production Year (1970–2027) *',
    selectBodyType: 'Select Vehicle Type:',
    selectAddons: 'Select Optional Add-ons:',
    priceSummary: 'Estimated Total',
    durationSummary: 'Estimated Time: 4 – 5 Hours',

    dateTimeTitle: 'Choose Date & Time Slot',
    dateTimeSubtitle:
      'We strictly limit bookings to 2 cars per day (08:00–12:00 and 14:00–18:00) for uncompromising quality.',
    selectDateLabel: 'Select Date (Mon – Sat):',
    sundayBlocked: 'Sundays are unavailable due to Swiss noise regulations.',
    selectSlotLabel: 'Select 4-Hour Time Slot:',
    slotMorning: 'Morning Slot: 08:00 – 12:00',
    slotAfternoon: 'Afternoon Slot: 14:00 – 18:00',
    slotBooked: 'Booked',
    slotAvailable: 'Available',

    contactTitle: 'Service Address (30 km Radius from Zürich) & Contact',
    addressSearchLabel: 'Search Address within 30 km of Zürich (Street, No., PLZ) *',
    addressSearchPlaceholder: 'Type e.g. Badenerstrasse 690, Baden, Zug, Küsnacht...',
    searchingRadiusMsg: 'Searching addresses within 30 km of Zürich...',
    streetLabel: 'Street & House Number *',
    plzLabel: 'Postal Code (4 digits) *',
    cityLabel: 'City / Municipality (within 30 km) *',
    nameLabel: 'Full Name (First & Last Name) *',
    phoneLabel: 'Swiss Phone / WhatsApp (+41...) *',
    emailLabel: 'Email Address *',
    notesLabel:
      'Client Wishes & Notes (e.g. Scratch on right door to polish, visitor parking #4)',
    finalNotice:
      'Your booking requires manual confirmation from our side. You will receive a confirmation via WhatsApp/Phone shortly.',
    submitBookingBtn: 'Request Booking Confirmation',
    nextBtn: 'Continue',
    backBtn: 'Back',

    errCarMake: 'Please enter a valid car make and model (at least 3 letters).',
    errStreetNumber: 'Please include both street name AND house number (e.g. Badenerstrasse 690).',
    errPlzSwiss: 'Please enter a valid 4-digit Swiss postal code (e.g. 8001, 5400, 6300).',
    errOutOfRadius:
      'This address is outside our 30 km service radius from Zürich. Please choose a location within 30 km.',
    errFullName: 'Please enter your first and last name (at least 2 words, no digits).',
    errPhoneCh: 'Please enter a valid Swiss phone number (+41 79 123 45 67).',
    errEmail: 'Please enter a valid email address (name@domain.ch).',

    bookingSuccessTitle: 'Booking Request Received!',
    bookingSuccessText:
      'Thank you! Your slot is reserved as "Pending Confirmation". I will review the details and contact you shortly to confirm.',
    newBookingBtn: 'Done',

    adminTitle: 'Owner Dashboard · Manage Bookings',
    adminSub:
      'Private control panel (Base: Zürich · 30 km radius). Review incoming bookings, open Google Maps, or send 1-click WhatsApp confirmations.',
    statusPending: 'Pending Confirmation',
    statusConfirmed: 'Confirmed',
    statusDeclined: 'Declined',
    confirmBtn: 'Confirm Slot',
    declineBtn: 'Decline',
    deleteBtn: 'Delete',
    noBookings: 'No bookings found in this view.'
  }
};

// Generate default tomorrow date (skipping Sunday)
const getDefaultDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  if (d.getDay() === 0) d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

// Format Swiss Phone Number nicely as user types
const formatSwissPhone = (raw) => {
  let cleaned = raw.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('0041')) {
    cleaned = '+41' + cleaned.slice(4);
  } else if (cleaned.startsWith('07') || cleaned.startsWith('04') || cleaned.startsWith('03')) {
    cleaned = '+41' + cleaned.slice(1);
  } else if (cleaned.startsWith('41') && cleaned.length > 9) {
    cleaned = '+' + cleaned;
  }
  if (!cleaned.startsWith('+')) {
    return cleaned;
  }
  const digits = cleaned.slice(3).replace(/\D/g, '').slice(0, 9);
  let out = '+41';
  if (digits.length > 0) out += ' ' + digits.slice(0, 2);
  if (digits.length > 2) out += ' ' + digits.slice(2, 5);
  if (digits.length > 5) out += ' ' + digits.slice(5, 7);
  if (digits.length > 7) out += ' ' + digits.slice(7, 9);
  return out;
};

const YEAR_OPTIONS = Array.from({ length: 2027 - 1970 + 1 }, (_, i) => String(2027 - i));

// --- ACCOUNTING HELPERS ---
const EXPENSE_CATEGORIES = [
  'Матеріали',
  'Інструмент і обладнання',
  'Страхування',
  'Маркетинг і сайт',
  'Офіс і софт',
  'Інше'
];
const PAYMENT_METHODS = ['Twint', 'Готівка', 'Рахунок / банк', 'Картка', 'Інше'];

const localDateStr = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parseNum = (v) => {
  const n = parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
const chf = (n) =>
  (Math.round((Number(n) || 0) * 100) / 100).toLocaleString('de-CH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
const downloadCsv = (filename, rows) => {
  const esc = (v) => {
    const str = v == null ? '' : String(v);
    return /[",;\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
  };
  const csv = '\uFEFF' + rows.map((r) => r.map(esc).join(';')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

// Demo bookings for testing the Android App in Preview when Supabase .env isn't attached
const INITIAL_DEMO_BOOKINGS = [
  {
    id: 'demo-1',
    status: 'pending',
    date: getDefaultDate(),
    slot: '08:00 - 12:00',
    createdAt: Date.now() - 1000 * 60 * 12,
    kmDriven: null,
    finalPrice: null,
    paid: false,
    paymentMethod: '',
    internalNotes: '',
    carMakeModel: 'BMW X5',
    carYear: '2023',
    bodyTier: 'large',
    dirtLevel: 'normal',
    addons: ['extractor', 'polish'],
    totalPrice: 305,
    location: {
      street: 'Seestrasse 65',
      plz: '8700',
      city: 'Küsnacht (ZH)',
      distKmFromBase: 10.5
    },
    client: {
      name: 'Thomas Müller',
      phone: '+41 79 345 67 89',
      email: 'thomas.mueller@swissonline.ch',
      notes: 'Leichter Kratzer an der hinteren Tür rechts. Parkplatz direkt vor der Garage.'
    }
  },
  {
    id: 'demo-2',
    status: 'confirmed',
    date: localDateStr(),
    slot: '14:00 - 18:00',
    createdAt: Date.now() - 1000 * 60 * 180,
    kmDriven: 18.5,
    finalPrice: 210,
    paid: true,
    paymentMethod: 'Twint',
    internalNotes: '+10 CHF Чайові',
    carMakeModel: 'Tesla Model Y',
    carYear: '2024',
    bodyTier: 'suv',
    dirtLevel: 'light',
    addons: ['extractor'],
    totalPrice: 210,
    location: {
      street: 'Badenerstrasse 690',
      plz: '8048',
      city: 'Zürich',
      distKmFromBase: 4.2
    },
    client: {
      name: 'Sarah Jenkins',
      phone: '+41 78 912 34 56',
      email: 's.jenkins@gmail.com',
      notes: 'Visitor parking #3 on the left side.'
    }
  }
];

export default function App() {
  const [lang, setLang] = useState('de');
  const t = TRANSLATIONS[lang];

  // Owner session & bookings
  const [session, setSession] = useState(null);
  const [isDemoAdmin, setIsDemoAdmin] = useState(false);
  const [takenSlots, setTakenSlots] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Hidden PIN-Protected Owner Dashboard State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [adminFilter, setAdminFilter] = useState('all');

  // Android App Specific States
  const [androidTab, setAndroidTab] = useState('inbox'); // 'inbox' | 'jobs' | 'expenses' | 'finance' | 'settings'
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [liveAlertBooking, setLiveAlertBooking] = useState(null);
  const [activeWhatsAppBooking, setActiveWhatsAppBooking] = useState(null);
  const [waTemplateType, setWaTemplateType] = useState('confirm'); // 'confirm' | 'onway' | 'done' | 'decline'
  const [waLang, setWaLang] = useState('de'); // 'de' | 'en'
  const [waCustomText, setWaCustomText] = useState('');
  const [editingJobId, setEditingJobId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const knownBookingIdsRef = useRef(new Set());

  // Inject Android PWA Manifest & Meta Tags so Chrome on Android can install as Native WebAPK
  useEffect(() => {
    if (typeof document === 'undefined') return;
    let themeMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeMeta) {
      themeMeta = document.createElement('meta');
      themeMeta.name = 'theme-color';
      document.head.appendChild(themeMeta);
    }
    themeMeta.content = '#0f172a';

    const manifestObj = {
      name: 'ZüriGlanz Owner Cockpit',
      short_name: 'ZüriGlanz',
      description: 'Мобільний кабінет власника ZüriGlanz Detailing Zürich',
      start_url: window.location.origin + '/?admin=1',
      display: 'standalone',
      background_color: '#0f172a',
      theme_color: '#0f172a',
      orientation: 'portrait',
      icons: [
        {
          src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%230f172a"/><circle cx="78" cy="22" r="14" fill="%23D52B1E"/><text x="50" y="64" font-family="sans-serif" font-size="44" font-weight="bold" fill="white" text-anchor="middle">ZG</text></svg>',
          sizes: '192x192',
          type: 'image/svg+xml'
        }
      ]
    };
    const blob = new Blob([JSON.stringify(manifestObj)], { type: 'application/json' });
    const manifestUrl = URL.createObjectURL(blob);
    let linkEl = document.querySelector('link[rel="manifest"]');
    if (!linkEl) {
      linkEl = document.createElement('link');
      linkEl.rel = 'manifest';
      document.head.appendChild(linkEl);
    }
    linkEl.href = manifestUrl;
    return () => URL.revokeObjectURL(manifestUrl);
  }, []);

  // Check if URL has ?admin=1 or ?app=1 on load
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      (window.location.search.includes('admin=1') || window.location.search.includes('app=1'))
    ) {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session) setIsAdminMode(true);
        else setShowPinModal(true);
      });
    }
  }, []);

  // Trigger Android Notification + Sound + Vibration on new booking
  const triggerNewBookingAlert = (bookingObj) => {
    setLiveAlertBooking(bookingObj);
    if (soundEnabled) {
      playNotificationSound();
    }
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([250, 120, 250, 120, 400]);
    }
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        const n = new Notification(`🔔 Нова бронь: ${bookingObj.carMakeModel} (${bookingObj.totalPrice} CHF)`, {
          body: `${bookingObj.date} (${bookingObj.slot}) · ${bookingObj.client?.name || ''} · ${bookingObj.location?.city || ''}`,
          tag: `booking-${bookingObj.id}`,
          renotify: true
        });
        n.onclick = () => {
          window.focus();
          setIsAdminMode(true);
          setAndroidTab('inbox');
          setActiveWhatsAppBooking(bookingObj);
        };
      } catch (e) {
        console.debug('Notification error:', e);
      }
    }
  };

  const requestAndroidNotificationPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      playNotificationSound();
    }
  };

  // Booking Funnel State
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState(null);
  const [formError, setFormError] = useState('');

  // Step 1: 3 Gatekeeper Questions
  const [hasParking, setHasParking] = useState(null);
  const [noiseOk, setNoiseOk] = useState(null);
  const [hasPower30m, setHasPower30m] = useState(null);

  // Step 2: Exterior Dirtiness & Environmental Disclaimer
  const [dirtLevel, setDirtLevel] = useState('normal');
  const [ecoDisclaimerAccepted, setEcoDisclaimerAccepted] = useState(false);

  // Step 3: Vehicle & Services
  const [carMakeModel, setCarMakeModel] = useState('');
  const [showCarSuggestions, setShowCarSuggestions] = useState(false);
  const [carYear, setCarYear] = useState('2022');
  const [bodyTier, setBodyTier] = useState('compact');
  const [tierManual, setTierManual] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState(['extractor']);

  // Step 4: Date & 2 Daily Slots
  const [selectedDate, setSelectedDate] = useState(getDefaultDate());
  const [selectedSlot, setSelectedSlot] = useState('08:00 - 12:00');

  // Step 5: Location Autocomplete & Strict Contact Validation
  const [addressQuery, setAddressQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [selectedDistanceKm, setSelectedDistanceKm] = useState(null);

  const [street, setStreet] = useState('');
  const [plz, setPlz] = useState('');
  const [city, setCity] = useState('Zürich');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+41 ');
  const [clientEmail, setClientEmail] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  // --- SWISS GEOADMIN API + 30 KM RADIUS FILTER FROM ZÜRICH ---
  useEffect(() => {
    const q = addressQuery.trim();
    if (q.length < 2) {
      setAddressSuggestions([]);
      return;
    }

    let isCancelled = false;
    const timer = setTimeout(async () => {
      setIsSearchingAddress(true);
      const lower = q.toLowerCase();
      const localMatches = ZURICH_STREETS_DB.filter(
        (item) =>
          item.street.toLowerCase().includes(lower) ||
          item.plz.includes(lower) ||
          item.city.toLowerCase().includes(lower)
      ).map((item) => ({
        label: `${item.street}, ${item.plz} ${item.city}`,
        street: item.street,
        plz: item.plz,
        city: item.city,
        distKm: item.distKm
      }));

      try {
        const url = `https://api3.geo.admin.ch/rest/services/ech/SearchServer?type=locations&origins=address&limit=12&searchText=${encodeURIComponent(
          q
        )}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const apiResults = (data.results || [])
            .map((r) => {
              const rawLabel = (r.attrs?.label || '').replace(/<\/?b>/g, '');
              const match = rawLabel.match(/^(.+?)\s+(\d{4})\s+(.+)$/);
              const lat = Number(r.attrs?.lat);
              const lon = Number(r.attrs?.lon);
              let distKm = null;
              if (!Number.isNaN(lat) && !Number.isNaN(lon) && lat > 0) {
                distKm = Math.round(
                  calcDistanceKm(BASE_COORD.lat, BASE_COORD.lon, lat, lon) * 10
                ) / 10;
              }
              if (match) {
                return {
                  label: `${match[1].trim()}, ${match[2].trim()} ${match[3].trim()}`,
                  street: match[1].trim(),
                  plz: match[2].trim(),
                  city: match[3].trim(),
                  distKm
                };
              }
              return null;
            })
            .filter((item) => item && (item.distKm === null || item.distKm <= MAX_RADIUS_KM));

          if (!isCancelled) {
            const combined = [...apiResults, ...localMatches];
            const unique = [];
            const seen = new Set();
            for (const c of combined) {
              if (!seen.has(c.label)) {
                seen.add(c.label);
                unique.push(c);
              }
            }
            setAddressSuggestions(unique.slice(0, 8));
          }
        } else if (!isCancelled) {
          setAddressSuggestions(localMatches.slice(0, 6));
        }
      } catch {
        if (!isCancelled) {
          setAddressSuggestions(localMatches.slice(0, 6));
        }
      } finally {
        if (!isCancelled) setIsSearchingAddress(false);
      }
    }, 220);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [addressQuery]);

  const handleSelectAddressSuggestion = (item) => {
    setStreet(item.street);
    setPlz(item.plz);
    setCity(item.city);
    setSelectedDistanceKm(item.distKm ?? null);
    setAddressQuery(`${item.street}, ${item.plz} ${item.city}`);
    setShowAddressDropdown(false);
  };

  // --- SUPABASE: OWNER SESSION ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data?.session || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // --- PUBLIC: taken slots only ---
  const loadTakenSlots = async () => {
    if (isPlaceholderSupabase) return;
    const { data, error } = await supabase.rpc('get_taken_slots');
    if (!error && data) setTakenSlots(data);
  };
  useEffect(() => {
    loadTakenSlots();
    const timer = setInterval(loadTakenSlots, 60000);
    return () => clearInterval(timer);
  }, []);

  // --- OWNER ONLY: full booking list + REALTIME PUSH NOTIFICATIONS ---
  const rowToBooking = (r) => ({
    id: r.id,
    status: r.status,
    date: r.date,
    slot: r.slot,
    createdAt: new Date(r.created_at).getTime(),
    kmDriven: r.km_driven ?? null,
    finalPrice: r.final_price ?? null,
    paid: !!r.paid,
    paymentMethod: r.payment_method || '',
    internalNotes: r.internal_notes || '',
    ...(r.details || {})
  });

  const loadBookings = async (checkNewForAlert = false) => {
    if (isDemoAdmin && !session) return;
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Load bookings error:', error);
      return;
    }
    const mapped = (data || []).map(rowToBooking);

    if (checkNewForAlert && knownBookingIdsRef.current.size > 0) {
      const brandNew = mapped.find(
        (b) => !knownBookingIdsRef.current.has(b.id) && b.status === 'pending'
      );
      if (brandNew) {
        triggerNewBookingAlert(brandNew);
      }
    }
    knownBookingIdsRef.current = new Set(mapped.map((b) => b.id));
    setBookings(mapped);
  };

  useEffect(() => {
    if (!session) {
      if (!isDemoAdmin) {
        setBookings([]);
        setIsAdminMode(false);
      }
      return;
    }
    loadBookings(false);

    // Subscribe to real-time INSERT & UPDATE events on 'bookings'
    const channel = supabase
      .channel('owner-bookings-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bookings' },
        (payload) => {
          if (payload?.new) {
            const bObj = rowToBooking(payload.new);
            knownBookingIdsRef.current.add(bObj.id);
            setBookings((prev) => [bObj, ...prev.filter((x) => x.id !== bObj.id)]);
            if (bObj.status === 'pending') {
              triggerNewBookingAlert(bObj);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings' },
        () => {
          loadBookings(false);
        }
      )
      .subscribe();

    const timer = setInterval(() => loadBookings(true), 15000);
    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, [session, isDemoAdmin, soundEnabled]);

  // --- PRICE CALCULATION ---
  const totalPrice = useMemo(() => {
    const base = 150;
    const tierObj = BODY_TIERS.find((b) => b.id === bodyTier);
    const tierCost = tierObj ? tierObj.price : 0;
    const addonsCost = selectedAddons.reduce((sum, addonId) => {
      const item = ADDONS.find((a) => a.id === addonId);
      return sum + (item ? item.price : 0);
    }, 0);
    return base + tierCost + addonsCost;
  }, [bodyTier, selectedAddons]);

  const isSlotTaken = (dateStr, slotStr) => {
    return takenSlots.some((s) => s.date === dateStr && s.slot === slotStr);
  };

  const isSunday = (dateStr) => {
    if (!dateStr) return false;
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.getDay() === 0;
  };

  const toggleAddon = (id) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const applyCarModel = (text) => {
    setCarMakeModel(text);
    setTierManual(false);
    setBodyTier(detectBodyTier(text) || 'compact');
  };
  const detectedTier = useMemo(() => detectBodyTier(carMakeModel), [carMakeModel]);
  const tierConfirmed = tierManual || detectedTier !== null;

  // --- STRICT FIELD VALIDATORS ---
  const isCarMakeValid = useMemo(() => {
    const v = carMakeModel.trim();
    return v.length >= 3 && /[a-zA-ZäöüÄÖÜа-яА-ЯіїєІЇЄ]/.test(v);
  }, [carMakeModel]);

  const isCarYearValid = useMemo(() => {
    const yr = Number(carYear);
    return yr >= 1970 && yr <= 2027;
  }, [carYear]);

  const isStreetValid = useMemo(() => {
    const s = street.trim();
    return s.length >= 4 && /[a-zA-ZäöüÄÖÜß]/.test(s) && /\d+/.test(s);
  }, [street]);

  const isPlzValid = useMemo(() => {
    return /^[1-9]\d{3}$/.test(plz.trim());
  }, [plz]);

  const isWithinRadius = useMemo(() => {
    if (selectedDistanceKm !== null) {
      return selectedDistanceKm <= MAX_RADIUS_KM;
    }
    return true;
  }, [selectedDistanceKm]);

  const isCityValid = useMemo(() => {
    return city.trim().length >= 2 && !/\d/.test(city.trim());
  }, [city]);

  const isNameValid = useMemo(() => {
    const n = clientName.trim();
    const parts = n.split(/\s+/).filter(Boolean);
    return parts.length >= 2 && n.length >= 4 && !/\d/.test(n);
  }, [clientName]);

  const isPhoneValid = useMemo(() => {
    const digitsOnly = clientPhone.replace(/\D/g, '');
    return digitsOnly.startsWith('41') && digitsOnly.length === 11;
  }, [clientPhone]);

  const isEmailValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(clientEmail.trim());
  }, [clientEmail]);

  const canProceedStep1 = hasParking === true && noiseOk === true && hasPower30m === true;
  const hasAnyNoStep1 = hasParking === false || noiseOk === false || hasPower30m === false;

  const canProceedStep2 =
    ecoDisclaimerAccepted && (dirtLevel === 'light' || dirtLevel === 'normal');

  const canProceedStep3 = isCarMakeValid && isCarYearValid && tierConfirmed;
  const canProceedStep4 =
    selectedDate &&
    !isSunday(selectedDate) &&
    selectedSlot &&
    !isSlotTaken(selectedDate, selectedSlot);

  const canProceedStep5 =
    isStreetValid &&
    isPlzValid &&
    isWithinRadius &&
    isCityValid &&
    isNameValid &&
    isPhoneValid &&
    isEmailValid;

  const handleNextStep = () => {
    setFormError('');
    if (step === 1 && !canProceedStep1) {
      setFormError(t.gateBlockedMsg);
      return;
    }
    if (step === 2) {
      if (dirtLevel === 'heavy') {
        setFormError(t.heavyDirtBlockedMsg);
        return;
      }
      if (!ecoDisclaimerAccepted) {
        setFormError(t.heavyDirtConfirm);
        return;
      }
    }
    if (step === 3 && !canProceedStep3) {
      setFormError(
        isCarMakeValid && isCarYearValid && !tierConfirmed
          ? lang === 'de'
            ? 'Bitte wählen Sie die passende Fahrzeugkategorie.'
            : 'Please select the matching vehicle category.'
          : t.errCarMake
      );
      return;
    }
    if (step === 4 && !canProceedStep4) {
      setFormError(t.sundayBlocked);
      return;
    }
    setStep((s) => Math.min(s + 1, 5));
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!isStreetValid) return setFormError(t.errStreetNumber);
    if (!isPlzValid) return setFormError(t.errPlzSwiss);
    if (!isWithinRadius) return setFormError(t.errOutOfRadius);
    if (!isNameValid) return setFormError(t.errFullName);
    if (!isPhoneValid) return setFormError(t.errPhoneCh);
    if (!isEmailValid) return setFormError(t.errEmail);

    setIsSubmitting(true);

    const newBooking = {
      status: 'pending',
      createdAt: Date.now(),
      date: selectedDate,
      slot: selectedSlot,
      carMakeModel: carMakeModel.trim(),
      carYear: carYear.trim(),
      bodyTier,
      dirtLevel,
      addons: selectedAddons,
      totalPrice,
      requirements: {
        hasParking: true,
        noiseOk: true,
        hasPower30m: true,
        ecoAccepted: true
      },
      location: {
        street: street.trim(),
        plz: plz.trim(),
        city: city.trim(),
        distKmFromBase: selectedDistanceKm
      },
      client: {
        name: clientName.trim(),
        phone: clientPhone.trim(),
        email: clientEmail.trim(),
        notes: clientNotes.trim()
      }
    };

    try {
      const id = crypto.randomUUID();
      if (isPlaceholderSupabase) {
        const created = { id, ...newBooking };
        setBookings((prev) => [created, ...prev]);
        setSubmittedBooking(created);
        triggerNewBookingAlert(created);
      } else {
        const { status, date, slot, createdAt, ...details } = newBooking;
        const { error } = await supabase
          .from('bookings')
          .insert({ id, status: 'pending', date, slot, details });
        if (error) throw error;
        setSubmittedBooking({ id, ...newBooking });
        loadTakenSlots();
      }
    } catch (err) {
      console.error('Error saving booking:', err);
      loadTakenSlots();
      setFormError(
        err && err.code === '23505'
          ? 'Dieser Termin wurde soeben vergeben. Bitte wählen Sie einen anderen Slot. / This slot was just taken. Please choose another one.'
          : 'Die Buchung konnte nicht gespeichert werden. Bitte versuchen Sie es erneut. / Your booking could not be saved. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    if (isDemoAdmin && !session) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
      return;
    }
    if (!session) return;
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);
    if (error) console.error('Error updating status:', error);
    loadBookings();
    loadTakenSlots();
  };

  const deleteBooking = async (bookingId) => {
    if (isDemoAdmin && !session) {
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      setDeleteConfirmId(null);
      return;
    }
    if (!session) return;
    const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
    if (error) console.error('Error deleting booking:', error);
    setDeleteConfirmId(null);
    loadBookings();
    loadTakenSlots();
  };

  const handleManualBlockSlot = async (dateToBlock, slotToBlock) => {
    const blockDetails = {
      carMakeModel: 'Telefon-Buchung / Blockiert',
      carYear: '2026',
      bodyTier: 'compact',
      dirtLevel: 'normal',
      addons: [],
      totalPrice: 0,
      location: { street: 'Manuelle Reservierung', plz: '8000', city: 'Zürich' },
      client: {
        name: 'Inhaber Blockierung',
        phone: '+41 79 000 00 00',
        email: '',
        notes: 'Manuell vom Inhaber reserviert'
      }
    };
    if (isDemoAdmin && !session) {
      setBookings((prev) => [
        {
          id: 'block-' + Date.now(),
          status: 'confirmed',
          date: dateToBlock,
          slot: slotToBlock,
          createdAt: Date.now(),
          ...blockDetails
        },
        ...prev
      ]);
      return;
    }
    if (!session) return;
    const { error } = await supabase.from('bookings').insert({
      status: 'confirmed',
      date: dateToBlock,
      slot: slotToBlock,
      details: blockDetails
    });
    if (error) console.error('Error blocking slot:', error);
    loadBookings();
    loadTakenSlots();
  };

  const handlePinLogin = async (e) => {
    e.preventDefault();
    setPinError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: pinInput
    });
    if (error) {
      setPinError('Помилка входу Supabase (або натисніть Тест-режим нижче для прев’ю)');
      return;
    }
    setIsAdminMode(true);
    setShowPinModal(false);
    setPinInput('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const enterDemoOwnerApp = () => {
    setIsDemoAdmin(true);
    setIsAdminMode(true);
    setShowPinModal(false);
    if (bookings.length === 0) {
      setBookings(INITIAL_DEMO_BOOKINGS);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- WHATSAPP COMMUNICATION TEMPLATES (DE / EN) ---
  const generateWhatsAppMessage = (b, tplType = 'confirm', msgLang = 'de') => {
    if (!b) return '';
    const name = b.client?.name || '';
    const car = `${b.carMakeModel || ''} ${b.carYear ? `(${b.carYear})` : ''}`.trim();
    const addr = `${b.location?.street || ''}, ${b.location?.plz || ''} ${b.location?.city || ''}`.trim();
    const price = b.finalPrice != null ? b.finalPrice : b.totalPrice;

    if (msgLang === 'en') {
      if (tplType === 'confirm') {
        return `Hello ${name}! This is ZüriGlanz Mobile Detailing ✨\n\nYour appointment is officially CONFIRMED:\n📅 Date: ${b.date}\n⏰ Time: ${b.slot}\n📍 Address: ${addr}\n🚗 Vehicle: ${car}\n💳 Estimated Total: ${price} CHF\n\nPlease make sure the parking space next to your car and a power outlet (within 30m) are accessible. See you soon!`;
      }
      if (tplType === 'onway') {
        return `Hello ${name}! 🚗💨 I am now on my way to your location (${addr}) for your ${car} detailing. I will arrive in approx. 15–20 minutes. Best regards, ZüriGlanz`;
      }
      if (tplType === 'done') {
        return `Hello ${name}! ✨ Your ${car} is now completely detailed and ready! Total amount: ${price} CHF (payable via Twint or Cash). Thank you for choosing ZüriGlanz Mobile Detailing!`;
      }
      if (tplType === 'decline') {
        return `Hello ${name}, thank you for your booking request at ZüriGlanz Mobile Detailing. Unfortunately, the requested slot on ${b.date} (${b.slot}) is no longer available. Would another day work for you? Best regards!`;
      }
    }

    // Default German (DE)
    if (tplType === 'confirm') {
      return `Grüezi ${name}! Hier ist ZüriGlanz Mobile Detailing ✨\n\nIhr Termin ist hiermit offiziell BESTÄTIGT:\n📅 Datum: ${b.date}\n⏰ Zeitfenster: ${b.slot} Uhr\n📍 Adresse: ${addr}\n🚗 Fahrzeug: ${car}\n💳 Richtpreis: ${price} CHF\n\nBitte halten Sie den Parkplatz neben Ihrem Fahrzeug sowie den Stromanschluss (max. 30m) frei. Bis bald!`;
    }
    if (tplType === 'onway') {
      return `Grüezi ${name}! 🚗💨 Ich bin jetzt auf dem Weg zu Ihnen (${addr}) für die Aufbereitung Ihres ${car} und in ca. 15–20 Minuten vor Ort. Bis gleich! ZüriGlanz`;
    }
    if (tplType === 'done') {
      return `Grüezi ${name}! ✨ Ihr ${car} ist fertig aufbereitet und glänzt wie neu! Der Gesamtbetrag liegt bei ${price} CHF (Zahlung gerne bequem per Twint oder Bar). Herzlichen Dank für Ihr Vertrauen! ZüriGlanz`;
    }
    if (tplType === 'decline') {
      return `Grüezi ${name}, vielen Dank für Ihre Anfrage bei ZüriGlanz Mobile Detailing. Leider können wir den gewünschten Termin am ${b.date} (${b.slot} Uhr) nicht wahrnehmen. Dürfen wir Ihnen einen alternativen Termin vorschlagen? Beste Grüsse!`;
    }
    return '';
  };

  // Open WhatsApp composer modal for a booking
  const openWhatsAppComposer = (b, defaultType = 'confirm') => {
    setActiveWhatsAppBooking(b);
    setWaTemplateType(defaultType);
    setWaCustomText(generateWhatsAppMessage(b, defaultType, waLang));
  };

  useEffect(() => {
    if (activeWhatsAppBooking) {
      setWaCustomText(generateWhatsAppMessage(activeWhatsAppBooking, waTemplateType, waLang));
    }
  }, [waTemplateType, waLang, activeWhatsAppBooking]);

  const sendWhatsAppNow = async (andConfirmStatus = false) => {
    if (!activeWhatsAppBooking) return;
    if (andConfirmStatus && activeWhatsAppBooking.status !== 'confirmed') {
      await updateBookingStatus(activeWhatsAppBooking.id, 'confirmed');
    }
    if (waTemplateType === 'decline' && activeWhatsAppBooking.status !== 'declined') {
      await updateBookingStatus(activeWhatsAppBooking.id, 'declined');
    }
    const cleanPhone = (activeWhatsAppBooking.client?.phone || '').replace(/\D/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waCustomText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setActiveWhatsAppBooking(null);
  };

  const resetWizard = () => {
    setSubmittedBooking(null);
    setStep(1);
    setCarMakeModel('');
    setClientNotes('');
  };

  const scrollToWizard = () => {
    const el = document.getElementById('booking-wizard');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPricing = () => {
    const el = document.getElementById('pricing-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredBookings = useMemo(() => {
    if (adminFilter === 'all') return bookings;
    return bookings.filter((b) => b.status === adminFilter);
  }, [bookings, adminFilter]);

  const pendingCount = useMemo(
    () => bookings.filter((b) => b.status === 'pending').length,
    [bookings]
  );

  // =====================  ACCOUNTING (owner only)  =====================
  const [expenses, setExpenses] = useState([]);
  const [costPerKm, setCostPerKm] = useState(0.7);
  const [accountingError, setAccountingError] = useState('');
  const [accMonth, setAccMonth] = useState(localDateStr().slice(0, 7));
  const emptyExpense = () => ({
    date: localDateStr(),
    category: 'Матеріали',
    description: '',
    supplier: '',
    amount: '',
    bookingId: ''
  });
  const [expForm, setExpForm] = useState(emptyExpense());

  const loadAccounting = async () => {
    if (isDemoAdmin && !session) return;
    const [exp, set] = await Promise.all([
      supabase.from('expenses').select('*').order('expense_date', { ascending: false }),
      supabase.from('settings').select('cost_per_km').eq('id', 1).maybeSingle()
    ]);
    if (exp.error || set.error) {
      console.error('Accounting load error:', exp.error || set.error);
      setAccountingError(
        'Таблиці обліку недоступні. Виконайте SQL-скрипт для обліку в Supabase (SQL Editor).'
      );
      return;
    }
    setAccountingError('');
    setExpenses(exp.data || []);
    if (set.data) setCostPerKm(Number(set.data.cost_per_km));
  };

  useEffect(() => {
    if (session) loadAccounting();
    else if (!isDemoAdmin) setExpenses([]);
  }, [session, isDemoAdmin]);

  const estimateKm = (b) =>
    Math.round(2 * Number(b.location?.distKmFromBase || 0) * 1.3 * 10) / 10;
  const jobKm = (b) => (b.kmDriven != null ? Number(b.kmDriven) : estimateKm(b));
  const jobPrice = (b) =>
    b.finalPrice != null
      ? Number(b.finalPrice)
      : b.client?.name === 'Inhaber Blockierung'
      ? 0
      : Number(b.totalPrice) || 0;

  const monthMatch = (dateStr) => accMonth === 'all' || (dateStr || '').startsWith(accMonth);

  const accounting = useMemo(() => {
    const linked = {};
    expenses.forEach((e) => {
      if (e.booking_id) linked[e.booking_id] = (linked[e.booking_id] || 0) + Number(e.amount_chf || 0);
    });
    const jobs = bookings
      .filter((b) => b.status === 'confirmed' && monthMatch(b.date))
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .map((b) => {
        const price = jobPrice(b);
        const km = jobKm(b);
        const travel = Math.round(km * costPerKm * 100) / 100;
        const materials = linked[b.id] || 0;
        return { b, price, km, travel, materials, profit: price - travel - materials };
      });
    const monthExpenses = expenses.filter((e) => monthMatch(e.expense_date));
    const revenue = jobs.reduce((a, j) => a + j.price, 0);
    const travel = jobs.reduce((a, j) => a + j.travel, 0);
    const km = jobs.reduce((a, j) => a + j.km, 0);
    const expensesTotal = monthExpenses.reduce((a, e) => a + Number(e.amount_chf || 0), 0);
    const unpaid = jobs.filter((j) => !j.b.paid).reduce((a, j) => a + j.price, 0);
    const byCategory = {};
    monthExpenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount_chf || 0);
    });
    return {
      jobs,
      monthExpenses,
      revenue,
      travel,
      km,
      expensesTotal,
      unpaid,
      byCategory,
      profit: revenue - travel - expensesTotal
    };
  }, [bookings, expenses, costPerKm, accMonth]);

  const shiftMonth = (delta) => {
    const base = accMonth === 'all' ? localDateStr().slice(0, 7) : accMonth;
    const [y, m] = base.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setAccMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };
  const monthLabel =
    accMonth === 'all'
      ? 'Весь період'
      : new Date(Number(accMonth.slice(0, 4)), Number(accMonth.slice(5, 7)) - 1, 1).toLocaleDateString(
          'uk-UA',
          { month: 'long', year: 'numeric' }
        );

  const saveJobField = async (id, patch) => {
    if (isDemoAdmin && !session) {
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== id) return b;
          return {
            ...b,
            finalPrice: patch.final_price !== undefined ? patch.final_price : b.finalPrice,
            kmDriven: patch.km_driven !== undefined ? patch.km_driven : b.kmDriven,
            paymentMethod: patch.payment_method !== undefined ? (patch.payment_method || '') : b.paymentMethod,
            internalNotes: patch.internal_notes !== undefined ? (patch.internal_notes || '') : b.internalNotes,
            paid: patch.paid !== undefined ? patch.paid : b.paid
          };
        })
      );
      return;
    }
    const { error } = await supabase.from('bookings').update(patch).eq('id', id);
    if (error) {
      console.error(error);
      setAccountingError(
        'Не вдалося зберегти: ' + error.message + ' (перевірте, чи виконано SQL для обліку)'
      );
    } else {
      setAccountingError('');
    }
    loadBookings();
  };

  const addExpense = async (e) => {
    e.preventDefault();
    const amount = parseNum(expForm.amount);
    if (!expForm.description.trim() || amount === null || amount < 0) {
      setAccountingError('Заповніть опис і суму (число, наприклад 24.90).');
      return;
    }
    if (isDemoAdmin && !session) {
      setExpenses((prev) => [
        {
          id: 'exp-' + Date.now(),
          expense_date: expForm.date,
          category: expForm.category,
          description: expForm.description.trim(),
          supplier: expForm.supplier.trim() || null,
          amount_chf: amount,
          booking_id: expForm.bookingId || null
        },
        ...prev
      ]);
      setAccountingError('');
      setExpForm({ ...emptyExpense(), date: expForm.date, category: expForm.category });
      return;
    }
    const { error } = await supabase.from('expenses').insert({
      expense_date: expForm.date,
      category: expForm.category,
      description: expForm.description.trim(),
      supplier: expForm.supplier.trim() || null,
      amount_chf: amount,
      booking_id: expForm.bookingId || null
    });
    if (error) {
      console.error(error);
      setAccountingError('Не вдалося додати витрату: ' + error.message);
      return;
    }
    setAccountingError('');
    setExpForm({ ...emptyExpense(), date: expForm.date, category: expForm.category });
    loadAccounting();
  };

  const deleteExpense = async (id) => {
    if (isDemoAdmin && !session) {
      setExpenses((prev) => prev.filter((x) => x.id !== id));
      return;
    }
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) setAccountingError('Не вдалося видалити: ' + error.message);
    loadAccounting();
  };

  const saveCostPerKm = async (value) => {
    const n = parseNum(value);
    if (n === null || n < 0 || n === costPerKm) return;
    if (isDemoAdmin && !session) {
      setCostPerKm(n);
      return;
    }
    const { error } = await supabase.from('settings').update({ cost_per_km: n }).eq('id', 1);
    if (error) setAccountingError('Не вдалося зберегти ставку: ' + error.message);
    else setCostPerKm(n);
  };

  const jobLabel = (b) =>
    `${b.date} · ${b.client?.name || '—'} · ${b.carMakeModel || ''}`.trim();

  const exportJobsCsv = () =>
    downloadCsv(`zuriglanz-zamovlennia-${accMonth}.csv`, [
      ['Дата', 'Час', 'Клієнт', 'Телефон', 'Адреса', 'Авто', 'Ціна CHF', 'Км', 'Дорога CHF', 'Матеріали CHF', 'Прибуток CHF', 'Оплачено', 'Спосіб оплати', 'Нотатки'],
      ...accounting.jobs.map((j) => [
        j.b.date,
        j.b.slot,
        j.b.client?.name,
        j.b.client?.phone,
        `${j.b.location?.street || ''}, ${j.b.location?.plz || ''} ${j.b.location?.city || ''}`,
        `${j.b.carMakeModel || ''} ${j.b.carYear || ''}`.trim(),
        j.price.toFixed(2),
        j.km,
        j.travel.toFixed(2),
        j.materials.toFixed(2),
        j.profit.toFixed(2),
        j.b.paid ? 'так' : 'ні',
        j.b.paymentMethod,
        j.b.internalNotes
      ])
    ]);

  const exportExpensesCsv = () =>
    downloadCsv(`zuriglanz-vytraty-${accMonth}.csv`, [
      ['Дата', 'Категорія', 'Опис', 'Постачальник', 'Сума CHF', 'Замовлення'],
      ...accounting.monthExpenses.map((e) => {
        const jb = bookings.find((x) => x.id === e.booking_id);
        return [e.expense_date, e.category, e.description, e.supplier, Number(e.amount_chf).toFixed(2), jb ? jobLabel(jb) : ''];
      })
    ]);

  const simulateIncomingBooking = () => {
    const sim = {
      id: 'sim-' + Math.floor(1000 + Math.random() * 9000),
      status: 'pending',
      date: getDefaultDate(),
      slot: '14:00 - 18:00',
      createdAt: Date.now(),
      kmDriven: null,
      finalPrice: null,
      paid: false,
      paymentMethod: '',
      internalNotes: '',
      carMakeModel: 'Porsche Macan',
      carYear: '2024',
      bodyTier: 'suv',
      dirtLevel: 'normal',
      addons: ['extractor', 'polish'],
      totalPrice: 275,
      location: {
        street: 'Bahnhofstrasse 19',
        plz: '8180',
        city: 'Bülach',
        distKmFromBase: 18.7
      },
      client: {
        name: 'Lukas Brunner',
        phone: '+41 79 888 77 66',
        email: 'l.brunner@bluewin.ch',
        notes: 'Bitte kurz anrufen bei Ankunft, Schranke wird geöffnet.'
      }
    };
    setBookings((prev) => [sim, ...prev]);
    triggerNewBookingAlert(sim);
  };

  const inputCls =
    'w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400';

  // =========================================================================
  // FULL-SCREEN ANDROID OWNER APP INTERFACE
  // =========================================================================
  if (isAdminMode) {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-sans pb-24 select-none">
        {/* LIVE ANDROID HEADS-UP NOTIFICATION BANNER */}
        {liveAlertBooking && (
          <div className="fixed top-3 inset-x-3 z-50 bg-emerald-950/95 border-2 border-emerald-400 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-bounce">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                  <BellRing className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 block">
                    Нове бронювання щойно надійшло!
                  </span>
                  <h4 className="font-extrabold text-base text-white">
                    {liveAlertBooking.carMakeModel} · {liveAlertBooking.totalPrice} CHF
                  </h4>
                  <p className="text-xs text-emerald-100">
                    {liveAlertBooking.date} ({liveAlertBooking.slot}) · {liveAlertBooking.client?.name} ({liveAlertBooking.location?.city})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLiveAlertBooking(null)}
                className="p-1.5 text-emerald-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                onClick={() => {
                  const b = liveAlertBooking;
                  setLiveAlertBooking(null);
                  setAndroidTab('inbox');
                  openWhatsAppComposer(b, 'confirm');
                }}
                className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Підтвердити у WhatsApp</span>
              </button>
              <button
                onClick={() => {
                  setLiveAlertBooking(null);
                  setAndroidTab('inbox');
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-800 text-white font-bold text-xs"
              >
                Переглянути в списку
              </button>
            </div>
          </div>
        )}

        {/* WHATSAPP COMPOSER MODAL (BOTTOM SHEET FOR ANDROID) */}
        {activeWhatsAppBooking && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-slate-900 border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white">
                      WhatsApp клієнту · {activeWhatsAppBooking.client?.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {activeWhatsAppBooking.client?.phone}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveWhatsAppBooking(null)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Language & Template Selector */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                  {[
                    { id: 'de', label: '🇨🇭 Deutsch' },
                    { id: 'en', label: '🇬🇧 English' }
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setWaLang(l.id)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition ${
                        waLang === l.id ? 'bg-white text-slate-950' : 'text-slate-400'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-400">
                  {activeWhatsAppBooking.date} · {activeWhatsAppBooking.slot}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'confirm', label: '✅ Підтвердження броні' },
                  { id: 'onway', label: '🚗 Виїжджаю (15-20 хв)' },
                  { id: 'done', label: '✨ Авто готове + Оплата' },
                  { id: 'decline', label: '❌ Перенесення / Відмова' }
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setWaTemplateType(tpl.id)}
                    className={`p-2.5 rounded-xl border text-left font-bold transition ${
                      waTemplateType === tpl.id
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                        : 'border-slate-700 bg-slate-800/70 text-slate-300'
                    }`}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1.5">
                  Текст повідомлення (можна відредагувати перед відправкою):
                </label>
                <textarea
                  rows={6}
                  value={waCustomText}
                  onChange={(e) => setWaCustomText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400 leading-relaxed"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                {waTemplateType === 'confirm' && activeWhatsAppBooking.status !== 'confirmed' && (
                  <button
                    type="button"
                    onClick={() => sendWhatsAppNow(true)}
                    className="flex-1 py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950"
                  >
                    <CheckCheck className="w-5 h-5" />
                    <span>Підтвердити в базі + Відкрити WhatsApp</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => sendWhatsAppNow(false)}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>Відправити у WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ANDROID APP TOP STATUS BAR */}
        <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#D52B1E] flex items-center justify-center text-white font-extrabold shadow-sm">
                ZG
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight">
                    ZüriGlanz Android
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-slate-400">
                  {isDemoAdmin && !session ? 'Демо-режим прев’ю' : 'Supabase Live підключено'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={simulateIncomingBooking}
                title="Тест нового замовлення"
                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1 hover:bg-emerald-500/25"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Тест пушу</span>
              </button>

              <button
                onClick={() => {
                  loadBookings(false);
                  loadAccounting();
                }}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                title="Оновити"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsAdminMode(false)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1"
                title="На сайт для клієнтів"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Сайт</span>
              </button>
            </div>
          </div>
        </header>

        {/* ANDROID APP MAIN BODY */}
        <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
          {accountingError && (
            <div className="bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs rounded-xl px-4 py-3">
              {accountingError}
            </div>
          )}

          {/* TAB 1: INBOX & BOOKINGS */}
          {androidTab === 'inbox' && (
            <div className="space-y-4">
              {/* Quick KPI Strip */}
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => setAdminFilter('pending')}
                  className={`p-3 rounded-2xl border text-left transition ${
                    adminFilter === 'pending'
                      ? 'bg-amber-500/20 border-amber-400'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <span className="text-[11px] text-slate-400 block">Нові заявки</span>
                  <span className="text-2xl font-extrabold text-amber-400">{pendingCount}</span>
                </button>
                <button
                  onClick={() => setAdminFilter('confirmed')}
                  className={`p-3 rounded-2xl border text-left transition ${
                    adminFilter === 'confirmed'
                      ? 'bg-emerald-500/20 border-emerald-400'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <span className="text-[11px] text-slate-400 block">Підтверджено</span>
                  <span className="text-2xl font-extrabold text-emerald-400">
                    {bookings.filter((b) => b.status === 'confirmed').length}
                  </span>
                </button>
                <button
                  onClick={() => setAndroidTab('finance')}
                  className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-left"
                >
                  <span className="text-[11px] text-slate-400 block">Прибуток (міс.)</span>
                  <span className="text-lg font-extrabold text-white">
                    {Math.round(accounting.profit)} CHF
                  </span>
                </button>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: `Всі (${bookings.length})` },
                  { id: 'pending', label: `Очікують (${pendingCount})` },
                  {
                    id: 'confirmed',
                    label: `Підтверджені (${bookings.filter((b) => b.status === 'confirmed').length})`
                  },
                  {
                    id: 'declined',
                    label: `Відхилені (${bookings.filter((b) => b.status === 'declined').length})`
                  }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAdminFilter(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
                      adminFilter === tab.id
                        ? 'bg-white text-slate-950'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Quick Slot Blocker Bar */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={() => handleManualBlockSlot(selectedDate, '08:00 - 12:00')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold text-emerald-300"
                  >
                    + Блок 08–12
                  </button>
                  <button
                    onClick={() => handleManualBlockSlot(selectedDate, '14:00 - 18:00')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold text-sky-300"
                  >
                    + Блок 14–18
                  </button>
                </div>
              </div>

              {/* Booking Cards */}
              {filteredBookings.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
                  Немає бронювань у цій категорії.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredBookings.map((b) => (
                    <div
                      key={b.id}
                      className={`bg-slate-900 rounded-2xl p-4 border space-y-3.5 ${
                        b.status === 'pending'
                          ? 'border-amber-500/60 shadow-lg shadow-amber-950/20'
                          : 'border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span
                            className={`inline-block text-[11px] font-extrabold px-2.5 py-0.5 rounded-full mb-1.5 ${
                              b.status === 'confirmed'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : b.status === 'declined'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {b.status === 'confirmed'
                              ? '✓ Підтверджено'
                              : b.status === 'declined'
                              ? '✕ Відхилено'
                              : '⏳ Очікує підтвердження'}
                          </span>
                          <h3 className="font-extrabold text-base text-white">
                            {b.carMakeModel} {b.carYear ? `(${b.carYear})` : ''}
                          </h3>
                          <p className="text-xs text-emerald-400 font-bold">
                            📅 {b.date} · ⏰ {b.slot}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-extrabold text-white">
                            {jobPrice(b)} CHF
                          </span>
                          {b.paid && (
                            <span className="block text-[10px] font-extrabold text-emerald-400 uppercase">
                              ✓ Оплачено ({b.paymentMethod || 'Twint'})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Address + Google Maps Navigation Button */}
                      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2">
                        <div className="text-xs">
                          <div className="font-bold text-white">
                            {b.location?.street}, {b.location?.plz} {b.location?.city}
                          </div>
                          {b.location?.distKmFromBase != null && (
                            <div className="text-slate-400 mt-0.5">
                              Відстань: ~{b.location.distKmFromBase} км в один бік (≈ {estimateKm(b)} км туди-назад)
                            </div>
                          )}
                        </div>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                            `${b.location?.street}, ${b.location?.plz} ${b.location?.city}, Switzerland`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-300 font-bold text-xs flex items-center gap-1.5 shrink-0"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>Маршрут</span>
                        </a>
                      </div>

                      {/* Client + Addons + Notes */}
                      <div className="text-xs space-y-1.5 text-slate-300">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{b.client?.name}</span>
                          <a
                            href={`tel:${b.client?.phone}`}
                            className="text-emerald-400 font-mono font-bold underline flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {b.client?.phone}
                          </a>
                        </div>
                        <div>
                          <span className="text-slate-400">Опції: </span>
                          <span className="font-semibold text-white">
                            {b.addons?.length ? b.addons.join(', ') : 'Базовий пакет (150 CHF)'}
                          </span>
                        </div>
                        {b.client?.notes && (
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                            <strong>Побажання клієнта:</strong> {b.client.notes}
                          </div>
                        )}
                      </div>

                      {/* Primary Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => openWhatsAppComposer(b, 'confirm')}
                          className="col-span-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>
                            {b.status === 'confirmed'
                              ? 'Написати клієнту у WhatsApp (Шаблони)'
                              : 'Підтвердити бронь + Відправити WhatsApp'}
                          </span>
                        </button>

                        {b.status !== 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => updateBookingStatus(b.id, 'confirmed')}
                            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1"
                          >
                            <Check className="w-4 h-4" />
                            <span>Підтвердити без WA</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setEditingJobId(b.id);
                            setAndroidTab('jobs');
                          }}
                          className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs flex items-center justify-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Внести км / оплату</span>
                        </button>

                        {b.status !== 'declined' && (
                          <button
                            type="button"
                            onClick={() => openWhatsAppComposer(b, 'decline')}
                            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-amber-950 text-amber-300 font-bold text-xs flex items-center justify-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Відхилити</span>
                          </button>
                        )}

                        {deleteConfirmId === b.id ? (
                          <button
                            type="button"
                            onClick={() => deleteBooking(b.id)}
                            className="py-2.5 px-3 rounded-xl bg-red-600 text-white font-extrabold text-xs"
                          >
                            Підтвердити видалення?
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(b.id)}
                            className="py-2.5 px-3 rounded-xl bg-slate-800/60 text-slate-400 hover:text-red-400 font-semibold text-xs"
                          >
                            Видалити
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: JOBS DETAILS (DISTANCE, FINAL PRICE, PAYMENT METHOD, NOTES) */}
          {androidTab === 'jobs' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <h2 className="font-extrabold text-base">Робочий журнал замовлень</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Вводь фактичну суму, кілометраж туди-назад та тип оплати (Twint, Готівка тощо). Усі зміни миттєво зберігаються в базу даних Supabase.
                </p>
              </div>

              {bookings.filter((b) => b.status === 'confirmed').length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
                  Ще немає підтверджених замовлень. Спочатку підтвердь заявку у вкладці «Заявки».
                </div>
              ) : (
                bookings
                  .filter((b) => b.status === 'confirmed')
                  .map((b) => {
                    const est = estimateKm(b);
                    const curKm = jobKm(b);
                    const curPrice = jobPrice(b);
                    const travelChf = Math.round(curKm * costPerKm * 100) / 100;
                    const matChf = expenses
                      .filter((e) => e.booking_id === b.id)
                      .reduce((s, e) => s + Number(e.amount_chf || 0), 0);
                    const netProfit = curPrice - travelChf - matChf;

                    return (
                      <div
                        key={b.id}
                        className={`bg-slate-900 rounded-2xl p-4 border space-y-4 ${
                          editingJobId === b.id ? 'border-emerald-400' : 'border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-emerald-400">
                              {b.date} · {b.slot}
                            </div>
                            <h3 className="font-extrabold text-base text-white">
                              {b.client?.name} · {b.carMakeModel}
                            </h3>
                            <p className="text-xs text-slate-400">
                              {b.location?.street}, {b.location?.plz} {b.location?.city}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] text-slate-400 block">Чистий прибуток</span>
                            <span
                              className={`text-lg font-extrabold ${
                                netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                              }`}
                            >
                              {chf(netProfit)} CHF
                            </span>
                          </div>
                        </div>

                        {/* Mobile Inputs for Price & Km */}
                        <div className="grid grid-cols-2 gap-3">
                          <label className="space-y-1 text-xs">
                            <span className="text-slate-400 font-semibold">Фінальна сума (CHF)</span>
                            <input
                              key={`${b.id}-price-${b.finalPrice ?? ''}`}
                              defaultValue={b.finalPrice ?? ''}
                              placeholder={String(curPrice)}
                              inputMode="decimal"
                              onBlur={(e) => {
                                const v =
                                  e.target.value.trim() === '' ? null : parseNum(e.target.value);
                                if (v !== (b.finalPrice != null ? Number(b.finalPrice) : null)) {
                                  saveJobField(b.id, { final_price: v });
                                }
                              }}
                              className={inputCls}
                            />
                          </label>

                          <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 font-semibold">Км (туди-назад)</span>
                              <button
                                type="button"
                                onClick={() => saveJobField(b.id, { km_driven: est })}
                                className="text-[11px] text-emerald-400 font-bold underline"
                              >
                                Авто ({est} км)
                              </button>
                            </div>
                            <input
                              key={`${b.id}-km-${b.kmDriven ?? ''}`}
                              defaultValue={b.kmDriven ?? ''}
                              placeholder={`≈ ${est}`}
                              inputMode="decimal"
                              onBlur={(e) => {
                                const v =
                                  e.target.value.trim() === '' ? null : parseNum(e.target.value);
                                if (v !== (b.kmDriven != null ? Number(b.kmDriven) : null)) {
                                  saveJobField(b.id, { km_driven: v });
                                }
                              }}
                              className={inputCls}
                            />
                          </div>
                        </div>

                        {/* 1-Tap Payment Method Chips */}
                        <div className="space-y-1.5">
                          <span className="text-xs text-slate-400 font-semibold block">
                            Тип оплати (натисни для збереження):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {PAYMENT_METHODS.map((pm) => (
                              <button
                                key={pm}
                                type="button"
                                onClick={() =>
                                  saveJobField(b.id, {
                                    payment_method: pm,
                                    paid: true
                                  })
                                }
                                className={`px-3 py-2 rounded-xl text-xs font-extrabold border transition ${
                                  b.paymentMethod === pm
                                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                    : 'bg-slate-950 text-slate-300 border-slate-700'
                                }`}
                              >
                                {pm}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Paid Toggle + Internal Notes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                          <button
                            type="button"
                            onClick={() => saveJobField(b.id, { paid: !b.paid })}
                            className={`py-2.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 border transition ${
                              b.paid
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                : 'bg-slate-950 border-slate-700 text-amber-300'
                            }`}
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>{b.paid ? '✓ Замовлення ОПЛАЧЕНО' : 'Позначити як оплачене'}</span>
                          </button>

                          <input
                            key={`${b.id}-note-${b.internalNotes}`}
                            defaultValue={b.internalNotes}
                            placeholder="Нотатка (чайові, хімія, інше)..."
                            onBlur={(e) => {
                              if (e.target.value !== b.internalNotes) {
                                saveJobField(b.id, { internal_notes: e.target.value || null });
                              }
                            }}
                            className={inputCls}
                          />
                        </div>

                        {/* Quick WhatsApp "Car is Ready" & Expense Link */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                          <span className="text-slate-400">
                            Дорога: <b>{chf(travelChf)} CHF</b> · Матеріали: <b>{chf(matChf)} CHF</b>
                          </span>
                          <button
                            type="button"
                            onClick={() => openWhatsAppComposer(b, 'done')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WA: Авто готове</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          )}

          {/* TAB 3: EXPENSES (FAST MOBILE LOGGER) */}
          {androidTab === 'expenses' && (
            <div className="space-y-4">
              <form
                onSubmit={addExpense}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3"
              >
                <h2 className="font-extrabold text-base flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span>Швидке внесення витрати</span>
                </h2>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <label className="space-y-1">
                    <span className="text-slate-400">Сума (CHF) *</span>
                    <input
                      value={expForm.amount}
                      onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })}
                      inputMode="decimal"
                      placeholder="24.90"
                      className={inputCls}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-slate-400">Дата</span>
                    <input
                      type="date"
                      value={expForm.date}
                      onChange={(e) => setExpForm({ ...expForm, date: e.target.value })}
                      className={inputCls}
                    />
                  </label>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-slate-400">Категорія</span>
                  <div className="flex flex-wrap gap-1.5">
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setExpForm({ ...expForm, category: cat })}
                        className={`px-3 py-1.5 rounded-xl font-bold border transition ${
                          expForm.category === cat
                            ? 'bg-white text-slate-950 border-white'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <label className="space-y-1">
                    <span className="text-slate-400">Що куплено *</span>
                    <input
                      value={expForm.description}
                      onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                      placeholder="Waterless-концентрат, мікрофібра..."
                      className={inputCls}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-slate-400">Магазин / Постачальник</span>
                    <input
                      value={expForm.supplier}
                      onChange={(e) => setExpForm({ ...expForm, supplier: e.target.value })}
                      placeholder="Galaxus / Jumbo / Coop"
                      className={inputCls}
                    />
                  </label>
                </div>

                <label className="space-y-1 text-xs block">
                  <span className="text-slate-400">Прив'язати до конкретного авто (необов'язково)</span>
                  <select
                    value={expForm.bookingId}
                    onChange={(e) => setExpForm({ ...expForm, bookingId: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">Загальна витрата бізнесу</option>
                    {bookings
                      .filter((b) => b.status === 'confirmed')
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {jobLabel(b)}
                        </option>
                      ))}
                  </select>
                </label>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition shadow-lg"
                >
                  + Зберегти витрату в базу
                </button>
              </form>

              {/* Expense List */}
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-slate-300 px-1">
                  Історія витрат ({accounting.monthExpenses.length})
                </h3>
                {accounting.monthExpenses.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
                    У вибраному періоді витрат ще немає.
                  </div>
                ) : (
                  accounting.monthExpenses.map((e) => {
                    const jb = bookings.find((x) => x.id === e.booking_id);
                    return (
                      <div
                        key={e.id}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-white truncate">
                            {e.description}
                          </div>
                          <div className="text-xs text-slate-400">
                            {e.expense_date} · {e.category}
                            {e.supplier ? ` · ${e.supplier}` : ''}
                            {jb ? ` · 🚗 ${jb.carMakeModel}` : ''}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-extrabold text-sm text-amber-300">
                            −{chf(e.amount_chf)} CHF
                          </span>
                          <button
                            onClick={() => deleteExpense(e.id)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 4: FINANCE & ANALYTICS */}
          {androidTab === 'finance' && (
            <div className="space-y-4">
              {/* Month Picker */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
                <button
                  onClick={() => shiftMonth(-1)}
                  className="p-2 rounded-xl bg-slate-800 text-white font-bold"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <span className="text-xs text-slate-400 block">Період звіту</span>
                  <span className="font-extrabold text-sm capitalize">{monthLabel}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => shiftMonth(1)}
                    className="p-2 rounded-xl bg-slate-800 text-white font-bold"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setAccMonth(accMonth === 'all' ? localDateStr().slice(0, 7) : 'all')
                    }
                    className="px-2.5 py-2 rounded-xl bg-slate-800 text-xs font-bold text-emerald-300"
                  >
                    {accMonth === 'all' ? 'Місяць' : 'Весь час'}
                  </button>
                </div>
              </div>

              {/* Financial Summary Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 bg-gradient-to-br from-emerald-950 to-slate-900 border border-emerald-500/40 rounded-2xl p-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Чистий прибуток (Netto)
                  </span>
                  <div className="text-3xl font-extrabold text-white mt-1">
                    {chf(accounting.profit)} CHF
                  </div>
                  <div className="text-xs text-slate-300 mt-2 flex flex-wrap gap-3">
                    <span>Виконано авто: <b>{accounting.jobs.length}</b></span>
                    <span>Пробіг: <b>{Math.round(accounting.km)} км</b></span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <span className="text-xs text-slate-400 block">Загальна каса (Дохід)</span>
                  <span className="text-xl font-extrabold text-white">
                    {chf(accounting.revenue)} CHF
                  </span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <span className="text-xs text-slate-400 block">Очікує оплати</span>
                  <span className="text-xl font-extrabold text-sky-400">
                    {chf(accounting.unpaid)} CHF
                  </span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <span className="text-xs text-slate-400 block">Витрати на дорогу</span>
                  <span className="text-lg font-extrabold text-amber-300">
                    −{chf(accounting.travel)} CHF
                  </span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <span className="text-xs text-slate-400 block">Матеріали та інше</span>
                  <span className="text-lg font-extrabold text-amber-300">
                    −{chf(accounting.expensesTotal)} CHF
                  </span>
                </div>
              </div>

              {/* Cost Per Km & CSV Export */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-semibold">
                    Вартість 1 км пробігу (пальне + амортизація CHF):
                  </span>
                  <input
                    key={`cpk-${costPerKm}`}
                    defaultValue={costPerKm}
                    inputMode="decimal"
                    onBlur={(e) => saveCostPerKm(e.target.value)}
                    className="w-20 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-center font-bold text-sm text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
                  <button
                    onClick={exportJobsCsv}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Експорт замовлень (CSV)</span>
                  </button>
                  <button
                    onClick={exportExpensesCsv}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4 text-sky-400" />
                    <span>Експорт витрат (CSV)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ANDROID NOTIFICATIONS & PWA SETUP */}
          {androidTab === 'settings' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                    <BellRing className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">Сповіщення про нові бронювання</h3>
                    <p className="text-xs text-slate-400">
                      Звуковий сигнал, вібрація та системні Android Push-нотифікації
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-bold">Системні Push-сповіщення Android</span>
                  {notifPermission === 'granted' ? (
                    <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Активовано
                    </span>
                  ) : (
                    <button
                      onClick={requestAndroidNotificationPermission}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-extrabold text-xs"
                    >
                      Увімкнути Push
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-bold">Звуковий сигнал при новій заявці</span>
                  <button
                    onClick={() => {
                      const next = !soundEnabled;
                      setSoundEnabled(next);
                      if (next) playNotificationSound();
                    }}
                    className={`px-3 py-1.5 rounded-lg font-extrabold text-xs ${
                      soundEnabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {soundEnabled ? '🔊 Увімкнено' : '🔇 Вимкнено'}
                  </button>
                </div>

                <button
                  onClick={simulateIncomingBooking}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-extrabold text-emerald-300 flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>Протестувати надходження нового бронювання</span>
                </button>
              </div>

              {/* How to install on Android Home Screen */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2.5 text-sky-400 font-extrabold text-sm">
                  <Smartphone className="w-5 h-5" />
                  <span>Як встановити як додаток на Android (за 10 секунд)</span>
                </div>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>
                    Відкрий свій сайт на телефоні з параметром:{' '}
                    <code className="bg-slate-950 px-2 py-0.5 rounded text-emerald-300">
                      ?admin=1
                    </code>
                  </li>
                  <li>
                    У браузері <b>Google Chrome</b> на Android натисни меню <b>⋮ (три крапки)</b> у правому верхньому кутку.
                  </li>
                  <li>
                    Вибери <b>«Додати на головний екран» (Install App / Установити додаток)</b>.
                  </li>
                  <li>
                    На екрані телефону з'явиться іконка <b>ZüriGlanz</b> — вона відкривається на весь екран як рідний Android-додаток і тримає з'єднання із Supabase!
                  </li>
                </ol>
              </div>

              <button
                onClick={async () => {
                  if (session) await supabase.auth.signOut();
                  setIsDemoAdmin(false);
                  setIsAdminMode(false);
                }}
                className="w-full py-3.5 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-300 font-extrabold text-xs flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Вийти з акаунту власника</span>
              </button>
            </div>
          )}
        </main>

        {/* ANDROID BOTTOM NAVIGATION BAR */}
        <nav className="fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5">
          <div className="max-w-2xl mx-auto grid grid-cols-5 gap-1">
            {[
              { id: 'inbox', icon: Bell, label: 'Заявки', badge: pendingCount },
              { id: 'jobs', icon: Wrench, label: 'Роботи' },
              { id: 'expenses', icon: Receipt, label: 'Витрати' },
              { id: 'finance', icon: TrendingUp, label: 'Каса' },
              { id: 'settings', icon: Smartphone, label: 'Додаток' }
            ].map((item) => {
              const IconComp = item.icon;
              const active = androidTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setAndroidTab(item.id)}
                  className={`relative py-2 rounded-xl flex flex-col items-center justify-center gap-1 transition ${
                    active ? 'text-emerald-400 bg-slate-800/90' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <IconComp className="w-5 h-5" />
                  <span className="text-[10px] font-extrabold">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="absolute top-1 right-3 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D52B1E] text-white text-[10px] font-extrabold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    );
  }

  // =========================================================================
  // PUBLIC CUSTOMER BOOKING WEBSITE (DE / EN)
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-600 selection:text-white">
      {/* PIN / SUPABASE LOGIN MODAL FOR OWNER */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Smartphone className="w-5 h-5 text-[#D52B1E]" />
                <span>ZüriGlanz · Android App Login</span>
              </div>
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setPinError('');
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Вхід у мобільний кабінет власника (Supabase Auth):
            </p>
            <form onSubmit={handlePinLogin} className="space-y-3">
              <input
                type="email"
                autoFocus
                autoComplete="username"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="E-Mail власника"
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
              />
              <input
                type="password"
                autoComplete="current-password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Пароль"
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
              />
              {pinError && <p className="text-xs text-red-600 font-semibold">{pinError}</p>}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition"
              >
                Увійти в Android-кабінет
              </button>
            </form>

            <div className="pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={enterDemoOwnerApp}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Smartphone className="w-4 h-4" />
                <span>Відкрити Android-додаток (Прев’ю / Тест-режим)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white relative shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D52B1E] rounded-full flex items-center justify-center text-[10px] font-bold text-white leading-none">
                +
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-lg text-slate-900">ZüriGlanz</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  Zürich + 30 km
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">{t.brandSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              {['de', 'en'].map((code) => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md uppercase transition-all ${
                    lang === code
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-14 sm:py-20 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-emerald-300">
              <Leaf className="w-3.5 h-3.5" />
              <span>{t.heroBadge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              {t.heroTitle}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              {t.heroDesc}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={scrollToWizard}
                className="px-6 py-3.5 rounded-xl bg-[#D52B1E] hover:bg-red-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-red-950/50 flex items-center gap-2 transition"
              >
                <Calendar className="w-4 h-4" />
                <span>{t.bookNowBtn}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={scrollToPricing}
                className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm sm:text-base border border-white/15 transition"
              >
                {t.viewPackagesBtn}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3.5">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                <Clock className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-xl font-extrabold">{t.statsTime}</div>
                <div className="text-xs text-slate-400">{t.statsTimeSub}</div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-xl font-extrabold">{t.statsBase}</div>
                <div className="text-xs text-slate-400">{t.statsBaseSub}</div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                <Droplets className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <div className="text-xl font-extrabold">{t.statsEco}</div>
                <div className="text-xs text-slate-400">{t.statsEcoSub}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING & SERVICES OVERVIEW */}
      <section id="pricing-section" className="py-12 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {t.pricingTitle}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">{t.pricingSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Base Package Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl border-2 border-slate-900 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-5 border-b border-slate-200">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D52B1E]">
                    All-In-One Pauschale
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                    {t.basePackageTitle}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{t.basePackageTime}</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {t.basePackagePrice}
                  </span>
                  <span className="block text-[11px] text-slate-500">Basispreis</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t.includedInterior}
                  </h4>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{t.intItem1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{t.intItem2}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{t.intItem3}</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t.includedExterior}
                  </h4>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <span>{t.extItem1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <span>{t.extItem2}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <span>{t.extItem3}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                2 exklusive Slots pro Tag: 08:00–12:00 & 14:00–18:00
              </span>
              <button
                onClick={scrollToWizard}
                className="text-xs font-bold text-slate-900 hover:text-[#D52B1E] flex items-center gap-1"
              >
                <span>Jetzt konfigurieren</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Addons & Size Tiers */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 mb-3">{t.addonsTitle}</h3>
              <div className="space-y-3">
                {ADDONS.map((a) => (
                  <div
                    key={a.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">
                        {t[a.titleKey]}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{t[a.descKey]}</div>
                    </div>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-slate-900 text-white shrink-0">
                      +{a.price} CHF
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                {t.sizeTierTitle}
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                {BODY_TIERS.map((tier) => (
                  <div
                    key={tier.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="font-semibold text-slate-800 line-clamp-1">
                      {t[tier.labelKey]}
                    </div>
                    <div className="font-extrabold text-slate-900 mt-1">
                      {tier.price === 0 ? 'Inkl.' : `+${tier.price} CHF`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE 5-STEP BOOKING WIZARD */}
      <section id="booking-wizard" className="py-8 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Wizard Top Bar */}
          <div className="bg-slate-900 text-white p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  ZüriGlanz Online-Buchung
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold mt-0.5">{t.wizardTitle}</h2>
              </div>
              <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 text-right">
                <span className="text-[11px] text-slate-300 block">{t.priceSummary}</span>
                <span className="text-2xl font-extrabold text-white">{totalPrice} CHF</span>
              </div>
            </div>

            {/* Stepper Progress Pills */}
            <div className="grid grid-cols-5 gap-2 mt-6">
              {[
                { num: 1, label: t.step1Label },
                { num: 2, label: t.step2Label },
                { num: 3, label: t.step3Label },
                { num: 4, label: t.step4Label },
                { num: 5, label: t.step5Label }
              ].map((item) => (
                <div key={item.num} className="space-y-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      step >= item.num ? 'bg-[#D52B1E]' : 'bg-slate-700'
                    }`}
                  />
                  <span
                    className={`hidden sm:block text-[11px] font-semibold truncate ${
                      step === item.num ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Wizard Content Body */}
          <div className="p-6 sm:p-8">
            {submittedBooking ? (
              <div className="text-center py-8 space-y-5 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  {t.bookingSuccessTitle}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{t.bookingSuccessText}</p>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left text-xs sm:text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-bold text-amber-600">{t.statusPending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Datum & Zeit:</span>
                    <span className="font-bold text-slate-900">
                      {submittedBooking.date} ({submittedBooking.slot})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fahrzeug:</span>
                    <span className="font-bold text-slate-900">
                      {submittedBooking.carMakeModel} ({submittedBooking.carYear})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Einsatzort:</span>
                    <span className="font-bold text-slate-900">
                      {submittedBooking.location.street}, {submittedBooking.location.plz}{' '}
                      {submittedBooking.location.city}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="text-slate-500">Richtpreis:</span>
                    <span className="font-extrabold text-base text-slate-900">
                      {submittedBooking.totalPrice} CHF
                    </span>
                  </div>
                </div>

                <button
                  onClick={resetWizard}
                  className="px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition"
                >
                  {t.newBookingBtn}
                </button>
              </div>
            ) : (
              <>
                {/* STEP 1: 3 MANDATORY GATEKEEPER QUESTIONS */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">{t.gateTitle}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">{t.gateSubtitle}</p>
                    </div>

                    <div className="space-y-4">
                      {[
                        {
                          icon: Car,
                          title: t.q1Title,
                          desc: t.q1Desc,
                          val: hasParking,
                          setter: setHasParking
                        },
                        {
                          icon: Volume2,
                          title: t.q2Title,
                          desc: t.q2Desc,
                          val: noiseOk,
                          setter: setNoiseOk
                        },
                        {
                          icon: Zap,
                          title: t.q3Title,
                          desc: t.q3Desc,
                          val: hasPower30m,
                          setter: setHasPower30m
                        }
                      ].map((q, idx) => {
                        const IconComponent = q.icon;
                        return (
                          <div
                            key={idx}
                            className={`p-4 sm:p-5 rounded-2xl border transition ${
                              q.val === true
                                ? 'border-emerald-500 bg-emerald-50/20'
                                : q.val === false
                                ? 'border-red-300 bg-red-50/30'
                                : 'border-slate-200 bg-slate-50/60'
                            }`}
                          >
                            <div className="flex items-start gap-3.5">
                              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-sm sm:text-base text-slate-900">
                                  {q.title}
                                </h4>
                                <p className="text-xs sm:text-sm text-slate-600 mt-1">{q.desc}</p>
                                <div className="flex flex-wrap gap-2.5 mt-3.5">
                                  <button
                                    type="button"
                                    onClick={() => q.setter(true)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                                      q.val === true
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                    }`}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>{t.yesOption}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => q.setter(false)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                                      q.val === false
                                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                    }`}
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>{t.noOption}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {hasAnyNoStep1 && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs sm:text-sm">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>{t.gateBlockedMsg}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2: EXTERIOR DIRTINESS & ENVIRONMENTAL DISCLAIMER */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">{t.envTitle}</h3>
                    </div>

                    <div className="p-5 rounded-xl bg-emerald-950 text-emerald-50 border border-emerald-800 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                        <Leaf className="w-4 h-4 shrink-0" />
                        <span>{t.envDisclaimerTitle}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                        {t.envDisclaimerText}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-slate-800">
                        {t.dirtLevelLabel}
                      </label>
                      <div className="grid grid-cols-1 gap-2.5">
                        {[
                          { id: 'light', label: t.dirtLight, badge: 'Optimal' },
                          { id: 'normal', label: t.dirtNormal, badge: 'Standard' },
                          { id: 'heavy', label: t.dirtHeavy, badge: 'Blockiert (Umwelt)' }
                        ].map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setDirtLevel(d.id)}
                            className={`p-4 rounded-xl border text-left flex items-center justify-between transition ${
                              dirtLevel === d.id
                                ? d.id === 'heavy'
                                  ? 'border-red-600 bg-red-600 text-white'
                                  : 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                            }`}
                          >
                            <span className="text-sm font-semibold">{d.label}</span>
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                dirtLevel === d.id
                                  ? 'bg-white/20 text-white'
                                  : d.id === 'heavy'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {d.badge}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {dirtLevel === 'heavy' && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-900 text-xs sm:text-sm font-medium">
                        <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <span>{t.heavyDirtBlockedMsg}</span>
                      </div>
                    )}

                    <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-300 bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ecoDisclaimerAccepted}
                        onChange={(e) => setEcoDisclaimerAccepted(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-slate-900 rounded"
                      />
                      <span className="text-xs sm:text-sm font-medium text-slate-800">
                        {t.heavyDirtConfirm}
                      </span>
                    </label>
                  </div>
                )}

                {/* STEP 3: VEHICLE TYPE, YEAR & ADD-ONS */}
                {step === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                      {t.carDetailsTitle}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2 relative">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold uppercase text-slate-500">
                            {t.carMakeLabel}
                          </label>
                          {isCarMakeValid && (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> OK
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={carMakeModel}
                          onFocus={() => setShowCarSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowCarSuggestions(false), 180)}
                          onChange={(e) => applyCarModel(e.target.value)}
                          placeholder={t.carMakePlaceholder}
                          className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none ${
                            carMakeModel.length > 0 && !isCarMakeValid
                              ? 'border-red-400 bg-red-50/30'
                              : isCarMakeValid
                              ? 'border-emerald-500 bg-emerald-50/10'
                              : 'border-slate-300 focus:border-slate-900'
                          }`}
                        />
                        {showCarSuggestions && (
                          <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                            {POPULAR_CAR_MAKES.filter((m) =>
                              m.toLowerCase().includes(carMakeModel.toLowerCase())
                            ).map((make) => (
                              <button
                                key={make}
                                type="button"
                                onMouseDown={() => {
                                  applyCarModel(make);
                                  setShowCarSuggestions(false);
                                }}
                                className="w-full text-left px-4 py-2 text-xs sm:text-sm hover:bg-slate-100 flex items-center justify-between"
                              >
                                <span className="font-medium text-slate-800">{make}</span>
                                <Car className="w-3.5 h-3.5 text-slate-400" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold uppercase text-slate-500">
                            {t.carYearLabel}
                          </label>
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> OK
                          </span>
                        </div>
                        <select
                          value={carYear}
                          onChange={(e) => setCarYear(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-emerald-500 bg-white text-sm font-semibold focus:outline-none focus:border-slate-900"
                        >
                          {YEAR_OPTIONS.map((yr) => (
                            <option key={yr} value={yr}>
                              {yr}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <label className="block text-xs font-bold uppercase text-slate-500">
                        {t.selectBodyType}
                      </label>
                      {detectedTier && !tierManual && (
                        <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          {lang === 'de' ? 'Automatisch erkannt: ' : 'Detected automatically: '}
                          {t[BODY_TIERS.find((x) => x.id === detectedTier).labelKey]} (
                          {BODY_TIERS.find((x) => x.id === detectedTier).price === 0
                            ? lang === 'de'
                              ? 'inkl.'
                              : 'incl.'
                            : `+${BODY_TIERS.find((x) => x.id === detectedTier).price} CHF`}
                          ){' · '}
                          {lang === 'de' ? 'bei Bedarf unten ändern' : 'change below if needed'}
                        </p>
                      )}
                      {isCarMakeValid && !tierConfirmed && (
                        <p className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          {lang === 'de'
                            ? 'Dieses Modell kennen wir noch nicht. Bitte wählen Sie unten die passende Fahrzeugkategorie.'
                            : 'We do not know this model yet. Please select the matching vehicle category below.'}
                        </p>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {BODY_TIERS.map((tier) => (
                          <button
                            key={tier.id}
                            type="button"
                            onClick={() => {
                              setBodyTier(tier.id);
                              setTierManual(true);
                            }}
                            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                              tierConfirmed && bodyTier === tier.id
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            <div>
                              <div className="font-bold text-sm">{t[tier.labelKey]}</div>
                              <div
                                className={`text-[11px] mt-0.5 ${
                                  tierConfirmed && bodyTier === tier.id ? 'text-slate-300' : 'text-slate-500'
                                }`}
                              >
                                {tier.example}
                              </div>
                            </div>
                            <div className="mt-3 text-xs font-extrabold">
                              {tier.price === 0 ? '150 CHF Basis' : `+${tier.price} CHF`}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <label className="block text-xs font-bold uppercase text-slate-500">
                        {t.selectAddons}
                      </label>
                      <div className="space-y-2.5">
                        {ADDONS.map((addon) => {
                          const isChecked = selectedAddons.includes(addon.id);
                          return (
                            <div
                              key={addon.id}
                              onClick={() => toggleAddon(addon.id)}
                              className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between gap-4 ${
                                isChecked
                                  ? 'border-slate-900 bg-slate-50'
                                  : 'border-slate-200 bg-white hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                  className="mt-1 w-4 h-4 accent-slate-900"
                                />
                                <div>
                                  <div className="font-bold text-sm text-slate-900">
                                    {t[addon.titleKey]}
                                  </div>
                                  <div className="text-xs text-slate-500">{t[addon.descKey]}</div>
                                </div>
                              </div>
                              <span className="font-extrabold text-sm text-slate-900 whitespace-nowrap">
                                +{addon.price} CHF
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: DATE & 2 DAILY SLOTS */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                        {t.dateTimeTitle}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">{t.dateTimeSubtitle}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                        {t.selectDateLabel}
                      </label>
                      <input
                        type="date"
                        min={getDefaultDate()}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full sm:w-72 px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-slate-900"
                      />
                      {isSunday(selectedDate) && (
                        <p className="text-xs text-red-600 font-semibold mt-2">
                          {t.sundayBlocked}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase text-slate-500">
                        {t.selectSlotLabel}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          {
                            id: '08:00 - 12:00',
                            label: t.slotMorning,
                            sub: '4 Stunden Intensivpflege'
                          },
                          {
                            id: '14:00 - 18:00',
                            label: t.slotAfternoon,
                            sub: '4 Stunden Intensivpflege'
                          }
                        ].map((slotObj) => {
                          const taken = isSlotTaken(selectedDate, slotObj.id);
                          const active = selectedSlot === slotObj.id && !taken;
                          return (
                            <button
                              key={slotObj.id}
                              type="button"
                              disabled={taken || isSunday(selectedDate)}
                              onClick={() => setSelectedSlot(slotObj.id)}
                              className={`p-5 rounded-xl border text-left transition flex flex-col justify-between ${
                                taken
                                  ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : active
                                  ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-900'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full mb-2">
                                <Clock className="w-5 h-5" />
                                <span
                                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                    taken
                                      ? 'bg-red-100 text-red-700'
                                      : active
                                      ? 'bg-emerald-500 text-white'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {taken ? t.slotBooked : t.slotAvailable}
                                </span>
                              </div>
                              <div className="font-bold text-base">{slotObj.label}</div>
                              <div
                                className={`text-xs mt-1 ${
                                  active ? 'text-slate-300' : 'text-slate-500'
                                }`}
                              >
                                {slotObj.sub}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: ADDRESS AUTOCOMPLETE DROPDOWN & CONTACT */}
                {step === 5 && (
                  <form onSubmit={handleSubmitBooking} className="space-y-5">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                      {t.contactTitle}
                    </h3>

                    <div className="relative bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5 flex items-center justify-between gap-1.5">
                        <span className="flex items-center gap-1.5">
                          <Search className="w-3.5 h-3.5 text-[#D52B1E]" />
                          <span>{t.addressSearchLabel}</span>
                        </span>
                        {selectedDistanceKm !== null && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            ca. {selectedDistanceKm} km ab Zürich ✓
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={addressQuery}
                        onFocus={() => setShowAddressDropdown(true)}
                        onBlur={() => setTimeout(() => setShowAddressDropdown(false), 200)}
                        onChange={(e) => {
                          setAddressQuery(e.target.value);
                          setSelectedDistanceKm(null);
                          setShowAddressDropdown(true);
                        }}
                        placeholder={t.addressSearchPlaceholder}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:border-slate-900"
                      />
                      {showAddressDropdown &&
                        (addressSuggestions.length > 0 || isSearchingAddress) && (
                          <div className="absolute z-30 left-4 right-4 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                            {isSearchingAddress && (
                              <div className="px-4 py-2.5 text-xs text-slate-400">
                                {t.searchingRadiusMsg}
                              </div>
                            )}
                            {addressSuggestions.map((item, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onMouseDown={() => handleSelectAddressSuggestion(item)}
                                className="w-full text-left px-4 py-2.5 text-xs sm:text-sm hover:bg-slate-100 flex items-center justify-between border-b border-slate-100 last:border-none"
                              >
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-[#D52B1E] shrink-0" />
                                  <span className="font-medium text-slate-800">{item.label}</span>
                                </div>
                                {item.distKm != null ? (
                                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                    {item.distKm} km
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-bold text-slate-400">
                                    &lt; 30 km
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <div className="flex justify-between mb-1">
                          <label className="text-xs font-bold uppercase text-slate-500">
                            {t.streetLabel}
                          </label>
                          {isStreetValid ? (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                              <Check className="w-3.5 h-3.5" /> OK
                            </span>
                          ) : (
                            street.length > 0 && (
                              <span className="text-[11px] text-red-600 font-semibold">
                                + Haus-Nr.
                              </span>
                            )
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="Badenerstrasse 690"
                          className={`w-full px-4 py-3 rounded-xl border text-sm ${
                            street.length > 0 && !isStreetValid
                              ? 'border-red-400 bg-red-50/20'
                              : isStreetValid
                              ? 'border-emerald-500'
                              : 'border-slate-300'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-xs font-bold uppercase text-slate-500">
                            {t.plzLabel}
                          </label>
                          {isPlzValid && (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                              <Check className="w-3.5 h-3.5" /> OK
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          maxLength={4}
                          value={plz}
                          onChange={(e) => setPlz(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="8001"
                          className={`w-full px-4 py-3 rounded-xl border text-sm ${
                            plz.length > 0 && !isPlzValid
                              ? 'border-red-400 bg-red-50/20'
                              : isPlzValid
                              ? 'border-emerald-500'
                              : 'border-slate-300'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-xs font-bold uppercase text-slate-500">
                            {t.cityLabel}
                          </label>
                          {isCityValid && (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                              <Check className="w-3.5 h-3.5" /> OK
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Zürich / Winterthur / Uster"
                          className={`w-full px-4 py-3 rounded-xl border text-sm ${
                            isCityValid ? 'border-emerald-500' : 'border-slate-300'
                          }`}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-xs font-bold uppercase text-slate-500">
                            {t.nameLabel}
                          </label>
                          {isNameValid && (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                              <Check className="w-3.5 h-3.5" /> OK
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="Felix Meier"
                          className={`w-full px-4 py-3 rounded-xl border text-sm ${
                            clientName.length > 0 && !isNameValid
                              ? 'border-red-400 bg-red-50/20'
                              : isNameValid
                              ? 'border-emerald-500'
                              : 'border-slate-300'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-xs font-bold uppercase text-slate-500">
                            {t.phoneLabel}
                          </label>
                          {isPhoneValid && (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                              <Check className="w-3.5 h-3.5" /> CH Valid
                            </span>
                          )}
                        </div>
                        <input
                          type="tel"
                          required
                          value={clientPhone}
                          onChange={(e) => setClientPhone(formatSwissPhone(e.target.value))}
                          placeholder="+41 79 123 45 67"
                          className={`w-full px-4 py-3 rounded-xl border text-sm font-mono ${
                            clientPhone.length > 4 && !isPhoneValid
                              ? 'border-red-400 bg-red-50/20'
                              : isPhoneValid
                              ? 'border-emerald-500'
                              : 'border-slate-300'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-xs font-bold uppercase text-slate-500">
                            {t.emailLabel}
                          </label>
                          {isEmailValid && (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                              <Check className="w-3.5 h-3.5" /> OK
                            </span>
                          )}
                        </div>
                        <input
                          type="email"
                          required
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="name@bluewin.ch"
                          className={`w-full px-4 py-3 rounded-xl border text-sm ${
                            clientEmail.length > 0 && !isEmailValid
                              ? 'border-red-400 bg-red-50/20'
                              : isEmailValid
                              ? 'border-emerald-500'
                              : 'border-slate-300'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-bold uppercase text-slate-500">
                          {t.notesLabel}
                        </label>
                        <span className="text-[11px] text-slate-400">
                          {clientNotes.length}/500
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        maxLength={500}
                        value={clientNotes}
                        onChange={(e) => setClientNotes(e.target.value)}
                        placeholder="..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-slate-800 shrink-0 mt-0.5" />
                      <span>{t.finalNotice}</span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setStep(4)}
                        className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm flex items-center gap-1.5 hover:bg-slate-100"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        {t.backBtn}
                      </button>

                      <button
                        type="submit"
                        disabled={!canProceedStep5 || isSubmitting}
                        className={`px-6 py-3.5 rounded-xl font-bold text-sm text-white flex items-center gap-2 transition ${
                          canProceedStep5 && !isSubmitting
                            ? 'bg-[#D52B1E] hover:bg-red-700 shadow-lg shadow-red-900/20'
                            : 'bg-slate-300 cursor-not-allowed'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t.submitBookingBtn}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Error Banner */}
                {formError && (
                  <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Bottom Navigation for Steps 1 to 4 */}
                {step < 5 && (
                  <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200">
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setFormError('');
                          setStep((s) => s - 1);
                        }}
                        className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm flex items-center gap-1.5 hover:bg-slate-100"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>{t.backBtn}</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-1.5 transition ${
                        (step === 1 && canProceedStep1) ||
                        (step === 2 && canProceedStep2) ||
                        (step === 3 && canProceedStep3) ||
                        (step === 4 && canProceedStep4)
                          ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      <span>{t.nextBtn}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* MINIMALIST FOOTER WITH SUBTLE OWNER LOCK ICON */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">ZüriGlanz Mobile Detailing</span>
            <span>·</span>
            <span>Zürich + 30 km Umkreis</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Eco-Waterless Technology · 2 Slots/Tag (08:00–12:00 & 14:00–18:00)</span>
            <button
              type="button"
              onClick={() => {
                if (session || isDemoAdmin) {
                  setIsAdminMode(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setShowPinModal(true);
                }
              }}
              title="Android Owner App"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition flex items-center gap-1"
            >
              <Lock className="w-3.5 h-3.5" />
              {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-[#D52B1E]" />}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}