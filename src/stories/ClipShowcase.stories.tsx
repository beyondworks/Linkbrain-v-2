import type { Meta, StoryObj } from '@storybook/react';
import ClipCard from '../components/ClipCard';
import { getCategoryColor } from '../lib/categoryColors';

const meta: Meta<typeof ClipCard> = {
  title: 'Layouts/ClipCard Showcase',
  component: ClipCard,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof ClipCard>;

const cards = [
  {
    id: 'clip-1',
    category: 'Design',
    categoryColor: getCategoryColor('design'),
    collection: 'Inspiration',
    title: 'Next-gen UI animation patterns',
    summary: 'A quick tour of motion principles and how to keep interfaces feeling sharp without overloading performance.',
    url: 'https://example.com/ui-motion',
    date: '2024-05-12',
    keywords: ['UI', 'Motion', 'Prototype'],
    source: 'web',
    image: 'https://images.unsplash.com/photo-1559027615-5a1aa6d9c9f5?w=1200&q=80&auto=format&fit=crop',
    language: 'EN' as const,
  },
  {
    id: 'clip-2',
    category: 'AI',
    categoryColor: getCategoryColor('ai'),
    collection: 'Research',
    title: 'Evaluating LLM outputs with lightweight metrics',
    summary: 'Practical heuristics to judge LLM responses for product use-cases.',
    url: 'https://example.com/llm-eval',
    date: '2024-04-28',
    keywords: ['AI', 'LLM', 'Product'],
    source: 'web',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80&auto=format&fit=crop',
    language: 'EN' as const,
  },
  {
    id: 'clip-3',
    category: 'Marketing',
    categoryColor: getCategoryColor('marketing'),
    collection: 'Campaigns',
    title: 'Landing pages that convert on mobile',
    summary: 'A breakdown of effective hero layouts, form placement, and CTA patterns.',
    url: 'https://example.com/mobile-landing',
    date: '2024-03-15',
    keywords: ['Mobile', 'UX', 'CRO'],
    source: 'web',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80&auto=format&fit=crop',
    language: 'EN' as const,
  },
];

export const GridShowcase: Story = {
  name: 'Responsive grid (desktop)',
  render: () => (
    <div className="w-full px-6 py-10 bg-[#f8f9fb] dark:bg-[#0f0f0f]">
      <div className="max-w-[1400px] mx-auto grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <ClipCard key={card.id} {...card} />
        ))}
      </div>
    </div>
  ),
};

export const ListShowcase: Story = {
  name: 'List (tablet/mobile)',
  render: () => (
    <div className="w-full px-4 py-8 bg-white dark:bg-[#121212]">
      <div className="max-w-[900px] mx-auto flex flex-col gap-4">
        {cards.map((card) => (
          <ClipCard key={card.id} {...card} variant="list" showThumbnail />
        ))}
      </div>
    </div>
  ),
};
