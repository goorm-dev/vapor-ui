import { describe, expect, it } from 'vitest';

import { extractComponentAncestry } from './fiber-component';

type TestFiber = {
    type: unknown;
    return: TestFiber | null;
};

const forwardRef = (displayName: string) => ({
    $$typeof: Symbol.for('react.forward_ref'),
    render: () => null,
    displayName,
});

const memo = (inner: unknown) => ({
    $$typeof: Symbol.for('react.memo'),
    type: inner,
});

// fiber.return 체인을 잇고, 가장 안쪽 fiber를 단 mock element를 만든다.
const elementWithChain = (types: unknown[]): Element => {
    let parent: TestFiber | null = null;
    for (let i = types.length - 1; i >= 0; i--) {
        parent = { type: types[i], return: parent };
    }
    return { __reactFiber$abc: parent } as unknown as Element;
};

describe('extractComponentAncestry', () => {
    it('returns [] when the element has no fiber', () => {
        expect(extractComponentAncestry({} as Element)).toEqual([]);
    });

    it('skips host components (string type)', () => {
        const fn = () => null;
        fn.displayName = 'Button';
        const el = elementWithChain(['div', fn]);
        expect(extractComponentAncestry(el)).toEqual(['Button']);
    });

    it('reads displayName from forwardRef and memo wrappers', () => {
        const card = forwardRef('Card.Root');
        const dialog = memo(forwardRef('Dialog.Popup'));
        const el = elementWithChain([card, dialog]);
        expect(extractComponentAncestry(el)).toEqual(['Card.Root', 'Dialog.Popup']);
    });

    it('keeps components from any library, not just a design system', () => {
        const el = elementWithChain([forwardRef('AppHeader'), forwardRef('CheckboxRoot')]);
        expect(extractComponentAncestry(el)).toEqual(['AppHeader', 'CheckboxRoot']);
    });

    it('drops Context/Provider structural wrappers', () => {
        const el = elementWithChain([
            forwardRef('Button'),
            forwardRef('CheckboxRootContext'),
            forwardRef('ThemeProvider'),
            forwardRef('Card.Root'),
        ]);
        expect(extractComponentAncestry(el)).toEqual(['Button', 'Card.Root']);
    });

    it('collapses adjacent duplicates (vapor Button wrapping base-ui Button)', () => {
        const el = elementWithChain([forwardRef('Button'), forwardRef('Button')]);
        expect(extractComponentAncestry(el)).toEqual(['Button']);
    });

    it('caps the chain at three components, closest first', () => {
        const el = elementWithChain([
            forwardRef('Button'),
            forwardRef('Card.Root'),
            forwardRef('Dialog.Popup'),
            forwardRef('Sheet.Root'),
        ]);
        expect(extractComponentAncestry(el)).toEqual(['Button', 'Card.Root', 'Dialog.Popup']);
    });
});
