import { defineThemes } from './theme.models';
import { palette } from './palette';

export const { themes: appThemes, useTheme: useAppTheme } = defineThemes({
  light: {
    background: palette.sand,
    text: {
      baseColor: palette.ink,
      mutedColor: palette.secondary,
    },
    default: {
      color: 'rgba(27, 60, 83, 0.06)',
      colorHover: 'rgba(69, 104, 130, 0.14)',
      colorPressed: 'rgba(35, 76, 106, 0.22)',
    },
    primary: {
      color: palette.primary,
      colorHover: palette.secondary,
      colorPressed: palette.ink,
      colorFaded: 'rgba(35, 76, 106, 0.15)',
    },
    warning: {
      color: '#f59e0b',
      colorHover: '#f59e0b',
      colorPressed: '#f59e0b',
      colorFaded: '#f59e0b2f',
    },
    success: {
      color: '#18a058',
      colorHover: '#36ad6a',
      colorPressed: '#0c7a43',
      colorFaded: '#18a0582f',
    },
    error: {
      color: '#d03050',
      colorHover: '#de576d',
      colorPressed: '#ab1f3f',
      colorFaded: '#d030502a',
    },
  },
  dark: {
    background: palette.ink,
    text: {
      baseColor: '#f3ebe6',
      mutedColor: palette.sand,
    },
    default: {
      color: 'rgba(210, 193, 182, 0.08)',
      colorHover: 'rgba(210, 193, 182, 0.14)',
      colorPressed: 'rgba(210, 193, 182, 0.24)',
    },
    primary: {
      color: palette.sand,
      colorHover: '#f3ebe6',
      colorPressed: palette.secondary,
      colorFaded: 'rgba(210, 193, 182, 0.15)',
    },
    warning: {
      color: '#f59e0b',
      colorHover: '#f59e0b',
      colorPressed: '#f59e0b',
      colorFaded: '#f59e0b2f',
    },
    success: {
      color: '#18a058',
      colorHover: '#36ad6a',
      colorPressed: '#0c7a43',
      colorFaded: '#18a0582f',
    },
    error: {
      color: '#e88080',
      colorHover: '#e98b8b',
      colorPressed: '#e57272',
      colorFaded: '#e8808029',
    },
  },
});
