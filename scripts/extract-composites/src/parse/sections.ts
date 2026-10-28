import { BLUE_PREFIX } from '../constants.ts';
import { type FigmaNode, SECTION_WHITELIST, type Section, type SectionTitle } from '../model.ts';

export interface DiscoveredSection {
    title: SectionTitle;
    frame: FigmaNode;
}

const WHITELIST_SET = new Set<string>(SECTION_WHITELIST);

function stripBluePrefix(name: string): string | null {
    const trimmed = name.trim();
    if (!trimmed.startsWith(BLUE_PREFIX)) return null;
    return trimmed.slice(BLUE_PREFIX.length).trim();
}

/** 캔버스에서 `🟦<Title>` FRAME/INSTANCE 중 whitelist title만 수집한다. 같은 title이 여러 개면
 *  첫 번째만 쓰고 나머지는 warning. 결과는 whitelist 순서로 반환. */
export function discoverSections(
    canvas: FigmaNode,
    warnings: string[],
    only?: Set<SectionTitle>,
): DiscoveredSection[] {
    const found = new Map<SectionTitle, FigmaNode>();

    const walk = (n: FigmaNode): void => {
        for (const child of n.children ?? []) {
            if (child.type === 'FRAME' || child.type === 'INSTANCE') {
                const title = stripBluePrefix(child.name);
                if (title && WHITELIST_SET.has(title)) {
                    const key = title as SectionTitle;
                    if (found.has(key)) {
                        warnings.push(
                            `Duplicate section ignored: "${child.name}" (first match kept)`,
                        );
                    } else {
                        found.set(key, child);
                    }
                    // 섹션 안쪽의 🟦 title은 섹션으로 승격시키지 않는다.
                    continue;
                }
            }
            walk(child);
        }
    };
    walk(canvas);

    const out: DiscoveredSection[] = [];
    for (const title of SECTION_WHITELIST) {
        if (only && !only.has(title)) continue;
        const frame = found.get(title);
        if (frame) out.push({ title, frame });
    }
    return out;
}

/** 캔버스 배치 순서가 아니라 whitelist 순서로 정렬해 MDX 출력이 디자이너 작업에 흔들리지 않게 한다. */
export function sortByPolicy(sections: Section[]): Section[] {
    const map = new Map(sections.map((s) => [s.title, s]));
    const out: Section[] = [];
    for (const title of SECTION_WHITELIST) {
        const s = map.get(title);
        if (s) out.push(s);
    }
    return out;
}
