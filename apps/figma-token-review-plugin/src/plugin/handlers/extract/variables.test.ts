/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, describe, expect, it } from 'vitest';

import { readBoundToken } from './variables';

// ---------------------------------------------------------------------------
// figma.variables mock helpers
// ---------------------------------------------------------------------------

type FakeVariable = {
    id: string;
    name: string;
    collectionId: string;
    /** modeId → resolved value (alias or leaf). */
    valuesByMode: Record<string, any>;
    remote?: boolean;
};

type FakeCollection = {
    id: string;
    name: string;
};

const MODE = 'mode-1';

const COLLECTIONS = {
    primitive: { id: 'coll-prim', name: '⚙️ Primitives' },
    semanticSpace: { id: 'coll-sem-space', name: '● Semantic / Space' },
    semanticColor: { id: 'coll-sem-color', name: '● Semantic / Color' },
    component: { id: 'coll-comp', name: '💙 Button' },
} satisfies Record<string, FakeCollection>;

function leafValue() {
    return { r: 0, g: 0, b: 0, a: 1 };
}

function makeVar(id: string, name: string, collectionId: string, value: any): FakeVariable {
    return {
        id,
        name,
        collectionId,
        valuesByMode: { [MODE]: value },
    };
}

function alias(id: string) {
    return { type: 'VARIABLE_ALIAS', id };
}

function installFigma(vars: FakeVariable[], collections: FakeCollection[]) {
    const varById = new Map(vars.map((v) => [v.id, v]));
    const collById = new Map(collections.map((c) => [c.id, c]));

    (globalThis as any).figma = {
        variables: {
            getVariableByIdAsync: async (id: string) => {
                const v = varById.get(id);
                if (!v) return null;
                return { ...v, variableCollectionId: v.collectionId };
            },
            getVariableCollectionByIdAsync: async (id: string) => collById.get(id) ?? null,
            importVariableByKeyAsync: async () => null,
        },
    };
}

