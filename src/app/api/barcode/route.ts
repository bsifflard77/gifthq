import { NextRequest, NextResponse } from 'next/server';

interface ProductInfo {
  barcode: string;
  title: string;
  description?: string;
  brand?: string;
  category?: string;
  image?: string;
  prices?: Array<{
    store: string;
    price: number;
    url: string;
    inStock?: boolean;
  }>;
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
    // Amazon uses ?tag= parameter
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}tag=${tag}`;
  }
  if (store.toLowerCase() === 'target') {
    // Target uses afid parameter
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}afid=${tag}`;
  }
  // Other stores - add tracking param (varies by program)
  return url;
}

// Mock product database for demo
// In production, this would call real APIs:
// - UPCItemDB (https://www.upcitemdb.com/api)
// - Barcode Lookup (https://www.barcodelookup.com/api)
// - Open Food Facts (for food items)
const MOCK_PRODUCTS: Record<string, ProductInfo> = {
  // Common products for testing
  '012000001536': {
    barcode: '012000001536',
    title: 'Pepsi Cola 12-Pack Cans',
    brand: 'Pepsi',
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=200',
    prices: [
      { store: 'Walmart', price: 5.98, url: addAffiliateTag('https://walmart.com/search?q=pepsi+12+pack', 'walmart'), inStock: true },
      { store: 'Target', price: 6.49, url: addAffiliateTag('https://target.com/s?searchTerm=pepsi+12+pack', 'target'), inStock: true },
      { store: 'Amazon', price: 7.99, url: addAffiliateTag('https://amazon.com/s?k=pepsi+12+pack', 'amazon'), inStock: true },
    ],
  },
  '190199267626': {
    barcode: '190199267626',
    title: 'Apple AirPods Pro (2nd Generation)',
    brand: 'Apple',
    category: 'Electronics > Headphones',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=200',
    prices: [
      { store: 'Amazon', price: 189.99, url: 'https://amazon.com/dp/B0CHWRXH8B', inStock: true },
      { store: 'Best Buy', price: 199.99, url: 'https://bestbuy.com', inStock: true },
      { store: 'Target', price: 199.99, url: 'https://target.com', inStock: true },
      { store: 'Walmart', price: 199.00, url: 'https://walmart.com', inStock: true },
    ],
  },
  '883929713660': {
    barcode: '883929713660',
    title: 'LEGO Star Wars Millennium Falcon',
    brand: 'LEGO',
    category: 'Toys > Building Sets',
    image: 'https://m.media-amazon.com/images/I/81Np3Uw89ZL._AC_SL1500_.jpg',
    prices: [
      { store: 'Amazon', price: 149.99, url: 'https://amazon.com', inStock: true },
      { store: 'Target', price: 169.99, url: 'https://target.com', inStock: true },
      { store: 'Walmart', price: 159.99, url: 'https://walmart.com', inStock: false },
    ],
  },
  '5000328372181': {
    barcode: '5000328372181',
    title: 'Oral-B iO Series 9 Electric Toothbrush',
    brand: 'Oral-B',
    category: 'Health & Beauty',
    image: 'https://m.media-amazon.com/images/I/71hIfcIPyxL._SL1500_.jpg',
    prices: [
      { store: 'Amazon', price: 249.99, url: 'https://amazon.com', inStock: true },
      { store: 'Target', price: 299.99, url: 'https://target.com', inStock: true },
      { store: 'Walmart', price: 279.99, url: 'https://walmart.com', inStock: true },
      { store: 'Best Buy', price: 269.99, url: 'https://bestbuy.com', inStock: true },
    ],
  },
  '194252056264': {
    barcode: '194252056264',
    title: 'Sony WH-1000XM5 Wireless Headphones',
    brand: 'Sony',
    category: 'Electronics > Headphones',
    image: 'https://m.media-amazon.com/images/I/61vJtKbAssL._AC_SL1500_.jpg',
    prices: [
      { store: 'Amazon', price: 328.00, url: 'https://amazon.com', inStock: true },
      { store: 'Best Buy', price: 349.99, url: 'https://bestbuy.com', inStock: true },
      { store: 'Target', price: 349.99, url: 'https://target.com', inStock: true },
    ],
  },
  '0078742370460': {
    barcode: '0078742370460',
    title: 'Great Value Organic Whole Milk, 1 Gallon',
    brand: 'Great Value',
    category: 'Grocery > Dairy',
    prices: [
      { store: 'Walmart', price: 5.97, url: 'https://walmart.com', inStock: true },
    ],
  },
};

// Generate a plausible product for unknown barcodes
function generateMockProduct(barcode: string): ProductInfo {
  // Use barcode to deterministically generate a "product"
  const num = parseInt(barcode.slice(-4)) || 1234;
  const categories = ['Electronics', 'Home & Kitchen', 'Toys', 'Health & Beauty', 'Sports', 'Books'];
  const category = categories[num % categories.length];
  
  const basePrice = 10 + (num % 200);
  
  return {
    barcode,
    title: `Product ${barcode.slice(-6)}`,
    brand: 'Unknown Brand',
    category,
    prices: [
      { store: 'Amazon', price: basePrice, url: addAffiliateTag(`https://amazon.com/s?k=${barcode}`, 'amazon'), inStock: true },
      { store: 'Walmart', price: basePrice * 1.05, url: addAffiliateTag(`https://walmart.com/search?q=${barcode}`, 'walmart'), inStock: true },
      { store: 'Target', price: basePrice * 1.08, url: addAffiliateTag(`https://target.com/s?searchTerm=${barcode}`, 'target'), inStock: true },
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { barcode } = body;

    if (!barcode) {
      return NextResponse.json({ error: 'Barcode is required' }, { status: 400 });
    }

    // Clean the barcode (remove spaces, dashes)
    const cleanBarcode = barcode.replace(/[\s-]/g, '');

    // In production, this would call a real barcode API:
    // const response = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${cleanBarcode}`);
    // const data = await response.json();

    // For MVP, use mock data
    let product = MOCK_PRODUCTS[cleanBarcode];

    if (!product) {
      // For demo purposes, generate a mock product
      // In production, this would return an error or "product not found"
      product = generateMockProduct(cleanBarcode);
    }

    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(product);
  } catch (error) {
    console.error('Barcode API error:', error);
    return NextResponse.json({ error: 'Failed to look up product' }, { status: 500 });
  }
}
