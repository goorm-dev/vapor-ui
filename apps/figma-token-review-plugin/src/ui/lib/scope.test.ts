import { describe, expect, it } from 'vitest';

import type { Property, Role } from '~/common/schemas';
import { PROPERTY_SCOPE } from '~/ui/lib/scope';

describe('PROPERTY_SCOPE', () => {
    it('fill 은 background role 만 허용한다', () => {
        expect(PROPERTY_SCOPE.fill).toEqual(['background']);
    });

    it('fill-on-text 는 foreground role 만 허용한다', () => {
        expect(PROPERTY_SCOPE['fill-on-text']).toEqual(['foreground']);
    });

    it('stroke 는 border role 만 허용한다', () => {
        expect(PROPERTY_SCOPE.stroke).toEqual(['border']);
    });

    it('padding 과 gap 은 space role', () => {
        expect(PROPERTY_SCOPE.padding).toEqual(['space']);
        expect(PROPERTY_SCOPE.paddingTop).toEqual(['space']);
        expect(PROPERTY_SCOPE.paddingRight).toEqual(['space']);
        expect(PROPERTY_SCOPE.paddingBottom).toEqual(['space']);
        expect(PROPERTY_SCOPE.paddingLeft).toEqual(['space']);
        expect(PROPERTY_SCOPE.paddingVertical).toEqual(['space']);
        expect(PROPERTY_SCOPE.paddingHorizontal).toEqual(['space']);
        expect(PROPERTY_SCOPE.gap).toEqual(['space']);
    });

    it('width 와 height 는 dimension role', () => {
        expect(PROPERTY_SCOPE.width).toEqual(['dimension']);
        expect(PROPERTY_SCOPE.height).toEqual(['dimension']);
    });

    it('borderRadius / shadow 는 동명 role', () => {
        expect(PROPERTY_SCOPE.borderRadius).toEqual(['borderRadius']);
        expect(PROPERTY_SCOPE.shadow).toEqual(['shadow']);
    });

    it('typography Property 는 매핑이 없다 (결정론 결과 별도 정책)', () => {
        const map = PROPERTY_SCOPE as Record<Property, ReadonlyArray<Role>>;
        expect(map.textStyle).toBeUndefined();
    });
});
