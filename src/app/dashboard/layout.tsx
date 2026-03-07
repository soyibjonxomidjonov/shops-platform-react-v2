'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href:'/dashboard',          label:'Umumiy',      exact:true,
    icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg> },
  { href:'/dashboard/shops',    label:"Do'konlar",   exact:false,
    icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { href:'/dashboard/products', label:'Mahsulotlar', exact:false,
    icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> },
  { href:'/dashboard/orders',   label:'Buyurtmalar', exact:false,
    icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> },
  { href:'/dashboard/profile',  label:'Profil',      exact:false,
    icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
];

function ThemeToggle({ small }: { small?: boolean }) {
  const [theme, setTheme] = useState<'dark'|'light'>('dark');
  useEffect(() => {
    const t = (localStorage.getItem('theme') || 'dark') as 'dark'|'light';
    setTheme(t);
  }, []);
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };
  return (
    <button onClick={toggle} className="theme-toggle" title={theme==='dark'?'Kunduzgi rejim':'Tungi rejim'}
      style={small ? { width:32, height:32 } : {}}>
      {theme === 'dark'
        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
      }
    </button>
  );
}

function SidebarContent({ pathname, onLogout }: { pathname:string; onLogout:()=>void }) {
  return (
    <>
      <Link href="/dashboard" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', marginBottom:28 }}>
        <div style={{ width:34, height:34, borderRadius:10, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 18px var(--accent-gl)', flexShrink:0 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <div>
          <div style={{ fontFamily:'Clash Display', fontWeight:700, fontSize:15, color:'var(--text)', lineHeight:1 }}>Soyibjon</div>
          <div style={{ fontSize:11, color:'var(--text-3)', marginTop:2 }}>Shops</div>
        </div>
      </Link>

      <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase' as const, letterSpacing:'0.1em', marginBottom:6, paddingLeft:12 }}>Menyu</div>
      <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:2 }}>
        {NAV.map(item => {
          const active = item.exact ? pathname===item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`nav-item${active?' active':''}`}>
              {item.icon}{item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ borderTop:'1px solid var(--border)', paddingTop:12, marginTop:14, display:'flex', flexDirection:'column', gap:6 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, paddingLeft:4 }}>
          <ThemeToggle />
          <span style={{ fontSize:13, color:'var(--text-3)' }}>Mavzu</span>
        </div>
        <button onClick={onLogout} className="nav-item" style={{ color:'var(--red)' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Chiqish
        </button>
      </div>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('access_token')) window.location.href = '/login';
  }, []);
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const logout = () => { localStorage.clear(); window.location.href = '/login'; };

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <style suppressHydrationWarning>{`
        .sidebar{position:fixed;top:0;left:0;bottom:0;width:230px;padding:24px 14px;display:flex;flex-direction:column;background:var(--sidebar-bg);border-right:1px solid var(--border);z-index:50;}
        .main{margin-left:230px;flex:1;padding:32px;min-width:0;}
        .topbar{display:none;}
        .mob-overlay{display:none;}
        @media(max-width:768px){
          .sidebar{display:none!important;}
          .main{margin-left:0!important;padding:16px!important;padding-top:68px!important;}
          .topbar{display:flex!important;position:fixed;top:0;left:0;right:0;z-index:100;height:56px;padding:0 16px;background:var(--topbar-bg);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);align-items:center;justify-content:space-between;}
          .mob-overlay{display:flex!important;position:fixed;inset:0;z-index:200;background:var(--overlay);backdrop-filter:blur(4px);}
          .mob-drawer{width:230px;height:100vh;background:var(--bg2);border-right:1px solid var(--border);padding:24px 14px;display:flex;flex-direction:column;animation:slideInLeft .25s cubic-bezier(.22,1,.36,1);}
        }
      `}</style>

      <aside className="sidebar"><SidebarContent pathname={pathname} onLogout={logout} /></aside>

      <div className="topbar">
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <span style={{ fontFamily:'Clash Display', fontWeight:700, fontSize:14 }}>Soyibjon Shops</span>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <ThemeToggle small />
          <button onClick={() => setMobileOpen(true)} style={{ background:'none', border:'none', color:'var(--text-2)', cursor:'pointer', padding:6 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mob-overlay" onClick={() => setMobileOpen(false)}>
          <div className="mob-drawer" onClick={e => e.stopPropagation()}>
            <SidebarContent pathname={pathname} onLogout={logout} />
          </div>
        </div>
      )}

      <main className="main">{children}</main>
    </div>
  );
}
