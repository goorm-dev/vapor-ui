import type { LinkItemType } from 'fumadocs-ui/layouts/links';
import Image from 'next/image';

export const navLinks = [
    {
        icon: (
            <div className="relative inline-block w-5 h-5">
                <Image
                    src="/icons/figma-color.svg"
                    alt="Figma"
                    fill
                    style={{ objectFit: 'contain' }}
                />
            </div>
        ),
        text: 'Figma',
        url: 'https://www.figma.com/community/file/1508829832204351721/vapor-design-system',
        label: 'Vapor figma comunity file',
        type: 'icon',
    },
    {
        icon: (
            <div className="relative inline-block w-5 h-5">
                <Image
                    src="/icons/discord-color.svg"
                    alt="Discord"
                    fill
                    style={{ objectFit: 'contain' }}
                />
            </div>
        ),
        text: 'Discord',
        url: 'https://discord.gg/7Z8Ecur63D',
        label: 'Vapor Discord comunity',
        type: 'icon',
    },
    {
        icon: (
            <div className="relative inline-block w-5 h-5">
                <Image
                    src="/icons/github-color.svg"
                    alt="Github"
                    fill
                    style={{ objectFit: 'contain' }}
                />
            </div>
        ),
        text: 'Github',
        url: 'https://github.com/goorm-dev/vapor-ui',
        label: 'Vapor Github',
        type: 'icon',
    },
    {
        text: 'Docs',
        url: '/docs',
        active: 'nested-url',
    },
    {
        text: 'Playground',
        url: '/docs/playground',
    },
] as LinkItemType[];
