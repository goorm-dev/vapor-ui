import { describe, expect, it } from 'vitest';

import { primaryColorPalette, primaryDependentTokens } from '../src/index';

describe('Primary Color Generator', () => {
    describe('primaryColorPalette', () => {
        it('should generate consistent primary color palette collection', () => {
            expect(primaryColorPalette).toMatchSnapshot();
        });

        it('should generate consistent primary color palette collection22', () => {
            expect(primaryDependentTokens).toMatchSnapshot();
        });
    });
});
