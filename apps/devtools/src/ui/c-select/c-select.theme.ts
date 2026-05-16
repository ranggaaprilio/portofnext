import { defineThemes } from '../theme/theme.models';
import { appThemes } from '../theme/themes';

const sizes = {
  small: {
    height: '28px',
    fontSize: '12px',
  },
  medium: {
    height: '34px',
    fontSize: '14px',
  },
  large: {
    height: '40px',
    fontSize: '16px',
  },
};

export const { useTheme } = defineThemes({
  dark: {
    sizes,

    backgroundColor: '#334155',
    borderColor: '#475569',
    dropdownShadow: 'rgba(0, 0, 0, 0.2) 0px 8px 24px',

    option: {
      hover: {
        backgroundColor: '#475569',
      },
      active: {
        textColor: appThemes.dark.primary.color,
      },
    },

    focus: {
      backgroundColor: '#2563EB1a',
    },
  },
  light: {
    sizes,

    backgroundColor: '#ffffff',
    borderColor: '#e0e0e69e',
    dropdownShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',

    option: {
      hover: {
        backgroundColor: '#eee',
      },
      active: {
        textColor: appThemes.light.primary.color,
      },
    },

    focus: {
      backgroundColor: '#ffffff',
    },
  },
});
