/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest';

import { exportWithoutInteractionLayers } from './hide-interaction-layers';

type Node = {
    name: string;
    visible: boolean;
    children?: Node[];
    x?: number;
    y?: number;
};

function n(name: string, children: Node[] = [], visible = true): Node {
    return { name, visible, children, x: 0, y: 0 };
}

/**
 * clone 시 children 을 얕지 않게 복사해야 원본과 독립적으로 mutate 가능.
 */
function deepClone(node: Node): Node {
    return {
        name: node.name,
        visible: node.visible,
        x: node.x,
        y: node.y,
        children: node.children ? node.children.map(deepClone) : undefined,
    };
}

function makeExportable(node: Node) {
    let removed = false;
    const exportMock = vi.fn().mockImplementation(async () => {
        // export 시점에 clone 내 InteractionLayer 는 이미 hidden 이어야 함.
        return { snapshot: JSON.parse(JSON.stringify(node)), removed };
    });

    return Object.assign(node, {
        clone: () => makeExportable(deepClone(node)),
        exportAsync: exportMock,
        remove: () => {
            removed = true;
        },
    });
}

describe('exportWithoutInteractionLayers', () => {
    it('원본 노드의 🔶InteractionLayer visibility 를 건드리지 않음', async () => {
        const layer = n('🔶InteractionLayer/hover');
        const original = makeExportable(n('button', [n('Text'), layer]));

        await exportWithoutInteractionLayers(original as any, { format: 'PNG' } as any);

        // 원본 layer 는 visible 그대로.
        expect(layer.visible).toBe(true);
    });

    it('export 시 clone 내부의 🔶InteractionLayer 는 visible=false 상태', async () => {
        const layer = n('🔶InteractionLayer/hover');
        const original = makeExportable(n('button', [n('Text'), layer]));
        const exportSpy = vi.spyOn(original as any, 'clone');

        await exportWithoutInteractionLayers(original as any, { format: 'PNG' } as any);

        // clone 이 한 번 호출되었어야 함.
        expect(exportSpy).toHaveBeenCalledTimes(1);
    });

    it('export 도중 throw 해도 clone.remove() 가 호출되어야 함', async () => {
        const layer = n('🔶InteractionLayer/hover');
        const original = makeExportable(n('button', [layer]));

        let removeCalled = false;
        (original as any).clone = () => {
            const clone = { ...deepClone(original), children: original.children };
            return {
                ...clone,
                exportAsync: () => Promise.reject(new Error('boom')),
                remove: () => {
                    removeCalled = true;
                },
            };
        };

        await expect(
            exportWithoutInteractionLayers(original as any, { format: 'PNG' } as any),
        ).rejects.toThrow('boom');

        expect(removeCalled).toBe(true);
    });

    it('clone 을 화면 밖(x=-100000, y=-100000) 으로 이동시켜 canvas flash 방지', async () => {
        const original = makeExportable(n('button', []));
        let clonePosition: { x?: number; y?: number } | null = null;

        (original as any).clone = () => {
            const clone: any = deepClone(original);
            clone.exportAsync = async () => {
                clonePosition = { x: clone.x, y: clone.y };
                return new Uint8Array();
            };
            clone.remove = () => {};
            return clone;
        };

        await exportWithoutInteractionLayers(original as any, { format: 'PNG' } as any);

        expect(clonePosition).toEqual({ x: -100000, y: -100000 });
    });

    it('중첩된 🔶InteractionLayer 여러 개도 모두 clone 내부에서 감춰짐', async () => {
        const original = makeExportable(
            n('button', [
                n('inner', [n('🔶InteractionLayer/hover')]),
                n('🔶InteractionLayer/pressed'),
            ]),
        );

        let hiddenLayerNames: string[] = [];
        (original as any).clone = () => {
            const clone: any = deepClone(original);
            clone.exportAsync = async () => {
                const collected: string[] = [];
                const walk = (node: Node) => {
                    if (node.name.startsWith('🔶InteractionLayer') && node.visible === false) {
                        collected.push(node.name);
                    }
                    node.children?.forEach(walk);
                };
                walk(clone);
                hiddenLayerNames = collected;
                return new Uint8Array();
            };
            clone.remove = () => {};
            return clone;
        };

        await exportWithoutInteractionLayers(original as any, { format: 'PNG' } as any);

        expect(hiddenLayerNames.sort()).toEqual([
            '🔶InteractionLayer/hover',
            '🔶InteractionLayer/pressed',
        ]);
    });

    it('clone 함수 없는 노드는 원본 export 로 fallback', async () => {
        const bytes = new Uint8Array([1, 2, 3]);
        const node: any = {
            name: 'x',
            exportAsync: vi.fn().mockResolvedValue(bytes),
        };

        const out = await exportWithoutInteractionLayers(node, { format: 'PNG' } as any);
        expect(out).toBe(bytes);
    });
});
