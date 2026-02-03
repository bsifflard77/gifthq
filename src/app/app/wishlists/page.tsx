'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

interface Wishlist {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  share_code: string | null;
  created_at: string;
  items?: WishlistItem[];
}

interface WishlistItem {
  id: string;
  name: string;
  url: string | null;
  price: number | null;
  priority: number;
  notes: string | null;
  image_url: string | null;
  is_claimed: boolean;
  created_at: string;
}

export default function WishlistsPage() {
  const supabase = createClient();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showListForm, setShowListForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [selectedList, setSelectedList] = useState<Wishlist | null>(null);
  const [editingList, setEditingList] = useState<Wishlist | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareList, setShareList] = useState<Wishlist | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // List form state
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  
  // Item form state
  const [itemName, setItemName] = useState('');
  const [itemUrl, setItemUrl] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemPriority, setItemPriority] = useState(2);
  const [itemNotes, setItemNotes] = useState('');
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWishlists();
  }, []);

  const fetchWishlists = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        items:wishlist_items(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setWishlists(data);
    }
    setLoading(false);
  };

  const generateShareCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const resetListForm = () => {
    setListName('');
    setListDescription('');
    setIsPublic(false);
    setEditingList(null);
  };

  const resetItemForm = () => {
    setItemName('');
    setItemUrl('');
    setItemPrice('');
    setItemPriority(2);
    setItemNotes('');
  };

  const handleSubmitList = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const listData = {
      user_id: user.id,
      name: listName,
      description: listDescription || null,
      is_public: isPublic,
      share_code: isPublic ? generateShareCode() : null,
    };

    if (editingList) {
      // Keep existing share_code if already public
      if (isPublic && editingList.share_code) {
        listData.share_code = editingList.share_code;
      }
      
      const { error } = await supabase
        .from('wishlists')
        .update(listData)
        .eq('id', editingList.id);

      if (!error) {
        await fetchWishlists();
        setShowListForm(false);
        resetListForm();
      }
    } else {
      const { error } = await supabase
        .from('wishlists')
        .insert(listData);

      if (!error) {
        await fetchWishlists();
        setShowListForm(false);
        resetListForm();
      }
    }
    setSaving(false);
  };

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedList) return;
    setSaving(true);

    const { error } = await supabase
      .from('wishlist_items')
      .insert({
        wishlist_id: selectedList.id,
        name: itemName,
        url: itemUrl || null,
        price: itemPrice ? parseFloat(itemPrice) : null,
        priority: itemPriority,
        notes: itemNotes || null,
      });

    if (!error) {
      await fetchWishlists();
      setShowItemForm(false);
      resetItemForm();
    }
    setSaving(false);
  };

  const handleDeleteList = async (id: string) => {
    if (!confirm('Delete this wishlist and all its items?')) return;
    
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('id', id);

    if (!error) {
      await fetchWishlists();
      if (selectedList?.id === id) {
        setSelectedList(null);
      }
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Delete this item?')) return;
    
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('id', itemId);

    if (!error) {
      await fetchWishlists();
    }
  };

  const getShareUrl = (code: string) => {
    return `${window.location.origin}/wishlist/${code}`;
  };

  const copyShareLink = async (code: string) => {
    try {
      await navigator.clipboard.writeText(getShareUrl(code));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = getShareUrl(code);
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openShareModal = async (list: Wishlist) => {
    setShareList(list);
    setQrDataUrl(null);
    setShowShareModal(true);
    
    if (list.share_code) {
      try {
        const QRCode = (await import('qrcode')).default;
        const url = await QRCode.toDataURL(getShareUrl(list.share_code), {
          width: 250,
          margin: 2,
          color: { dark: '#3D4F5F', light: '#FFFFFF' },
        });
        setQrDataUrl(url);
      } catch {
        // QR generation failed
      }
    }
  };

  const shareNative = async (list: Wishlist) => {
    if (navigator.share && list.share_code) {
      try {
        await navigator.share({
          title: `${list.name} - My Wishlist`,
          text: `Check out my wishlist on GiftHQ! Claim items so nobody buys duplicates.`,
          url: getShareUrl(list.share_code),
        });
      } catch {
        // User cancelled
      }
    }
  };

  const getPriorityLabel = (p: number) => {
    switch (p) {
      case 1: return { label: 'High', color: 'bg-red-100 text-red-700' };
      case 2: return { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' };
      case 3: return { label: 'Low', color: 'bg-gray-100 text-gray-700' };
      default: return { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' };
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
          <h1 className="text-2xl font-bold text-[#3D4F5F]">My Wishlists</h1>
          <p className="text-[#5A6C7D]">Create and share your wish lists</p>
        </div>
        <button
          onClick={() => { resetListForm(); setShowListForm(true); }}
          className="bg-[#D64045] text-white px-6 py-2 rounded-full font-medium hover:bg-[#B83539] transition flex items-center gap-2"
        >
          <span>+</span> New Wishlist
        </button>
      </div>

      {/* List Form Modal */}
      {showListForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-[#3D4F5F] mb-6">
              {editingList ? 'Edit Wishlist' : 'Create New Wishlist'}
            </h2>
            
            <form onSubmit={handleSubmitList} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3D4F5F] mb-2">List Name *</label>
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
                  placeholder="e.g., Christmas 2026, Birthday Wishes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D4F5F] mb-2">Description</label>
                <textarea
                  value={listDescription}
                  onChange={(e) => setListDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
                  placeholder="Optional description..."
                />
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-[#D64045] focus:ring-[#F4C430]"
                  />
                  <label htmlFor="isPublic" className="text-sm text-[#3D4F5F] font-medium">
                    Make shareable
                  </label>
                </div>
                <p className="text-xs text-blue-700 mt-2 ml-8">
                  Generate a link for family/friends. They can view your list and claim items to avoid duplicate gifts!
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowListForm(false); resetListForm(); }}
                  className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !listName}
                  className="flex-1 bg-[#D64045] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#B83539] transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : (editingList ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Form Modal */}
      {showItemForm && selectedList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#3D4F5F] mb-6">
              Add Item to &quot;{selectedList.name}&quot;
            </h2>
            
            <form onSubmit={handleSubmitItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3D4F5F] mb-2">Item Name *</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
                  placeholder="e.g., AirPods Pro, Blue Sweater"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D4F5F] mb-2">Link (optional)</label>
                <input
                  type="url"
                  value={itemUrl}
                  onChange={(e) => setItemUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
                  placeholder="https://amazon.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D4F5F] mb-2">Price (optional)</label>
                <input
                  type="number"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
                  placeholder="49.99"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D4F5F] mb-2">Priority</label>
                <div className="flex gap-2">
                  {[1, 2, 3].map((p) => {
                    const { label, color } = getPriorityLabel(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setItemPriority(p)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                          itemPriority === p 
                            ? color + ' ring-2 ring-offset-2 ring-[#D64045]' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D4F5F] mb-2">Notes (size, color, etc.)</label>
                <textarea
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
                  placeholder="Size M, Navy Blue..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowItemForm(false); resetItemForm(); }}
                  className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !itemName}
                  className="flex-1 bg-[#D64045] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#B83539] transition disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && shareList && shareList.share_code && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <h2 className="text-xl font-bold text-[#3D4F5F] mb-2">Share &quot;{shareList.name}&quot;</h2>
            <p className="text-sm text-[#5A6C7D] mb-4">
              Anyone with this link can view your wishlist and claim items!
            </p>
            
            {qrDataUrl && (
              <div className="text-center mb-4">
                <img src={qrDataUrl} alt="QR Code" className="mx-auto rounded-xl" />
                <p className="text-xs text-[#5A6C7D] mt-2">Scan or screenshot this QR code</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm break-all">
              <code className="text-[#3D4F5F]">{getShareUrl(shareList.share_code)}</code>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <button
                onClick={() => copyShareLink(shareList.share_code!)}
                className="w-full px-4 py-3 bg-[#3D4F5F] text-white rounded-xl font-medium hover:bg-[#4A5D6E] transition"
              >
                {copied ? '✓ Copied!' : '📋 Copy Link'}
              </button>
              {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                <button
                  onClick={() => shareNative(shareList)}
                  className="w-full px-4 py-3 bg-[#D64045] text-white rounded-xl font-medium hover:bg-[#B83539] transition"
                >
                  📤 Share via...
                </button>
              )}
              <a
                href={getShareUrl(shareList.share_code)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-3 bg-gray-100 text-[#3D4F5F] rounded-xl font-medium hover:bg-gray-200 transition text-center"
              >
                👁️ Preview Public View
              </a>
            </div>

            <button
              onClick={() => { setShowShareModal(false); setShareList(null); }}
              className="w-full text-[#5A6C7D] text-sm hover:text-[#3D4F5F]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Wishlists */}
      {wishlists.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-[#3D4F5F] mb-2">No wishlists yet</h3>
          <p className="text-[#5A6C7D] mb-6">Create a wishlist and share it with family so they know what you want!</p>
          <button
            onClick={() => setShowListForm(true)}
            className="bg-[#D64045] text-white px-6 py-3 rounded-full font-medium hover:bg-[#B83539] transition"
          >
            Create Your First Wishlist
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {wishlists.map((list) => {
            const totalPrice = list.items?.reduce((sum, item) => sum + (item.price || 0), 0) || 0;
            const claimedCount = list.items?.filter(i => i.is_claimed).length || 0;
            
            return (
              <div key={list.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* List Header */}
                <div className="p-5 flex items-center justify-between border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#3D4F5F]">{list.name}</h3>
                      {list.is_public && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                          Shareable
                        </span>
                      )}
                    </div>
                    {list.description && (
                      <p className="text-sm text-[#5A6C7D]">{list.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-sm text-[#5A6C7D]">
                      <span>{list.items?.length || 0} items</span>
                      {totalPrice > 0 && <span>• ${totalPrice.toFixed(0)} total</span>}
                      {claimedCount > 0 && (
                        <span className="text-green-600">• {claimedCount} claimed</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {list.is_public && list.share_code && (
                      <button
                        onClick={() => openShareModal(list)}
                        className="px-3 py-1.5 bg-[#3D4F5F] text-white text-sm rounded-lg hover:bg-[#4A5D6E] transition"
                      >
                        📤 Share
                      </button>
                    )}
                    <button
                      onClick={() => { setSelectedList(list); setShowItemForm(true); }}
                      className="px-3 py-1.5 bg-[#F4C430] text-[#3D4F5F] text-sm rounded-lg hover:bg-[#F7D154] transition font-medium"
                    >
                      + Add Item
                    </button>
                    <button
                      onClick={() => handleDeleteList(list.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition text-gray-500"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Items */}
                {list.items && list.items.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {list.items.map((item) => {
                      const { label, color } = getPriorityLabel(item.priority);
                      return (
                        <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-[#3D4F5F]">{item.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${color}`}>{label}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-[#5A6C7D]">
                              {item.price && <span>${item.price.toFixed(2)}</span>}
                              {item.notes && <span>• {item.notes}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.url && (
                              <a href={item.url} target="_blank" rel="noopener noreferrer"
                                className="text-[#D64045] hover:underline text-sm">
                                View →
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 hover:bg-red-50 rounded transition text-gray-400"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center text-[#5A6C7D]">
                    No items yet — click &quot;Add Item&quot; to get started!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
