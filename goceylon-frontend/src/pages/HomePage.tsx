import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Activity, Event as GCEvent, ApiResponse } from '../types';

const HERO_CARDS = [
  { key: 'CULTURAL',    emoji: '🎭', label: 'Cultural Tours',  bg: 'bg-orange-50',  border: 'border-orange-100',  hover: 'hover:border-orange-400',  text: 'text-orange-800'  },
  { key: 'ADVENTURE',   emoji: '🏔️', label: 'Adventure',       bg: 'bg-sky-50',     border: 'border-sky-100',     hover: 'hover:border-sky-400',     text: 'text-sky-800'     },
  { key: 'CULINARY',    emoji: '🍲', label: 'Culinary',        bg: 'bg-amber-50',   border: 'border-amber-100',   hover: 'hover:border-amber-400',   text: 'text-amber-800'   },
  { key: 'NATURE',      emoji: '🌿', label: 'Nature & Hiking', bg: 'bg-emerald-50', border: 'border-emerald-100', hover: 'hover:border-emerald-400', text: 'text-emerald-800' },
  { key: 'WATER_SPORTS',emoji: '🏄', label: 'Water Sports',   bg: 'bg-cyan-50',    border: 'border-cyan-100',    hover: 'hover:border-cyan-400',    text: 'text-cyan-800'    },
  { key: 'WELLNESS',    emoji: '🧘', label: 'Wellness',        bg: 'bg-violet-50',  border: 'border-violet-100',  hover: 'hover:border-violet-400',  text: 'text-violet-800'  },
];

const CATEGORY_EMOJI: Record<string, string> = {
  CULTURAL: '🎭', ADVENTURE: '🏔️', CULINARY: '🍲', NATURE: '🌿',
  CRAFT: '🎨', WELLNESS: '🧘', WATER_SPORTS: '🏄', WILDLIFE: '🐘', HERITAGE: '🏛️',
};

const CARD_BG = ['bg-orange-50', 'bg-sky-50', 'bg-emerald-50', 'bg-violet-50', 'bg-amber-50', 'bg-rose-50'];

export default function HomePage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [events, setEvents] = useState<GCEvent[]>([]);

  useEffect(() => {
    api.get<ApiResponse<Activity[]>>('/activities').then(r => setActivities(r.data.data?.slice(0, 6) || [])).catch(() => {});
    api.get<ApiResponse<GCEvent[]>>('/events?upcoming=true').then(r => setEvents(r.data.data?.slice(0, 3) || [])).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section className="bg-white overflow-hidden">

        {/* Centered copy block */}
        <div className="max-w-3xl mx-auto px-6 pt-28 pb-14 text-center">
          <h1 className="text-[52px] sm:text-[68px] lg:text-[76px] font-black leading-[1.04] tracking-tight mb-6">
            <span className="text-gray-900">Discover Authentic</span><br />
            <span className="text-primary">Sri Lanka</span>
          </h1>
          <p className="text-gray-400 text-[15px] leading-relaxed mb-8 max-w-sm mx-auto">
            Book unique experiences directly from local communities — cooking classes,
            surf lessons, cultural workshops, and more.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/activities"
              className="px-7 py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all shadow-sm hover:shadow-md">
              Explore Activities
            </Link>
            <Link to="/discover"
              className="px-7 py-3.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-all">
              View Map
            </Link>
          </div>

        </div>

        {/* Category card row — landscape, flush to section bottom */}
        <div className="max-w-6xl mx-auto px-8 pb-0">
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            {HERO_CARDS.map(c => (
              <Link key={c.key} to={`/activities?category=${c.key}`}
                className={`${c.bg} border-2 ${c.border} ${c.hover} rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md group`}>
                <span className="text-3xl leading-none">{c.emoji}</span>
                <span className={`text-xs font-semibold leading-tight ${c.text}`}>{c.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom fade into next section */}
        <div className="h-10 bg-white" />
      </section>

      {/* ─── FEATURED ACTIVITIES ───────────────────────────────── */}
      {activities.length > 0 && (
        <section className="py-20 px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Top Picks</p>
                <h2 className="text-2xl font-bold text-gray-900">Featured Activities</h2>
              </div>
              <Link to="/activities"
                className="text-sm text-gray-400 hover:text-gray-900 font-medium transition-colors flex items-center gap-1">
                View all <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activities.map((a, i) => (
                <Link key={a.id} to={`/activities/${a.id}`}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300">
                  <div className={`h-44 flex items-center justify-center text-5xl relative ${CARD_BG[i % CARD_BG.length]}`}>
                    <span>{CATEGORY_EMOJI[a.category] || '🌴'}</span>
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur-sm">
                      {a.category.replace('_', ' ')}
                    </div>
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 text-xs font-bold text-secondary shadow-sm backdrop-blur-sm">
                      ${a.price}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {a.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">{a.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>📍 {a.locationName || 'Sri Lanka'}</span>
                      <span className="text-gray-300">by {a.providerName}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── UPCOMING EVENTS ───────────────────────────────────── */}
      {events.length > 0 && (
        <section className="py-20 px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">What's on</p>
                <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
              </div>
              <Link to="/events"
                className="text-sm text-gray-400 hover:text-gray-900 font-medium transition-colors flex items-center gap-1">
                View all <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {events.map(e => (
                <Link key={e.id} to={`/events/${e.id}`}
                  className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-xs font-semibold text-amber-700">
                      {new Date(e.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    {e.startTime && <span className="text-xs text-gray-400">{e.startTime}</span>}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {e.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-4">{e.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">📍 {e.locationName || 'Sri Lanka'}</span>
                    {e.price != null && e.price > 0
                      ? <span className="text-sm font-bold text-secondary">${e.price}</span>
                      : <span className="text-sm font-semibold text-success">Free</span>
                    }
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── PROVIDER CTA ──────────────────────────────────────── */}
      <section className="py-20 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-900 rounded-3xl px-10 py-14 sm:px-16 flex flex-col sm:flex-row items-center justify-between gap-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">For Local Experts</p>
              <h2 className="text-3xl font-bold text-white mb-3">Share your passion</h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Join GoCeylon and connect your authentic Sri Lankan experiences with travelers from around the world.
              </p>
            </div>
            <Link to="/register"
              className="shrink-0 px-8 py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all shadow-sm whitespace-nowrap">
              Become a Provider
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
