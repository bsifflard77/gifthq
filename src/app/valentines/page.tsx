'use client'

import { useState, useEffect } from 'react'

interface GiftItem {
  id: number
  name: string
  description: string
  priceRange: string
  searchTerm: string
  category: 'her' | 'him' | 'couples' | 'budget' | 'luxury'
}

const gifts: GiftItem[] = [
  // For Her
  { id: 1, name: 'Personalized Star Map', description: 'A custom star map showing the night sky from your first date, first kiss, or the day you met.', priceRange: '$35-65', searchTerm: 'personalized star map custom night sky', category: 'her' },
  { id: 2, name: 'Silk Pillowcase Set', description: 'Luxurious mulberry silk pillowcases that are gentle on hair and skin.', priceRange: '$45-85', searchTerm: 'mulberry silk pillowcase set hair skin', category: 'her' },
  { id: 3, name: 'Book Nook Shelf Insert', description: 'A miniature diorama that fits between books on a shelf, complete with LED lights.', priceRange: '$25-50', searchTerm: 'book nook shelf insert LED diorama', category: 'her' },
  { id: 4, name: 'Professional Flower Arranging Class', description: 'A hands-on workshop where she can learn to create stunning bouquets and centerpieces.', priceRange: '$60-120', searchTerm: 'flower arranging class workshop bouquet', category: 'her' },
  { id: 5, name: 'Weighted Aromatherapy Eye Pillow', description: 'A silk eye pillow filled with flax seeds and lavender that can be heated or cooled.', priceRange: '$20-35', searchTerm: 'weighted aromatherapy eye pillow silk lavender', category: 'her' },
  { id: 6, name: 'Vintage-Style Film Camera', description: 'For the Instagram aesthetic lover, a instant film camera brings back the magic of physical photos.', priceRange: '$70-150', searchTerm: 'Fujifilm Instax instant film camera vintage', category: 'her' },

  // For Him
  { id: 7, name: 'Craft Beer Brewing Kit', description: 'A complete starter kit for making his own IPA, stout, or wheat beer at home.', priceRange: '$40-80', searchTerm: 'craft beer brewing kit home IPA stout', category: 'him' },
  { id: 8, name: 'Smart Meat Thermometer', description: 'A Bluetooth meat thermometer that monitors internal temperature and sends alerts to his phone.', priceRange: '$50-100', searchTerm: 'smart Bluetooth meat thermometer grilling', category: 'him' },
  { id: 9, name: 'Premium Coffee Subscription (3-Month)', description: 'Carefully curated beans from small roasters around the world, delivered monthly.', priceRange: '$60-90', searchTerm: 'premium coffee subscription small roaster beans', category: 'him' },
  { id: 10, name: 'Desktop Vacuum for Workshop', description: 'A compact, powerful vacuum designed for cleaning sawdust, metal shavings, or general workspace debris.', priceRange: '$35-55', searchTerm: 'desktop vacuum workshop sawdust workspace', category: 'him' },
  { id: 11, name: 'Vintage Cologne Discovery Set', description: 'A collection of sample-size classic men\'s fragrances from different decades and styles.', priceRange: '$45-75', searchTerm: 'vintage cologne discovery set mens fragrance samples', category: 'him' },
  { id: 12, name: 'Cast Iron Pan Restoration Kit', description: 'Everything needed to strip, season, and restore vintage cast iron cookware to perfect condition.', priceRange: '$30-50', searchTerm: 'cast iron restoration kit seasoning cookware', category: 'him' },

  // For Couples
  { id: 13, name: 'Wine and Paint Night at Home Kit', description: 'Everything needed for a romantic evening of creativity: canvases, paints, brushes, wine glasses.', priceRange: '$55-85', searchTerm: 'wine paint night home kit romantic couples', category: 'couples' },
  { id: 14, name: 'Indoor S\'mores Kit', description: 'A tabletop s\'mores maker with artisan marshmallows, gourmet chocolate, and graham crackers.', priceRange: '$40-70', searchTerm: 'indoor smores kit tabletop maker marshmallow', category: 'couples' },
  { id: 15, name: 'Two-Person Hammock with Stand', description: 'A comfortable hammock that fits two people, complete with a sturdy stand for backyard or indoor use.', priceRange: '$100-200', searchTerm: 'two person hammock with stand double', category: 'couples' },
  { id: 16, name: 'Couples Massage Class', description: 'A professional instructor teaches you both basic massage techniques for relaxation and connection.', priceRange: '$80-150', searchTerm: 'couples massage class instruction relaxation', category: 'couples' },
  { id: 17, name: 'Board Game Café Experience', description: 'An evening at a local board game café with dozens of games to try, plus food and drinks.', priceRange: '$30-60', searchTerm: 'board game cafe experience date night', category: 'couples' },

  // Budget-Friendly
  { id: 18, name: 'Custom Photo Collage Print', description: 'A professionally designed collage of your favorite photos together, printed on quality paper or canvas.', priceRange: '$15-35', searchTerm: 'custom photo collage print canvas design', category: 'budget' },
  { id: 19, name: 'Gourmet Hot Chocolate Bombs', description: 'Chocolate spheres filled with marshmallows and cocoa that "explode" when hot milk is poured over them.', priceRange: '$12-25', searchTerm: 'gourmet hot chocolate bombs marshmallow cocoa', category: 'budget' },
  { id: 20, name: 'Succulent Arrangement in Vintage Container', description: 'A collection of small succulents planted in a unique vintage container like an old teacup or tin.', priceRange: '$20-40', searchTerm: 'succulent arrangement vintage container planter', category: 'budget' },
  { id: 21, name: 'Homemade Coupon Book', description: 'Hand-designed coupons for experiences: "One home-cooked dinner," "Movie night with back rubs," etc.', priceRange: '$5-15', searchTerm: 'DIY coupon book supplies scrapbook materials', category: 'budget' },

  // Luxury
  { id: 22, name: 'Weekend Getaway to a Nearby City', description: 'A carefully planned mini-vacation to a charming town with boutique hotel and restaurant reservations.', priceRange: '$300-600', searchTerm: 'weekend getaway boutique hotel romantic trip', category: 'luxury' },
  { id: 23, name: 'Professional Jewelry Cleaning and Appraisal', description: 'Have her favorite pieces professionally cleaned, polished, and appraised.', priceRange: '$75-150', searchTerm: 'jewelry cleaning appraisal professional service', category: 'luxury' },
  { id: 24, name: 'Premium Skincare Discovery Set', description: 'A curated collection of luxury skincare products from a high-end brand, sized for travel.', priceRange: '$100-250', searchTerm: 'luxury skincare discovery set premium beauty', category: 'luxury' },
  { id: 25, name: 'Custom Portrait Session', description: 'A professional photographer captures you both in a location meaningful to your relationship.', priceRange: '$200-500', searchTerm: 'couples portrait photography session custom', category: 'luxury' }
]

