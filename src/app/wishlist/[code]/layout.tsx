import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

type Props = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  
  // Use service-level client for metadata generation (server-side)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: wishlist } = await supabase
    .from('wishlists')
    .select('name, description, user:users(name)')
    .eq('share_code', code)
    .eq('is_public', true)
    .single();

  if (!wishlist) {
    return {
      title: 'Wishlist Not Found - GiftHQ',
    };
  }

  const userArr = wishlist.user as unknown as Array<{ name: string | null }> | { name: string | null } | null;
  const userName = (Array.isArray(userArr) ? userArr[0]?.name : userArr?.name) || 'Someone';
  const title = `${wishlist.name} - ${userName}'s Wishlist`;
  const description = wishlist.description || `Check out ${userName}'s wishlist on GiftHQ! Claim items so nobody buys duplicates.`;

  return {
    title: `${title} | GiftHQ`,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://gifthq.vercel.app/wishlist/${code}`,
      images: ['/og-image-v2.jpg'],
      siteName: 'GiftHQ',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image-v2.jpg'],
    },
  };
}

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
