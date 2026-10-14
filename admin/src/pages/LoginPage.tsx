import { useState, type FormEvent } from 'react';
import { login as apiLogin } from '../api';
import { useAuth } from '../AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiLogin(username, password);
      login(res.user, res.access_token);
    } catch {
      setError('Սխալ մուտքանուն կամ գաղտնաբառ (կամ գերազանցվել է հարցումների քանակը)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img
          src="/logo.png"
          alt="Authorium"
          style={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            objectFit: 'cover',
            margin: '0 auto 16px',
            display: 'block',
            boxShadow: '0 8px 24px rgba(255, 200, 0, 0.4)',
          }}
        />
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontWeight: 800, fontSize: 20 }}>Authorium.store</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Կառավարման Համակարգ</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Մուտքանուն</label>
            <input
              className="form-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Գաղտնաբառ</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--danger)' }}>
              {error}
            </div>
          )}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: 4 }}>
            {loading ? 'Մուտք...' : 'Մուտք գործել'}
          </button>
        </form>
      </div>
    </div>
  );
}
