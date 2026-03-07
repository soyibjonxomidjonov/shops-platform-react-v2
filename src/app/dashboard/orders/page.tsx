'use client';
import { useEffect, useState } from 'react';
import { orders, shops } from '@/lib/api';
import { Order, Shop } from '@/types';

const STATUS = {
  yangi:          { label:'Yangi',          cls:'badge-yangi',          next:'tayyorlanmoqda' },
  tayyorlanmoqda: { label:'Tayyorlanmoqda', cls:'badge-tayyorlanmoqda', next:'yakunlangan' },
  yakunlangan:    { label:'Yakunlangan',    cls:'badge-yakunlangan',    next:null },
};

export default function OrdersPage() {
  const [list, setList]           = useState<Order[]>([]);
  const [shopList, setShopList]   = useState<Shop[]>([]);
  const [loading, setLoading]     = useState(true);
  const [detail, setDetail]       = useState<Order|null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterShop, setFilterShop]     = useState('');
  const [updating, setUpdating]   = useState<number|null>(null);
  const [toast, setToast]         = useState('');
  const [selected, setSelected]   = useState<Set<number>>(new Set());
  const [bulkDel, setBulkDel]     = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      let all: Order[] = [];
      let page = 1;
      while (true) {
        const res = await orders.list({ page: String(page), page_size: '200' });
        all = [...all, ...res.results];
        if (!res.next) break;
        page++;
        if (page > 20) break;
      }
      all.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setList(all);
      const s = await shops.list({ page_size: '100' });
      setShopList(s.results);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const advance = async (order: Order) => {
    const nextStatus = STATUS[order.status as keyof typeof STATUS]?.next;
    if (!nextStatus) return;
    setUpdating(order.id);
    try {
      const updated = await orders.updateStatus(order.id, nextStatus as Order['status']);
      setList(l => l.map(o => o.id === updated.id ? updated : o));
      if (detail?.id === updated.id) setDetail(updated);
      showToast('Status yangilandi ✓');
    } catch(e:any) { showToast('Xato: ' + e.message); }
    finally { setUpdating(null); }
  };

  const del = async (id: number) => {
    if (!confirm("Buyurtmani o'chirishni tasdiqlaysizmi?")) return;
    try {
      await orders.delete(id);
      setList(l => l.filter(o => o.id !== id));
      setSelected(s => { const n = new Set(s); n.delete(id); return n; });
      if (detail?.id === id) setDetail(null);
      showToast("O'chirildi ✓");
    } catch(e:any) {
      showToast("Xato: " + (e.message || "O'chirib bo'lmadi"));
    }
  };

  const bulkDelete = async () => {
    if (!confirm(`${selected.size} ta buyurtmani o'chirishni tasdiqlaysizmi?`)) return;
    setBulkDel(true);
    let ok = 0;
    for (const id of Array.from(selected)) {
      try {
        await orders.delete(id);
        setList(l => l.filter(o => o.id !== id));
        ok++;
      } catch {}
    }
    setSelected(new Set());
    setBulkDel(false);
    showToast(`${ok} ta buyurtma o'chirildi ✓`);
  };

  const toggleSelect = (id: number) => {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(o => o.id)));
    }
  };

  const shopName = (id: number) => shopList.find(s => s.id === id)?.name || `Do'kon #${id}`;

  const filtered = list.filter(o =>
    (filterStatus ? o.status === filterStatus : true) &&
    (filterShop   ? String(o.shop) === filterShop  : true)
  );

  const stats = {
    yangi:          list.filter(o => o.status==='yangi').length,
    tayyorlanmoqda: list.filter(o => o.status==='tayyorlanmoqda').length,
    yakunlangan:    list.filter(o => o.status==='yakunlangan').length,
    revenue:        list.filter(o => o.status==='yakunlangan').reduce((s,o) => s + Number(o.total_price), 0),
  };

  return (
    <div style={{ animation:'fadeUp 0.5s ease' }}>
      {toast && (
        <div className="toast toast-success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span style={{ fontSize:14 }}>{toast}</span>
        </div>
      )}

      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'Clash Display', fontSize:26, fontWeight:700, marginBottom:4 }}>Buyurtmalar</h1>
        <p style={{ color:'var(--text-2)', fontSize:14 }}>{list.length} ta buyurtma</p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:22 }}>
        {[
          { label:'Yangi',          val:stats.yangi,          color:'var(--accent)', key:'yangi' },
          { label:'Tayyorlanmoqda', val:stats.tayyorlanmoqda, color:'var(--amber)',  key:'tayyorlanmoqda' },
          { label:'Yakunlangan',    val:stats.yakunlangan,    color:'var(--green)',  key:'yakunlangan' },
          { label:'Jami daromad',   val:stats.revenue.toLocaleString() + " so'm", color:'var(--purple)', key:'' },
        ].map((s,i) => (
          <div key={i} onClick={() => s.key && setFilterStatus(f => f===s.key?'':s.key)}
            className="glass" style={{ padding:'16px 18px', cursor: s.key ? 'pointer' : 'default', border: filterStatus===s.key ? `1px solid ${s.color}33` : undefined, background: filterStatus===s.key ? `${s.color}10` : undefined, transition:'all .2s' }}>
            <div style={{ fontSize:22, fontFamily:'Clash Display', fontWeight:700, color:s.color, marginBottom:4 }}>{s.val}</div>
            <div style={{ fontSize:12, color:'var(--text-2)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters + bulk delete */}
      <div style={{ display:'flex', gap:10, marginBottom:16, alignItems:'center', flexWrap:'wrap' }}>
        <select className="input" style={{ maxWidth:200 }} value={filterShop} onChange={e => setFilterShop(e.target.value)}>
          <option value="">Barcha do'konlar</option>
          {shopList.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
        </select>
        {filterStatus && (
          <button onClick={() => setFilterStatus('')} className="btn btn-ghost btn-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Filterni o'chirish
          </button>
        )}
        {selected.size > 0 && (
          <button onClick={bulkDelete} disabled={bulkDel} className="btn btn-danger btn-sm" style={{ marginLeft:'auto' }}>
            {bulkDel
              ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:'spin .8s linear infinite' }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
              : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
            }
            {selected.size} tasini o'chirish
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height:64, borderRadius:'var(--radius-sm)' }}/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass empty" style={{ padding:60 }}>
          <div className="empty-icon">📋</div>
          <h3>Buyurtma topilmadi</h3>
        </div>
      ) : (
        <div className="glass" style={{ overflow:'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width:36 }}>
                  <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    style={{ width:15, height:15, cursor:'pointer', accentColor:'var(--green)' }}/>
                </th>
                <th>#</th><th>Mijoz</th><th>Do'kon</th><th>Jami</th><th>Status</th><th>Sana</th><th style={{ textAlign:'right' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const st = STATUS[o.status as keyof typeof STATUS];
                const isSelected = selected.has(o.id);
                return (
                  <tr key={o.id} style={{ cursor:'pointer', background: isSelected ? 'rgba(239,68,68,0.05)' : undefined }}
                    onClick={() => setDetail(o)}>
                    <td onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(o.id)}
                        style={{ width:15, height:15, cursor:'pointer', accentColor:'var(--green)' }}/>
                    </td>
                    <td style={{ color:'var(--text-3)', fontWeight:600, fontSize:13 }}>#{o.id}</td>
                    <td>
                      <div style={{ fontSize:14, fontWeight:500, color:'var(--text)' }}>{o.first_name}</div>
                      <div style={{ fontSize:12, color:'var(--text-3)' }}>{o.phone_number}</div>
                    </td>
                    <td><span className="tag">{shopName(o.shop)}</span></td>
                    <td style={{ color:'var(--green)', fontWeight:600, fontSize:14 }}>{Number(o.total_price).toLocaleString()} so'm</td>
                    <td><span className={`badge ${st?.cls}`}>{st?.label}</span></td>
                    <td style={{ fontSize:12, color:'var(--text-3)' }}>{new Date(o.created_at).toLocaleDateString('uz-UZ')}</td>
                    <td style={{ textAlign:'right' }}>
                      <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }} onClick={e => e.stopPropagation()}>
                        {st?.next && (
                          <button onClick={() => advance(o)} disabled={updating===o.id} className="btn btn-success btn-sm">
                            {updating===o.id
                              ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:'spin .8s linear infinite' }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                              : '→ ' + STATUS[st.next as keyof typeof STATUS]?.label
                            }
                          </button>
                        )}
                        <button onClick={() => del(o.id)} className="btn btn-danger btn-icon">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setDetail(null)}>
          <div className="modal" style={{ maxWidth:520 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
              <h2 style={{ fontFamily:'Clash Display', fontSize:20, fontWeight:700 }}>Buyurtma #{detail.id}</h2>
              <button onClick={() => setDetail(null)} className="btn btn-ghost btn-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span className={`badge ${STATUS[detail.status as keyof typeof STATUS]?.cls}`}>
                  {STATUS[detail.status as keyof typeof STATUS]?.label}
                </span>
                {STATUS[detail.status as keyof typeof STATUS]?.next && (
                  <button onClick={() => advance(detail)} disabled={updating===detail.id} className="btn btn-success btn-sm">
                    {updating===detail.id ? 'Yangilanmoqda...' : '→ ' + STATUS[STATUS[detail.status as keyof typeof STATUS]?.next as keyof typeof STATUS]?.label}
                  </button>
                )}
              </div>
              <div className="divider"/>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[
                  { label:'Mijoz',   val:detail.first_name },
                  { label:'Telefon', val:detail.phone_number },
                  { label:'Manzil',  val:detail.address },
                  { label:"Do'kon",  val:shopName(detail.shop) },
                ].map(f => (
                  <div key={f.label}>
                    <div style={{ fontSize:11, color:'var(--text-3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>{f.label}</div>
                    <div style={{ fontSize:14, color:'var(--text)' }}>{f.val}</div>
                  </div>
                ))}
              </div>
              <div className="divider"/>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:10, textTransform:'uppercase', letterSpacing:'.06em' }}>Mahsulotlar</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {detail.items_json.map((item, i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 12px', background:'rgba(255,255,255,0.03)', borderRadius:'var(--radius-sm)' }}>
                      <span style={{ fontSize:14, color:'var(--text)' }}>{item.product_name} × {item.quantity} {item.unity}</span>
                      <span style={{ fontSize:14, color:'var(--green)', fontWeight:600 }}>{(Number(item.price)*item.quantity).toLocaleString()} so'm</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 14px', background:'rgba(34,211,165,0.05)', border:'1px solid rgba(34,211,165,0.15)', borderRadius:'var(--radius-sm)' }}>
                <span style={{ fontWeight:600 }}>Jami:</span>
                <span style={{ fontSize:18, fontFamily:'Clash Display', fontWeight:700, color:'var(--green)' }}>{Number(detail.total_price).toLocaleString()} so'm</span>
              </div>
              <button onClick={() => del(detail.id)} className="btn btn-danger btn-sm" style={{ alignSelf:'flex-end' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
                Buyurtmani o'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
