'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { shops, products, orders } from '@/lib/api';
import { Shop, Product } from '@/types';

type CartItem = { product: Product; qty: number };
type Fly = { id: number; x: number; y: number; tx: number; ty: number };

export default function ShopPage({ params }: { params: { slug: string } }) {
  const [shop, setShop]                 = useState<Shop | null>(null);
  const [prods, setProds]               = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);
  const [notFound, setNotFound]         = useState(false);
  const [cart, setCart]                 = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen]         = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [detailProd, setDetailProd]     = useState<Product | null>(null);
  const [search, setSearch]             = useState('');
  const [searchOpen, setSearchOpen]     = useState(false);
  const [ordering, setOrdering]         = useState(false);
  const [orderOk, setOrderOk]           = useState(false);
  const [form, setForm]                 = useState({ first_name:'', phone_number:'', address:'' });
  const [isDark, setIsDark]             = useState(false);
  const [flies, setFlies]               = useState<Fly[]>([]);
  const [cartPop, setCartPop]           = useState(false);
  const cartRef                         = useRef<HTMLButtonElement>(null);
  const flyId                           = useRef(0);

  const API = (process.env.NEXT_PUBLIC_API_URL || 'https://api.shops-platform.uz/api/v1').replace('/api/v1','');

  // Narxni chiroyli formatlash: 1 234 567 so'm
  const fmt = (n: number | string) => {
    const num = Math.round(Number(n));
    return num.toLocaleString('ru-RU'); // bo'sh joy bilan ajratadi: 1 234 567
  };

  useEffect(() => {
    const saved = localStorage.getItem('shopTheme');
    setIsDark(saved === 'dark');
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('shopTheme', next ? 'dark' : 'light');
  };

  useEffect(() => {
    (async () => {
      try {
        const s = await shops.getBySlug(params.slug);
        if (!s) { setNotFound(true); return; }
        setShop(s);
        const p = await products.list({ shop: String(s.id) });
        setProds(p.results);
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    })();
  }, [params.slug]);

  const getQty = useCallback((id: number) => cart.find(c => c.product.id === id)?.qty || 0, [cart]);

  const flyToCart = (e: React.MouseEvent) => {
    if (!cartRef.current) return;
    const r = cartRef.current.getBoundingClientRect();
    const id = ++flyId.current;
    setFlies(f => [...f, { id, x: e.clientX, y: e.clientY, tx: r.left + r.width / 2 - e.clientX, ty: r.top + r.height / 2 - e.clientY }]);
    setTimeout(() => {
      setFlies(f => f.filter(i => i.id !== id));
      setCartPop(true);
      setTimeout(() => setCartPop(false), 400);
    }, 600);
  };

  const addItem = (prod: Product, e?: React.MouseEvent) => {
    if (getQty(prod.id) >= prod.stock) return;
    if (e) flyToCart(e);
    setCart(c => {
      const ex = c.find(i => i.product.id === prod.id);
      if (ex) return c.map(i => i.product.id === prod.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { product: prod, qty: 1 }];
    });
  };

  const subItem = (id: number) => setCart(c => {
    const ex = c.find(i => i.product.id === id);
    if (!ex || ex.qty <= 1) return c.filter(i => i.product.id !== id);
    return c.map(i => i.product.id === id ? { ...i, qty: i.qty - 1 } : i);
  });

  const total = cart.reduce((s, i) => s + Number(i.product.price) * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  const placeOrder = async () => {
    if (!shop) return;
    setOrdering(true);
    try {
      // Backend IntegerField max: 2147483647
      // item_total va total_price ni so'mga emas, pastadagi kabi yuboramiz
      const safeInt = (n: number) => Math.min(Math.round(n), 2147483647);
      await orders.create({
        ...form, shop: shop.id,
        items_json: cart.map(i => ({
          product_id:   i.product.id,
          product_name: i.product.name,
          price:        safeInt(Number(i.product.price)),
          quantity:     i.qty,
          item_total:   safeInt(Number(i.product.price) * i.qty),
          unity:        i.product.unity,
        })),
        total_price: safeInt(total),
        status: 'yangi',
      });
      setOrderOk(true); setCart([]); setCheckoutOpen(false);
    } finally { setOrdering(false); }
  };

  const imgUrl = (s: string) => (!s || s.startsWith('http') || s.startsWith('data:')) ? s : API + s;
  const filtered = prods.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const formOk = form.first_name.trim() && form.phone_number.trim() && form.address.trim();

  const accent   = '#6366f1';
  const accentDk = '#4f46e5';

  const C = {
    pageBg:   isDark ? '#0d0e12' : '#f5f6fa',
    navBg:    isDark ? 'rgba(13,14,18,0.97)' : 'rgba(255,255,255,0.97)',
    card:     isDark ? '#16181f' : '#ffffff',
    card2:    isDark ? '#1c1e28' : '#f2f3f8',
    input:    isDark ? '#1c1e28' : '#f2f3f8',
    overlay:  isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.55)',
    border:   isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
    text:     isDark ? '#eceef8' : '#111827',
    text2:    isDark ? '#6b728a' : '#6b7280',
    textMute: isDark ? '#2e3147' : '#d1d5db',
    accentLt: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)',
    green:    '#22c55e',
    greenLt:  isDark ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.08)',
    red:      '#ef4444',
    amber:    '#f59e0b',
    shadow:   isDark ? '0 2px 16px rgba(0,0,0,0.5)'   : '0 2px 16px rgba(0,0,0,0.06)',
    shadowHv: isDark ? '0 12px 40px rgba(0,0,0,0.6)'  : '0 12px 40px rgba(0,0,0,0.12)',
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', background:C.pageBg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14 }}>
      <style suppressHydrationWarning>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width:40,height:40,borderRadius:'50%',borderTop:`2.5px solid ${accent}`,borderRight:`2.5px solid transparent`,borderBottom:`2.5px solid transparent`,borderLeft:`2.5px solid transparent`,animation:'spin .8s linear infinite' }}/>
      <span style={{ color:C.text2, fontSize:13, fontFamily:'system-ui' }}>Yuklanmoqda...</span>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight:'100vh', background:C.pageBg, display:'flex', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center' }}>
      <div style={{ fontFamily:'system-ui' }}>
        <div style={{ fontSize:64, marginBottom:16 }}>🏪</div>
        <h2 style={{ color:C.text, fontWeight:700, fontSize:20, marginBottom:8 }}>Do'kon topilmadi</h2>
        <p style={{ color:C.text2, fontSize:14 }}>Bu manzil bo'yicha do'kon mavjud emas</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:C.pageBg, color:C.text, fontFamily:"'Inter',system-ui,-apple-system,sans-serif" }}>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        @keyframes spin       { to { transform:rotate(360deg) } }
        @keyframes fadeIn     { from { opacity:0 } to { opacity:1 } }
        @keyframes fadeUp     { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideUp    { from { transform:translateY(100%) } to { transform:translateY(0) } }
        @keyframes slideRight { from { transform:translateX(100%) } to { transform:translateX(0) } }
        @keyframes slideDown  { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes scaleIn    { from { opacity:0; transform:scale(.95) } to { opacity:1; transform:scale(1) } }
        @keyframes popBounce  { 0%{transform:scale(1)} 35%{transform:scale(1.28)} 70%{transform:scale(.93)} 100%{transform:scale(1)} }
        @keyframes blink      { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes flyDot     { to { transform:translate(var(--tx),var(--ty)) scale(0); opacity:0 } }

        /* ─ Wrapper ─ */
        .shop-wrap  { max-width:1400px; margin:0 auto; padding:0 24px; }
        .nav-inner  { max-width:1400px; margin:0 auto; padding:0 16px; width:100%;
                      display:flex; align-items:center; justify-content:space-between; gap:8; }

        /* ─ Hero stats ─ */
        .stat-cards { display:flex; gap:10px; flex-wrap:wrap; }
        .stat-card  { display:flex; align-items:center; gap:10px;
                      background:${isDark?'rgba(0,0,0,.28)':'rgba(255,255,255,.65)'};
                      backdrop-filter:blur(6px);
                      border:1px solid ${isDark?'rgba(255,255,255,.06)':'rgba(255,255,255,.9)'};
                      border-radius:14px; padding:10px 16px; flex:1; min-width:100px; }

        /* ─ Product card ─ */
        .pcard {
          background:${C.card}; border:1px solid ${C.border}; border-radius:18px;
          overflow:hidden; display:flex; flex-direction:column; cursor:pointer;
          transition:transform .25s cubic-bezier(.4,0,.2,1), box-shadow .25s, border-color .25s;
          position:relative; animation:fadeUp .45s cubic-bezier(.4,0,.2,1) both;
        }
        .pcard:hover {
          transform:translateY(-5px);
          box-shadow:${C.shadowHv};
          border-color:${isDark ? 'rgba(255,255,255,.13)' : 'rgba(0,0,0,.11)'};
        }
        .pcard:active  { transform:translateY(-2px) scale(.99); }
        .pcard:hover .pimg { transform:scale(1.06); }
        .pimg { transition:transform .5s cubic-bezier(.4,0,.2,1); width:100%; height:100%; object-fit:cover; }

        /* ─ Buttons ─ */
        .btn  { border:none; cursor:pointer; font-family:inherit; font-weight:600;
                transition:filter .18s, transform .18s; position:relative; overflow:hidden; }
        .btn:hover:not(:disabled)  { filter:brightness(1.07); }
        .btn:active:not(:disabled) { transform:scale(.97); }

        .ibtn { border:none; cursor:pointer; display:flex; align-items:center;
                justify-content:center; transition:opacity .18s, transform .18s; font-family:inherit; }
        .ibtn:hover  { opacity:.75; }
        .ibtn:active { transform:scale(.9); }

        .qbtn { border:none; cursor:pointer; font-family:inherit; font-weight:700;
                display:flex; align-items:center; justify-content:center;
                transition:background .18s, transform .15s; }
        .qbtn:hover:not(:disabled)  { opacity:.8; }
        .qbtn:active:not(:disabled) { transform:scale(.82); }

        /* ─ Input ─ */
        .inp { font-family:inherit; outline:none; transition:border-color .2s, box-shadow .2s; }
        .inp:focus { border-color:${accent} !important; box-shadow:0 0 0 3px rgba(99,102,241,.14) !important; }

        /* ─ Price gradient ─ */
        .price-grad {
          background: linear-gradient(135deg, ${accent} 0%, #818cf8 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }

        /* ─ Scrollbar ─ */
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:${C.textMute}; border-radius:99px; }
        ::-webkit-scrollbar-track { background:transparent; }

        /* ─ Product grid ─ */
        .product-grid {
          display:grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap:18px;
        }

        /* ─ Desktop ─ */
        @media (min-width:1200px) { .product-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (min-width:900px) and (max-width:1199px) { .product-grid { grid-template-columns: repeat(3, 1fr); } }

        /* ─ Tablet ─ */
        @media (min-width:540px) and (max-width:899px) {
          .product-grid { grid-template-columns: repeat(2, 1fr); gap:14px; }
          .stat-cards { flex-direction:row; }
        }

        /* ─ Mobile ─ */
        @media (max-width:539px) {
          .product-grid { grid-template-columns: 1fr 1fr; gap:10px; }
          .shop-wrap { padding:0 10px; }
          .nav-inner { padding:0 10px; }
          .stat-cards { flex-direction:column; gap:8px; }
          .stat-card  { padding:8px 14px; }
        }
        @media (max-width:360px) {
          .product-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* fly particles */}
      {flies.map(f => (
        <div key={f.id} style={{
          position:'fixed', left:f.x-10, top:f.y-10, width:20, height:20, borderRadius:'50%',
          background:`linear-gradient(135deg,${accent},${accentDk})`,
          zIndex:9999, pointerEvents:'none', boxShadow:`0 0 10px ${accent}99`,
          animation:'flyDot .6s cubic-bezier(.4,0,.15,1) forwards',
          ['--tx' as any]:`${f.tx}px`, ['--ty' as any]:`${f.ty}px`,
        }}/>
      ))}

      {/* ════════ NAVBAR ════════ */}
      <header style={{
        position:'sticky', top:0, zIndex:60,
        background:C.navBg, backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
        borderBottom:`1px solid ${C.border}`,
        height:62,
      }}>
        <div className="nav-inner">
          {/* Shop logo */}
          <div style={{ display:'flex', alignItems:'center', gap:11, minWidth:0, flex:1 }}>
            <div style={{
              width:40, height:40, borderRadius:12, flexShrink:0,
              background:`linear-gradient(135deg,${accent},${accentDk})`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontWeight:800, fontSize:18, color:'white',
              boxShadow:`0 3px 12px ${accent}55`,
            }}>{shop!.name[0].toUpperCase()}</div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:15, letterSpacing:'-.015em', color:C.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {shop!.name}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:1 }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:C.green, animation:'blink 2.2s ease-in-out infinite' }}/>
                <span style={{ fontSize:11, color:C.text2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {shop!.address || "Online do'kon"}
                </span>
              </div>
            </div>
          </div>

          {/* Nav icons */}
          <div style={{ display:'flex', gap:7, alignItems:'center', flexShrink:0 }}>
            <button className="ibtn" onClick={() => setSearchOpen(v=>!v)} style={{
              width:38, height:38, borderRadius:10,
              background:searchOpen ? C.accentLt : C.card2,
              color:searchOpen ? accent : C.text2,
              border:`1px solid ${searchOpen ? accent+'33' : C.border}`,
            }}>
              {searchOpen
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              }
            </button>

            <button className="ibtn" onClick={toggleTheme} style={{
              width:38, height:38, borderRadius:10, background:C.card2, color:C.text2, border:`1px solid ${C.border}`,
            }}>
              {isDark
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              }
            </button>

            <div style={{ position:'relative', flexShrink:0, marginRight:6 }}>
              <button ref={cartRef} className="btn" onClick={() => setCartOpen(true)} style={{
                height:38,
                padding:count>0 ? '0 14px 0 10px' : '0 11px',
                borderRadius:10, fontFamily:'inherit',
                background:count>0 ? `linear-gradient(135deg,${accent},${accentDk})` : C.card2,
                color:count>0 ? 'white' : C.text2,
                border:`1px solid ${count>0 ? 'transparent' : C.border}`,
                display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600,
                boxShadow:count>0 ? `0 4px 18px ${accent}44` : 'none',
                animation:cartPop ? 'popBounce .38s ease' : 'none',
                maxWidth:200, overflow:'hidden',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ flexShrink:0 }}>
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 001.63 1.61h9.72a2 2 0 001.63-1.61L23 6H6"/>
                </svg>
                {count>0 && (
                  <span style={{ fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {fmt(total)} so'm
                  </span>
                )}
              </button>
              {count>0 && (
                <span style={{
                  position:'absolute', top:2, right:-8,
                  background:C.red, color:'white', borderRadius:'50%',
                  width:18, height:18, fontSize:10, fontWeight:800,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:`0 2px 8px ${C.red}88`,
                  zIndex:10, pointerEvents:'none',
                }}>{count > 99 ? '99+' : count}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search bar */}
      {searchOpen && (
        <div style={{ background:C.card, borderBottom:`1px solid ${C.border}`, padding:'10px 0', animation:'slideDown .18s ease' }}>
          <div className="shop-wrap">
            <div style={{ position:'relative', maxWidth:560 }}>
              <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}
                width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.textMute} strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input autoFocus className="inp" placeholder="Mahsulot qidirish..." value={search} onChange={e=>setSearch(e.target.value)}
                style={{ width:'100%', background:C.input, border:`1.5px solid ${C.border}`, borderRadius:10,
                  color:C.text, paddingLeft:36, paddingRight:14, paddingTop:10, paddingBottom:10, fontSize:14 }}/>
            </div>
          </div>
        </div>
      )}

      {/* ════════ HERO ════════ */}
      <div className="shop-wrap" style={{ paddingTop:20, paddingBottom:0 }}>
        <div style={{
          borderRadius:22, overflow:'hidden', position:'relative',
          padding:'36px 40px',
          background: isDark
            ? 'linear-gradient(135deg,#0f1023 0%,#16183a 45%,#1a1045 100%)'
            : 'linear-gradient(135deg,#eef2ff 0%,#e0e7ff 50%,#ede9fe 100%)',
          border:`1px solid ${isDark ? 'rgba(99,102,241,.18)' : 'rgba(99,102,241,.2)'}`,
        }}>
          {/* blobs */}
          <div style={{ position:'absolute', right:-50, top:-50, width:260, height:260, borderRadius:'50%', background:isDark?'rgba(99,102,241,.07)':'rgba(99,102,241,.09)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', right:80, bottom:-80, width:200, height:200, borderRadius:'50%', background:isDark?'rgba(129,140,248,.05)':'rgba(129,140,248,.1)', pointerEvents:'none' }}/>

          <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'space-between', gap:24, flexWrap:'wrap' as const }}>
            <div style={{ maxWidth:560 }}>
              {/* status pill */}
              <div style={{
                display:'inline-flex', alignItems:'center', gap:6,
                background:isDark?'rgba(99,102,241,.15)':'rgba(99,102,241,.1)',
                border:`1px solid ${isDark?'rgba(99,102,241,.3)':'rgba(99,102,241,.22)'}`,
                borderRadius:99, padding:'4px 12px', marginBottom:16,
              }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:C.green, animation:'blink 2s infinite' }}/>
                <span style={{ fontSize:11, fontWeight:600, color:isDark?'#a5b4fc':'#4f46e5', textTransform:'uppercase' as const, letterSpacing:'.07em' }}>
                  Ochiq · {prods.length} ta mahsulot
                </span>
              </div>

              <h1 style={{
                fontWeight:800, fontSize:'clamp(22px,3.5vw,36px)',
                color:isDark?'#f0f4ff':'#1e1b4b',
                lineHeight:1.2, letterSpacing:'-.025em', marginBottom:12,
              }}>
                {shop!.description || shop!.name}
              </h1>

              {shop!.address && (
                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isDark?'#818cf8':'#6366f1'} strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span style={{ fontSize:13, color:isDark?'#818cf8':'#4f46e5', fontWeight:500 }}>{shop!.address}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="stat-cards">
              {[
                { icon:'📦', val:prods.length,                       lbl:'Mahsulot' },
                { icon:'✅', val:prods.filter(p=>p.stock>0).length,  lbl:'Mavjud' },
                { icon:'🛒', val:count,                              lbl:'Savatchada' },
              ].map(s => (
                <div key={s.lbl} className="stat-card">
                  <span style={{ fontSize:20 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontWeight:800, fontSize:22, lineHeight:1, color:isDark?'white':'#1e1b4b' }}>{s.val}</div>
                    <div style={{ fontSize:11, color:isDark?'#818cf8':'#6366f1', fontWeight:500, marginTop:2 }}>{s.lbl}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ════════ PRODUCTS ════════ */}
      <main className="shop-wrap" style={{ paddingTop:24, paddingBottom:48 }}>
        {/* section header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <div>
            <h2 style={{ fontWeight:700, fontSize:18, color:C.text, letterSpacing:'-.012em' }}>Mahsulotlar</h2>
            <p style={{ fontSize:13, color:C.text2, marginTop:3 }}>{filtered.length} ta topildi</p>
          </div>
          {search && (
            <button className="ibtn" onClick={() => setSearch('')}
              style={{ fontSize:12, color:C.text2, background:C.card2, padding:'6px 12px', borderRadius:8, border:`1px solid ${C.border}` }}>
              Tozalash ✕
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', paddingTop:100, color:C.text2 }}>
            <div style={{ fontSize:52, marginBottom:16, opacity:.35 }}>📦</div>
            <p style={{ fontSize:16, fontWeight:600 }}>Mahsulot topilmadi</p>
            <p style={{ fontSize:13, color:C.textMute, marginTop:8 }}>Boshqa kalit so'z bilan qidiring</p>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map((prod, idx) => {
              const q    = getQty(prod.id);
              const sold = prod.stock === 0;
              const low  = prod.stock > 0 && prod.stock <= 5;
              return (
                <div key={prod.id} className="pcard" style={{ animationDelay:`${idx*.05}s` }}>

                  {/* image */}
                  <div onClick={() => setDetailProd(prod)}
                    style={{ height:'clamp(160px,40vw,220px)', background:C.card2, position:'relative', overflow:'hidden', flexShrink:0 }}>
                    {prod.image
                      ? <img src={imgUrl(prod.image)} alt={prod.name} className="pimg"/>
                      : (
                        <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10 }}>
                          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={C.textMute} strokeWidth=".9">
                            <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/>
                          </svg>
                          <span style={{ fontSize:12, color:C.textMute, fontWeight:500 }}>Rasm yo'q</span>
                        </div>
                      )
                    }
                    {sold && (
                      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.58)', backdropFilter:'blur(3px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ background:C.red, color:'white', padding:'6px 18px', borderRadius:8, fontSize:12, fontWeight:700, textTransform:'uppercase' as const, letterSpacing:'.05em' }}>Tugagan</span>
                      </div>
                    )}
                    {low && !sold && (
                      <div style={{ position:'absolute', top:10, left:10 }}>
                        <span style={{ background:`${C.amber}ee`, color:'white', padding:'4px 10px', borderRadius:7, fontSize:11, fontWeight:700 }}>
                          ⚡ {prod.stock} ta qoldi
                        </span>
                      </div>
                    )}
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.32) 0%,transparent 55%)', opacity:0, transition:'opacity .25s', display:'flex', alignItems:'flex-end', padding:'10px 12px' }}
                      onMouseEnter={e=>(e.currentTarget.style.opacity='1')}
                      onMouseLeave={e=>(e.currentTarget.style.opacity='0')}>
                      <span style={{ color:'white', fontSize:11, fontWeight:600, letterSpacing:'.05em', textTransform:'uppercase' as const, background:'rgba(0,0,0,.3)', backdropFilter:'blur(4px)', padding:'4px 10px', borderRadius:6 }}>Batafsil →</span>
                    </div>
                  </div>

                  {/* body */}
                  <div style={{ padding:'16px 16px 18px', flex:1, display:'flex', flexDirection:'column' }}>
                    <div style={{ fontWeight:700, fontSize:15, color:C.text, letterSpacing:'-.012em', lineHeight:1.35, marginBottom:5 }}>{prod.name}</div>
                    {prod.description && (
                      <div style={{ fontSize:12, color:C.text2, lineHeight:1.65, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as any, marginBottom:10 }}>
                        {prod.description}
                      </div>
                    )}
                    <div style={{ height:1, background:C.border, margin:'10px 0' }}/>

                    <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:14 }}>
                      <div>
                        <div style={{ fontSize:9, fontWeight:700, color:C.textMute, textTransform:'uppercase' as const, letterSpacing:'.08em', marginBottom:4 }}>Narx</div>
                        <div style={{ display:'flex', alignItems:'baseline', gap:3 }}>
                          <span className="price-grad" style={{ fontWeight:800, fontSize:21, letterSpacing:'-.02em' }}>
                            {fmt(prod.price)}
                          </span>
                          <span style={{ fontSize:11, color:C.text2, fontWeight:500 }}>so'm</span>
                        </div>
                        <div style={{ fontSize:11, color:C.text2, marginTop:1 }}>1 {prod.unity} uchun</div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:9, fontWeight:700, color:C.textMute, textTransform:'uppercase' as const, letterSpacing:'.08em', marginBottom:4 }}>Ombor</div>
                        <div style={{ fontSize:14, fontWeight:700, color:sold?C.red:low?C.amber:C.text2 }}>
                          {sold ? '–' : prod.stock}
                          <span style={{ fontSize:10, fontWeight:400, color:C.text2, marginLeft:3 }}>{sold ? "yo'q" : prod.unity}</span>
                        </div>
                        {!sold && (
                          <div style={{ width:52, height:3, background:C.card2, borderRadius:99, marginTop:5, overflow:'hidden', marginLeft:'auto', border:`1px solid ${C.border}` }}>
                            <div style={{ height:'100%', borderRadius:99, background:low?C.amber:accent, width:`${Math.min((prod.stock/20)*100,100)}%`, transition:'width .4s' }}/>
                          </div>
                        )}
                      </div>
                    </div>

                    {q > 0 ? (
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:C.accentLt, border:`1.5px solid ${accent}33`, borderRadius:12, padding:'4px 6px', animation:'scaleIn .2s ease' }}>
                        <button className="qbtn" onClick={() => subItem(prod.id)} style={{ width:36, height:36, borderRadius:9, background:isDark?'rgba(255,255,255,.07)':'rgba(0,0,0,.06)', color:C.text, fontSize:20, fontWeight:400 }}>−</button>
                        <div style={{ textAlign:'center' }}>
                          <div style={{ fontWeight:800, fontSize:16, color:accent }}>{q}</div>
                          <div style={{ fontSize:10, color:C.text2 }}>{fmt(Number(prod.price)*q)} so'm</div>
                        </div>
                        <button className="qbtn" onClick={e=>addItem(prod,e)} disabled={q>=prod.stock}
                          style={{ width:36, height:36, borderRadius:9, background:q>=prod.stock?C.card2:`linear-gradient(135deg,${accent},${accentDk})`, color:'white', fontSize:20, fontWeight:400, opacity:q>=prod.stock?.4:1 }}>+</button>
                      </div>
                    ) : (
                      <button className="btn" disabled={sold} onClick={e => !sold && addItem(prod,e)} style={{
                        width:'100%',
                        background:sold?C.card2:`linear-gradient(135deg,${accent},${accentDk})`,
                        color:sold?C.text2:'white',
                        borderRadius:12, padding:'12px 0', fontSize:14, fontWeight:600,
                        cursor:sold?'not-allowed':'pointer',
                        boxShadow:sold?'none':`0 4px 16px ${accent}44`,
                        display:'flex', alignItems:'center', justifyContent:'center', gap:7,
                      }}>
                        {sold ? 'Tugagan' : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                              <path d="M1 1h4l2.68 13.39a2 2 0 001.63 1.61h9.72a2 2 0 001.63-1.61L23 6H6"/>
                            </svg>
                            Savatchaga qo'shish
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ════════ PRODUCT DETAIL ════════ */}
      {detailProd && (
        <div onClick={e=>e.target===e.currentTarget&&setDetailProd(null)}
          style={{ position:'fixed', inset:0, zIndex:200, background:C.overlay, backdropFilter:'blur(8px)', display:'flex', alignItems:'flex-end', justifyContent:'center', animation:'fadeIn .2s ease' }}>
          <div onClick={e=>e.stopPropagation()}
            style={{ background:C.card, borderRadius:'22px 22px 0 0', width:'100%', maxWidth:560, maxHeight:'92vh', overflowY:'auto', animation:'slideUp .3s cubic-bezier(.4,0,.2,1)', border:`1px solid ${C.border}`, borderBottom:'none' }}>
            {detailProd.image && (
              <div style={{ height:280, position:'relative', overflow:'hidden', borderRadius:'22px 22px 0 0' }}>
                <img src={imgUrl(detailProd.image)} alt={detailProd.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.55),transparent 60%)' }}/>
                <button className="ibtn" onClick={() => setDetailProd(null)}
                  style={{ position:'absolute', top:14, right:14, width:36, height:36, borderRadius:10, background:'rgba(0,0,0,.45)', backdropFilter:'blur(8px)', color:'white', border:'1px solid rgba(255,255,255,.12)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            )}
            <div style={{ padding:'24px 22px 32px' }}>
              {!detailProd.image && (
                <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:14 }}>
                  <button className="ibtn" onClick={() => setDetailProd(null)} style={{ width:33, height:33, borderRadius:9, background:C.card2, color:C.text2 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              )}
              <h2 style={{ fontWeight:800, fontSize:22, color:C.text, letterSpacing:'-.02em', marginBottom:8, lineHeight:1.2 }}>{detailProd.name}</h2>
              {detailProd.description && <p style={{ color:C.text2, fontSize:14, lineHeight:1.75, marginBottom:20 }}>{detailProd.description}</p>}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:22 }}>
                <div style={{ background:C.card2, borderRadius:14, padding:'14px 16px', border:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:9, fontWeight:700, color:C.textMute, textTransform:'uppercase' as const, letterSpacing:'.08em', marginBottom:8 }}>Narx</div>
                  <span className="price-grad" style={{ fontWeight:900, fontSize:26, letterSpacing:'-.025em' }}>{fmt(detailProd.price)}</span>
                  <span style={{ fontSize:12, color:C.text2, marginLeft:4 }}>so'm / {detailProd.unity}</span>
                </div>
                <div style={{ background:C.card2, borderRadius:14, padding:'14px 16px', border:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:9, fontWeight:700, color:C.textMute, textTransform:'uppercase' as const, letterSpacing:'.08em', marginBottom:8 }}>Mavjud</div>
                  <span style={{ fontWeight:800, fontSize:22, color:detailProd.stock>0?C.green:C.red }}>{detailProd.stock>0 ? `${detailProd.stock} ta` : 'Tugagan'}</span>
                </div>
              </div>
              {getQty(detailProd.id) > 0 ? (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:C.accentLt, border:`1.5px solid ${accent}33`, borderRadius:14, padding:'6px 8px', marginBottom:14 }}>
                  <button className="qbtn" onClick={() => subItem(detailProd.id)} style={{ width:44, height:44, borderRadius:10, background:isDark?'rgba(255,255,255,.07)':'rgba(0,0,0,.06)', color:C.text, fontSize:24 }}>−</button>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontWeight:900, fontSize:24, color:accent }}>{getQty(detailProd.id)}</div>
                    <div style={{ fontSize:12, color:C.text2 }}>{fmt(Number(detailProd.price)*getQty(detailProd.id))} so'm</div>
                  </div>
                  <button className="qbtn" onClick={e=>addItem(detailProd,e)} disabled={getQty(detailProd.id)>=detailProd.stock}
                    style={{ width:44, height:44, borderRadius:10, background:getQty(detailProd.id)>=detailProd.stock?C.card2:`linear-gradient(135deg,${accent},${accentDk})`, color:'white', fontSize:24, opacity:getQty(detailProd.id)>=detailProd.stock?.4:1 }}>+</button>
                </div>
              ) : (
                <button className="btn" disabled={detailProd.stock===0}
                  onClick={e=>{ if(detailProd.stock>0){ addItem(detailProd,e); setDetailProd(null); }}}
                  style={{ width:'100%', background:detailProd.stock===0?C.card2:`linear-gradient(135deg,${accent},${accentDk})`, borderRadius:14, padding:'15px', color:detailProd.stock===0?C.text2:'white', fontSize:15, fontWeight:700, cursor:detailProd.stock===0?'not-allowed':'pointer', boxShadow:detailProd.stock===0?'none':`0 6px 22px ${accent}44`, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  {detailProd.stock===0 ? 'Tugagan' : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.63 1.61h9.72a2 2 0 001.63-1.61L23 6H6"/></svg>Savatchaga qo'shish</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════ CART DRAWER ════════ */}
      {cartOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', justifyContent:'flex-end' }}>
          <div style={{ flex:1, background:'rgba(0,0,0,.4)', backdropFilter:'blur(4px)' }} onClick={() => setCartOpen(false)}/>
          <div style={{ width:420, maxWidth:'95vw', background:C.card, display:'flex', flexDirection:'column', animation:'slideRight .26s cubic-bezier(.4,0,.2,1)', boxShadow:'-4px 0 36px rgba(0,0,0,.2)', borderLeft:`1px solid ${C.border}` }}>
            <div style={{ padding:'20px 20px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontWeight:700, fontSize:18, color:C.text, letterSpacing:'-.01em' }}>Savatcha</div>
                <div style={{ fontSize:12, color:C.text2, marginTop:3 }}>{count} ta mahsulot</div>
              </div>
              <button className="ibtn" onClick={() => setCartOpen(false)}
                style={{ background:C.card2, borderRadius:9, width:34, height:34, color:C.text2, border:`1px solid ${C.border}` }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'12px 16px' }}>
              {cart.length===0 ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', paddingTop:80, gap:16, textAlign:'center' }}>
                  <div style={{ width:72, height:72, borderRadius:20, background:C.card2, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.textMute} strokeWidth="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.63 1.61h9.72a2 2 0 001.63-1.61L23 6H6"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, color:C.text2 }}>Savatcha bo'sh</div>
                    <div style={{ fontSize:13, color:C.textMute, marginTop:5 }}>Mahsulot qo'shing</div>
                  </div>
                </div>
              ) : cart.map((item, i) => (
                <div key={item.product.id} style={{ background:C.card2, border:`1px solid ${C.border}`, borderRadius:13, display:'flex', alignItems:'center', overflow:'hidden', marginBottom:10, animation:`fadeUp .2s ease ${i*.04}s both` }}>
                  <div style={{ width:68, height:68, flexShrink:0, background:C.input }}>
                    {item.product.image
                      ? <img src={imgUrl(item.product.image)} alt={item.product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                      : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, opacity:.2 }}>📦</div>
                    }
                  </div>
                  <div style={{ flex:1, padding:'10px 12px', minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.product.name}</div>
                    <div className="price-grad" style={{ fontSize:12, fontWeight:600, marginTop:3 }}>{fmt(item.product.price)} so'm</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, padding:'0 10px', flexShrink:0 }}>
                    <button className="qbtn" onClick={() => subItem(item.product.id)} style={{ width:30, height:30, borderRadius:8, background:C.input, color:C.text, fontSize:18 }}>−</button>
                    <span style={{ fontWeight:800, fontSize:14, minWidth:22, textAlign:'center', color:C.text }}>{item.qty}</span>
                    <button className="qbtn" onClick={e=>addItem(item.product,e)} style={{ width:30, height:30, borderRadius:8, background:`linear-gradient(135deg,${accent},${accentDk})`, color:'white', fontSize:18 }}>+</button>
                  </div>
                  <div style={{ padding:'0 14px', flexShrink:0, textAlign:'right', minWidth:74 }}>
                    <div style={{ fontSize:13, fontWeight:800, color:C.text }}>{fmt(Number(item.product.price)*item.qty)}</div>
                    <div style={{ fontSize:10, color:C.text2 }}>so'm</div>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div style={{ padding:'16px 18px 24px', borderTop:`1px solid ${C.border}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:C.card2, border:`1px solid ${C.border}`, borderRadius:12, padding:'14px 16px', marginBottom:14 }}>
                  <span style={{ color:C.text2, fontSize:14 }}>Jami summa</span>
                  <div>
                    <span className="price-grad" style={{ fontWeight:900, fontSize:22, letterSpacing:'-.02em' }}>{fmt(total)}</span>
                    <span style={{ fontSize:12, color:C.text2, marginLeft:3 }}>so'm</span>
                  </div>
                </div>
                <button className="btn" onClick={() => { setCartOpen(false); setForm({ first_name:'', phone_number:'', address:'' }); setCheckoutOpen(true); }}
                  style={{ width:'100%', background:`linear-gradient(135deg,${accent},${accentDk})`, borderRadius:13, padding:'15px', color:'white', fontSize:15, fontWeight:700, boxShadow:`0 6px 20px ${accent}44`, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  Buyurtma berish
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════ CHECKOUT ════════ */}
      {checkoutOpen && (
        <div onClick={e=>e.target===e.currentTarget&&setCheckoutOpen(false)}
          style={{ position:'fixed', inset:0, zIndex:200, background:C.overlay, backdropFilter:'blur(8px)', display:'flex', alignItems:'flex-end', justifyContent:'center', animation:'fadeIn .2s ease' }}>
          <div onClick={e=>e.stopPropagation()}
            style={{ background:C.card, borderRadius:'22px 22px 0 0', width:'100%', maxWidth:560, maxHeight:'94vh', overflowY:'auto', animation:'slideUp .3s cubic-bezier(.4,0,.2,1)', border:`1px solid ${C.border}`, borderBottom:'none' }}>
            <div style={{ display:'flex', justifyContent:'center', paddingTop:14, paddingBottom:4 }}>
              <div style={{ width:36, height:4, borderRadius:99, background:C.border }}/>
            </div>
            <div style={{ padding:'16px 22px 36px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
                <div>
                  <div style={{ fontWeight:800, fontSize:20, color:C.text, letterSpacing:'-.02em' }}>Buyurtma berish</div>
                  <div style={{ fontSize:12, color:C.text2, marginTop:4 }}>{count} ta · {fmt(total)} so'm</div>
                </div>
                <button className="ibtn" onClick={() => setCheckoutOpen(false)} style={{ background:C.card2, borderRadius:9, width:34, height:34, color:C.text2 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <div style={{ marginBottom:22 }}>
                <div style={{ fontSize:10, fontWeight:700, color:C.textMute, textTransform:'uppercase' as const, letterSpacing:'.09em', marginBottom:14 }}>Sizning ma'lumotlaringiz</div>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {([
                    { k:'first_name',   l:"Ismingiz",       p:"To'liq ismingiz",   icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                    { k:'phone_number', l:"Telefon",         p:"+998 90 123 45 67", icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.09 9.81 19.79 19.79 0 01.07 1.21 2 2 0 012.03 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.86-.86a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg> },
                    { k:'address',      l:"Manzil",          p:"Ko'cha, uy raqami", icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> },
                  ] as const).map(f => (
                    <div key={f.k}>
                      <label style={{ display:'block', fontSize:11, fontWeight:600, color:C.text2, marginBottom:7, letterSpacing:'.02em' }}>{f.l}</label>
                      <div style={{ position:'relative' }}>
                        <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:C.textMute, pointerEvents:'none' }}>{f.icon}</span>
                        <input className="inp" placeholder={f.p} value={form[f.k]} onChange={e=>setForm(p=>({ ...p, [f.k]:e.target.value }))}
                          style={{ width:'100%', background:C.input, border:`1.5px solid ${C.border}`, borderRadius:12, color:C.text, paddingLeft:38, paddingRight:14, paddingTop:12, paddingBottom:12, fontSize:14 }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background:C.card2, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden', marginBottom:18 }}>
                <div style={{ padding:'11px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:6 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.63 1.61h9.72a2 2 0 001.63-1.61L23 6H6"/></svg>
                  <span style={{ fontSize:10, fontWeight:700, color:C.text2, textTransform:'uppercase' as const, letterSpacing:'.09em' }}>Buyurtma tarkibi</span>
                </div>
                <div style={{ padding:'0 16px' }}>
                  {cart.map((item, i) => (
                    <div key={item.product.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 0', borderBottom:i<cart.length-1?`1px solid ${C.border}`:'none' }}>
                      <div style={{ width:38, height:38, borderRadius:9, background:C.input, overflow:'hidden', flexShrink:0 }}>
                        {item.product.image
                          ? <img src={imgUrl(item.product.image)} alt={item.product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', opacity:.2 }}>📦</div>
                        }
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.product.name}</div>
                        <div style={{ fontSize:11, color:C.text2 }}>{fmt(item.product.price)} × {item.qty}</div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
                        <button className="qbtn" onClick={() => subItem(item.product.id)} style={{ width:26, height:26, borderRadius:7, background:C.input, color:C.text, fontSize:14 }}>−</button>
                        <span style={{ fontWeight:700, fontSize:13, minWidth:20, textAlign:'center', color:C.text }}>{item.qty}</span>
                        <button className="qbtn" onClick={() => addItem(item.product)} style={{ width:26, height:26, borderRadius:7, background:`linear-gradient(135deg,${accent},${accentDk})`, color:'white', fontSize:14 }}>+</button>
                      </div>
                      <div style={{ fontSize:13, fontWeight:800, color:C.text, minWidth:72, textAlign:'right' }}>
                        {fmt(Number(item.product.price)*item.qty)}
                        <div style={{ fontSize:10, color:C.text2, fontWeight:400 }}>so'm</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 0', borderTop:`1px solid ${C.border}` }}>
                    <span style={{ fontSize:14, fontWeight:700, color:C.text2 }}>Jami:</span>
                    <div>
                      <span className="price-grad" style={{ fontWeight:900, fontSize:21, letterSpacing:'-.02em' }}>{fmt(total)}</span>
                      <span style={{ fontSize:12, color:C.text2, marginLeft:3 }}>so'm</span>
                    </div>
                  </div>
                </div>
              </div>

              <button className="btn" onClick={placeOrder} disabled={ordering || !formOk}
                style={{ width:'100%', background:!formOk?C.card2:`linear-gradient(135deg,${accent},${accentDk})`, borderRadius:14, padding:'16px', color:!formOk?C.text2:'white', fontSize:15, fontWeight:700, cursor:!formOk?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:9, boxShadow:formOk?`0 6px 22px ${accent}44`:'none', opacity:ordering?.8:1 }}>
                {ordering
                  ? <><div style={{ width:18, height:18, borderRadius:'50%', borderTop:'2px solid white', borderRight:'2px solid transparent', borderBottom:'2px solid transparent', borderLeft:'2px solid transparent', animation:'spin .7s linear infinite' }}/>Yuborilmoqda...</>
                  : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Buyurtmani tasdiqlash</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ SUCCESS ════════ */}
      {orderOk && (
        <div style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,.88)', backdropFilter:'blur(14px)', display:'flex', alignItems:'center', justifyContent:'center', padding:24, animation:'fadeIn .22s ease' }}>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:26, padding:'52px 40px', textAlign:'center', maxWidth:380, width:'100%', animation:'scaleIn .3s cubic-bezier(.4,0,.2,1)', boxShadow:'0 24px 80px rgba(0,0,0,.5)' }}>
            <div style={{ width:80, height:80, borderRadius:'50%', background:C.greenLt, border:`2px solid ${C.green}33`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 26px', boxShadow:`0 0 40px ${C.green}22` }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style={{ fontWeight:800, fontSize:23, color:C.text, marginBottom:12, letterSpacing:'-.02em' }}>Buyurtma qabul qilindi!</div>
            <p style={{ color:C.text2, fontSize:14, lineHeight:1.75, marginBottom:30 }}>
              Rahmat! Tez orada siz bilan bog'lanamiz va buyurtmangiz yetkazib beriladi. 🚀
            </p>
            <button className="btn" onClick={() => setOrderOk(false)}
              style={{ width:'100%', background:`linear-gradient(135deg,${accent},${accentDk})`, borderRadius:14, padding:'15px', color:'white', fontWeight:700, fontSize:15, boxShadow:`0 6px 22px ${accent}44` }}>
              Xarid davom ettirish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
