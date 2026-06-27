import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Booking, ApiResponse } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

/**
 * ============================================
 * MEMBER 4 – Booking & Reservation System
 * Student ID: IT24103207
 * ============================================
 */
export default function BookingHistoryPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    const url = user?.role === 'PROVIDER' ? '/bookings/provider' : '/bookings';
    api.get<ApiResponse<Booking[]>>(url).then(r => setBookings(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  const confirmBooking = async (id: number) => {
    try { await api.put(`/bookings/${id}/confirm`); load(); } catch {}
  };

  const cancelBooking = async (id: number) => {
    try { await api.put(`/bookings/${id}/cancel`); load(); } catch {}
  };

  const statusColor: Record<string, string> = {
    PENDING: 'text-warning bg-amber-50 border border-amber-200',
    CONFIRMED: 'text-primary bg-primary/10 border border-primary/20',
    CANCELLED: 'text-danger bg-red-50 border border-red-200',
    COMPLETED: 'text-success bg-green-50 border border-green-200',
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">{user?.role === 'PROVIDER' ? 'Received Bookings' : 'My Bookings'}</h1>
        <p className="text-gray-500 mb-8">{user?.role === 'PROVIDER' ? 'Manage booking requests' : 'View your booking history'}</p>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📅</div>
            <p className="text-gray-500">No bookings yet</p>
            {user?.role !== 'PROVIDER' && <Link to="/activities" className="inline-block mt-4 text-primary hover:underline font-medium">Browse Activities</Link>}
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => (
              <div key={b.id} className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:border-gray-300 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm text-primary">{b.referenceNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[b.status]}`}>{b.status}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{b.activityTitle}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      <span>📅 {b.bookingDate}</span>
                      {b.timeSlot && <span>⏰ {b.timeSlot}</span>}
                      <span>👥 {b.numParticipants}</span>
                      <span className="text-secondary font-bold">${b.totalPrice}</span>
                    </div>
                    {user?.role === 'PROVIDER' && <p className="text-sm text-gray-500 mt-1">Tourist: {b.touristName}</p>}
                  </div>
                  <div className="flex gap-2">
                    {user?.role === 'PROVIDER' && b.status === 'PENDING' && (
                      <button onClick={() => confirmBooking(b.id)}
                        className="px-4 py-2 rounded-lg bg-green-50 text-success text-sm font-medium hover:bg-green-100 border border-green-200 transition-all">
                        Confirm
                      </button>
                    )}
                    {b.status === 'CONFIRMED' && user?.role !== 'PROVIDER' && (
                      <Link to={`/pay/${b.id}`}
                        className="px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium hover:bg-amber-600 transition-all">
                        Pay Now
                      </Link>
                    )}
                    {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                      <button onClick={() => cancelBooking(b.id)}
                        className="px-4 py-2 rounded-lg bg-red-50 text-danger text-sm font-medium hover:bg-red-100 border border-red-200 transition-all">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
