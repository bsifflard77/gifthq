'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

interface DashboardStats {
  peopleCount: number;
  wishlistCount: number;
  wishlistItemCount: number;
  giftCount: number;
  purchasedCount: number;
  totalSpent: number;
  totalBudget: number;
  upcomingBirthdays: Array<{
    id: string;
    name: string;
    avatar_emoji: string;
    birthday: string;
    daysUntil: number;
  }>;
  recentWishlists: Array<{
    id: string;
    name: string;
    itemCount: number;
    is_public: boolean;
    share_code: string | null;
    created_at: string;
  }>;
  occasionReminders: Array<{
    id: string;
    occasion_name: string;
    occasion_type: string;
    occasion_date: string;
    days_until: number;
    remind_days_before: number;
    budget_total: number | null;
    spent: number;
    gift_count: number;
  }>;
  giftsByStatus: Record<string, number>;
  recentActivity: Array<{
    type: string;
    title: string;
    subtitle: string;
    time: string;
    icon: string;
  }>;
}

const STATUS_INFO: Record<string, { label: string; icon: string; color: string }> = {
  idea: { label: 'Ideas', icon: '💡', color: '#F4C430' },
  decided: { label: 'Decided', icon: '✓', color: '#3B82F6' },
  purchased: { label: 'Purchased', icon: '🛒', color: '#22C55E' },
  wrapped: { label: 'Wrapped', icon: '🎀', color: '#A855F7' },
  given: { label: 'Given', icon: '🎁', color: '#EC4899' },
};

