/**
 * 텍스트 노드의 실제 배경 hex 를 확정하고 WCAG contrast ratio 를 계산.

 * WCAG:
 *   contrast = (Lmax + 0.05) / (Lmin + 0.05)
 *   large-text: fontSize ≥ 24px (=18pt) 또는 bold & fontSize ≥ 18.66px (=14pt)
 */
import type { ColorUsage, Violation } from '~/common/schemas';

function srgbToLinear(c: number): number {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(r: number, g: number, b: number): number {
    return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

export function contrastRatio(l1: number, l2: number): number {
    const lo = Math.min(l1, l2);
    const hi = Math.max(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const h = hex.trim().replace(/^#/, '');
    const norm =
        h.length === 3
            ? h
                  .split('')
                  .map((c) => c + c)
                  .join('')
            : h;
    if (!/^[0-9a-fA-F]{6}$/.test(norm)) return null;
    const n = parseInt(norm, 16);
    return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

function rgbToHex(r: number, g: number, b: number): string {
    const f = (n: number) => Math.round(n).toString(16).padStart(2, '0');
    return '#' + f(r) + f(g) + f(b);
}

async function loadImageFromBase64(base64: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('image decode failed'));
        img.src = `data:image/png;base64,${base64}`;
    });
}

type Crop = { x: number; y: number; w: number; h: number };

function readImageData(img: HTMLImageElement, crop?: Crop): ImageData {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2d context unavailable');
    ctx.drawImage(img, 0, 0);
    if (!crop) return ctx.getImageData(0, 0, w, h);
    const cx = Math.max(0, Math.min(crop.x, w - 1));
    const cy = Math.max(0, Math.min(crop.y, h - 1));
    const cw = Math.max(1, Math.min(crop.w, w - cx));
    const ch = Math.max(1, Math.min(crop.h, h - cy));
    return ctx.getImageData(cx, cy, cw, ch);
}

export type ContrastResult = {
    fgHex: string;
    bgHex: string;
    ratio: number;
    /** WCAG AA large-text 판정 (fontSize ≥ 24px, 또는 ≥ 18.66px bold). */
    isLargeText: boolean;
    /** AA 통과 여부. */
    passesAA: boolean;
};

function isLargeTextRule(fontSize: number, isBold: boolean): boolean {
    return fontSize >= 24 || (isBold && fontSize >= 18.66);
}

function threshold(isLargeText: boolean): number {
    return isLargeText ? 3.0 : 4.5;
}

function contrastFromRgb(
    fgHex: string,
    fg: { r: number; g: number; b: number },
    bg: { r: number; g: number; b: number },
    fontSize: number,
    isBold: boolean,
    bgHex: string,
): ContrastResult {
    const fgL = relativeLuminance(fg.r, fg.g, fg.b);
    const bgL = relativeLuminance(bg.r, bg.g, bg.b);
    const ratio = contrastRatio(fgL, bgL);
    const isLargeText = isLargeTextRule(fontSize, isBold);
    return { fgHex, bgHex, ratio, isLargeText, passesAA: ratio >= threshold(isLargeText) };
}

/**
 * SOLID opaque 배경용 결정적 경로. PNG 없이 hex → hex 대비.
 */
export function contrastFromHex(
    fgHex: string,
    bgHex: string,
    fontSize: number,
    isBold: boolean,
): ContrastResult | null {
    const fg = hexToRgb(fgHex);
    const bg = hexToRgb(bgHex);
    if (!fg || !bg) return null;
    return contrastFromRgb(fgHex, fg, bg, fontSize, isBold, bgHex);
}

/**
 * ambiguous 배경용 PNG 샘플링 경로. plugin 은 부모 노드를 텍스트가 보이는 상태로 캡처.
 * crop 영역 opaque 픽셀 중 fg 루미넌스와의 거리 상위 30% 만 bg 후보로 사용 → 글리프 픽셀 자연 배제.
 */
export async function analyzeTextContrast(
    imageBase64: string,
    fgHex: string,
    fontSize: number,
    isBold: boolean,
    crop?: Crop,
): Promise<ContrastResult | null> {
    const fg = hexToRgb(fgHex);
    if (!fg) return null;
    let data: ImageData;
    try {
        const img = await loadImageFromBase64(imageBase64);
        data = readImageData(img, crop);
    } catch {
        return null;
    }
    const fgL = relativeLuminance(fg.r, fg.g, fg.b);
    const pixels = data.data;

    const opaque: Array<{ r: number; g: number; b: number; dist: number }> = [];
    for (let i = 0; i < pixels.length; i += 4) {
        const a = pixels[i + 3];
        if (a < 250) continue;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const l = relativeLuminance(r, g, b);
        opaque.push({ r, g, b, dist: Math.abs(l - fgL) });
    }
    if (opaque.length === 0) return null;

    opaque.sort((a, b) => b.dist - a.dist);
    const cutoff = Math.max(1, Math.floor(opaque.length * 0.3));
    const sample = opaque.slice(0, cutoff);

    let sr = 0;
    let sg = 0;
    let sb = 0;
    for (const px of sample) {
        sr += px.r;
        sg += px.g;
        sb += px.b;
    }
    const bgR = sr / sample.length;
    const bgG = sg / sample.length;
    const bgB = sb / sample.length;
    return contrastFromRgb(
        fgHex,
        fg,
        { r: bgR, g: bgG, b: bgB },
        fontSize,
        isBold,
        rgbToHex(bgR, bgG, bgB),
    );
}

async function resolveContrast(u: ColorUsage & { hex: string }): Promise<ContrastResult | null> {
    const shot = u.textShot;
    if (!shot) return null;
    const bg = u.background;
    if (bg && (bg.kind === 'white' || bg.kind === 'other') && bg.hex) {
        return contrastFromHex(u.hex, bg.hex, shot.fontSize, shot.isBold);
    }
    if (
        bg &&
        bg.kind === 'ambiguous' &&
        shot.imageBase64 &&
        shot.cropX !== undefined &&
        shot.cropY !== undefined &&
        shot.cropW !== undefined &&
        shot.cropH !== undefined
    ) {
        return analyzeTextContrast(shot.imageBase64, u.hex, shot.fontSize, shot.isBold, {
            x: shot.cropX,
            y: shot.cropY,
            w: shot.cropW,
            h: shot.cropH,
        });
    }
    return null;
}

/**
 * ColorUsage 중 property === 'text' 인 항목의 텍스트 색대비를 판정.
 * 배경이 결정적이면 hex 로 즉시 계산, ambiguous 면 PNG 로 샘플링.
 * 실패/판정불가 항목은 조용히 스킵.
 */
export async function evaluateTextContrast(usages: ColorUsage[]): Promise<Violation[]> {
    const targets = usages.filter(
        (u): u is ColorUsage & { hex: string } => !!u.hex && u.property === 'text',
    );
    const results = await Promise.all(
        targets.map(async (u) => {
            const r = await resolveContrast(u);
            if (!r) return null;
            if (r.passesAA) return null;
            const th = threshold(r.isLargeText);
            const v: Violation = {
                nodeId: u.nodeId,
                nodeIds: u.nodeIds,
                count: u.count,
                name: u.name,
                property: 'fill-on-text',
                token: u.token,
                value: u.hex,
                origin: 'rule',
                type: 'text-contrast-low',
                severity: 'high',
                suggested: [],
                message: `WCAG AA 미준수. 대비 ${r.ratio.toFixed(2)}:1 (기준 ${th}:1, ${r.isLargeText ? 'large' : 'normal'} text). 배경 ${r.bgHex} vs 텍스트 ${r.fgHex}.`,
            };
            return v;
        }),
    );
    return results.filter((x): x is Violation => x !== null);
}
