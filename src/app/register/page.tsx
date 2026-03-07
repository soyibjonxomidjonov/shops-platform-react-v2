'use client';
import { useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  const handleSubmit = async () => {
    if (!form.username || !form.password) { setError("Username va parol majburiy"); return; }
    if (form.password.length < 8) { setError("Parol kamida 8 ta belgi bo'lishi kerak"); return; }
    setLoading(true); setError('');
    try {
      await auth.register({ username: form.username, password: form.password, email: form.email || undefined });
      const tokens = await auth.login(form.username, form.password);
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      window.location.href = '/dashboard';
    } catch (e: any) {
      setError(e.message || 'Xato yuz berdi');
    } finally { setLoading(false); }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColors = ['', '#f55252', '#f5a623', '#22d3a5'];
  const strengthLabels = ['', 'Zaif', "O'rtacha", 'Kuchli'];

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 40%, rgba(34,211,165,0.06) 0%, transparent 60%)' }} />
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize:'60px 60px' }} />

      <div className="fade-up" style={{ position:'relative', zIndex:1, width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <Link href="/landing" style={{ display:'inline-flex', alignItems:'center', gap:10, textDecoration:'none', marginBottom:28 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px var(--accent-glow)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span style={{ fontFamily:'Clash Display', fontWeight:700, fontSize:17 }}>Soyibjon <span style={{ color:'var(--accent)' }}>Shops</span></span>
          </Link>
          <h1 style={{ fontSize:26, fontFamily:'Clash Display', fontWeight:700, marginBottom:8 }}>Ro'yxatdan o’tish</h1>'
          <p style={{ color:'var(--text-2)', fontSize:14 }}>Bepul hisob yarating</p>
        </div>

        <div className="glass" style={{ padding:32, borderRadius:20 }}>
          {error && (
            <div style={{ background:'rgba(245,82,82,0.1)', border:'1px solid rgba(245,82,82,0.2)', borderRadius:10, padding:'12px 14px', marginBottom:20, fontSize:13, color:'#ff8080', display:'flex', gap:8, alignItems:'flex-start' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink:0, marginTop:1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ whiteSpace:'pre-line' }}>{error}</span>
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:7, letterSpacing:'0.05em', textTransform:'uppercase' }}>Username <span style={{ color:'var(--red)' }}>*</span></label>
              <input className="input" placeholder="username" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} autoComplete="username" />
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:7, letterSpacing:'0.05em', textTransform:'uppercase' }}>Email <span style={{ color:'var(--text-3)', fontSize:11 }}>(ixtiyoriy)</span></label>
              <input className="input" type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} autoComplete="email" />
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:7, letterSpacing:'0.05em', textTransform:'uppercase' }}>Parol <span style={{ color:'var(--red)' }}>*</span></label>
              <div style={{ position:'relative' }}>
                <input
                  className="input"
                  type={show ? 'text' : 'password'}
                  placeholder="kamida 8 belgi"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  autoComplete="new-password"
                  style={{ paddingRight:44 }}
                />
                <button onClick={() => setShow(!show)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', padding:4 }}>
                  {show
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {/* Strength bar */}
              {form.password.length > 0 && (
                <div style={{ marginTop:8, display:'flex', gap:4, alignItems:'center' }}>
                  {[1,2,3].map(n => (
                    <div key={n} style={{ flex:1, height:3, borderRadius:2, background: n <= strength ? strengthColors[strength] : 'rgba(255,255,255,0.08)', transition:'background 0.3s' }} />
                  ))}
                  <span style={{ fontSize:11, color:strengthColors[strength], marginLeft:6, fontWeight:600, minWidth:60 }}>{strengthLabels[strength]}</span>
                </div>
              )}
            </div>

            <button onClick={handleSubmit} disabled={loading} className="btn btn-primary" style={{ width:'100%', padding:'13px', fontSize:15, marginTop:4, justifyContent:'center' }}>
              {loading
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:'spin 0.8s linear infinite' }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                : "Ro'yxatdan o'tish →"}
            </button>
          </div>
        </div>

        <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--text-2)' }}>
          Hisobingiz bormi?{' '}
          <Link href="/login" style={{ color:'var(--accent)', textDecoration:'none', fontWeight:600 }}>Kirish</Link>
        </p>
      </div>
    </div>
  );
}
