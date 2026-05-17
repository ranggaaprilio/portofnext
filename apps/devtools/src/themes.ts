import type { GlobalThemeOverrides } from 'naive-ui';
import { palette } from './ui/theme/palette';

export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: palette.primary,
    primaryColorHover: palette.secondary,
    primaryColorPressed: palette.ink,
    primaryColorSuppl: palette.secondary,
  },
  Button: {
    textColorPrimary: '#ffffff',
    textColorHoverPrimary: '#ffffff',
    textColorPressedPrimary: '#ffffff',
    textColorFocusPrimary: '#ffffff',
  },
  Menu: {
    itemHeight: '32px',
    itemColorActive: 'rgba(210, 193, 182, 0.55)',
    itemTextColorActive: palette.primary,
  },

  Layout: {
    color: '#ffffff',
    siderColor: '#f7f2ef',
    siderBorderColor: 'transparent',
  },

  AutoComplete: {
    peers: {
      InternalSelectMenu: { height: '500px' },
    },
  },
};

export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: palette.sand,
    primaryColorHover: '#f3ebe6',
    primaryColorPressed: palette.secondary,
    primaryColorSuppl: palette.sand,
  },
  Button: {
    textColorPrimary: palette.ink,
    textColorHoverPrimary: palette.ink,
    textColorPressedPrimary: '#ffffff',
    textColorFocusPrimary: palette.ink,
  },

  Notification: {
    color: palette.primary,
  },

  AutoComplete: {
    peers: {
      InternalSelectMenu: { height: '500px', color: palette.primary },
    },
  },

  Menu: {
    itemHeight: '32px',
    itemColorActive: 'rgba(210, 193, 182, 0.15)',
    itemTextColorActive: palette.sand,
  },

  Layout: {
    color: palette.ink,
    siderColor: palette.primary,
    siderBorderColor: 'transparent',
  },

  Scrollbar: {
    color: 'rgba(255, 255, 255, 0.1)',
    colorHover: 'rgba(255, 255, 255, 0.2)',
  },

  Card: {
    color: palette.primary,
    borderColor: palette.secondary,
  },

  Table: {
    tdColor: palette.primary,
    thColor: palette.primary,
    borderColor: palette.secondary,
  },
};
