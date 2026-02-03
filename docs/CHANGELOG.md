# GiftHQ Changelog

## [0.2.0] - 2026-02-03

### ✨ New Features

#### Gift Reservation/Claim System (KEY DIFFERENTIATOR)
- **Anonymous claims with name tracking** — When viewing someone else's shared wishlist, you can claim items with your name (e.g., "Aunt Susan") so other gift-buyers know who's getting what
- **Owner view protection** — The wishlist owner sees their items but NOT who claimed what, preserving the surprise! They see a yellow banner explaining this
- **Unclaim functionality** — If you change your mind, you can unclaim an item you previously claimed
- **Claimed-by display** — Other viewers see "✓ Claimed by Aunt Susan" badges on items
- **All-claimed celebration** — When every item is claimed, a celebratory banner appears
- **Persistent claimer name** — Your name is saved in localStorage so you don't have to re-enter it

#### Wishlist Sharing Improvements
- **QR code generation** — Generate scannable QR codes for any shared wishlist (uses the `qrcode` npm package)
- **Share modal** — Beautiful modal with QR code, copy link button, native share API, and public preview link
- **Dynamic OG metadata** — Shared wishlist links now have proper OpenGraph titles/descriptions for nice previews when shared on social media or messaging apps
- **Native Share API** — On mobile devices, tap "Share via..." to use the OS-native share sheet (SMS, WhatsApp, etc.)
- **Share button in header** — The public wishlist page has share/QR buttons in the header for easy re-sharing

#### Occasion Reminders
- **Reminder settings per occasion** — Set reminders to fire X days before an occasion (7d, 14d, 21d, 30d, 45d, 60d options)
- **Auto-reminder on creation** — New occasions with dates automatically get a 2-week reminder (can be toggled off)
- **In-app notification banners** — Active reminders appear as colored banners on the dashboard:
  - 🚨 Red/urgent for ≤7 days away
  - ⏰ Yellow for ≤14 days away
  - 🔔 Blue for upcoming
- **Dismissable reminders** — Dismiss reminders you've acknowledged (persisted in localStorage)
- **Quick action links** — Each reminder has "Add Gifts" and "Find Ideas" shortcuts
- **Reminder management** — Edit or remove reminders via the 🔔 button on each occasion

#### Dashboard Polish
- **Budget overview** — Total budget progress bar showing spent vs. budgeted across all occasions, with color coding (green/yellow/red)
- **Gift progress pipeline** — Visual breakdown of gifts by status (Ideas → Decided → Purchased → Wrapped → Given)
- **Recent activity feed** — Shows latest gifts added and wishlists created with relative timestamps
- **Enhanced stats** — Total spent amount in the quick stats grid
- **Wishlist status** — Shows "Shareable" badge and item counts on dashboard wishlist cards
- **Updated navigation** — Bottom nav now includes Wishlists (📝 Lists) and Occasions (📅 Events) tabs

### 🗄️ Database Changes
- Added `claimed_by_name` (text) column to `wishlist_items` table — stores the name of the anonymous claimer
- Created `occasion_reminders` table — stores reminder preferences per occasion
- Created `notifications` table — for future in-app notification system
- Added RLS policies for new tables

### 🔧 Technical
- Added `qrcode` npm dependency for QR code generation
- Added `/api/qr` API endpoint for server-side QR generation
- Added `/wishlist/[code]/layout.tsx` for dynamic OG metadata on shared wishlists
- Build passes cleanly with `npm run build`

### 📦 Deployment
- GitHub repo: https://github.com/bsifflard77/gifthq
- Vercel project: gifthq.vercel.app

---

## [0.1.0] - 2026-02-02

### Initial MVP
- Landing page with hero, features, pricing, and CTA sections
- Authentication (login/signup) with email/password and Google OAuth
- App dashboard with stats, upcoming birthdays, and quick actions
- People management (CRUD with emoji avatars, birthdays, relationships)
- Gift tracking with status pipeline (idea → decided → purchased → wrapped → given)
- Wishlist management with shareable public links
- Public wishlist page at `/wishlist/[code]` with basic claim functionality
- Occasions management with budget tracking
- Barcode scanner (using html5-qrcode)
- AI Gift Finder with mock product search
- Settings page with profile management
- Amazon affiliate tag integration (`gifthq00-20`)
- Supabase backend with RLS policies
- PWA manifest
- Responsive mobile-first design with bottom navigation
