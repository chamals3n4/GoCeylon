import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { User, ApiResponse } from '../../types';
import ConfirmDialog from '../../components/common/ConfirmDialog';

/**
 * ============================================
 * MEMBER 1 – User Management & Authentication
 * Student ID: IT24103772
 * ============================================
 */
export default function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', bio: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [dialog, setDialog] = useState<'signout' | 'delete' | null>(null);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get<ApiResponse<User>>('/users/profile');
      setProfile(res.data.data);
      setForm({
        firstName: res.data.data.firstName,
        lastName: res.data.data.lastName,
        phone: res.data.data.phone || '',
        bio: res.data.data.bio || '',
      });
    } catch {}
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      const res = await api.put<ApiResponse<User>>('/users/profile', form);
      setProfile(res.data.data);
      setEditing(false);
      setMsg('Profile updated.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg('');
    try {
      await api.put('/users/password', pwForm);
      setPwMsg('success');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err: any) {
      setPwMsg(err.response?.data?.message || 'Password change failed');
    }
  };

  const handleDeleteAccount = async () => {
    if (!profile) return;
    setDialog(null);
    try {
      await api.delete(`/users/${profile.id}`);
      logout(); navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete account');
    }
  };

  const inp = "w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-100 text-gray-900 text-sm placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all";

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">

      {/* ── Dialogs ── */}
      {dialog === 'signout' && (
        <ConfirmDialog
          title="Sign out?"
          description="You'll need to sign in again to access your account."
          confirmLabel="Sign out"
          onCancel={() => setDialog(null)}
          onConfirm={() => { setDialog(null); logout(); navigate('/'); }}
        />
      )}
      {dialog === 'delete' && (
        <ConfirmDialog
          title="Delete your account?"
          description="This will permanently delete your account and all associated data. This action cannot be undone."
          confirmLabel="Delete account"
          danger
          onCancel={() => setDialog(null)}
          onConfirm={handleDeleteAccount}
        />
      )}

      <div className="max-w-5xl mx-auto px-8 pt-28 pb-20">

        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Account</h1>
          <p className="text-gray-400 text-sm mt-1">{profile.email}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">

          {/* ── Left: Identity sidebar ── */}
          <div className="lg:sticky lg:top-28 space-y-4">
            <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-2xl font-bold text-white mb-4">
                {profile.firstName[0]}
              </div>
              <p className="font-semibold text-gray-900">{profile.firstName} {profile.lastName}</p>
              <p className="text-sm text-gray-400 mt-0.5 mb-3">{profile.email}</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 text-[11px] rounded-full bg-primary/10 text-primary font-semibold">
                  {profile.role}
                </span>
                {profile.isVerified && (
                  <span className="px-2.5 py-1 text-[11px] rounded-full bg-green-100 text-success font-semibold">
                    Verified
                  </span>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-400">Member since</p>
                <p className="text-sm text-gray-700 font-medium mt-0.5">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <button onClick={() => setDialog('signout')}
              className="w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:border-gray-300 hover:text-gray-900 transition-all">
              Sign out
            </button>
          </div>

          {/* ── Right: Content ── */}
          <div className="space-y-5">

            {/* Personal info */}
            <section className="rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">Personal Information</h2>
                {!editing && (
                  <button onClick={() => setEditing(true)}
                    className="text-xs font-medium text-primary hover:underline">
                    Edit
                  </button>
                )}
              </div>

              <div className="p-6">
                {msg   && <div className="px-4 py-3 mb-4 rounded-xl bg-green-50 border border-green-100 text-success text-sm">{msg}</div>}
                {error && <div className="px-4 py-3 mb-4 rounded-xl bg-red-50 border border-red-100 text-danger text-sm">{error}</div>}

                {editing ? (
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="First Name">
                        <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className={inp} />
                      </Field>
                      <Field label="Last Name">
                        <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className={inp} />
                      </Field>
                    </div>
                    <Field label="Phone">
                      <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inp} placeholder="07X XXX XXXX" />
                    </Field>
                    <Field label="Bio">
                      <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} className={inp + ' resize-none'} placeholder="Tell us about yourself..." />
                    </Field>
                    <div className="flex gap-2 pt-1">
                      <button type="submit" className="px-5 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-all">
                        Save changes
                      </button>
                      <button type="button" onClick={() => setEditing(false)}
                        className="px-5 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-all">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="divide-y divide-gray-50">
                    <InfoRow label="Name">{profile.firstName} {profile.lastName}</InfoRow>
                    <InfoRow label="Phone">{profile.phone || <Blank />}</InfoRow>
                    <InfoRow label="Bio">{profile.bio || <Blank />}</InfoRow>
                  </div>
                )}
              </div>
            </section>

            {/* Security */}
            <section className="rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">Security</h2>
              </div>
              <div className="p-6">
                {pwMsg === 'success' && (
                  <div className="px-4 py-3 mb-4 rounded-xl bg-green-50 border border-green-100 text-success text-sm">Password updated successfully.</div>
                )}
                {pwMsg && pwMsg !== 'success' && (
                  <div className="px-4 py-3 mb-4 rounded-xl bg-red-50 border border-red-100 text-danger text-sm">{pwMsg}</div>
                )}
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Current Password">
                      <input type="password" required value={pwForm.currentPassword}
                        onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                        className={inp} placeholder="••••••••" />
                    </Field>
                    <Field label="New Password">
                      <input type="password" required value={pwForm.newPassword}
                        onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                        className={inp} placeholder="Min 8 chars, use @ ! $ % &" />
                    </Field>
                  </div>
                  <button type="submit"
                    className="px-5 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-all">
                    Update password
                  </button>
                </form>
              </div>
            </section>

            {/* Danger zone */}
            <section className="rounded-2xl border border-red-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-red-100">
                <h2 className="text-sm font-semibold text-danger">Danger Zone</h2>
              </div>
              <div className="p-6 flex items-center justify-between gap-6">
                <p className="text-sm text-gray-400">Permanently delete your account and all associated data.</p>
                <button onClick={() => setDialog('delete')}
                  className="shrink-0 px-5 py-2 rounded-xl border border-red-200 text-danger text-sm font-medium hover:bg-red-50 transition-all">
                  Delete account
                </button>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-3 gap-6">
      <span className="text-sm text-gray-400 shrink-0 w-24">{label}</span>
      <span className="text-sm text-gray-900 text-right">{children}</span>
    </div>
  );
}

function Blank() {
  return <span className="text-gray-300">—</span>;
}
