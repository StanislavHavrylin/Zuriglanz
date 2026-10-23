import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
} from 'firebase/firestore';
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
  ShieldAlert
} from 'lucide-react';

// --- FIREBASE INITIALIZATION ---
const firebaseConfig =
  typeof __firebase_config !== 'undefined' && __firebase_config
    ? JSON.parse(__firebase_config)
    : {
        apiKey: 'demo-api-key',
        authDomain: 'demo.firebaseapp.com',
        projectId: 'demo-project'
      };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'zuriglanz-detailing-zh';

// --- BASE LOCATION: 8048 ZÜRICH (ALTSTETTEN) & 30 KM RADIUS ---
const BASE_COORD_8048 = { lat: 47.3874, lon: 8.4847 };
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

// Fallback addresses within 30 km of 8048 Zürich (including ZH, AG, ZG, SZ)
const ZURICH_STREETS_DB = [
  { street: 'Badenerstrasse 690', plz: '8048', city: 'Zürich', distKm: 0.4 },
  { street: 'Altstetterstrasse 140', plz: '8048', city: 'Zürich', distKm: 0.6 },
  { street: 'Hohlstrasse 530', plz: '8048', city: 'Zürich', distKm: 0.8 },
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
  'BMW X3',
  'BMW X5',
  'BMW 3er Touring',
  'Tesla Model Y',
  'Tesla Model 3',
  'Mercedes-Benz GLC',
  'Mercedes-Benz C-Klasse',
  'Mercedes-Benz GLE',
  'Audi Q5',
  'Audi A4 Avant',
  'Audi Q3',
  'Porsche Macan',
  'Porsche Cayenne',
  'VW Golf',
  'VW Tiguan',
  'Skoda Octavia Kombi',
  'Skoda Kodiaq',
  'Volvo XC60',
  'Volvo XC90'
];

// --- PRICING TIERS & ADDONS ---
const BODY_TIERS = [
  { id: 'compact', labelKey: 'sizeCompact', price: 0, example: 'VW Golf, Tesla Model 3, BMW 3er' },
  { id: 'suv', labelKey: 'sizeSuv', price: 30, example: 'Skoda Octavia Kombi, BMW X3, Audi Q5' },
  { id: 'large', labelKey: 'sizeLarge', price: 60, example: 'BMW X5/X7, Mercedes GLE, VW Multivan' }
];

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

