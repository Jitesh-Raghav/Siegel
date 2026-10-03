// NEEDS NATIVE REVIEW
// German copy for the Siegel marketing site. Formal "Sie" throughout.
// Have a native speaker review every string before sharing /de.

import type { Messages } from './en'

export const de: Messages = {
  meta: {
    title: 'Siegel — Validierte E-⁠Rechnungen für Stripe',
    description:
      'Siegel macht aus jeder Stripe-Rechnung eine validierte ZUGFeRD- oder XRechnung-Datei — automatisch, bevor sie Ihren Kunden erreicht. Bereit für die E-⁠Rechnungspflicht.',
    ogTitle: 'Stripe verschickt PDFs. Deutschland verlangt jetzt E-⁠Rechnungen.',
  },
  nav: {
    home: 'Siegel Startseite',
    how: 'So funktioniert’s',
    pricing: 'Preise',
    faq: 'FAQ',
    login: 'Anmelden',
    soon: 'Demnächst',
    cta: 'Frühzugang sichern',
    language: 'Sprache',
    menu: 'Menü',
    closeMenu: 'Menü schließen',
  },
  hero: {
    badge: 'E-⁠Rechnung 2027 · Vor der Frist bereit sein',
    badgeShort: 'E-⁠Rechnung 2027 · Jetzt vorbereiten',
    h1a: 'Stripe verschickt PDFs.',
    h1b: 'Deutschland verlangt jetzt E-⁠Rechnungen.',
    sub: 'Siegel macht aus jeder Stripe-Rechnung eine validierte ZUGFeRD- oder XRechnung-Datei — automatisch, bevor sie Ihren Kunden erreicht.',
    ctaPrimary: 'Frühzugang sichern',
    ctaSecondary: 'So funktioniert’s',
    bannerAlt:
      'Linienstich in Tintenblau und Creme: historische Backstein-Speicher an einem Kanal, im Stil einer Banknote.',
  },
  card: {
    region: 'Beispiel einer E-⁠Rechnung, die validiert wird',
    validated: 'Validiert',
    number: 'INV-2026-0142',
    seller: 'Muster GmbH · Berlin',
    amount: 4760,
    vatNote: 'inkl. 19 % USt.',
    profileLabel: 'E-⁠Rechnungsprofil',
    profile: 'ZUGFeRD · EN 16931',
    files: 'PDF/A-3 + XML',
    copy: 'Dateityp kopieren',
    copied: 'Kopiert',
    deliveredTo: 'Zugestellt an',
    deliveredEmail: 'buchhaltung@muster.de',
    example: 'Beispielrechnung',
    rulesChecked: 'Regeln geprüft',
    stats: {
      schema: 'Schemaprüfung',
      rules: 'Geschäftsregeln',
      vat: 'USt.-Positionen',
      processing: 'Verarbeitung',
      archived: 'Archiviert',
    },
  },
  deadline: {
    eyebrow: 'Der Zeitplan',
    h2: 'Im B2B-Geschäft endet die Ära der PDF-Rechnung.',
    events: [
      { date: '1. Jan. 2025', text: 'Alle Unternehmen müssen E-⁠Rechnungen empfangen können.' },
      { date: '1. Jan. 2027', text: 'Unternehmen mit mehr als 800.000 € Vorjahresumsatz müssen sie versenden.' },
      { date: '1. Jan. 2028', text: 'Alle Unternehmen müssen sie versenden.' },
    ],
    countdownOne: 'Noch {n} Tag bis zum 1. Januar 2027',
    countdownMany: 'Noch {n} Tage bis zum 1. Januar 2027',
    countdownToday: 'Heute ist der 1. Januar 2027',
    countdownPast: 'Gilt seit dem 1. Januar 2027',
    today: 'Heute',
    footnote:
      'Vereinfachte Übersicht. Es gelten Ausnahmen (z. B. Kleinunternehmer, Rechnungen unter 250 €). Keine Steuerberatung.',
  },
  how: {
    eyebrow: 'So funktioniert’s',
    h2: 'Drei Schritte. Danach müssen Sie nicht mehr daran denken.',
    steps: [
      {
        n: '01',
        title: 'Stripe verbinden',
        body: 'App installieren und Ihre Unternehmensdaten einmalig hinterlegen.',
      },
      {
        n: '02',
        title: 'Umwandeln & validieren',
        body: 'Jede finalisierte Rechnung und Gutschrift wird zu einer ZUGFeRD- oder XRechnung-Datei, geprüft nach offiziellen Regeln.',
      },
      {
        n: '03',
        title: 'Zustellen & archivieren',
        body: 'Per E-Mail an Ihre Kunden versendet und für die gesetzliche Aufbewahrungsfrist gespeichert.',
      },
    ],
    diagram: {
      caption: 'Eine Datei, zwei Ebenen.',
      pdfTitle: 'Rechnung',
      pdfLayer: 'PDF — für Menschen',
      xmlLayer: 'XML — für Maschinen',
      fields: ['USt-IdNr. des Verkäufers', 'Leistungszeitraum', 'USt.-Aufschlüsselung', 'Käuferreferenz'],
    },
  },
  features: {
    eyebrow: 'Funktionen',
    h2: 'Alles, was eine E-⁠Rechnung braucht. Nichts, was Sie lernen müssen.',
    items: [
      {
        title: 'ZUGFeRD & XRechnung',
        body: 'Standardmäßig ZUGFeRD im Profil EN 16931, XRechnung für Kunden, die reines XML verlangen.',
      },
      {
        title: 'Validierung nach offiziellen Regeln',
        body: 'Jede Datei wird gegen das offizielle Schema und die Geschäftsregeln geprüft, bevor sie jemand sieht.',
      },
      {
        title: 'USt., Reverse Charge & Gutschriften',
        body: '19 % und 7 %, gemischte Sätze, EU-Reverse-Charge und Gutschriften mit Bezug auf die ursprüngliche Rechnung.',
      },
      {
        title: 'E-Mail-Zustellung mit Protokoll',
        body: 'In Ihrem Namen an die Rechnungsadresse Ihrer Kunden versendet, mit Protokoll jeder Zustellung.',
      },
      {
        title: 'Manipulationssicheres EU-Archiv',
        body: 'Jede Datei in der EU gespeichert, mit kryptografischem Hash und schreibgeschützt für die Aufbewahrungsfrist.',
      },
      {
        title: 'Vergangene Rechnungen nachträglich umwandeln',
        body: 'Bereits in Stripe finalisierte Rechnungen für einen Zeitraum Ihrer Wahl umwandeln.',
      },
    ],
  },
  audience: {
    eyebrow: 'Für wen',
    h2: 'Für Unternehmen, die bereits über Stripe abrechnen.',
    items: [
      {
        title: 'SaaS mit Stripe Billing',
        body: 'Abonnements, anteilige Abrechnungen und Rabatte werden zu E-⁠Rechnungen mit korrekten Leistungszeiträumen.',
      },
      {
        title: 'Agenturen & Freelancer mit Stripe Invoicing',
        body: 'Rechnen Sie weiter über Stripe ab. Ihre Kunden erhalten eine Datei, die ihre Buchhaltungssoftware lesen kann.',
      },
      {
        title: 'Finanzteams, die das nicht selbst bauen wollen',
        body: 'Keine Formatspezifikationen, Validatoren oder Archive. Investieren Sie die Entwicklungszeit in Ihr Produkt.',
      },
    ],
  },
  pricing: {
    eyebrow: 'Preise im Frühzugang',
    h2: 'Abgerechnet nach Rechnungsvolumen. Monatlich kündbar.',
    perMonth: '/Monat',
    plans: [
      { id: 'starter', name: 'Starter', price: 29, limit: 'Bis zu 50 Rechnungen/Monat', extras: [] },
      { id: 'growth', name: 'Growth', price: 79, limit: 'Bis zu 500 Rechnungen/Monat', extras: [] },
      {
        id: 'scale',
        name: 'Scale',
        price: 199,
        limit: 'Bis zu 5.000 Rechnungen/Monat',
        extras: ['Mehrere Stripe-Konten', 'Bevorzugter Support'],
      },
    ],
    includesTitle: 'In jedem Tarif enthalten',
    includes: ['ZUGFeRD & XRechnung', 'Validierung', 'E-Mail-Zustellung', 'EU-Archiv'],
    founding: 'Gründungskunden: 50 % Rabatt in den ersten 3 Monaten.',
    cta: 'Frühzugang sichern',
    vatNote: 'Preise zzgl. USt.',
  },
  faq: {
    eyebrow: 'FAQ',
    h2: 'Fragen, klar beantwortet.',
    sub: 'Etwas fehlt? Sichern Sie sich den Frühzugang und fragen Sie mich direkt.',
    items: [
      {
        id: 'need',
        q: 'Brauche ich das?',
        a: 'Wenn Ihr Unternehmen in Deutschland ansässig ist und an andere Unternehmen fakturiert: sehr wahrscheinlich ab 2027 oder 2028. Klären Sie Ihre Situation mit Ihrer Steuerberatung.',
      },
      {
        id: 'stripe',
        q: 'Kann Stripe das nicht schon?',
        a: 'Stripe erstellt PDF-Rechnungen. Strukturierte E-⁠Rechnungen für Deutschland erfordern eine zusätzliche App. Siegel ist diese App.',
      },
      {
        id: 'formats',
        q: 'Welche Formate unterstützen Sie?',
        a: 'ZUGFeRD (Profil EN 16931) und XRechnung.',
      },
      {
        id: 'change',
        q: 'Muss ich meine Arbeit mit Stripe ändern?',
        a: 'Nein. Rechnen Sie genau so ab wie bisher.',
      },
      { id: 'data', q: 'Wo werden meine Daten gespeichert?', a: 'In der EU.' },
      {
        id: 'advice',
        q: 'Ist das Steuerberatung?',
        a: 'Nein. Siegel ist eine Software, die Dateien gegen offizielle technische Regeln validiert. Für Ihre steuerliche Situation bleibt Ihre Steuerberatung verantwortlich.',
      },
    ],
  },
  finalCta: {
    h2: 'Bereit sein vor dem Januar.',
    sub: 'Sichern Sie sich den Frühzugang. Die ersten Kunden betreue ich persönlich.',
  },
  footer: {
    tagline: 'Software, keine Steuerberatung.',
    disclaimer: 'Siegel ist ein unabhängiges Produkt und steht in keiner Verbindung zu Stripe.',
    impressum: 'Impressum',
    datenschutz: 'Datenschutz',
    terms: 'AGB',
    contact: 'Kontakt',
    navLabel: 'Rechtliches',
  },
  form: {
    title: 'Frühzugang sichern',
    sub: 'Erzählen Sie mir kurz, wie Sie abrechnen. Ich lese jeden Eintrag.',
    email: 'Geschäftliche E-Mail',
    emailPlaceholder: 'sie@unternehmen.de',
    company: 'Unternehmen',
    companyPlaceholder: 'Muster GmbH',
    optional: 'optional',
    volume: 'Rechnungen pro Monat',
    volumeOptions: [
      { value: '<20', label: '< 20' },
      { value: '20-100', label: '20–100' },
      { value: '100-500', label: '100–500' },
      { value: '500+', label: '500+' },
    ],
    turnover: 'Vorjahresumsatz über 800.000 €?',
    turnoverOptions: [
      { value: 'yes', label: 'Ja' },
      { value: 'no', label: 'Nein' },
      { value: 'unsure', label: 'Weiß nicht' },
    ],
    submit: 'Frühzugang sichern',
    submitting: 'Wird gesendet…',
    success: 'Sie stehen auf der Liste. Ich melde mich persönlich bei Ihnen.',
    already: 'Sie stehen bereits auf der Liste. Ich melde mich bei Ihnen.',
    error: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es gleich noch einmal.',
    rateLimited: 'Zu viele Versuche. Bitte warten Sie einige Minuten.',
    invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    privacy: 'Ich nutze Ihre E-Mail-Adresse nur, um Sie zu Siegel zu kontaktieren. Siehe',
    privacyLink: 'Datenschutz',
    close: 'Schließen',
    honeypot: 'Dieses Feld leer lassen',
  },
  legal: {
    back: 'Zur Startseite',
  },
}
