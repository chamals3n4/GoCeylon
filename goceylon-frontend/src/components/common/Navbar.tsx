import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-4 flex justify-center" style={{ pointerEvents: 'none' }}>
      <nav
        style={{ pointerEvents: 'auto' }}
        className={`w-full max-w-5xl rounded-2xl transition-all duration-300 ${
          scrolled
            ? 'bg-white border border-gray-200 shadow-[0_4px_32px_rgba(0,0,0,0.10)]'
            : 'bg-white/92 backdrop-blur-xl border border-gray-200/70 shadow-[0_2px_16px_rgba(0,0,0,0.06)]'
        }`}>

        {/* Main row */}
        <div className="flex items-center h-14 px-4 gap-2">

          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0 mr-2">
            <span className="text-[17px] font-bold text-gray-900 tracking-tight">GoCeylon</span>
          </Link>

          {/* Desktop divider */}
          <div className="hidden md:block w-px h-5 bg-gray-200 mx-1 shrink-0" />

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-0.5 flex-1">
            <NavPill to="/activities" active={isActive('/activities')}>Activities</NavPill>
            <NavPill to="/events" active={isActive('/events')}>Events</NavPill>
            <NavPill to="/discover" active={isActive('/discover')}>Map</NavPill>
            {isAuthenticated && (
              <>
                <NavPill to="/bookings" active={isActive('/bookings')}>Bookings</NavPill>
                <NavPill to="/favorites" active={isActive('/favorites')}>Favorites</NavPill>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user?.firstName?.[0]?.toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[72px] truncate">
                    {user?.firstName}
                  </span>
                  <svg
                    className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-gray-200 shadow-[0_8px_32px_rgba(0,0,0,0.12)] py-2 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-gray-100 mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-400 capitalize mt-0.5">{user?.role?.toLowerCase()}</p>
                    </div>

                    <DropdownItem to="/profile">Profile</DropdownItem>

                    {user?.role === 'PROVIDER' && (
                      <>
                        <DropdownItem to="/my-listings">My Listings</DropdownItem>
                        <DropdownItem to="/create-listing">Create Listing</DropdownItem>
                        <DropdownItem to="/provider-dashboard">Dashboard</DropdownItem>
                        <DropdownItem to="/earnings">Earnings</DropdownItem>
                      </>
                    )}
                    {user?.role === 'TOURIST' && (
                      <DropdownItem to="/transactions">Transactions</DropdownItem>
                    )}
                    {user?.role === 'ADMIN' && (
                      <DropdownItem to="/admin">Admin Panel</DropdownItem>
                    )}

                    <div className="border-t border-gray-100 mt-1 pt-1 px-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-red-50 rounded-xl transition-colors font-medium">
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login"
                  className="px-4 py-1.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all">
                  Sign in
                </Link>
                <Link to="/register"
                  className="px-4 py-1.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-all shadow-sm">
                  Get started
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 p-3 space-y-0.5">
            <MobileItem to="/activities">Activities</MobileItem>
            <MobileItem to="/events">Events</MobileItem>
            <MobileItem to="/discover">Discover Map</MobileItem>

            {isAuthenticated ? (
              <>
                <MobileItem to="/bookings">My Bookings</MobileItem>
                <MobileItem to="/favorites">Favorites</MobileItem>
                <MobileItem to="/profile">Profile</MobileItem>
                {user?.role === 'PROVIDER' && (
                  <>
                    <MobileItem to="/my-listings">My Listings</MobileItem>
                    <MobileItem to="/create-listing">Create Listing</MobileItem>
                    <MobileItem to="/earnings">Earnings</MobileItem>
                  </>
                )}
                {user?.role === 'TOURIST' && <MobileItem to="/transactions">Transactions</MobileItem>}
                {user?.role === 'ADMIN' && <MobileItem to="/admin">Admin Panel</MobileItem>}
                <div className="pt-2 mt-2 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 text-sm font-medium text-danger hover:bg-red-50 rounded-xl transition-colors">
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-2 pt-2 mt-2 border-t border-gray-100">
                <Link to="/login"
                  className="flex-1 py-2.5 text-center text-sm font-medium border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all">
                  Sign in
                </Link>
                <Link to="/register"
                  className="flex-1 py-2.5 text-center text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary-dark transition-all">
                  Get started
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}

function NavPill({ to, children, active }: { to: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link to={to}
      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-primary/10 text-primary'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
      }`}>
      {children}
    </Link>
  );
}

function DropdownItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to}
      className="block mx-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
      {children}
    </Link>
  );
}

function MobileItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to}
      className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
      {children}
    </Link>
  );
}
