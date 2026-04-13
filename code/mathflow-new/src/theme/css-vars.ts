/**
 * CSS Variable Generator
 *
 * Generates CSS custom properties from theme definitions
 */

import { lightTheme, darkTheme } from './themes';

interface ThemeLike {
  colors: Record<string, string>;
  borderRadius: string;
}

function themeToCSSVars(theme: ThemeLike, prefix: string = ''): string {
  const vars: string[] = [];

  for (const [key, value] of Object.entries(theme.colors)) {
    const varName = prefix ? `${prefix}-${key}` : key;
    vars.push(`  --${varName}: ${value};`);
  }

  return vars.join('\n');
}

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

export function getCSSVar(colorName: string): string {
  return `hsl(var(--${colorName}))`;
}

const COLORS = [
  'background',
  'background-secondary',
  'background-tertiary',
  'background-elevated',
  'foreground',
  'foreground-secondary',
  'foreground-muted',
  'primary',
  'primary-foreground',
  'primary-hover',
  'secondary',
  'secondary-foreground',
  'accent',
  'accent-foreground',
  'success',
  'success-foreground',
  'success-bg',
  'warning',
  'warning-foreground',
  'warning-bg',
  'error',
  'error-foreground',
  'error-bg',
  'info',
  'info-foreground',
  'info-bg',
  'border',
  'border-subtle',
  'border-strong',
  'input',
  'input-background',
  'input-placeholder',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'sidebar-background',
  'sidebar-foreground',
  'sidebar-primary',
  'sidebar-primary-foreground',
  'sidebar-accent',
  'sidebar-accent-foreground',
  'sidebar-border',
  'sidebar-ring',
] as const;

const cssVars: Record<string, string> = {};

for (const color of COLORS) {
  const camelCase = color.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  cssVars[camelCase] = getCSSVar(color);
}

export { cssVars };

export const tailwindCSSVars = {
  colors: Object.fromEntries(
    COLORS.map(color => [color, `hsl(var(--${color}))`])
  ),
};
