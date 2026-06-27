import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ============================================
 * MEMBER 1 – User Management & Authentication
 * Student ID: IT24103772
 * ============================================
 */
export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '', phone: '', role: 'TOURIST' as 'TOURIST' | 'PROVIDER',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.firstName.trim().length < 2) { setError('First name must be at least 2 characters'); return; }
    if (form.lastName.trim().length < 2) { setError('Last name must be at least 2 characters'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Please enter a valid email address'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (form.role === 'PROVIDER' && !form.phone) { setError('Phone number is required for Providers'); return; }
    if (form.phone && !/^07\d{8}$/.test(form.phone)) { setError('Phone must be 10 digits starting with 07'); return; }

    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.data && typeof data.data === 'object') {
        setError(Object.values(data.data).join('. '));
      } else {
        setError(data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 text-sm placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-gray-100";

  return (
    <div className="min-h-screen flex flex-col items-center bg-white px-4 pt-28 pb-16">
      <div className="w-full max-w-[400px]">

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create an account</h1>
          <p className="text-sm text-gray-400">Join the GoCeylon community today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-danger text-sm">
              {error}
            </div>
          )}

          {/* Role picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
            <div className="grid grid-cols-2 gap-2">
              {(['TOURIST', 'PROVIDER'] as const).map(role => (
                <button key={role} type="button" onClick={() => setForm({ ...form, role })}
                  className={`py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                    form.role === role
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}>
                  {role === 'TOURIST' ? 'Tourist' : 'Provider'}
                </button>
              ))}
            </div>
          </div>

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
              <input id="register-firstName" type="text" required value={form.firstName}
                onChange={e => setForm({ ...form, firstName: e.target.value })}
                className={inputClass} placeholder="John" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
              <input id="register-lastName" type="text" required value={form.lastName}
                onChange={e => setForm({ ...form, lastName: e.target.value })}
                className={inputClass} placeholder="Doe" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input id="register-email" type="email" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className={inputClass} placeholder="you@example.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input id="register-password" type="password" required value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className={inputClass} placeholder="Min 8 chars, use @ ! $ % & as special char" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone {form.role === 'PROVIDER' ? <span className="text-danger">*</span> : <span className="text-gray-400 font-normal">(optional)</span>}
            </label>
            <input id="register-phone" type="tel" value={form.phone}
              required={form.role === 'PROVIDER'}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className={inputClass} placeholder="07X XXX XXXX" />
          </div>

          <button id="register-submit" type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all disabled:opacity-50 mt-2">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-400 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-gray-700 font-medium hover:text-primary transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
