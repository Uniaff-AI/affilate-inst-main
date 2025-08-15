'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

/* --------- types --------- */
type SeriesItem = {
    date: string;
    followersTotal?: number;
    followersDeltaDay?: number;
    attributedFollows?: number;
    clicks?: number;
    visits?: number;
    ctr?: number;
};
type Overview = {
    totals?: {
        followers_total?: number;
        followers_delta_sum?: number;
        attributed_follows_sum?: number;
        clicks_sum?: number;
        ctr_avg?: number;
    };
    series?: SeriesItem[];
};
type Balance = { available: number; pending: number; withdrawnTotal: number; totalEarned?: number };

/* --------- page --------- */
export default function Subs() {
    const [range, setRange] = useState<'7d' | '30d'>('7d');
    const [me, setMe] = useState<any>(null);
    const [ov, setOv] = useState<Overview | null>(null);

    const [bal, setBal] = useState<Balance>({ available: 0, pending: 0, withdrawnTotal: 0, totalEarned: 0 });
    const [payouts, setPayouts] = useState<any[]>([]);
    const [addr, setAddr] = useState(''); // TRC-20
    const [amount, setAmount] = useState<string>('');
    const [busy, setBusy] = useState(false);

    useEffect(() => { api.auth.me().then(setMe).catch(() => {}); }, []);
    useEffect(() => { api.stats.overview(range).then(setOv).catch(() => setOv(null)); }, [range]);
    useEffect(() => { loadMoney(); loadWallet(); loadPayouts(); }, []);

    async function safeCall<T>(fn: any, ...args: any[]): Promise<T | null> {
        try { if (typeof fn !== 'function') return null; return await fn(...args); } catch { return null; }
    }

    async function loadMoney() {
        const res: any =
            (await safeCall(api.partner?.balance)) ||
            (await safeCall(api.payouts?.balance)) ||
            null;
        if (res) {
            setBal({
                available: res.available ?? res.availableBalance ?? 0,
                pending: res.pending ?? res.pendingPayout ?? 0,
                withdrawnTotal: res.withdrawnTotal ?? res.totalWithdrawn ?? 0,
                totalEarned: res.totalEarned ?? res.earnedTotal ?? undefined,
            });
        }
    }
    async function loadWallet() {
        const w: any =
            (await safeCall(api.partner?.wallet?.get)) ||
            (await safeCall(api.wallet?.get)) ||
            null;
        setAddr(w?.trc20Address ?? w?.address ?? '');
    }
    async function saveWallet() {
        await safeCall(api.partner?.wallet?.set, { trc20Address: addr }) ||
        await safeCall(api.wallet?.set, { trc20Address: addr });
    }
    async function loadPayouts() {
        const list: any =
            (await safeCall(api.partner?.payouts?.list)) ||
            (await safeCall(api.payouts?.list)) || [];
        setPayouts(Array.isArray(list) ? list : []);
    }

    /* ---- data derived ---- */
    const followersTotal = ov?.totals?.followers_total ?? last(ov?.series)?.followersTotal ?? 0;
    const rate = me?.partner?.ratePerFollower ?? 0.15;

    const today = last(ov?.series);
    const yday = prelast(ov?.series);
    const todayDelta = today?.followersDeltaDay ?? 0;
    const ydayDelta = yday?.followersDeltaDay ?? 0;
    const weekDelta = sumLast(ov?.series, 'followersDeltaDay', 7);
    const monthDelta = sumLast(ov?.series, 'followersDeltaDay', 30);

    const totalEarnings = (bal.totalEarned ?? followersTotal * rate);
    const todaysEarnings = rate * todayDelta;
    const weeklyEarnings = rate * weekDelta;

    const clicksTotal = ov?.totals?.clicks_sum ?? sumLast(ov?.series, 'clicks', ov?.series?.length || 0);

    /* ---- withdraw button rules ---- */
    const MIN_WITHDRAW = 50;
    const am = Number(amount) || 0;
    const missingAddr = !addr;
    const lowAmount = am < MIN_WITHDRAW;
    const overBalance = am > bal.available;
    const canWithdraw = !missingAddr && !lowAmount && !overBalance && !busy;

    const whyDisabled = useMemo(() => {
        if (busy) return 'Processing...';
        if (missingAddr) return 'Add TRC‑20 USDT address';
        if (lowAmount) return `Min amount is $${MIN_WITHDRAW.toFixed(0)}`;
        if (overBalance) return 'Amount exceeds available balance';
        return '';
    }, [busy, missingAddr, lowAmount, overBalance]);

    const requestWithdraw = async () => {
        if (!canWithdraw) return;
        setBusy(true);
        try {
            await safeCall(api.partner?.payouts?.request, { amount: am, chain: 'TRC20', address: addr }) ||
            await safeCall(api.payouts?.request, { amount: am, chain: 'TRC20', address: addr });
            setAmount('');
            await loadMoney();
            await loadPayouts();
        } finally { setBusy(false); }
    };

    /* ---- payouts derived: labels ca pe machet ---- */
    const sortedPayouts = [...payouts].sort((a, b) =>
        new Date(b.createdAt ?? b.created_at).getTime() - new Date(a.createdAt ?? a.created_at).getTime()
    );
    const lastCompleted = sortedPayouts.find((p) => isCompleted(p.status || p.state));
    const prevCompleted = sortedPayouts.filter((p) => isCompleted(p.status || p.state))[1];
    const firstPending = sortedPayouts.find((p) => isPending(p.status || p.state));
    const withdrawnTotal = bal.withdrawnTotal || sumAmounts(sortedPayouts.filter((p) => isCompleted(p.status || p.state)));

    /* --------- UI --------- */
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-violet-50 px-2 py-3 sm:px-4 sm:py-6">

            {/* HERO + TABS exact ca pe machet */}
            <header className="mx-auto max-w-6xl rounded-xl border border-black/10 bg-white/80 p-4 text-center shadow-sm backdrop-blur sm:rounded-2xl sm:p-6">
                <h1 className="text-[22px] font-extrabold leading-tight sm:text-[26px] md:text-[28px]">
          <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 bg-clip-text text-transparent">
            Welcome Back, Partner!
          </span>
                </h1>
                <p className="mt-1 text-[12px] text-black/70 sm:text-[13px]">Track your Instagram growth and download fresh content</p>

                <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                    <Tab href="/dashboard">Мой аккаунт</Tab>
                    <Tab href="/subscribers" active>Статистика</Tab>
                    <Tab href="/materials">Материалы</Tab>
                </div>
            </header>

            {/* KPI cards - mobile stack, desktop grid */}
            <div className="mx-auto mt-4 grid max-w-6xl gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    title="Total Followers"
                    icon="👥"
                    value={followersTotal.toLocaleString()}
                    sub={diffLine(todayDelta, 'from yesterday')}
                />
                <KpiCard
                    title="Total Earnings"
                    icon="💵"
                    value={fmtMoney(totalEarnings)}
                    sub={percentLine(pct(todayDelta, followersTotal), 'from yesterday')}
                />
                <KpiCard title="Available Balance" icon="💰" value={fmtMoney(bal.available)} />
                <KpiCard
                    title="Referral Clicks"
                    icon="🔗"
                    value={(clicksTotal ?? 0).toLocaleString()}
                    sub={diffLine((today?.clicks ?? 0) - (yday?.clicks ?? 0), 'vs prev. day')}
                />
            </div>

            {/* Earnings Breakdown + Cashout - mobile stack, desktop side by side */}
            <div className="mx-auto mt-4 grid max-w-6xl gap-4 lg:grid-cols-2">
                <section className="rounded-xl border border-black/10 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
                    <h3 className="mb-3 flex items-center gap-2 text-[15px] font-semibold sm:text-[16px]">
                        <span className="text-green-600">$</span> Earnings Breakdown
                    </h3>

                    <div className="overflow-hidden rounded-xl border border-green-200 bg-green-50">
                        <div className="grid grid-cols-2 gap-3 p-3 text-[13px] sm:p-4 sm:text-[14px]">
                            <Row label="Rate per follower" value={fmtMoney(rate)} />
                            <Row label="Total followers" value={followersTotal.toLocaleString()} />
                        </div>
                        <div className="border-t border-green-200 bg-white/70 p-3 text-[13px] font-semibold text-green-700 sm:p-4 sm:text-[14px]">
                            Total earnings <span className="float-right">{fmtMoney(totalEarnings)}</span>
                        </div>
                    </div>

                    <ul className="mt-3 space-y-2 text-[13px] sm:text-[14px]">
                        <li className="flex justify-between">
                            Today's earnings <span className="text-green-600">+{fmtMoney(todaysEarnings)}</span>
                        </li>
                        <li className="flex justify-between">
                            This week <span className="text-green-600">+{fmtMoney(weeklyEarnings)}</span>
                        </li>
                        <li className="flex justify-between">
                            Pending payout <span className="text-orange-600">{fmtMoney(bal.pending)}</span>
                        </li>
                    </ul>
                </section>

                <section className="rounded-xl border border-black/10 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
                    <h3 className="mb-3 text-[15px] font-semibold sm:text-[16px]">Cashout (TRC‑20)</h3>

                    <div className="mb-3 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[12px] sm:px-3 sm:py-2.5 sm:text-[14px]">
                        <span className="text-[11px] sm:text-[12px]">Available for withdrawal • Min $50 • Processing 24–48h</span>
                        <span className="font-semibold text-amber-800 text-[12px] sm:text-[14px]">{fmtMoney(bal.available)}</span>
                    </div>

                    <div className="mb-3">
                        <div className="mb-1 text-[11px] font-medium text-black/60 sm:text-[12px]">TRC‑20 USDT Address</div>
                        <input
                            value={addr}
                            onChange={(e) => setAddr(e.target.value.trim())}
                            onBlur={saveWallet}
                            placeholder="T.... (USDT TRC-20)"
                            className="w-full rounded-lg border border-black/10 bg-white px-2.5 py-2 text-[13px] sm:px-3 sm:py-2.5 sm:text-[14px]"
                        />
                        <div className="mt-1 text-[11px] text-black/50 sm:text-[12px]">Make sure this is a valid USDT TRC‑20 address</div>
                    </div>

                    <div className="mb-3">
                        <div className="mb-1 text-[11px] font-medium text-black/60 sm:text-[12px]">Withdrawal Amount (USD)</div>
                        <input
                            value={amount}
                            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
                            placeholder="50.00"
                            className="w-full rounded-lg border border-black/10 bg-white px-2.5 py-2 text-[13px] sm:px-3 sm:py-2.5 sm:text-[14px]"
                        />
                        {!canWithdraw && whyDisabled && (
                            <div className="mt-1 text-[11px] text-amber-700 sm:text-[12px]">{whyDisabled}</div>
                        )}
                    </div>

                    <button
                        disabled={!canWithdraw}
                        onClick={requestWithdraw}
                        className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 px-3 py-2.5 text-[13px] font-semibold text-white shadow disabled:opacity-50 sm:px-4 sm:py-3 sm:text-[14px]"
                    >
                        {busy ? 'Processing…' : 'Request Withdrawal'}
                    </button>
                </section>
            </div>

            {/* Follower Analytics + Payout History - mobile stack, desktop side by side */}
            <div className="mx-auto mt-4 grid max-w-6xl gap-4 lg:grid-cols-2">
                <section className="rounded-xl border border-black/10 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
                    <h3 className="mb-3 flex items-center gap-2 text-[15px] font-semibold sm:text-[16px]">👥 Follower Analytics</h3>

                    <table className="w-full text-[13px] sm:text-[14px]">
                        <tbody className="[&_tr]:border-b [&_tr:last-child]:border-0 [&_tr]:border-black/10">
                        <Tr k="Today" v={todayDelta} rate={rate} />
                        <Tr k="Yesterday" v={ydayDelta} rate={rate} />
                        <Tr k="This Week" v={weekDelta} rate={rate} />
                        <Tr k="This Month" v={monthDelta} rate={rate} />
                        </tbody>
                    </table>

                    <div className="mt-4 rounded-lg border border-black/10 bg-white px-2.5 py-2 sm:px-3 sm:py-2">
                        <div className="flex items-center justify-between text-[13px] sm:text-[14px]">
                            <span>Total Followers</span>
                            <span className="font-semibold">{followersTotal.toLocaleString()}</span>
                        </div>
                        <div className="text-right text-[11px] text-black/60 sm:text-[12px]">Total value: {fmtMoney(totalEarnings)}</div>
                    </div>

                    <div className="mt-3 text-right">
                        <Link href="/subscribers/report" className="inline-block rounded-lg border border-black/10 px-2.5 py-2 text-[12px] hover:bg-black/[0.04] sm:px-3 sm:py-2 sm:text-[13px]">
                            View Detailed Report
                        </Link>
                    </div>
                </section>

                <section className="rounded-xl border border-black/10 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
                    <h3 className="mb-3 text-[15px] font-semibold sm:text-[16px]">💸 Payout History</h3>

                    <div className="space-y-2">
                        {lastCompleted && (
                            <HistoryItem label="Last Payout" p={lastCompleted} status="completed" />
                        )}
                        {prevCompleted && (
                            <HistoryItem label="Previous Payout" p={prevCompleted} status="completed" />
                        )}
                        {firstPending && (
                            <HistoryItem label="Pending" p={firstPending} status="pending" />
                        )}
                        {!lastCompleted && !prevCompleted && !firstPending && (
                            <div className="rounded-lg border border-black/10 bg-white px-2.5 py-2 text-[13px] text-black/60 sm:px-3 sm:py-2.5 sm:text-[14px]">
                                No payouts yet
                            </div>
                        )}
                    </div>

                    <div className="mt-3 rounded-lg border border-black/10 bg-gray-50 px-2.5 py-2 text-[13px] sm:px-3 sm:py-2 sm:text-[14px]">
                        <div className="flex items-center justify-between">
                            <span>Total Withdrawn</span>
                            <span className="font-semibold">{fmtMoney(withdrawnTotal)}</span>
                        </div>
                    </div>

                    <Link href="/payouts" className="mt-2 inline-block text-[12px] underline sm:text-[13px]">
                        View All Transactions
                    </Link>
                </section>
            </div>
        </div>
    );
}

