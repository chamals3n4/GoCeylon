import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { Activity, ApiResponse, Booking } from '../../types';

/**
 * ============================================
 * MEMBER 4 – Booking & Reservation System
 * Student ID: IT24103207
 * ============================================
 */
export default function BookingPage() {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [form, setForm] = useState({ bookingDate: '', timeSlot: '', numParticipants: '1', notes: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<Booking | null>(null);

  useEffect(() => {
    if (activityId) {
      api.get<ApiResponse<Activity>>(`/activities/${activityId}`).then(r => setActivity(r.data.data)).catch(() => navigate('/activities'));
    }
  }, [activityId]);

  const totalPrice = activity ? activity.price * parseInt(form.numParticipants || '1') : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post<ApiResponse<Booking>>('/bookings', {
        activityId: parseInt(activityId!),
        bookingDate: form.bookingDate,
        timeSlot: form.timeSlot || null,
        numParticipants: parseInt(form.numParticipants),
        notes: form.notes || null,
      });
      setSuccess(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all";

  if (!activity) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (success) return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50">
      <div className="max-w-lg mx-auto text-center">
        <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Booking Created!</h2>
          <p className="text-gray-500 mb-6">Your reference number is:</p>
          <div className="px-6 py-3 rounded-xl bg-primary/5 border border-primary/20 text-primary text-xl font-mono font-bold mb-6">
            {success.referenceNumber}
          </div>
          <div className="text-sm text-gray-500 space-y-1 mb-6">
            <p>Activity: <span className="text-gray-900">{success.activityTitle}</span></p>
            <p>Date: <span className="text-gray-900">{success.bookingDate}</span></p>
            <p>Status: <span className="text-secondary font-medium">{success.status}</span></p>
            <p>Total: <span className="text-secondary font-bold">${success.totalPrice}</span></p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link to="/bookings" className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-all">View Bookings</Link>
            <Link to="/activities" className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all">Browse More</Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <Link to={`/activities/${activityId}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors">← Back</Link>
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Book Activity</h1>
        <p className="text-gray-500 mb-8">{activity.title}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <form onSubmit={handleSubmit} className="md:col-span-2 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-5">
            {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-danger text-sm">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date *</label>
              <input type="date" required value={form.bookingDate} onChange={e => setForm({ ...form, bookingDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Time Slot</label>
              <select value={form.timeSlot} onChange={e => setForm({ ...form, timeSlot: e.target.value })} className={inputClass}>
                <option value="">Any time</option>
                <option value="Morning (8AM-12PM)">Morning (8AM-12PM)</option>
                <option value="Afternoon (12PM-4PM)">Afternoon (12PM-4PM)</option>
                <option value="Evening (4PM-8PM)">Evening (4PM-8PM)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Participants *</label>
              <input type="number" required min="1" max={activity.maxParticipants || 100}
                value={form.numParticipants} onChange={e => setForm({ ...form, numParticipants: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3}
                className={inputClass + ' resize-none'} placeholder="Any special requirements?" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-all disabled:opacity-50">
              {loading ? 'Creating...' : 'Confirm Booking'}
            </button>
          </form>

          {/* Summary */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm h-fit sticky top-24">
            <h3 className="font-semibold mb-4 text-gray-900">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Activity</span><span className="text-gray-900">{activity.title}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Price/person</span><span className="text-gray-900">${activity.price}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Participants</span><span className="text-gray-900">{form.numParticipants}</span></div>
              <hr className="border-gray-100" />
              <div className="flex justify-between text-lg font-bold"><span className="text-gray-900">Total</span><span className="text-secondary">${totalPrice.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