function nodeWithMode(collectionIds: string[]): SceneNode {
    const resolvedVariableModes: Record<string, string> = {};
    for (const c of collectionIds) resolvedVariableModes[c] = MODE;

    return {
        id: 'node-1',
        name: 'node',
        resolvedVariableModes,
    } as unknown as SceneNode;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('readBoundToken', () => {
    afterEach(() => {
        delete (globalThis as any).figma;
    });

    it("바인딩이 없으면 status='raw'", async () => {
        installFigma([], []);
        const node = nodeWithMode([]);

        const out = await readBoundToken(node, undefined, 'paddingLeft');

        expect(out).toEqual({ token: null, appliedToken: null, status: 'raw' });
    });

    it('직접 semantic 바인딩 → token/appliedToken 모두 semantic (회귀 방지)', async () => {
        const sem = makeVar(
            'v-sem',
            'size/size-space-200',
            COLLECTIONS.semanticSpace.id,
            leafValue(),
        );
        installFigma([sem], [COLLECTIONS.semanticSpace]);
        const node = nodeWithMode([COLLECTIONS.semanticSpace.id]);

        const out = await readBoundToken(node, { paddingLeft: { id: sem.id } }, 'paddingLeft');

        expect(out).toEqual({
            token: 'size-space-200',
            appliedToken: 'size-space-200',
            status: 'ok',
        });
    });

    it('component var 가 semantic 을 wrap → token=semantic, appliedToken=outer', async () => {
        const sem = makeVar(
            'v-sem',
            'size/size-space-200',
            COLLECTIONS.semanticSpace.id,
            leafValue(),
        );
        const comp = makeVar(
            'v-comp',
            'button/space-inline',
            COLLECTIONS.component.id,
            alias(sem.id),
        );
        installFigma([comp, sem], [COLLECTIONS.component, COLLECTIONS.semanticSpace]);
        const node = nodeWithMode([COLLECTIONS.component.id, COLLECTIONS.semanticSpace.id]);

        const out = await readBoundToken(node, { paddingLeft: { id: comp.id } }, 'paddingLeft');

        expect(out).toEqual({
            token: 'size-space-200',
            appliedToken: 'space-inline',
            status: 'ok',
        });
    });

    it('component → semantic → primitive 다단계 → token=semantic, appliedToken=outer', async () => {
        const prim = makeVar('v-prim', 'primitive/size-16', COLLECTIONS.primitive.id, leafValue());
        const sem = makeVar(
            'v-sem',
            'size/size-space-200',
            COLLECTIONS.semanticSpace.id,
            alias(prim.id),
        );
        const comp = makeVar(
            'v-comp',
            'button/space-inline',
            COLLECTIONS.component.id,
            alias(sem.id),
        );
        installFigma(
            [comp, sem, prim],
            [COLLECTIONS.component, COLLECTIONS.semanticSpace, COLLECTIONS.primitive],
        );
        const node = nodeWithMode([
            COLLECTIONS.component.id,
            COLLECTIONS.semanticSpace.id,
            COLLECTIONS.primitive.id,
        ]);

        const out = await readBoundToken(node, { paddingLeft: { id: comp.id } }, 'paddingLeft');

        expect(out).toEqual({
            token: 'size-space-200',
            appliedToken: 'space-inline',
            status: 'ok',
        });
    });

    it('component var 가 primitive 만 wrap (semantic 없음) → token=appliedToken=outer', async () => {
        const prim = makeVar('v-prim', 'primitive/size-16', COLLECTIONS.primitive.id, leafValue());
        const comp = makeVar(
            'v-comp',
            'button/space-inline',
            COLLECTIONS.component.id,
            alias(prim.id),
        );
        installFigma([comp, prim], [COLLECTIONS.component, COLLECTIONS.primitive]);
        const node = nodeWithMode([COLLECTIONS.component.id, COLLECTIONS.primitive.id]);

        const out = await readBoundToken(node, { paddingLeft: { id: comp.id } }, 'paddingLeft');

        // semantic 없음 → downstream 이 unknown-token 으로 처리하도록 token 도 outer 이름.
        expect(out).toEqual({
            token: 'space-inline',
            appliedToken: 'space-inline',
            status: 'ok',
        });
    });

    it('primitive 직접 바인딩 → token=appliedToken=primitive 이름', async () => {
        const prim = makeVar('v-prim', 'primitive/size-16', COLLECTIONS.primitive.id, leafValue());
        installFigma([prim], [COLLECTIONS.primitive]);
        const node = nodeWithMode([COLLECTIONS.primitive.id]);

        const out = await readBoundToken(node, { paddingLeft: { id: prim.id } }, 'paddingLeft');

        expect(out).toEqual({ token: 'size-16', appliedToken: 'size-16', status: 'ok' });
    });

    it('순환 참조 → seen guard, semantic 없음 → appliedToken=chain[0]', async () => {
        // v-a → v-b → v-a (loop). semantic tier 없음.
        const a = makeVar('v-a', 'button/a', COLLECTIONS.component.id, alias('v-b'));
        const b = makeVar('v-b', 'button/b', COLLECTIONS.component.id, alias('v-a'));
        installFigma([a, b], [COLLECTIONS.component]);
        const node = nodeWithMode([COLLECTIONS.component.id]);

        const out = await readBoundToken(node, { paddingLeft: { id: a.id } }, 'paddingLeft');

        expect(out.status).toBe('ok');
        expect(out.token).toBe('a');
        expect(out.appliedToken).toBe('a');
    });

    it('getVariableByIdAsync 가 null 반환하면 status=unknown', async () => {
        installFigma([], []);
        const node = nodeWithMode([]);

        const out = await readBoundToken(node, { paddingLeft: { id: 'missing' } }, 'paddingLeft');

        expect(out).toEqual({ token: null, appliedToken: null, status: 'unknown' });
    });
});