export default function DashboardPage() {
  const supabase = createClient();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [dismissedReminders, setDismissedReminders] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchDashboardData();
    // Load dismissed reminders
    const saved = localStorage.getItem('gifthq_dismissed_reminders');
    if (saved) setDismissedReminders(new Set(JSON.parse(saved)));
  }, []);

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUserName(user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'there');

    const [peopleRes, wishlistsRes, giftsRes, occasionsRes, remindersRes] = await Promise.all([
      supabase.from('people').select('*').eq('user_id', user.id),
      supabase.from('wishlists').select('*, items:wishlist_items(id)').eq('user_id', user.id),
      supabase.from('gifts').select('*').eq('user_id', user.id),
      supabase.from('occasions').select('*, gifts(id, name, status, price)').eq('user_id', user.id),
      supabase.from('occasion_reminders').select('*, occasion:occasions(*)').eq('user_id', user.id).eq('is_enabled', true),
    ]);

    const people = peopleRes.data || [];
    const wishlists = wishlistsRes.data || [];
    const gifts = giftsRes.data || [];
    const occasions = occasionsRes.data || [];
    const reminderData = remindersRes.data || [];

    // Upcoming birthdays
    const today = new Date();
    const upcomingBirthdays = people
      .filter((p) => p.birthday)
      .map((p) => {
        const bday = new Date(p.birthday + 'T00:00:00');
        const thisYearBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
        if (thisYearBday < today) thisYearBday.setFullYear(today.getFullYear() + 1);
        const daysUntil = Math.ceil((thisYearBday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return { id: p.id, name: p.name, avatar_emoji: p.avatar_emoji, birthday: p.birthday, daysUntil };
      })
      .filter((p) => p.daysUntil <= 60)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);

    // Recent wishlists
    const recentWishlists = wishlists
      .map((w) => ({
        id: w.id,
        name: w.name,
        itemCount: w.items?.length || 0,
        is_public: w.is_public,
        share_code: w.share_code,
        created_at: w.created_at,
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3);

    // Gift status breakdown
    const giftsByStatus: Record<string, number> = {};
    gifts.forEach((g) => {
      giftsByStatus[g.status] = (giftsByStatus[g.status] || 0) + 1;
    });

    // Total spending
    const totalSpent = gifts
      .filter((g) => ['purchased', 'wrapped', 'given'].includes(g.status))
      .reduce((acc, g) => acc + (g.price || 0), 0);

    const totalBudget = occasions.reduce((acc, o) => acc + (o.budget_total || 0), 0);

    // Process occasion reminders
    const occasionReminders: DashboardStats['occasionReminders'] = [];
    reminderData.forEach((r: Record<string, unknown>) => {
      const occasion = r.occasion as Record<string, unknown> | null;
      if (!occasion || !occasion.date) return;
      
      const eventDate = new Date((occasion.date as string) + 'T00:00:00');
      const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Show reminder if we're within the reminder window
      if (daysUntil >= 0 && daysUntil <= (r.remind_days_before as number)) {
        // Find occasion gifts
        const occ = occasions.find(o => o.id === occasion.id);
        const occGifts = occ?.gifts || [];
        const spent = occGifts
          .filter((g: { status: string }) => ['purchased', 'wrapped', 'given'].includes(g.status))
          .reduce((sum: number, g: { price: number | null }) => sum + (g.price || 0), 0);
        
        occasionReminders.push({
          id: r.id as string,
          occasion_name: occasion.name as string,
          occasion_type: occasion.type as string,
          occasion_date: occasion.date as string,
          days_until: daysUntil,
          remind_days_before: r.remind_days_before as number,
          budget_total: occasion.budget_total as number | null,
          spent,
          gift_count: occGifts.length,
        });
      }
    });

    // Recent activity
    const recentActivity: DashboardStats['recentActivity'] = [];
    
    // Add recent gifts
    gifts
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)
      .forEach((g) => {
        recentActivity.push({
          type: 'gift',
          title: g.name,
          subtitle: `${STATUS_INFO[g.status]?.label || g.status} • $${g.price?.toFixed(2) || '0.00'}`,
          time: g.created_at,
          icon: STATUS_INFO[g.status]?.icon || '🎁',
        });
      });

    // Add recent wishlists
    wishlists
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 2)
      .forEach((w) => {
        recentActivity.push({
          type: 'wishlist',
          title: w.name,
          subtitle: `Wishlist • ${w.items?.length || 0} items`,
          time: w.created_at,
          icon: '📝',
        });
      });

    // Sort by time
    recentActivity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    setStats({
      peopleCount: people.length,
      wishlistCount: wishlists.length,
      wishlistItemCount: wishlists.reduce((acc, w) => acc + (w.items?.length || 0), 0),
      giftCount: gifts.length,
      purchasedCount: gifts.filter((g) => ['purchased', 'wrapped', 'given'].includes(g.status)).length,
      totalSpent,
      totalBudget,
      upcomingBirthdays,
      recentWishlists,
      occasionReminders,
      giftsByStatus,
      recentActivity,
    });

    setLoading(false);
  };

  const dismissReminder = (id: string) => {
    const updated = new Set(dismissedReminders);
    updated.add(id);
    setDismissedReminders(updated);
    localStorage.setItem('gifthq_dismissed_reminders', JSON.stringify([...updated]));
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-gray-200 rounded-full animate-spin border-t-[#D64045]"></div>
      </div>
    );
  }

  if (!stats) return null;

  const activeReminders = stats.occasionReminders.filter(r => !dismissedReminders.has(r.id));

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#3D4F5F] to-[#4A5D6E] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Hey {userName}! 👋</h1>
        <p className="text-blue-100">
          {stats.peopleCount === 0 
            ? "Let's get started by adding the people you buy gifts for."
            : `You're tracking gifts for ${stats.peopleCount} ${stats.peopleCount === 1 ? 'person' : 'people'}${stats.totalSpent > 0 ? ` • $${stats.totalSpent.toFixed(0)} spent so far` : ''}.`
          }
        </p>
      </div>

      {/* Occasion Reminders / Notifications */}
      {activeReminders.length > 0 && (
        <div className="space-y-3">
          {activeReminders.map((reminder) => {
            const urgency = reminder.days_until <= 7 ? 'urgent' : reminder.days_until <= 14 ? 'soon' : 'upcoming';
            const bgColor = urgency === 'urgent' ? 'bg-red-50 border-red-200' : urgency === 'soon' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200';
            const textColor = urgency === 'urgent' ? 'text-red-800' : urgency === 'soon' ? 'text-yellow-800' : 'text-blue-800';
            
            return (
              <div key={reminder.id} className={`rounded-xl p-4 border ${bgColor} flex items-start justify-between gap-3`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {urgency === 'urgent' ? '🚨' : urgency === 'soon' ? '⏰' : '🔔'}
                  </span>
                  <div>
                    <p className={`font-medium ${textColor}`}>
                      {reminder.occasion_name} is in {reminder.days_until} day{reminder.days_until !== 1 ? 's' : ''}!
                    </p>
                    <p className={`text-sm ${textColor} opacity-80`}>
                      {reminder.gift_count === 0 
                        ? "Time to start shopping! 🛍️" 
                        : `${reminder.gift_count} gift${reminder.gift_count !== 1 ? 's' : ''} planned${reminder.budget_total ? ` • $${reminder.spent.toFixed(0)}/$${reminder.budget_total.toFixed(0)} budget` : ''}`
                      }
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Link
                        href="/app/gifts"
                        className={`text-xs font-medium px-3 py-1 rounded-full ${
                          urgency === 'urgent' ? 'bg-red-200 text-red-800' : urgency === 'soon' ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800'
                        }`}
                      >
                        {reminder.gift_count === 0 ? 'Add Gifts →' : 'View Gifts →'}
                      </Link>
                      <Link
                        href="/app/search"
                        className={`text-xs font-medium px-3 py-1 rounded-full ${
                          urgency === 'urgent' ? 'bg-red-100 text-red-700' : urgency === 'soon' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        Find Ideas 🔍
                      </Link>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => dismissReminder(reminder.id)}
                  className="text-gray-400 hover:text-gray-600 text-sm p-1"
                  title="Dismiss"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/app/people" className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-2xl font-bold text-[#3D4F5F]">{stats.peopleCount}</div>
          <div className="text-sm text-[#5A6C7D]">People</div>
        </Link>
        
        <Link href="/app/wishlists" className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition">
          <div className="text-3xl mb-2">📝</div>
          <div className="text-2xl font-bold text-[#3D4F5F]">{stats.wishlistCount}</div>
          <div className="text-sm text-[#5A6C7D]">Wishlists</div>
        </Link>
        
        <Link href="/app/gifts" className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition">
          <div className="text-3xl mb-2">🎁</div>
          <div className="text-2xl font-bold text-[#3D4F5F]">{stats.giftCount}</div>
          <div className="text-sm text-[#5A6C7D]">Gifts Planned</div>
        </Link>
        
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold text-green-600">${stats.totalSpent.toFixed(0)}</div>
          <div className="text-sm text-[#5A6C7D]">Spent</div>
        </div>
      </div>

      {/* Budget Overview (only show if there's budget data) */}
      {stats.totalBudget > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-[#3D4F5F] mb-3">💰 Budget Overview</h2>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#5A6C7D]">Total Spent</span>
            <span className="font-bold text-[#3D4F5F]">
              ${stats.totalSpent.toFixed(0)} / ${stats.totalBudget.toFixed(0)}
            </span>
          </div>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-4 rounded-full transition-all ${
                stats.totalSpent > stats.totalBudget ? 'bg-red-500' : 
                stats.totalSpent > stats.totalBudget * 0.8 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((stats.totalSpent / stats.totalBudget) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-[#5A6C7D]">
            <span>{Math.round((stats.totalSpent / stats.totalBudget) * 100)}% used</span>
            <span>${(stats.totalBudget - stats.totalSpent).toFixed(0)} remaining</span>
          </div>
        </div>
      )}

      {/* Gift Status Pipeline (only show if gifts exist) */}
      {stats.giftCount > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-[#3D4F5F] mb-3">🎯 Gift Progress</h2>
          <div className="flex gap-2">
            {Object.entries(STATUS_INFO).map(([status, info]) => {
              const count = stats.giftsByStatus[status] || 0;
              if (count === 0 && status !== 'idea') return null;
              const percentage = stats.giftCount > 0 ? (count / stats.giftCount) * 100 : 0;
              
              return (
                <div key={status} className="flex-1 text-center">
                  <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden mb-1">
                    <div 
                      className="h-full rounded-lg transition-all"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: info.color,
                        minWidth: count > 0 ? '100%' : '0%',
                        opacity: count > 0 ? 0.2 : 0,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-[#3D4F5F]">{count}</span>
                    </div>
                  </div>
                  <div className="text-xs text-[#5A6C7D]">{info.icon} {info.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Birthdays */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-[#3D4F5F]">🎂 Upcoming Birthdays</h2>
            <Link href="/app/people" className="text-sm text-[#D64045] hover:underline">
              View all →
            </Link>
          </div>
          {stats.upcomingBirthdays.length === 0 ? (
            <div className="p-6 text-center text-[#5A6C7D]">
              <p>No birthdays in the next 60 days</p>
              <p className="text-sm mt-1">Add birthdays to your people to see them here!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {stats.upcomingBirthdays.map((person) => (
                <div key={person.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FFF3E0] rounded-full flex items-center justify-center text-xl">
                      {person.avatar_emoji}
                    </div>
                    <div>
                      <div className="font-medium text-[#3D4F5F]">{person.name}</div>
                      <div className="text-sm text-[#5A6C7D]">
                        {new Date(person.birthday + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                    person.daysUntil <= 7 
                      ? 'bg-red-100 text-red-700' 
                      : person.daysUntil <= 30 
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                  }`}>
                    {person.daysUntil === 0 ? 'Today!' : person.daysUntil === 1 ? 'Tomorrow' : `${person.daysUntil} days`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-[#3D4F5F]">📋 Recent Activity</h2>
          </div>
          {stats.recentActivity.length === 0 ? (
            <div className="p-6 text-center text-[#5A6C7D]">
              <p>No recent activity</p>
              <p className="text-sm mt-1">Start adding gifts and wishlists!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {stats.recentActivity.slice(0, 5).map((activity, i) => (
                <div key={i} className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[#3D4F5F] text-sm truncate">{activity.title}</div>
                    <div className="text-xs text-[#5A6C7D]">{activity.subtitle}</div>
                  </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap">
                    {formatTimeAgo(activity.time)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Your Wishlists */}
      {stats.recentWishlists.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-[#3D4F5F]">📝 Your Wishlists</h2>
            <Link href="/app/wishlists" className="text-sm text-[#D64045] hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.recentWishlists.map((list) => (
              <Link 
                key={list.id} 
                href="/app/wishlists"
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium text-[#3D4F5F]">{list.name}</div>
                    <div className="text-sm text-[#5A6C7D]">
                      {list.itemCount} items
                      {list.is_public && <span className="text-green-600 ml-2">• Shareable</span>}
                    </div>
                  </div>
                </div>
                <span className="text-[#5A6C7D]">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Smart Shopping Tools */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-[#3D4F5F] to-[#2C5A8F] rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">📷 Scan & Compare</h2>
              <p className="text-white/90 text-sm">Scan any barcode to instantly find the best price</p>
            </div>
            <Link href="/app/scan" className="px-5 py-2.5 bg-white text-[#3D4F5F] rounded-full font-bold hover:bg-gray-100 transition whitespace-nowrap text-sm">
              Scan Now
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#D64045] to-[#E85A5F] rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">🔍 AI Gift Finder</h2>
              <p className="text-white/90 text-sm">Describe what you need — we&apos;ll find options</p>
            </div>
            <Link href="/app/search" className="px-5 py-2.5 bg-white text-[#D64045] rounded-full font-bold hover:bg-gray-100 transition whitespace-nowrap text-sm">
              Find Gifts
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="font-semibold text-[#3D4F5F] mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/app/scan" className="px-5 py-2.5 bg-[#3D4F5F] text-white rounded-full font-medium hover:bg-[#4A5D6E] transition">
            📷 Scan Barcode
          </Link>
          <Link href="/app/search" className="px-5 py-2.5 bg-[#D64045] text-white rounded-full font-medium hover:bg-[#B83539] transition">
            🔍 Find Gift Ideas
          </Link>
          <Link href="/app/people" className="px-5 py-2.5 bg-[#F4C430] text-[#3D4F5F] rounded-full font-medium hover:bg-[#F7D154] transition">
            + Add Person
          </Link>
          <Link href="/app/wishlists" className="px-5 py-2.5 bg-gray-100 text-[#3D4F5F] rounded-full font-medium hover:bg-gray-200 transition">
            + Create Wishlist
          </Link>
          <Link href="/app/occasions" className="px-5 py-2.5 bg-gray-100 text-[#3D4F5F] rounded-full font-medium hover:bg-gray-200 transition">
            📅 Add Occasion
          </Link>
        </div>
      </div>

      {/* Getting Started (show only if empty) */}
      {stats.peopleCount === 0 && stats.wishlistCount === 0 && (
        <div className="bg-gradient-to-br from-[#FFF9F0] to-[#FFF3E0] rounded-2xl p-6 border border-[#F4C430]/20">
          <h2 className="font-semibold text-[#3D4F5F] mb-3">🚀 Getting Started</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#D64045] text-white flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <div className="font-medium text-[#3D4F5F]">Add your people</div>
                <p className="text-sm text-[#5A6C7D]">Family, friends, coworkers — anyone you buy gifts for</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#F4C430] text-[#3D4F5F] flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <div className="font-medium text-[#3D4F5F]">Create a wishlist</div>
                <p className="text-sm text-[#5A6C7D]">Share it so people know what you want — no duplicates!</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#3D4F5F] text-white flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <div className="font-medium text-[#3D4F5F]">Set up occasions with reminders</div>
                <p className="text-sm text-[#5A6C7D]">Never miss a birthday or holiday again</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
