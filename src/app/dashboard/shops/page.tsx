'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { shops } from '@/lib/api';
import { Shop } from '@/types';

const EMPTY: Partial<Shop> = { name:'', description:'', address:'', bot_token:'', chat_id:'' };

export default function ShopsPage() {
  const [list, setList] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add'|'edit'|null>(null);
  const [form, setForm] = useState<Partial<Shop>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number|null>(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [chatIdHelp, setChatIdHelp] = useState(false);

  const load = () => shops.list().then(r => setList(r.results)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openAdd = () => { setForm(EMPTY); setError(''); setChatIdHelp(false); setModal('add'); };
  const openEdit = (s: Shop) => { setForm(s); setError(''); setChatIdHelp(false); setModal('edit'); };

  const save = async () => {
    if (!form.name?.trim()) { setError("Do'kon nomi majburiy"); return; }
    setSaving(true); setError('');
    try {
      if (modal === 'edit' && form.id) {
        const updated = await shops.update(form.id, form);
        setList(l => l.map(s => s.id === updated.id ? updated : s));
        showToast("Do'kon yangilandi \u2713");
      } else {
        const created = await shops.create(form);
        setList(l => [created, ...l]);
        showToast("Do'kon yaratildi \u2713");
      }
      setModal(null);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!confirm("Do'konni o'chirishni tasdiqlaysizmi?")) return;
    setDeleting(id);
    try { await shops.delete(id); setList(l => l.filter(s => s.id !== id)); showToast("O'chirildi"); }
    catch (e: any) { alert(e.message); }
    finally { setDeleting(null); }
  };

  const Spinner = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:'spin 0.8s linear infinite' }}>
      <path d="M21 12a9 9 0 11-6.219-8.56"/>
    </svg>
  );

  const LabelStyle: React.CSSProperties = {
    display:'block', fontSize:11, fontWeight:600, color:'var(--text-2)',
    marginBottom:6, letterSpacing:'0.05em', textTransform:'uppercase'
  };

  return (
    <div style={{ animation:'fadeUp 0.5s ease' }}>
      {toast && (
        <div className="toast toast-success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span style={{ fontSize:14 }}>{toast}</span>
        </div>
      )}

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
        <div>
          <h1 style={{ fontFamily:'Clash Display', fontSize:26, fontWeight:700, marginBottom:4 }}>Do'konlar</h1>
          <p style={{ color:'var(--text-2)', fontSize:14 }}>{list.length} ta do'kon</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Yangi do'kon
        </button>
      </div>

      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:180, borderRadius:'var(--radius)' }} />)}
        </div>
      ) : list.length === 0 ? (
        <div className="glass empty" style={{ padding:60 }}>
          <div className="empty-icon">🏪</div>
          <h3>Hozircha do'kon yo'q</h3>
          <button onClick={openAdd} className="btn btn-primary" style={{ marginTop:16 }}>Do'kon yaratish</button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
          {list.map(shop => (
            <div key={shop.id} className="glass glass-hover" style={{ padding:20 }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:14 }}>
                <div style={{ width:46, height:46, borderRadius:13, background:'linear-gradient(135deg,rgba(79,142,247,0.3),rgba(79,142,247,0.1))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Clash Display', fontWeight:700, fontSize:20, color:'var(--blue)', flexShrink:0 }}>
                  {shop.name[0].toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <h3 style={{ fontSize:15, fontWeight:700, marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{shop.name}</h3>
                  <p style={{ fontSize:12, color:'var(--text-3)' }}>/{shop.slug || 'slug'}</p>
                </div>
              </div>
              {shop.description && <p style={{ fontSize:13, color:'var(--text-2)', marginBottom:10, lineHeight:1.5 }}>{shop.description}</p>}
              {shop.address && (
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text-3)', marginBottom:10 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {shop.address}
                </div>
              )}
              <div style={{ marginBottom:14 }}>
                <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:100, background: shop.bot_token ? 'rgba(34,211,165,0.12)' : 'rgba(255,255,255,0.05)', color: shop.bot_token ? 'var(--green)' : 'var(--text-3)', border: `1px solid ${shop.bot_token ? 'rgba(34,211,165,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
                  {shop.bot_token ? 'Bot ulangan' : 'Bot yo\'q'}
                </span>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <Link href={`/shop/${shop.slug}`} target="_blank" className="btn btn-ghost btn-sm" style={{ gap:5 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Ko'rish
                </Link>
                <button onClick={() => openEdit(shop)} className="btn btn-ghost btn-sm" style={{ gap:5 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Tahrirlash
                </button>
                <button onClick={() => del(shop.id)} disabled={deleting === shop.id} className="btn btn-danger btn-icon" style={{ marginLeft:'auto' }}>
                  {deleting === shop.id ? <Spinner /> : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth:500, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
              <h2 style={{ fontFamily:'Clash Display', fontSize:20, fontWeight:700 }}>
                {modal === 'edit' ? "Do'konni tahrirlash" : "Yangi do'kon"}
              </h2>
              <button onClick={() => setModal(null)} className="btn btn-ghost btn-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {error && (
              <div style={{ background:'rgba(245,82,82,0.1)', border:'1px solid rgba(245,82,82,0.2)', borderRadius:9, padding:'10px 14px', marginBottom:16, fontSize:13, color:'#ff8080' }}>{error}</div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={LabelStyle}>Do'kon nomi *</label>
                <input className="input" placeholder="Masalan: Kitob do'konim" value={form.name||''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label style={LabelStyle}>Tavsif</label>
                <input className="input" placeholder="Do'kon haqida qisqacha..." value={form.description||''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label style={LabelStyle}>Manzil</label>
                <input className="input" placeholder="Shahar, ko'cha..." value={form.address||''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <div>
                <label style={LabelStyle}>Telegram Bot Token</label>
                <input className="input" placeholder="123456:ABC-..." value={form.bot_token||''} onChange={e => setForm(f => ({ ...f, bot_token: e.target.value }))} />
                <p style={{ fontSize:11, color:'var(--text-3)', marginTop:5 }}>
                  @BotFather da yangi bot yarating va tokenini ko'chiring
                </p>
              </div>

              {/* Chat ID - yordamchi bot bilan */}
              <div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                  <label style={{ ...LabelStyle, marginBottom:0 }}>Chat ID</label>
                  <button
                    onClick={() => setChatIdHelp(!chatIdHelp)}
                    style={{ fontSize:11, color:'var(--blue)', background:'rgba(79,142,247,0.1)', border:'1px solid rgba(79,142,247,0.2)', borderRadius:6, padding:'3px 10px', cursor:'pointer', fontWeight:600 }}
                  >
                    {chatIdHelp ? 'Yopish' : "Chat ID ni qanday topaman?"}
                  </button>
                </div>
                <input className="input" placeholder="-100123456789" value={form.chat_id||''} onChange={e => setForm(f => ({ ...f, chat_id: e.target.value }))} />

                {chatIdHelp && (
                  <div style={{ marginTop:10, background:'rgba(79,142,247,0.06)', border:'1px solid rgba(79,142,247,0.15)', borderRadius:10, padding:14 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:10 }}>
                      Chat ID ni topish uchun:
                    </p>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {[
                        { n:'1', t:'Telegram da', d:<>@professional_working_bot ni oching</>},
                        { n:'2', t:'/start yuboring', d:"Bot sizga Chat ID ni avtomatik yuboradi"},
                        { n:'3', t:"Ko'chiring", d:"Yuborilgan raqamni shu yerga joylashtiring"},
                      ].map(s => (
                        <div key={s.n} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                          <div style={{ width:22, height:22, borderRadius:'50%', background:'rgba(79,142,247,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'var(--blue)', flexShrink:0 }}>{s.n}</div>
                          <div>
                            <span style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>{s.t}: </span>
                            <span style={{ fontSize:12, color:'var(--text-2)' }}>{s.d}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <a href="https://t.me/professional_working_bot" target="_blank" rel="noreferrer"
                      style={{ display:'inline-flex', alignItems:'center', gap:6, marginTop:12, background:'rgba(79,142,247,0.15)', border:'1px solid rgba(79,142,247,0.3)', borderRadius:8, padding:'8px 14px', color:'var(--blue)', fontSize:13, fontWeight:600, textDecoration:'none' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>
                      @professional_working_bot ni ochish
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display:'flex', gap:10, marginTop:22 }}>
              <button onClick={() => setModal(null)} className="btn btn-ghost" style={{ flex:1, justifyContent:'center' }}>Bekor qilish</button>
              <button onClick={save} disabled={saving} className="btn btn-primary" style={{ flex:1, justifyContent:'center' }}>
                {saving ? <Spinner /> : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
