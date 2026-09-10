import { renderChangeset, renderPrBody } from './release-notes';
import type { SyncSummary } from './sync-summary';

const summary = (partial: Partial<SyncSummary> = {}): SyncSummary => ({
    created: [],
    updated: [],
    deleted: [],
    total: 0,
    ...partial,
});

describe('renderChangeset', () => {
    it('새 아이콘이 있으면 minor, 추가분을 앞세운다', () => {
        const actual = renderChangeset({
            basic: summary({ created: ['ArrowUp'], updated: ['Bell'], deleted: ['Cog'] }),
            symbol: summary({ created: ['Star'] }),
        });

        expect(actual).toBe(`---
"@vapor-ui/icons": minor
---

Add new icons from Figma

**New Basic Icons:** \`ArrowUp\`
**New Symbol Icons:** \`Star\`

**Also Updated:**
- Basic Icons: \`Bell\`

**Removed:**
- Basic Icons: \`Cog\`
`);
    });

    it('갱신만 있으면 patch', () => {
        const actual = renderChangeset({
            basic: summary({ updated: ['Bell', 'Cog'] }),
            symbol: summary(),
        });

        expect(actual).toBe(`---
"@vapor-ui/icons": patch
---

Update icons from Figma

**Updated Basic Icons:** \`Bell\`, \`Cog\`
`);
    });

    it('아무것도 없어도 본문은 비우지 않는다', () => {
        const actual = renderChangeset({ basic: summary(), symbol: summary() });

        expect(actual).toBe(`---
"@vapor-ui/icons": patch
---

Update icons from Figma

Sync icons with the latest changes from Figma.
`);
    });
});

describe('renderPrBody', () => {
    it('비어 있지 않은 항목만 한 섹션씩 싣는다', () => {
        const actual = renderPrBody(
            { basic: summary({ created: ['ArrowUp'], deleted: ['Cog'] }), symbol: summary() },
            'https://example.test/run/1',
        );

        expect(actual).toBe(`## 🤖 Automated Icon Sync from Figma

This PR syncs icons from Figma.

### Sync Summary
| Category         | Details                          |
| ---------------- | -------------------------------- |
| **Version Bump** | Minor |
| **Workflow Run** | [View Run](https://example.test/run/1) |

### Changes
**New Basic Icons:** \`ArrowUp\`

**Removed Basic Icons:** \`Cog\`

`);
    });
});
