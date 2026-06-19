// schema-loader.mjs
// vapor 토큰 스키마(6파일)를 읽는 단일 진입점. evaluate가 소비할 형태로 가공한다.
//
// 출처: 지금은 스킬 번들(assets/), 추후 CDN. 출처를 loadRaw 한 곳으로 모아 두면
// CDN 전환 시 그 함수만 fetch로 바꾸면 호출부는 무변경이다.
//
// 버전 관리 없음: 스키마는 버전 접미사 없이 "현재" 한 벌만 둔다. 시안 토큰셋과의
// 동기화는 운영 규율로 보장하며, 코드가 버전을 비교·차단하지 않는다.
//
// 실측 스키마(~/Downloads/vapor-token-schema/, DTCG 2025.10):
//   semantic-color.{light,dark}.json = { "$schema", "colors": <중첩 트리> }
//     leaf 토큰: { "$description", "$extensions": { "io.goorm.vapor": {when, avoid, accessibility} }, "$value": "{colors.blue.600}" }
//     foreground 그룹: "$extensions": { "io.goorm.vapor": { "gradeRules": {"100":..., "200":...} } }
//   text-style.json = { "$schema", "textStyle": { "$type", display1, ..., body4 } }
//   primitive-color.{light,dark}.json = { "$schema", "colors": <중첩 트리, oklch leaf> }
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(__dirname, '..', 'assets');

const NS = 'io.goorm.vapor';

// 시안 mode(light/dark)에 따라 다른 파일을 읽는다. 의미 메타는 light/dark 동일하나
// $value(실제 색)와 dark gradeRules·배경 hex 판정에 mode별 파일이 필요하다.
const FILES = {
    semantic: (mode) => `semantic-color.${mode}.json`,
    primitive: (mode) => `primitive-color.${mode}.json`,
    textStyle: () => `text-style.json`,
    typography: () => `typography.json`,
};

// 출처 추상화 — CDN 전환 시 이 함수 내부만 fetch로 교체.
async function loadRaw(fileName) {
    return JSON.parse(await readFile(join(ASSETS, fileName), 'utf8'));
}

export function vaporMeta(node) {
    return node?.$extensions?.[NS] ?? {};
}

// 중첩 트리 → { "colors.foreground.primary.100": { when, avoid, role, minimumContrast, status, gradeRule, valueRef, $description } }
// gradeRules는 그룹(foreground) 레벨에만 있으므로, 평탄화할 때 자식 leaf의 등급(100/200)별로 끌어와 매핑한다.
export function flattenSemantic(root) {
    const out = {};
    function walk(node, path, inheritedGradeRules) {
        const meta = vaporMeta(node);
        const gradeRules = meta.gradeRules ?? inheritedGradeRules;
        if ('$value' in node) {
            const grade = path.split('.').pop();
            out[path] = {
                $description: node.$description ?? null,
                when: meta.when ?? [],
                avoid: meta.avoid ?? [],
                role: meta.accessibility?.role ?? null,
                minimumContrast: meta.accessibility?.minimumContrast ?? null,
                status: meta.status ?? null,
                gradeRule: gradeRules?.[grade] ?? null,
                valueRef: typeof node.$value === 'string' ? node.$value : null,
            };
            return;
        }
        for (const [k, v] of Object.entries(node)) {
            if (k.startsWith('$')) continue;
            walk(v, path ? `${path}.${k}` : k, gradeRules);
        }
    }
    walk(root.colors, 'colors', null);
    return out;
}

// text-style: 16단 위계 + when/avoid. 배열 순서가 곧 위계(display1 → ... → body4)다.
export function flattenTextStyle(root) {
    const order = [];
    const styles = {};
    for (const [name, node] of Object.entries(root.textStyle)) {
        if (name.startsWith('$') || typeof node !== 'object') continue;
        const meta = vaporMeta(node);
        order.push(name);
        styles[name] = {
            $description: node.$description ?? null,
            when: meta.when ?? [],
            avoid: meta.avoid ?? [],
        };
    }
    return { order, styles };
}

// primitive를 평탄화한 { "colors.blue.600": <$value> } 맵. semantic $value alias 해석용.
export function flattenPrimitive(root) {
    const out = {};
    function walk(node, path) {
        if (!node || typeof node !== 'object') return;
        if ('$value' in node) {
            out[path] = node.$value;
            return;
        }
        for (const [k, v] of Object.entries(node)) {
            if (k.startsWith('$')) continue;
            walk(v, path ? `${path}.${k}` : k);
        }
    }
    walk(root.colors, 'colors');
    return out;
}

// evaluate / typography-evaluate가 받는 단일 진입점. mode로 light/dark를 고른다.
export async function loadColorSchema(mode = 'light') {
    const semanticRaw = await loadRaw(FILES.semantic(mode));
    const primitiveRaw = await loadRaw(FILES.primitive(mode));
    const semantic = flattenSemantic(semanticRaw);
    const primitive = flattenPrimitive(primitiveRaw);
    return {
        mode,
        semantic,
        primitive,
        tokenKeys: Object.keys(semantic),
    };
}

export async function loadTypographySchema() {
    const raw = await loadRaw(FILES.textStyle());
    return flattenTextStyle(raw);
}
