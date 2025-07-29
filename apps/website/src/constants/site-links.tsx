import { DiscordColorIcon, FigmaColorIcon, GithubIcon } from '@vapor-ui/icons';
import type { IconItemType } from 'fumadocs-ui/layouts/links';

const externalLinks = [
    {
        icon: <FigmaColorIcon size={20} />,
        text: 'Figma',
        url: 'https://www.figma.com/community/file/1508829832204351721/vapor-design-system',
        label: 'Vapor figma comunity file',
        type: 'icon',
    },
    {
        icon: <DiscordColorIcon size={20} />,
        text: 'Discord',
        url: 'https://discord.gg/7Z8Ecur63D',
        label: 'Vapor Discord comunity',
        type: 'icon',
    },
    {
        icon: <GithubIcon size={20} />,
        text: 'Github',
        url: 'https://github.com/goorm-dev/vapor-ui',
        label: 'Vapor Github',
        type: 'icon',
    },
] satisfies IconItemType[];

export const navLinks = [
    {
        text: 'Theme Playground',
        url: '/playground',
        label: 'Playground for theme customization',
    },
    ...externalLinks,
];
