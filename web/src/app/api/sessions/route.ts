import { NextRequest, NextResponse } from 'next/server';

const OPENF1_BASE_URL = 'https://api.openf1.org/v1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || '2024';
    
    const response = await fetch(`${OPENF1_BASE_URL}/sessions?year=${year}`, {
      headers: {
        'Accept': 'application/json',
      },
      // Add cache for 5 minutes since session data doesn't change often
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      throw new Error(`OpenF1 API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Sessions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions data' },
      { status: 500 }
    );
  }
}