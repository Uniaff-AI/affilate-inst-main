'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type Reel = {
    id: string;
    title: string | null;
    description: string | null;
    durationSec: number | null;
    tags: string[] | null;
    hashtags: string[] | null;
    filePath: string;
    previewPath?: string | null;
    thumbnailPath?: string | null;
};

export default function MaterialsPage() {
    const [items, setItems] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                const res = await fetch(`${API}/reels`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    credentials: 'include',
                });
                if (!res.ok) throw new Error(await res.text());
                const data = (await res.json()) as Reel[];
                setItems(Array.isArray(data) ? data : []);
            } catch (e: any) {
                setErr(e?.message || 'Failed to load');
                // Demo data with thumbnails
                setItems([
                    { 
                        id: 'demo1', 
                        title: 'Motivational Quote — Success', 
                        description: 'Inspirational quote about success and achievement', 
                        durationSec: 15, 
                        tags: ['motivation','india'], 
                        hashtags: ['success','india'], 
                        filePath: '/reels/demo.mp4',
                        thumbnailPath: '/thumbnails/motivational.jpg',
                        previewPath: '/previews/motivational.mp4'
                    },
                    { 
                        id: 'demo2', 
                        title: 'Tech Tips — Smartphone', 
                        description: 'Essential smartphone tips and tricks', 
                        durationSec: 30, 
                        tags: ['tech','tips'], 
                        hashtags: ['smartphone'], 
                        filePath: '/reels/demo.mp4',
                        thumbnailPath: '/thumbnails/tech.jpg',
                        previewPath: '/previews/tech.mp4'
                    },
                    { 
                        id: 'demo3', 
                        title: 'Fitness Motivation', 
                        description: 'Get motivated to achieve your fitness goals', 
                        durationSec: 20, 
                        tags: ['fitness','motivation'], 
                        hashtags: ['fitness','motivation'], 
                        filePath: '/reels/demo.mp4',
                        thumbnailPath: '/thumbnails/fitness.jpg',
                        previewPath: '/previews/fitness.mp4'
                    },
                ]);
            } finally { setLoading(false); }
        })();
    }, []);

    const handleReelClick = (reel: Reel) => {
        setSelectedReel(reel);
        setIsPlaying(true);
    };

    const closePreview = () => {
        setSelectedReel(null);
        setIsPlaying(false);
    };

    return (
        <div className="mx-auto max-w-6xl px-2 py-4 sm:px-4 sm:py-6">
            <Hero />
            <TopTabs />
            <SectionCard>
                <SectionHeader title="Available Reels" subtitle="Download and share these curated reels to grow your audience" />

                {loading ? (
                    <CardsSkeleton />
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {items.map((r) => (
                            <ReelCard 
                                key={r.id} 
                                r={r} 
                                onReelClick={handleReelClick}
                            />
                        ))}
                    </div>
                )}

                {!loading && items.length === 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-600 sm:px-4 sm:py-3 sm:text-[14px]">
                        Пока нет материалов.
                    </div>
                )}
                {err && (
                    <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-[13px] text-amber-800 sm:px-4 sm:py-3 sm:text-[14px]">
                        {err}
                    </div>
                )}
            </SectionCard>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:gap-4 md:grid-cols-3">
                <StatTile title="Video Content" subtitle="Reels, stories, posts" value="24" footer="Available items" />
                <StatTile title="Templates" subtitle="Captions, hashtags" value="36" footer="Ready to use" />
                <StatTile title="Guidelines" subtitle="Best practices, tips" value="12" footer="Documents" />
            </div>

            {/* Video Preview Modal */}
            {selectedReel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="relative w-full max-w-2xl">
                        <button
                            onClick={closePreview}
                            className="absolute -top-12 right-0 z-10 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        
                        <div className="relative aspect-[9/16] w-full max-w-sm mx-auto overflow-hidden rounded-2xl bg-black">
                            {isPlaying ? (
                                <video
                                    src={selectedReel.previewPath || selectedReel.filePath}
                                    className="w-full h-full object-cover"
                                    controls
                                    autoPlay
                                    onEnded={() => setIsPlaying(false)}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <button
                                        onClick={() => setIsPlaying(true)}
                                        className="rounded-full bg-white/20 p-4 text-white hover:bg-white/30 transition-colors"
                                    >
                                        <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                            
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                <h3 className="text-white font-semibold text-lg">{selectedReel.title}</h3>
                                <p className="text-white/80 text-sm">{selectedReel.description}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedReel.tags?.map((tag, index) => (
                                        <span key={index} className="px-2 py-1 bg-white/20 rounded-full text-white text-xs">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Hero() {
    return (
        <div className="relative isolate overflow-hidden rounded-xl border border-slate-200 bg-white px-4 py-6 text-center shadow-sm sm:rounded-2xl sm:px-5 sm:py-8">
            <h1 className="text-[24px] font-extrabold leading-tight tracking-tight text-slate-900 sm:text-[28px] md:text-[30px]">
        <span className="bg-gradient-to-r from-violet-700 to-fuchsia-600 bg-clip-text text-transparent">
          Welcome Back, Partner!
        </span>
            </h1>
            <p className="mt-2 text-[13px] leading-6 text-slate-600 sm:text-[14px]">
                Track your Instagram growth and download fresh content
            </p>
        </div>
    );
}

function TopTabs() {
    const pathname = usePathname();
    const items = [
        { href: '/dashboard', label: 'Мой аккаунт' },
        { href: '/subscribers',     label: 'Статистика' },
        { href: '/materials', label: 'Материалы' },
    ];
    return (
        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            {items.map((t) => {
                const active = pathname?.startsWith(t.href);
                return (
                    <Link
                        key={t.href}
                        href={t.href}
                        className={[
                            'h-10 rounded-xl border text-[13px] font-semibold flex items-center justify-center transition sm:h-11 sm:text-[14px]',
                            active
                                ? 'bg-white text-slate-900 border-slate-200 shadow-sm'
                                : 'bg-white/90 text-slate-700 border-slate-200 hover:text-slate-900'
                        ].join(' ')}
                    >
                        {t.label}
                    </Link>
                );
            })}
        </div>
    );
}

function SectionCard({ children }: { children: React.ReactNode }) {
    return (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-5 sm:rounded-2xl sm:p-5">
            {children}
        </div>
    );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="mb-4">
            <div className="text-[16px] leading-5 font-bold tracking-[0.2px] text-slate-900 sm:text-[18px]">{title}</div>
            <div className="mt-1 text-[13px] leading-6 text-slate-600 sm:text-[14px]">{subtitle}</div>
        </div>
    );
}

function ReelCard({ r, onReelClick }: { r: Reel; onReelClick: (reel: Reel) => void }) {
    const [copied, setCopied] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const copyCaption = async () => {
        const caption = (r.description ?? '') + '\n' + (r.hashtags?.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ') ?? '');
        await navigator.clipboard.writeText(caption.trim());
        setCopied(true);
        setTimeout(() => setCopied(false), 800);
    };

    const downloadReel = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch(`${API}/reels/${r.id}/download`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            credentials: 'include',
        });
        if (!res.ok) return alert('Не удалось скачать файл');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const ext = (r.filePath.split('.').pop() || 'mp4').toLowerCase();
        a.href = url;
        a.download = `${(r.title || 'reel').replace(/[^\w\-]+/g, '_')}.${ext}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:scale-[1.02] sm:rounded-2xl">
            {/* Thumbnail with Play Button */}
            <div 
                className="relative aspect-[9/16] w-full overflow-hidden rounded-t-xl bg-gradient-to-b from-black/[5%] to-black/[9%] cursor-pointer sm:rounded-t-2xl"
                onClick={() => onReelClick(r)}
            >
                {r.thumbnailPath ? (
                    <img
                        src={r.thumbnailPath}
                        alt={r.title || 'Reel thumbnail'}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageLoaded(false)}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center">
                        <span className="text-4xl">🎬</span>
                    </div>
                )}
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                    <div className="rounded-full bg-white/90 p-3 text-violet-600 hover:bg-white transition-colors">
                        <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
                
                {/* Duration Badge */}
                <span className="absolute right-2 top-2 rounded-md bg-black text-white px-1.5 py-0.5 text-[10px] font-bold sm:px-2 sm:text-[11px]">
                    {(r.durationSec ?? 0)}s
                </span>
            </div>

            <div className="px-3 pt-2.5 pb-3 sm:px-4 sm:pt-3 sm:pb-4">
                <div
                    className="line-clamp-2 text-[15px] font-semibold leading-tight text-slate-900 sm:text-[16px] cursor-pointer hover:text-violet-600 transition-colors"
                    onClick={() => onReelClick(r)}
                    title={r.title || undefined}
                >
                    {r.title || 'Без названия'}
                </div>
                <div className="mt-1 line-clamp-1 text-[13px] leading-6 text-slate-600 sm:text-[14px]">
                    {r.tags?.join(', ') || '—'}
                </div>
                {r.description && (
                    <div className="mt-2 line-clamp-2 text-[12px] leading-5 text-slate-500 sm:text-[13px]">
                        {r.description}
                    </div>
                )}

                <div className="mt-3 flex items-stretch gap-2">
                    <button
                        onClick={downloadReel}
                        className="h-10 min-w-[120px] w-full rounded-xl bg-violet-700 px-3 text-white text-[14px] font-semibold shadow-sm
                       hover:bg-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-700/70 focus-visible:ring-offset-1
                       sm:h-11 sm:min-w-[150px] sm:px-4 sm:text-[15px]"
                        aria-label="Download reel"
                    >
                        Download
                    </button>

                    <button
                        onClick={copyCaption}
                        className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-[12px] text-slate-800
                       hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-700/70 focus-visible:ring-offset-1
                       sm:h-11 sm:w-11 sm:text-[13px]"
                        title="Copy caption"
                        aria-label="Copy caption"
                    >
                        {copied ? '✓' : '⧉'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatTile({ title, subtitle, value, footer }: { title: string; subtitle: string; value: string; footer: string }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
            <div className="text-[15px] font-semibold text-slate-900 sm:text-[16px]">{title}</div>
            <div className="text-[13px] leading-6 text-slate-600 sm:text-[14px]">{subtitle}</div>
            <div className="my-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">{value}</div>
            <div className="text-[11px] text-slate-500 sm:text-[12px]">{footer}</div>
        </div>
    );
}

function CardsSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl">
                    <div className="aspect-[9/16] w-full animate-pulse rounded-t-xl bg-slate-100 sm:rounded-t-2xl" />
                    <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                        <div className="mt-2.5 h-4 w-3/4 animate-pulse rounded bg-slate-100 sm:mt-3" />
                        <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                        <div className="mt-3 h-10 w-full animate-pulse rounded bg-slate-100 sm:mt-4 sm:h-11" />
                    </div>
                </div>
            ))}
        </div>
    );
}
