import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

/**
 * ============================================
 * MEMBER 6 – Review System & Admin Panel
 * Student ID: IT24103280
 * ============================================
 */
export default function WriteReviewPage() {
  const [searchParams] = useSearchParams();
  const activityId = searchParams.get('activityId');
  const navigate = useNavigate();
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityId) { setError('Activity ID is required'); return; }
    setError(''); setLoading(true);
    try {
      await api.post('/reviews', {
        activityId: parseInt(activityId),
        rating: form.rating,
        comment: form.comment || null,
      });
      navigate(`/activities/${activityId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50">
      <div className="max-w-lg mx-auto">
        <Link to={activityId ? `/activities/${activityId}` : '/activities'}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors">← Back</Link>
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Write a Review</h1>
        <p className="text-gray-500 mb-8">Share your experience</p>

        <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-5">
          {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-danger text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })}
                  className={`w-12 h-12 rounded-xl text-2xl transition-all duration-200 ${
                    n <= form.rating ? 'bg-amber-100 text-secondary scale-110' : 'bg-gray-100 text-gray-400 hover:scale-105'
                  }`}>★</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Comment (optional)</label>
            <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} rows={4}
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
              placeholder="Tell us about your experience..." />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-all disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
