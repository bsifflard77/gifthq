# GiftHQ Waitlist Options Research

*Research completed: 2026-02-02 by Jasper*

## Recommendation: ConvertKit (Kit)

**Why:** Free tier up to 1,000 subscribers, easy automation, scales to full email marketing post-launch.

## Options Compared

### 1. ConvertKit (Kit) ⭐ RECOMMENDED
- **Free tier:** 1,000 subscribers
- **Paid:** $15/mo for 300+ subscribers with automation
- **Pros:** 
  - Industry standard for creators/SaaS
  - Landing pages included
  - Easy automation sequences
  - Good deliverability
  - Grows with us post-launch
- **Cons:** 
  - Free tier limited on automation
- **Integration:** Simple embed form or API

### 2. LaunchList
- **Price:** $69 one-time for 10K signups
- **Pros:**
  - Built-in viral referral system
  - Simple widget integration
  - One-time cost
- **Cons:**
  - Just waitlist, not ongoing email marketing
  - Would need separate tool post-launch
- **Good for:** Viral pre-launch campaigns

### 3. Mailchimp
- **Free tier:** 500 contacts, 1,000 emails/month
- **Pros:**
  - Well-known, lots of integrations
  - Free tier available
- **Cons:**
  - Gets expensive quickly
  - Interface can be clunky
  - Less creator-focused than ConvertKit

### 4. Buttondown
- **Free tier:** 100 subscribers
- **Pros:**
  - Developer-friendly
  - Clean, simple
  - Markdown support
- **Cons:**
  - Very limited free tier
  - Less marketing automation

### 5. Prefinery
- **Specialized:** Pre-launch waitlists with referral rewards
- **Pros:** 
  - Gamified referral system
  - Leaderboards
- **Cons:**
  - Subscription pricing
  - Overkill for simple waitlist

## Implementation Plan

### Phase 1: Pre-Launch (Now)
1. Create ConvertKit account (free)
2. Create "GiftHQ Waitlist" form
3. Set up welcome email automation
4. Connect to landing page form

### Phase 2: Launch Sequence
1. Segment waitlist by signup date
2. Create launch email sequence:
   - 1 week before: "We're almost ready!"
   - 3 days before: "Early access coming"
   - Launch day: "You're in!"
   - Day 2: "Need help getting started?"

### Phase 3: Post-Launch
1. Convert to regular newsletter
2. Product updates
3. Gift guides (seasonal content)
4. Referral program emails

## API Integration

ConvertKit API for the landing page form:

```javascript
// In page.tsx handleSubmit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const response = await fetch('https://api.convertkit.com/v3/forms/FORM_ID/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.NEXT_PUBLIC_CONVERTKIT_API_KEY,
      email: email,
    }),
  });
  
  if (response.ok) {
    setSubmitted(true);
  }
};
```

## Next Steps

1. [ ] Bill creates ConvertKit account
2. [ ] Get API key and Form ID
3. [ ] Jasper integrates with landing page
4. [ ] Test signup flow
5. [ ] Create welcome email
