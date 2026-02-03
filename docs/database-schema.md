# GiftHQ Database Schema

**Database:** Supabase (PostgreSQL)
**Last Updated:** 2026-02-01

---

## Tables Overview

```
users
  └── people (gift recipients)
       └── gifts
            └── gift_links (affiliate URLs)
  └── occasions
       └── occasion_people (many-to-many)
  └── wishlists
       └── wishlist_items
            └── claims
```

---

## Table: users

Core user accounts (via Supabase Auth)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (from Supabase Auth) |
| email | text | User email |
| name | text | Display name |
| avatar_url | text | Profile picture |
| subscription_tier | enum | 'free', 'plus', 'family' |
| subscription_expires_at | timestamp | When subscription ends |
| created_at | timestamp | Account created |
| updated_at | timestamp | Last update |

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'plus', 'family')),
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Table: people

People the user buys gifts for

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| name | text | Person's name |
| relationship | text | 'Mom', 'Dad', 'Friend', etc. |
| notes | text | Interests, sizes, preferences |
| birthday | date | Optional birthday |
| avatar_emoji | text | Emoji representation |
| created_at | timestamp | Created |
| updated_at | timestamp | Updated |

```sql
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  notes TEXT,
  birthday DATE,
  avatar_emoji TEXT DEFAULT '👤',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_people_user_id ON people(user_id);
```

---

## Table: occasions

Gift-giving occasions (Christmas, birthdays, etc.)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| name | text | 'Christmas 2026', 'Mom's Birthday' |
| type | enum | 'christmas', 'birthday', 'wedding', etc. |
| date | date | When the occasion is |
| budget_total | decimal | Total budget for this occasion |
| notes | text | Additional notes |
| is_recurring | boolean | Repeats yearly? |
| created_at | timestamp | Created |

```sql
CREATE TABLE occasions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('christmas', 'birthday', 'wedding', 'baby_shower', 'valentines', 'mothers_day', 'fathers_day', 'graduation', 'anniversary', 'other')),
  date DATE,
  budget_total DECIMAL(10,2),
  notes TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_occasions_user_id ON occasions(user_id);
CREATE INDEX idx_occasions_date ON occasions(date);
```

---

## Table: gifts

Individual gift items

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| person_id | uuid | FK to people (who it's for) |
| occasion_id | uuid | FK to occasions (optional) |
| name | text | Gift name/description |
| status | enum | 'idea', 'decided', 'purchased', 'wrapped', 'given' |
| price | decimal | Cost |
| budget | decimal | Planned budget for this person/gift |
| url | text | Original product URL |
| affiliate_url | text | Wrapped affiliate URL |
| retailer | text | 'amazon', 'target', etc. |
| image_url | text | Product image |
| notes | text | Additional notes |
| purchased_at | timestamp | When purchased |
| created_at | timestamp | Created |
| updated_at | timestamp | Updated |

```sql
CREATE TABLE gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  occasion_id UUID REFERENCES occasions(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'idea' CHECK (status IN ('idea', 'decided', 'purchased', 'wrapped', 'given')),
  price DECIMAL(10,2),
  budget DECIMAL(10,2),
  url TEXT,
  affiliate_url TEXT,
  retailer TEXT,
  image_url TEXT,
  notes TEXT,
  purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gifts_user_id ON gifts(user_id);
CREATE INDEX idx_gifts_person_id ON gifts(person_id);
CREATE INDEX idx_gifts_occasion_id ON gifts(occasion_id);
CREATE INDEX idx_gifts_status ON gifts(status);
```

---

## Table: wishlists

User's own wish lists (what they want)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| name | text | 'My Christmas List', 'Birthday Wishes' |
| description | text | Optional description |
| is_public | boolean | Can others see it? |
| share_code | text | Unique sharing code |
| created_at | timestamp | Created |

```sql
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  share_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_share_code ON wishlists(share_code);
```

---

## Table: wishlist_items

Items on a wish list

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| wishlist_id | uuid | FK to wishlists |
| name | text | Item name |
| url | text | Product URL |
| price | decimal | Price |
| priority | int | 1=high, 2=medium, 3=low |
| notes | text | Size, color, etc. |
| image_url | text | Product image |
| is_claimed | boolean | Has someone claimed it? |
| claimed_by | uuid | FK to users (who claimed) |
| created_at | timestamp | Created |

```sql
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT,
  price DECIMAL(10,2),
  priority INT DEFAULT 2 CHECK (priority IN (1, 2, 3)),
  notes TEXT,
  image_url TEXT,
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wishlist_items_wishlist_id ON wishlist_items(wishlist_id);
```

---

## Table: affiliate_clicks

Track affiliate link clicks for revenue

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| gift_id | uuid | FK to gifts (optional) |
| retailer | text | 'amazon', 'target', etc. |
| original_url | text | Original URL |
| clicked_at | timestamp | When clicked |

```sql
CREATE TABLE affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  gift_id UUID REFERENCES gifts(id),
  retailer TEXT NOT NULL,
  original_url TEXT NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_affiliate_clicks_retailer ON affiliate_clicks(retailer);
CREATE INDEX idx_affiliate_clicks_clicked_at ON affiliate_clicks(clicked_at);
```

---

## Views

### v_occasion_summary

Budget vs spent per occasion

```sql
CREATE VIEW v_occasion_summary AS
SELECT 
  o.id,
  o.user_id,
  o.name,
  o.budget_total,
  COALESCE(SUM(g.price), 0) as total_spent,
  o.budget_total - COALESCE(SUM(g.price), 0) as remaining,
  COUNT(g.id) as gift_count,
  COUNT(CASE WHEN g.status = 'purchased' THEN 1 END) as purchased_count
FROM occasions o
LEFT JOIN gifts g ON g.occasion_id = o.id AND g.status IN ('purchased', 'wrapped', 'given')
GROUP BY o.id;
```

### v_person_gifts

All gifts for a person across occasions

```sql
CREATE VIEW v_person_gifts AS
SELECT 
  p.id as person_id,
  p.user_id,
  p.name as person_name,
  g.id as gift_id,
  g.name as gift_name,
  g.status,
  g.price,
  o.name as occasion_name,
  o.date as occasion_date
FROM people p
LEFT JOIN gifts g ON g.person_id = p.id
LEFT JOIN occasions o ON g.occasion_id = o.id;
```

---

## Row Level Security (RLS)

Enable RLS on all tables so users can only see their own data:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own people" ON people
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own occasions" ON occasions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own gifts" ON gifts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own wishlists" ON wishlists
  FOR ALL USING (auth.uid() = user_id);

-- Wishlist items: owner OR viewer with share_code
CREATE POLICY "Wishlist items access" ON wishlist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wishlists w 
      WHERE w.id = wishlist_id 
      AND (w.user_id = auth.uid() OR w.is_public = true)
    )
  );
```

---

## Next Steps

1. [ ] Create Supabase project
2. [ ] Run schema SQL
3. [ ] Enable RLS policies
4. [ ] Set up auth providers (Email, Google)
5. [ ] Create API routes in Next.js
6. [ ] Test CRUD operations
