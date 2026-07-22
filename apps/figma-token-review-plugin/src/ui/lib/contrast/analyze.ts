/**
 * 텍스트 노드 스크린샷에서 effective 배경 hex 를 추정하고
 * WCAG contrast ratio 를 계산한다.
 *
 * 알고리즘:
 * 1. base64 PNG → HTMLImageElement → canvas → ImageData
 * 2. 알파 픽셀만 채택. 각 픽셀 luminance 계산.
 * 3. fg hex 의 luminance 와의 절대 차 상위 30% 만 골라 평균 → effective bg
 * 4. WCAG contrast = (Lmax + 0.05) / (Lmin + 0.05)
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

function readImageData(img: HTMLImageElement): ImageData {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2d context unavailable');
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, w, h);
}

export type ContrastResult = {
    fgHex: string;
    bgHex: string;
    ratio: number;
    /** WCAG AA large-text 판정 (fontSize >= 18pt, or >= 14pt bold). */
    isLargeText: boolean;
    /** AA 통과 여부. */
    passesAA: boolean;
};

/**
 * @param imageBase64 plugin 이 첨부한 텍스트 노드 PNG (2x)
 * @param fgHex 텍스트 노드 fill hex (deterministic)
 * @param fontSize CSS px 단위
 * @param isBold bold 여부 (large-text 판정용)
 */
export async function analyzeTextContrast(
    imageBase64: string,
    fgHex: string,
    fontSize: number,
    isBold: boolean,
): Promise<ContrastResult | null> {
    const fg = hexToRgb(fgHex);
    if (!fg) return null;
    let data: ImageData;
    try {
        const img = await loadImageFromBase64(imageBase64);
        data = readImageData(img);
    } catch {
        return null;
    }
    const fgL = relativeLuminance(fg.r, fg.g, fg.b);
    const pixels = data.data;

    // 픽셀별 fg 대비 luminance 거리 수집.
    const opaque: Array<{ r: number; g: number; b: number; dist: number }> = [];
    for (let i = 0; i < pixels.length; i += 4) {
        const a = pixels[i + 3];
        if (a < 250) continue; // anti-alias 픽셀 제외 (대략)
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const l = relativeLuminance(r, g, b);
        opaque.push({ r, g, b, dist: Math.abs(l - fgL) });
    }
    if (opaque.length === 0) return null;

    // fg 와 luminance 차이가 큰 상위 30% 만 bg 후보로 사용.
    opaque.sort((a, b) => b.dist - a.dist);
    const cutoff = Math.max(1, Math.floor(opaque.length * 0.3));
    const bgSample = opaque.slice(0, cutoff);

    let sr = 0,
        sg = 0,
        sb = 0;
    for (const px of bgSample) {
        sr += px.r;
        sg += px.g;
        sb += px.b;
    }
    const bgR = sr / bgSample.length;
    const bgG = sg / bgSample.length;
    const bgB = sb / bgSample.length;
    const bgL = relativeLuminance(bgR, bgG, bgB);
    const ratio = contrastRatio(fgL, bgL);
    // WCAG large-text 정의: 18pt (~24px) 이상, 또는 14pt (~18.66px) bold 이상.
    const isLargeText = fontSize >= 24 || (isBold && fontSize >= 18.66);
    const threshold = isLargeText ? 3.0 : 4.5;
    return {
        fgHex,
        bgHex: rgbToHex(bgR, bgG, bgB),
        ratio,
        isLargeText,
        passesAA: ratio >= threshold,
    };
}

/**
 * ColorUsage 중 textShot 이 붙은 항목만 대상으로 텍스트 색대비 판정.
 * 실패한 항목은 `text-contrast-low` (severity high) violation 배열로 반환.
 * 병렬 분석. 개별 분석 실패는 조용히 스킵.
 */
export async function evaluateTextContrast(usages: ColorUsage[]): Promise<Violation[]> {
    const targets = usages.filter(
        (u): u is ColorUsage & { textShot: NonNullable<ColorUsage['textShot']>; hex: string } =>
            !!u.textShot && !!u.hex && u.property === 'text',
    );
    const results = await Promise.all(
        targets.map(async (u) => {
            const r = await analyzeTextContrast(
                u.textShot.imageBase64,
                u.hex,
                u.textShot.fontSize,
                u.textShot.isBold,
            );
            if (!r) return null;
            if (r.passesAA) return null;
            const threshold = r.isLargeText ? 3.0 : 4.5;
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
                message: `WCAG AA 미준수. 대비 ${r.ratio.toFixed(2)}:1 (기준 ${threshold}:1, ${r.isLargeText ? 'large' : 'normal'} text). 배경 ${r.bgHex} vs 텍스트 ${r.fgHex}.`,
            };
            return v;
        }),
    );
    return results.filter((x): x is Violation => x !== null);
}
