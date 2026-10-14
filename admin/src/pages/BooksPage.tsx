import { useEffect, useState } from 'react';
import { getBooks, createBook, updateBook, deleteBook } from '../api';
import type { Book } from '../api';
import { Plus, Pencil, Trash2, Search, BookOpen, ToggleLeft, ToggleRight } from 'lucide-react';

const resolveCoverUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const backendBase = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:8080'
    : 'https://api.authorium.store';
  return `${backendBase}${url}`;
};

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [form, setForm] = useState({ title: '', author: '', description: '', price: '', cover_url: '', file_url: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getBooks().then(setBooks).catch(() => setBooks([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', author: '', description: '', price: '', cover_url: '', file_url: '' });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (b: Book) => {
    setEditing(b);
    setForm({ title: b.title, author: b.author, description: b.description || '', price: String(b.price), cover_url: b.cover_url || '', file_url: b.file_url || '' });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    // Client-side validation
    if (!form.title.trim()) { setFormError('Վերնագիրը պարտադիր է'); return; }
    if (!form.author.trim()) { setFormError('Հեղինակը պարտադիր է'); return; }
    const price = parseFloat(form.price);
    if (!form.price || isNaN(price) || price <= 0) { setFormError('Գինը պարտադիր է (0-ից մեծ)'); return; }

    setSaving(true);
    setFormError('');
    try {
      const payload = { ...form, price, title: form.title.trim(), author: form.author.trim() };
      if (editing) {
        await updateBook(editing.id, payload);
      } else {
        await createBook({ ...payload, active: true });
      }
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Սխալ տեղի ունեցավ';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Հեռացնե՞լ գիրքը:')) return;
    try {
      await deleteBook(id);
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ջնջման սխալ';
      alert(msg);
    }
  };

  const handleToggle = async (b: Book) => {
    await updateBook(b.id, { active: !b.active });
    load();
  };

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div className="section-title">Գրքերի Կատալոգ</div>
          <div className="section-sub">Խանութի գրքերի և գնացուցակի կառավարում</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={15} /> Ավելացնել գիրք
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="form-input"
          style={{ paddingLeft: 36 }}
          placeholder="Որոնել ըստ վերնագրի կամ հեղինակի..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Գիրք</th>
                <th>Հեղինակ</th>
                <th>Գին</th>
                <th>Կարգավիճակ</th>
                <th>Ավելացված է</th>
                <th style={{ textAlign: 'right' }}>Գործողություններ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Բեռնվում է...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  <BookOpen size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                  Գրքեր չեն գտնվել
                </td></tr>
              ) : filtered.map(b => (
                <tr key={b.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {b.cover_url
                        ? <img src={resolveCoverUrl(b.cover_url)} alt={b.title} className="book-thumb" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        : <div className="book-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontSize: 18 }}>📚</div>
                      }
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{b.title}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-dim)' }}>{b.author}</td>
                  <td style={{ fontWeight: 700 }}>{b.price.toLocaleString()} ֏</td>
                  <td>
                    <span className={`badge ${b.active ? 'green' : 'gray'}`}>
                      {b.active ? 'Ակտիվ' : 'Թաքցված'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {new Date(b.created_at).toLocaleDateString('hy-AM')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleToggle(b)} title={b.active ? 'Թաքցնել' : 'Ցուցադրել'}>
                        {b.active ? <ToggleRight size={15} color="var(--success)" /> : <ToggleLeft size={15} />}
                      </button>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(b)} title="Խմբագրել">
                        <Pencil size={14} />
                      </button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(b.id)} title="Հեռացնել">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Խմբագրել գիրքը' : 'Ավելացնել նոր գիրք'}</div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Վերնագիր *</label>
                  <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Գրքի վերնագիրը" />
                </div>
                <div className="form-group">
                  <label className="form-label">Հեղինակ *</label>
                  <input className="form-input" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} placeholder="Հեղինակի անունը" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Նկարագրություն</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Գրքի համառոտ նկարագրությունը..." />
              </div>
              <div className="form-group">
                <label className="form-label">Գին (AMD) *</label>
                <input className="form-input" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="1500" />
              </div>
              <div className="form-group">
                <label className="form-label">Շապիկի հղում (Cover URL)</label>
                <input className="form-input" value={form.cover_url} onChange={e => setForm(f => ({ ...f, cover_url: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label className="form-label">Գրքի ֆայլի հղում (EPUB/PDF URL)</label>
                <input className="form-input" value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))} placeholder="https://..." />
              </div>
            </div>
            <div className="modal-footer">
              {formError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--danger)', flex: 1, marginRight: 8 }}>
                  {formError}
                </div>
              )}
              <button className="btn btn-ghost" onClick={() => setModalOpen(false)} disabled={saving}>Չեղարկել</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Պահպանում...' : (editing ? 'Պահպանել' : 'Ավելացնել')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

