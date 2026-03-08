import { Platform } from 'react-native';

export const Colors = {
  // Brand colors
  primary: '#E85A2C',
  background: '#FEF9F3',
  white: '#FFFFFF',
  black: '#000000',

  // Theme variants
  light: {
    text: '#11181C',
    background: '#FEF9F3',
    tint: '#E85A2C',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#E85A2C',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#E85A2C',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#E85A2C',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
