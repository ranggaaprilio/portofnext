import { defineThemes } from '../theme/theme.models';
import { palette } from '../theme/palette';

export const { useTheme } = defineThemes({
  dark: {
    backgroundColor: palette.primary,
    borderColor: palette.secondary,
  },
  light: {
    backgroundColor: '#ffffff',
    borderColor: 'rgba(27, 60, 83, 0.12)',
  },
});
