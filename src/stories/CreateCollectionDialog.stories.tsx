import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import CreateCollectionDialog from '../components/CreateCollectionDialog';

const meta: Meta<typeof CreateCollectionDialog> = {
  title: 'Dialogs/CreateCollectionDialog',
  component: CreateCollectionDialog,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof CreateCollectionDialog>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <CreateCollectionDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        onCreate={(data) => {
          // eslint-disable-next-line no-console
          console.log('Create collection', data);
          setOpen(false);
        }}
        language="EN"
      />
    );
  },
};
