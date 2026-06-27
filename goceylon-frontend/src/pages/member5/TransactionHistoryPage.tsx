import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Payment, ApiResponse } from '../../types';

/**
 * ============================================
 * MEMBER 5 – Payment Processing & Financial Management
 * Student ID: IT24103022
 * ============================================
 */

const STATUS_STYLE: Record<string, { pill: string; dot: string }> = {
  COMPLETED: { pill: 'bg-green-100 text-success',   dot: 'bg-success' },
  FAILED:    { pill: 'bg-red-100 text-danger',       dot: 'bg-danger' },
  PENDING:   { pill: 'bg-amber-100 text-warning',    dot: 'bg-warning' },
};

export default function TransactionHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING' | 'FAILED'>('ALL');
  const [invoiceMsg, setInvoiceMsg] = useState('');

  useEffect(() => {
    api.get<ApiResponse<Payment[]>>('/payments/history')
      .then(r => setPayments(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadInvoice = async (id: number) => {
    try {
      const res = await api.get(`/invoices/${id}`);
      setInvoiceMsg(`Invoice ${res.data.data.invoiceNumber} ready`);
      setTimeout(() => setInvoiceMsg(''), 3000);
    } catch {
      setInvoiceMsg('Failed to load invoice.');
      setTimeout(() => setInvoiceMsg(''), 3000);
    }
  };

  const totalSpent   = payments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0);
  const visible = filter === 'ALL' ? payments : payments.filter(p => p.status === filter);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-8 pt-28 pb-20">

        {/* ── Page header ── */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-400 text-sm mt-1">Your complete transaction history</p>
        </div>

        {/* ── Stats row ── */}
        {!loading && payments.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-10">
            <StatCard label="Total Spent" value={`$${totalSpent.toFixed(2)}`} />
            <StatCard label="Transactions" value={payments.length.toString()} />
            <StatCard label="Pending" value={totalPending > 0 ? `$${totalPending.toFixed(2)}` : '—'} muted={totalPending === 0} />
          </div>
        )}

        {/* ── Filter bar ── */}
        {!loading && payments.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            {(['ALL', 'COMPLETED', 'PENDING', 'FAILED'] as const).map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === s
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                }`}>
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        )}

        {invoiceMsg && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 text-primary text-sm">
            {invoiceMsg}
          </div>
        )}

        {/* ── List ── */}
        {loading ? (
          <div className="flex justify-center py-32">
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-5xl mb-4">💳</p>
            <p className="text-base font-medium text-gray-700 mb-1">No transactions yet</p>
            <p className="text-sm text-gray-400">Your payment history will appear here after your first booking.</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-gray-400">No {filter.toLowerCase()} transactions</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_160px_120px_100px_80px] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Transaction</span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Method</span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Amount</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50">
              {visible.map(p => {
                const st = STATUS_STYLE[p.status] || { pill: 'bg-gray-100 text-gray-500', dot: 'bg-gray-300' };
                return (
                  <div key={p.id}
                    className="grid grid-cols-[1fr_160px_120px_100px_80px] gap-4 items-center px-6 py-4 hover:bg-gray-50/60 transition-colors group">

                    {/* Transaction info */}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Booking <span className="font-semibold">{p.bookingReference}</span>
                      </p>
                      <p className="text-xs text-gray-400 font-mono truncate mt-0.5">{p.transactionId}</p>
                    </div>

                    {/* Method */}
                    <p className="text-sm text-gray-500 capitalize">
                      {p.paymentMethod.replace(/_/g, ' ').toLowerCase()}
                    </p>

                    {/* Date */}
                    <p className="text-sm text-gray-500">
                      {p.paidAt
                        ? new Date(p.paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : <span className="text-gray-300">—</span>}
                    </p>

                    {/* Status badge */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold w-fit ${st.pill}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                    </span>

                    {/* Amount + invoice */}
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">${p.amount}</p>
                      {p.status === 'COMPLETED' && (
                        <button onClick={() => handleDownloadInvoice(p.id)}
                          className="text-[11px] text-gray-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100 mt-0.5">
                          Invoice ↓
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function StatCard({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50">
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      <p className={`text-2xl font-bold ${muted ? 'text-gray-300' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}
