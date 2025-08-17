'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/lib/api';

type Reel = { id: string; title: string | null; durationSec: number | null; views?: number | null; previewPath?: string | null; thumbnailPath?: string | null; };
type Creds = { username?: string; password?: string } | null;

export default function Onboarding() {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [busy, setBusy] = useState(false);
    const [me, setMe] = useState<any>(null);
    const [reels, setReels] = useState<Reel[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [showPass, setShowPass] = useState(false);
    const [creds, setCreds] = useState<Creds>(null);
    const [previewReel, setPreviewReel] = useState<Reel | null>(null);
    const triedCredsRef = useRef(false); // ca să nu cerem la infinit

    // Restore one‑time creds după refresh (doar în sesiune)
    useEffect(() => {
        try {
            const s = sessionStorage.getItem('igCreds');
            if (s) setCreds(JSON.parse(s));
        } catch {}
    }, []);

    // Permite ?step=2 în URL
    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const s = Number(params.get('step'));
            if (s >= 1 && s <= 4) setStep(s as 1 | 2 | 3 | 4);
        } catch {}
    }, []);

    useEffect(() => { api.auth.me().then(setMe).catch(() => {}); }, []);
    useEffect(() => { api.reels.list().then(setReels).catch(() => setReels([])); }, []);

    const saveCreds = (c: Creds) => {
        setCreds(c);
        try { sessionStorage.setItem('igCreds', JSON.stringify(c)); } catch {}
    };

    const fetchCredsFromDb = async () => {
        try {
            const r: any = await api.partner.credentials(); // consumă parola din DB
            const c = extractCreds(r);
            if (c.username || c.password) saveCreds(c);
        } catch { /* ignorăm – nu blocăm UI */ }
    };

    const start = async () => {
        setBusy(true);
        try {
            // 1) în mod normal backend-ul întoarce username + PAROLA o singură dată
            const res: any = await api.partner.assignDemo();
            const c = extractCreds(res);
            if (c.username || c.password) saveCreds(c);

            // dacă din orice motiv nu a venit parola aici, o cerem explicit din DB
            if (!c.password) await fetchCredsFromDb();

            // 2) încărcăm restul datelor me()
            const m = await api.auth.me();
            setMe(m);
            setStep(2);
        } finally {
            setBusy(false);
        }
    };

    const nextFromContent = async () => {
        setBusy(true);
        try {
            // Скачиваем выбранные рилсы
            for (const reelId of selected) {
                const reel = reels.find(r => r.id === reelId);
                if (reel) {
                    try {
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/reels/${reelId}/download`, {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            },
                        });
                        
                        if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${reel.title || 'reel'}.mp4`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                        }
                    } catch (error) {
                        console.error(`Ошибка скачивания рила ${reelId}:`, error);
                    }
                }
            }
            
            await api.partner.completeOnboarding();
            setStep(4);
        } finally {
            setBusy(false);
        }
    };

    // Username/Password – preferăm cele capturate (assignDemo / credentials)
    const igUsername: string =
        (creds?.username as string) ||
        (me?.partner?.igUsername as string) ||
        'partner_****_2025';

    const igPassword: string =
        (creds?.password as string) ||
        (me?.partner?.igPassword as string) || // fallback vechi dacă există
        (me?.partner?.password as string) ||   // fallback vechi dacă există
        '';

    // Fallback automat: dacă suntem în Step 2 și parola lipsește, încearcă o singură dată să o iei din DB
    useEffect(() => {
        if (step === 2 && !igPassword && !triedCredsRef.current) {
            triedCredsRef.current = true;
            fetchCredsFromDb();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, igPassword]);

    const igProfileUrl = useMemo(
        () => `https://instagram.com/${igUsername.replace(/^@/, '')}`,
        [igUsername],
    );

    const copy = async (text: string) => {
        try { await navigator.clipboard.writeText(text); } catch {}
    };

    const handleReelPreview = (reel: Reel) => {
        setPreviewReel(reel);
    };

    return (
        <div className="mx-auto min-h-screen max-w-4xl px-4 py-6">
            {/* Header */}
            <div className="relative mb-4 overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-b from-white to-violet-50 px-5 py-7 text-center shadow-sm">
                <h1 className="text-[28px] font-extrabold leading-tight tracking-tight sm:text-[32px]">
          <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 bg-clip-text text-transparent">
            Добро пожаловать в партнёрскую программу!
          </span>
                </h1>
                <p className="mt-2 text-[13px] leading-5 text-black/70">
                    Сейчас поможем настроить аккаунт и начать зарабатывать в Instagram
                </p>
                <div className="pointer-events-none absolute inset-x-0 -top-8 h-16 bg-gradient-to-b from-violet-300/20 to-transparent blur-2xl" />
            </div>

            <Stepper current={step} />

            {step === 1 && (
                <section className="mt-4 rounded-2xl border border-black/10 bg-white/90 p-5 shadow-sm backdrop-blur">
                    <ol className="space-y-4 text-[15px] leading-6 text-black">
                        <li className="flex gap-3"><Badge>1</Badge><div><div className="font-semibold">Получите Instagram аккаунт</div><div className="text-[13px] text-black/65">Мы предоставим готовый аккаунт для работы</div></div></li>
                        <li className="flex gap-3"><Badge color="amber">2</Badge><div><div className="font-semibold">Выберите контент</div><div className="text-[13px] text-black/65">Возьмите 2–3 рилса из пула для публикации</div></div></li>
                        <li className="flex gap-3"><Badge color="blue">3</Badge><div><div className="font-semibold">Добавьте реферальную ссылку</div><div className="text-[13px] text-black/65">При размещении рилсов в аккаунте</div></div></li>
                        <li className="flex gap-3"><Badge color="violet">4</Badge><div><div className="font-semibold">Начните зарабатывать</div><div className="text-[13px] text-black/65">$0.15 за нового подписчика</div></div></li>
                    </ol>

                    <button onClick={start} disabled={busy} className="btn-primary mt-6 w-full text-[15px]">
                        {busy ? 'Подождите…' : 'Начать настройку →'}
                    </button>
                </section>
            )}

            {step === 2 && (
                <section className="mt-4 rounded-2xl border border-black/10 bg-white/90 p-5 shadow-sm backdrop-blur" id="account">
                    <h2 className="text-[20px] font-bold">Ваш Instagram аккаунт готов</h2>

                    <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-2.5 py-1 text-[12px] font-medium text-green-700 ring-1 ring-green-300">
                            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                            Аккаунт активен
                        </div>

                        <div className="mt-3 grid gap-3 text-[14px]">
                            {/* Username */}
                            <div>
                                <label className="mb-1 block text-[12px] font-medium text-black/60">Username</label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/50">@</span>
                                    <input readOnly value={igUsername.replace(/^@/, '')} className="w-full rounded-lg border border-black/10 bg-white px-8 py-2.5 text-[14px] font-medium text-black shadow-inner outline-none transition focus:ring-2 focus:ring-violet-200" />
                                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-[12px] font-medium text-black/70 hover:bg-black/[0.04]" onClick={() => copy(igUsername.replace(/^@/, ''))}>Copy</button>
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="mb-1 block text-[12px] font-medium text-black/60">Password <span className="ml-1 text-[11px] text-black/45">(показывается один раз)</span></label>
                                <div className="relative">
                                    <input readOnly value={igPassword} type={showPass ? 'text' : 'password'} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[14px] font-medium tracking-wider text-black shadow-inner outline-none transition focus:ring-2 focus:ring-violet-200" />
                                    <button type="button" aria-label={showPass ? 'Скрыть пароль' : 'Показать пароль'} onClick={() => setShowPass(v => !v)} className="absolute right-9 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-black/60 hover:bg-black/[0.04] hover:text-black/80">
                                        {showPass ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                    <button type="button" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-[12px] font-medium text-black/70 hover:bg-black/[0.04]" onClick={() => copy(igPassword)} disabled={!igPassword}>Copy</button>
                                </div>
                                {!igPassword && (
                                    <div className="mt-1 text-[12px] text-black/50" aria-live="polite">
                                        Пароль появится здесь, когда бэкенд его вернёт. Если он не появился — обновите страницу: мы пробуем получить его автоматически из базы.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[13px] text-amber-900">
                        <div className="mb-1 font-semibold">Важная информация</div>
                        <ul className="list-disc space-y-1 pl-5">
                            <li>Сохраните данные для входа в безопасном месте</li>
                            <li>Не передавайте данные третьим лицам</li>
                            <li>Используйте аккаунт только для партнёрской программы</li>
                        </ul>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        <a className="btn-primary inline-flex items-center justify-center text-center" href={igProfileUrl} target="_blank" rel="noreferrer">Войти в Instagram</a>
                        <button className="rounded-xl border border-black/10 px-4 py-3 text-[15px] font-medium hover:bg-black/[0.04]" onClick={() => setStep(3)}>Понятно, далее</button>
                    </div>
                </section>
            )}

            {step === 3 && (
                <section className="mt-4 rounded-2xl border border-black/10 bg-white/90 p-5 shadow-sm backdrop-blur">
                    <div className="mx-auto mb-2 grid place-items-center">
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-orange-500/90"><CamIcon /></div>
                    </div>
                    <h2 className="text-center text-[22px] font-bold">Выберите контент для публикации</h2>
                    <p className="mt-1 text-center text-[13px] text-black/65">Выберите рилсы из нашего пула. Рекомендуем начать с 2–3 видео</p>

                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {reels.map(r => {
                            const checked = selected.includes(r.id);
                            return (
                                <label key={r.id} className={`group relative cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-sm transition ${checked ? 'border-violet-500 ring-2 ring-violet-200' : 'border-black/10 hover:shadow-md'}`}>
                                    <input type="checkbox" className="peer sr-only" checked={checked} onChange={e => setSelected(s => e.target.checked ? [...s, r.id] : s.filter(x => x !== r.id))} />
                                    <span className={`absolute left-2 top-2 z-10 grid h-5 w-5 place-items-center rounded-md border text-[12px] font-bold ${checked ? 'border-violet-600 bg-violet-600 text-white' : 'border-black/20 bg-white/95 text-black/50'}`}>{checked ? '✓' : ''}</span>

                                    <div className="relative aspect-[4/5] w-full bg-gradient-to-b from-black/[0.06] to-black/[0.02] cursor-pointer" onClick={() => handleReelPreview(r)}>
                                        {r.thumbnailPath ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/files${r.thumbnailPath}`} alt={r.title || 'Reel'} className="h-full w-full object-cover" loading="lazy" />
                                        ) : (
                                            <div className="absolute inset-0 grid place-items-center"><div className="rounded-md bg-black/5 p-2"><PlayIcon /></div></div>
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                                            <div className="rounded-full bg-white/90 p-2 text-black/70">
                                                <PlayIcon />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1 px-3 pb-3 pt-2">
                                        <div className="line-clamp-2 text-[14px] font-semibold text-black">{r.title || 'Без названия'}</div>
                                        <div className="flex items-center justify-between">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[12px] font-medium text-orange-700"><ClockIcon />{fmtSec(r.durationSec)}</span>
                                            {!!r.views && <span className="text-[12px] text-black/55">{fmtViews(r.views)} views</span>}
                                        </div>
                                    </div>
                                </label>
                            );
                        })}
                    </div>

                    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-[13px] text-blue-900">
                        <div className="mb-1 inline-flex items-center gap-2 font-semibold"><BulbIcon />Рекомендации по выбору контента</div>
                        <ul className="mt-1 list-disc space-y-1 pl-5">
                            <li>Выберите 2–3 рилса для начала</li>
                            <li>Можете добавить больше контента позже</li>
                            <li>Разнообразный контент привлекает больше подписчиков</li>
                        </ul>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-[14px] text-black/70">
                        <span>Выбрано: {selected.length} рилсов</span>
                        <button onClick={nextFromContent} disabled={busy || selected.length === 0} className="btn-primary inline-flex items-center gap-2">
                            {busy ? 'Скачиваем и сохраняем…' : (<><CloudIcon /> Скачать и сохранить</>)}
                        </button>
                    </div>
                </section>
            )}

            {step === 4 && (
                <section className="mt-4 rounded-2xl border border-black/10 bg-white/90 p-7 text-center shadow-sm backdrop-blur">
                    <h2 className="text-[26px] font-extrabold leading-tight text-green-600">Настройка завершена</h2>
                    <ul className="mx-auto mt-5 max-w-lg space-y-2 text-left text-[15px] text-black">
                        <li className="flex items-start gap-2"><CheckIcon className="mt-0.5" /><span>Instagram аккаунт активирован</span></li>
                        <li className="flex items-start gap-2"><CheckIcon className="mt-0.5" /><span>Выбраны рилсы ({selected.length || 2})</span></li>
                        <li className="flex items-start gap-2"><CheckIcon className="mt-0.5" /><span>Система монетизации активна ($0.15/подписчик)</span></li>
                    </ul>
                    <a href="/dashboard" className="btn-primary mt-7 inline-block">Перейти к дашборду →</a>
                </section>
            )}

            {/* Modal для предпросмотра рила */}
            {previewReel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="relative max-h-full max-w-2xl rounded-2xl bg-white p-4">
                        <button
                            onClick={() => setPreviewReel(null)}
                            className="absolute right-2 top-2 z-10 rounded-full bg-black/20 p-2 text-white hover:bg-black/40"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        
                        <div className="aspect-[9/16] w-full max-w-sm mx-auto rounded-xl overflow-hidden bg-black">
                            {previewReel.previewPath ? (
                                <video
                                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/files${previewReel.previewPath}`}
                                    controls
                                    autoPlay
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-white text-center">
                                        <div className="text-4xl mb-2">🎬</div>
                                        <div className="text-sm">Превью недоступно</div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-4 text-center">
                            <h3 className="text-lg font-semibold">{previewReel.title || 'Без названия'}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Длительность: {previewReel.durationSec || 0}с
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/** Normalizează câmpurile posibile pentru username/parolă */
function extractCreds(res: any): { username?: string; password?: string } {
    if (!res) return {};
    const username =
        res?.igUsername ??
        res?.username ??
        res?.login ??
        res?.partner?.igUsername ??
        res?.data?.igUsername;
    const password =
        res?.igPassword ??
        res?.password ??
        res?.pass ??
        res?.partner?.igPassword ??
        res?.data?.igPassword;
    return { username, password };
}

function Stepper({ current }: { current: 1 | 2 | 3 | 4 }) {
    const items = [
        { n: 1, label: 'Добро пожаловать' },
        { n: 2, label: 'Instagram аккаунт' },
        { n: 3, label: 'Выбор контента' },
        { n: 4, label: 'Готово' },
    ] as const;
    return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {items.map((i) => {
                const active = current >= i.n;
                return (
                    <div key={i.n} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-[14px] font-medium transition ${active ? 'border-violet-300 bg-white text-black shadow-sm' : 'border-black/10 bg-white/70 text-black/70'}`}>
                        <span className={`grid h-6 w-6 place-items-center rounded-full text-[12px] font-bold ${active ? 'bg-violet-600 text-white' : 'bg-black/10 text-black/70'}`}>{i.n}</span>
                        <span className="hidden sm:inline">{i.label}</span>
                    </div>
                );
            })}
        </div>
    );
}

function Badge({ children, color = 'green' }: { children: React.ReactNode; color?: 'green' | 'amber' | 'blue' | 'violet' }) {
    const map: Record<string, string> = { green: 'bg-green-600', amber: 'bg-amber-500', blue: 'bg-blue-600', violet: 'bg-violet-600' };
    return <span className={`grid h-7 w-7 place-items-center rounded-full text-[13px] font-bold text-white ${map[color]}`}>{children}</span>;
}

/* Helpers */
function fmtSec(s: number | null) { if (!s || s <= 0) return '0s'; return `${s}s`; }
function fmtViews(v: number) { if (v < 1000) return `${v}`; if (v < 1_000_000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}K`; return `${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`; }

/* SVG icons */
function EyeIcon() { return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" /></svg>); }
function EyeOffIcon() { return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 4.24A10.86 10.86 0 0112 4c6.5 0 10 6 10 6a18.89 18.89 0 01-5.09 5.6M6.49 6.49C3.99 8.05 2 12 2 12a18.77 18.77 0 006.28 5.33" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>); }
function ClockIcon() { return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>); }
function PlayIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-black/30" aria-hidden="true"><path d="M8 5v14l11-7L8 5z" /></svg>); }
function CamIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="14" height="14" rx="3" stroke="white" strokeWidth="2"/><path d="M21 8l-4 3v2l4 3V8z" fill="white"/></svg>); }
function BulbIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 18h6M10 21h4M8 14a6 6 0 118 0c-.9.9-2 2-2 4H10c0-2-1.1-3.1-2-4z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>); }
function CloudIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 18a4 4 0 010-8 6 6 0 0111.3-1.6A4.5 4.5 0 1118 18H7z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 8v7m0 0l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>); }
function CheckIcon({ className = '' }: { className?: string }) { return (<svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6l-11 11-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>); }
