import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';

import type { CalloutRootProps } from './callout';
import { Callout } from './callout';

const CALLOUT_CONTENT = 'This is a callout message';

const CalloutTest = (props: CalloutRootProps) => {
    return <Callout.Root {...props}>{CALLOUT_CONTENT}</Callout.Root>;
};

describe('Callout', () => {
    it('should have no a11y violations', async () => {
        const rendered = render(<CalloutTest />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });
});
