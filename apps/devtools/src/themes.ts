import type { GlobalThemeOverrides } from 'naive-ui';

export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#2563EB',
    primaryColorHover: '#3B82F6',
    primaryColorPressed: '#1D4ED8',
    primaryColorSuppl: '#3B82F6',
  },
  Menu: {
    itemHeight: '32px',
    itemColorActive: '#EFF6FF', // blue-50
    itemTextColorActive: '#2563EB',
  },

  Layout: { color: '#f8fafc' }, // slate-50

  AutoComplete: {
    peers: {
      InternalSelectMenu: { height: '500px' },
    },
  },
};

export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#3B82F6', // Lighter blue for dark mode
    primaryColorHover: '#60A5FA',
    primaryColorPressed: '#2563EB',
    primaryColorSuppl: '#3B82F6',
  },

  Notification: {
    color: '#1e293b', // slate-800
  },

  AutoComplete: {
    peers: {
      InternalSelectMenu: { height: '500px', color: '#1e293b' },
    },
  },

  Menu: {
    itemHeight: '32px',
    itemColorActive: 'rgba(59, 130, 246, 0.15)',
    itemTextColorActive: '#60A5FA',
  },

  Layout: {
    color: '#0f172a', // slate-900
    siderColor: '#020617', // slate-950
    siderBorderColor: 'transparent',
  },

  Card: {
    color: '#1e293b', // slate-800
    borderColor: '#334155', // slate-700
  },

  Table: {
    tdColor: '#1e293b',
    thColor: '#1e293b',
    borderColor: '#334155',
  },
};
