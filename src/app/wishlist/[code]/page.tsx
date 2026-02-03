'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface WishlistItem {
  id: string;
  name: string;
  url: string | null;
  price: number | null;
  priority: number;
  notes: string | null;
  image_url: string | null;
  is_claimed: boolean;
  claimed_by: string | null;
  claimed_by_name: string | null;
  claimed_at: string | null;
}

interface Wishlist {
  id: string;
  name: string;
  description: string | null;
  share_code: string;
  user_id: string;
  user: {
    name: string | null;
    avatar_emoji: string | null;
    birthday: string | null;
    interests: string | null;
  } | null;
}

export default function PublicWishlistPage() {
  const params = useParams();
  const code = params.code as string;
  const supabase = createClient();
  
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  
  // Claim modal
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [claimerName, setClaimerName] = useState('');
  const [claiming, setClaiming] = useState(false);
  
  // Share modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchWishlist();
    checkUser();
  }, [code]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      // Restore claimer name from localStorage
      const saved = localStorage.getItem('gifthq_claimer_name');
      if (saved) setClaimerName(saved);
    }
  };

  const fetchWishlist = async () => {
    const { data: wishlistData, error: wishlistError } = await supabase
      .from('wishlists')
      .select(`
        id,
        name,
        description,
        share_code,
        user_id,
        user:users(name, avatar_emoji, birthday, interests)
      `)
      .eq('share_code', code)
      .eq('is_public', true)
      .single();

    if (wishlistError || !wishlistData) {
      setError('Wishlist not found or is private');
      setLoading(false);
      return;
    }

    const wl = wishlistData as unknown as Wishlist;
    setWishlist(wl);

    // Check if current user is the owner
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.id === wl.user_id) {
      setIsOwner(true);
    }

    const { data: itemsData } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('wishlist_id', wishlistData.id)
      .order('priority', { ascending: true });

    setItems(itemsData || []);
    setLoading(false);
  };

  const handleClaimClick = (item: WishlistItem) => {
    if (item.is_claimed) return;
    setSelectedItem(item);
    setShowClaimModal(true);
  };

  const handleClaim = async () => {
    if (!selectedItem) return;
    setClaiming(true);

    // Save claimer name for future use
    if (claimerName.trim()) {
      localStorage.setItem('gifthq_claimer_name', claimerName.trim());
    }

    const updateData: Record<string, unknown> = {
      is_claimed: true,
      claimed_at: new Date().toISOString(),
      claimed_by_name: claimerName.trim() || 'Someone',
    };

    // If user is logged in, also set claimed_by
    if (currentUserId) {
      updateData.claimed_by = currentUserId;
    }

    const { error } = await supabase
      .from('wishlist_items')
      .update(updateData)
      .eq('id', selectedItem.id);

    if (!error) {
      setItems(items.map(item => 
        item.id === selectedItem.id 
          ? { ...item, is_claimed: true, claimed_by_name: claimerName.trim() || 'Someone', claimed_at: new Date().toISOString() }
          : item
      ));
      setShowClaimModal(false);
      setSelectedItem(null);
    }
    setClaiming(false);
  };

  const handleUnclaim = async (itemId: string) => {
    if (!confirm('Unclaim this item? Others will be able to claim it again.')) return;
    
    const { error } = await supabase
      .from('wishlist_items')
      .update({
        is_claimed: false,
        claimed_by: null,
        claimed_by_name: null,
        claimed_at: null,
      })
      .eq('id', itemId);

    if (!error) {
      setItems(items.map(item => 
        item.id === itemId 
          ? { ...item, is_claimed: false, claimed_by: null, claimed_by_name: null, claimed_at: null }
          : item
      ));
    }
  };

  const getPriorityLabel = (p: number) => {
    switch (p) {
      case 1: return { label: '❤️ Really want', color: 'bg-red-100 text-red-700' };
      case 2: return { label: '👍 Would like', color: 'bg-yellow-100 text-yellow-700' };
      case 3: return { label: '🤷 Nice to have', color: 'bg-gray-100 text-gray-600' };
      default: return { label: '👍 Would like', color: 'bg-yellow-100 text-yellow-700' };
    }
  };

  const formatBirthday = (birthday: string) => {
    const date = new Date(birthday + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/wishlist/${code}`;
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = getShareUrl();
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateQR = async () => {
    try {
      const QRCode = (await import('qrcode')).default;
      const url = await QRCode.toDataURL(getShareUrl(), {
        width: 300,
        margin: 2,
        color: { dark: '#3D4F5F', light: '#FFFFFF' },
      });
      setQrDataUrl(url);
      setShowShareModal(true);
    } catch (err) {
      console.error('QR generation failed:', err);
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${wishlist?.name} - Wishlist on GiftHQ`,
          text: `Check out ${wishlist?.user?.name || 'my'} wishlist and claim a gift!`,
          url: getShareUrl(),
        });
      } catch {
        // User cancelled share
      }
    }
  };

  const totalPrice = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const claimedCount = items.filter(i => i.is_claimed).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-[#D64045] mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (error || !wishlist) {
    return (
      <div className="min-h-screen bg-[#FFF9F5] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-5xl mb-4">🎁</div>
          <h1 className="text-2xl font-bold text-[#3D4F5F] mb-2">Wishlist Not Found</h1>
          <p className="text-[#5A6C7D] mb-6">This wishlist doesn&apos;t exist or is private.</p>
          <Link href="/" className="text-[#D64045] font-semibold hover:underline">
            Go to GiftHQ →
          </Link>
        </div>
      </div>
    );
  }

  const unclaimedItems = items.filter(i => !i.is_claimed);
  const claimedItems = items.filter(i => i.is_claimed);

  return (
    <div className="min-h-screen bg-[#FFF9F5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1">
            <img src="/gifthq-logo-v3.jpg" alt="GiftHQ" className="h-8 w-8" />
            <span className="text-xl font-bold">
              <span className="text-[#3D4F5F]">Gift</span>
              <span className="text-[#F4C430]">HQ</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={copyShareLink}
              className="px-3 py-1.5 bg-[#3D4F5F] text-white text-sm rounded-lg hover:bg-[#4A5D6E] transition"
            >
              {copied ? '✓ Copied!' : '🔗 Share'}
            </button>
            <button
              onClick={generateQR}
              className="px-3 py-1.5 bg-gray-100 text-[#3D4F5F] text-sm rounded-lg hover:bg-gray-200 transition"
            >
              📱 QR
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Owner Banner */}
        {isOwner && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>👋 This is your wishlist!</strong> You&apos;re seeing the public view. 
              Claimed items are hidden from you to keep surprises! 🎁
            </p>
          </div>
        )}

        {/* Wishlist Header */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-[#FFF3E0] rounded-full flex items-center justify-center text-3xl">
              {wishlist.user?.avatar_emoji || '🎁'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[#3D4F5F]">{wishlist.name}</h1>
              {wishlist.user?.name && (
                <p className="text-[#5A6C7D]">by {wishlist.user.name}</p>
              )}
              {wishlist.description && (
                <p className="text-[#5A6C7D] mt-2">{wishlist.description}</p>
              )}
              {wishlist.user?.birthday && (
                <p className="text-[#D64045] font-medium mt-2">
                  🎂 Birthday: {formatBirthday(wishlist.user.birthday)}
                </p>
              )}
            </div>
          </div>

          {wishlist.user?.interests && (
            <div className="mt-4 p-4 bg-[#FFF9F0] rounded-xl">
              <p className="text-sm font-medium text-[#3D4F5F] mb-1">💡 Interests & Preferences</p>
              <p className="text-sm text-[#5A6C7D]">{wishlist.user.interests}</p>
            </div>
          )}

          {/* Stats */}
          {items.length > 0 && (
            <div className="flex gap-4 mt-4 text-sm">
              <div className="bg-gray-50 rounded-lg px-3 py-2">
                <span className="font-semibold text-[#3D4F5F]">{items.length}</span>
                <span className="text-[#5A6C7D] ml-1">items</span>
              </div>
              {!isOwner && (
                <div className="bg-green-50 rounded-lg px-3 py-2">
                  <span className="font-semibold text-green-700">{claimedCount}</span>
                  <span className="text-green-600 ml-1">claimed</span>
                </div>
              )}
              {totalPrice > 0 && (
                <div className="bg-blue-50 rounded-lg px-3 py-2">
                  <span className="font-semibold text-blue-700">${totalPrice.toFixed(0)}</span>
                  <span className="text-blue-600 ml-1">total</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions - only show to non-owners */}
        {!isOwner && items.length > 0 && (
          <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
            <p className="text-sm text-blue-800">
              <strong>How it works:</strong> Click &quot;I&apos;ll get this!&quot; to claim an item so others know you&apos;re buying it. 
              The wishlist owner won&apos;t see who claimed what — it&apos;s a surprise! 🎁
            </p>
          </div>
        )}

        {/* Items */}
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-[#5A6C7D]">No items on this wishlist yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* For owner: show all items without claim info */}
            {isOwner ? (
              <div>
                <h2 className="text-lg font-semibold text-[#3D4F5F] mb-3">
                  📝 Your Wishlist Items ({items.length})
                </h2>
                <div className="space-y-3">
                  {items.map((item) => {
                    const { label, color } = getPriorityLabel(item.priority);
                    return (
                      <div key={item.id} className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-[#3D4F5F]">{item.name}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${color}`}>{label}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-[#5A6C7D]">
                              {item.price && <span className="font-medium text-[#3D4F5F]">${item.price.toFixed(2)}</span>}
                              {item.notes && <span>• {item.notes}</span>}
                            </div>
                            {item.url && (
                              <a href={item.url} target="_blank" rel="noopener noreferrer"
                                className="inline-block mt-2 text-sm text-[#D64045] hover:underline">
                                View product →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                {/* Unclaimed Items */}
                {unclaimedItems.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-[#3D4F5F] mb-3">
                      🎁 Available to Claim ({unclaimedItems.length})
                    </h2>
                    <div className="space-y-3">
                      {unclaimedItems.map((item) => {
                        const { label, color } = getPriorityLabel(item.priority);
                        return (
                          <div key={item.id} className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-[#3D4F5F]">{item.name}</h3>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${color}`}>{label}</span>
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-sm text-[#5A6C7D]">
                                  {item.price && <span className="font-medium text-[#3D4F5F]">${item.price.toFixed(2)}</span>}
                                  {item.notes && <span>• {item.notes}</span>}
                                </div>
                                {item.url && (
                                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                                    className="inline-block mt-2 text-sm text-[#D64045] hover:underline">
                                    View product →
                                  </a>
                                )}
                              </div>
                              <button
                                onClick={() => handleClaimClick(item)}
                                className="px-4 py-2 bg-[#D64045] text-white rounded-lg font-medium hover:bg-[#B83539] transition text-sm whitespace-nowrap"
                              >
                                I&apos;ll get this!
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Claimed Items */}
                {claimedItems.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-[#3D4F5F] mb-3">
                      ✅ Already Claimed ({claimedItems.length})
                    </h2>
                    <div className="space-y-3">
                      {claimedItems.map((item) => (
                        <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-medium text-[#3D4F5F]">{item.name}</h3>
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                  ✓ Claimed by {item.claimed_by_name || 'Someone'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-sm text-[#5A6C7D]">
                                {item.price && <span>${item.price.toFixed(2)}</span>}
                                {item.claimed_at && (
                                  <span className="text-xs">
                                    {new Date(item.claimed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* Only show unclaim to the person who claimed it */}
                            {(item.claimed_by === currentUserId || 
                              (!item.claimed_by && item.claimed_by_name === localStorage.getItem('gifthq_claimer_name'))) && (
                              <button
                                onClick={() => handleUnclaim(item.id)}
                                className="text-xs text-gray-500 hover:text-red-500 px-2 py-1"
                              >
                                Unclaim
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All claimed celebration */}
                {unclaimedItems.length === 0 && claimedItems.length > 0 && (
                  <div className="bg-green-50 rounded-2xl p-6 text-center border border-green-200">
                    <div className="text-4xl mb-3">🎉</div>
                    <h3 className="text-lg font-semibold text-green-800 mb-1">All Items Claimed!</h3>
                    <p className="text-green-700 text-sm">
                      Every item on this wishlist has been claimed. {wishlist.user?.name || 'They'}&apos;re going to love it!
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-[#5A6C7D] mb-3">Want to create your own wishlist?</p>
          <Link
            href="/auth/signup"
            className="inline-block px-6 py-3 bg-[#3D4F5F] text-white rounded-full font-medium hover:bg-[#4A5D6E] transition"
          >
            Create Free Account
          </Link>
        </div>
      </main>

      {/* Claim Modal */}
      {showClaimModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-[#3D4F5F] mb-2">
              Claim &quot;{selectedItem.name}&quot;?
            </h2>
            <p className="text-[#5A6C7D] mb-4">
              Let others know you&apos;re getting this gift. The wishlist owner won&apos;t see who claimed it! 🎁
            </p>
            
            {selectedItem.price && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                <span className="text-[#5A6C7D]">Price: </span>
                <span className="font-bold text-[#3D4F5F]">${selectedItem.price.toFixed(2)}</span>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#3D4F5F] mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={claimerName}
                onChange={(e) => setClaimerName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
                placeholder="e.g., Aunt Susan"
              />
              <p className="text-xs text-gray-500 mt-1">
                This helps other gift-buyers know who&apos;s getting what. The wishlist owner won&apos;t see this.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowClaimModal(false); setSelectedItem(null); }}
                className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleClaim}
                disabled={claiming}
                className="flex-1 bg-[#D64045] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#B83539] transition disabled:opacity-50"
              >
                {claiming ? 'Claiming...' : "Yes, I'll get it!"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share/QR Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center">
            <h2 className="text-xl font-bold text-[#3D4F5F] mb-4">Share This Wishlist</h2>
            
            {qrDataUrl && (
              <div className="mb-4">
                <img src={qrDataUrl} alt="QR Code" className="mx-auto rounded-xl" />
                <p className="text-sm text-[#5A6C7D] mt-2">Scan to open wishlist</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm break-all text-left">
              <code className="text-[#3D4F5F]">{getShareUrl()}</code>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <button
                onClick={copyShareLink}
                className="w-full px-4 py-3 bg-[#3D4F5F] text-white rounded-xl font-medium hover:bg-[#4A5D6E] transition"
              >
                {copied ? '✓ Copied!' : '📋 Copy Link'}
              </button>
              {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                <button
                  onClick={shareNative}
                  className="w-full px-4 py-3 bg-[#D64045] text-white rounded-xl font-medium hover:bg-[#B83539] transition"
                >
                  📤 Share via...
                </button>
              )}
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="text-[#5A6C7D] text-sm hover:text-[#3D4F5F]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
