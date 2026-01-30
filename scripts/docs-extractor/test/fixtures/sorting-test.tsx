// @ts-nocheck
import { type ReactElement, forwardRef } from 'react';

import type { SortingTestVariants } from './sorting-test.css';

export const SortingTest = forwardRef<HTMLDivElement, SortingTest.Props>((props, ref) => {
    return <div ref={ref} />;
});

export namespace SortingTest {
    export interface Props extends SortingTestVariants {
        /** Required prop - should be first */
        id: string;
        /** Custom prop - should be after state */
        customProp?: string;
        /** State prop - value */
        value?: string;
        /** State prop - onChange */
        onChange?: (value: string) => void;
        /** State prop - open */
        open?: boolean;
        /** State prop - defaultOpen */
        defaultOpen?: boolean;
        /** State prop - onOpenChange */
        onOpenChange?: (open: boolean) => void;
        /** Composition prop - asChild */
        asChild?: boolean;
        /** Composition prop - render */
        render?: ReactElement | ((props: object) => ReactElement);
        /** Another custom prop */
        label?: string;
    }
}
