import type { Meta, StoryObj } from '@storybook/react';
import ClipCard from '../components/ClipCard';
import { getCategoryColor } from '../lib/categoryColors';

const meta: Meta<typeof ClipCard> = {
  title: 'Cards/ClipCard',
  component: ClipCard,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof ClipCard>;

const baseArgs = {
  id: 'clip-1',
  category: 'Design',
  categoryColor: getCategoryColor('design'),
  collection: 'Inspiration',
  title: 'Design Systems in 2024: Practical Patterns that Scale',
  summary: 'A concise overview of modern design system practices, including tokens, accessibility, and multi-brand support.',
  url: 'https://example.com/design-systems',
  date: '2024-05-10',
  keywords: ['UI', 'UX', 'Design System', 'Accessibility'],
  source: 'web',
  image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80&auto=format&fit=crop',
  images: [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80&auto=format&fit=crop',
  ],
  language: 'EN' as const,
  showThumbnail: true,
};

export const Grid: Story = {
  name: 'Grid (Default)',
  args: {
    ...baseArgs,
    variant: 'grid',
  },
};

export const List: Story = {
  name: 'List',
  args: {
    ...baseArgs,
    variant: 'list',
  },
};

export const NoThumbnail: Story = {
  name: 'No Thumbnail',
  args: {
    ...baseArgs,
    variant: 'grid',
    showThumbnail: false,
    image: undefined,
    images: [],
    collection: 'Unsorted',
  },
};
