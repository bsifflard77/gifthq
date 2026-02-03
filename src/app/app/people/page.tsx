'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

interface Person {
  id: string;
  name: string;
  relationship: string | null;
  notes: string | null;
  birthday: string | null;
  avatar_emoji: string;
  created_at: string;
}

export default function PeoplePage() {
  const supabase = createClient();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [notes, setNotes] = useState('');
  const [birthday, setBirthday] = useState('');
  const [emoji, setEmoji] = useState('👤');
  const [saving, setSaving] = useState(false);

  const emojiOptions = ['👤', '👩', '👨', '👧', '👦', '👴', '👵', '👶', '🧑', '👩‍🦰', '👨‍🦰', '👩‍🦳', '👨‍🦳', '🐕', '🐈', '❤️'];
  const relationshipOptions = ['Mom', 'Dad', 'Sister', 'Brother', 'Wife', 'Husband', 'Partner', 'Son', 'Daughter', 'Grandson', 'Granddaughter', 'Grandma', 'Grandpa', 'Aunt', 'Uncle', 'Niece', 'Nephew', 'Cousin', 'Friend', 'Coworker', 'Boss', 'Other'];

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('people')
      .select('*')
      .eq('user_id', user.id)
      .order('name');

    if (!error && data) {
      setPeople(data);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setName('');
    setRelationship('');
    setNotes('');
    setBirthday('');
    setEmoji('👤');
    setEditingPerson(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const personData = {
      user_id: user.id,
      name,
      relationship: relationship || null,
      notes: notes || null,
      birthday: birthday || null,
      avatar_emoji: emoji,
    };

    if (editingPerson) {
      // Update existing
      const { error } = await supabase
        .from('people')
        .update(personData)
        .eq('id', editingPerson.id);

      if (!error) {
        await fetchPeople();
        setShowForm(false);
        resetForm();
      }
    } else {
      // Create new
      const { error } = await supabase
        .from('people')
        .insert(personData);

      if (!error) {
        await fetchPeople();
        setShowForm(false);
        resetForm();
      }
    }
    setSaving(false);
  };

  const handleEdit = (person: Person) => {
    setEditingPerson(person);
    setName(person.name);
    setRelationship(person.relationship || '');
    setNotes(person.notes || '');
    setBirthday(person.birthday || '');
    setEmoji(person.avatar_emoji);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this person? This will also remove their associated gifts.')) return;
    
    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', id);

    if (!error) {
      await fetchPeople();
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#3D4F5F]">People</h1>
          <p className="text-[#5A6C7D]">Who do you buy gifts for?</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-[#D64045] text-white px-6 py-2 rounded-full font-medium hover:bg-[#B83539] transition flex items-center gap-2"
        >
          <span>+</span> Add Person
        </button>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#3D4F5F] mb-6">
              {editingPerson ? 'Edit Person' : 'Add New Person'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Emoji Picker */}
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
                      className={`w-10 h-10 text-xl rounded-lg border-2 transition ${
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
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
                  placeholder="e.g., Mom, John Smith"
                />
              </div>

              {/* Relationship */}
              <div>
                <label className="block text-sm font-medium text-[#3D4F5F] mb-2">
                  Relationship
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
                >
                  <option value="">Select...</option>
                  {relationshipOptions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Birthday */}
              <div>
                <label className="block text-sm font-medium text-[#3D4F5F] mb-2">
                  Birthday
                </label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-[#3D4F5F] mb-2">
                  Notes (interests, sizes, etc.)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
                  placeholder="e.g., Likes gardening, wears size L, favorite color is blue..."
                />
              </div>

              {/* Buttons */}
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
                  {saving ? 'Saving...' : (editingPerson ? 'Update' : 'Add Person')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* People Grid */}
      {people.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <div className="text-5xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-[#3D4F5F] mb-2">No people yet</h3>
          <p className="text-[#5A6C7D] mb-6">Add the people you buy gifts for — family, friends, coworkers.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#D64045] text-white px-6 py-3 rounded-full font-medium hover:bg-[#B83539] transition"
          >
            Add Your First Person
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map((person) => (
            <div
              key={person.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#FFF3E0] rounded-full flex items-center justify-center text-2xl">
                    {person.avatar_emoji}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#3D4F5F]">{person.name}</h3>
                    {person.relationship && (
                      <p className="text-sm text-[#5A6C7D]">{person.relationship}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(person)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(person.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition text-gray-500"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              {person.birthday && (
                <div className="mt-3 text-sm text-[#5A6C7D] flex items-center gap-2">
                  🎂 {new Date(person.birthday + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              )}
              
              {person.notes && (
                <div className="mt-2 text-sm text-[#5A6C7D] line-clamp-2">
                  {person.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
