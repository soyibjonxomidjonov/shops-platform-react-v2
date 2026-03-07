'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [isDark, setIsDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    setIsDark(saved !== 'light');
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const scrollTo = (id: string) => {
    setMobileMenu(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const T = {
    bg:       isDark ? '#0c0d11' : '#f6f7f9',
    bg2:      isDark ? '#13151c' : '#ffffff',
    bg3:      isDark ? '#1a1d28' : '#f0f2f6',
    border:   isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    text:     isDark ? '#edf0fb' : '#0d0f17',
    text2:    isDark ? '#7880a0' : '#5a6280',
    text3:    isDark ? '#3a4060' : '#aab2cc',
    glass:    isDark ? 'rgba(12,13,17,0.95)' : 'rgba(255,255,255,0.97)',
    green:    '#22c55e',
    greenD:   '#16a34a',
    accent:   isDark ? '#6d8eff' : '#3b5bdb',
    accentBg: isDark ? 'rgba(109,142,255,0.1)' : 'rgba(59,91,219,0.08)',
  };

  const steps = [
    { n:'01', emoji:'✍️', t:"Ro'yxatdan o'ting", d:"30 soniyada. Username va parol yetarli." },
    { n:'02', emoji:'🏪', t:"Do'kon yarating",   d:"Nom va manzil kiriting. Unikal link avtomatik." },
    { n:'03', emoji:'🚀', t:'Savdo boshlang',     d:"Mahsulot qo'shing, linkni ulashing. Tayyor!" },
  ];

  const feats = [
    { e:'🔗', t:'Shaxsiy link',   d:"Har bir do'konga o'zining URL manzili" },
    { e:'📱', t:'Telegram bot',   d:'Har bir buyurtmada darhol xabar' },
    { e:'📸', t:'Rasm + narx',    d:'Mahsulot rasmi, narxi, miqdori — hammasi' },
    { e:'📊', t:'Buyurtmalar',    d:"Barcha buyurtmalarni bir joyda ko'rish" },
    { e:'🌙', t:'Dark / Light',   d:"Kunduzgi va tungi rejim qo'llab-quvvatlanadi" },
    { e:'⚡', t:'Tez va qulay',   d:'Barcha qurilmalarda mukammal ishlaydi' },
  ];

  return (
    <div style={{ background:T.bg, color:T.text, minHeight:'100vh', fontFamily:"'Plus Jakarta Sans',-apple-system,sans-serif", overflowX:'hidden' }}>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        .f1{animation:fadeUp .6s ease .05s both}
        .f2{animation:fadeUp .6s ease .15s both}
        .f3{animation:fadeUp .6s ease .25s both}
        .f4{animation:fadeUp .6s ease .35s both}
        .hover-up{transition:transform .22s,box-shadow .22s;}
        .hover-up:hover{transform:translateY(-5px);}
        .ibtn{border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .18s;}
        .ibtn:hover{opacity:.8;}
        .nav-link{color:${T.text2};font-size:14px;font-weight:500;text-decoration:none;transition:color .2s;background:none;border:none;cursor:pointer;font-family:inherit;padding:0;}
        .nav-link:hover{color:${T.text};}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(128,128,128,.15);border-radius:99px}

        /* ── DESKTOP grid ── */
        .grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
        .feats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
        .stats-row{display:flex;gap:40px;justify-content:center;flex-wrap:wrap;}

        /* ── MOBILE ── */
        @media(max-width:900px){
          .grid3{grid-template-columns:1fr 1fr!important;}
          .feats-grid{grid-template-columns:1fr 1fr!important;}
        }
        @media(max-width:600px){
          .grid3{grid-template-columns:1fr!important;}
          .feats-grid{grid-template-columns:1fr 1fr!important;}
          .hero-btns{flex-direction:column!important;align-items:stretch!important;}
          .nav-desktop{display:none!important;}
          .stats-row{gap:24px!important;}
          .cta-box{padding:36px 22px!important;}
        }
        @media(min-width:601px){
          .mobile-menu{display:none!important;}
          .hamburger{display:none!important;}
        }
      `}</style>

      {/* ════ NAVBAR ════ */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:50,
        height:62,
        background: scrolled ? T.glass : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? `1px solid ${T.border}` : 'none',
        transition:'background .3s,border-color .3s',
      }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px', height:'100%', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:`linear-gradient(135deg,${T.green},${T.greenD})`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 14px rgba(34,197,94,.4)` }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span style={{ fontWeight:900, fontSize:17, color:T.text, letterSpacing:'-.02em' }}>
              Soyibjon<span style={{ color:T.green }}>Shops</span>
            </span>
          </div>

          {/* Desktop nav */}
          <div className="nav-desktop" style={{ display:'flex', gap:28, alignItems:'center' }}>
            <button className="nav-link" onClick={() => scrollTo('how')}>Qanday ishlaydi?</button>
            <button className="nav-link" onClick={() => scrollTo('features')}>Imkoniyatlar</button>
          </div>

          {/* Right */}
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <button className="ibtn" onClick={toggleTheme} style={{ width:36, height:36, borderRadius:10, background:T.bg3, color:T.text2, border:`1px solid ${T.border}` }}>
              {isDark
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              }
            </button>

            {/* Desktop login buttons */}
            <Link href="/login" className="nav-desktop" style={{ padding:'8px 18px', borderRadius:10, border:`1px solid ${T.border}`, color:T.text2, fontWeight:600, fontSize:14, textDecoration:'none', transition:'all .2s', display:'flex', alignItems:'center' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color=T.text}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color=T.text2}}>
              Kirish
            </Link>
            <Link href="/register" style={{ padding:'8px 20px', borderRadius:10, background:`linear-gradient(135deg,${T.green},${T.greenD})`, color:'white', fontWeight:700, fontSize:14, textDecoration:'none', boxShadow:`0 4px 16px rgba(34,197,94,.35)`, whiteSpace:'nowrap' }}>
              Boshlash
            </Link>

            {/* Hamburger (mobile) */}
            <button className="hamburger ibtn" onClick={() => setMobileMenu(v=>!v)} style={{ width:36, height:36, borderRadius:10, background:T.bg3, color:T.text2, border:`1px solid ${T.border}` }}>
              {mobileMenu
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenu && (
          <div className="mobile-menu" style={{ background:T.glass, backdropFilter:'blur(20px)', borderTop:`1px solid ${T.border}`, padding:'16px 24px 20px', display:'flex', flexDirection:'column', gap:4 }}>
            <button onClick={() => scrollTo('how')} style={{ background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:15, fontWeight:600, color:T.text, padding:'12px 0', textAlign:'left', borderBottom:`1px solid ${T.border}` }}>
              🏪 Qanday ishlaydi?
            </button>
            <button onClick={() => scrollTo('features')} style={{ background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:15, fontWeight:600, color:T.text, padding:'12px 0', textAlign:'left', borderBottom:`1px solid ${T.border}` }}>
              ⚡ Imkoniyatlar
            </button>
            <div style={{ display:'flex', gap:10, marginTop:12 }}>
              <Link href="/login" style={{ flex:1, padding:'11px', borderRadius:10, border:`1px solid ${T.border}`, color:T.text2, fontWeight:600, fontSize:14, textDecoration:'none', textAlign:'center' }}>
                Kirish
              </Link>
              <Link href="/register" style={{ flex:1, padding:'11px', borderRadius:10, background:`linear-gradient(135deg,${T.green},${T.greenD})`, color:'white', fontWeight:700, fontSize:14, textDecoration:'none', textAlign:'center', boxShadow:`0 4px 16px rgba(34,197,94,.35)` }}>
                Bepul boshlash
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ════ HERO ════ */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'100px 24px 80px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'20%', left:'10%', width:400, height:400, borderRadius:'50%', background:isDark?'rgba(34,197,94,0.06)':'rgba(34,197,94,0.08)', filter:'blur(80px)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'15%', right:'8%', width:350, height:350, borderRadius:'50%', background:isDark?'rgba(109,142,255,0.07)':'rgba(59,91,219,0.07)', filter:'blur(80px)', pointerEvents:'none' }}/>

        <div style={{ maxWidth:720, position:'relative', zIndex:1, width:'100%' }}>
          <div className="f1" style={{ display:'inline-flex', alignItems:'center', gap:8, background:T.accentBg, border:`1px solid ${isDark?'rgba(109,142,255,.15)':'rgba(59,91,219,.15)'}`, borderRadius:99, padding:'6px 16px', marginBottom:28, fontSize:13, fontWeight:700, color:T.accent }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:T.accent, animation:'pulse 2.5s infinite' }}/>
            O'zbekiston uchun yaratilgan platform
          </div>

          <h1 className="f2" style={{ fontWeight:900, fontSize:'clamp(32px,7vw,72px)', lineHeight:1.08, color:T.text, letterSpacing:'-.04em', marginBottom:24 }}>
            Do'koningizni<br/>
            <span style={{ background:`linear-gradient(135deg,${T.green},#34d399)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>onlayn oching</span>
          </h1>

          <p className="f3" style={{ fontSize:'clamp(14px,2vw,18px)', color:T.text2, lineHeight:1.75, maxWidth:560, margin:'0 auto 40px', fontWeight:400 }}>
            Ro'yxatdan o'ting, do'kon yarating, mahsulotlar qo'shing. Mijozlaringiz sizning shaxsiy linkingiz orqali buyurtma beradi.
          </p>

          <div className="f4 hero-btns" style={{ display:'flex', gap:14, alignItems:'center', justifyContent:'center', flexWrap:'wrap', marginBottom:56 }}>
            <Link href="/register" style={{ padding:'15px 32px', borderRadius:14, background:`linear-gradient(135deg,${T.green},${T.greenD})`, color:'white', fontWeight:800, fontSize:16, textDecoration:'none', boxShadow:`0 8px 30px rgba(34,197,94,.45)`, display:'inline-flex', alignItems:'center', gap:8 }}>
              Bepul boshlash
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
            <button onClick={() => scrollTo('how')} style={{ padding:'15px 32px', borderRadius:14, border:`1.5px solid ${T.border}`, color:T.text2, fontWeight:700, fontSize:16, cursor:'pointer', fontFamily:'inherit', background:'transparent', display:'inline-flex', alignItems:'center', gap:8 }}>
              Qanday ishlaydi? →
            </button>
          </div>

          <div className="stats-row">
            {[['100%','Bepul'],['∞','Mahsulotlar'],['24/7','Ishlaydi']].map(([n,l]) => (
              <div key={l} style={{ textAlign:'center' }}>
                <div style={{ fontWeight:900, fontSize:28, color:T.green, letterSpacing:'-.03em' }}>{n}</div>
                <div style={{ fontSize:13, color:T.text3, marginTop:3, fontWeight:500 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ HOW IT WORKS ════ */}
      <section id="how" style={{ padding:'80px 24px', background:T.bg2, scrollMarginTop:62 }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:T.accentBg, borderRadius:99, padding:'4px 14px', marginBottom:14, fontSize:12, fontWeight:700, color:T.accent, letterSpacing:'.06em', textTransform:'uppercase' as const }}>
              Jarayon
            </div>
            <h2 style={{ fontWeight:900, fontSize:'clamp(24px,4vw,42px)', color:T.text, letterSpacing:'-.03em', marginBottom:14 }}>Qanday ishlaydi?</h2>
            <p style={{ color:T.text2, fontSize:15, maxWidth:480, margin:'0 auto' }}>Atigi 3 qadamda do'koningizni ishga tushiring</p>
          </div>

          <div className="grid3">
            {steps.map((s,i) => (
              <div key={i} className="hover-up" style={{ background:T.bg3, border:`1px solid ${T.border}`, borderRadius:20, padding:'28px 24px', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:14, right:18, fontWeight:900, fontSize:38, color:T.border, fontFamily:'monospace', lineHeight:1 }}>{s.n}</div>
                <div style={{ width:50, height:50, borderRadius:14, background:T.accentBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, marginBottom:18 }}>{s.emoji}</div>
                <div style={{ fontWeight:800, fontSize:17, color:T.text, marginBottom:8, letterSpacing:'-.01em' }}>{s.t}</div>
                <div style={{ fontSize:13, color:T.text2, lineHeight:1.65 }}>{s.d}</div>
                <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${T.green},transparent)`, opacity:i===0?1:i===1?.6:.3 }}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ FEATURES ════ */}
      <section id="features" style={{ padding:'80px 24px', background:T.bg, scrollMarginTop:62 }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:`rgba(34,197,94,${isDark?.08:.06})`, borderRadius:99, padding:'4px 14px', marginBottom:14, fontSize:12, fontWeight:700, color:T.green, letterSpacing:'.06em', textTransform:'uppercase' as const }}>
              Imkoniyatlar
            </div>
            <h2 style={{ fontWeight:900, fontSize:'clamp(24px,4vw,42px)', color:T.text, letterSpacing:'-.03em' }}>Kerakli hamma narsa</h2>
          </div>

          <div className="feats-grid">
            {feats.map((f,i) => (
              <div key={i} className="hover-up" style={{ background:T.bg2, border:`1px solid ${T.border}`, borderRadius:18, padding:'22px 20px', display:'flex', gap:14, alignItems:'flex-start' }}>
                <div style={{ width:44, height:44, borderRadius:13, background:`rgba(34,197,94,${isDark?.08:.06})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{f.e}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:T.text, marginBottom:5 }}>{f.t}</div>
                  <div style={{ fontSize:13, color:T.text2, lineHeight:1.6 }}>{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ CTA ════ */}
      <section style={{ padding:'80px 24px', background:T.bg2 }}>
        <div style={{ maxWidth:680, margin:'0 auto', textAlign:'center', background:T.bg3, border:`1px solid ${T.border}`, borderRadius:28, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, background:`radial-gradient(ellipse at center top,rgba(34,197,94,${isDark?.08:.06}) 0%,transparent 65%)`, pointerEvents:'none' }}/>
          <div className="cta-box" style={{ position:'relative', zIndex:1, padding:'60px 40px' }}>
            <div style={{ width:64, height:64, borderRadius:20, background:`linear-gradient(135deg,${T.green},${T.greenD})`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', boxShadow:`0 8px 28px rgba(34,197,94,.45)`, animation:'float 3.5s ease-in-out infinite' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <h2 style={{ fontWeight:900, fontSize:'clamp(20px,4vw,36px)', color:T.text, marginBottom:14, letterSpacing:'-.03em' }}>
              Biznesingizni hozir onlayn olib chiqing
            </h2>
            <p style={{ color:T.text2, fontSize:15, lineHeight:1.7, marginBottom:32 }}>
              Kredit karta kerak emas. Ro'yxatdan o'ting va 5 daqiqada do'koningizni oching.
            </p>
            <Link href="/register" style={{ display:'inline-flex', alignItems:'center', gap:9, padding:'16px 36px', borderRadius:14, background:`linear-gradient(135deg,${T.green},${T.greenD})`, color:'white', fontWeight:800, fontSize:16, textDecoration:'none', boxShadow:`0 8px 30px rgba(34,197,94,.45)` }}>
              Hoziroq boshlash
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding:'28px 24px', borderTop:`1px solid ${T.border}`, textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:10 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:`linear-gradient(135deg,${T.green},${T.greenD})`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <span style={{ fontWeight:800, fontSize:15, color:T.text, letterSpacing:'-.01em' }}>SoyibjonShops</span>
        </div>
        <p style={{ color:T.text3, fontSize:13 }}>© 2026 SoyibjonShops. Barcha huquqlar himoyalangan.</p>
      </footer>
    </div>
  );
}
