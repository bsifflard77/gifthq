'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

interface Gift {
  id: string;
  name: string;
  status: string;
  price: number | null;
  budget: number | null;
  url: string | null;
  notes: string | null;
  person_id: string | null;
  created_at: string;
  person?: { name: string; avatar_emoji: string };
}

interface Person {
  id: string;
  name: string;
  avatar_emoji: string;
}

export default function GiftsPage() {
  const supabase = createClient();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGift, setEditingGift] = useState<Gift | null>(null);
  const [filter, setFilter] = useState<string>('all');
  
  // Form state
  const [name, setName] = useState('');
  const [personId, setPersonId] = useState('');
  const [status, setStatus] = useState('idea');
  const [price, setPrice] = useState('');
  const [budget, setBudget] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const statusOptions = [
    { value: 'idea', label: '💡 Idea', color: 'bg-gray-100 text-gray-700' },
    { value: 'decided', label: '✓ Decided', color: 'bg-blue-100 text-blue-700' },
    { value: 'purchased', label: '🛒 Purchased', color: 'bg-green-100 text-green-700' },
    { value: 'wrapped', label: '🎀 Wrapped', color: 'bg-purple-100 text-purple-700' },
    { value: 'given', label: '🎁 Given', color: 'bg-pink-100 text-pink-700' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [giftsRes, peopleRes] = await Promise.all([
      supabase
        .from('gifts')
        .select('*, person:people(name, avatar_emoji)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('people')
        .select('id, name, avatar_emoji')
        .eq('user_id', user.id)
        .order('name'),
    ]);

    if (giftsRes.data) setGifts(giftsRes.data);
    if (peopleRes.data) setPeople(peopleRes.data);
    setLoading(false);
  };

  const resetForm = () => {
    setName('');
    setPersonId('');
    setStatus('idea');
    setPrice('');
    setBudget('');
    setUrl('');
    setNotes('');
    setEditingGift(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const giftData = {
      user_id: user.id,
      name,
      person_id: personId || null,
      status,
      price: price ? parseFloat(price) : null,
      budget: budget ? parseFloat(budget) : null,
      url: url || null,
      notes: notes || null,
    };

    if (editingGift) {
      const { error } = await supabase
        .from('gifts')
        .update(giftData)
        .eq('id', editingGift.id);

      if (!error) {
        await fetchData();
        setShowForm(false);
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('gifts')
        .insert(giftData);

      if (!error) {
        await fetchData();
        setShowForm(false);
        resetForm();
      }
    }
    setSaving(false);
  };

  const handleEdit = (gift: Gift) => {
    setEditingGift(gift);
    setName(gift.name);
    setPersonId(gift.person_id || '');
    setStatus(gift.status);
    setPrice(gift.price?.toString() || '');
    setBudget(gift.budget?.toString() || '');
    setUrl(gift.url || '');
    setNotes(gift.notes || '');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this gift idea?')) return;
    
    const { error } = await supabase
      .from('gifts')
      .delete()
      .eq('id', id);

    if (!error) {
      await fetchData();
    }
  };

  const handleStatusChange = async (giftId: string, newStatus: string) => {
    const { error } = await supabase
      .from('gifts')
      .update({ status: newStatus })
      .eq('id', giftId);

    if (!error) {
      await fetchData();
    }
  };

  const getStatusInfo = (statusValue: string) => {
    return statusOptions.find((s) => s.value === statusValue) || statusOptions[0];
  };

  const filteredGifts = filter === 'all' 
    ? gifts 
    : gifts.filter((g) => g.status === filter);

  const totalSpent = gifts
    .filter((g) => ['purchased', 'wrapped', 'given'].includes(g.status))
    .reduce((acc, g) => acc + (g.price || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#3D4F5F]">Gift Ideas</h1>
          <p className="text-[#5A6C7D]">Track gifts you&apos;re planning for others</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-[#D64045] text-white px-6 py-2 rounded-full font-medium hover:bg-[#B83539] transition flex items-center gap-2"
        >
          <span>+</span> Add Gift
        </button>
      </div>

      {/* Stats Bar */}
      {gifts.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-wrap gap-6">
          <div>
            <div className="text-2xl font-bold text-[#3D4F5F]">{gifts.length}</div>
            <div className="text-sm text-[#5A6C7D]">Total Ideas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">${totalSpent.toFixed(2)}</div>
            <div className="text-sm text-[#5A6C7D]">Spent</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#F4C430]">
              {gifts.filter((g) => g.status === 'idea').length}
            </div>
            <div className="text-sm text-[#5A6C7D]">Ideas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#D64045]">
              {gifts.filter((g) => ['purchased', 'wrapped', 'given'].includes(g.status)).length}
            </div>
            <div className="text-sm text-[#5A6C7D]">Purchased</div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {gifts.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              filter === 'all' 
                ? 'bg-[#3D4F5F] text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({gifts.length})
          </button>
          {statusOptions.map((opt) => {
            const count = gifts.filter((g) => g.status === opt.value).length;
            if (count === 0) return null;
            return (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  filter === opt.value 
                    ? 'bg-[#3D4F5F] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#3D4F5F] mb-6">
              {editingGift ? 'Edit Gift' : 'Add Gift Idea'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3D4F5F] mb-2">
                  Gift Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
                  placeholder="e.g., AirPods Pro, Cashmere Sweater"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D4F5F] mb-2">
                  For Who?
                </label>
                <select
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
                >
                  <option value="">Select person...</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.avatar_emoji} {p.name}
                    </option>
                  ))}
                </select>
                {people.length === 0 && (
                  <p className="text-sm text-[#5A6C7D] mt-1">
                    No people added yet. <a href="/app/people" className="text-[#D64045] hover:underline">Add someone first</a>.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D4F5F] mb-2">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.slice(0, 4).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStatus(opt.value)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                        status === opt.value 
                          ? opt.color + ' ring-2 ring-offset-2 ring-[#D64045]'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3D4F5F] mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
                    placeholder="49.99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3D4F5F] mb-2">
                    Budget
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
                    placeholder="75.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D4F5F] mb-2">
                  Link
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
                  placeholder="https://amazon.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D4F5F] mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
                  placeholder="Size, color, where to buy..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !name}
                  className="flex-1 bg-[#D64045] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#B83539] transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : (editingGift ? 'Update' : 'Add Gift')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gifts List */}
      {gifts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <div className="text-5xl mb-4">🎁</div>
          <h3 className="text-xl font-semibold text-[#3D4F5F] mb-2">No gift ideas yet</h3>
          <p className="text-[#5A6C7D] mb-6">Start tracking gift ideas for the people in your life.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#D64045] text-white px-6 py-3 rounded-full font-medium hover:bg-[#B83539] transition"
          >
            Add Your First Gift Idea
          </button>
        </div>
      ) : filteredGifts.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
          <p className="text-[#5A6C7D]">No gifts with this status</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGifts.map((gift) => {
            const statusInfo = getStatusInfo(gift.status);
            return (
              <div
                key={gift.id}
                className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {gift.person && (
                      <div className="w-10 h-10 bg-[#FFF3E0] rounded-full flex items-center justify-center text-xl flex-shrink-0">
                        {gift.person.avatar_emoji}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-[#3D4F5F]">{gift.name}</h3>
                        <select
                          value={gift.status}
                          onChange={(e) => handleStatusChange(gift.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${statusInfo.color}`}
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {gift.person && (
                        <p className="text-sm text-[#5A6C7D]">For {gift.person.name}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-sm text-[#5A6C7D] flex-wrap">
                        {gift.price && <span className="font-medium">${gift.price.toFixed(2)}</span>}
                        {gift.budget && <span>Budget: ${gift.budget.toFixed(2)}</span>}
                        {gift.notes && <span className="truncate max-w-xs">• {gift.notes}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {gift.url && (
                      <a
                        href={gift.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-100 rounded-lg transition text-[#D64045]"
                        title="View product"
                      >
                        🔗
                      </a>
                    )}
                    <button
                      onClick={() => handleEdit(gift)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(gift.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition text-gray-500"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
