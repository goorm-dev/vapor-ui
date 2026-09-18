import type { SyncSummary } from './sync-summary';

// ponytail: basic and symbol are spelled out rather than looped over `ICON_TYPE_NAMES`, because
// every line here carries a hand-written label. A third icon type means editing this file.
type Summaries = { basic: SyncSummary; symbol: SyncSummary };

const code = (names: string[]) => names.map((name) => `\`${name}\``).join(', ');

const line = (condition: boolean, text: string) => (condition ? [text] : []);

/** `**Removed:**` with one bullet per icon type. Absent when nothing was removed. */
const removedBlock = ({ basic, symbol }: Summaries) => {
    if (basic.deleted.length === 0 && symbol.deleted.length === 0) return [];
    return [
        '',
        '**Removed:**',
        ...line(basic.deleted.length > 0, `- Basic Icons: ${code(basic.deleted)}`),
        ...line(symbol.deleted.length > 0, `- Symbol Icons: ${code(symbol.deleted)}`),
    ];
};

/** New icons are a feature, everything else is a fix. */
const hasNewIcons = ({ basic, symbol }: Summaries) =>
    basic.created.length > 0 || symbol.created.length > 0;

/**
 * The `.changeset/*.md` entry. New icons take a minor bump and lead with the additions;
 * otherwise it is a patch listing the updates.
 */
const renderChangeset = (summaries: Summaries): string => {
    const { basic, symbol } = summaries;
    const isMinor = hasNewIcons(summaries);

    const body = isMinor
        ? [
              'Add new icons from Figma',
              '',
              ...line(basic.created.length > 0, `**New Basic Icons:** ${code(basic.created)}`),
              ...line(symbol.created.length > 0, `**New Symbol Icons:** ${code(symbol.created)}`),
              ...(basic.updated.length > 0 || symbol.updated.length > 0
                  ? [
                        '',
                        '**Also Updated:**',
                        ...line(basic.updated.length > 0, `- Basic Icons: ${code(basic.updated)}`),
                        ...line(
                            symbol.updated.length > 0,
                            `- Symbol Icons: ${code(symbol.updated)}`,
                        ),
                    ]
                  : []),
              ...removedBlock(summaries),
          ]
        : [
              'Update icons from Figma',
              '',
              ...line(basic.updated.length > 0, `**Updated Basic Icons:** ${code(basic.updated)}`),
              ...line(
                  symbol.updated.length > 0,
                  `**Updated Symbol Icons:** ${code(symbol.updated)}`,
              ),
              ...removedBlock(summaries),
              // Icon files changed but nothing was named: say something rather than ship an
              // empty changeset body.
              ...line(
                  basic.updated.length === 0 &&
                      symbol.updated.length === 0 &&
                      basic.deleted.length === 0 &&
                      symbol.deleted.length === 0,
                  'Sync icons with the latest changes from Figma.',
              ),
          ];

    return `${['---', `"@vapor-ui/icons": ${isMinor ? 'minor' : 'patch'}`, '---', '', ...body].join('\n')}\n`;
};

/**
 * The pull request body. Flat list, one section per non-empty bucket.
 */
const renderPrBody = (summaries: Summaries, runUrl: string): string => {
    const { basic, symbol } = summaries;
    const buckets: [string, string[]][] = [
        ['New Basic Icons', basic.created],
        ['New Symbol Icons', symbol.created],
        ['Updated Basic Icons', basic.updated],
        ['Updated Symbol Icons', symbol.updated],
        ['Removed Basic Icons', basic.deleted],
        ['Removed Symbol Icons', symbol.deleted],
    ];

    return `${[
        '## 🤖 Automated Icon Sync from Figma',
        '',
        'This PR syncs icons from Figma.',
        '',
        '### Sync Summary',
        '| Category         | Details                          |',
        '| ---------------- | -------------------------------- |',
        `| **Version Bump** | ${hasNewIcons(summaries) ? 'Minor' : 'Patch'} |`,
        `| **Workflow Run** | [View Run](${runUrl}) |`,
        '',
        '### Changes',
        ...buckets.flatMap(([label, names]) =>
            names.length > 0 ? [`**${label}:** ${code(names)}`, ''] : [],
        ),
    ].join('\n')}\n`;
};

export type { Summaries };
export { renderChangeset, renderPrBody };
