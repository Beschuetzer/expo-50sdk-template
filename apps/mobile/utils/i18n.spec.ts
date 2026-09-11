import { getMessage, locales } from './i18n';

describe('i18n', () => {
  it('provides the supported locales', () => {
    expect(locales).toEqual({
      en: 'English',
      es: 'Español',
    });
  });

  it('returns localized messages', () => {
    expect(getMessage('es', 'tabs.home')).toBe('Inicio');
    expect(getMessage('en', 'tabs.home')).toBe('Home');
  });
});
