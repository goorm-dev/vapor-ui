import { ThemeProvider, VaporThemeConfig } from '../packages/core/src/components/theme-provider';
import type { Preview } from '@storybook/react';

const themeConfig: VaporThemeConfig = {
    defaultTheme: {
        colorTheme: 'light',
        radiusTheme: 'md',
        scaleFactor: 1,
    },
    storageKey: 'vapor-ui',
    enableSystemTheme: false,
};

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
        colorTheme: {
            name: 'Color Theme',
            description: 'Set the overall color theme for components.',
            toolbar: {
                title: 'Color',
                icon: 'circlehollow',
                items: ['light', 'dark'],
                dynamicTitle: true,
            },
        },
        radiusTheme: {
            name: 'Radius Theme',
            description: 'Set the overall border-radius for components.',
            toolbar: {
                title: 'Radius',
                icon: 'star',
                items: ['none', 'sm', 'md', 'lg', 'xl', 'full'],
                dynamicTitle: true,
            },
        },
        scaleFactor: {
            name: 'Scale Factor',
            description: 'Adjust the overall scale of components.',
            toolbar: {
                title: 'Scale',
                icon: 'zoom',
                items: [
                    '0.7',
                    '0.8',
                    '0.9',
                    '1.0',
                    '1.1',
                    '1.2',
                    '1.3',
                    '1.4',
                    '1.5',
                    '1.6',
                    '1.7',
                    '1.8',
                ],
                dynamicTitle: true,
            },
        },
    },

    decorators: [
        (Story, context) => {
            const { colorTheme, radiusTheme, scaleFactor } = context.globals;
            const theme = { colorTheme, radiusTheme, scaleFactor };

            const dynamicTheme = {
                ...themeConfig,
                defaultTheme: {
                    ...themeConfig.defaultTheme,
                    ...theme,
                },
            };

            return (
                <ThemeProvider config={dynamicTheme}>
                    <Story />
                </ThemeProvider>
            );
        },
    ],
};

export default preview;
