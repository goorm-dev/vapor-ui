import type { Preview } from '@storybook/react-vite';

import { ThemeProvider } from '../../../packages/core/src/components/theme-provider';

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
    globalTypes: {
        appearance: {
            name: 'Theme',
            description: `Set light/dark theme.`,
            defaultValue: 'light',
            toolbar: {
                title: 'Color',
                icon: 'circlehollow',
                items: ['light', 'dark'],
                dynamicTitle: true,
            },
        },
    },
    decorators: [
        (Story, context) => {
            return (
                <ThemeProvider forcedTheme={context.globals.appearance}>
                    <div
                        style={{
                            background: 'var(--vapor-color-background-canvas)',
                            padding: '1rem',
                        }}
                    >
                        <Story />
                    </div>
                </ThemeProvider>
            );
        },
    ],
};

export default preview;
