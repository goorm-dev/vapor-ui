import {
    ThemeProvider,
    VaporThemeConfig,
} from '../packages/vapor-core/src/components/theme-provider';
import type { Preview } from '@storybook/react';

const themeConfig: VaporThemeConfig = {
    defaultTheme: {
        colorTheme: 'dark',
        radiusTheme: 'full',
        scaleFactor: 1.5,
    },
    storageKey: 'my-vapor-theme',
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
            description: '컴포넌트의 전체 컬러 테마를 설정합니다.',
            toolbar: {
                title: 'Color', // 툴바 메뉴의 제목
                icon: 'circlehollow',
                items: ['light', 'dark'],
                dynamicTitle: true, // 선택된 값으로 제목이 동적으로 변경됩니다.
            },
        },
        radiusTheme: {
            name: 'Radius Theme',
            description: '컴포넌트의 전체 border-radius를 설정합니다.',
            toolbar: {
                title: 'Radius',
                icon: 'star',
                items: ['none', 'sm', 'md', 'lg', 'xl', 'full'],
                dynamicTitle: true,
            },
        },
        scaleFactor: {
            name: 'Scale Factor',
            description: '컴포넌트의 전체 스케일을 조절합니다.',
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
    initialGlobals: {
        colorTheme: 'light',
        radiusTheme: 'md',
        scaleFactor: 2.4,
    },

    decorators: [
        (Story, context) => {
            const { colorTheme, radiusTheme, scaleFactor } = context.globals;
            const theme = { colorTheme, radiusTheme, scaleFactor };

            return (
                <ThemeProvider config={themeConfig}>
                    <Story />
                </ThemeProvider>
            );
        },
    ],
};

export default preview;
