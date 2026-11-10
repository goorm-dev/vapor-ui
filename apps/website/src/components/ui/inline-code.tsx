import { Text } from '@vapor-ui/core';
import clsx from 'clsx';

export const InlineCode = ({ typography = 'code1', className, children, ...props }: Text.Props) => {
    return (
        <Text
            render={<code />}
            typography={typography}
            className={clsx(
                'not-prose bg-v-gray-50 text-v-contrast rounded-v-200 px-v-50 py-v-0',
                className,
            )}
            {...props}
        >
            {children}
        </Text>
    );
};
