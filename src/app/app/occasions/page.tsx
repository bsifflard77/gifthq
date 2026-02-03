'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

interface Occasion {
  id: string;
  name: string;
  type: string;
  date: string | null;
  budget_total: number | null;
  notes: string | null;
  is_recurring: boolean;
  created_at: string;
  gifts?: Array<{
    id: string;
    name: string;
    status: string;
    price: number | null;
    person: { name: string; avatar_emoji: string } | null;
  }>;
}

interface Reminder {
  id: string;
  occasion_id: string;
  remind_days_before: number;
  is_enabled: boolean;
}

export default function OccasionsPage() {
  const supabase = createClient();
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [reminders, setReminders] = useState<Record<string, Reminder>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOccasion, setEditingOccasion] = useState<Occasion | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderOccasion, setReminderOccasion] = useState<Occasion | null>(null);
  const [reminderDays, setReminderDays] = useState(14);
  const [reminderSaving, setReminderSaving] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState('christmas');
  const [date, setDate] = useState('');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [autoReminder, setAutoReminder] = useState(true);
  const [saving, setSaving] = useState(false);

  const typeOptions = [
    { value: 'christmas', label: '🎄 Christmas', emoji: '🎄' },
    { value: 'birthday', label: '🎂 Birthday', emoji: '🎂' },
    { value: 'wedding', label: '💒 Wedding', emoji: '💒' },
    { value: 'baby_shower', label: '👶 Baby Shower', emoji: '👶' },
    { value: 'valentines', label: "💝 Valentine's Day", emoji: '💝' },
    { value: 'mothers_day', label: "👩‍👧 Mother's Day", emoji: '👩‍👧' },
    { value: 'fathers_day', label: "👨‍👦 Father's Day", emoji: '👨‍👦' },
    { value: 'graduation', label: '🎓 Graduation', emoji: '🎓' },
    { value: 'anniversary', label: '💍 Anniversary', emoji: '💍' },
    { value: 'other', label: '🎁 Other', emoji: '🎁' },
  ];

  const reminderOptions = [
    { days: 7, label: '1 week before' },
    { days: 14, label: '2 weeks before' },
    { days: 21, label: '3 weeks before' },
    { days: 30, label: '1 month before' },
    { days: 45, label: '6 weeks before' },
    { days: 60, label: '2 months before' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [occasionsRes, remindersRes] = await Promise.all([
      supabase
        .from('occasions')
        .select(`
          *,
          gifts(id, name, status, price, person:people(name, avatar_emoji))
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: true, nullsFirst: false }),
      supabase
        .from('occasion_reminders')
        .select('*')
        .eq('user_id', user.id),
    ]);

    if (occasionsRes.data) setOccasions(occasionsRes.data);
    
    // Index reminders by occasion_id
    if (remindersRes.data) {
      const reminderMap: Record<string, Reminder> = {};
      remindersRes.data.forEach((r: Reminder) => {
        reminderMap[r.occasion_id] = r;
      });
      setReminders(reminderMap);
    }
    
    setLoading(false);
  };

  const resetForm = () => {
    setName('');
    setType('christmas');
    setDate('');
    setBudget('');
    setNotes('');
    setIsRecurring(false);
    setAutoReminder(true);
    setEditingOccasion(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const occasionData = {
      user_id: user.id,
      name,
      type,
      date: date || null,
      budget_total: budget ? parseFloat(budget) : null,
      notes: notes || null,
      is_recurring: isRecurring,
    };

    let occasionId: string | null = null;

    if (editingOccasion) {
      const { error } = await supabase
        .from('occasions')
        .update(occasionData)
        .eq('id', editingOccasion.id);

      if (!error) occasionId = editingOccasion.id;
    } else {
      const { data, error } = await supabase
        .from('occasions')
        .insert(occasionData)
        .select('id')
        .single();

      if (!error && data) occasionId = data.id;
    }

    // Create auto-reminder if enabled and has a date
    if (occasionId && autoReminder && date && !editingOccasion) {
      await supabase.from('occasion_reminders').insert({
        user_id: user.id,
        occasion_id: occasionId,
        remind_days_before: 14,
        is_enabled: true,
      });
    }

    await fetchData();
    setShowForm(false);
    resetForm();
    setSaving(false);
  };

  const handleEdit = (occasion: Occasion) => {
    setEditingOccasion(occasion);
    setName(occasion.name);
    setType(occasion.type);
    setDate(occasion.date || '');
    setBudget(occasion.budget_total?.toString() || '');
    setNotes(occasion.notes || '');
    setIsRecurring(occasion.is_recurring);
    setAutoReminder(false);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this occasion? Gifts linked to it will be unlinked but not deleted.')) return;
    
    await supabase.from('occasion_reminders').delete().eq('occasion_id', id);
    const { error } = await supabase.from('occasions').delete().eq('id', id);
    if (!error) await fetchData();
  };

  const openReminderModal = (occasion: Occasion) => {
    setReminderOccasion(occasion);
    const existing = reminders[occasion.id];
    setReminderDays(existing?.remind_days_before || 14);
    setShowReminderModal(true);
  };

  const handleSaveReminder = async () => {
    if (!reminderOccasion) return;
    setReminderSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const existing = reminders[reminderOccasion.id];

    if (existing) {
      await supabase
        .from('occasion_reminders')
        .update({ remind_days_before: reminderDays, is_enabled: true })
        .eq('id', existing.id);
    } else {
      await supabase.from('occasion_reminders').insert({
        user_id: user.id,
        occasion_id: reminderOccasion.id,
        remind_days_before: reminderDays,
        is_enabled: true,
      });
    }

    await fetchData();
    setShowReminderModal(false);
    setReminderOccasion(null);
    setReminderSaving(false);
  };

  const handleDeleteReminder = async () => {
    if (!reminderOccasion) return;
    const existing = reminders[reminderOccasion.id];
    if (existing) {
      await supabase.from('occasion_reminders').delete().eq('id', existing.id);
      await fetchData();
    }
    setShowReminderModal(false);
    setReminderOccasion(null);
  };

  const getTypeInfo = (typeValue: string) => {
    return typeOptions.find(t => t.value === typeValue) || typeOptions[typeOptions.length - 1];
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateStr + 'T00:00:00');
    return Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculateSpent = (gifts: Occasion['gifts']) => {
    if (!gifts) return 0;
    return gifts
      .filter(g => ['purchased', 'wrapped', 'given'].includes(g.status))
      .reduce((sum, g) => sum + (g.price || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const upcomingOccasions = occasions.filter(o => !o.date || o.date >= today);
  const pastOccasions = occasions.filter(o => o.date && o.date < today);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#3D4F5F]">Occasions</h1>
          <p className="text-[#5A6C7D]">Organize gifts by event</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-[#D64045] text-white px-6 py-2 rounded-full font-medium hover:bg-[#B83539] transition flex items-center gap-2"
        >
          <span>+</span> New Occasion
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#3D4F5F] mb-6">
              {editingOccasion ? 'Edit Occasion' : 'Create New Occasion'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3D4F5F] mb-2">Occasion Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
                  placeholder="e.g., Christmas 2026, Mom's 70th Birthday"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D4F5F] mb-2">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {typeOptions.slice(0, 6).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setType(opt.value)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition text-left ${
                        type === opt.value 
                          ? 'bg-[#D64045] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full mt-2 px-4 py-2 border border-gray-200 rounded-xl text-sm"
                >
                  {typeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D4F5F] mb-2">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D4F5F] mb-2">Total Budget</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
                  placeholder="500.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D4F5F] mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
                  placeholder="Any notes about this occasion..."
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#D64045] focus:ring-[#F4C430]"
                />
                <label htmlFor="isRecurring" className="text-sm text-[#3D4F5F]">
                  Recurring annually (e.g., Christmas, birthdays)
                </label>
              </div>

              {/* Auto-reminder option (only for new occasions with dates) */}
              {!editingOccasion && date && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="autoReminder"
                      checked={autoReminder}
                      onChange={(e) => setAutoReminder(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-[#D64045] focus:ring-[#F4C430]"
                    />
                    <label htmlFor="autoReminder" className="text-sm text-[#3D4F5F] font-medium">
                      🔔 Remind me 2 weeks before
                    </label>
                  </div>
                  <p className="text-xs text-blue-700 mt-2 ml-8">
                    Get a notification to start shopping!
                  </p>
                </div>
              )}

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
                  {saving ? 'Saving...' : (editingOccasion ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && reminderOccasion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <h2 className="text-xl font-bold text-[#3D4F5F] mb-2">
              🔔 Set Reminder
            </h2>
            <p className="text-sm text-[#5A6C7D] mb-4">
              Get notified before &quot;{reminderOccasion.name}&quot;
            </p>

            <div className="space-y-2 mb-6">
              {reminderOptions.map((opt) => (
                <button
                  key={opt.days}
                  onClick={() => setReminderDays(opt.days)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition ${
                    reminderDays === opt.days
                      ? 'bg-[#D64045] text-white'
                      : 'bg-gray-50 text-[#3D4F5F] hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              {reminders[reminderOccasion.id] && (
                <button
                  onClick={handleDeleteReminder}
                  className="px-4 py-3 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition text-sm"
                >
                  Remove
                </button>
              )}
              <button
                onClick={() => { setShowReminderModal(false); setReminderOccasion(null); }}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReminder}
                disabled={reminderSaving}
                className="flex-1 bg-[#D64045] text-white px-4 py-3 rounded-xl font-medium hover:bg-[#B83539] transition disabled:opacity-50"
              >
                {reminderSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Occasions List */}
      {occasions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <div className="text-5xl mb-4">🎄</div>
          <h3 className="text-xl font-semibold text-[#3D4F5F] mb-2">No occasions yet</h3>
          <p className="text-[#5A6C7D] mb-6">
            Create occasions like &quot;Christmas 2026&quot; or &quot;Mom&apos;s Birthday&quot; to organize your gift planning.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#D64045] text-white px-6 py-3 rounded-full font-medium hover:bg-[#B83539] transition"
          >
            Create Your First Occasion
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Upcoming */}
          {upcomingOccasions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-[#3D4F5F] mb-3">📅 Upcoming</h2>
              <div className="grid gap-4">
                {upcomingOccasions.map((occasion) => {
                  const typeInfo = getTypeInfo(occasion.type);
                  const spent = calculateSpent(occasion.gifts);
                  const daysUntil = occasion.date ? getDaysUntil(occasion.date) : null;
                  const reminder = reminders[occasion.id];
                  
                  return (
                    <div key={occasion.id} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-[#FFF3E0] rounded-xl flex items-center justify-center text-2xl">
                            {typeInfo.emoji}
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#3D4F5F]">{occasion.name}</h3>
                            <div className="flex items-center gap-3 mt-1 text-sm text-[#5A6C7D] flex-wrap">
                              {occasion.date && <span>{formatDate(occasion.date)}</span>}
                              {daysUntil !== null && daysUntil >= 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  daysUntil <= 7 
                                    ? 'bg-red-100 text-red-700' 
                                    : daysUntil <= 30 
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                                </span>
                              )}
                              {occasion.is_recurring && (
                                <span className="text-[#F4C430]">🔄 Annual</span>
                              )}
                              {reminder && reminder.is_enabled && (
                                <span className="text-blue-600 text-xs">
                                  🔔 {reminder.remind_days_before}d reminder
                                </span>
                              )}
                            </div>
                            {occasion.budget_total && (
                              <div className="mt-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-[#5A6C7D]">Budget:</span>
                                  <span className="font-medium text-[#3D4F5F]">
                                    ${spent.toFixed(0)} / ${occasion.budget_total.toFixed(0)}
                                  </span>
                                  {occasion.budget_total > 0 && (
                                    <span className={`text-xs ${spent > occasion.budget_total ? 'text-red-500' : 'text-green-600'}`}>
                                      ({Math.round((spent / occasion.budget_total) * 100)}%)
                                    </span>
                                  )}
                                </div>
                                <div className="w-40 h-2 bg-gray-200 rounded-full mt-1">
                                  <div 
                                    className={`h-2 rounded-full transition-all ${
                                      spent > occasion.budget_total ? 'bg-red-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min((spent / occasion.budget_total) * 100, 100)}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            {occasion.gifts && occasion.gifts.length > 0 && (
                              <p className="mt-2 text-sm text-[#5A6C7D]">
                                🎁 {occasion.gifts.length} gift{occasion.gifts.length !== 1 ? 's' : ''} planned
                                {occasion.gifts.filter(g => ['purchased', 'wrapped', 'given'].includes(g.status)).length > 0 && (
                                  <span className="text-green-600">
                                    {' '}({occasion.gifts.filter(g => ['purchased', 'wrapped', 'given'].includes(g.status)).length} bought)
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {occasion.date && (
                            <button
                              onClick={() => openReminderModal(occasion)}
                              className={`p-2 hover:bg-blue-50 rounded-lg transition ${
                                reminder ? 'text-blue-600' : 'text-gray-400'
                              }`}
                              title={reminder ? 'Edit reminder' : 'Set reminder'}
                            >
                              🔔
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(occasion)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(occasion.id)}
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
            </div>
          )}

          {/* Past */}
          {pastOccasions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-[#5A6C7D] mb-3">📜 Past Occasions</h2>
              <div className="grid gap-3 opacity-75">
                {pastOccasions.map((occasion) => {
                  const typeInfo = getTypeInfo(occasion.type);
                  const spent = calculateSpent(occasion.gifts);
                  return (
                    <div key={occasion.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{typeInfo.emoji}</span>
                          <div>
                            <h3 className="font-medium text-[#3D4F5F]">{occasion.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-[#5A6C7D]">
                              {occasion.date && <span>{formatDate(occasion.date)}</span>}
                              {spent > 0 && <span>• ${spent.toFixed(0)} spent</span>}
                              {occasion.gifts && occasion.gifts.length > 0 && (
                                <span>• {occasion.gifts.length} gifts</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(occasion.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition text-gray-400"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tip */}
      {occasions.length > 0 && occasions.length < 3 && (
        <div className="bg-[#FFF9F0] rounded-xl p-4 border border-[#F4C430]/20">
          <p className="text-sm text-[#3D4F5F]">
            💡 <strong>Tip:</strong> Set reminders on your occasions so you never forget to start shopping!
          </p>
        </div>
      )}
    </div>
  );
}
