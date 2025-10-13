import type { Preview } from '@storybook/react';

const preview: Preview = {
    tags: ['autodocs'],
    parameters: {
        actions: { argTypesRegex: '^on[A-Z].*' },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
    },

    decorators: [
        (Story, context) => {
            return <Story />;
        },
    ],
};

export default preview;
