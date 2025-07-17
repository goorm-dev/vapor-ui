import { useEffect } from 'react';

import type { Preview } from '@storybook/react';

import { ThemeProvider, useTheme } from '../packages/core/src/components/theme-provider';
import type {
    Appearance,
    Radius,
    Scaling,
    VaporThemeConfig,
} from '../packages/core/src/components/theme-provider';
import '../packages/core/src/styles';
import '../packages/core/src/styles/global-var.css';
import '../packages/core/src/styles/global.css';
import '../packages/core/src/styles/theme.css';

const ThemeUpdater = ({
    children,
    themeConfig,
}: {
    children: React.ReactNode;
    themeConfig: VaporThemeConfig;
}) => {
    const { setTheme } = useTheme();
    const { appearance, radius, scaling, primaryColor } = themeConfig;

    useEffect(() => {
        setTheme({
            appearance,
            radius,
            scaling,
            primaryColor,
        });
    }, [appearance, radius, scaling, setTheme]);

    return <>{children}</>;
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
        appearance: {
            name: 'Appearance Theme',
            description: `Set the component's light/dark theme.`,
            defaultValue: 'light',
            toolbar: {
                title: 'Color',
                icon: 'circlehollow',
                items: ['light', 'dark'],
                dynamicTitle: true,
            },
        },
        radius: {
            name: 'Radius Theme',
            description: 'Set the overall border-radius for components.',
            defaultValue: 'md',
            toolbar: {
                title: 'Radius',
                icon: 'star',
                items: ['none', 'sm', 'md', 'lg', 'xl', 'full'],
                dynamicTitle: true,
            },
        },
        scaling: {
            name: 'Scale Theme',
            description: 'Adjust the overall scale of components',
            defaultValue: '1.0',
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
                    '1.9',
                    '2.0',
                ],
                dynamicTitle: true,
            },
        },
        primaryColor: {
            name: 'Primary Color',
            description: 'Set the primary color for components.',
            defaultValue: undefined,
            toolbar: {
                title: 'Primary Color',
                icon: 'paintbrush',
                items: [
                    '#007bff', // blue
                    '#28a745', // green
                    '#dc3545', // red
                    '#ffc107', // yellow
                    '#6c757d', // gray
                ],
                dynamicTitle: true,
            },
        },
    },

    decorators: [
        (Story, context) => {
            const themeConfig: VaporThemeConfig = {
                storageKey: 'storybook-vapor-theme',
            };

            return (
                <ThemeProvider config={themeConfig}>
                    <ThemeUpdater
                        themeConfig={{
                            appearance: context.globals.appearance as Appearance,
                            radius: context.globals.radius as Radius,
                            scaling: parseFloat(context.globals.scaling) as Scaling,
                            primaryColor: context.globals.primaryColor,
                        }}
                    >
                        <Story />
                    </ThemeUpdater>
                </ThemeProvider>
            );
        },
    ],
};

export default preview;
