import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Hexadecimal esacape character',
  path: '/hexadecimal-escape-character',
  description: 'Hexadecimal escape character converter',
  keywords: ['hexadecimal', 'escape', 'character'],
  component: () => import('./hexadecimal-esacape-character.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2025-12-27'),
});
