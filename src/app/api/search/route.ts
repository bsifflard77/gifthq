import { NextRequest, NextResponse } from 'next/server';

interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  stores: string[];
}

interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  url: string;
  store: string;
  rating?: number;
  reviews?: number;
  deal?: boolean;
}

// Affiliate tags - replace with real tags after signup
const AFFILIATE_TAGS = {
  amazon: 'gifthq00-20',      // ✅ LIVE - Amazon Associates tag
  target: '7963676',          // ✅ LIVE - Target affiliate ID
  walmart: 'gifthq',          // TODO: Replace with real Walmart affiliate ID
  bestbuy: 'gifthq',          // TODO: Replace with real Best Buy affiliate ID
  etsy: 'gifthq',             // TODO: Replace with real Etsy affiliate ID
};

// Helper to add affiliate tags to URLs
function addAffiliateTag(url: string, store: string): string {
  const tag = AFFILIATE_TAGS[store.toLowerCase() as keyof typeof AFFILIATE_TAGS];
  if (!tag) return url;
  
  if (store.toLowerCase() === 'amazon') {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}tag=${tag}`;
  }
  if (store.toLowerCase() === 'target') {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}afid=${tag}`;
  }
  return url;
}

// Mock product database - in production, this would call real APIs
// (SerpApi, Traject Data, or individual retailer APIs)
const MOCK_PRODUCTS: Product[] = [
  // Dinosaur toys for kids
  {
    id: 'amz-dino-1',
    title: 'LEGO Jurassic World T. Rex Dinosaur Fossil Exhibition Building Kit',
    price: 39.99,
    originalPrice: 49.99,
    image: 'https://m.media-amazon.com/images/I/81Y0VHMdErL._AC_SL1500_.jpg',
    url: 'https://amazon.com/dp/B08HVHT2S2',
    store: 'amazon',
    rating: 4.8,
    reviews: 2341,
    deal: true,
  },
  {
    id: 'tgt-dino-1',
    title: 'National Geographic Dino Fossil Dig Kit - 15 Real Fossils',
    price: 29.99,
    image: 'https://target.scene7.com/is/image/Target/GUEST_12345',
    url: 'https://target.com/p/-/A-12345678',
    store: 'target',
    rating: 4.7,
    reviews: 892,
  },
  {
    id: 'wmt-dino-1',
    title: 'Remote Control Dinosaur Toy - Walking T-Rex with LED Eyes',
    price: 24.88,
    originalPrice: 34.99,
    image: 'https://i5.walmartimages.com/asr/12345.jpg',
    url: 'https://walmart.com/ip/12345',
    store: 'walmart',
    rating: 4.5,
    reviews: 1203,
    deal: true,
  },
  {
    id: 'amz-dino-2',
    title: 'Dinosaur Encyclopedia: The Definitive Visual Guide',
    price: 22.49,
    originalPrice: 30.00,
    image: 'https://m.media-amazon.com/images/I/91ABC123.jpg',
    url: 'https://amazon.com/dp/B08ABCD123',
    store: 'amazon',
    rating: 4.9,
    reviews: 5621,
    deal: true,
  },
  // Gardening gifts
  {
    id: 'amz-garden-1',
    title: 'Garden Tool Set with Trowel, Pruners & Gloves in Gift Box',
    price: 34.99,
    image: 'https://m.media-amazon.com/images/I/81Garden.jpg',
    url: 'https://amazon.com/dp/B09GARDEN',
    store: 'amazon',
    rating: 4.6,
    reviews: 3421,
  },
  {
    id: 'etsy-garden-1',
    title: 'Personalized Garden Stones - Custom Engraved Stepping Stone',
    price: 42.00,
    image: 'https://i.etsystatic.com/garden123.jpg',
    url: 'https://etsy.com/listing/123456',
    store: 'etsy',
    rating: 4.9,
    reviews: 892,
  },
  {
    id: 'tgt-garden-1',
    title: 'Indoor Herb Garden Starter Kit with LED Grow Light',
    price: 49.99,
    originalPrice: 64.99,
    image: 'https://target.scene7.com/is/image/Target/herb123',
    url: 'https://target.com/p/-/A-87654321',
    store: 'target',
    rating: 4.4,
    reviews: 567,
    deal: true,
  },
  // Tech gadgets
  {
    id: 'bb-tech-1',
    title: 'Apple AirTag 4 Pack - Find Your Keys, Wallet & More',
    price: 79.99,
    originalPrice: 99.00,
    image: 'https://pisces.bbystatic.com/airtag.jpg',
    url: 'https://bestbuy.com/site/12345',
    store: 'bestbuy',
    rating: 4.8,
    reviews: 12453,
    deal: true,
  },
  {
    id: 'amz-tech-1',
    title: 'Anker PowerCore 20000mAh Portable Charger',
    price: 39.99,
    image: 'https://m.media-amazon.com/images/I/anker123.jpg',
    url: 'https://amazon.com/dp/B0ANKER123',
    store: 'amazon',
    rating: 4.7,
    reviews: 89234,
  },
  {
    id: 'wmt-tech-1',
    title: 'Tile Mate Bluetooth Tracker 4-Pack',
    price: 54.88,
    originalPrice: 69.99,
    image: 'https://i5.walmartimages.com/tile123.jpg',
    url: 'https://walmart.com/ip/tile123',
    store: 'walmart',
    rating: 4.5,
    reviews: 4521,
    deal: true,
  },
  // Cozy/comfort gifts
  {
    id: 'amz-cozy-1',
    title: 'Weighted Blanket 15lbs - Premium Soft & Breathable',
    price: 49.99,
    originalPrice: 79.99,
    image: 'https://m.media-amazon.com/images/I/blanket123.jpg',
    url: 'https://amazon.com/dp/B0BLANKET',
    store: 'amazon',
    rating: 4.6,
    reviews: 34521,
    deal: true,
  },
  {
    id: 'tgt-cozy-1',
    title: 'Barefoot Dreams CozyChic Throw Blanket',
    price: 69.00,
    image: 'https://target.scene7.com/is/image/Target/barefoot123',
    url: 'https://target.com/p/-/A-COZY123',
    store: 'target',
    rating: 4.9,
    reviews: 2341,
  },
  {
    id: 'etsy-cozy-1',
    title: 'Personalized Candle Gift Set - 3 Custom Scents',
    price: 38.00,
    image: 'https://i.etsystatic.com/candle123.jpg',
    url: 'https://etsy.com/listing/candle123',
    store: 'etsy',
    rating: 4.8,
    reviews: 1892,
  },
  // Anniversary gifts
  {
    id: 'etsy-ann-1',
    title: 'Custom Star Map - The Night We Met Personalized Print',
    price: 45.00,
    image: 'https://i.etsystatic.com/starmap123.jpg',
    url: 'https://etsy.com/listing/starmap123',
    store: 'etsy',
    rating: 4.9,
    reviews: 8921,
  },
  {
    id: 'amz-ann-1',
    title: 'Willow Tree Anniversary Sculpted Figure',
    price: 52.99,
    image: 'https://m.media-amazon.com/images/I/willow123.jpg',
    url: 'https://amazon.com/dp/B0WILLOW',
    store: 'amazon',
    rating: 4.8,
    reviews: 12341,
  },
  {
    id: 'etsy-ann-2',
    title: 'Personalized Coordinates Bracelet - Where We Met',
    price: 32.00,
    image: 'https://i.etsystatic.com/bracelet123.jpg',
    url: 'https://etsy.com/listing/bracelet123',
    store: 'etsy',
    rating: 4.7,
    reviews: 3421,
  },
];

