'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_emoji: string | null;
  birthday: string | null;
  interests: string | null;
}

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('👤');
  const [birthday, setBirthday] = useState('');
  const [interests, setInterests] = useState('');

  const emojiOptions = ['👤', '👩', '👨', '🧑', '👩‍🦰', '👨‍🦰', '👩‍🦳', '👨‍🦳', '🦸', '🦸‍♀️', '🧙', '🧙‍♀️', '🎅', '🤶', '😎', '🤓', '🥳', '😊'];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Get user profile from our users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile(data);
      setName(data.name || user.user_metadata?.full_name || '');
      setEmoji(data.avatar_emoji || '👤');
      setBirthday(data.birthday || '');
      setInterests(data.interests || '');
    } else {
      // Profile doesn't exist yet, use auth data
      setName(user.user_metadata?.full_name || '');
      setProfile({
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || null,
        avatar_emoji: '👤',
        birthday: null,
        interests: null,
      });
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const profileData = {
      name,
      avatar_emoji: emoji,
      birthday: birthday || null,
      interests: interests || null,
    };

    const { error } = await supabase
      .from('users')
      .update(profileData)
      .eq('id', user.id);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to save. Please try again.' });
    } else {
      setMessage({ type: 'success', text: 'Profile saved!' });
      // Also update Supabase auth metadata
      await supabase.auth.updateUser({
        data: { full_name: name }
      });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#3D4F5F]">Settings</h1>
        <p className="text-[#5A6C7D]">Manage your profile and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-[#3D4F5F]">👤 Your Profile</h2>
          <p className="text-sm text-[#5A6C7D]">This info can be shown on your shared wishlists</p>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {message && (
            <div className={`p-4 rounded-xl text-sm ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          {/* Avatar Emoji */}
          <div>
            <label className="block text-sm font-medium text-[#3D4F5F] mb-2">
              Avatar
            </label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-11 h-11 text-2xl rounded-xl border-2 transition ${
                    emoji === e 
                      ? 'border-[#D64045] bg-red-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#3D4F5F] mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
              placeholder="Your name"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-[#3D4F5F] mb-2">
              Email
            </label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Contact support to change your email</p>
          </div>

          {/* Birthday */}
          <div>
            <label className="block text-sm font-medium text-[#3D4F5F] mb-2">
              Your Birthday 🎂
            </label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
            />
            <p className="text-xs text-gray-500 mt-1">Shown on your shared wishlists so family knows when to shop!</p>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-[#3D4F5F] mb-2">
              Interests & Preferences
            </label>
            <textarea
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
              placeholder="e.g., Loves cooking, gardening, mystery novels. Wears size M. Favorite colors: blue and green."
            />
            <p className="text-xs text-gray-500 mt-1">Help gift-givers know what you like!</p>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#D64045] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#B83539] transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Account Section */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-[#3D4F5F]">🔐 Account</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <div className="font-medium text-[#3D4F5F]">Subscription</div>
              <div className="text-sm text-[#5A6C7D]">Free Plan</div>
            </div>
            <button className="px-4 py-2 bg-[#F4C430] text-[#3D4F5F] rounded-lg font-medium hover:bg-[#F7D154] transition text-sm">
              Upgrade
            </button>
          </div>
          
          <button
            onClick={handleSignOut}
            className="w-full px-6 py-3 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-200 overflow-hidden">
        <div className="p-4 border-b border-red-200 bg-red-50">
          <h2 className="font-semibold text-red-700">⚠️ Danger Zone</h2>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Deleting your account will permanently remove all your data including people, wishlists, and gifts. This cannot be undone.
          </p>
          <button
            onClick={() => alert('Please contact support to delete your account.')}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 transition"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
