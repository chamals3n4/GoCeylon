import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Event as GCEvent, ApiResponse, CATEGORY_LABELS } from '../../types';

/**
 * ============================================
 * MEMBER 2 – Activity & Event Listing Management
 * Student ID: IT24103420
 * ============================================
 */
export default function EventsPage() {
  const [events, setEvents] = useState<GCEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ApiResponse<GCEvent[]>>('/events?upcoming=true')
      .then(r => setEvents(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 pt-28 pb-16">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">What's on</p>
          <h1 className="text-3xl font-bold text-gray-900">Upcoming Events</h1>
          <p className="text-gray-400 mt-1.5 text-sm">Local cultural events and gatherings across Sri Lanka</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🎪</div>
            <h3 className="text-lg font-semibold mb-1 text-gray-900">No upcoming events</h3>
            <p className="text-gray-400 text-sm">Check back later for new events</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map(e => (
              <Link key={e.id} to={`/events/${e.id}`}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300">
                {/* Image area */}
                <div className="h-40 bg-amber-50 flex items-center justify-center text-5xl relative">
                  <span>🎪</span>
                  {e.category && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur-sm">
                      {CATEGORY_LABELS[e.category] || e.category}
                    </div>
                  )}
                  {e.price != null && e.price > 0
                    ? <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 text-xs font-bold text-secondary shadow-sm backdrop-blur-sm">${e.price}</div>
                    : <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 text-xs font-bold text-success shadow-sm backdrop-blur-sm">Free</div>
                  }
                </div>
                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-xs font-semibold text-amber-700">
                      {new Date(e.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    {e.startTime && <span className="text-xs text-gray-400">{e.startTime}</span>}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors line-clamp-1">
                    {e.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">{e.description}</p>
                  <div className="text-xs text-gray-400">📍 {e.locationName || 'Sri Lanka'}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
