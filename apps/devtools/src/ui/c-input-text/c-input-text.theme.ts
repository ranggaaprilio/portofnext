import { defineThemes } from '../theme/theme.models';
import { palette } from '../theme/palette';

export const { useTheme } = defineThemes({
  dark: {
    backgroundColor: palette.primary,
    borderColor: palette.secondary,

    focus: {
      backgroundColor: 'rgba(210, 193, 182, 0.14)',
    },
  },
  light: {
    backgroundColor: '#ffffff',
    borderColor: 'rgba(27, 60, 83, 0.18)',

    focus: {
      backgroundColor: 'rgba(210, 193, 182, 0.22)',
    },
  },
});
