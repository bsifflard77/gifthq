'use client'

import { useState, useEffect } from 'react'

interface GiftItem {
  id: number
  name: string
  description: string
  priceRange: string
  searchTerm: string
  category: 'for-mom' | 'from-kids' | 'from-husband' | 'budget' | 'luxury'
}

const gifts: GiftItem[] = [
  // For Mom
  { id: 1, name: 'Custom Family Portrait', description: 'A beautiful hand-drawn or digital portrait of the whole family — a keepsake she\'ll treasure forever.', priceRange: '$50-150', searchTerm: 'custom family portrait digital illustration', category: 'for-mom' },
  { id: 2, name: 'Personalized Recipe Book', description: 'A beautifully printed book of her favorite family recipes, with space to add stories and memories.', priceRange: '$40-80', searchTerm: 'personalized recipe book custom family cookbook', category: 'for-mom' },
  { id: 3, name: 'Luxury Bathrobe & Spa Set', description: 'Plush waffle-knit robe with matching slippers, bath salts, and candles — a full spa day at home.', priceRange: '$60-120', searchTerm: 'luxury bathrobe spa gift set womens', category: 'for-mom' },
  { id: 4, name: 'Personalized Jewelry Box', description: 'An engraved wooden jewelry box with her name or a special message — elegant and functional.', priceRange: '$35-75', searchTerm: 'personalized engraved jewelry box wooden', category: 'for-mom' },
  { id: 5, name: 'Herb Garden Starter Kit', description: 'A beautiful countertop herb garden with basil, mint, rosemary, and more — perfect for the home cook.', priceRange: '$30-60', searchTerm: 'indoor herb garden starter kit countertop', category: 'for-mom' },
  { id: 6, name: 'Custom Name Necklace', description: 'A delicate gold or silver necklace with her name, the kids\' names, or a meaningful word.', priceRange: '$40-100', searchTerm: 'custom name necklace gold silver personalized', category: 'for-mom' },

  // From Kids
  { id: 7, name: 'Kids\' Handprint Art Kit', description: 'A professional-quality kit for capturing handprints or footprints in clay — a gift she\'ll display forever.', priceRange: '$25-50', searchTerm: 'kids handprint footprint clay art kit', category: 'from-kids' },
  { id: 8, name: 'Photo Book from the Kids', description: 'A hardcover photo book filled with family memories, designed by the kids with their own captions.', priceRange: '$30-60', searchTerm: 'hardcover photo book custom family memories', category: 'from-kids' },
  { id: 9, name: '"Mom\'s Coupons" Keepsake Book', description: 'A professionally printed coupon book where kids can fill in personalized offers: breakfast in bed, hugs, chores.', priceRange: '$15-30', searchTerm: 'kids coupon book mom keepsake printable', category: 'from-kids' },
  { id: 10, name: 'Personalized Story Book (Mom is the Hero)', description: 'A custom children\'s book where Mom is the main character — kids\' names included in the story.', priceRange: '$35-55', searchTerm: 'personalized story book mom hero custom children', category: 'from-kids' },
  { id: 11, name: 'Family Memory Box', description: 'A beautiful keepsake box for storing ticket stubs, drawings, letters, and small mementos from the family.', priceRange: '$30-60', searchTerm: 'family memory keepsake box wooden engraved', category: 'from-kids' },
  { id: 12, name: 'Mom\'s Favorite Things Basket', description: 'A curated gift basket filled with her favorite snacks, tea, candles, and a heartfelt card from the kids.', priceRange: '$40-80', searchTerm: 'mothers day gift basket spa snacks tea', category: 'from-kids' },

  // From Husband/Partner
  { id: 13, name: 'Sunset or Stargazing Experience', description: 'Book a private stargazing tour or sunset sailboat cruise — a romantic evening just for two.', priceRange: '$80-200', searchTerm: 'stargazing tour sunset cruise romantic experience', category: 'from-husband' },
  { id: 14, name: 'Personalized Map Art', description: 'A custom framed map of the place you met, got married, or where the kids were born.', priceRange: '$50-100', searchTerm: 'personalized custom map art framed city', category: 'from-husband' },
  { id: 15, name: 'Spa Day Package', description: 'A full day at a local spa with massage, facial, and lunch — the ultimate relaxation gift.', priceRange: '$150-300', searchTerm: 'spa day gift certificate massage facial package', category: 'from-husband' },
  { id: 16, name: 'Subscription Box for Her Hobby', description: 'A 3-month subscription box tailored to her passion — books, wine, cooking, fitness, crafts.', priceRange: '$60-120', searchTerm: 'subscription box women hobby books wine craft', category: 'from-husband' },
  { id: 17, name: '"365 Reasons I Love You" Book', description: 'A beautifully designed journal filled with one heartfelt reason for every day of the year.', priceRange: '$25-50', searchTerm: '365 reasons love you journal book gift', category: 'from-husband' },

  // Budget-Friendly
  { id: 18, name: 'Seed Packet Collection & Planter', description: 'A beautiful set of heirloom flower seeds with a personalized terra cotta pot — thoughtful and lasting.', priceRange: '$15-35', searchTerm: 'heirloom flower seed collection gift planter', category: 'budget' },
  { id: 19, name: 'Cozy Reading Kit', description: 'A bestselling novel, a scented candle, and a bag of her favorite tea — the perfect slow Sunday.', priceRange: '$20-40', searchTerm: 'cozy reading gift set candle tea book', category: 'budget' },
  { id: 20, name: 'Personalized Canvas Tote Bag', description: 'A high-quality canvas tote printed with a family photo, her name, or a meaningful quote.', priceRange: '$15-30', searchTerm: 'personalized canvas tote bag photo custom', category: 'budget' },
  { id: 21, name: 'Gourmet Tea & Honey Gift Set', description: 'A beautiful collection of artisan loose-leaf teas with local honey and a hand-painted ceramic mug.', priceRange: '$25-45', searchTerm: 'gourmet tea gift set honey ceramic mug artisan', category: 'budget' },

  // Luxury
  { id: 22, name: 'Weekend Getaway Just for Her', description: 'A fully planned overnight trip to a charming inn or boutique hotel — complete relaxation, no kids allowed.', priceRange: '$300-700', searchTerm: 'boutique hotel weekend getaway womens retreat', category: 'luxury' },
  { id: 23, name: 'Fine Jewelry — Birthstone Piece', description: 'A stunning ring, bracelet, or earrings featuring the birthstones of each of her children.', priceRange: '$150-500', searchTerm: 'family birthstone jewelry ring necklace gold', category: 'luxury' },
  { id: 24, name: 'Professional Family Photography Session', description: 'Capture the whole family in beautiful portraits at a meaningful location — memories that last forever.', priceRange: '$200-500', searchTerm: 'professional family photography portrait session outdoor', category: 'luxury' },
  { id: 25, name: 'Smart Home Wellness Bundle', description: 'A curated set of smart home devices for relaxation: sunrise alarm clock, air purifier, and diffuser.', priceRange: '$200-400', searchTerm: 'smart home wellness bundle sunrise alarm air purifier diffuser', category: 'luxury' }
]

