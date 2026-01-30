import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
    reactStrictMode: true,
    async redirects() {
        return [
            {
                source: '/playground',
                destination: '/theme/playground',
                permanent: true,
            },
            {
                source: '/docs/getting-started/theming',
                destination: '/theme/theme-provider',
                permanent: true,
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: '/docs/:path*.mdx',
                destination: '/llms.mdx/docs/:path*',
            },
            {
                source: '/blocks/:path*.mdx',
                destination: '/llms.mdx/blocks/:path*',
            },
            {
                source: '/theme/:path*.mdx',
                destination: '/llms.mdx/theme/:path*',
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'statics.goorm.io',
            },
        ],
    },
    turbopack: {
        rules: {
            '*.svg': {
                loaders: ['@svgr/webpack'],
                as: '*.js',
            },
        },
    },
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack'],
        });
        return config;
    },
};

export default withMDX(config);
