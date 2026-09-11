import { resolveColorScheme, themeModes } from './theme';

describe('theme', () => {
  it('supports system, light, and dark modes', () => {
    expect(Object.keys(themeModes)).toEqual(['system', 'light', 'dark']);
  });

  it('follows the system scheme only in system mode', () => {
    expect(resolveColorScheme('system', 'dark')).toBe('dark');
    expect(resolveColorScheme('system', 'light')).toBe('light');
    expect(resolveColorScheme('light', 'dark')).toBe('light');
    expect(resolveColorScheme('dark', 'light')).toBe('dark');
  });
});