/* ---------- small UI helpers ---------- */

function Tab({ href, active = false, children }: { href: string; active?: boolean; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className={`rounded-xl border px-2 py-2 text-center text-[13px] font-medium transition-colors sm:px-3 sm:py-2 sm:text-[14px] ${
                active ? 'border-violet-400 bg-white text-black shadow-sm' : 'border-violet-200 bg-white text-black/80'
            }`}
        >
            {children}
        </Link>
    );
}
function KpiCard({ title, value, sub, icon }: { title: string; value: string; sub?: React.ReactNode; icon?: string }) {
    return (
        <div className="rounded-xl border border-black/10 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4">
            <div className="flex items-center justify-between">
                <div className="text-[11px] font-medium text-black/60 sm:text-[12px]">{title}</div>
                <div className="grid h-6 w-6 place-items-center rounded-md bg-violet-100 text-[12px] sm:h-7 sm:w-7 sm:text-[14px]">{icon}</div>
            </div>
            <div className="mt-1 text-[20px] font-extrabold sm:text-[22px]">{value}</div>
            {sub && <div className="mt-1 text-[11px] sm:text-[12px]">{sub}</div>}
        </div>
    );
}
function Row({ label, value }: { label: string; value: string | number }) {
    return <div className="flex items-center justify-between"><span>{label}</span><span className="font-medium">{value}</span></div>;
}
function Tr({ k, v, rate }: { k: string; v: number; rate: number }) {
    const money = v * rate;
    return (
        <tr>
            <td className="p-1.5 sm:p-2">{k}</td>
            <td className="p-1.5 text-right sm:p-2">
        <span className={v >= 0 ? 'text-green-600' : 'text-red-600'}>
          {v >= 0 ? `+${v}` : v}
        </span>
                <span className="text-black/50"> ({v >= 0 ? '+' : ''}{fmtMoney(money)})</span>
            </td>
        </tr>
    );
}
function HistoryItem({ label, p, status }: { label: string; p: any; status: 'completed' | 'pending' }) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-black/10 bg-white px-2.5 py-2 text-[13px] sm:px-3 sm:py-2.5 sm:text-[14px]">
            <div>
                <div className="font-medium">{label}</div>
                <div className="text-[11px] text-black/60 sm:text-[12px]">{formatDate(p.createdAt ?? p.created_at)}</div>
            </div>
            <div className="text-right">
                <div className="font-semibold">{fmtMoney(p.amount)}</div>
                <span className={`ml-auto mt-0.5 block w-fit rounded-full px-1.5 py-0.5 text-[10px] sm:px-2 sm:text-[12px] ${
                    status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'
                }`}>
          {status === 'completed' ? 'Completed' : 'Pending'}
        </span>
            </div>
        </div>
    );
}

