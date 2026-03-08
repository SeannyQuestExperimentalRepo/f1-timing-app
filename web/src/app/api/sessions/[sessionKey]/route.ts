import { NextRequest, NextResponse } from 'next/server';

const OPENF1_BASE_URL = 'https://api.openf1.org/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionKey: string } }
) {
  try {
    const sessionKey = params.sessionKey;
    
    const response = await fetch(`${OPENF1_BASE_URL}/sessions?session_key=${sessionKey}`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      throw new Error(`OpenF1 API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Return the first session if found
    if (Array.isArray(data) && data.length > 0) {
      return NextResponse.json(data[0]);
    } else {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session data' },
      { status: 500 }
    );
  }
}