'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { shops, products, orders } from '@/lib/api';
import { Shop, Order } from '@/types';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  yangi:         { label: 'Yangi',         cls: 'badge-yangi' },
  tayyorlanmoqda:{ label: 'Tayyorlanmoqda', cls: 'badge-tayyorlanmoqda' },
  yakunlangan:   { label: 'Yakunlangan',   cls: 'badge-yakunlangan' },
};

export default function DashboardPage() {
  const [shopList, setShopList] = useState<Shop[]>([]);
  const [prodCount, setProdCount] = useState(0);
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([shops.list(), products.list(), orders.list()])
      .then(([s, p, o]) => {
        setShopList(s.results);
        setProdCount(p.count ?? p.results.length);
        setOrderList(o.results);
      })
      .finally(() => setLoading(false));
  }, []);

  const revenue = orderList.filter(o => o.status === 'yakunlangan').reduce((s, o) => s + o.total_price, 0);
  const newOrders = orderList.filter(o => o.status === 'yangi').length;

  const stats = [
    { label:"Do'konlar", value: shopList.length, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, href:'/dashboard/shops', cls:'stat-blue' },
    { label:'Mahsulotlar', value: prodCount, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>, href:'/dashboard/products', cls:'stat-green' },
    { label:'Buyurtmalar', value: orderList.length, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>, href:'/dashboard/orders', cls:'stat-amber', badge: newOrders > 0 ? newOrders : undefined },
    { label:"Daromad (tugallangan)", value: revenue.toLocaleString() + " so'm", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>, href:'/dashboard/orders', cls:'stat-purple' },
  ];

  if (loading) return (
    <div>
      <div className="skeleton" style={{ height:36, width:240, borderRadius:10, marginBottom:32 }} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height:110, borderRadius:'var(--radius)' }} />)}
      </div>
    </div>
  );

  return (
    <div style={{ animation:'fadeUp 0.5s ease' }}>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'Clash Display', fontSize:26, fontWeight:700, marginBottom:4 }}>Umumiy ko'rinish</h1>
        <p style={{ color:'var(--text-2)', fontSize:14 }}>Barcha do'konlaringiz holati</p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {stats.map((s, i) => (
          <Link key={i} href={s.href} style={{ textDecoration:'none' }}>
            <div className={`glass glass-hover stat-card ${s.cls}`} style={{ cursor:'pointer' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
                <div style={{ color: s.cls==='stat-blue' ? 'var(--accent)' : s.cls==='stat-green' ? 'var(--green)' : s.cls==='stat-amber' ? 'var(--amber)' : 'var(--purple)', opacity:0.8 }}>
                  {s.icon}
                </div>
                {s.badge && <span className="badge badge-yangi">{s.badge} yangi</span>}
              </div>
              <div style={{ fontFamily:'Clash Display', fontSize:24, fontWeight:700, marginBottom:4 }}>{s.value}</div>
              <div style={{ fontSize:13, color:'var(--text-2)' }}>{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
        {/* Recent orders */}
        <div className="glass" style={{ padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
            <h2 style={{ fontFamily:'Clash Display', fontSize:16, fontWeight:700 }}>So'nggi buyurtmalar</h2>
            <Link href="/dashboard/orders" style={{ fontSize:13, color:'var(--accent)', textDecoration:'none', fontWeight:500 }}>Hammasi →</Link>
          </div>
          {orderList.length === 0 ? (
            <div className="empty"><div className="empty-icon">📋</div><p>Hozircha buyurtma yo'q</p></div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {orderList.slice(0,5).map(o => (
                <div key={o.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 12px', borderRadius:'var(--radius-sm)', background:'rgba(255,255,255,0.025)' }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:500, color:'var(--text)', marginBottom:1 }}>{o.first_name}</div>
                    <div style={{ fontSize:12, color:'var(--text-3)' }}>{o.phone_number}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <span className={`badge ${STATUS_MAP[o.status]?.cls}`}>{STATUS_MAP[o.status]?.label}</span>
                    <div style={{ fontSize:12, color:'var(--text-2)', marginTop:4 }}>{o.total_price.toLocaleString()} so'm</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My shops */}
        <div className="glass" style={{ padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
            <h2 style={{ fontFamily:'Clash Display', fontSize:16, fontWeight:700 }}>Do'konlarim</h2>
            <Link href="/dashboard/shops" style={{ fontSize:13, color:'var(--accent)', textDecoration:'none', fontWeight:500 }}>Hammasi →</Link>
          </div>
          {shopList.length === 0 ? (
            <div className="empty"><div className="empty-icon">🏪</div><p>Hozircha do'kon yo'q</p></div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {shopList.slice(0,5).map(shop => (
                <div key={shop.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderRadius:'var(--radius-sm)', background:'rgba(255,255,255,0.025)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg, var(--accent), #1d4ed8)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Clash Display', fontSize:14, fontWeight:700, color:'white', flexShrink:0 }}>
                      {shop.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:500, color:'var(--text)' }}>{shop.name}</div>
                      {shop.slug && <div style={{ fontSize:11, color:'var(--text-3)' }}>/{shop.slug}</div>}
                    </div>
                  </div>
                  {shop.slug && (
                    <Link href={`/shop/${shop.slug}`} target="_blank" style={{ fontSize:12, color:'var(--accent)', textDecoration:'none', fontWeight:500 }}>Ko'rish →</Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