// --- TRANSLATIONS (DE / EN ONLY) ---
const TRANSLATIONS = {
  de: {
    brandSubtitle: 'Mobile Autoaufbereitung · 8048 Zürich + 30 km Umkreis',
    heroBadge: 'Umweltfreundliche Waterless-Technologie · Vor-Ort-Service',
    heroTitle: 'Schweizer Präzision für Ihr Fahrzeug – direkt bei Ihnen vor Ort.',
    heroDesc:
      '4–5 Stunden intensive Innen- & Aussenpflege ohne Wasserabfluss (100% Gewässerschutz-konform). Wir kommen zu Ihrem Parkplatz in 8048 Zürich und im Umkreis von 30 km (inkl. ZH, AG, ZG).',
    bookNowBtn: 'Termin online buchen',
    viewPackagesBtn: 'Preise & Leistungen',
    adminToggle: 'Inhaber-Login',
    statsTime: '4–5 Std.',
    statsTimeSub: 'Fokus pro Fahrzeug',
    statsBase: 'Ab 150 CHF',
    statsBaseSub: 'Pauschale inkl. Anfahrt (30 km)',
    statsEco: '100% Legal',
    statsEcoSub: 'Waterless Gewässerschutz',

    // Pricing Section
    pricingTitle: 'Transparente Pauschale & Zusatzleistungen',
    pricingSubtitle: 'Keine versteckten Kosten. Anfahrt im Umkreis von 30 km ab 8048 Zürich ist inklusive.',
    basePackageTitle: 'ZüriGlanz Essential Pauschale',
    basePackagePrice: '150 CHF',
    basePackageTime: 'Dauer: ca. 4–5 Stunden · Inkl. Anfahrt ab 8048 Zürich (30 km Umkreis)',
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

    // Booking Wizard
    wizardTitle: 'Termin-Reservierung (8048 Zürich + 30 km Umkreis)',
    step1Label: '1. Standort-Check',
    step2Label: '2. Zustand & Umwelt',
    step3Label: '3. Fahrzeug & Paket',
    step4Label: '4. Datum & Zeit',
    step5Label: '5. Adresse & Kontakt',

    // Step 1
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

    // Step 2
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

    // Step 3
    carDetailsTitle: 'Ihr Fahrzeug & gewünschte Leistungen',
    carMakeLabel: 'Marke & Modell (mind. 3 Zeichen) *',
    carMakePlaceholder: 'z.B. BMW X3, Tesla Model Y, VW Golf',
    carYearLabel: 'Baujahr (1970–2027) *',
    selectBodyType: 'Fahrzeugkategorie wählen:',
    selectAddons: 'Zusatzleistungen hinzufügen:',
    priceSummary: 'Geschätzter Gesamtpreis',
    durationSummary: 'Geschätzte Arbeitszeit: 4 – 5 Stunden',

    // Step 4
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

    // Step 5
    contactTitle: 'Einsatzort (Umkreis 30 km ab 8048) & Kontaktdaten',
    addressSearchLabel: 'Adresse suchen (30 km Umkreis ab 8048 Zürich – inkl. ZH, AG, ZG) *',
    addressSearchPlaceholder: 'Tippen Sie z.B. Badenerstrasse 690, Wettingen, Zug, Schlieren...',
    searchingRadiusMsg: 'Suche Adressen im 30 km Umkreis von 8048 Zürich...',
    streetLabel: 'Strasse & Hausnummer *',
    plzLabel: 'PLZ (4 Ziffern) *',
    cityLabel: 'Ort (max. 30 km ab 8048 ZH) *',
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

    // Validation Errors
    errCarMake: 'Bitte geben Sie eine gültige Automarke & Modell an (mind. 3 Buchstaben).',
    errStreetNumber: 'Bitte geben Sie Strasse UND Hausnummer an (z.B. Badenerstrasse 690).',
    errPlzSwiss: 'Bitte eine gültige 4-stellige Schweizer PLZ eingeben (z.B. 8048, 5400, 6300).',
    errOutOfRadius:
      'Diese Adresse liegt ausserhalb unseres 30 km Service-Radius ab 8048 Zürich. Bitte wählen Sie einen Ort innerhalb von 30 km.',
    errFullName: 'Bitte Vor- und Nachname eingeben (mind. 2 Wörter, keine Zahlen).',
    errPhoneCh: 'Bitte gültige Schweizer Nummer eingeben (z.B. +41 79 123 45 67).',
    errEmail: 'Bitte eine gültige E-Mail-Adresse eingeben (z.B. name@domain.ch).',

    // Success Modal
    bookingSuccessTitle: 'Termin-Anfrage erfolgreich gesendet!',
    bookingSuccessText:
      'Vielen Dank! Wir haben Ihre Angaben erhalten. Der Termin hat aktuell den Status "Wartet auf Bestätigung". Ich melde mich in Kürze bei Ihnen.',
    newBookingBtn: 'Weitere Buchung erstellen',

    // Admin Dashboard
    adminTitle: 'Inhaber-Cockpit · Buchungsverwaltung',
    adminSub:
      'Geheime Verwaltungsansicht für ZüriGlanz (Basis 8048 Zürich · 30 km Umkreis). Bestätigen Sie Termine oder kontaktieren Sie Kunden direkt per WhatsApp.',
    statusPending: 'Wartet auf Bestätigung',
    statusConfirmed: 'Bestätigt',
    statusDeclined: 'Abgelehnt',
    confirmBtn: 'Bestätigen',
    declineBtn: 'Ablehnen',
    deleteBtn: 'Löschen',
    noBookings: 'Noch keine Buchungen in dieser Ansicht.'
  },
  en: {
    brandSubtitle: 'Mobile Car Detailing · 8048 Zürich + 30 km Radius',
    heroBadge: 'Eco-Friendly Waterless Tech · Doorstep Service',
    heroTitle: 'Swiss Precision Car Care — Right at Your Doorstep.',
    heroDesc:
      '4–5 hours of dedicated interior & exterior craftsmanship per vehicle. Compliant with Swiss environmental laws. We come directly to your parking spot within a 30 km radius of 8048 Zürich (ZH, AG, ZG).',
    bookNowBtn: 'Book Appointment',
    viewPackagesBtn: 'Pricing & Services',
    adminToggle: 'Owner Login',
    statsTime: '4–5 Hrs',
    statsTimeSub: 'Dedicated per car',
    statsBase: 'From 150 CHF',
    statsBaseSub: 'Flat rate incl. 30 km travel',
    statsEco: 'Eco-Safe',
    statsEcoSub: 'Waterless Technology',

    // Pricing Section
    pricingTitle: 'Transparent Flat Rate & Custom Upgrades',
    pricingSubtitle: 'No hidden fees. Call-out within a 30 km radius of 8048 Zürich is included.',
    basePackageTitle: 'ZüriGlanz Essential Care (Pauschale)',
    basePackagePrice: '150 CHF',
    basePackageTime: 'Duration: approx. 4–5 hours · Includes travel within 30 km of 8048 ZH',
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

    // Booking Wizard
    wizardTitle: 'Book Your Mobile Detailing Slot (30 km Radius)',
    step1Label: '1. Site Pre-Check',
    step2Label: '2. Dirt & Eco Policy',
    step3Label: '3. Vehicle & Add-ons',
    step4Label: '4. Date & Slot',
    step5Label: '5. Address & Contact',

    // Step 1
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

    // Step 2
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

    // Step 3
    carDetailsTitle: 'Vehicle Information & Services',
    carMakeLabel: 'Car Make & Model (min. 3 chars) *',
    carMakePlaceholder: 'e.g. Porsche Macan, Audi A4, Tesla Model 3',
    carYearLabel: 'Production Year (1970–2027) *',
    selectBodyType: 'Select Vehicle Type:',
    selectAddons: 'Select Optional Add-ons:',
    priceSummary: 'Estimated Total',
    durationSummary: 'Estimated Time: 4 – 5 Hours',

    // Step 4
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

    // Step 5
    contactTitle: 'Service Address (30 km Radius from 8048) & Contact',
    addressSearchLabel: 'Search Address within 30 km of 8048 Zürich (Street, No., PLZ) *',
    addressSearchPlaceholder: 'Type e.g. Badenerstrasse 690, Baden, Zug, Küsnacht...',
    searchingRadiusMsg: 'Searching addresses within 30 km of 8048 Zürich...',
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

    // Validation Errors
    errCarMake: 'Please enter a valid car make and model (at least 3 letters).',
    errStreetNumber: 'Please include both street name AND house number (e.g. Badenerstrasse 690).',
    errPlzSwiss: 'Please enter a valid 4-digit Swiss postal code (e.g. 8048, 5400, 6300).',
    errOutOfRadius:
      'This address is outside our 30 km service radius from 8048 Zürich. Please choose a location within 30 km.',
    errFullName: 'Please enter your first and last name (at least 2 words, no digits).',
    errPhoneCh: 'Please enter a valid Swiss phone number (+41 79 123 45 67).',
    errEmail: 'Please enter a valid email address (name@domain.ch).',

    // Success Modal
    bookingSuccessTitle: 'Booking Request Received!',
    bookingSuccessText:
      'Thank you! Your slot is reserved as "Pending Confirmation". I will review the details and contact you shortly to confirm.',
    newBookingBtn: 'Done',

    // Admin Dashboard
    adminTitle: 'Owner Dashboard · Manage Bookings',
    adminSub:
      'Private control panel (Base: 8048 Zürich · 30 km radius). Review incoming bookings, open Google Maps, or send 1-click WhatsApp confirmations.',
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

export default function App() {
  const [lang, setLang] = useState('de');
  const t = TRANSLATIONS[lang];

  // Auth & Firestore Bookings
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);

  // Hidden PIN-Protected Owner Dashboard State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [adminFilter, setAdminFilter] = useState('all');
  const OWNER_PIN = '8000';

  // Check if URL has ?admin=1 on load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('admin=1')) {
      setShowPinModal(true);
    }
  }, []);

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

  // --- SWISS GEOADMIN API + 30 KM RADIUS FILTER FROM 8048 ZÜRICH ---
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
                  calcDistanceKm(BASE_COORD_8048.lat, BASE_COORD_8048.lon, lat, lon) * 10
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

  // --- FIREBASE AUTHENTICATION ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Auth error:', err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // --- FIREBASE FIRESTORE LISTENER ---
  useEffect(() => {
    if (!user) return;
    const bookingsRef = collection(db, 'artifacts', appId, 'public', 'data', 'bookings');
    const unsubscribe = onSnapshot(
      bookingsRef,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setBookings(list);
      },
      (error) => {
        console.error('Firestore listener error:', error);
      }
    );
    return () => unsubscribe();
  }, [user]);

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
    return bookings.some(
      (b) => b.date === dateStr && b.slot === slotStr && b.status !== 'declined'
    );
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

  const canProceedStep3 = isCarMakeValid && isCarYearValid;
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
      setFormError(t.errCarMake);
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
        distKmFrom8048: selectedDistanceKm
      },
      client: {
        name: clientName.trim(),
        phone: clientPhone.trim(),
        email: clientEmail.trim(),
        notes: clientNotes.trim()
      }
    };

    try {
      if (user) {
        const bookingsRef = collection(db, 'artifacts', appId, 'public', 'data', 'bookings');
        const docRef = await addDoc(bookingsRef, newBooking);
        setSubmittedBooking({ id: docRef.id, ...newBooking });
      } else {
        setSubmittedBooking({ id: 'ZH-' + Math.floor(1000 + Math.random() * 9000), ...newBooking });
      }
    } catch (err) {
      console.error('Error saving booking:', err);
      setSubmittedBooking({ id: 'ZH-' + Math.floor(1000 + Math.random() * 9000), ...newBooking });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'bookings', bookingId);
      await updateDoc(docRef, { status: newStatus });
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const deleteBooking = async (bookingId) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'bookings', bookingId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Error deleting booking:', err);
    }
  };

  const handleManualBlockSlot = async (dateToBlock, slotToBlock) => {
    if (!user) return;
    try {
      const bookingsRef = collection(db, 'artifacts', appId, 'public', 'data', 'bookings');
      await addDoc(bookingsRef, {
        status: 'confirmed',
        createdAt: Date.now(),
        date: dateToBlock,
        slot: slotToBlock,
        carMakeModel: 'Telefon-Buchung / Blockiert',
        carYear: '2026',
        bodyTier: 'compact',
        dirtLevel: 'normal',
        addons: [],
        totalPrice: 150,
        location: { street: 'Manuelle Reservierung', plz: '8000', city: 'Zürich' },
        client: {
          name: 'Inhaber Blockierung',
          phone: '+41 79 000 00 00',
          email: '',
          notes: 'Manuell vom Inhaber reserviert'
        }
      });
    } catch (err) {
      console.error('Error blocking slot:', err);
    }
  };

  const handlePinLogin = (e) => {
    e.preventDefault();
    if (pinInput.trim() === OWNER_PIN) {
      setIsAdminMode(true);
      setShowPinModal(false);
      setPinInput('');
      setPinError('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setPinError('Falscher PIN-Code / Invalid PIN (Demo: 8000)');
    }
  };

  const buildWhatsAppLink = (b) => {
    const cleanPhone = (b.client?.phone || '').replace(/\D/g, '');
    const msg = `Grüezi ${b.client?.name || ''}! Hier ist ZüriGlanz Mobile Detailing. Ihr Termin am ${b.date} (${b.slot} Uhr) an der Adresse ${b.location?.street}, ${b.location?.plz} ${b.location?.city} für Ihren ${b.carMakeModel} (Richtpreis: ${b.totalPrice} CHF) ist hiermit offiziell BESTÄTIGT. Bis bald!`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
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

  const confirmedRevenue = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'confirmed')
      .reduce((acc, item) => acc + (Number(item.totalPrice) || 0), 0);
  }, [bookings]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-600 selection:text-white">
      {/* PIN LOGIN MODAL FOR OWNER */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <KeyRound className="w-5 h-5 text-[#D52B1E]" />
                <span>ZüriGlanz · Owner Login</span>
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
              Geschützter Inhaber-Bereich (8048 Zürich · 30 km Radius). Bitte PIN eingeben:
              <span className="block mt-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                Demo Owner PIN: 8000
              </span>
            </p>
            <form onSubmit={handlePinLogin} className="space-y-3">
              <input
                type="password"
                inputMode="numeric"
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="PIN (8000)"
                className="w-full px-4 py-3 text-center tracking-widest text-lg font-bold rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
              />
              {pinError && <p className="text-xs text-red-600 font-semibold">{pinError}</p>}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition"
              >
                Login
              </button>
            </form>
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
                  8048 + 30 km
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

            {isAdminMode && (
              <button
                onClick={() => setIsAdminMode(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* OWNER ADMIN PANEL */}
      {isAdminMode && (
        <section className="bg-slate-900 text-white border-b border-slate-800 py-8 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Захищений кабінет власника (PIN: 8000)</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold">{t.adminTitle}</h2>
                <p className="text-sm text-slate-400">{t.adminSub}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block">Очікують (Pending)</span>
                  <span className="text-xl font-extrabold text-amber-400">
                    {bookings.filter((b) => b.status === 'pending').length}
                  </span>
                </div>
                <div className="bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block">Підтверджено</span>
                  <span className="text-xl font-extrabold text-emerald-400">
                    {bookings.filter((b) => b.status === 'confirmed').length}
                  </span>
                </div>
                <div className="bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block">Підтверджена каса</span>
                  <span className="text-xl font-extrabold text-white">{confirmedRevenue} CHF</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
                {[
                  { id: 'all', label: `Всі (${bookings.length})` },
                  {
                    id: 'pending',
                    label: `Нові (${bookings.filter((b) => b.status === 'pending').length})`
                  },
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      adminFilter === tab.id
                        ? 'bg-white text-slate-900'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => handleManualBlockSlot(selectedDate, '08:00 - 12:00')}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center gap-1.5 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Заблокувати {selectedDate} (08–12)</span>
                </button>
                <button
                  onClick={() => handleManualBlockSlot(selectedDate, '14:00 - 18:00')}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center gap-1.5 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
                  <span>Заблокувати {selectedDate} (14–18)</span>
                </button>
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-8 text-center text-slate-400">
                {t.noBookings}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : b.status === 'declined'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {b.status === 'confirmed'
                            ? t.statusConfirmed
                            : b.status === 'declined'
                            ? t.statusDeclined
                            : t.statusPending}
                        </span>
                        <span className="text-lg font-extrabold text-white">{b.totalPrice} CHF</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-3 bg-slate-900/70 p-3 rounded-lg border border-slate-700/60">
                        <div>
                          <span className="text-xs text-slate-400 block">Дата & Слот</span>
                          <span className="font-bold text-white">
                            {b.date} · {b.slot}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block">Автомобіль</span>
                          <span className="font-bold text-white">
                            {b.carMakeModel} ({b.carYear})
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-slate-300">
                        <div className="flex items-center justify-between gap-2 bg-slate-900/40 p-2 rounded-lg">
                          <span>
                            <strong className="text-slate-400">Adresse:</strong> {b.location?.street},{' '}
                            {b.location?.plz} {b.location?.city}
                            {b.location?.distKmFrom8048 != null && (
                              <span className="ml-1.5 text-emerald-400 font-semibold">
                                ({b.location.distKmFrom8048} km ab 8048)
                              </span>
                            )}
                          </span>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${b.location?.street}, ${b.location?.plz} ${b.location?.city}, Switzerland`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold shrink-0"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Maps</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span>
                            <strong className="text-slate-400">Клієнт:</strong> {b.client?.name} ·{' '}
                            <a href={`tel:${b.client?.phone}`} className="text-emerald-400 underline">
                              {b.client?.phone}
                            </a>
                          </span>
                          <a
                            href={buildWhatsAppLink(b)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 font-semibold"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp-підтвердження</span>
                          </a>
                        </div>

                        <p>
                          <strong className="text-slate-400">Додаткові опції:</strong>{' '}
                          {b.addons?.length ? b.addons.join(', ') : 'Базовий пакет (150 CHF)'}
                        </p>

                        {b.client?.notes && (
                          <div className="mt-2 p-2.5 rounded bg-slate-900 border border-slate-700 text-amber-200">
                            <strong>Побажання клієнта:</strong> {b.client.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-700">
                      {b.status !== 'confirmed' && (
                        <button
                          onClick={() => updateBookingStatus(b.id, 'confirmed')}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
                        >
                          <Check className="w-4 h-4" />
                          {t.confirmBtn}
                        </button>
                      )}
                      {b.status !== 'declined' && (
                        <button
                          onClick={() => updateBookingStatus(b.id, 'declined')}
                          className="flex-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
                        >
                          <X className="w-4 h-4" />
                          {t.declineBtn}
                        </button>
                      )}
                      <button
                        onClick={() => deleteBooking(b.id)}
                        className="bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white text-xs py-2.5 px-3 rounded-lg transition"
                      >
                        {t.deleteBtn}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

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
                          onChange={(e) => setCarMakeModel(e.target.value)}
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
                                  setCarMakeModel(make);
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
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {BODY_TIERS.map((tier) => (
                          <button
                            key={tier.id}
                            type="button"
                            onClick={() => setBodyTier(tier.id)}
                            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                              bodyTier === tier.id
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            <div>
                              <div className="font-bold text-sm">{t[tier.labelKey]}</div>
                              <div
                                className={`text-[11px] mt-0.5 ${
                                  bodyTier === tier.id ? 'text-slate-300' : 'text-slate-500'
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
                            ca. {selectedDistanceKm} km ab 8048 ZH ✓
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
                          placeholder="8048"
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
            <span>8048 Zürich + 30 km Umkreis</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Eco-Waterless Technology · 2 Slots/Tag (08:00–12:00 & 14:00–18:00)</span>
            <button
              type="button"
              onClick={() => {
                if (isAdminMode) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setShowPinModal(true);
                }
              }}
              title="Owner Login"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition flex items-center gap-1"
            >
              <Lock className="w-3.5 h-3.5" />
              {bookings.filter((b) => b.status === 'pending').length > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#D52B1E]" />
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
