// Design System Tokens - Professional & Enterprise-Grade

export const COLORS = {
  // Primary Color - Sophisticated Blue (Modern, Professional)
  // Inspired by: Stripe, Linear, Figma
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',  // Main brand - vibrant but professional
    600: '#0284c7',  // Hover state
    700: '#0369a1',  // Active state
    800: '#075985',
    900: '#0c3d66',
  },

  // Semantic Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',  // Vibrant but not neon
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#145231',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',  // Warm amber
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',  // Red but professional
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  info: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',  // Vibrant purple
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },

  // Neutrals - Premium Gray Scale
  // Use for backgrounds, text, borders
  neutral: {
    0: '#ffffff',
    50: '#f9fafb',   // Very light bg
    100: '#f3f4f6',  // Light bg
    150: '#f0f1f3',  // Subtle bg
    200: '#e5e7eb',  // Light borders
    300: '#d1d5db',  // Medium borders
    400: '#9ca3af',  // Secondary text
    500: '#6b7280',  // Tertiary text
    600: '#4b5563',  // Strong text
    700: '#374151',  // Heavy text
    800: '#1f2937',  // Very dark text
    900: '#111827',  // Text on light backgrounds
    950: '#030712',  // Almost black
  },

  // Extended Palettes for UI
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Light Mode Semantic
  light: {
    bg: {
      primary: '#ffffff',      // White
      secondary: '#f9fafb',    // Very light gray
      tertiary: '#f3f4f6',     // Light gray
      hover: '#f0f1f3',        // Hover state
      overlay: 'rgba(0,0,0,0.05)',
    },
    text: {
      primary: '#111827',      // Very dark gray
      secondary: '#4b5563',    // Medium gray
      tertiary: '#9ca3af',     // Light gray
      disabled: '#d1d5db',     // Very light gray
      inverse: '#ffffff',      // White on dark
    },
    border: '#e5e7eb',         // Light gray
    divider: '#f3f4f6',        // Very light
  },

  // Dark Mode Semantic
  dark: {
    bg: {
      primary: '#0f1729',      // Deep blue-black
      secondary: '#1a202f',    // Dark navy
      tertiary: '#252f42',     // Slightly lighter
      hover: '#2f3a52',        // Hover state
      overlay: 'rgba(255,255,255,0.08)',
    },
    text: {
      primary: '#f1f5f9',      // Light gray
      secondary: '#cbd5e1',    // Medium gray
      tertiary: '#94a3b8',     // Dark gray
      disabled: '#475569',     // Very dark gray
      inverse: '#111827',      // Dark on light
    },
    border: '#334155',         // Dark gray
    divider: '#1e293b',        // Very dark
  },

  // Glass/Morphism effect overlays
  glass: {
    light: 'rgba(255, 255, 255, 0.8)',
    dark: 'rgba(15, 23, 41, 0.8)',
  },
}

export const TYPOGRAPHY = {
  fontFamily: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
    display: ['Sohne', 'Inter', 'sans-serif'],  // For headlines
  },

  fontSize: {
    xs: { size: '12px', lineHeight: '16px', letterSpacing: '0.4px' },
    sm: { size: '14px', lineHeight: '20px', letterSpacing: '0.25px' },
    base: { size: '16px', lineHeight: '24px', letterSpacing: '0px' },
    lg: { size: '18px', lineHeight: '28px', letterSpacing: '0px' },
    xl: { size: '20px', lineHeight: '30px', letterSpacing: '-0.2px' },
    '2xl': { size: '24px', lineHeight: '36px', letterSpacing: '-0.3px' },
    '3xl': { size: '30px', lineHeight: '42px', letterSpacing: '-0.5px' },
    '4xl': { size: '36px', lineHeight: '48px', letterSpacing: '-0.7px' },
  },

  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  letterSpacing: {
    tight: '-0.02em',
    normal: '0em',
    wide: '0.02em',
    wider: '0.04em',
  },
}

export const SPACING = {
  0: '0',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
}

export const BORDER_RADIUS = {
  none: '0',
  xs: '2px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
}

export const SHADOWS = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  base: '0 2px 4px 0 rgba(0, 0, 0, 0.06), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 12px 0 rgba(0, 0, 0, 0.08), 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  lg: '0 10px 24px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
}

export const TRANSITIONS = {
  fast: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slower: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
}

export const BREAKPOINTS = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

export const COMPONENT_TOKENS = {
  button: {
    height: {
      xs: '28px',
      sm: '32px',
      md: '40px',
      lg: '48px',
      xl: '56px',
    },
    padding: {
      xs: '6px 10px',
      sm: '8px 12px',
      md: '10px 16px',
      lg: '12px 24px',
      xl: '14px 32px',
    },
    fontSize: {
      xs: '12px',
      sm: '13px',
      md: '14px',
      lg: '16px',
      xl: '16px',
    },
  },
  input: {
    height: '40px',
    padding: '10px 12px',
    borderWidth: '1px',
    fontSize: '14px',
    borderRadius: '6px',
  },
  card: {
    padding: '20px',
    borderRadius: '8px',
    borderWidth: '1px',
  },
  modal: {
    borderRadius: '12px',
    padding: '24px',
    borderWidth: '1px',
  },
}
