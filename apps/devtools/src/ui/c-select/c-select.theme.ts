import { defineThemes } from '../theme/theme.models';
import { appThemes } from '../theme/themes';
import { palette } from '../theme/palette';

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

    backgroundColor: palette.primary,
    borderColor: palette.secondary,
    dropdownShadow: 'rgba(0, 0, 0, 0.2) 0px 8px 24px',

    option: {
      hover: {
        backgroundColor: palette.secondary,
      },
      active: {
        textColor: appThemes.dark.primary.color,
      },
    },

    focus: {
      backgroundColor: 'rgba(210, 193, 182, 0.14)',
    },
  },
  light: {
    sizes,

    backgroundColor: '#ffffff',
    borderColor: 'rgba(27, 60, 83, 0.18)',
    dropdownShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',

    option: {
      hover: {
        backgroundColor: 'rgba(210, 193, 182, 0.32)',
      },
      active: {
        textColor: appThemes.light.primary.color,
      },
    },

    focus: {
      backgroundColor: 'rgba(210, 193, 182, 0.22)',
    },
  },
});
