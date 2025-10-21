import type { Preview } from '@storybook/react-vite';

import '@vapor-ui/core/styles';
import '@vapor-ui/core/styles/global-var.css';
import '@vapor-ui/core/styles/global.css';
import '@vapor-ui/core/styles/theme.css';

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
        (Story) => {
            return <Story />;
        },
    ],
};

export default preview;
