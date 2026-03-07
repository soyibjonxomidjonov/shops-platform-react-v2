'use client';
import { useEffect, useState, useRef } from 'react';
import { products, shops } from '@/lib/api';
import { Product, Shop } from '@/types';

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://shops-platform.uz/api/v1').replace('/api/v1', '');
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shops-platform.uz/api/v1';
const UNITY_OPTS = ['dona', 'kg', 'litr', 'metr'] as const;
const EMPTY: Partial<Product> = { name:'', description:'', price:0, stock:0, unity:'dona', shop:0, image:'' };

export default function ProductsPage() {
  const [list, setList]           = useState<Product[]>([]);
  const [shopList, setShopList]   = useState<Shop[]>([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState<'add'|'edit'|null>(null);
  const [form, setForm]           = useState<Partial<Product>>(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [toast, setToast]         = useState('');
  const [search, setSearch]       = useState('');
  const [filterShop, setFilterShop] = useState('');
  const [imageMode, setImageMode] = useState<'url'|'file'>('url');
  const [imagePreview, setImagePreview] = useState('');
  const [selectedFile, setSelectedFile] = useState<File|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const [p, s] = await Promise.all([products.list(), shops.list()]);
    setList(p.results); setShopList(s.results); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openAdd = () => {
    setForm({ ...EMPTY, shop: shopList[0]?.id || 0 });
    setError(''); setImagePreview(''); setImageMode('url'); setSelectedFile(null);
    setModal('add');
  };
  const openEdit = (p: Product) => {
    // Rasmni to'liq URL ga aylantirish (form da saqlanadi)
    const fullImg = p.image
      ? (p.image.startsWith('http') ? p.image : BASE_URL + p.image)
      : '';
    setForm({ ...p, image: fullImg });
    setImagePreview(fullImg);
    setImageMode('url'); setSelectedFile(null); setError('');
    setModal('edit');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!form.name?.trim()) { setError("Mahsulot nomi majburiy"); return; }
    if (!form.shop) { setError("Do'konni tanlang"); return; }
    setSaving(true); setError('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const authHeaders: Record<string,string> = token ? { 'Authorization': `Bearer ${token}` } : {};

      // Har doim FormData ishlatamiz — server image ni faqat multipart qabul qiladi
      const fd = new FormData();
      fd.append('name', form.name || '');
      fd.append('shop', String(form.shop));
      if (form.description) fd.append('description', form.description);
      fd.append('price', String(form.price || 0));
      fd.append('stock', String(form.stock || 0));
      fd.append('unity', form.unity || 'dona');

      // Rasm: fayl tanlangan bo'lsa — fayl yuboramiz
      if (selectedFile) {
        fd.append('image', selectedFile);
      }
      // Rasm: URL rejimida — to'g'ridan to'g'ri URL string yuboramiz (fetch qilmasdan)
      else if (imageMode === 'url' && form.image && form.image.startsWith('http')) {
        const originalImg = list.find(p => p.id === form.id)?.image || '';
        const originalFull = originalImg.startsWith('http') ? originalImg : (originalImg ? BASE_URL + originalImg : '');
        const isChanged = form.image !== originalFull && form.image !== originalImg;
        if (isChanged || modal === 'add') {
          // URL o'zgargan — string sifatida yuboramiz
          fd.append('image', form.image);
        }
        // o'zgarmagan bo'lsa — image fieldini yubormaymiz
      }
      // imageMode === 'file' lekin fayl tanlanmagan — image fieldini yubormaymiz

      const url = modal === 'edit' && form.id
        ? `${API_URL}/products/${form.id}/`
        : `${API_URL}/products/`;
      const method = modal === 'edit' ? 'PATCH' : 'POST';

      const res = await fetch(url, { method, headers: authHeaders, body: fd });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(Object.values(err).flat().join(', ') || 'Xato');
      }
      const saved = await res.json();
      if (modal === 'edit') setList(l => l.map(p => p.id === saved.id ? saved : p));
      else setList(l => [saved, ...l]);

      showToast(modal === 'edit' ? "Mahsulot yangilandi \u2713" : "Mahsulot qo'shildi \u2713");
      setModal(null);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!confirm("Mahsulotni o'chirishni tasdiqlaysizmi?")) return;
    try { await products.delete(id); setList(l => l.filter(p => p.id !== id)); showToast("O'chirildi"); }
    catch (e: any) { alert(e.message); }
  };

  const filtered = list.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterShop ? String(p.shop) === filterShop : true)
  );
  const shopName = (id: number) => shopList.find(s => s.id === id)?.name || `Do'kon #${id}`;
  const getImg = (img: string) => !img ? '' : img.startsWith('http') || img.startsWith('data:') ? img : BASE_URL + img;

  const Spinner = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:'spin 0.8s linear infinite' }}>
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
          <h1 style={{ fontFamily:'Clash Display', fontSize:26, fontWeight:700, marginBottom:4 }}>Mahsulotlar</h1>
          <p style={{ color:'var(--text-2)', fontSize:14 }}>{list.length} ta mahsulot</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Mahsulot qo'shish
        </button>
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:20 }}>
        <input className="input" style={{ maxWidth:280 }} placeholder="Qidirish..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input" style={{ maxWidth:220 }} value={filterShop} onChange={e => setFilterShop(e.target.value)}>
          <option value="">Barcha do'konlar</option>
          {shopList.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height:280, borderRadius:'var(--radius)' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass empty" style={{ padding:60 }}>
          <div className="empty-icon">📦</div>
          <h3>Mahsulot topilmadi</h3>
          <button onClick={openAdd} className="btn btn-primary" style={{ marginTop:16 }}>Mahsulot qo'shish</button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12 }}>
          {filtered.map(prod => (
            <div key={prod.id} className="glass glass-hover" style={{ overflow:'hidden', display:'flex', flexDirection:'column' }}>
              <div style={{ height:140, background:'linear-gradient(135deg,rgba(79,142,247,0.06),rgba(34,211,165,0.06))', position:'relative', flexShrink:0 }}>
                {prod.image
                  ? <img src={getImg(prod.image)} alt={prod.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => (e.currentTarget.style.display='none')} />
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                    </div>
                }
                {prod.stock === 0 && (
                  <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ background:'rgba(245,82,82,0.85)', color:'white', padding:'3px 12px', borderRadius:100, fontSize:11, fontWeight:600 }}>Tugagan</span>
                  </div>
                )}
                <div style={{ position:'absolute', top:8, right:8 }}>
                  <span className="tag" style={{ fontSize:11 }}>{shopName(prod.shop)}</span>
                </div>
              </div>
              <div style={{ padding:'14px', flex:1, display:'flex', flexDirection:'column', gap:8 }}>
                <h3 style={{ fontSize:14, fontWeight:600 }}>{prod.name}</h3>
                {prod.description && <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as any, overflow:'hidden' }}>{prod.description}</p>}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'auto' }}>
                  <span style={{ fontSize:16, fontWeight:700, color:'var(--green)' }}>{prod.price.toLocaleString()} so'm</span>
                  <span style={{ fontSize:12, color:'var(--text-3)' }}>/{prod.unity}</span>
                </div>
                <div style={{ fontSize:12, color: prod.stock > 0 ? 'var(--text-2)' : 'var(--red)' }}>Qoldiq: {prod.stock} {prod.unity}</div>
                <div style={{ display:'flex', gap:6, marginTop:4 }}>
                  <button onClick={() => openEdit(prod)} className="btn btn-ghost btn-sm" style={{ flex:1, justifyContent:'center' }}>Tahrirlash</button>
                  <button onClick={() => del(prod.id)} className="btn btn-danger btn-icon">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth:500, maxHeight:'92vh', overflowY:'auto' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
              <h2 style={{ fontFamily:'Clash Display', fontSize:20, fontWeight:700 }}>{modal === 'edit' ? 'Tahrirlash' : 'Yangi mahsulot'}</h2>
              <button onClick={() => setModal(null)} className="btn btn-ghost btn-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {error && (
              <div style={{ background:'rgba(245,82,82,0.1)', border:'1px solid rgba(245,82,82,0.2)', borderRadius:9, padding:'10px 14px', marginBottom:16, fontSize:13, color:'#ff8080' }}>{error}</div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
              {/* Do'kon */}
              <div>
                <label style={LabelStyle}>Do'kon *</label>
                <select className="input" value={form.shop||''} onChange={e => setForm(f => ({ ...f, shop: Number(e.target.value) }))}>
                  <option value="">Do'konni tanlang</option>
                  {shopList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              {/* Nom */}
              <div>
                <label style={LabelStyle}>Mahsulot nomi *</label>
                <input className="input" placeholder="Masalan: Kitob, Kiyim..." value={form.name||''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              {/* Tavsif */}
              <div>
                <label style={LabelStyle}>Tavsif</label>
                <input className="input" placeholder="Qisqacha tavsif..." value={form.description||''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              {/* Rasm */}
              <div>
                <label style={LabelStyle}>Rasm</label>
                <div style={{ display:'flex', gap:6, marginBottom:10 }}>
                  {(['url','file'] as const).map(m => (
                    <button key={m} onClick={() => { setImageMode(m); setSelectedFile(null); }}
                      style={{ flex:1, padding:'8px', borderRadius:9, border:'1px solid', borderColor: imageMode===m ? 'var(--blue)' : 'var(--border)', background: imageMode===m ? 'rgba(79,142,247,0.12)' : 'transparent', color: imageMode===m ? 'var(--blue)' : 'var(--text-2)', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                      {m === 'url' ? '🔗 URL manzil' : '📁 Qurilmadan'}
                    </button>
                  ))}
                </div>

                {imageMode === 'url' ? (
                  <input className="input" placeholder="https://example.com/image.jpg" value={form.image||''}
                    onChange={e => { setForm(f => ({ ...f, image: e.target.value })); setImagePreview(e.target.value); }} />
                ) : (
                  <div onClick={() => fileRef.current?.click()}
                    style={{ border:'2px dashed var(--border)', borderRadius:10, padding:'24px', textAlign:'center', cursor:'pointer', background:'rgba(255,255,255,0.02)', transition:'border-color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor='rgba(79,142,247,0.4)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor='var(--border)')}>
                    <div style={{ fontSize:28, marginBottom:6 }}>📸</div>
                    <div style={{ fontSize:13, color:'var(--text-2)' }}>{selectedFile ? selectedFile.name : 'Rasm tanlash uchun bosing'}</div>
                    <div style={{ fontSize:11, color:'var(--text-3)', marginTop:4 }}>JPG, PNG, WebP · Max 5MB</div>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFileChange} />
                  </div>
                )}

                {imagePreview && (
                  <div style={{ marginTop:10, borderRadius:10, overflow:'hidden', height:110, position:'relative' }}>
                    <img src={imagePreview} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => (e.currentTarget.style.display='none')} />
                    <button onClick={() => { setImagePreview(''); setForm(f => ({ ...f, image:'' })); setSelectedFile(null); }}
                      style={{ position:'absolute', top:6, right:6, background:'rgba(0,0,0,0.65)', border:'none', borderRadius:'50%', width:26, height:26, cursor:'pointer', color:'white', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                  </div>
                )}
              </div>

              {/* Narx, Qoldiq, Birlik */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                <div>
                  <label style={LabelStyle}>Narx (so'm) *</label>
                  <input className="input" type="number" min="0" placeholder="0" value={form.price||''} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
                </div>
                <div>
                  <label style={LabelStyle}>Qoldiq</label>
                  <input className="input" type="number" min="0" placeholder="0" value={form.stock||''} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} />
                </div>
                <div>
                  <label style={LabelStyle}>Birlik</label>
                  <select className="input" value={form.unity||'dona'} onChange={e => setForm(f => ({ ...f, unity: e.target.value as any }))}>
                    {UNITY_OPTS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
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