/* ---------- calc helpers ---------- */
function last<T>(arr?: T[] | null): T | undefined { if (!arr?.length) return undefined; return arr[arr.length - 1]; }
function prelast<T>(arr?: T[] | null): T | undefined { if (!arr?.length) return undefined; return arr[arr.length - 2]; }
function sumLast(series: SeriesItem[] | undefined, key: keyof SeriesItem, n: number) {
    if (!series?.length) return 0;
    return series.slice(-n).reduce((acc, s) => acc + (Number(s[key]) || 0), 0);
}
function pct(delta: number, total: number) { if (!total) return 0; return (delta / total) * 100; }
function fmtMoney(n: number | undefined) { const x = Number(n || 0); return `$${x.toFixed(2)}`; }
function diffLine(n: number, tail: string) {
    const sign = n >= 0 ? '+' : '';
    return <span className={n >= 0 ? 'text-green-600' : 'text-red-600'}>{sign}{n} <span className="text-black/50">{tail}</span></span>;
}
function percentLine(n: number, tail: string) {
    const sign = n >= 0 ? '+' : '';
    return <span className={n >= 0 ? 'text-green-600' : 'text-red-600'}>{sign}{n.toFixed(0)}% <span className="text-black/50">{tail}</span></span>;
}
function formatDate(d?: string) { if (!d) return ''; const x = new Date(d); return x.toISOString().slice(0, 10); }
function sumAmounts(list: any[]) { return list.reduce((a, p) => a + Number(p.amount || 0), 0); }
function isCompleted(status?: string) { const s = (status || '').toLowerCase(); return s.includes('complete'); }
function isPending(status?: string) { const s = (status || '').toLowerCase(); return s.includes('pending') || s.includes('process'); }
