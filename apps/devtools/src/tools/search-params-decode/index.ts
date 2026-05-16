import { Link } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Search params decode',
  path: '/search-params-decode',
  description: 'A tools for decode search params from url.',
  keywords: ['search', 'params', 'decode'],
  component: () => import('./search-params-decode.vue'),
  icon: Link,
  createdAt: new Date('2023-12-02'),
});
