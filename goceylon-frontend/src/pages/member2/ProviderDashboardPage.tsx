import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Activity, Event, ApiResponse, CATEGORIES, CATEGORY_LABELS, CreateActivityRequest, CreateEventRequest } from '../../types';
import { Link } from 'react-router-dom';

/**
 * ============================================
 * MEMBER 2 – Activity & Event Listing Management
 * Student ID: IT24103420
 * ============================================
 */
export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [tab, setTab] = useState<'activities' | 'events'>('activities');
  const [loading, setLoading] = useState(true);

  const [editingItem, setEditingItem] = useState<Activity | Event | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      loadListings();
    }
  }, [user]);

  const loadListings = async () => {
    setLoading(true);
    try {
      const actRes = await api.get<ApiResponse<Activity[]>>(`/activities/provider/${user?.userId}`);
      setActivities(actRes.data.data || []);

      const evtRes = await api.get<ApiResponse<Event[]>>('/events');
      const allEvents = evtRes.data.data || [];
      setEvents(allEvents.filter(e => e.providerId === user?.userId));
    } catch {}
    setLoading(false);
  };

  const deleteActivity = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return;
    try {
      await api.delete(`/activities/${id}`);
      setActivities(activities.filter(a => a.id !== id));
    } catch {}
  };

  const deleteEvent = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      setEvents(events.filter(e => e.id !== id));
    } catch {}
  };

  const openEditModal = (item: Activity | Event, type: 'activity' | 'event') => {
    setEditingItem(item);
    setEditForm({ ...item, type });
    setEditError('');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);

    try {
      if (editForm.type === 'activity') {
        const payload: CreateActivityRequest = {
          title: editForm.title,
          description: editForm.description,
          category: editForm.category,
          price: parseFloat(editForm.price),
          durationHours: editForm.durationHours ? parseInt(editForm.durationHours) : undefined,
          maxParticipants: editForm.maxParticipants ? parseInt(editForm.maxParticipants) : undefined,
          latitude: parseFloat(editForm.latitude),
          longitude: parseFloat(editForm.longitude),
          locationName: editForm.locationName,
          imageUrl: editForm.imageUrl,
        };
        await api.put(`/activities/${editingItem?.id}`, payload);
      } else {
        const payload: CreateEventRequest = {
          title: editForm.title,
          description: editForm.description,
          category: editForm.category,
          price: editForm.price ? parseFloat(editForm.price) : undefined,
          eventDate: editForm.eventDate,
          startTime: editForm.startTime,
          endTime: editForm.endTime,
          maxAttendees: editForm.maxAttendees ? parseInt(editForm.maxAttendees) : undefined,
          latitude: parseFloat(editForm.latitude),
          longitude: parseFloat(editForm.longitude),
          locationName: editForm.locationName,
          imageUrl: editForm.imageUrl,
        };
        await api.put(`/events/${editingItem?.id}`, payload);
      }
      setEditingItem(null);
      loadListings();
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Update failed');
    } finally {
      setEditLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg bg-white border border-gray-300 text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all";

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50 relative">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">My Listings Dashboard</h1>
            <p className="text-gray-500">Manage your created activities and events in one place</p>
          </div>
          <Link to="/create-listing" className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-all text-center">
            + Create New
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white border border-gray-200 mb-8 max-w-sm shadow-sm">
          <button onClick={() => setTab('activities')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${tab === 'activities' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
            Activities ({activities.length})
          </button>
          <button onClick={() => setTab('events')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${tab === 'events' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
            Events ({events.length})
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : tab === 'activities' && activities.length === 0 ? (
          <div className="text-center py-16"><div className="text-5xl mb-4">🎯</div><p className="text-gray-500">No activities listed yet</p></div>
        ) : tab === 'events' && events.length === 0 ? (
          <div className="text-center py-16"><div className="text-5xl mb-4">🎪</div><p className="text-gray-500">No events listed yet</p></div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {(tab === 'activities' ? activities : events).map((item: any) => (
              <div key={item.id} className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between gap-4 group hover:border-gray-300 transition-all">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>
                    <span className="text-xs text-gray-400">Added {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1 max-w-2xl">{item.description}</p>

                  <div className="flex gap-4 mt-3 text-sm text-gray-400">
                    {item.price && <span className="text-secondary font-medium">${item.price}</span>}
                    {tab === 'events' && item.eventDate && <span>📅 {item.eventDate} @ {item.startTime}</span>}
                    {item.locationName && <span>📍 {item.locationName}</span>}
                  </div>
                </div>

                <div className="flex sm:flex-col justify-end items-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={tab === 'activities' ? `/activities/${item.id}` : `/events/${item.id}`} className="px-4 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:text-gray-900 hover:border-gray-400 transition-all">
                    View
                  </Link>
                  <button onClick={() => openEditModal(item, tab === 'activities' ? 'activity' : 'event')} className="px-4 py-1.5 rounded-lg border border-primary/30 text-primary text-sm hover:bg-primary/5 transition-all">
                    Edit
                  </button>
                  <button onClick={() => tab === 'activities' ? deleteActivity(item.id) : deleteEvent(item.id)} className="px-4 py-1.5 rounded-lg border border-red-200 text-danger text-sm hover:bg-red-50 transition-all">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Edit {editForm.type === 'activity' ? 'Activity' : 'Event'}</h2>
            {editError && <div className="p-3 mb-4 rounded-lg bg-red-50 text-danger text-sm border border-red-200">{editError}</div>}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Title</label>
                  <input required value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Description</label>
                  <textarea required rows={3} value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} className={inputClass + ' resize-none'} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Category</label>
                  <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className={inputClass}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Price (USD)</label>
                  <input type="number" step="0.01" value={editForm.price || ''} onChange={e => setEditForm({...editForm, price: e.target.value})} className={inputClass} />
                </div>

                {editForm.type === 'activity' ? (
                  <>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Duration (Hours)</label>
                      <input type="number" value={editForm.durationHours || ''} onChange={e => setEditForm({...editForm, durationHours: e.target.value})} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Max Participants</label>
                      <input type="number" value={editForm.maxParticipants || ''} onChange={e => setEditForm({...editForm, maxParticipants: e.target.value})} className={inputClass} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-span-2 grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Event Date</label>
                        <input type="date" required value={editForm.eventDate || ''} onChange={e => setEditForm({...editForm, eventDate: e.target.value})} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                        <input type="time" required value={editForm.startTime || ''} onChange={e => setEditForm({...editForm, startTime: e.target.value})} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">End Time</label>
                        <input type="time" value={editForm.endTime || ''} onChange={e => setEditForm({...editForm, endTime: e.target.value})} className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Max Attendees</label>
                      <input type="number" value={editForm.maxAttendees || ''} onChange={e => setEditForm({...editForm, maxAttendees: e.target.value})} className={inputClass} />
                    </div>
                  </>
                )}

                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Location Name</label>
                  <input value={editForm.locationName || ''} onChange={e => setEditForm({...editForm, locationName: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                  <input type="number" step="any" required value={editForm.latitude || ''} onChange={e => setEditForm({...editForm, latitude: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                  <input type="number" step="any" required value={editForm.longitude || ''} onChange={e => setEditForm({...editForm, longitude: e.target.value})} className={inputClass} />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="submit" disabled={editLoading} className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-all disabled:opacity-50">
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditingItem(null)} className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
