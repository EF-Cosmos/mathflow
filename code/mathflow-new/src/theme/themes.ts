/**
 * Theme Definitions for MathFlow
 *
 * Light and dark theme configurations using design tokens
 */

import { designTokens } from './tokens';

export type ThemeMode = 'light' | 'dark';
export type ThemeColorScheme = 'light' | 'dark' | 'system';

/**
 * Light theme configuration
 */
export const lightTheme = {
  name: 'light' as ThemeMode,
  colors: {
    // Background
    background: designTokens.colors.background.primary.light,
    'background-secondary': designTokens.colors.background.secondary.light,
    'background-tertiary': designTokens.colors.background.tertiary.light,
    'background-elevated': designTokens.colors.background.elevated.light,

    // Foreground
    foreground: designTokens.colors.foreground.primary.light,
    'foreground-secondary': designTokens.colors.foreground.secondary.light,
    'foreground-muted': designTokens.colors.foreground.muted.light,

    // Primary
    primary: designTokens.colors.primary.DEFAULT,
    'primary-foreground': designTokens.colors.primary.foreground.light,
    'primary-hover': designTokens.colors.primary.hover.light,

    // Secondary
    secondary: designTokens.colors.secondary.DEFAULT,
    'secondary-foreground': designTokens.colors.secondary.foreground.light,

    // Accent
    accent: designTokens.colors.accent.DEFAULT,
    'accent-foreground': designTokens.colors.accent.foreground.light,

    // Status
    success: designTokens.colors.success.DEFAULT.light,
    'success-foreground': designTokens.colors.success.foreground.light,
    'success-bg': designTokens.colors.success.bg.light,

    warning: designTokens.colors.warning.DEFAULT.light,
    'warning-foreground': designTokens.colors.warning.foreground.light,
    'warning-bg': designTokens.colors.warning.bg.light,

    error: designTokens.colors.error.DEFAULT.light,
    'error-foreground': designTokens.colors.error.foreground.light,
    'error-bg': designTokens.colors.error.bg.light,

    info: designTokens.colors.info.DEFAULT.light,
    'info-foreground': designTokens.colors.info.foreground.light,
    'info-bg': designTokens.colors.info.bg.light,

    // Borders
    border: designTokens.colors.border.DEFAULT.light,
    'border-subtle': designTokens.colors.border.subtle.light,
    'border-strong': designTokens.colors.border.strong.light,

    // Input
    input: designTokens.colors.input.border.light,
    'input-background': designTokens.colors.input.background.light,
    'input-placeholder': designTokens.colors.input.placeholder.light,

    // Card
    card: designTokens.colors.background.elevated.light,
    'card-foreground': designTokens.colors.foreground.primary.light,

    // Popover
    popover: designTokens.colors.background.elevated.light,
    'popover-foreground': designTokens.colors.foreground.primary.light,

    // Sidebar (from existing)
    'sidebar-background': designTokens.colors.background.secondary.light,
    'sidebar-foreground': designTokens.colors.foreground.secondary.light,
    'sidebar-primary': designTokens.colors.foreground.primary.light,
    'sidebar-primary-foreground': designTokens.colors.background.secondary.light,
    'sidebar-accent': designTokens.colors.background.tertiary.light,
    'sidebar-accent-foreground': designTokens.colors.foreground.primary.light,
    'sidebar-border': designTokens.colors.border.subtle.light,
    'sidebar-ring': designTokens.colors.primary.DEFAULT,
  },
  borderRadius: designTokens.borderRadius.DEFAULT,
};

/**
 * Dark theme configuration
 */
export const darkTheme = {
  name: 'dark' as ThemeMode,
  colors: {
    // Background
    background: designTokens.colors.background.primary.dark,
    'background-secondary': designTokens.colors.background.secondary.dark,
    'background-tertiary': designTokens.colors.background.tertiary.dark,
    'background-elevated': designTokens.colors.background.elevated.dark,

    // Foreground
    foreground: designTokens.colors.foreground.primary.dark,
    'foreground-secondary': designTokens.colors.foreground.secondary.dark,
    'foreground-muted': designTokens.colors.foreground.muted.dark,

    // Primary
    primary: designTokens.colors.primary.DEFAULT,
    'primary-foreground': designTokens.colors.primary.foreground.dark,
    'primary-hover': designTokens.colors.primary.hover.dark,

    // Secondary
    secondary: designTokens.colors.secondary.DEFAULT,
    'secondary-foreground': designTokens.colors.secondary.foreground.dark,

    // Accent
    accent: designTokens.colors.accent.DEFAULT,
    'accent-foreground': designTokens.colors.accent.foreground.dark,

    // Status
    success: designTokens.colors.success.DEFAULT.dark,
    'success-foreground': designTokens.colors.success.foreground.dark,
    'success-bg': designTokens.colors.success.bg.dark,

    warning: designTokens.colors.warning.DEFAULT.dark,
    'warning-foreground': designTokens.colors.warning.foreground.dark,
    'warning-bg': designTokens.colors.warning.bg.dark,

    error: designTokens.colors.error.DEFAULT.dark,
    'error-foreground': designTokens.colors.error.foreground.dark,
    'error-bg': designTokens.colors.error.bg.dark,

    info: designTokens.colors.info.DEFAULT.dark,
    'info-foreground': designTokens.colors.info.foreground.dark,
    'info-bg': designTokens.colors.info.bg.dark,

    // Borders
    border: designTokens.colors.border.DEFAULT.dark,
    'border-subtle': designTokens.colors.border.subtle.dark,
    'border-strong': designTokens.colors.border.strong.dark,

    // Input
    input: designTokens.colors.input.border.dark,
    'input-background': designTokens.colors.input.background.dark,
    'input-placeholder': designTokens.colors.input.placeholder.dark,

    // Card
    card: designTokens.colors.background.elevated.dark,
    'card-foreground': designTokens.colors.foreground.primary.dark,

    // Popover
    popover: designTokens.colors.background.elevated.dark,
    'popover-foreground': designTokens.colors.foreground.primary.dark,

    // Sidebar (from existing)
    'sidebar-background': designTokens.colors.background.secondary.dark,
    'sidebar-foreground': designTokens.colors.foreground.secondary.dark,
    'sidebar-primary': '224.3 76.3% 48%', // Blue accent for dark
    'sidebar-primary-foreground': '0 0% 100%',
    'sidebar-accent': designTokens.colors.background.tertiary.dark,
    'sidebar-accent-foreground': designTokens.colors.foreground.primary.dark,
    'sidebar-border': designTokens.colors.border.subtle.dark,
    'sidebar-ring': designTokens.colors.primary.DEFAULT,
  },
  borderRadius: designTokens.borderRadius.DEFAULT,
};

/**
 * Theme map for easy lookup
 */
export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export type Theme = typeof lightTheme;
