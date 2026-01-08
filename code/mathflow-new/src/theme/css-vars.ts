/**
 * CSS Variable Generator
 *
 * Generates CSS custom properties from theme definitions
 */

import { lightTheme, darkTheme, type Theme } from './themes';

/**
 * Convert theme object to CSS variable string
 */
function themeToCSSVars(theme: Theme, prefix: string = ''): string {
  const vars: string[] = [];

  for (const [key, value] of Object.entries(theme.colors)) {
    const varName = prefix ? `${prefix}-${key}` : key;
    vars.push(`  --${varName}: ${value};`);
  }

  return vars.join('\n');
}

/**
 * Generate CSS for both themes
 */
export function generateThemeCSS(): string {
  const lightVars = themeToCSSVars(lightTheme);
  const darkVars = themeToCSSVars(darkTheme);

  return `
/* Light Theme */
:root {
${lightVars}
  --radius: ${lightTheme.borderRadius};
}

/* Dark Theme */
.dark {
${darkVars}
  --radius: ${darkTheme.borderRadius};
}
`;
}

/**
 * Get CSS variable name for a theme color
 */
export function getCSSVar(colorName: string): string {
  return `hsl(var(--${colorName}))`;
}

/**
 * Common CSS variable mappings for use in components
 */
export const cssVars = {
  // Background
  background: getCSSVar('background'),
  backgroundSecondary: getCSSVar('background-secondary'),
  backgroundTertiary: getCSSVar('background-tertiary'),
  backgroundElevated: getCSSVar('background-elevated'),

  // Foreground
  foreground: getCSSVar('foreground'),
  foregroundSecondary: getCSSVar('foreground-secondary'),
  foregroundMuted: getCSSVar('foreground-muted'),

  // Primary
  primary: getCSSVar('primary'),
  primaryForeground: getCSSVar('primary-foreground'),
  primaryHover: getCSSVar('primary-hover'),

  // Secondary
  secondary: getCSSVar('secondary'),
  secondaryForeground: getCSSVar('secondary-foreground'),

  // Accent
  accent: getCSSVar('accent'),
  accentForeground: getCSSVar('accent-foreground'),

  // Status
  success: getCSSVar('success'),
  successForeground: getCSSVar('success-foreground'),
  successBg: getCSSVar('success-bg'),

  warning: getCSSVar('warning'),
  warningForeground: getCSSVar('warning-foreground'),
  warningBg: getCSSVar('warning-bg'),

  error: getCSSVar('error'),
  errorForeground: getCSSVar('error-foreground'),
  errorBg: getCSSVar('error-bg'),

  info: getCSSVar('info'),
  infoForeground: getCSSVar('info-foreground'),
  infoBg: getCSSVar('info-bg'),

  // Borders
  border: getCSSVar('border'),
  borderSubtle: getCSSVar('border-subtle'),
  borderStrong: getCSSVar('border-strong'),

  // Input
  input: getCSSVar('input'),
  inputBackground: getCSSVar('input-background'),
  inputPlaceholder: getCSSVar('input-placeholder'),

  // Card
  card: getCSSVar('card'),
  cardForeground: getCSSVar('card-foreground'),

  // Popover
  popover: getCSSVar('popover'),
  popoverForeground: getCSSVar('popover-foreground'),
} as const;

/**
 * Export CSS variables for Tailwind config integration
 */
export const tailwindCSSVars = {
  colors: {
    background: 'hsl(var(--background))',
    'background-secondary': 'hsl(var(--background-secondary))',
    'background-tertiary': 'hsl(var(--background-tertiary))',
    'background-elevated': 'hsl(var(--background-elevated))',

    foreground: 'hsl(var(--foreground))',
    'foreground-secondary': 'hsl(var(--foreground-secondary))',
    'foreground-muted': 'hsl(var(--foreground-muted))',

    primary: 'hsl(var(--primary))',
    'primary-foreground': 'hsl(var(--primary-foreground))',
    'primary-hover': 'hsl(var(--primary-hover))',

    secondary: 'hsl(var(--secondary))',
    'secondary-foreground': 'hsl(var(--secondary-foreground))',

    accent: 'hsl(var(--accent))',
    'accent-foreground': 'hsl(var(--accent-foreground))',

    success: 'hsl(var(--success))',
    'success-foreground': 'hsl(var(--success-foreground))',
    'success-bg': 'hsl(var(--success-bg))',

    warning: 'hsl(var(--warning))',
    'warning-foreground': 'hsl(var(--warning-foreground))',
    'warning-bg': 'hsl(var(--warning-bg))',

    error: 'hsl(var(--error))',
    'error-foreground': 'hsl(var(--error-foreground))',
    'error-bg': 'hsl(var(--error-bg))',

    info: 'hsl(var(--info))',
    'info-foreground': 'hsl(var(--info-foreground))',
    'info-bg': 'hsl(var(--info-bg))',

    border: 'hsl(var(--border))',
    'border-subtle': 'hsl(var(--border-subtle))',
    'border-strong': 'hsl(var(--border-strong))',

    input: 'hsl(var(--input))',
    'input-background': 'hsl(var(--input-background))',
    'input-placeholder': 'hsl(var(--input-placeholder))',

    card: 'hsl(var(--card))',
    'card-foreground': 'hsl(var(--card-foreground))',

    popover: 'hsl(var(--popover))',
    'popover-foreground': 'hsl(var(--popover-foreground))',

    // Sidebar (existing compatibility)
    'sidebar-background': 'hsl(var(--sidebar-background))',
    'sidebar-foreground': 'hsl(var(--sidebar-foreground))',
    'sidebar-primary': 'hsl(var(--sidebar-primary))',
    'sidebar-primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    'sidebar-accent': 'hsl(var(--sidebar-accent))',
    'sidebar-accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    'sidebar-border': 'hsl(var(--sidebar-border))',
    'sidebar-ring': 'hsl(var(--sidebar-ring))',
  },
};
