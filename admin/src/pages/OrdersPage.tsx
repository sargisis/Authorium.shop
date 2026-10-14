import { useEffect, useState } from 'react';
import { getOrders } from '../api';
import type { Order } from '../api';
import { ShoppingCart } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders().then(setOrders).catch(() => setOrders([])).finally(() => setLoading(false));
  }, []);

  const statusColor: Record<string, string> = { paid: 'green', pending: 'yellow', failed: 'red' };
  const statusLabel: Record<string, string> = {
    paid: 'Վճարված',
    pending: 'Սպասվում է',
    failed: 'Մերժված',
  };

  return (
    <div className="page">
      <div className="section-title">Պատվերներ</div>
      <div className="section-sub">Խանութի բոլոր գնումների և գործարքների պատմությունը</div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Գրքեր</th>
                <th>Telegram ID</th>
                <th>Գումար</th>
                <th>Կարգավիճակ</th>
                <th>Ամսաթիվ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    Բեռնվում է...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    <ShoppingCart size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                    Պատվերներ դեռ չկան
                  </td>
                </tr>
              ) : orders.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{o.id}</td>
                  <td style={{ fontWeight: 500, maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={o.items_summary}>
                    {o.items_summary || '—'}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{o.buyer_telegram_id}</td>
                  <td style={{ fontWeight: 700 }}>{o.total.toLocaleString()} ֏</td>
                  <td>
                    <span className={`badge ${statusColor[o.status] || 'gray'}`}>
                      {statusLabel[o.status] || o.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {new Date(o.created_at).toLocaleString('hy-AM')}
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

