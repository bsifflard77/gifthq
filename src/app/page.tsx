export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFF9F5]">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/gifthq-logo-v3.jpg" alt="GiftHQ" className="h-10 w-10 rounded-lg" />
            <span className="text-[28px] font-bold leading-none tracking-tight">
              <span className="text-[#3D4F5F]">Gift</span>
              <span className="text-[#F4C430]">HQ</span>
            </span>
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
      <section className="container mx-auto px-6 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-[#FFF3E0] text-[#D4A912] px-4 py-2 rounded-full text-sm font-medium mb-6">
            🚀 Launching March 2026
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-[#3D4F5F] mb-6">
            Your Gift
            <span className="text-[#D64045] block mt-2">Command Center</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#5A6C7D] mb-8 max-w-2xl mx-auto">
            Plan gifts, track budgets, share wish lists — and never buy a duplicate gift again. 
            Christmas, birthdays, weddings, all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/signup"
              className="bg-[#D64045] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#B83539] transition shadow-lg hover:shadow-xl"
            >
              Start Free →
            </a>
            <a
              href="#features"
              className="bg-white text-[#3D4F5F] px-8 py-4 rounded-full text-lg font-semibold border-2 border-[#3D4F5F] hover:bg-[#F0F4F8] transition"
            >
              See Features
            </a>
          </div>
          
          {/* App Preview Mockup */}
          <div className="mt-12 relative">
            <div className="bg-white rounded-3xl shadow-2xl p-4 max-w-sm mx-auto border border-gray-100">
              <div className="bg-gradient-to-br from-[#3D4F5F] to-[#4A5D6E] rounded-2xl p-6 text-white">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">🎄 Christmas 2026</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">$487 / $600</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/10 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium">Mom</div>
                      <div className="text-sm text-white/70">Cashmere Sweater</div>
                    </div>
                    <span className="bg-green-400 text-green-900 text-xs px-2 py-1 rounded-full">✓ Bought</span>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium">Dad</div>
                      <div className="text-sm text-white/70">Golf GPS Watch</div>
                    </div>
                    <span className="bg-[#F4C430] text-[#3D4F5F] text-xs px-2 py-1 rounded-full font-medium">🛒 In Cart</span>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium">Sister</div>
                      <div className="text-sm text-white/70">3 ideas saved</div>
                    </div>
                    <span className="bg-white/20 text-xs px-2 py-1 rounded-full">💡 Ideas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mother's Day Campaign Section */}
      <section className="bg-gradient-to-br from-[#F3E5F5] via-[#FFF0F5] to-[#FCE4EC] py-16 border-y-2 border-purple-100">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center bg-gradient-to-r from-[#9C27B0] to-[#E91E8C] text-white px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-lg">
              <span className="mr-2">💐</span>
              Mother&apos;s Day — May 11, 2026
              <span className="ml-2">💐</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-[#2D1B35] mb-4 leading-tight">
              Find the Perfect Gift
              <span className="text-transparent bg-gradient-to-r from-[#9C27B0] to-[#E91E8C] bg-clip-text block mt-1">
                for Every Mom
              </span>
              <span className="text-[#6B46C1] text-2xl md:text-3xl block mt-2">
                in Under a Minute
              </span>
            </h2>

            <p className="text-xl text-[#5A4C68] mb-8 max-w-2xl mx-auto leading-relaxed">
              25 handpicked gifts for Mom — whether it&apos;s from the kids, from her partner, or a luxury treat she truly deserves.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href="/mothers-day"
                className="group bg-gradient-to-r from-[#9C27B0] to-[#E91E8C] text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-[#7B1FA2] hover:to-[#C2185B] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
              >
                <span className="mr-2">💐</span>
                Browse Mother&apos;s Day Gifts
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </a>
              <a
                href="/mothers-day#luxury"
                className="bg-white text-[#9C27B0] px-8 py-4 rounded-full text-lg font-semibold border-2 border-[#9C27B0] hover:bg-[#F3E5F5] transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
              >
                <span className="mr-2">✨</span>
                Luxury Picks
              </a>
            </div>

            {/* Gift Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <a href="/mothers-day#for-mom" className="bg-white/80 backdrop-blur p-4 rounded-xl hover:bg-white transition-colors duration-300 border border-purple-100 hover:border-[#9C27B0]/30 hover:shadow-lg cursor-pointer transform hover:-translate-y-1">
                <div className="text-2xl mb-2">👩</div>
                <div className="font-semibold text-[#2D1B35] text-sm">For Mom</div>
              </a>
              <a href="/mothers-day#from-kids" className="bg-white/80 backdrop-blur p-4 rounded-xl hover:bg-white transition-colors duration-300 border border-purple-100 hover:border-[#9C27B0]/30 hover:shadow-lg cursor-pointer transform hover:-translate-y-1">
                <div className="text-2xl mb-2">👧</div>
                <div className="font-semibold text-[#2D1B35] text-sm">From Kids</div>
              </a>
              <a href="/mothers-day#budget" className="bg-white/80 backdrop-blur p-4 rounded-xl hover:bg-white transition-colors duration-300 border border-purple-100 hover:border-[#9C27B0]/30 hover:shadow-lg cursor-pointer transform hover:-translate-y-1">
                <div className="text-2xl mb-2">💚</div>
                <div className="font-semibold text-[#2D1B35] text-sm">Under $40</div>
              </a>
              <a href="/mothers-day#luxury" className="bg-white/80 backdrop-blur p-4 rounded-xl hover:bg-white transition-colors duration-300 border border-purple-100 hover:border-[#9C27B0]/30 hover:shadow-lg cursor-pointer transform hover:-translate-y-1">
                <div className="text-2xl mb-2">✨</div>
                <div className="font-semibold text-[#2D1B35] text-sm">Luxury</div>
              </a>
            </div>

            <a href="/mothers-day" className="block bg-white/60 backdrop-blur rounded-2xl p-6 border border-purple-100 hover:bg-white/80 transition-colors duration-300 hover:shadow-lg">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center gap-2 text-[#9C27B0] font-semibold">
                  <span>💐</span>
                  <span>Mother&apos;s Day Gift Guide — 25 Ideas for Every Budget</span>
                  <span>💐</span>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-[#5A4C68]">
                <div className="flex items-center justify-center">
                  <span className="mr-2">💝</span>
                  <span>Heartfelt gifts from the kids</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="mr-2">💆‍♀️</span>
                  <span>Spa & relaxation picks</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="mr-2">🎁</span>
                  <span>Budget to luxury options</span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-[#3D4F5F] mb-12">
              Sound Familiar?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#FFF5F5] p-6 rounded-2xl border border-[#FECACA]">
                <div className="text-3xl mb-3">😅</div>
                <h3 className="text-lg font-semibold text-[#3D4F5F] mb-2">
                  &quot;Wait, what did I get Aunt Carol last year?&quot;
                </h3>
                <p className="text-[#5A6C7D] text-sm">
                  You buy the same candle set. Again.
                </p>
              </div>
              <div className="bg-[#FFF5F5] p-6 rounded-2xl border border-[#FECACA]">
                <div className="text-3xl mb-3">💸</div>
                <h3 className="text-lg font-semibold text-[#3D4F5F] mb-2">
                  &quot;How did I spend $800 on Christmas?!&quot;
                </h3>
                <p className="text-[#5A6C7D] text-sm">
                  No budget tracking = surprise credit card bill.
                </p>
              </div>
              <div className="bg-[#FFF5F5] p-6 rounded-2xl border border-[#FECACA]">
                <div className="text-3xl mb-3">🎁</div>
                <h3 className="text-lg font-semibold text-[#3D4F5F] mb-2">
                  Two people buy Grandma the same gift
                </h3>
                <p className="text-[#5A6C7D] text-sm">
                  No coordination = awkward returns.
                </p>
              </div>
              <div className="bg-[#FFF5F5] p-6 rounded-2xl border border-[#FECACA]">
                <div className="text-3xl mb-3">📝</div>
                <h3 className="text-lg font-semibold text-[#3D4F5F] mb-2">
                  Lists everywhere — notes, texts, random apps
                </h3>
                <p className="text-[#5A6C7D] text-sm">
                  Nothing is organized. Chaos every holiday.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gradient-to-b from-[#3D4F5F] to-[#2D3D4B] text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Everything in One Place
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
              GiftHQ brings order to the chaos. Plan smarter. Spend wiser. Gift better.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur p-6 rounded-2xl">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-semibold mb-2">Track Everything</h3>
                <p className="text-blue-100 text-sm">
                  Every person, every gift, every occasion. See status at a glance — idea, bought, wrapped, given.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur p-6 rounded-2xl">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-semibold mb-2">Budget Dashboard</h3>
                <p className="text-blue-100 text-sm">
                  Set limits per person or occasion. Real-time spending vs budget. No more surprise bills.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur p-6 rounded-2xl">
                <div className="text-4xl mb-4">🔗</div>
                <h3 className="text-xl font-semibold mb-2">Wish List Sharing</h3>
                <p className="text-blue-100 text-sm">
                  Share your list with family. They can &quot;claim&quot; gifts so no one buys duplicates.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur p-6 rounded-2xl">
                <div className="text-4xl mb-4">🛍️</div>
                <h3 className="text-xl font-semibold mb-2">Shop Anywhere</h3>
                <p className="text-blue-100 text-sm">
                  Add gifts from Amazon, Target, Walmart, Etsy — any store. We find the best prices.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur p-6 rounded-2xl">
                <div className="text-4xl mb-4">🔔</div>
                <h3 className="text-xl font-semibold mb-2">Price Alerts</h3>
                <p className="text-blue-100 text-sm">
                  Get notified when items on your list go on sale. Never miss a deal.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur p-6 rounded-2xl">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold mb-2">AI Gift Ideas</h3>
                <p className="text-blue-100 text-sm">
                  &quot;Gift for Dad who likes fishing, under $75&quot; — we&apos;ll find perfect matches.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-[#3D4F5F] mb-12">
              Simple as 1-2-3
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#D64045] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-[#3D4F5F] mb-2">Add Your People</h3>
                <p className="text-[#5A6C7D]">
                  Family, friends, coworkers — anyone you buy gifts for. Add notes about their interests.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#F4C430] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-[#3D4F5F] mb-2">Plan & Track</h3>
                <p className="text-[#5A6C7D]">
                  Add gift ideas, set budgets, track what you&apos;ve bought. Share lists with family.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#3D4F5F] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-[#3D4F5F] mb-2">Relax & Enjoy</h3>
                <p className="text-[#5A6C7D]">
                  No stress, no duplicates, no overspending. Just thoughtful gifts, on time, on budget.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-[#3D4F5F] mb-12">
              Perfect For Every Occasion
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { emoji: '🎄', label: 'Christmas' },
                { emoji: '🎂', label: 'Birthdays' },
                { emoji: '💒', label: 'Weddings' },
                { emoji: '👶', label: 'Baby Showers' },
                { emoji: '💝', label: "Valentine's" },
                { emoji: '👩‍👧', label: "Mother's Day" },
                { emoji: '👨‍👦', label: "Father's Day" },
                { emoji: '🎓', label: 'Graduation' },
              ].map((item, i) => (
                <div key={i} className="bg-white p-4 rounded-xl text-center shadow-sm hover:shadow-md transition border border-gray-100">
                  <div className="text-3xl mb-2">{item.emoji}</div>
                  <div className="font-medium text-[#3D4F5F]">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Placeholder */}
      <section className="py-16 bg-[#FFF9F0]">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-5xl mb-6">🎁</div>
            <blockquote className="text-2xl text-[#3D4F5F] italic mb-6">
              &quot;Finally, an app that gets how chaotic holiday shopping really is. 
              I planned Christmas for 20 people and actually stayed under budget!&quot;
            </blockquote>
            <p className="text-[#5A6C7D] font-semibold">— Coming soon from beta testers</p>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3D4F5F] mb-4">
              Free to Start. Upgrade When You Need More.
            </h2>
            <p className="text-xl text-[#5A6C7D] mb-8">
              Basic gift tracking is always free. Premium features for power planners.
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-gray-200">
                <h3 className="font-semibold text-[#3D4F5F] mb-2">Free</h3>
                <div className="text-3xl font-bold text-[#3D4F5F] mb-4">$0</div>
                <ul className="text-sm text-[#5A6C7D] space-y-2">
                  <li>✓ 1 occasion</li>
                  <li>✓ 10 people</li>
                  <li>✓ Basic tracking</li>
                </ul>
              </div>
              <div className="bg-[#D64045] text-white p-6 rounded-2xl transform md:scale-105 shadow-lg">
                <h3 className="font-semibold mb-2">Plus</h3>
                <div className="text-3xl font-bold mb-4">$3.99<span className="text-lg font-normal">/mo</span></div>
                <ul className="text-sm space-y-2">
                  <li>✓ Unlimited occasions</li>
                  <li>✓ Unlimited people</li>
                  <li>✓ Price alerts</li>
                  <li>✓ No ads</li>
                </ul>
              </div>
              <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-gray-200">
                <h3 className="font-semibold text-[#3D4F5F] mb-2">Family</h3>
                <div className="text-3xl font-bold text-[#3D4F5F] mb-4">$5.99<span className="text-lg font-normal">/mo</span></div>
                <ul className="text-sm text-[#5A6C7D] space-y-2">
                  <li>✓ Everything in Plus</li>
                  <li>✓ 6 family accounts</li>
                  <li>✓ Shared lists & claiming</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="waitlist" className="py-16 bg-gradient-to-b from-[#3D4F5F] to-[#2D3D4B] text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Organized?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Start planning your gifts today. It&apos;s free to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth/signup"
                className="bg-[#F4C430] text-[#3D4F5F] px-8 py-4 rounded-full font-semibold hover:bg-[#F7D154] transition shadow-lg text-lg"
              >
                Create Free Account
              </a>
              <a
                href="/auth/login"
                className="bg-white/10 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition text-lg border border-white/30"
              >
                Sign In
              </a>
            </div>
            <p className="text-blue-200 text-sm mt-6">
              No credit card required. Free tier includes 1 occasion and 10 people.
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
              <a href="#" className="hover:text-white transition">About</a>
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
            </div>
            <div className="text-sm">
              © 2026 GiftHQ. Made with 🎁 for organized gift-givers.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
