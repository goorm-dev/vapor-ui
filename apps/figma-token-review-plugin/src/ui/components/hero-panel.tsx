import type { ComponentProps, ReactNode } from 'react';

import { Box, Button, Text } from '@vapor-ui/core';

function Root({ children }: { children: ReactNode }) {
    return (
        <Box className="flex flex-col items-center bg-white">
            <Box className="flex flex-col items-center gap-5 pt-30">{children}</Box>
        </Box>
    );
}

function Content({ children }: { children: ReactNode }) {
    return <Box className="flex flex-col items-center justify-center gap-2">{children}</Box>;
}

function Image({ src, alt = '' }: { src: string; alt?: string }) {
    return (
        <Box className="flex h-30 w-40 items-center justify-center overflow-hidden">
            <img alt={alt} src={src} className="block h-full w-full object-contain" />
        </Box>
    );
}

function Heading({ children }: { children: ReactNode }) {
    return <Box className="flex flex-col items-center gap-1 text-center">{children}</Box>;
}

function Title({ children }: { children: ReactNode }) {
    return (
        <Text typography="heading5" foreground="normal-200">
            {children}
        </Text>
    );
}

function Description({ children }: { children: ReactNode }) {
    return (
        <Text typography="body2" foreground="hint-100">
            {children}
        </Text>
    );
}

type ActionProps = Pick<ComponentProps<typeof Button>, 'onClick' | 'disabled'> & {
    children: ReactNode;
};

function Action({ children, onClick, disabled }: ActionProps) {
    return (
        <Button
            size="md"
            colorPalette="primary"
            variant="fill"
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </Button>
    );
}

export const HeroPanel = {
    Root,
    Content,
    Image,
    Heading,
    Title,
    Description,
    Action,
};
