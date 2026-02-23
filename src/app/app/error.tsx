'use client';

import { useEffect } from 'react';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('GiftHQ App Error:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <div className="text-6xl mb-4">🎁</div>
        <h2 className="text-xl font-bold text-[#3D4F5F] mb-2">
          Something went wrong
        </h2>
        <p className="text-[#5A6C7D] mb-6">
          Don&apos;t worry — your gifts and lists are safe! Try refreshing.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#D64045] text-white rounded-xl font-medium hover:bg-[#B83539] transition"
          >
            Try Again
          </button>
          <a
            href="/app"
            className="px-6 py-3 bg-[#3D4F5F] text-white rounded-xl font-medium hover:bg-[#4A5D6E] transition"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
