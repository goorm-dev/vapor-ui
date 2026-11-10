import { Text } from '@vapor-ui/core';
import clsx from 'clsx';

export const InlineCode = ({ typography = 'code1', className, children, ...props }: Text.Props) => {
    return (
        <Text
            render={<code />}
            typography={typography}
            className={clsx(
                'not-prose not-[pre>&]:bg-v-gray-50 not-[pre>&]:text-v-contrast not-[pre>&]:rounded-v-200 not-[pre>&]:px-v-50 not-[pre>&]:py-v-0 not-[pre>&]:border not-[pre>&]:border-v-normal',
                className,
            )}
            {...props}
        >
            {children}
        </Text>
    );
};
