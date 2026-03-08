import { NextRequest, NextResponse } from 'next/server';

const OPENF1_BASE_URL = 'https://api.openf1.org/v1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionKey = searchParams.get('session_key');
    const category = searchParams.get('category');
    const flag = searchParams.get('flag');
    
    if (!sessionKey) {
      return NextResponse.json(
        { error: 'session_key parameter is required' },
        { status: 400 }
      );
    }
    
    const params = new URLSearchParams({ session_key: sessionKey });
    if (category) params.append('category', category);
    if (flag) params.append('flag', flag);
    
    const response = await fetch(`${OPENF1_BASE_URL}/race_control?${params}`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 30 } // Short cache for race control
    });

    if (!response.ok) {
      throw new Error(`OpenF1 API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Race Control API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch race control data' },
      { status: 500 }
    );
  }
}