// Keywords for matching
const KEYWORD_CATEGORIES: Record<string, string[]> = {
  dinosaur: ['dino', 'dinosaur', 't-rex', 'jurassic', 'fossil', 'prehistoric'],
  garden: ['garden', 'gardening', 'plant', 'herb', 'flower', 'outdoor', 'yard'],
  tech: ['tech', 'gadget', 'electronic', 'device', 'smart', 'charger', 'tracker', 'apple', 'wireless'],
  cozy: ['cozy', 'comfort', 'blanket', 'candle', 'soft', 'warm', 'relax', 'college', 'student', 'dorm'],
  anniversary: ['anniversary', 'romantic', 'couple', 'love', 'wife', 'husband', 'wedding', 'married'],
  kids: ['kid', 'child', 'children', 'boy', 'girl', 'year old', 'young', 'grandson', 'granddaughter', 'grandchild', 'grandkid'],
  mom: ['mom', 'mother', 'mama', 'her', 'she', 'woman', 'wife'],
  dad: ['dad', 'father', 'papa', 'him', 'he', 'man', 'husband'],
};

function matchProducts(query: string, filters: SearchFilters): Product[] {
  const queryLower = query.toLowerCase();
  
  // Determine categories from query
  const matchedCategories: string[] = [];
  for (const [category, keywords] of Object.entries(KEYWORD_CATEGORIES)) {
    if (keywords.some(kw => queryLower.includes(kw))) {
      matchedCategories.push(category);
    }
  }

  // Extract price from query
  const priceMatch = queryLower.match(/under \$?(\d+)/i) || queryLower.match(/\$(\d+)/);
  const maxPrice = priceMatch ? parseInt(priceMatch[1]) : filters.maxPrice;

  // Filter products
  let results = MOCK_PRODUCTS.filter(product => {
    // Store filter
    if (!filters.stores.includes(product.store)) {
      return false;
    }

    // Price filters
    if (filters.minPrice && product.price < filters.minPrice) {
      return false;
    }
    if (maxPrice && product.price > maxPrice) {
      return false;
    }

    // Category matching (if we found categories, use them)
    if (matchedCategories.length > 0) {
      const productId = product.id.toLowerCase();
      const productTitle = product.title.toLowerCase();
      
      // Check if product matches any category
      for (const category of matchedCategories) {
        const categoryKeywords = KEYWORD_CATEGORIES[category];
        if (categoryKeywords.some(kw => productId.includes(kw.substring(0, 4)) || productTitle.includes(kw))) {
          return true;
        }
      }
      return false;
    }

    return true;
  });

  // Sort: deals first, then by rating
  results.sort((a, b) => {
    if (a.deal && !b.deal) return -1;
    if (!a.deal && b.deal) return 1;
    return (b.rating || 0) - (a.rating || 0);
  });

  return results;
}

