'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';

type Lang = 'en' | 'hi';
type PartnerLink = { slug?: string; url?: string; primary?: boolean; isPrimary?: boolean };

const ROUTES = {
  DASHBOARD: '/dashboard',
  STATS: '/subscribers',   // <- schimbă aici dacă ai altă rută pentru statistics
  MATERIALS: '/materials',
};

const dict: Record<Lang, Record<string, string>> = {
  en: {
    welcome: 'Welcome Back, Partner!',
    subtitle: 'Track your Instagram growth and download fresh content',
    tabAccount: 'My account',
    tabStats: 'Statistics',
    tabMaterials: 'Materials',
    myIg: 'My Instagram Account',
    manageAssigned: 'Manage your assigned Instagram account',
    username: 'Username',
    hidden: 'Credentials Hidden',
    status: 'Status',
    active: 'Active & Verified',
    viewDetails: 'View Account Details',
    openIg: 'Open Instagram',
    myRef: 'My Referral Links',
    generateTrack: 'Generate and track your referral links',
    primaryLink: 'Primary Link',
    utm: 'UTM Tracking',
    copyLink: 'Copy Link',
    genQR: 'Generate QR',
    genNew: 'Generate New Link',
    settings: 'Account Settings',
    profileInfo: 'Profile Information',
    updateProfile: 'Update name, contact details',
    editProfile: 'Edit Profile',
    languageRegion: 'Language & Region',
    changeLanguage: 'Change Language',
    security: 'Security',
    securitySettings: 'Security Settings',
    statsTitle: 'Statistics',
    days7: '7 days',
    days30: '30 days',
    total: 'Total',
    growth: 'Growth',
    attributed: 'Attributed',
    clicks: 'Clicks',
    ctr: 'CTR',
    more: 'Details →',
  },
  hi: {
    welcome: 'वापसी पर स्वागत है, पार्टनर!',
    subtitle: 'Instagram ग्रोथ ट्रैक करें और नया कंटेंट डाउनलोड करें',
    tabAccount: 'मेरा अकाउंट',
    tabStats: 'आँकड़े',
    tabMaterials: 'सामग्री',
    myIg: 'मेरा Instagram अकाउंट',
    manageAssigned: 'आपके असाइंड Instagram अकाउंट को मैनेज करें',
    username: 'यूज़रनेम',
    hidden: 'गोपनीय डेटा छिपा',
    status: 'स्थिति',
    active: 'सक्रिय और सत्यापित',
    viewDetails: 'अकाउंट विवरण',
    openIg: 'Instagram खोलें',
    myRef: 'मेरे रेफ़रल लिंक',
    generateTrack: 'रेफ़रल लिंक बनाएं और ट्रैक करें',
    primaryLink: 'प्राइमरी लिंक',
    utm: 'UTM ट्रैकिंग',
    copyLink: 'लिंक कॉपी करें',
    genQR: 'QR बनाएं',
    genNew: 'नया लिंक बनाएं',
    settings: 'अकाउंट सेटिंग्स',
    profileInfo: 'प्रोफ़ाइल जानकारी',
    updateProfile: 'नाम, संपर्क अपडेट करें',
    editProfile: 'प्रोफ़ाइल संपादित करें',
    languageRegion: 'भाषा और क्षेत्र',
    changeLanguage: 'भाषा बदलें',
    security: 'सुरक्षा',
    securitySettings: 'सुरक्षा सेटिंग्स',
    statsTitle: 'आँकड़े',
    days7: '7 दिन',
    days30: '30 दिन',
    total: 'कुल',
    growth: 'वृद्धि',
    attributed: 'एट्रिब्यूटेड',
    clicks: 'क्लिक्स',
    ctr: 'CTR',
    more: 'विस्तार →',
  },
};

