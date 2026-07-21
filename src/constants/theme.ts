/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export const Colors_SalesPage = {
  textPrimary: '#000000',
  textSecondary: '#FFFFFF',
  background: '#10B981',
  topBtn: '#96D5B1',
  inputBG: '#FFFFFF',
  enterBtn: '#2BBB8B',
  confirnBtn: '#2BB989',
  topConfirmDetailsBtn: '#95D4B1',
  font_size: {
    inputLabelSize: 24,
    inputPlaceHolder: 20,
    SubHeading: 26,
    details: 20,
    iconDetails: 15,
  },
} as const;

export const Colors_Buy = {} as const;
export const Colors_Udharo = {} as const;
export const Colors_DashBoard = {} as const;
export const Colors_Ai = {} as const;
export const Colors_NavBar = {
  selected: {
    sales: "#17E52F",
    buy: '#FFD600',
    udharo: '#FF4245',
    dashBoard: '#1F1F1F',
  }
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