const categories = {
  her: { name: 'For Her', emoji: '💝', color: 'from-pink-500 to-rose-500' },
  him: { name: 'For Him', emoji: '🎁', color: 'from-blue-500 to-indigo-500' },
  couples: { name: 'For Couples', emoji: '💕', color: 'from-purple-500 to-pink-500' },
  budget: { name: 'Budget-Friendly', emoji: '💰', color: 'from-green-500 to-emerald-500' },
  luxury: { name: 'Luxury', emoji: '✨', color: 'from-amber-500 to-orange-500' }
}

function getTimeUntilValentines() {
  const now = new Date()
  const currentYear = now.getFullYear()
  let valentinesDay = new Date(currentYear, 1, 14) // February 14th
  
  // If Valentine's Day has passed this year, calculate for next year
  if (now > valentinesDay) {
    valentinesDay = new Date(currentYear + 1, 1, 14)
  }
  
  const timeDiff = valentinesDay.getTime() - now.getTime()
  const days = Math.ceil(timeDiff / (1000 * 3600 * 24))
  
  return { days, date: valentinesDay.toLocaleDateString() }
}

function generateAmazonLink(searchTerm: string) {
  const encodedTerm = encodeURIComponent(searchTerm)
  return `https://www.amazon.com/s?k=${encodedTerm}&tag=gifthq00-20`
}

