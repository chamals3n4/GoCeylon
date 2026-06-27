import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import { Activity, ApiResponse, CATEGORIES, CATEGORY_LABELS } from '../../types';

/**
 * ============================================
 * MEMBER 2 – Activity & Event Listing Management
 * Student ID: IT24103420
 * ============================================
 */
const CATEGORY_EMOJI: Record<string, string> = {
  CULTURAL: '🎭', ADVENTURE: '🏔️', CULINARY: '🍲', NATURE: '🌿',
  CRAFT: '🎨', WELLNESS: '🧘', WATER_SPORTS: '🏄', WILDLIFE: '🐘', HERITAGE: '🏛️',
};

const CARD_BG = ['bg-orange-50', 'bg-sky-50', 'bg-emerald-50', 'bg-violet-50', 'bg-amber-50', 'bg-rose-50'];

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || '';

  useEffect(() => {
    setLoading(true);
    const url = selectedCategory ? `/activities?category=${selectedCategory}` : '/activities';
    api.get<ApiResponse<Activity[]>>(url)
      .then(r => setActivities(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 pt-28 pb-16">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Browse</p>
          <h1 className="text-3xl font-bold text-gray-900">Explore Activities</h1>
          <p className="text-gray-400 mt-1.5 text-sm">Discover authentic Sri Lankan experiences from local communities</p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <FilterPill active={!selectedCategory} onClick={() => setSearchParams({})}>All</FilterPill>
          {CATEGORIES.map(cat => (
            <FilterPill key={cat} active={selectedCategory === cat} onClick={() => setSearchParams({ category: cat })}>
              {CATEGORY_EMOJI[cat]} {CATEGORY_LABELS[cat]}
            </FilterPill>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🏝️</div>
            <h3 className="text-lg font-semibold mb-1 text-gray-900">No activities found</h3>
            <p className="text-gray-400 text-sm">Try a different category or check back later</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activities.map((a, i) => (
              <Link key={a.id} to={`/activities/${a.id}`}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300">
                <div className={`h-44 flex items-center justify-center text-5xl relative ${CARD_BG[i % CARD_BG.length]}`}>
                  <span>{CATEGORY_EMOJI[a.category] || '🌴'}</span>
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur-sm">
                    {CATEGORY_LABELS[a.category] || a.category}
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 text-xs font-bold text-secondary shadow-sm backdrop-blur-sm">
                    ${a.price}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors line-clamp-1">
                    {a.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">{a.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>📍 {a.locationName || 'Sri Lanka'}</span>
                    <div className="flex items-center gap-2">
                      {a.durationHours && <span>⏱ {a.durationHours}h</span>}
                      <span className="text-gray-300">by {a.providerName}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-primary text-white shadow-sm'
          : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-900'
      }`}>
      {children}
    </button>
  );
}
