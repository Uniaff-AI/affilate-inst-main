'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function Login() {
  const [tab, setTab] = useState<'login'|'register'>('login');
  const [emailOrPhone,setE] = useState(''); 
  const [password,setP] = useState('');
  const [email,setEmail] = useState(''); 
  const [pass2,setPass2] = useState(''); 
  const [name,setName]=useState('');
  
  const goDash = () => (window.location.href='/onboarding');
  
  return (
    <div className="min-h-screen grid place-items-center px-3 py-4 sm:px-4 sm:py-6">
      <div className="max-w-sm w-full card p-4 sm:max-w-md sm:p-6">
        <div className="text-center mb-4 sm:mb-6">
          <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-pink-500 grid place-items-center text-white text-lg sm:w-12 sm:h-12 sm:text-xl">IG</div>
          <h1 className="text-xl font-bold mt-2 sm:text-2xl">Instagram Affiliate</h1>
          <p className="text-xs text-gray-500 sm:text-sm">Grow your network, earn together</p>
        </div>
        
        <div className="grid grid-cols-2 gap-1.5 mb-4 sm:gap-2 sm:mb-6">
          <button 
            onClick={()=>setTab('login')} 
            className={`rounded-lg py-2 text-xs font-medium transition-colors sm:text-sm ${
              tab==='login'
                ?'bg-gray-100 text-gray-900'
                :'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Login
          </button>
          <button 
            onClick={()=>setTab('register')} 
            className={`rounded-lg py-2 text-xs font-medium transition-colors sm:text-sm ${
              tab==='register'
                ?'bg-gray-100 text-gray-900'
                :'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Register
          </button>
        </div>

        {tab==='login' ? (
          <form className="space-y-3 sm:space-y-4" onSubmit={async e=>{
            e.preventDefault(); 
            await api.auth.login(emailOrPhone,password); 
            goDash();
          }}>
            <div>
              <label className="text-xs text-gray-600 sm:text-sm">Email or Phone</label>
              <input 
                className="input mt-1 text-sm sm:text-base" 
                placeholder="Enter your email or phone" 
                value={emailOrPhone} 
                onChange={e=>setE(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 sm:text-sm">Password</label>
              <input 
                type="password" 
                className="input mt-1 text-sm sm:text-base" 
                placeholder="Enter your password" 
                value={password} 
                onChange={e=>setP(e.target.value)} 
              />
            </div>
            <button className="btn-primary w-full text-sm sm:text-base">Sign In as Partner</button>
            <button type="button" className="w-full rounded-lg border py-2.5 text-sm font-medium hover:bg-gray-50 sm:py-3 sm:text-base">
              Admin Access
            </button>
            <div className="text-center text-xs text-gray-500 sm:text-sm">
              <a href="#" className="underline hover:text-gray-700">Forgot your password?</a>
            </div>
            <div className="text-center text-xs text-gray-500 mt-2 sm:text-sm">🇮🇳 English · हिंदी</div>
          </form>
        ) : (
          <form className="space-y-3 sm:space-y-4" onSubmit={async e=>{
            e.preventDefault(); 
            await api.auth.register({email, password: pass2, name}); 
            await api.auth.login(email, pass2); 
            goDash();
          }}>
            <div>
              <label className="text-xs text-gray-600 sm:text-sm">Email</label>
              <input 
                className="input mt-1 text-sm sm:text-base" 
                placeholder="Enter your email"
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 sm:text-sm">Password</label>
              <input 
                type="password" 
                className="input mt-1 text-sm sm:text-base" 
                placeholder="Enter your password"
                value={pass2} 
                onChange={e=>setPass2(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 sm:text-sm">Name</label>
              <input 
                className="input mt-1 text-sm sm:text-base" 
                placeholder="Enter your name"
                value={name} 
                onChange={e=>setName(e.target.value)} 
              />
            </div>
            <button className="btn-primary w-full text-sm sm:text-base">Create account</button>
          </form>
        )}
      </div>
    </div>
  );
}
