import {
  defineConfig,
  presetAttributify,
  presetTypography,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss';

import { presetScrollbar } from 'unocss-preset-scrollbar';

export default defineConfig({
  presets: [presetUno(), presetAttributify(), presetTypography(), presetScrollbar()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme: {
    colors: {
      primary: '#234C6A',
    },
  },
  shortcuts: {
    'pretty-scrollbar':
      'scrollbar scrollbar-rounded scrollbar-thumb-color-#D2C1B6 scrollbar-track-color-#F7F2EF dark:scrollbar-thumb-color-#456882 dark:scrollbar-track-color-#234C6A',
    divider: 'h-1px bg-current op-10',
    'shell-surface': 'bg-white dark:bg-#1B3C53',
    'shell-border': 'border border-#1B3C5326 dark:border-#D2C1B638',
  },
});