export default function Dashboard() {
  const [me, setMe] = useState<any>(null);
  const [links, setLinks] = useState<PartnerLink[]>([]);
  const [range, setRange] = useState<'7d' | '30d'>('7d');
  const [stats, setStats] = useState<any>(null);
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'en';
    return (localStorage.getItem('lang') as Lang) || 'en';
  });

  const t = (k: string) => dict[lang][k] || k;

  useEffect(() => {
    api.auth.me().then(setMe).catch(() => {});
    loadLinks();
  }, []);

  useEffect(() => {
    api.stats.overview(range).then(setStats).catch(() => setStats(null));
  }, [range]);

  useEffect(() => {
    try { localStorage.setItem('lang', lang); } catch {}
  }, [lang]);

  const loadLinks = async () => {
    try {
      const ls: PartnerLink[] = await api.partner.links.list();
      let result = Array.isArray(ls) ? [...ls] : [];
      // sortăm cu primary în față dacă backend-ul îl marchează
      result.sort((a, b) => (isPrimary(b) ? 1 : 0) - (isPrimary(a) ? 1 : 0));

      // dacă nu există nimic -> creăm primary automat
      if (!result.length) {
        const created: any = await api.partner.links.create({
          utmSource: 'partner',
          utmCampaign: 'default',
        });
        result = [created];
      }
      setLinks(result);
    } catch {
      // fallback: încearcă totuși să creezi un primary
      try {
        const created: any = await api.partner.links.create({
          utmSource: 'partner',
          utmCampaign: 'default',
        });
        setLinks([created]);
      } catch {
        setLinks([]);
      }
    }
  };

  const makeLink = async () => {
    const l = await api.partner.links.create({ utmSource: 'partner', utmCampaign: 'default' });
    setLinks((x) => [l, ...x]);
  };

  const origin = typeof window === 'undefined' ? '' : window.location.origin;

  const primaryObj = useMemo(
      () => links.find(isPrimary) || links[0],
      [links],
  );

  const primaryLink = useMemo(() => {
    if (!primaryObj) return '';
    return primaryObj.url || (primaryObj.slug ? `${origin}/l/${primaryObj.slug}` : '');
  }, [primaryObj, origin]);

  const [utm, setUtm] = useState('utm_source=partner&utm_campaign=default');
  const fullLink = useMemo(() => {
    if (!primaryLink) return '';
    return primaryLink.includes('?') ? `${primaryLink}&${utm}` : `${primaryLink}?${utm}`;
  }, [primaryLink, utm]);

  const copy = async (text: string) => { if (!text) return; try { await navigator.clipboard.writeText(text); } catch {} };
  const openQR = () => {
    if (!fullLink) return;
    window.open(`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(fullLink)}`, '_blank');
  };

  const maskedUsername = maskUsername(me?.partner?.igUsername);

  return (
      <div className="min-h-screen bg-gradient-to-b from-white to-violet-50 px-2 py-3 sm:px-3 sm:py-5 md:px-6">
        {/* HEADER */}
        <Header lang={lang} setLang={setLang} />

        {/* Tabs — ACUM SUNT LINKURI REALE */}
        <div className="mx-auto mt-3 grid max-w-6xl grid-cols-3 gap-2 sm:gap-3">
          <TabLink href={ROUTES.DASHBOARD} label={t('tabAccount')} />
          <TabLink href={ROUTES.STATS} label={t('tabStats')} />
          <TabLink href={ROUTES.MATERIALS} label={t('tabMaterials')} />
        </div>

        {/* 2 cards - mobile stack, desktop side by side */}
        <main className="mx-auto mt-4 grid max-w-6xl gap-4 md:mt-6 md:grid-cols-2 md:gap-5">
          {/* My Instagram Account */}
          <section className="rounded-xl border border-black/10 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
            <div className="mb-3 flex items-center gap-2 text-[14px] font-semibold sm:text-[15px]">
              <div className="grid h-6 w-6 place-items-center rounded-md bg-violet-600 text-white">◎</div>
              {t('myIg')}
            </div>
            <p className="text-[11px] text-black/60 sm:text-[12px]">{t('manageAssigned')}</p>

            <div className="mt-4 space-y-3">
              <div>
                <div className="mb-1 text-[11px] font-medium text-black/60 sm:text-[12px]">{t('username')}</div>
                <div className="rounded-lg border border-black/10 bg-gray-50 px-2.5 py-2 text-[13px] sm:px-3 sm:py-2.5 sm:text-[14px]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[12px] sm:text-[14px]">@{maskedUsername}</span>
                    <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] text-orange-700 sm:px-2 sm:text-[12px]">
                    🔒 {t('hidden')}
                  </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-1 text-[11px] font-medium text-black/60 sm:text-[12px]">{t('status')}</div>
                <div className="rounded-lg border border-green-200 bg-green-50 px-2.5 py-2 text-[12px] font-medium text-green-700 sm:px-3 sm:py-2.5 sm:text-[13px]">
                  ✅ {t('active')}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Link href="/onboarding?step=2" className="btn-primary inline-flex items-center justify-center gap-2 text-[13px] sm:text-[14px]">
                  ↗ {t('viewDetails')}
                </Link>
                <a
                    href={`https://instagram.com/${(me?.partner?.igUsername || '').replace(/^@/, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-black/10 px-2.5 py-2 text-center text-[13px] font-medium hover:bg-black/[0.04] sm:px-3 sm:py-2.5 sm:text-[14px]"
                >
                  {t('openIg')}
                </a>
              </div>
            </div>
          </section>

          {/* My Referral Links */}
          <section className="rounded-xl border border-black/10 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
            <div className="mb-3 flex items-center gap-2 text-[14px] font-semibold sm:text-[15px]">
              <div className="grid h-6 w-6 place-items-center rounded-md bg-orange-500 text-white">🔗</div>
              {t('myRef')}
            </div>
            <p className="text-[11px] text-black/60 sm:text-[12px]">{t('generateTrack')}</p>

            <div className="mt-3 space-y-3">
              <div>
                <div className="mb-1 text-[11px] font-medium text-black/60 sm:text-[12px]">{t('primaryLink')}</div>
                <input
                    readOnly
                    value={primaryLink || '—'}
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-2.5 py-2 text-[13px] sm:px-3 sm:py-2.5 sm:text-[14px]"
                />
              </div>

              <div>
                <div className="mb-1 text-[11px] font-medium text-black/60 sm:text-[12px]">{t('utm')}</div>
                <input
                    value={utm}
                    onChange={(e) => setUtm(e.target.value)}
                    className="w-full rounded-lg border border-black/10 bg-white px-2.5 py-2 text-[13px] sm:px-3 sm:py-2.5 sm:text-[14px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => copy(fullLink || primaryLink)}
                    disabled={!primaryLink}
                    className="rounded-xl border border-black/10 px-2 py-2 text-[12px] font-medium hover:bg-black/[0.04] disabled:opacity-50 sm:px-3 sm:py-2.5 sm:text-[14px]"
                >
                  {t('copyLink')}
                </button>
                <button
                    onClick={openQR}
                    disabled={!primaryLink}
                    className="rounded-xl border border-black/10 px-2 py-2 text-[12px] font-medium hover:bg-black/[0.04] disabled:opacity-50 sm:px-3 sm:py-2.5 sm:text-[14px]"
                >
                  {t('genQR')}
                </button>
              </div>

              <button
                  onClick={makeLink}
                  className="mt-1 w-full rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 px-3 py-2.5 text-[13px] font-semibold text-white shadow hover:opacity-95 sm:px-4 sm:py-3 sm:text-[14px]"
              >
                {t('genNew')}
              </button>
            </div>
          </section>
        </main>

        {/* STATISTICS */}
        <section className="mx-auto mt-4 max-w-6xl rounded-xl border border-black/10 bg-white p-4 shadow-sm sm:mt-6 sm:rounded-2xl sm:p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold sm:text-[16px]">{t('statsTitle')}</h3>
            <div className="flex gap-1.5 text-[12px] sm:gap-2 sm:text-[13px]">
              <button
                  className={`rounded px-2 py-1 sm:px-3 ${range === '7d' ? 'bg-violet-100 text-violet-800' : 'hover:bg-black/[0.04]'}`}
                  onClick={() => setRange('7d')}
              >
                {t('days7')}
              </button>
              <button
                  className={`rounded px-2 py-1 sm:px-3 ${range === '30d' ? 'bg-violet-100 text-violet-800' : 'hover:bg-black/[0.04]'}`}
                  onClick={() => setRange('30d')}
              >
                {t('days30')}
              </button>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:gap-3 sm:grid-cols-5">
            <StatBox label={t('total')} value={fmt(stats?.totals?.followers_total)} />
            <StatBox label={t('growth')} value={`+${fmt(stats?.totals?.followers_delta_sum)}`} />
            <StatBox label={t('attributed')} value={fmt(stats?.totals?.attributed_follows_sum)} />
            <StatBox label={t('clicks')} value={fmt(stats?.totals?.clicks_sum)} />
            <StatBox label={t('ctr')} value={(stats?.totals?.ctr_avg ?? 0).toFixed(2)} />
          </div>

          <Link href={ROUTES.STATS} className="mt-3 inline-block text-[12px] underline sm:text-[13px]">
            {t('more')}
          </Link>
        </section>

        {/* SETTINGS */}
        <section className="mx-auto mt-4 max-w-6xl rounded-xl border border-black/10 bg-white p-4 shadow-sm sm:mt-5 sm:rounded-2xl sm:p-5">
          <div className="mb-3 text-[14px] font-semibold sm:text-[15px]">{t('settings')}</div>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
            <SettingsCard
                title={t('profileInfo')}
                desc={t('updateProfile')}
                actionLabel={t('editProfile')}
                href="/profile"
            />
            <SettingsCard
                title={t('languageRegion')}
                desc="English • India"
                actionLabel={t('changeLanguage')}
                onClick={() => setLang((l) => (l === 'en' ? 'hi' : 'en'))}
            />
            <SettingsCard
                title={t('security')}
                desc="Password, 2FA settings"
                actionLabel={t('securitySettings')}
                href="/security"
            />
          </div>
        </section>
      </div>
  );
}

/* ===== UI helpers ===== */

function Header({ lang, setLang }: { lang: Lang; setLang: (v: Lang) => void }) {
  const t = dict[lang];
  return (
      <header className="mx-auto max-w-6xl rounded-xl border border-black/10 bg-white/80 p-4 text-center shadow-sm backdrop-blur sm:rounded-2xl sm:p-6">
        <div className="flex items-center justify-between">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-violet-600 font-bold text-white sm:h-8 sm:w-8">IG</div>
          <LangToggle value={lang} onChange={setLang} />
        </div>
        <h1 className="mt-2 text-[22px] font-extrabold leading-tight sm:text-[26px] md:text-[28px]">
        <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 bg-clip-text text-transparent">
          {t.welcome}
        </span>
        </h1>
        <p className="mt-1 text-[12px] text-black/70 sm:text-[13px]">{t.subtitle}</p>
      </header>
  );
}

function TabLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active =
      pathname === href ||
      (href === ROUTES.DASHBOARD && (pathname === '/' || pathname.startsWith('/dashboard')));
  return (
      <Link
          href={href}
          className={`rounded-xl border px-2 py-2 text-center text-[13px] font-medium transition-colors sm:px-3 sm:py-2 sm:text-[14px] ${
              active ? 'border-violet-400 bg-white text-black shadow-sm' : 'border-violet-200 bg-white text-black/80'
          }`}
      >
        {label}
      </Link>
  );
}

function LangToggle({ value, onChange }: { value: Lang; onChange: (v: Lang) => void }) {
  return (
      <div className="rounded-full border border-black/10 bg-white/70 p-1 text-[11px] shadow-sm sm:text-[12px]">
        <button
            onClick={() => onChange('en')}
            className={`rounded-full px-1.5 py-1 sm:px-2 ${value === 'en' ? 'bg-violet-600 text-white' : 'text-black/70'}`}
        >
          EN
        </button>
        <button
            onClick={() => onChange('hi')}
            className={`rounded-full px-1.5 py-1 sm:px-2 ${value === 'hi' ? 'bg-violet-600 text-white' : 'text-black/70'}`}
        >
          हिं
        </button>
      </div>
  );
}

function SettingsCard({
                        title, desc, actionLabel, href, onClick,
                      }: { title: string; desc: string; actionLabel: string; href?: string; onClick?: () => void }) {
  const Element: any = href ? Link : 'button';
  const props: any = href ? { href } : { onClick };
  return (
      <div className="rounded-xl border border-black/10 bg-white px-3 py-3 sm:px-4 sm:py-4">
        <div className="text-[13px] font-semibold sm:text-[14px]">{title}</div>
        <div className="mt-1 text-[11px] text-black/60 sm:text-[12px]">{desc}</div>
        <Element
            {...props}
            className="mt-3 rounded-lg border border-black/10 px-2.5 py-2 text-[12px] font-medium hover:bg-black/[0.04] sm:px-3 sm:py-2 sm:text-[13px]"
        >
          {actionLabel}
        </Element>
      </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
      <div className="rounded-lg border border-black/10 bg-white px-2.5 py-2.5 sm:px-3 sm:py-3">
        <div className="text-[11px] text-black/60 sm:text-[12px]">{label}</div>
        <div className="text-[18px] font-semibold leading-tight sm:text-[20px]">{value}</div>
      </div>
  );
}

/* ===== small utils ===== */

function fmt(n?: number) { if (n === undefined || n === null) return '0'; return n.toLocaleString(); }
function maskUsername(u?: string): string {
  if (!u) return 'partner****24';
  const s = u.replace(/^@/, '');
  if (s.length <= 8) return s;
  return `${s.slice(0, 7)}****${s.slice(-2)}`;
}
function isPrimary(x?: PartnerLink) {
  return !!(x && (x.primary || x.isPrimary));
}
