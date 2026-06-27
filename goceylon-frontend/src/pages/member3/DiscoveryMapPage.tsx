import { useEffect, useState, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import api from '../../api/axios';
import { NearbyActivity, ApiResponse, CATEGORY_LABELS, SearchPreference, CATEGORIES } from '../../types';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

/**
 * ============================================
 * MEMBER 3 – Interactive Location-Based Activity Discovery Map
 * Student ID: IT24103524
 * ============================================
 */

const RADIUS_OPTIONS = [10, 25, 50, 100, 200];

const CATEGORY_EMOJI: Record<string, string> = {
  CULTURAL: '🎭', ADVENTURE: '🏔️', CULINARY: '🍲', NATURE: '🌿',
  CRAFT: '🎨', WELLNESS: '🧘', WATER_SPORTS: '🏄', WILDLIFE: '🐘',
  HERITAGE: '🏛️', OTHER: '📍',
};

export default function DiscoveryMapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const markerElsRef = useRef<Map<number, HTMLElement>>(new Map());

  const [activities, setActivities] = useState<NearbyActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [lat, setLat] = useState('7.8731');
  const [lng, setLng] = useState('80.7718');
  const [radius, setRadius] = useState('50');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { isAuthenticated } = useAuth();
  const [favMsg, setFavMsg] = useState('');
  const [locating, setLocating] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState<SearchPreference>({});
  const [savingPrefs, setSavingPrefs] = useState(false);

  // ── Map init ──────────────────────────────────────────────────
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [parseFloat(lng), parseFloat(lat)],
      zoom: 7,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => { map.current?.remove(); map.current = null; };
  }, []);

  // ── Auto-search on map click ───────────────────────────────────
  useEffect(() => {
    if (!map.current) return;
    const onClick = (e: mapboxgl.MapMouseEvent) => {
      const newLat = e.lngLat.lat.toFixed(4);
      const newLng = e.lngLat.lng.toFixed(4);
      setLat(newLat);
      setLng(newLng);
      doSearch(newLat, newLng, radius);
    };
    map.current.on('click', onClick);
    return () => { map.current?.off('click', onClick); };
  }, [radius]);

  // ── Update pill styles when selection changes ─────────────────
  useEffect(() => {
    markerElsRef.current.forEach((pill, id) => {
      setPillStyle(pill, id === selectedId);
    });
  }, [selectedId]);

  // ── Markers ───────────────────────────────────────────────────
  const updateMarkers = useCallback((acts: NearbyActivity[], centerLat: string, centerLng: string) => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    markerElsRef.current.clear();
    if (!map.current) return;

    // ── Search-center dot ──
    const centerWrap = document.createElement('div');
    centerWrap.innerHTML = `<div style="width:14px;height:14px;border-radius:50%;background:#111827;border:3px solid white;box-shadow:0 0 0 2px #111827,0 2px 8px rgba(0,0,0,0.35)"></div>`;
    new mapboxgl.Marker({ element: centerWrap, anchor: 'center' })
      .setLngLat([parseFloat(centerLng), parseFloat(centerLat)])
      .addTo(map.current);

    acts.forEach(a => {
      // Outer wrapper — Mapbox positions this; we don't style it
      const wrap = document.createElement('div');

      // Inner pill — this is what we visually style
      const pill = document.createElement('div');
      setPillStyle(pill, false);
      pill.textContent = `$${a.price}`;
      wrap.appendChild(pill);

      const popup = new mapboxgl.Popup({ offset: 14, maxWidth: '220px', closeButton: false })
        .setHTML(`
          <div style="font-family:system-ui;padding:2px">
            <p style="font-weight:600;font-size:13px;color:#111827;margin:0 0 4px">${a.title}</p>
            <p style="font-size:11px;color:#6b7280;margin:0 0 8px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${a.description.substring(0, 80)}</p>
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:11px;color:#9ca3af">${a.distance} km away</span>
              <span style="font-size:11px;color:#6b7280">${CATEGORY_EMOJI[a.category] || ''} ${CATEGORY_LABELS[a.category] || ''}</span>
            </div>
          </div>
        `);

      const marker = new mapboxgl.Marker({ element: wrap, anchor: 'center' })
        .setLngLat([a.longitude, a.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      wrap.addEventListener('click', (ev) => {
        ev.stopPropagation();
        setSelectedId(a.id);
      });

      markersRef.current.push(marker);
      markerElsRef.current.set(a.id, pill);  // store the PILL, not the wrap
    });

    if (acts.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([parseFloat(centerLng), parseFloat(centerLat)]);
      acts.forEach(a => bounds.extend([a.longitude, a.latitude]));
      map.current.fitBounds(bounds, { padding: 80, maxZoom: 13, duration: 900 });
    }
  }, []);

  // ── Search ────────────────────────────────────────────────────
  const doSearch = (searchLat: string, searchLng: string, searchRadius: string, searchPrefs?: SearchPreference) => {
    const tLat = parseFloat(searchLat);
    const tLng = parseFloat(searchLng);
    const tRadius = parseFloat(searchRadius);
    if (isNaN(tLat) || isNaN(tLng) || isNaN(tRadius)) return;

    setLoading(true);
    setSelectedId(null);

    const activePrefs = searchPrefs ?? prefs;
    api.get<ApiResponse<NearbyActivity[]>>(`/discovery/nearby?lat=${tLat}&lng=${tLng}&radius=${tRadius}`)
      .then(r => {
        let data = r.data.data || [];
        if (activePrefs.maxPrice) data = data.filter(a => a.price <= activePrefs.maxPrice!);
        if (activePrefs.minPrice) data = data.filter(a => a.price >= activePrefs.minPrice!);
        if (activePrefs.preferredCategories) {
          const cats = activePrefs.preferredCategories.split(',').filter(Boolean);
          if (cats.length > 0) data = data.filter(a => cats.includes(a.category));
        }
        setActivities(data);
        updateMarkers(data, searchLat, searchLng);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAuthenticated) {
      api.get<ApiResponse<SearchPreference>>('/preferences').then(r => {
        const p = r.data.data;
        setPrefs(p);
        if (p.maxDistanceKm) setRadius(p.maxDistanceKm.toString());
        doSearch(lat, lng, p.maxDistanceKm ? p.maxDistanceKm.toString() : radius, p);
      }).catch(() => { doSearch(lat, lng, radius); });
    } else {
      doSearch(lat, lng, radius);
    }
  }, [isAuthenticated]);

  // ── Geolocation ───────────────────────────────────────────────
  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const newLat = pos.coords.latitude.toFixed(4);
        const newLng = pos.coords.longitude.toFixed(4);
        setLat(newLat);
        setLng(newLng);
        map.current?.flyTo({ center: [parseFloat(newLng), parseFloat(newLat)], zoom: 10, duration: 1000 });
        doSearch(newLat, newLng, radius);
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const handleAddToFavorites = async (e: React.MouseEvent, activityId: number) => {
    e.stopPropagation();
    try {
      await api.post('/favorites', { activityId, favoriteType: 'ACTIVITY' });
      setFavMsg('Saved to favorites');
    } catch (err: any) {
      setFavMsg(err.response?.data?.message || 'Already saved');
    }
    setTimeout(() => setFavMsg(''), 3000);
  };

  const handleSavePrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      const payload = { ...prefs, maxDistanceKm: Number(radius) };
      await api.put('/preferences', payload);
      setShowSettings(false);
      doSearch(lat, lng, radius, payload);
    } catch {}
    setSavingPrefs(false);
  };

  const selected = activities.find(a => a.id === selectedId) ?? null;

  const inp = "w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-100 text-gray-900 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all";

  return (
    <div className="flex overflow-hidden bg-white" style={{ height: '100dvh', paddingTop: '72px' }}>

      {/* ── Left panel ─────────────────────────────────────────── */}
      <div className="w-[420px] shrink-0 flex flex-col border-r border-gray-100">

        {/* Controls */}
        <div className="px-5 py-4 border-b border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-bold text-gray-900">Discover Sri Lanka</h1>
            {isAuthenticated && (
              <button onClick={() => setShowSettings(true)}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                Filters
              </button>
            )}
          </div>

          {/* Radius pills */}
          <div>
            <p className="text-[11px] font-medium text-gray-400 mb-2">Search radius</p>
            <div className="flex gap-1.5 flex-wrap">
              {RADIUS_OPTIONS.map(r => (
                <button key={r} onClick={() => { setRadius(r.toString()); doSearch(lat, lng, r.toString()); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    radius === r.toString()
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>
                  {r} km
                </button>
              ))}
            </div>
          </div>

          {/* Location controls */}
          <div className="flex gap-2">
            <button onClick={detectLocation} disabled={locating}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50">
              {locating ? (
                <span className="w-3.5 h-3.5 border border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="9" strokeDasharray="3 2"/></svg>
              )}
              {locating ? 'Locating…' : 'Use my location'}
            </button>
            <button onClick={() => doSearch(lat, lng, radius)}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all">
              Search
            </button>
          </div>

          <p className="text-[11px] text-gray-400">Click anywhere on the map to search that area</p>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {/* Result header */}
          <div className="px-5 py-3 flex items-center justify-between sticky top-0 bg-white border-b border-gray-50 z-10">
            <p className="text-sm font-semibold text-gray-900">
              {loading ? 'Searching…' : `${activities.length} activit${activities.length === 1 ? 'y' : 'ies'} found`}
            </p>
            {favMsg && <span className="text-xs text-primary">{favMsg}</span>}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-16 px-5">
              <p className="text-3xl mb-3">🗺️</p>
              <p className="text-sm font-medium text-gray-700 mb-1">No activities in this area</p>
              <p className="text-xs text-gray-400">Try a wider radius or click a different spot on the map</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {activities.map(a => (
                <div key={a.id}
                  onClick={() => {
                    setSelectedId(a.id);
                    map.current?.flyTo({ center: [a.longitude, a.latitude], zoom: 13, duration: 700 });
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    selectedId === a.id
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                  }`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl leading-none mt-0.5 shrink-0">{CATEGORY_EMOJI[a.category] || '📍'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-1">{a.title}</p>
                        <p className="text-sm font-bold text-secondary shrink-0">${a.price}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{a.description}</p>
                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-gray-400">{a.distance} km away</span>
                          <span className="text-gray-200">·</span>
                          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            {CATEGORY_LABELS[a.category] || a.category}
                          </span>
                        </div>
                        {selectedId === a.id && (
                          <div className="flex items-center gap-2">
                            {isAuthenticated && (
                              <button onClick={e => handleAddToFavorites(e, a.id)}
                                className="text-[11px] text-gray-400 hover:text-danger transition-colors">
                                ♡ Save
                              </button>
                            )}
                            <Link to={`/activities/${a.id}`} onClick={e => e.stopPropagation()}
                              className="text-[11px] font-semibold text-primary hover:underline">
                              View →
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Map ─────────────────────────────────────────────────── */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/95 border border-gray-200 shadow-sm text-[11px] text-gray-500 whitespace-nowrap pointer-events-none">
          Click map · choose a radius · hit Search
        </div>
      </div>

      {/* ── Settings modal ───────────────────────────────────────── */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-xl bg-white rounded-2xl border border-gray-100 shadow-[0_24px_64px_rgba(0,0,0,0.14)] overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="px-7 py-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Search Preferences</h2>
              <p className="text-sm text-gray-400 mt-0.5">Saved and applied to every search</p>
            </div>

            <form onSubmit={handleSavePrefs} className="p-7 space-y-6">
              {/* Price row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Min Price ($)</label>
                  <input type="number" min="0" value={prefs.minPrice || ''} placeholder="No minimum"
                    onChange={e => setPrefs({ ...prefs, minPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Max Price ($)</label>
                  <input type="number" min="0" value={prefs.maxPrice || ''} placeholder="No limit"
                    onChange={e => setPrefs({ ...prefs, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className={inp} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-3">Categories</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(c => {
                    const activeCats = prefs.preferredCategories ? prefs.preferredCategories.split(',').filter(Boolean) : [];
                    const isActive = activeCats.includes(c);
                    return (
                      <label key={c} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                        isActive ? 'border-primary/30 bg-primary/5 text-primary' : 'border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                      }`}>
                        <input type="checkbox" checked={isActive} className="sr-only"
                          onChange={e => {
                            let next = [...activeCats];
                            if (e.target.checked) next.push(c); else next = next.filter(x => x !== c);
                            setPrefs({ ...prefs, preferredCategories: next.join(',') });
                          }} />
                        <span className="text-lg leading-none">{CATEGORY_EMOJI[c] || '📍'}</span>
                        <span className="text-xs font-medium truncate">{CATEGORY_LABELS[c] || c}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowSettings(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={savingPrefs}
                  className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-all disabled:opacity-50">
                  {savingPrefs ? 'Saving…' : 'Save preferences'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles the inner pill element — avoids Mapbox interfering with the wrapper
function setPillStyle(pill: HTMLElement, selected: boolean) {
  pill.setAttribute('style', [
    `background:${selected ? '#111827' : 'white'}`,
    `color:${selected ? 'white' : '#111827'}`,
    `border:${selected ? '1.5px solid #111827' : '1.5px solid #d1d5db'}`,
    'border-radius:20px',
    'padding:5px 10px',
    'font-size:12px',
    'font-weight:700',
    'font-family:system-ui,-apple-system,sans-serif',
    'white-space:nowrap',
    `box-shadow:${selected ? '0 4px 16px rgba(0,0,0,0.28)' : '0 2px 8px rgba(0,0,0,0.14)'}`,
    'cursor:pointer',
    `transform:${selected ? 'scale(1.12)' : 'scale(1)'}`,
    'transition:all 0.18s',
    'user-select:none',
    'line-height:1',
  ].join(';'));
}
