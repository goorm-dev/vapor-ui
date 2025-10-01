import type { Preview } from '@storybook/react-vite';

import '../../../packages/core/src/styles';
import '../../../packages/core/src/styles/global-var.css';
import '../../../packages/core/src/styles/global.css';
import '../../../packages/core/src/styles/theme.css';

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
