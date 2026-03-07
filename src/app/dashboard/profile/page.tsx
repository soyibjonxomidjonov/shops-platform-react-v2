'use client';
import { useEffect, useState } from 'react';
import { profile } from '@/lib/api';

type User = { id: number; username: string; email: string };

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailForm, setEmailForm] = useState({ email: '' });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '' });
  const [unForm, setUnForm] = useState({ current_password: '', new_username: '' });
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState({ msg: '', type: 'success' });

  useEffect(() => {
    profile.get()
      .then(u => { setUser(u as any); setEmailForm({ email: (u as any).email || '' }); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
  };

  const saveEmail = async () => {
    setSaving('email');
    try {
      await profile.update({ email: emailForm.email } as any);
      setUser(u => u ? { ...u, email: emailForm.email } : u);
      showToast("Email yangilandi \u2713");
    } catch (e: any) { showToast(e.message, 'error'); }
    finally { setSaving(null); }
  };

  const savePw = async () => {
    if (!pwForm.current_password || !pwForm.new_password) { showToast("Barcha maydonlarni to'ldiring", 'error'); return; }
    if (pwForm.new_password.length < 8) { showToast("Parol kamida 8 ta belgi bo'lishi kerak", 'error'); return; }
    setSaving('pw');
    try {
      await profile.changePassword(pwForm);
      setPwForm({ current_password: '', new_password: '' });
      showToast("Parol o'zgartirildi \u2713");
    } catch (e: any) { showToast(e.message, 'error'); }
    finally { setSaving(null); }
  };

  const saveUsername = async () => {
    if (!unForm.current_password || !unForm.new_username) { showToast("Barcha maydonlarni to'ldiring", 'error'); return; }
    setSaving('un');
    try {
      await profile.changeUsername(unForm);
      setUser(u => u ? { ...u, username: unForm.new_username } : u);
      setUnForm({ current_password: '', new_username: '' });
      showToast("Username o'zgartirildi \u2713");
    } catch (e: any) { showToast(e.message, 'error'); }
    finally { setSaving(null); }
  };

  const deleteAccount = async () => {
    if (!confirm("Hisobni o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi!")) return;
    if (!confirm("Ishonchingiz komilmi? Barcha ma'lumotlar o'chib ketadi!")) return;
    try {
      await profile.deleteAccount();
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const Spinner = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:'spin 0.8s linear infinite' }}>
      <path d="M21 12a9 9 0 11-6.219-8.56"/>
    </svg>
  );

  const Card = ({ children, danger }: { children: React.ReactNode; danger?: boolean }) => (
    <div className="glass" style={{ padding:24, border: danger ? '1px solid rgba(245,82,82,0.2)' : undefined }}>
      {children}
    </div>
  );

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label style={{ display:'block', fontSize:11, fontWeight:600, color:'var(--text-2)', marginBottom:7, letterSpacing:'0.05em', textTransform:'uppercase' as const }}>
      {children}
    </label>
  );

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height:120, borderRadius:'var(--radius)' }} />)}
    </div>
  );

  return (
    <div style={{ animation:'fadeUp 0.5s ease', maxWidth:620 }}>
      {/* Toast */}
      {toast.msg && (
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={toast.type === 'error' ? 'var(--red)' : 'var(--green)'} strokeWidth="2.5">
            {toast.type === 'error'
              ? <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
              : <polyline points="20 6 9 17 4 12"/>}
          </svg>
          <span style={{ fontSize:14 }}>{toast.msg}</span>
        </div>
      )}

      <h1 style={{ fontFamily:'Clash Display', fontSize:26, fontWeight:700, marginBottom:24 }}>Profil</h1>

      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {/* Avatar card */}
        <Card>
          <div style={{ display:'flex', alignItems:'center', gap:18 }}>
            <div style={{ width:64, height:64, borderRadius:18, background:'linear-gradient(135deg,rgba(79,142,247,0.4),rgba(79,142,247,0.15))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Clash Display', fontWeight:700, fontSize:28, color:'var(--blue)', flexShrink:0 }}>
              {user?.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div style={{ fontFamily:'Clash Display', fontSize:20, fontWeight:700, marginBottom:4 }}>{user?.username}</div>
              <div style={{ fontSize:13, color:'var(--text-2)', marginBottom:4 }}>{user?.email || 'Email qo\'shilmagan'}</div>
              <div style={{ fontSize:11, color:'var(--text-3)' }}>ID: #{user?.id}</div>
            </div>
          </div>
        </Card>

        {/* Email */}
        <Card>
          <h3 style={{ fontFamily:'Clash Display', fontSize:16, fontWeight:700, marginBottom:16 }}>Email manzil</h3>
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ flex:1 }}>
              <Label>Email</Label>
              <input className="input" type="email" placeholder="email@example.com" value={emailForm.email} onChange={e => setEmailForm({ email: e.target.value })} />
            </div>
            <button onClick={saveEmail} disabled={saving==='email'} className="btn btn-primary" style={{ alignSelf:'flex-end', minWidth:100, justifyContent:'center' }}>
              {saving==='email' ? <Spinner /> : 'Saqlash'}
            </button>
          </div>
        </Card>

        {/* Username */}
        <Card>
          <h3 style={{ fontFamily:'Clash Display', fontSize:16, fontWeight:700, marginBottom:16 }}>Username o'zgartirish</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div>
              <Label>Joriy parol</Label>
              <input className="input" type="password" placeholder="Joriy parolingiz" value={unForm.current_password} onChange={e => setUnForm(f => ({ ...f, current_password: e.target.value }))} />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <div style={{ flex:1 }}>
                <Label>Yangi username</Label>
                <input className="input" placeholder="yangi_username" value={unForm.new_username} onChange={e => setUnForm(f => ({ ...f, new_username: e.target.value }))} />
              </div>
              <button onClick={saveUsername} disabled={saving==='un'} className="btn btn-primary" style={{ alignSelf:'flex-end', minWidth:100, justifyContent:'center' }}>
                {saving==='un' ? <Spinner /> : 'O\'zgartirish'}
              </button>
            </div>
          </div>
        </Card>

        {/* Password */}
        <Card>
          <h3 style={{ fontFamily:'Clash Display', fontSize:16, fontWeight:700, marginBottom:16 }}>Parol o'zgartirish</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div>
              <Label>Joriy parol</Label>
              <input className="input" type="password" placeholder="Joriy parolingiz" value={pwForm.current_password} onChange={e => setPwForm(f => ({ ...f, current_password: e.target.value }))} />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <div style={{ flex:1 }}>
                <Label>Yangi parol</Label>
                <input className="input" type="password" placeholder="Kamida 8 ta belgi" value={pwForm.new_password} onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))} />
              </div>
              <button onClick={savePw} disabled={saving==='pw'} className="btn btn-primary" style={{ alignSelf:'flex-end', minWidth:100, justifyContent:'center' }}>
                {saving==='pw' ? <Spinner /> : 'O\'zgartirish'}
              </button>
            </div>
          </div>
        </Card>

        {/* Danger zone */}
        <Card danger>
          <h3 style={{ fontFamily:'Clash Display', fontSize:16, fontWeight:700, marginBottom:8, color:'var(--red)' }}>Xavfli zona</h3>
          <p style={{ fontSize:13, color:'var(--text-2)', marginBottom:16, lineHeight:1.6 }}>
            Hisobni o'chirilgandan so'ng barcha ma'lumotlar yo'qoladi. Bu amalni qaytarib bo'lmaydi.
          </p>
          <button onClick={deleteAccount} className="btn btn-danger">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
            Hisobni o'chirish
          </button>
        </Card>
      </div>
    </div>
  );
}
