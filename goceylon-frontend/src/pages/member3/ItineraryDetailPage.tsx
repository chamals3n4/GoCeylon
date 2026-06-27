import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Itinerary, Favorite, ApiResponse } from '../../types';

export default function ItineraryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const [dayNumber, setDayNumber] = useState(1);
  const [orderIndex, setOrderIndex] = useState(0);
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [notes, setNotes] = useState('');

  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [metaForm, setMetaForm] = useState({ title: '', description: '', startDate: '', endDate: '' });

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [itRes, favRes] = await Promise.all([
        api.get<ApiResponse<Itinerary>>(`/itineraries/${id}`),
        api.get<ApiResponse<Favorite[]>>('/favorites')
      ]);
      const itData = itRes.data.data;
      setItinerary(itData);
      setMetaForm({
        title: itData.title,
        description: itData.description || '',
        startDate: itData.startDate || '',
        endDate: itData.endDate || ''
      });
      setFavorites(favRes.data.data?.filter(f => f.favoriteType === 'ACTIVITY' && f.activityId) || []);
    } catch {
      navigate('/favorites');
    }
    setLoading(false);
  };

  const handleSaveMeta = async () => {
    if (!itinerary) return;
    try {
      const updated = await api.put<ApiResponse<Itinerary>>(`/itineraries/${id}`, {
        ...metaForm,
        items: itinerary.items
      });
      setItinerary(updated.data.data);
      setIsEditingMeta(false);
    } catch {}
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itinerary) return;

    const newItem = {
      activityId: selectedActivityId ? Number(selectedActivityId) : undefined,
      dayNumber: Number(dayNumber),
      orderIndex: Number(orderIndex),
      notes
    };

    try {
      const updated = await api.put<ApiResponse<Itinerary>>(`/itineraries/${id}`, {
        title: itinerary.title,
        description: itinerary.description,
        startDate: itinerary.startDate,
        endDate: itinerary.endDate,
        items: [...itinerary.items, newItem]
      });

      setItinerary(updated.data.data);
      setSelectedActivityId('');
      setNotes('');
      setOrderIndex(itinerary.items.length + 1);
    } catch {}
  };

  const removeItem = async (itemToRemoveIndex: number) => {
    if (!itinerary) return;
    const newItems = itinerary.items.filter((_, idx) => idx !== itemToRemoveIndex);

    try {
      const updated = await api.put<ApiResponse<Itinerary>>(`/itineraries/${id}`, {
        title: itinerary.title,
        description: itinerary.description,
        startDate: itinerary.startDate,
        endDate: itinerary.endDate,
        items: newItems
      });
      setItinerary(updated.data.data);
    } catch {}
  };

  const inputClass = "w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all";
  const inputSmClass = "w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all";

  if (loading || !itinerary) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const groupedItems = itinerary.items.reduce((acc, item) => {
    if (!acc[item.dayNumber]) acc[item.dayNumber] = [];
    acc[item.dayNumber].push(item);
    return acc;
  }, {} as Record<number, typeof itinerary.items>);

  const days = Object.keys(groupedItems).map(Number).sort((a, b) => a - b);
  days.forEach(d => groupedItems[d].sort((a, b) => a.orderIndex - b.orderIndex));

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <Link to="/favorites" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          ← Back to Collection
        </Link>

        {isEditingMeta ? (
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm mb-8 space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">Edit Itinerary Details</h3>
            <input type="text" value={metaForm.title} onChange={e => setMetaForm({...metaForm, title: e.target.value})} className={inputClass} placeholder="Title" />
            <textarea value={metaForm.description} onChange={e => setMetaForm({...metaForm, description: e.target.value})} className={inputClass + ' resize-none'} rows={2} placeholder="Description" />
            <div className="grid grid-cols-2 gap-4">
              <input type="date" value={metaForm.startDate} onChange={e => setMetaForm({...metaForm, startDate: e.target.value})} className={inputClass} />
              <input type="date" value={metaForm.endDate} onChange={e => setMetaForm({...metaForm, endDate: e.target.value})} className={inputClass} />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveMeta} className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark">Save Details</button>
              <button onClick={() => setIsEditingMeta(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900">{itinerary.title}</h1>
              {itinerary.description && <p className="text-gray-500 mb-3">{itinerary.description}</p>}
              <div className="flex gap-4 text-sm text-primary font-medium">
                {itinerary.startDate && <span>📅 {itinerary.startDate} → {itinerary.endDate}</span>}
                <span>📍 {itinerary.items.length} activities planned</span>
              </div>
            </div>
            <button onClick={() => setIsEditingMeta(true)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
              Edit Details
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline View */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Trip Timeline</h2>

            {days.length === 0 ? (
              <div className="text-center py-12 border border-gray-200 border-dashed rounded-2xl bg-white">
                <p className="text-gray-500">No activities added yet. Use the panel on the right to start building your itinerary!</p>
              </div>
            ) : (
              <div className="space-y-8">
                {days.map(dayStr => {
                  const dayTitle = `Day ${dayStr}`;
                  return (
                    <div key={dayStr} className="relative pl-6 border-l-2 border-primary/30 space-y-4">
                      <span className="absolute -left-3 top-0 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">{dayTitle}</span>
                      <div className="pt-2">
                        {groupedItems[Number(dayStr)].map((item) => {
                          const origIdx = itinerary.items.findIndex(i => i.id === item.id || (i.activityId === item.activityId && i.dayNumber === item.dayNumber && i.orderIndex === item.orderIndex));
                          return (
                            <div key={item.id || origIdx} className="mb-3 p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 transition-all flex justify-between items-center group shadow-sm">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">#{item.orderIndex}</span>
                                  <span className="font-semibold text-gray-900">{item.activityTitle || 'Custom Note'}</span>
                                </div>
                                {item.notes && <p className="text-sm text-gray-500">{item.notes}</p>}
                              </div>
                              <button onClick={() => removeItem(origIdx)} className="text-xs text-danger opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Item Sidebar */}
          <div>
            <div className="sticky top-24 p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <h3 className="font-semibold mb-4 text-gray-900">Add Event / Activity</h3>
              <form onSubmit={handleAddItem} className="space-y-4">
                {favorites.length > 0 ? (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">From Favorites</label>
                    <select value={selectedActivityId} onChange={e => setSelectedActivityId(e.target.value)} className={inputSmClass}>
                      <option value="">-- Select an activity --</option>
                      {favorites.map(f => <option key={f.id} value={f.activityId}>{f.activityTitle}</option>)}
                    </select>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-500">
                    You have no favorited activities. Favorite an activity to select it here!
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Day Number</label>
                    <input type="number" min="1" required value={dayNumber} onChange={e => setDayNumber(Number(e.target.value))} className={inputSmClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Order / Time</label>
                    <input type="number" min="0" required value={orderIndex} onChange={e => setOrderIndex(Number(e.target.value))} className={inputSmClass} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Custom Notes</label>
                  <textarea placeholder="e.g., Meet at the lobby at 9AM" value={notes} onChange={e => setNotes(e.target.value)} className={inputSmClass + ' resize-none'} rows={2} />
                </div>

                <button type="submit" disabled={!selectedActivityId && !notes} className="w-full py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark disabled:opacity-50 transition-all text-sm">
                  + Add to Itinerary
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
