/**
 * Token values are mirrored from src/constants/theme.ts (the runtime source of truth,
 * which can't be require()d here because it pulls in react-native). Keep them in sync.
 * Dark colors are exposed as `*-dark` keys, used via NativeWind's `dark:` variant
 * (darkMode: 'media').
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        text: '#000000',
        background: '#ffffff',
        'background-element': '#F0F0F3',
        'background-selected': '#E0E1E6',
        'text-secondary': '#60646C',
        'text-dark': '#ffffff',
        'background-dark': '#000000',
        'background-element-dark': '#212225',
        'background-selected-dark': '#2E3135',
        'text-secondary-dark': '#B0B4BA',
      },
      spacing: {
        half: 2,
        one: 4,
        two: 8,
        three: 16,
        four: 24,
        five: 32,
        six: 64,
      },
      borderRadius: {
        one: 4,
        two: 8,
        three: 16,
      },
    },
  },
  plugins: [],
};
