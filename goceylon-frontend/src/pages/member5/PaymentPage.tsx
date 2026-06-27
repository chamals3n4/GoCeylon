import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Booking, Payment, ApiResponse } from '../../types';

/**
 * ============================================
 * MEMBER 5 – Payment Processing & Financial Management
 * Student ID: IT24103022
 * ============================================
 */
export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [form, setForm] = useState({
    paymentMethod: 'CREDIT_CARD', cardNumber: '', cardHolderName: '', expiryDate: '', cvv: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payment, setPayment] = useState<Payment | null>(null);

  useEffect(() => {
    if (bookingId) {
      api.get<ApiResponse<Booking>>(`/bookings/${bookingId}`).then(r => setBooking(r.data.data)).catch(() => navigate('/bookings'));
    }
  }, [bookingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);

    if (form.paymentMethod === 'CREDIT_CARD' || form.paymentMethod === 'DEBIT_CARD') {
      const cardClean = form.cardNumber.replace(/\s+/g, '');
      if (!/^\d{16}$/.test(cardClean)) {
        setError('Card number must be 16 digits');
        setLoading(false);
        return;
      }
      if (form.cardHolderName.trim().length < 3) {
        setError('Card holder name must be at least 3 characters');
        setLoading(false);
        return;
      }
      if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(form.expiryDate)) {
        setError('Expiry date must be in MM/YY format');
        setLoading(false);
        return;
      }
      if (!/^\d{3,4}$/.test(form.cvv)) {
        setError('CVV must be 3 or 4 digits');
        setLoading(false);
        return;
      }
    }

    try {
      const res = await api.post<ApiResponse<Payment>>('/payments', {
        bookingId: parseInt(bookingId!),
        paymentMethod: form.paymentMethod,
        cardNumber: form.cardNumber, cardHolderName: form.cardHolderName,
        expiryDate: form.expiryDate, cvv: form.cvv,
      });
      setPayment(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally { setLoading(false); }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all";

  if (!booking) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (payment) return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50">
      <div className="max-w-lg mx-auto text-center">
        <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="text-6xl mb-4">💳</div>
          <h2 className="text-2xl font-bold mb-2 text-success">Payment Successful!</h2>
          <div className="space-y-2 text-sm my-6">
            <p className="text-gray-500">Transaction: <span className="text-gray-900 font-mono">{payment.transactionId}</span></p>
            <p className="text-gray-500">Amount: <span className="text-secondary font-bold text-lg">${payment.amount}</span></p>
            <p className="text-gray-500">Booking: <span className="text-gray-900">{payment.bookingReference}</span></p>
            <p className="text-gray-500">Method: <span className="text-gray-900">{payment.paymentMethod.replace('_', ' ')}</span></p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link to="/transactions" className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-all">View Transactions</Link>
            <Link to="/bookings" className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all">My Bookings</Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Payment</h1>
        <p className="text-gray-500 mb-8">Complete your booking for {booking.activityTitle}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <form onSubmit={handleSubmit} autoComplete="off" className="md:col-span-2 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-5">
            {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-danger text-sm">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Method</label>
              <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} className={inputClass}>
                <option value="CREDIT_CARD">💳 Credit Card</option>
                <option value="DEBIT_CARD">💳 Debit Card</option>
                <option value="BANK_TRANSFER">🏦 Bank Transfer</option>
                <option value="DIGITAL_WALLET">📱 Digital Wallet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Number</label>
              <input type="text" value={form.cardNumber} onChange={e => setForm({ ...form, cardNumber: e.target.value })} className={inputClass} placeholder="4242 4242 4242 4242" autoComplete="off" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Holder</label>
              <input type="text" value={form.cardHolderName} onChange={e => setForm({ ...form, cardHolderName: e.target.value })} className={inputClass} placeholder="John Doe" autoComplete="off" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry</label>
                <input type="text" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} className={inputClass} placeholder="MM/YY" autoComplete="off" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">CVV</label>
                <input type="text" value={form.cvv} onChange={e => setForm({ ...form, cvv: e.target.value })} className={inputClass} placeholder="123" autoComplete="off" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg bg-secondary text-white font-semibold hover:bg-amber-600 transition-all disabled:opacity-50">
              {loading ? 'Processing...' : `Pay $${booking.totalPrice}`}
            </button>
          </form>

          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm h-fit">
            <h3 className="font-semibold mb-4 text-gray-900">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Booking</span><span className="font-mono text-xs text-gray-900">{booking.referenceNumber}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Activity</span><span className="text-gray-900">{booking.activityTitle}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="text-gray-900">{booking.bookingDate}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Participants</span><span className="text-gray-900">{booking.numParticipants}</span></div>
              <hr className="border-gray-100" />
              <div className="flex justify-between text-lg font-bold"><span className="text-gray-900">Total</span><span className="text-secondary">${booking.totalPrice}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
