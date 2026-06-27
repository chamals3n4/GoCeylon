import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { CATEGORIES, CATEGORY_LABELS, ApiResponse } from '../../types';

/**
 * ============================================
 * MEMBER 2 – Activity & Event Listing Management
 * Student ID: IT24103420
 * ============================================
 */
export default function CreateListingPage() {
  const navigate = useNavigate();
  const [type, setType] = useState<'activity' | 'event'>('activity');
  const [form, setForm] = useState({
    title: '', description: '', category: 'CULTURAL', price: '', durationHours: '',
    maxParticipants: '', latitude: '7.8731', longitude: '80.7718', locationName: '',
    imageUrl: '', eventDate: '', startTime: '', endTime: '', maxAttendees: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (type === 'activity') {
        await api.post('/activities', {
          title: form.title, description: form.description, category: form.category,
          price: parseFloat(form.price), durationHours: form.durationHours ? parseInt(form.durationHours) : null,
          maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : null,
          latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude),
          locationName: form.locationName, imageUrl: form.imageUrl || null,
        });
        navigate('/activities');
      } else {
        await api.post('/events', {
          title: form.title, description: form.description, category: form.category,
          price: form.price ? parseFloat(form.price) : null, eventDate: form.eventDate,
          startTime: form.startTime, endTime: form.endTime || null,
          maxAttendees: form.maxAttendees ? parseInt(form.maxAttendees) : null,
          latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude),
          locationName: form.locationName, imageUrl: form.imageUrl || null,
        });
        navigate('/events');
      }
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.data && typeof data.data === 'object') setError(Object.values(data.data).join('. '));
      else setError(data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all";

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Create New Listing</h1>
        <p className="text-gray-500 mb-8">Share your experience with the world</p>

        {/* Type selector */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {(['activity', 'event'] as const).map(t => (
            <button key={t} type="button" onClick={() => setType(t)}
              className={`p-4 rounded-xl border text-center transition-all ${
                type === t ? 'border-primary bg-primary/5 text-primary' : 'border-gray-300 text-gray-500 hover:border-gray-400 bg-white'
              }`}>
              <div className="text-2xl mb-1">{t === 'activity' ? '🎯' : '🎪'}</div>
              <div className="font-medium capitalize">{t}</div>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-5">
          {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-danger text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
            <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="e.g. Village Cooking Experience" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
            <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} className={inputClass + ' resize-none'} placeholder="Describe your experience in detail (min 10 characters)" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
            <input type="url" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} className={inputClass} placeholder="https://example.com/image.jpg" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputClass}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (USD) {type === 'activity' ? '*' : ''}</label>
              <input type="number" step="0.01" min="0" required={type === 'activity'} value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })} className={inputClass} placeholder="25.00" />
            </div>
          </div>

          {type === 'activity' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (hours)</label>
                <input type="number" min="1" max="72" value={form.durationHours} onChange={e => setForm({ ...form, durationHours: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Participants</label>
                <input type="number" min="1" max="500" value={form.maxParticipants} onChange={e => setForm({ ...form, maxParticipants: e.target.value })} className={inputClass} />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Date *</label>
                  <input type="date" required value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time *</label>
                  <input type="time" required value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
                  <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Attendees</label>
                <input type="number" min="1" value={form.maxAttendees} onChange={e => setForm({ ...form, maxAttendees: e.target.value })} className={inputClass} />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Location Name</label>
            <input type="text" value={form.locationName} onChange={e => setForm({ ...form, locationName: e.target.value })} className={inputClass} placeholder="e.g. Ella, Sri Lanka" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Latitude *</label>
              <input type="text" required value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value.replace(/[^\d.-]/g, '') })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Longitude *</label>
              <input type="text" required value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value.replace(/[^\d.-]/g, '') })} className={inputClass} />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-all duration-200 disabled:opacity-50">
            {loading ? 'Creating...' : `Create ${type === 'activity' ? 'Activity' : 'Event'}`}
          </button>
        </form>
      </div>
    </div>
  );
}
