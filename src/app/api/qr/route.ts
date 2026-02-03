import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#3D4F5F',
        light: '#FFFFFF',
      },
    });

    return NextResponse.json({ qr: qrDataUrl });
  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}
