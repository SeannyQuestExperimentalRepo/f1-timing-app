import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        surface: '#12121a',
        'surface-elevated': '#1a1a2e',
        accent: '#e10600',
        border: 'rgba(255, 255, 255, 0.1)',
        text: {
          primary: '#e4e4e7',
          secondary: '#71717a',
        },
        // Team colors
        teams: {
          'red-bull': '#3671C6',
          'mercedes': '#6CD3BF',
          'ferrari': '#E8002D',
          'mclaren': '#FF8000',
          'aston-martin': '#358C75',
          'alpine': '#2293D1',
          'williams': '#37BEDD',
          'haas': '#B6BABD',
          'rb': '#6692FF',
          'sauber': '#52E252',
        },
        // Tire compound colors
        tire: {
          soft: '#E8002D',
          medium: '#FFD320',
          hard: '#EEEEEE',
          intermediate: '#52E252',
          wet: '#0066CC',
        },
        // Sector timing colors
        sector: {
          purple: '#8B5CF6', // Best overall
          green: '#10B981',  // Personal best
          yellow: '#F59E0B', // Normal
        },
        // Flag colors
        flag: {
          green: '#10B981',
          yellow: '#F59E0B',
          red: '#EF4444',
          blue: '#3B82F6',
          black: '#1F2937',
          chequered: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-subtle': 'bounce 1s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(225, 6, 0, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(225, 6, 0, 0.8)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
    },
  },
  plugins: [],
};

export default config;