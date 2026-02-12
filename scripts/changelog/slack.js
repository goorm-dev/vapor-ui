import { config } from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'node:url';
import path from 'path';

import { extractVersion } from './extract-version.js';

config();

function readEnv() {
    const PUBLISHED_PACKAGES = process.env.PUBLISHED_PACKAGES;
    const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';

    return { PUBLISHED_PACKAGES, SLACK_WEBHOOK_URL };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_ROOT = path.resolve(__dirname, '../../');

const getPublishedPackages = () => {
    const { PUBLISHED_PACKAGES } = readEnv();

    if (!PUBLISHED_PACKAGES) {
        console.log('ℹ️ Missing PUBLISHED_PACKAGES environment variable.');
    }

    let publishedPackages;

    try {
        publishedPackages = JSON.parse(PUBLISHED_PACKAGES);
    } catch (e) {
        console.error('❌ Failed to parse PUBLISHED_PACKAGES:', e);
        process.exit(1);
    }

    if (!Array.isArray(publishedPackages) || publishedPackages.length === 0) {
        console.log('ℹ️ No packages were published.');
        process.exit(0);
    }

    return publishedPackages;
};

function findChangelogPath(packageName) {
    const name = packageName.replace('@vapor-ui/', '');
    const pkgPath = path.join(WORKSPACE_ROOT, 'packages', name);

    return path.join(pkgPath, 'CHANGELOG.md');
}

// 체인지로그에서 최신 버전(맨 위) 내용 추출 및 검증
function extractVersionContent(changelogContent, targetVersion) {
    const parsed = extractVersion(changelogContent);

    if (!parsed) return null;

    const { version, content } = parsed;

    // 2. 버전 검증: 찾은 버전이 targetVersion과 일치하는지 확인
    if (version !== targetVersion) {
        console.warn(`⚠️ Expected ${targetVersion}, but found ${version}`);
        return null;
    }

    return content.trim();
}

async function main() {
    const publishedPackages = getPublishedPackages();
    const results = [];

    for (const pkg of publishedPackages) {
        const changelogPath = findChangelogPath(pkg.name);

        if (!fs.existsSync(changelogPath)) {
            console.warn(`⚠️ CHANGELOG.md not found for ${pkg.name}`);
            continue;
        }

        const changelogContent = fs.readFileSync(changelogPath, 'utf-8');
        const versionContent = extractVersionContent(changelogContent, pkg.version);

        if (!versionContent) {
            console.warn(`⚠️ Missing changelog for ${pkg.name} version ${pkg.version}`);
            continue;
        }

        results.push({
            name: pkg.name,
            version: pkg.version,
            content: versionContent,
        });
    }

    if (results.length > 0) {
        await sendSlackNotification(results);
    }
}

function convertMarkdownToSlack(text) {
    if (!text) return [];

    // 1. Basic Markdown to Slack formatting
    let formatted = text
        .replace(/\*\*([^*]+)\*\*/g, '*$1*')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<$2|$1>')
        .replace(/^\s*-\s/gm, '• ')
        .replace(/^\s+```/gm, '```');

    // 2. Split by headers
    const parts = formatted.split(/^### (.*)$/gm);
    const sections = [];

    // Handle initial content before headers if exists
    if (parts[0] && parts[0].trim()) {
        sections.push(parts[0].trim());
    }

    for (let i = 1; i < parts.length; i += 2) {
        const title = parts[i].trim();
        const content = parts[i + 1].trim();

        const quotedContent = content
            .split('\n')
            .map((line) => `> ${line.trimStart()}`)
            .join('\n');

        sections.push(`*${title}*\n\n${quotedContent}`);
    }

    if (sections.length === 0) return [formatted];

    return sections;
}

async function sendSlackNotification(packages) {
    const { SLACK_WEBHOOK_URL } = readEnv();

    if (!SLACK_WEBHOOK_URL) {
        throw new Error('Missing Slack Webhook URL');
    }

    const corePackage = packages.find((pkg) => pkg.name === '@vapor-ui/core');
    const otherPackages = packages.filter((pkg) => pkg.name !== '@vapor-ui/core');

    const blocks = [];

    // 1. Header
    blocks.push({
        type: 'header',
        text: {
            type: 'plain_text',
            text: 'Vapor UI Packages Updated',
        },
    });

    // 2. Core Package
    if (corePackage) {
        const sections = convertMarkdownToSlack(corePackage.content);

        blocks.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `<https://vapor-ui.goorm.io/docs/getting-started/releases/core|[*${corePackage.name} v${corePackage.version}*]>`,
            },
        });

        for (const sectionContent of sections) {
            blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: sectionContent,
                },
            });
        }
    }

    // 3. Other Packages
    if (otherPackages.length > 0) {
        blocks.push({ type: 'divider' });

        for (const pkg of otherPackages) {
            const pkgName = pkg.name.replace('@vapor-ui/', '');
            const docsUrl = `https://vapor-ui.goorm.io/docs/getting-started/releases/${pkgName}`;

            blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `• <${docsUrl}|[*${pkg.name}*] 보러가기>`,
                },
            });
        }
    }

    try {
        const response = await fetch(SLACK_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ blocks }),
        });

        if (response.ok) {
            console.log('✅ Slack notification sent successfully!');
        } else {
            console.error(`❌ Failed to send Slack notification:: ${await response.text()}`);
        }
    } catch (error) {
        console.error('❌ Failed to send Slack notification:', error);
    }
}

main();
