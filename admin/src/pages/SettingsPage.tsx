import { useEffect, useState, type FormEvent } from 'react';
import { changePassword, getUsers, createUser, deleteUser, type AdminUser } from '../api';
import { useAuth } from '../AuthContext';
import { Shield, KeyRound, UserPlus, Users, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  // Partners / Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [newLogin, setNewLogin] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'owner'>('admin');
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');

  const loadUsers = () => {
    setLoadingUsers(true);
    getUsers()
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPassword !== confirmPassword) {
      setPassError('Նոր գաղտնաբառերը չեն համընկնում');
      return;
    }
    if (newPassword.length < 4) {
      setPassError('Գաղտնաբառը պետք է ունենա առնվազն 4 նիշ');
      return;
    }

    setPassLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPassSuccess('Գաղտնաբառը հաջողությամբ փոխվել է');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setPassError('Ընթացիկ գաղտնաբառը սխալ է կամ տեղի է ունեցել սխալ');
    } finally {
      setPassLoading(false);
    }
  };

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    setUserError('');
    setUserSuccess('');

    if (newLogin.trim() === '' || newUserPass.length < 4) {
      setUserError('Մուտքանունը և գաղտնաբառը (առնվազն 4 նիշ) պարտադիր են');
      return;
    }

    setUserLoading(true);
    try {
      await createUser({ login: newLogin.trim(), password: newUserPass, role: newRole });
      setUserSuccess('Նոր գործընկերը հաջողությամբ ավելացվել է');
      setNewLogin('');
      setNewUserPass('');
      loadUsers();
    } catch {
      setUserError('Այս մուտքանունով օգտատեր արդեն գոյություն ունի');
    } finally {
      setUserLoading(false);
    }
  };

  const handleDeleteUser = async (id: number, login: string) => {
    if (!confirm(`Հեռացնե՞լ «${login}» օգտատիրոջ մուտքի իրավունքը:`)) return;
    try {
      await deleteUser(id);
      loadUsers();
    } catch {
      alert('Հնարավոր չէ հեռացնել սեփական հաշիվը');
    }
  };

  return (
    <div className="page">
      <div className="section-title">Կարգավորումներ</div>
      <div className="section-sub">Անվտանգության, գաղտնաբառերի և գործընկերների կառավարում</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '20px' }}>
        {/* Change Password Card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,87,34,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <KeyRound size={18} color="var(--primary)" />
              </div>
              <div>
                <div className="card-title">Գաղտնաբառի փոփոխում</div>
                <div className="card-subtitle">Փոխեք ձեր մուտքի գաղտնաբառը</div>
              </div>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            <div className="form-group">
              <label className="form-label">Ընթացիկ գաղտնաբառ *</label>
              <input
                className="form-input"
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Նոր գաղտնաբառ *</label>
              <input
                className="form-input"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Հաստատել նոր գաղտնաբառը *</label>
              <input
                className="form-input"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {passSuccess && (
              <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} />
                <span>{passSuccess}</span>
              </div>
            )}

            {passError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} />
                <span>{passError}</span>
              </div>
            )}

            <button
              className="btn btn-primary"
              type="submit"
              disabled={passLoading}
              style={{ justifyContent: 'center', padding: '11px', marginTop: '6px' }}
            >
              {passLoading ? 'Պահպանվում է...' : 'Պահպանել նոր գաղտնաբառը'}
            </button>
          </form>
        </div>

        {/* Security & Sessions Status */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={18} color="var(--success)" />
              </div>
              <div>
                <div className="card-title">Անվտանգության Համակարգ</div>
                <div className="card-subtitle">Սեսիաներ և Rate Limiting կարգավիճակ</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            <div style={{ background: 'var(--bg)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Rate Limiting (Պաշտպանություն)</span>
                <span className="badge green">Ակտիվ է</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Ավտոմատ պաշտպանություն brute-force և DDoS հարձակումներից (առավելագույնը 5 մուտքի փորձ րոպեում):
              </p>
            </div>

            <div style={{ background: 'var(--bg)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Անվտանգ Սեսիաներ</span>
                <span className="badge green">Ակտիվ է</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                JWT Token նույնականացում (գործում է 7 օր): Բոլոր հարցումները պաշտպանված են ստորագրությամբ:
              </p>
            </div>

            <div style={{ background: 'var(--bg)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Գաղտնաբառերի Հեշավորում</span>
                <span className="badge green">Bcrypt v0.56</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Բոլոր գաղտնաբառերը պահպանվում են գաղտնագրված տեսքով:
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Partners / Admins Management */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,200,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="var(--yellow)" />
            </div>
            <div>
              <div className="card-title">Գործընկերների և Ադմինների Կառավարում</div>
              <div className="card-subtitle">Ավելացրեք նոր մուտքի հաշիվներ ձեր գործընկերոջ համար</div>
            </div>
          </div>
        </div>

        {/* Add User Form */}
        <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'flex-end', background: 'var(--bg)', padding: '16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid var(--border)' }}>
          <div className="form-group">
            <label className="form-label">Գործընկերոջ մուտքանուն *</label>
            <input
              className="form-input"
              value={newLogin}
              onChange={e => setNewLogin(e.target.value)}
              placeholder="partner_name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Գաղտնաբառ *</label>
            <input
              className="form-input"
              type="password"
              value={newUserPass}
              onChange={e => setNewUserPass(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Դեր</label>
            <select
              className="form-input"
              value={newRole}
              onChange={e => setNewRole(e.target.value as 'admin' | 'owner')}
              style={{ background: 'var(--bg-card)' }}
            >
              <option value="admin">Ադմին (Admin)</option>
              <option value="owner">Սեփականատեր (Owner)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={userLoading}
            style={{ height: '42px', justifyContent: 'center' }}
          >
            <UserPlus size={16} />
            <span>{userLoading ? 'Ավելացվում է...' : 'Ավելացնել'}</span>
          </button>
        </form>

        {userSuccess && (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'var(--success)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={16} />
            <span>{userSuccess}</span>
          </div>
        )}

        {userError && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'var(--danger)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} />
            <span>{userError}</span>
          </div>
        )}

        {/* Users Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Մուտքանուն</th>
                <th>Դեր</th>
                <th>Ստեղծվել է</th>
                <th style={{ textAlign: 'right' }}>Գործողություն</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>Բեռնվում է...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>Օգտատերեր չկան</td></tr>
              ) : users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.login}</td>
                  <td>
                    <span className={`badge ${u.role === 'owner' ? 'orange' : 'green'}`}>
                      {u.role === 'owner' ? 'Owner' : 'Admin'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {new Date(u.created_at).toLocaleDateString('hy-AM')}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {u.id !== user?.id && (
                      <button
                        className="btn btn-danger btn-icon btn-sm"
                        onClick={() => handleDeleteUser(u.id, u.login)}
                        title="Հեռացնել"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
