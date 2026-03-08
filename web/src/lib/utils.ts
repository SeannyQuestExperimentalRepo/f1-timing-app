import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Time formatting functions
export function formatLapTime(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return '--:---.---';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const sec = Math.floor(remainingSeconds);
  const ms = Math.round((remainingSeconds - sec) * 1000);
  
  if (minutes > 0) {
    return `${minutes}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  }
  return `${sec}.${ms.toString().padStart(3, '0')}`;
}

export function formatSectorTime(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return '--.---';
  
  const sec = Math.floor(seconds);
  const ms = Math.round((seconds - sec) * 1000);
  
  return `${sec}.${ms.toString().padStart(3, '0')}`;
}

export function formatGap(seconds: number | null | undefined): string {
  if (!seconds) return '-';
  
  const absSeconds = Math.abs(seconds);
  
  if (absSeconds >= 60) {
    const minutes = Math.floor(absSeconds / 60);
    const remainingSeconds = absSeconds % 60;
    const formatted = `${minutes}:${remainingSeconds.toFixed(1).padStart(4, '0')}`;
    return seconds < 0 ? `-${formatted}` : `+${formatted}`;
  }
  
  const formatted = absSeconds.toFixed(3);
  return seconds < 0 ? `-${formatted}` : `+${formatted}`;
}

export function formatInterval(seconds: number | null | undefined): string {
  if (!seconds) return '-';
  
  if (Math.abs(seconds) >= 60) {
    const minutes = Math.floor(Math.abs(seconds) / 60);
    const remainingSeconds = Math.abs(seconds) % 60;
    return `${minutes}:${remainingSeconds.toFixed(1).padStart(4, '0')}`;
  }
  
  return seconds.toFixed(3);
}

// Temperature formatting
export function formatTemp(celsius: number | null | undefined): string {
  if (celsius === null || celsius === undefined) return '-°C';
  return `${celsius.toFixed(1)}°C`;
}

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9/5) + 32;
}

// Speed formatting
export function formatSpeed(kmh: number | null | undefined): string {
  if (!kmh) return '-';
  return `${Math.round(kmh)}`;
}

export function formatSpeedWithUnit(kmh: number | null | undefined): string {
  if (!kmh) return '- km/h';
  return `${Math.round(kmh)} km/h`;
}

export function kmhToMph(kmh: number): number {
  return kmh * 0.621371;
}

// Percentage formatting
export function formatPercentage(value: number | null | undefined): string {
  if (!value) return '-';
  return `${Math.round(value)}%`;
}

// Position formatting
export function formatPosition(position: number | null | undefined): string {
  if (!position) return '-';
  
  const suffix = ['th', 'st', 'nd', 'rd'];
  const v = position % 100;
  return position + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
}

// Lap number formatting
export function formatLapNumber(lap: number | null | undefined): string {
  if (!lap) return '-';
  return `L${lap}`;
}

// Time ago formatting
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Session time formatting (elapsed time)
export function formatSessionTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${Math.floor(secs).toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${Math.floor(secs).toString().padStart(2, '0')}`;
}

// Tire age formatting
export function formatTireAge(laps: number | null | undefined): string {
  if (!laps) return '-';
  return `${laps} lap${laps === 1 ? '' : 's'}`;
}

// Wind direction formatting
export function formatWindDirection(degrees: number | null | undefined): string {
  if (degrees === null || degrees === undefined) return '-';
  
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((degrees % 360) + 360) % 360 / 45) % 8;
  
  return directions[index];
}

// DRS state formatting
export function formatDRSState(drs: number): 'Closed' | 'Opening' | 'Open' | 'Enabled' {
  if (drs === 0) return 'Closed';
  if (drs >= 1 && drs <= 8) return 'Opening';
  if (drs >= 9 && drs <= 14) return 'Open';
  return 'Enabled';
}

// Brake state formatting  
export function formatBrakeState(brake: boolean): 'On' | 'Off' {
  return brake ? 'On' : 'Off';
}

// Color utilities
export function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0, 0, 0, ${alpha})`;
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Number animations
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

export function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

// Array utilities
export function groupBy<T, K extends keyof any>(array: T[], key: (item: T) => K): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const group = key(item);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

// Validation utilities
export function isValidDriverNumber(num: number): boolean {
  return num >= 1 && num <= 99;
}

export function isValidLapTime(seconds: number): boolean {
  return seconds > 0 && seconds < 300; // 0 to 5 minutes
}

export function isValidSpeed(kmh: number): boolean {
  return kmh >= 0 && kmh <= 400; // 0 to 400 km/h
}

// Local storage helpers
export function getStoredValue<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStoredValue<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}