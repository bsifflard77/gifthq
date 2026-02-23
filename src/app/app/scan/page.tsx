'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

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

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  const startScanner = async () => {
    setError(null);
    setScannedCode(null);
    setProduct(null);
    
    try {
      // Dynamically import to avoid SSR issues
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');
      
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch (e) {
          // Ignore stop errors from previous instance
        }
        scannerRef.current = null;
      }

      // Wait for DOM to be ready and container to have dimensions
      await new Promise(resolve => setTimeout(resolve, 300));

      const container = document.getElementById('scanner-container');
      if (!container) {
        setError('Scanner container not found. Please refresh and try again.');
        return;
      }

      // Verify container has dimensions
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        console.warn('Scanner container has zero dimensions, forcing size');
        container.style.width = '100%';
        container.style.minHeight = '300px';
        // Wait for reflow
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Configure barcode formats explicitly — without this, only QR codes are scanned
      const formatsToSupport = [
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.CODE_93,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.DATA_MATRIX,
      ];

      const scanner = new Html5Qrcode('scanner-container', {
        formatsToSupport,
        verbose: false,
      });
      scannerRef.current = scanner;

      const scanConfig = {
        fps: 15,
        qrbox: { width: 280, height: 160 },
        aspectRatio: 1.777,
        disableFlip: false,
      };

      const onSuccess = async (decodedText: string) => {
        // Success - barcode scanned
        if (!mountedRef.current) return;
        setScannedCode(decodedText);
        setScanning(false);
        try {
          await scanner.stop();
        } catch (e) {
          // Ignore stop errors
        }
        scannerRef.current = null;
        if (mountedRef.current) {
          lookupProduct(decodedText);
        }
      };

      const onFailure = () => {
        // Ignore scan failures (continuous scanning)
      };

      // Try back camera first, fall back to front camera for desktop
      try {
        await scanner.start(
          { facingMode: 'environment' },
          scanConfig,
          onSuccess,
          onFailure
        );
      } catch (envErr: any) {
        console.warn('Back camera failed, trying front camera:', envErr.message);
        try {
          await scanner.start(
            { facingMode: 'user' },
            scanConfig,
            onSuccess,
            onFailure
          );
        } catch (userErr: any) {
          console.warn('Named camera failed, trying any camera:', userErr.message);
          // Last resort: try to get any available camera
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            await scanner.start(
              devices[0].id,
              scanConfig,
              onSuccess,
              onFailure
            );
          } else {
            throw new Error('No cameras found on this device.');
          }
        }
      }

      setScanning(true);
    } catch (err: any) {
      console.error('Scanner error:', err);
      const msg = err?.message || String(err);
      if (msg.includes('Permission') || msg.includes('NotAllowed') || err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings and try again.');
      } else if (msg.includes('NotFound') || msg.includes('No camera') || msg.includes('Requested device not found')) {
        setError('No camera found on this device. Try entering the barcode manually below.');
      } else if (msg.includes('NotReadableError') || msg.includes('Could not start video source')) {
        setError('Camera is in use by another app. Close other camera apps and try again.');
      } else if (msg.includes('OverconstrainedError')) {
        setError('Camera does not support the requested settings. Try a different device.');
      } else {
        setError(`Could not start camera: ${msg}. Try entering the code manually below.`);
      }
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        // Ignore stop errors
      }
    }
    setScanning(false);
  };

  const lookupProduct = async (code: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/barcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: code }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setProduct(null);
      } else {
        setProduct(data);
      }
    } catch (err) {
      setError('Failed to look up product. Please try again.');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      setScannedCode(manualCode.trim());
      lookupProduct(manualCode.trim());
    }
  };

  const handleAddToWishlist = () => {
    // TODO: Implement add to wishlist
    alert('Coming soon: Add to your wishlist!');
  };

  const handleFindDeals = () => {
    if (product) {
      // Navigate to search with product name
      window.location.href = `/app/search?q=${encodeURIComponent(product.title)}`;
    }
  };

  const resetScan = () => {
    setScannedCode(null);
    setProduct(null);
    setError(null);
    setManualCode('');
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      // Cleanup on unmount — prevent state updates and stop camera
      mountedRef.current = false;
      if (scannerRef.current) {
        const scanner = scannerRef.current;
        scannerRef.current = null;
        try {
          scanner.stop().catch(() => {});
        } catch (e) {
          // Ignore any cleanup errors
        }
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#3D4F5F]">📷 Scan & Save</h1>
          <p className="text-[#5A6C7D] mt-1">
            Scan a barcode to find the best deals
          </p>
        </div>
        <Link
          href="/app"
          className="text-[#5A6C7D] hover:text-[#3D4F5F] transition"
        >
          ← Back
        </Link>
      </div>

      {/* Scanner Area */}
      {!scannedCode && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Camera View */}
          <div className="relative bg-black" style={{ width: '100%', minHeight: '300px', aspectRatio: '16/10' }}>
            <div
              id="scanner-container"
              ref={containerRef}
              className="absolute inset-0"
              style={{ width: '100%', height: '100%', minHeight: '300px' }}
            />
            
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90">
                <div className="text-6xl mb-4">📷</div>
                <button
                  onClick={startScanner}
                  className="px-8 py-4 bg-[#D64045] text-white rounded-full font-bold text-lg hover:bg-[#B83539] transition"
                >
                  Start Scanning
                </button>
                <p className="text-gray-400 mt-4 text-sm">
                  Point camera at any barcode or QR code
                </p>
              </div>
            )}

            {scanning && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <button
                  onClick={stopScanner}
                  className="px-6 py-2 bg-white/90 text-gray-800 rounded-full font-medium hover:bg-white transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Manual Entry */}
          <div className="p-4 border-t border-gray-100">
            <p className="text-sm text-[#5A6C7D] mb-2">Or enter code manually:</p>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter UPC or barcode number..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D64045]/20 focus:border-[#D64045]"
              />
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="px-6 py-2 bg-[#3D4F5F] text-white rounded-lg font-medium hover:bg-[#4A5D6E] disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Look Up
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-medium text-red-800">{error}</p>
            <button
              onClick={resetScan}
              className="text-red-600 text-sm underline mt-1"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin border-t-[#D64045]"></div>
            <div className="absolute inset-0 flex items-center justify-center text-2xl">🔍</div>
          </div>
          <p className="mt-4 text-[#5A6C7D]">Looking up product...</p>
          <p className="text-sm text-[#5A6C7D]/70">Barcode: {scannedCode}</p>
        </div>
      )}

      {/* Product Result */}
      {product && !loading && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Product Header */}
          <div className="p-6 flex gap-4">
            {product.image ? (
              <img
                src={product.image}
                alt={product.title}
                className="w-24 h-24 object-contain bg-gray-50 rounded-xl"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center text-4xl">
                📦
              </div>
            )}
            <div className="flex-1">
              <h2 className="font-bold text-lg text-[#3D4F5F]">{product.title}</h2>
              {product.brand && (
                <p className="text-[#5A6C7D]">{product.brand}</p>
              )}
              {product.category && (
                <p className="text-sm text-[#5A6C7D]/70">{product.category}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">UPC: {product.barcode}</p>
            </div>
          </div>

          {/* Price Comparison */}
          {product.prices && product.prices.length > 0 && (
            <div className="border-t border-gray-100 p-4">
              <h3 className="font-semibold text-[#3D4F5F] mb-3">💰 Price Comparison</h3>
              <div className="space-y-2">
                {product.prices
                  .sort((a, b) => a.price - b.price)
                  .map((p, i) => (
                    <a
                      key={i}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between p-3 rounded-xl transition ${
                        i === 0
                          ? 'bg-green-50 border-2 border-green-200'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {p.store === 'Amazon' && '📦'}
                          {p.store === 'Target' && '🎯'}
                          {p.store === 'Walmart' && '🏪'}
                          {p.store === 'Best Buy' && '🔌'}
                          {!['Amazon', 'Target', 'Walmart', 'Best Buy'].includes(p.store) && '🛒'}
                        </span>
                        <div>
                          <span className="font-medium text-[#3D4F5F]">{p.store}</span>
                          {i === 0 && (
                            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                              BEST PRICE
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${i === 0 ? 'text-green-600' : 'text-[#3D4F5F]'}`}>
                          ${p.price.toFixed(2)}
                        </span>
                        <span className="text-gray-400">→</span>
                      </div>
                    </a>
                  ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-4 bg-gray-50 flex gap-3">
            <button
              onClick={handleAddToWishlist}
              className="flex-1 px-4 py-3 bg-[#D64045] text-white rounded-xl font-medium hover:bg-[#B83539] transition flex items-center justify-center gap-2"
            >
              💝 Add to Wishlist
            </button>
            <button
              onClick={handleFindDeals}
              className="flex-1 px-4 py-3 bg-[#3D4F5F] text-white rounded-xl font-medium hover:bg-[#4A5D6E] transition flex items-center justify-center gap-2"
            >
              🔍 Find More Deals
            </button>
          </div>

          {/* Demo Notice */}
          <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 text-center">
            <p className="text-xs text-amber-700">
              🧪 Demo mode — showing sample data. Real product lookups coming soon!
            </p>
          </div>

          {/* Scan Another */}
          <div className="p-4 border-t border-gray-100 text-center">
            <button
              onClick={resetScan}
              className="text-[#D64045] font-medium hover:underline"
            >
              📷 Scan Another Product
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      {!scannedCode && !error && (
        <div className="bg-gradient-to-br from-[#FFF9F0] to-[#FFF3E0] rounded-2xl p-5 border border-[#F4C430]/20">
          <h3 className="font-semibold text-[#3D4F5F] mb-3">💡 Pro Tips</h3>
          <ul className="space-y-2 text-sm text-[#5A6C7D]">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Works with UPC barcodes, QR codes, and ISBN numbers</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Hold your phone steady about 6 inches from the barcode</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Make sure there's good lighting on the barcode</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Scan products in-store to find the best online price!</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
