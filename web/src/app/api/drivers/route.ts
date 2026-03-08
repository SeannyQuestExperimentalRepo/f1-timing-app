import { NextRequest, NextResponse } from 'next/server';

const OPENF1_BASE_URL = 'https://api.openf1.org/v1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionKey = searchParams.get('session_key');
    
    if (!sessionKey) {
      return NextResponse.json(
        { error: 'session_key parameter is required' },
        { status: 400 }
      );
    }
    
    const response = await fetch(`${OPENF1_BASE_URL}/drivers?session_key=${sessionKey}`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      throw new Error(`OpenF1 API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Drivers API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drivers data' },
      { status: 500 }
    );
  }
}