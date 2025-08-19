export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(API + path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  auth: {
    login: (emailOrPhone: string, password: string) =>
        req('/auth/login', { method: 'POST', body: JSON.stringify({ emailOrPhone, password }) })
            .then(d => { if (typeof window !== 'undefined') localStorage.setItem('token', d.accessToken); return d; }),
    register: (p: { email: string; password: string; name?: string; phone?: string; locale?: string; role?: string }) =>
        req('/auth/register', { method: 'POST', body: JSON.stringify(p) }),
    me: () => req('/partner/me'),
  },
  partner: {
    assignDemo: () => req('/partner/assign-demo', { method: 'POST' }),
    /** nou – ia username+parola one-time din DB (se șterge după livrare) */
    credentials: (consume = true) => req(`/partner/credentials?consume=${consume ? 1 : 0}`),
    completeOnboarding: () => req('/partner/complete-onboarding', { method: 'POST' }),
    links: {
      create: (utm: any) => req('/partner/links', { method: 'POST', body: JSON.stringify(utm) }),
      list: () => req('/partner/links'),
    },
  },
  reels: { list: () => req('/reels') },
  stats: { overview: (range: '7d' | '30d' = '7d') => req(`/stats/partner/overview?range=${range}`) },
};
