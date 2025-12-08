import React from "react";
import "../src/index.css";

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Switch between light and dark mode (matches app behavior)",
      defaultValue: "light",
      toolbar: {
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => (
      <div
        className={
          context.globals.theme === "dark"
            ? "dark bg-[#121212] text-white min-h-screen"
            : "bg-white text-[#3d3d3d] min-h-screen"
        }
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
    layout: "fullscreen",
  },
};

export default preview;
