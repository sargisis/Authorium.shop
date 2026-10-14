import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BooksPage from './pages/BooksPage';
import OrdersPage from './pages/OrdersPage';
import SettingsPage from './pages/SettingsPage';
import {
  LayoutDashboard,
  BookOpen,
  ShoppingCart,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

function ProtectedLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return { title: 'Վահանակ և Վիճակագրություն', subtitle: 'Վաճառքների և առանցքային ցուցանիշների ակնարկ' };
      case '/books':
        return { title: 'Գրքերի Կատալոգ', subtitle: 'Ավելացում, խմբագրում և հասանելիության կառավարում' };
      case '/orders':
        return { title: 'Պատվերների Պատմություն', subtitle: 'Հաճախորդների բոլոր գնումները և գործարքները' };
      case '/settings':
        return { title: 'Կարգավորումներ', subtitle: 'Գաղտնաբառի փոփոխություն և ադմինների կառավարում' };
      default:
        return { title: 'Կառավարման Համակարգ', subtitle: 'Authorium.store' };
    }
  };

  const headerInfo = getPageTitle();

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/logo.png" alt="Authorium" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
          <div>
            <div className="brand-name">Authorium</div>
            <div className="brand-sub">Management Suite</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Գլխավոր Մենյու</div>

          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard className="nav-icon" size={18} />
            <span>Վահանակ</span>
          </NavLink>

          <NavLink
            to="/books"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <BookOpen className="nav-icon" size={18} />
            <span>Գրքերի Կատալոգ</span>
          </NavLink>

          <NavLink
            to="/orders"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <ShoppingCart className="nav-icon" size={18} />
            <span>Պատվերներ</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Settings className="nav-icon" size={18} />
            <span>Կարգավորումներ</span>
          </NavLink>

          <div className="nav-section-label" style={{ marginTop: 24 }}>Արտաքին Հղումներ</div>

          <a
            href="https://app.authorium.store"
            target="_blank"
            rel="noreferrer"
            className="nav-item"
            style={{ color: 'var(--text-muted)' }}
          >
            <ExternalLink className="nav-icon" size={18} />
            <span>Բացել Խանութը ↗</span>
          </a>
        </nav>

        {/* Sidebar Footer User Info */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--border)',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--yellow))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 14,
              color: '#000',
            }}>
              {user?.login?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.login || 'Ադմինիստրատոր'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <ShieldCheck size={11} color="var(--success)" />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {user?.role || 'owner'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'center', padding: '7px 12px', fontSize: 12 }}
          >
            <LogOut size={14} style={{ marginRight: 6 }} /> Ելք
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="topbar">
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
              {headerInfo.title}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {headerInfo.subtitle}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.25)',
              padding: '4px 10px',
              borderRadius: 20,
              fontSize: 11,
              color: 'var(--success)',
              fontWeight: 600,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
              API-ն ակտիվ է
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              color: 'var(--text-dim)',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              padding: '4px 10px',
              borderRadius: 8,
            }}>
              <Sparkles size={12} color="var(--yellow)" />
              <span>v1.0.0</span>
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function Main() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        gap: 16,
      }}>
        <div style={{
          width: 44,
          height: 44,
          border: '3px solid rgba(255,87,34,0.2)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>
          Authorium Admin-ի բեռնում...
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <ProtectedLayout />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Main />
      </BrowserRouter>
    </AuthProvider>
  );
}

