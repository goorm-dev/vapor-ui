import { useEffect } from 'react';

import {
    type Appearance,
    type Radius,
    type Scaling,
    ThemeProvider,
    type VaporThemeConfig,
    useTheme,
} from '../packages/core/src/components/theme-provider';
import type { Preview } from '@storybook/react';

const ThemeUpdater = ({
    children,
    themeConfig,
}: {
    children: React.ReactNode;
    themeConfig: VaporThemeConfig;
}) => {
    const { setTheme } = useTheme();
    const { appearance, radius, scaling } = themeConfig;

    useEffect(() => {
        setTheme({
            appearance,
            radius,
            scaling,
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
            description: '컴포넌트의 라이트/다크 테마를 설정합니다.',
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
            description: '컴포넌트의 전체 border-radius를 설정합니다.',
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
            description: '컴포넌트의 전체 스케일을 조절합니다.',
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