const categories = {
  'for-mom': { name: 'For Mom', emoji: '👩', color: 'from-purple-500 to-pink-500' },
  'from-kids': { name: 'From the Kids', emoji: '👧', color: 'from-yellow-500 to-orange-500' },
  'from-husband': { name: 'From Her Partner', emoji: '💑', color: 'from-rose-500 to-pink-600' },
  'budget': { name: 'Budget-Friendly', emoji: '💚', color: 'from-green-500 to-teal-500' },
  'luxury': { name: 'Luxury', emoji: '✨', color: 'from-amber-500 to-yellow-500' }
}

function getTimeUntilMothersDay() {
  const now = new Date()
  const year = now.getFullYear()
  // Mother's Day = second Sunday in May
  const getMothersDay = (y: number) => {
    const may1 = new Date(y, 4, 1)
    const dayOfWeek = may1.getDay()
    const firstSunday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
    return new Date(y, 4, firstSunday + 7)
  }
  let mothersDay = getMothersDay(year)
  if (now > mothersDay) mothersDay = getMothersDay(year + 1)
  const timeDiff = mothersDay.getTime() - now.getTime()
  const days = Math.ceil(timeDiff / (1000 * 3600 * 24))
  return { days, date: mothersDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }
}

function generateAmazonLink(searchTerm: string) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}&tag=gifthq00-20`
}

export default function MothersDayGiftGuide() {
  const [timeUntil, setTimeUntil] = useState({ days: 0, date: '' })
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    setTimeUntil(getTimeUntilMothersDay())
  }, [])

  const filteredGifts = activeCategory ? gifts.filter(g => g.category === activeCategory) : gifts
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `Check out this amazing Mother's Day Gift Guide — 25 perfect gift ideas for every mom! 💐`

  return (
    <div className="min-h-screen bg-[#FFF9F5]">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src="/gifthq-logo-v3.jpg" alt="GiftHQ" className="h-10 w-10 rounded-lg" />
            <span className="text-[28px] font-bold leading-none tracking-tight">
              <span className="text-[#3D4F5F]">Gift</span>
              <span className="text-[#F4C430]">HQ</span>
            </span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/auth/login" className="text-[#3D4F5F] font-medium hover:text-[#4A5D6E] transition">Sign In</a>
            <a href="/auth/signup" className="bg-[#3D4F5F] text-white px-6 py-2 rounded-full hover:bg-[#4A5D6E] transition font-medium">Get Started</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-6 py-8 md:py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center bg-gradient-to-r from-[#9C27B0] to-[#E91E8C] text-white px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-lg">
            <span className="mr-2">💐</span>
            Mother&apos;s Day 2026 Gift Guide
            <span className="ml-2">💐</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-[#3D4F5F] mb-4">
            25 Gifts She&apos;ll
            <span className="text-transparent bg-gradient-to-r from-[#9C27B0] to-[#E91E8C] bg-clip-text block mt-2">
              Actually Love
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-[#5A6C7D] mb-6 max-w-3xl mx-auto">
            From sweet gestures from the kids to luxury treats she deserves — the perfect gift for every mom and every budget.
          </p>

          {/* Countdown */}
          <div className="inline-block bg-white rounded-2xl shadow-lg p-6 mb-8 border border-purple-100">
            <div className="text-3xl md:text-4xl font-bold text-[#9C27B0] mb-2">
              {timeUntil.days} Days
            </div>
            <div className="text-[#5A6C7D] font-medium">Until Mother&apos;s Day ({timeUntil.date})</div>
          </div>

          {/* Share */}
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="bg-[#1DA1F2] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#0C85D0] transition flex items-center gap-2"
            >
              <span>🐦</span> Share on X
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="bg-[#4267B2] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#365899] transition flex items-center gap-2"
            >
              <span>📘</span> Share on Facebook
            </a>
            <a
              href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(shareText)}`}
              target="_blank" rel="noopener noreferrer"
              className="bg-[#E60023] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#C0001D] transition flex items-center gap-2"
            >
              <span>📌</span> Pin It
            </a>
          </div>
        </div>
      </section>

      {/* Category Nav */}
      <section className="container mx-auto px-6 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full font-medium transition ${activeCategory === null ? 'bg-[#3D4F5F] text-white' : 'bg-white text-[#3D4F5F] border border-[#3D4F5F] hover:bg-[#F0F4F8]'}`}
            >
              All Gifts (25)
            </button>
            {Object.entries(categories).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-4 py-2 rounded-full font-medium transition flex items-center gap-2 ${activeCategory === key ? 'bg-[#3D4F5F] text-white' : 'bg-white text-[#3D4F5F] border border-[#3D4F5F] hover:bg-[#F0F4F8]'}`}
              >
                <span>{cat.emoji}</span>{cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gift Grid */}
      <section className="container mx-auto px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          {Object.entries(categories).map(([key, cat]) => {
            const catGifts = gifts.filter(g => g.category === key)
            if (activeCategory && activeCategory !== key) return null
            return (
              <div key={key} id={key} className="mb-12">
                <div className="text-center mb-8">
                  <h2 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${cat.color} bg-clip-text text-transparent mb-2`}>
                    {cat.emoji} {cat.name}
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-[#9C27B0] to-[#E91E8C] mx-auto rounded-full"></div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {catGifts.map(gift => (
                    <div key={gift.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-bold text-[#3D4F5F] leading-tight">{gift.name}</h3>
                          <div className="bg-[#F4C430] text-[#3D4F5F] px-3 py-1 rounded-full text-sm font-semibold ml-2 whitespace-nowrap">
                            {gift.priceRange}
                          </div>
                        </div>
                        <p className="text-[#5A6C7D] text-sm mb-6 leading-relaxed">{gift.description}</p>
                        <a
                          href={generateAmazonLink(gift.searchTerm)}
                          target="_blank" rel="noopener noreferrer"
                          className="block w-full bg-gradient-to-r from-[#9C27B0] to-[#E91E8C] text-white text-center py-3 rounded-xl font-semibold hover:from-[#7B1FA2] hover:to-[#C2185B] transition-all duration-300 transform hover:-translate-y-1"
                        >
                          Shop on Amazon →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-b from-[#3D4F5F] to-[#2D3D4B] py-16 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-5xl mb-6">🎁</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Track Every Gift for Every Mom in Your Life</h2>
            <p className="text-xl text-blue-100 mb-8">
              GiftHQ keeps you organized across every occasion — Mother&apos;s Day, birthdays, Christmas. Never forget, never duplicate, never overspend.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/auth/signup" className="bg-[#F4C430] text-[#3D4F5F] px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#F7D154] transition shadow-lg">
                Start Free Account →
              </a>
              <a href="/" className="bg-white/10 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition border border-white/30">
                Learn More
              </a>
            </div>
            <p className="text-blue-200 text-sm mt-6">Free forever • No credit card required</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F1F2E] text-gray-400 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-xl font-bold mb-4 md:mb-0">
              <span className="text-white">Gift</span><span className="text-[#F4C430]">HQ</span>
            </div>
            <div className="flex gap-6 mb-4 md:mb-0">
              <a href="/" className="hover:text-white transition">Home</a>
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
            </div>
            <div className="text-sm">© 2026 GiftHQ. Made with 💐 for thoughtful gift-givers.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
