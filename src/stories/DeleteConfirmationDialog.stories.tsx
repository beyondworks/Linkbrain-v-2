import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';

const meta: Meta<typeof DeleteConfirmationDialog> = {
  title: 'Dialogs/DeleteConfirmationDialog',
  component: DeleteConfirmationDialog,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof DeleteConfirmationDialog>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <DeleteConfirmationDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          // eslint-disable-next-line no-console
          console.log('Confirmed delete');
          setOpen(false);
        }}
        title="Delete Clips"
        descriptionLines={[
          'Are you sure you want to delete 3 selected clip(s)?',
          'This action cannot be undone.',
        ]}
        isLoading={false}
        language="EN"
      />
    );
  },
};
