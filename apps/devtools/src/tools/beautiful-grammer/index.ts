import { Wand } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Beautiful Grammar',
  path: '/beautiful-grammer',
  description:
    'Enhance your text with AI-powered grammar correction, professional tone, and formal writing. Uses OpenAI to make your writing clearer, more professional, and error-free.',
  keywords: [
    'grammar',
    'correction',
    'writing',
    'text',
    'enhancement',
    'professional',
    'formal',
    'ai',
    'openai',
    'proofreading',
    'editing',
  ],
  component: () => import('./beautiful-grammer.vue'),
  icon: Wand,
  createdAt: new Date('2025-09-16'),
});
