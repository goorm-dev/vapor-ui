import type { ReactNode } from 'react';

interface DocsGridProps {
    children: ReactNode;
}

export const DocsGrid = ({ children }: DocsGridProps) => {
    return (
        <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-v-200 md:items-start my-v-250 [&>figure]:my-0">
            {children}
        </div>
    );
};
