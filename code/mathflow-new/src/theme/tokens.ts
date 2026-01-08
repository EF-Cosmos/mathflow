/**
 * Design Tokens for MathFlow
 *
 * Central design system definitions for colors, spacing, typography,
 * borders, shadows, and transitions.
 */

export const designTokens = {
  /**
   * Color System
   * All colors defined in HSL format for CSS variable compatibility
   */
  colors: {
    // Background colors
    background: {
      primary: { light: '0 0% 100%', dark: '0 0% 4%' },      // #FFFFFF / #0A0A0A
      secondary: { light: '0 0% 98%', dark: '240 5.9% 10%' }, // #FAFAFA / #171717
      tertiary: { light: '0 0% 96%', dark: '240 3.7% 15%' },  // #F5F5F5 / #1F1F1F
      elevated: { light: '0 0% 100%', dark: '240 6% 10%' },   // Card elevation
    },

    // Foreground (text) colors
    foreground: {
      primary: { light: '0 0% 9%', dark: '0 0% 98%' },        // #111827 / #FAFAFA
      secondary: { light: '0 0% 45%', dark: '0 0% 63%' },     // #6B7280 / #A1A1AA
      muted: { light: '0 0% 63%', dark: '0 0% 45%' },         // #9CA3AF / #737373
      disabled: { light: '0 0% 75%', dark: '0 0% 35%' },      // #BDBDBD / #595959
    },

    // Semantic colors
    primary: {
      DEFAULT: '135 42% 38%',                                  // #2B5D3A (brand green)
      foreground: { light: '0 0% 100%', dark: '0 0% 100%' },
      hover: { light: '135 42% 32%', dark: '135 42% 44%' },
    },

    secondary: {
      DEFAULT: '211 73% 59%',                                  // #4A90E2 (brand blue)
      foreground: { light: '0 0% 100%', dark: '0 0% 100%' },
      hover: { light: '211 73% 54%', dark: '211 73% 64%' },
    },

    accent: {
      DEFAULT: '36 86% 56%',                                   // #F5A623 (brand orange)
      foreground: { light: '0 0% 100%', dark: '0 0% 100%' },
      hover: { light: '36 86% 51%', dark: '36 86% 61%' },
    },

    // Status colors
    success: {
      DEFAULT: { light: '142 76% 36%', dark: '142 71% 45%' }, // #10B981
      foreground: { light: '0 0% 100%', dark: '0 0% 100%' },
      bg: { light: '142 76% 96%', dark: '142 71% 15%' },
    },

    warning: {
      DEFAULT: { light: '38 92% 50%', dark: '38 92% 60%' },   // #F59E0B
      foreground: { light: '0 0% 100%', dark: '0 0% 100%' },
      bg: { light: '38 92% 96%', dark: '38 92% 15%' },
    },

    error: {
      DEFAULT: { light: '0 84% 60%', dark: '0 72% 61%' },     // #EF4444
      foreground: { light: '0 0% 100%', dark: '0 0% 100%' },
      bg: { light: '0 84% 97%', dark: '0 72% 15%' },
    },

    info: {
      DEFAULT: { light: '199 89% 48%', dark: '199 89% 58%' }, // #0EA5E9
      foreground: { light: '0 0% 100%', dark: '0 0% 100%' },
      bg: { light: '199 89% 96%', dark: '199 89% 15%' },
    },

    // Border colors
    border: {
      DEFAULT: { light: '0 0% 90%', dark: '240 3.7% 15%' },
      subtle: { light: '0 0% 95%', dark: '240 3.7% 20%' },
      strong: { light: '0 0% 80%', dark: '240 3.7% 25%' },
    },

    // Input colors
    input: {
      background: { light: '0 0% 100%', dark: '240 5.9% 10%' },
      border: { light: '0 0% 90%', dark: '240 3.7% 15%' },
      placeholder: { light: '0 0% 60%', dark: '0 0% 50%' },
    },
  },

  /**
   * Spacing Scale (in rem)
   * Based on 4px base unit (1rem = 16px)
   */
  spacing: {
    0: '0',
    px: '0.0625rem',   // 1px
    0.5: '0.125rem',   // 2px
    1: '0.25rem',      // 4px
    1.5: '0.375rem',   // 6px
    2: '0.5rem',       // 8px
    2.5: '0.625rem',   // 10px
    3: '0.75rem',      // 12px
    3.5: '0.875rem',   // 14px
    4: '1rem',         // 16px
    5: '1.25rem',      // 20px
    6: '1.5rem',       // 24px
    7: '1.75rem',      // 28px
    8: '2rem',         // 32px
    9: '2.25rem',      // 36px
    10: '2.5rem',      // 40px
    12: '3rem',        // 48px
    16: '4rem',        // 64px
    20: '5rem',        // 80px
    24: '6rem',        // 96px
  },

  /**
   * Border Radius
   */
  borderRadius: {
    none: '0',
    sm: '0.25rem',     // 4px
    DEFAULT: '0.375rem', // 6px
    md: '0.5rem',      // 8px
    lg: '0.75rem',     // 12px
    xl: '1rem',        // 16px
    '2xl': '1.5rem',   // 24px
    full: '9999px',
  },

  /**
   * Shadows
   */
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },

  /**
   * Transitions
   */
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  /**
   * Z-index scale
   */
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  /**
   * Breakpoints (for reference, defined in Tailwind config)
   */
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

export type DesignTokens = typeof designTokens;