export default function ValentinesGiftGuide() {
  const [timeUntil, setTimeUntil] = useState({ days: 0, date: '' })
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    setTimeUntil(getTimeUntilValentines())
  }, [])

  const filteredGifts = activeCategory ? gifts.filter(gift => gift.category === activeCategory) : gifts

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `Check out this amazing Valentine's Day Gift Guide with 25 perfect gift ideas! 💕`

  return (
    <div className="min-h-screen bg-[#FFF9F5]">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-2">
              <img src="/gifthq-logo-v3.jpg" alt="GiftHQ" className="h-10 w-10 rounded-lg" />
              <span className="text-[28px] font-bold leading-none tracking-tight">
                <span className="text-[#3D4F5F]">Gift</span>
                <span className="text-[#F4C430]">HQ</span>
              </span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/auth/login"
              className="text-[#3D4F5F] font-medium hover:text-[#4A5D6E] transition"
            >
              Sign In
            </a>
            <a
              href="/auth/signup"
              className="bg-[#3D4F5F] text-white px-6 py-2 rounded-full hover:bg-[#4A5D6E] transition font-medium"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-8 md:py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center bg-gradient-to-r from-[#E91E63] to-[#AD1457] text-white px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-lg">
            <span className="mr-2">💕</span>
            Valentine's Day 2026 Gift Guide
            <span className="ml-2">💕</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-[#3D4F5F] mb-4">
            25 Perfect
            <span className="text-transparent bg-gradient-to-r from-[#E91E63] to-[#AD1457] bg-clip-text block mt-2">
              Valentine's Gifts
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-[#5A6C7D] mb-6 max-w-3xl mx-auto">
            From heartfelt tokens to luxury splurges — find the perfect way to show you care
          </p>
          
          {/* Countdown */}
          <div className="inline-block bg-white rounded-2xl shadow-lg p-6 mb-8 border border-[#F8BBD9]/50">
            <div className="text-3xl md:text-4xl font-bold text-[#E91E63] mb-2">
              {timeUntil.days} Days
            </div>
            <div className="text-[#5A6C7D] font-medium">
              Until Valentine's Day ({timeUntil.date})
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1DA1F2] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#0C85D0] transition flex items-center gap-2"
            >
              <span>🐦</span> Share on Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#4267B2] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#365899] transition flex items-center gap-2"
            >
              <span>📘</span> Share on Facebook
            </a>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Valentine\'s Day Gift Guide',
                    text: shareText,
                    url: shareUrl
                  })
                } else {
                  navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
                }
              }}
              className="bg-[#3D4F5F] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#4A5D6E] transition flex items-center gap-2"
            >
              <span>📋</span> Copy Link
            </button>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="container mx-auto px-6 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full font-medium transition ${
                activeCategory === null
                  ? 'bg-[#3D4F5F] text-white'
                  : 'bg-white text-[#3D4F5F] border border-[#3D4F5F] hover:bg-[#F0F4F8]'
              }`}
            >
              All Gifts (25)
            </button>
            {Object.entries(categories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-4 py-2 rounded-full font-medium transition flex items-center gap-2 ${
                  activeCategory === key
                    ? 'bg-[#3D4F5F] text-white'
                    : 'bg-white text-[#3D4F5F] border border-[#3D4F5F] hover:bg-[#F0F4F8]'
                }`}
              >
                <span>{category.emoji}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gift Cards Grid */}
      <section className="container mx-auto px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          {Object.entries(categories).map(([categoryKey, categoryInfo]) => {
            const categoryGifts = gifts.filter(gift => gift.category === categoryKey)
            if (activeCategory && activeCategory !== categoryKey) return null
            
            return (
              <div key={categoryKey} id={categoryKey} className="mb-12">
                <div className="text-center mb-8">
                  <h2 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${categoryInfo.color} bg-clip-text text-transparent mb-2`}>
                    {categoryInfo.emoji} {categoryInfo.name}
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-[#E91E63] to-[#AD1457] mx-auto rounded-full"></div>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryGifts.map((gift) => (
                    <div key={gift.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-bold text-[#3D4F5F] leading-tight">
                            {gift.name}
                          </h3>
                          <div className="bg-[#F4C430] text-[#3D4F5F] px-3 py-1 rounded-full text-sm font-semibold ml-2 whitespace-nowrap">
                            {gift.priceRange}
                          </div>
                        </div>
                        
                        <p className="text-[#5A6C7D] text-sm mb-6 leading-relaxed">
                          {gift.description}
                        </p>
                        
                        <a
                          href={generateAmazonLink(gift.searchTerm)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full bg-gradient-to-r from-[#E91E63] to-[#AD1457] text-white text-center py-3 rounded-xl font-semibold hover:from-[#C2185B] hover:to-[#8E24AA] transition-all duration-300 transform hover:-translate-y-1"
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

      {/* CTA Section */}
      <section className="bg-gradient-to-b from-[#3D4F5F] to-[#2D3D4B] py-16 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-5xl mb-6">🎁</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Organize All Your Gift-Giving?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join GiftHQ to track gifts for every occasion, set budgets, and never buy duplicates again. Christmas, birthdays, anniversaries — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth/signup"
                className="bg-[#F4C430] text-[#3D4F5F] px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#F7D154] transition shadow-lg"
              >
                Start Free Account →
              </a>
              <a
                href="/"
                className="bg-white/10 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition border border-white/30"
              >
                Learn More
              </a>
            </div>
            <p className="text-blue-200 text-sm mt-6">
              Free forever • No credit card required • Track 1 occasion and 10 people
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F1F2E] text-gray-400 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-xl font-bold mb-4 md:mb-0">
              <span className="text-white">Gift</span>
              <span className="text-[#F4C430]">HQ</span>
            </div>
            <div className="flex gap-6 mb-4 md:mb-0">
              <a href="/" className="hover:text-white transition">Home</a>
              <a href="#" className="hover:text-white transition">About</a>
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
            </div>
            <div className="text-sm">
              © 2026 GiftHQ. Made with 💕 for thoughtful gift-givers.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}