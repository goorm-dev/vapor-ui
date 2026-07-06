import vaporStyleMacro from '@vapor-ui/style-macro/unplugin';
import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();
const vaporPlugin = vaporStyleMacro.webpack();

/** @type {import('next').NextConfig} */
const config = {
    reactStrictMode: true,
    async redirects() {
        return [
            {
                source: '/docs',
                destination: '/docs/getting-started',
                permanent: true,
            },
            {
                source: '/docs/releases',
                destination: '/docs/releases/core',
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
        config.plugins.push(vaporPlugin);
        config.optimization ||= {};
        config.optimization.splitChunks ||= {};
        config.optimization.splitChunks.cacheGroups ||= {};
        config.optimization.splitChunks.cacheGroups.vaporStyle = {
            name: 'vapor-style',
            test: (m) =>
                m.type === 'css/mini-extract' &&
                (m.identifier().includes('@vapor-ui/core') ||
                    /virtual:vapor-style/.test(m.identifier())),
            chunks: 'all',
            enforce: true,
        };
        return config;
    },
    experimental: {
        optimizePackageImports: ['@vapor-ui/icons', '@vapor-ui/core'],
    },
};

export default withMDX(config);
