import { useEffect, useState } from 'react';
import { getSummary, getSalesChart, getTopBooks } from '../api';
import type { StatsSummary, SalesPoint, TopBook } from '../api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, ShoppingCart, BookOpen, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [chart, setChart] = useState<SalesPoint[]>([]);
  const [topBooks, setTopBooks] = useState<TopBook[]>([]);

  const to = new Date().toISOString().split('T')[0];
  const from = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  useEffect(() => {
    getSummary().then(setSummary).catch(() => setSummary({ revenue: 0, orders_count: 0, avg_order_value: 0, books_count: 0 }));
    getSalesChart(from, to, 'day').then(setChart).catch(() => setChart([]));
    getTopBooks(from, to, 5).then(setTopBooks).catch(() => setTopBooks([]));
  }, []);

  const fmt = (n: number) => n.toLocaleString('hy-AM') + ' ֏';

  return (
    <div className="page">
      <div className="section-title">Վահանակ</div>
      <div className="section-sub">Իրական ժամանակի տվյալներ և վիճակագրություն</div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card orange">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="stat-label">Ընդհանուր Հասույթ</div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,87,34,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} color="var(--primary)" />
            </div>
          </div>
          <div className="stat-value">{summary ? fmt(summary.revenue) : '0 ֏'}</div>
          <div className="stat-change" style={{ color: 'var(--text-muted)' }}>Փաստացի վճարումներ</div>
        </div>

        <div className="stat-card green">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="stat-label">Վճարված Պատվերներ</div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={18} color="var(--success)" />
            </div>
          </div>
          <div className="stat-value">{summary?.orders_count ?? 0}</div>
          <div className="stat-change" style={{ color: 'var(--text-muted)' }}>Կատարված գնումներ</div>
        </div>

        <div className="stat-card yellow">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="stat-label">Միջին Չեկ</div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,200,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="var(--yellow)" />
            </div>
          </div>
          <div className="stat-value">{summary ? fmt(Math.round(summary.avg_order_value)) : '0 ֏'}</div>
          <div className="stat-change" style={{ color: 'var(--text-muted)' }}>Մեկ պատվերի միջին գին</div>
        </div>

        <div className="stat-card blue">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="stat-label">Գրքեր Կատալոգում</div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} color="#3B82F6" />
            </div>
          </div>
          <div className="stat-value">{summary?.books_count ?? 0}</div>
          <div className="stat-change" style={{ color: 'var(--text-muted)' }}>Ակտիվ տեսականի</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Վաճառքների Դինամիկա</div>
              <div className="card-subtitle">Օրական հասույթի գրաֆիկ</div>
            </div>
          </div>
          {chart.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chart} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF5722" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#FF5722" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#71717A', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#71717A', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#18181F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#FF5722" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Դեռ վաճառքների տվյալներ չկան
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Թոփ Գրքեր</div>
              <div className="card-subtitle">Ըստ ամենաշատ վաճառված քանակի</div>
            </div>
          </div>
          {topBooks.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topBooks} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="title" tick={{ fill: '#71717A', fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#71717A', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#18181F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="revenue" fill="#FF5722" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Գնված գրքեր դեռ չկան
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
