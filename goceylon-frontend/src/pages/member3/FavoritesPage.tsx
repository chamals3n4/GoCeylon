import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Favorite, Itinerary, ApiResponse } from '../../types';
import { Link } from 'react-router-dom';

/**
 * ============================================
 * MEMBER 3 – Interactive Location-Based Activity Discovery Map
 * Student ID: IT24103524
 * ============================================
 */
export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [tab, setTab] = useState<'favorites' | 'itineraries'>('favorites');
  const [loading, setLoading] = useState(true);
  const [newItinerary, setNewItinerary] = useState({ title: '', description: '', startDate: '', endDate: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [favRes, itRes] = await Promise.all([
        api.get<ApiResponse<Favorite[]>>('/favorites'),
        api.get<ApiResponse<Itinerary[]>>('/itineraries'),
      ]);
      setFavorites(favRes.data.data || []);
      setItineraries(itRes.data.data || []);
    } catch {}
    setLoading(false);
  };

  const removeFavorite = async (id: number) => {
    try { await api.delete(`/favorites/${id}`); setFavorites(favorites.filter(f => f.id !== id)); } catch {}
  };

  const createItinerary = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/itineraries', { ...newItinerary, items: [] });
      setShowForm(false);
      setNewItinerary({ title: '', description: '', startDate: '', endDate: '' });
      load();
    } catch {}
  };

  const deleteItinerary = async (id: number) => {
    try { await api.delete(`/itineraries/${id}`); setItineraries(itineraries.filter(i => i.id !== id)); } catch {}
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all";

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">My Collection</h1>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white border border-gray-200 shadow-sm mb-8 max-w-xs">
          {(['favorites', 'itineraries'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                tab === t ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-900'
              }`}>{t === 'favorites' ? '❤️ Favorites' : '📋 Itineraries'}</button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tab === 'favorites' ? (
          favorites.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">❤️</div>
              <p className="text-gray-500">No favorites yet. Explore activities and save your favorites!</p>
              <Link to="/activities" className="inline-block mt-4 text-primary hover:underline font-medium">Browse Activities</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map(f => (
                <div key={f.id} className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{f.favoriteType}</span>
                      <span className="font-medium text-gray-900">{f.activityTitle || f.locationName || 'Saved Location'}</span>
                    </div>
                    {f.latitude && <p className="text-xs text-gray-400 mt-1">📍 {f.latitude}, {f.longitude}</p>}
                  </div>
                  <button onClick={() => removeFavorite(f.id)} className="text-danger hover:text-red-700 text-sm transition-colors">Remove</button>
                </div>
              ))}
            </div>
          )
        ) : (
          <div>
            <button onClick={() => setShowForm(!showForm)}
              className="mb-6 px-5 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-all">
              + New Itinerary
            </button>

            {showForm && (
              <form onSubmit={createItinerary} className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm mb-6 space-y-4">
                <input type="text" required value={newItinerary.title} onChange={e => setNewItinerary({ ...newItinerary, title: e.target.value })}
                  className={inputClass} placeholder="Itinerary title" />
                <textarea value={newItinerary.description} onChange={e => setNewItinerary({ ...newItinerary, description: e.target.value })}
                  className={inputClass + ' resize-none'} rows={2} placeholder="Description (optional)" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="date" value={newItinerary.startDate} onChange={e => setNewItinerary({ ...newItinerary, startDate: e.target.value })}
                    className={inputClass} />
                  <input type="date" value={newItinerary.endDate} onChange={e => setNewItinerary({ ...newItinerary, endDate: e.target.value })}
                    className={inputClass} />
                </div>
                <button type="submit" className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-all">Create</button>
              </form>
            )}

            {itineraries.length === 0 ? (
              <div className="text-center py-16"><div className="text-5xl mb-4">📋</div><p className="text-gray-500">No itineraries yet</p></div>
            ) : (
              <div className="space-y-4">
                {itineraries.map(it => (
                  <div key={it.id} className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link to={`/itineraries/${it.id}`} className="block group">
                          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors">{it.title}</h3>
                          {it.description && <p className="text-gray-500 text-sm mt-1">{it.description}</p>}
                          <div className="flex gap-4 mt-2 text-xs text-gray-400">
                            {it.startDate && <span>📅 {it.startDate} → {it.endDate}</span>}
                            <span>{it.items.length} items</span>
                          </div>
                        </Link>
                      </div>
                      <button onClick={() => deleteItinerary(it.id)} className="text-danger hover:text-red-700 text-sm">Delete</button>
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
