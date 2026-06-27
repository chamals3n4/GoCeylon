import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Activity, Review, ApiResponse, CATEGORY_LABELS } from '../../types';
import { useAuth } from '../../context/AuthContext';

/**
 * ============================================
 * MEMBER 2 – Activity & Event Listing Management (IT24103420)
 * + MEMBER 6 – Reviews display (IT24103280)
 * + MEMBER 4 – Booking link (IT24103207)
 * ============================================
 */
export default function ActivityDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editReviewForm, setEditReviewForm] = useState({ rating: 5, comment: '' });
  const [favMsg, setFavMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    api.get<ApiResponse<Activity>>(`/activities/${id}`).then(r => setActivity(r.data.data)).catch(() => navigate('/activities'));
    api.get<ApiResponse<Review[]>>(`/reviews/activity/${id}`).then(r => setReviews(r.data.data || [])).catch(() => {});
    api.get<ApiResponse<number>>(`/reviews/activity/${id}/rating`).then(r => setAvgRating(r.data.data || 0)).catch(() => {});
  }, [id]);

  const handleAddToFavorites = async () => {
    try {
      await api.post('/favorites', { activityId: Number(id), favoriteType: 'ACTIVITY' });
      setFavMsg('Added to favorites! ❤️');
      setTimeout(() => setFavMsg(''), 3000);
    } catch (err: any) {
      setFavMsg(err.response?.data?.message || 'Already in favorites');
      setTimeout(() => setFavMsg(''), 3000);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter((r) => r.id !== reviewId));
    } catch {}
  };

  const startEditReview = (r: Review) => {
    setEditingReviewId(r.id);
    setEditReviewForm({ rating: r.rating, comment: r.comment || '' });
  };

  const submitEditReview = async (reviewId: number) => {
    try {
      await api.put(`/reviews/${reviewId}`, {
        activityId: activity?.id,
        rating: editReviewForm.rating,
        comment: editReviewForm.comment,
      });
      setEditingReviewId(null);
      const r = await api.get<ApiResponse<Review[]>>(`/reviews/activity/${activity?.id}`);
      setReviews(r.data.data || []);
    } catch {}
  };

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg bg-white border border-gray-300 text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20";

  if (!activity) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <Link to="/activities" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          ← Back to Activities
        </Link>

        {/* Header image */}
        <div className="h-64 rounded-2xl bg-gray-100 flex items-center justify-center mb-8 text-8xl border border-gray-200">
          {activity.category === 'CULTURAL' ? '🎭' : activity.category === 'ADVENTURE' ? '🏔️' :
           activity.category === 'CULINARY' ? '🍲' : activity.category === 'NATURE' ? '🌿' : '🌴'}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">{CATEGORY_LABELS[activity.category]}</span>
                {avgRating > 0 && <span className="text-secondary font-medium">★ {avgRating}</span>}
              </div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900">{activity.title}</h1>
              <p className="text-gray-500">by {activity.providerName}</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <h3 className="font-semibold mb-3 text-gray-900">Description</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{activity.description}</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <h3 className="font-semibold mb-3 text-gray-900">Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Location:</span> <span className="ml-2 text-gray-900">{activity.locationName || 'Sri Lanka'}</span></div>
                {activity.durationHours && <div><span className="text-gray-500">Duration:</span> <span className="ml-2 text-gray-900">{activity.durationHours} hours</span></div>}
                {activity.maxParticipants && <div><span className="text-gray-500">Max Participants:</span> <span className="ml-2 text-gray-900">{activity.maxParticipants}</span></div>}
                <div><span className="text-gray-500">Coordinates:</span> <span className="ml-2 text-gray-900">{activity.latitude}, {activity.longitude}</span></div>
              </div>
            </div>

            {/* Reviews */}
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Reviews ({reviews.length})</h3>
                {isAuthenticated && user?.role === 'TOURIST' && (
                  <Link to={`/reviews/write?activityId=${activity.id}`}
                    className="text-sm text-primary hover:underline font-medium">Write a Review</Link>
                )}
              </div>
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-sm">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 relative group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{r.touristName}</span>
                        <span className="text-secondary">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      </div>

                      {editingReviewId === r.id ? (
                        <div className="mt-3 space-y-3">
                          <select value={editReviewForm.rating} onChange={(e) => setEditReviewForm({...editReviewForm, rating: Number(e.target.value)})} className={inputClass}>
                            {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                          </select>
                          <textarea value={editReviewForm.comment} onChange={(e) => setEditReviewForm({...editReviewForm, comment: e.target.value})} className={inputClass + ' resize-none'} rows={3} />
                          <div className="flex gap-2">
                            <button onClick={() => submitEditReview(r.id)} className="px-4 py-1.5 text-xs font-medium rounded-md bg-primary text-white hover:bg-primary-dark">Save</button>
                            <button onClick={() => setEditingReviewId(null)} className="px-4 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {r.comment && <p className="text-gray-600 text-sm">{r.comment}</p>}
                          <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                            <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                            {user?.userId === r.touristId && (
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button onClick={() => startEditReview(r)} className="hover:text-primary">Edit</button>
                                <button onClick={() => handleDeleteReview(r.id)} className="hover:text-danger">Delete</button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="sticky top-24 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
              <div className="text-3xl font-bold text-secondary">${activity.price}<span className="text-base text-gray-500 font-normal"> / person</span></div>
              {user?.role !== 'PROVIDER' && (
                isAuthenticated ? (
                  <Link to={`/book/${activity.id}`}
                    className="block w-full py-3 rounded-xl bg-primary text-white font-semibold text-center hover:bg-primary-dark transition-all">
                    Book Now
                  </Link>
                ) : (
                  <Link to="/login"
                    className="block w-full py-3 rounded-xl bg-primary text-white font-semibold text-center hover:bg-primary-dark transition-all">
                    Sign in to Book
                  </Link>
                )
              )}
              <Link to={`/discover?lat=${activity.latitude}&lng=${activity.longitude}`}
                className="block w-full py-3 rounded-xl border border-gray-300 text-gray-600 text-center hover:text-gray-900 hover:border-gray-400 transition-all">
                View on Map
              </Link>
              {isAuthenticated && (
                <button onClick={handleAddToFavorites}
                  className="block w-full py-3 rounded-xl border border-red-200 text-danger text-center hover:bg-red-50 transition-all">
                  ❤️ Add to Favorites
                </button>
              )}
              {favMsg && <p className="text-sm text-center text-primary mt-2">{favMsg}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