function generateSuggestions(query: string, results: Product[]): string[] {
  const suggestions: string[] = [];
  const queryLower = query.toLowerCase();

  // Add relevant suggestions based on query
  if (queryLower.includes('kid') || queryLower.includes('child') || queryLower.includes('year old')) {
    suggestions.push("Educational toys often make great gifts that parents appreciate too!");
  }
  
  if (queryLower.includes('mom') || queryLower.includes('mother')) {
    suggestions.push("Consider experience gifts like spa days or cooking classes if she's hard to shop for.");
  }

  if (queryLower.includes('dad') || queryLower.includes('father')) {
    suggestions.push("Practical gifts that upgrade something he already uses often go over well.");
  }

  if (queryLower.includes('anniversary') || queryLower.includes('wife') || queryLower.includes('husband')) {
    suggestions.push("Personalized gifts with meaningful dates or locations add a special touch.");
  }

  if (results.some(p => p.deal)) {
    const dealCount = results.filter(p => p.deal).length;
    suggestions.push(`Found ${dealCount} items on sale! Great time to buy.`);
  }

  // Add comparison suggestion
  if (results.length > 3) {
    const stores = [...new Set(results.map(p => p.store))];
    if (stores.length > 1) {
      suggestions.push(`Compare prices across ${stores.length} stores to find the best deal.`);
    }
  }

  return suggestions.slice(0, 3);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // In production, this would call real APIs:
    // - SerpApi for Google Shopping
    // - Traject Data's Rainforest API for Amazon
    // - Traject Data's BlueCart API for Walmart
    // - Traject Data's RedCircle API for Target
    // etc.

    // For MVP, use mock matching
    const products = matchProducts(query, filters);
    const suggestions = generateSuggestions(query, products);

    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({
      products,
      suggestions,
      query,
      totalResults: products.length,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
