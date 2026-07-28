/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';

import { classifyBackground } from './paint';

function makeSolid(hex: { r: number; g: number; b: number }, opacity = 1) {
    return { type: 'SOLID', color: hex, opacity, visible: true };
}

const WHITE = { r: 1, g: 1, b: 1 };
const RED = { r: 1, g: 0, b: 0 };

/**
 * 부모 체인만 참조하므로 parent 링크만 채운 최소 노드로 충분.
 */
function chain(...ancestors: any[]): any {
    for (let i = 0; i < ancestors.length - 1; i++) ancestors[i].parent = ancestors[i + 1];
    ancestors[ancestors.length - 1].parent = { type: 'PAGE' };
    return ancestors[0];
}

describe('classifyBackground', () => {
    it('흰색 배경 부모 → white', () => {
        const text: any = { type: 'TEXT', name: 'label' };
        const button: any = { type: 'FRAME', name: 'button', fills: [makeSolid(WHITE)] };
        chain(text, button);

        expect(classifyBackground(text).kind).toBe('white');
    });

    it('🔶InteractionLayer 조상의 fill 은 무시하고 상위로 계속 올라감', () => {
        const text: any = { type: 'TEXT', name: 'label' };
        const layer: any = {
            type: 'FRAME',
            name: '🔶InteractionLayer/hover',
            fills: [makeSolid(RED, 0.08)],
        };
        const button: any = { type: 'FRAME', name: 'button', fills: [makeSolid(WHITE)] };
        chain(text, layer, button);

        // InteractionLayer 를 건너뛰고 button 의 흰색을 봐야 함.
        expect(classifyBackground(text).kind).toBe('white');
    });

    it('부모가 색상 fill 을 가지면 other', () => {
        const text: any = { type: 'TEXT', name: 'label' };
        const button: any = { type: 'FRAME', name: 'button', fills: [makeSolid(RED)] };
        chain(text, button);

        expect(classifyBackground(text).kind).toBe('other');
    });

    it('부모가 fill 없이 PAGE 도달 → transparent', () => {
        const text: any = { type: 'TEXT', name: 'label' };
        const wrapper: any = { type: 'FRAME', name: 'wrap', fills: [] };
        chain(text, wrapper);

        expect(classifyBackground(text).kind).toBe('transparent');
    });
});
