import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Event as GCEvent, ApiResponse, CATEGORY_LABELS } from '../../types';

/**
 * ============================================
 * MEMBER 2 – Activity & Event Listing Management
 * Student ID: IT24103420
 * ============================================
 */
export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState<GCEvent | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get<ApiResponse<GCEvent>>(`/events/${id}`)
      .then(r => setEventData(r.data.data))
      .catch(() => navigate('/events'));
  }, [id]);

  if (!eventData) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <Link to="/events" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          ← Back to Events
        </Link>

        {/* Header image placeholder */}
        <div className="h-64 rounded-2xl bg-amber-50 flex items-center justify-center mb-8 text-8xl border border-amber-100">
          🎪
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full bg-amber-50 text-secondary text-sm font-medium">
                  {CATEGORY_LABELS[eventData.category] || eventData.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-sm">
                  📅 {new Date(eventData.eventDate).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900">{eventData.title}</h1>
              <p className="text-gray-500">Organized by {eventData.providerName}</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <h3 className="font-semibold mb-3 text-gray-900">About this Event</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{eventData.description}</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <h3 className="font-semibold mb-3 text-gray-900">Event Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Location:</span> <span className="ml-2 font-medium text-gray-900">{eventData.locationName || 'Sri Lanka'}</span></div>
                <div><span className="text-gray-500">Start Time:</span> <span className="ml-2 font-medium text-gray-900">{eventData.startTime}</span></div>
                {eventData.endTime && <div><span className="text-gray-500">End Time:</span> <span className="ml-2 font-medium text-gray-900">{eventData.endTime}</span></div>}
                {eventData.maxAttendees && <div><span className="text-gray-500">Max Attendees:</span> <span className="ml-2 font-medium text-gray-900">{eventData.maxAttendees}</span></div>}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="sticky top-24 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
              <div className="text-center mb-4">
                {eventData.price ? (
                  <div className="text-3xl font-bold text-secondary">
                    ${eventData.price}
                    <span className="text-base text-gray-500 font-normal block">Entrance Fee</span>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-success border border-green-200 bg-green-50 rounded-xl py-2">
                    FREE
                    <span className="text-base font-normal block text-gray-500">Entrance</span>
                  </div>
                )}
              </div>

              <Link to={`/discover?lat=${eventData.latitude}&lng=${eventData.longitude}`}
                className="block w-full py-3 rounded-xl bg-primary text-white font-semibold text-center hover:bg-primary-dark transition-all">
                View on Map 🗺️
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
