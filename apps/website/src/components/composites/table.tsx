import type { ComponentProps } from 'react';

import clsx from 'clsx';

interface TableProps extends ComponentProps<'table'> {}

const thStyle = clsx(
    '[&_th]:px-v-300 [&_th]:py-v-175 [&_th]:bg-inherit [&_th]:border-x-0',
    '[&_th]:text-base [&_th]:font-medium [&_th]:text-v-normal [&_th]:text-left [&_th]:align-middle',
    '[&_th]:text-v-normal [&_th]:tracking-v-100 [&_th]:leading-v-75 [&_th]:text-v-75 [&_th]:font-medium',
);

const tdStyle = clsx(
    '[&_td]:px-v-300 [&_td]:py-v-200 [&_td]:border-x-0',
    '[&_td]:text-base [&_td]:font-normal [&_td]:text-v-normal [&_td]:align-middle',
    '[&_td]:text-v-normal [&_td]:tracking-v-100 [&_td]:leading-v-75 [&_td]:text-v-75 [&_td]:font-normal',
);

export const Table = ({ children }: TableProps) => {
    return (
        <div className="w-full">
            <table
                className={clsx(
                    'border-collapse',
                    '[&_tr]:border-b [&_tr]:border-v-normal [&_tr>*:first-child]:text-nowrap',
                    thStyle,
                    tdStyle,
                )}
            >
                {children}
            </table>
        </div>
    );
};
