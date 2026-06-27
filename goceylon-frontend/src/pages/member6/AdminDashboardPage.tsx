import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Analytics, Review, User, ApiResponse } from '../../types';

/**
 * ============================================
 * MEMBER 6 – Review System & Admin Panel
 * Student ID: IT24103280
 * ============================================
 */
export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [flagged, setFlagged] = useState<Review[]>([]);
  const [tab, setTab] = useState<'overview' | 'users' | 'moderation'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [aRes, uRes, fRes] = await Promise.all([
        api.get<ApiResponse<Analytics>>('/admin/analytics'),
        api.get<ApiResponse<User[]>>('/admin/users'),
        api.get<ApiResponse<Review[]>>('/admin/flagged'),
      ]);
      setAnalytics(aRes.data.data);
      setUsers(uRes.data.data || []);
      setFlagged(fRes.data.data || []);
    } catch {}
    setLoading(false);
  };

  const toggleUserStatus = async (id: number, active: boolean) => {
    try { await api.put(`/admin/users/${id}/status?active=${active}`); load(); } catch {}
  };

  const removeReview = async (id: number) => {
    try {
      await api.post('/admin/moderate', { actionType: 'REVIEW_REMOVED', targetType: 'REVIEW', targetId: id, reason: 'Inappropriate content' });
      load();
    } catch {}
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const statColors = [
    'border-primary/20 bg-primary/5',
    'border-blue-200 bg-blue-50',
    'border-amber-200 bg-amber-50',
    'border-primary/20 bg-primary/5',
    'border-amber-200 bg-amber-50',
    'border-blue-200 bg-blue-50',
    'border-amber-200 bg-amber-50',
    'border-green-200 bg-green-50',
    'border-amber-200 bg-amber-50',
    'border-red-200 bg-red-50',
    'border-amber-200 bg-amber-50',
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mb-8">Platform management and analytics</p>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white border border-gray-200 shadow-sm mb-8 max-w-md">
          {(['overview', 'users', 'moderation'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all capitalize ${
                tab === t ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}>{t}</button>
          ))}
        </div>

        {tab === 'overview' && analytics && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: analytics.totalUsers, icon: '👥' },
                { label: 'Tourists', value: analytics.totalTourists, icon: '🧳' },
                { label: 'Providers', value: analytics.totalProviders, icon: '🏠' },
                { label: 'Activities', value: analytics.totalActivities, icon: '🎯' },
                { label: 'Events', value: analytics.totalEvents, icon: '🎪' },
                { label: 'Total Bookings', value: analytics.totalBookings, icon: '📅' },
                { label: 'Pending Bookings', value: analytics.pendingBookings, icon: '⏳' },
                { label: 'Completed', value: analytics.completedBookings, icon: '✅' },
                { label: 'Total Reviews', value: analytics.totalReviews, icon: '⭐' },
                { label: 'Flagged', value: analytics.flaggedReviews, icon: '🚩' },
                { label: 'Avg Rating', value: analytics.averageRating, icon: '⭐' },
              ].map((s, i) => (
                <div key={s.label} className={`p-5 rounded-2xl border ${statColors[i] || 'border-gray-200 bg-white'}`}>
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-sm text-white">
                    {u.firstName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium">{u.role}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-50 text-success border border-green-200' : 'bg-red-50 text-danger border border-red-200'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <button onClick={() => toggleUserStatus(u.id, !u.isActive)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    u.isActive ? 'bg-red-50 text-danger hover:bg-red-100 border border-red-200' : 'bg-green-50 text-success hover:bg-green-100 border border-green-200'
                  }`}>{u.isActive ? 'Deactivate' : 'Activate'}</button>
              </div>
            ))}
          </div>
        )}

        {tab === 'moderation' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Flagged Reviews ({flagged.length})</h3>
            {flagged.length === 0 ? (
              <div className="text-center py-10"><p className="text-gray-500">No flagged content 🎉</p></div>
            ) : (
              <div className="space-y-3">
                {flagged.map(r => (
                  <div key={r.id} className="p-4 rounded-xl bg-white border border-red-200 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{r.touristName}</span>
                          <span className="text-secondary">{'★'.repeat(r.rating)}</span>
                          <span className="px-2 py-0.5 rounded-full text-xs bg-red-50 text-danger border border-red-200">Flagged</span>
                        </div>
                        <p className="text-gray-600 text-sm">{r.comment}</p>
                        <p className="text-xs text-gray-400 mt-1">Activity: {r.activityTitle}</p>
                      </div>
                      <button onClick={() => removeReview(r.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-50 text-danger text-sm hover:bg-red-100 transition-all border border-red-200">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
