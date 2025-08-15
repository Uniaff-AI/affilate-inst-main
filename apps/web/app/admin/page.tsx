'use client';
import { useEffect, useState } from 'react';
import { API } from '@/lib/api';

export default function Admin() {
  const [partnerId,setPartnerId]=useState('');
  const [igBusinessId,setIgBusinessId]=useState('');
  const [igUsername,setIgUsername]=useState('');
  const [file,setFile]=useState<File|null>(null);
  const [meta,setMeta]=useState({ title:'', durationSec:'30', tags:'', hashtags:'', description:'' });

  async function setIg() {
    const token = localStorage.getItem('token')!;
    const res = await fetch(`${API}/partner/set-ig`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
      body: JSON.stringify({ partnerId, igBusinessId, igUsername })
    });
    alert(res.ok ? 'IG set' : 'Error');
  }

  async function uploadReel(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return alert('Pick a file');
    const token = localStorage.getItem('token')!;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', meta.title);
    fd.append('durationSec', meta.durationSec);
    fd.append('tags', meta.tags);
    fd.append('hashtags', meta.hashtags);
    fd.append('description', meta.description);
    const res = await fetch(`${API}/reels/upload`, { method:'POST', headers: { Authorization:`Bearer ${token}` }, body: fd });
    const data = await res.json(); alert(res.ok ? 'Uploaded' : ('Error: '+JSON.stringify(data)));
  }

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Admin Console</h1>

      <div className="card p-4 mb-6">
        <h2 className="font-semibold mb-2">Set IG Business ID & Username</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="input" placeholder="Partner ID" value={partnerId} onChange={e=>setPartnerId(e.target.value)}/>
          <input className="input" placeholder="IG Business ID" value={igBusinessId} onChange={e=>setIgBusinessId(e.target.value)}/>
          <input className="input sm:col-span-2" placeholder="IG Username" value={igUsername} onChange={e=>setIgUsername(e.target.value)}/>
        </div>
        <button className="btn-primary mt-3" onClick={setIg}>Save</button>
        <p className="text-xs text-gray-500 mt-2">Требует токен пользователя с ролью ADMIN.</p>
      </div>

      <div className="card p-4">
        <h2 className="font-semibold mb-2">Upload Reel</h2>
        <form className="grid gap-3" onSubmit={uploadReel}>
          <input className="input" placeholder="Title" value={meta.title} onChange={e=>setMeta({...meta,title:e.target.value})}/>
          <div className="grid sm:grid-cols-3 gap-2">
            <input className="input" placeholder="Duration (sec)" value={meta.durationSec} onChange={e=>setMeta({...meta,durationSec:e.target.value})}/>
            <input className="input" placeholder="Tags (comma)" value={meta.tags} onChange={e=>setMeta({...meta,tags:e.target.value})}/>
            <input className="input" placeholder="Hashtags (comma)" value={meta.hashtags} onChange={e=>setMeta({...meta,hashtags:e.target.value})}/>
          </div>
          <textarea className="input" placeholder="Description" value={meta.description} onChange={e=>setMeta({...meta,description:e.target.value})}/>
          <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
          <button className="btn-primary w-full">Upload</button>
        </form>
        <p className="text-xs text-gray-500 mt-2">Доступно только ADMIN (проверяется на API).</p>
      </div>
    </div>
  );
}
