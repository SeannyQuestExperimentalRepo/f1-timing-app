import { NextRequest, NextResponse } from 'next/server';

const OPENF1_BASE_URL = 'https://api.openf1.org/v1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionKey = searchParams.get('session_key');
    const driverNumber = searchParams.get('driver_number');
    const dateGte = searchParams.get('date_gte');
    const dateLte = searchParams.get('date_lte');
    const limit = searchParams.get('limit') || '100';
    
    if (!sessionKey) {
      return NextResponse.json(
        { error: 'session_key parameter is required' },
        { status: 400 }
      );
    }
    
    const params = new URLSearchParams({ 
      session_key: sessionKey,
      limit 
    });
    if (driverNumber) params.append('driver_number', driverNumber);
    if (dateGte) params.append('date%3E%3D', dateGte);
    if (dateLte) params.append('date%3C%3D', dateLte);
    
    const response = await fetch(`${OPENF1_BASE_URL}/car_data?${params}`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 10 } // Very short cache for telemetry
    });

    if (!response.ok) {
      throw new Error(`OpenF1 API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Car Data API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch car data' },
      { status: 500 }
    );
  }
}