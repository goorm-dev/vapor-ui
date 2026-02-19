'use client';

import { type FunctionComponent, memo, useCallback, useState } from 'react';

import { Text } from '@vapor-ui/core';
import type { IconProps } from '@vapor-ui/icons';
import { CheckCircleIcon, CopyOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

export const getIconImportStatement = (iconName: string): string => {
    return `import { ${iconName} } from '@vapor-ui/icons';`;
};

export const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy text: ', err);
        return false;
    }
};

export type IconListItemProps = {
    icon: FunctionComponent<IconProps>;
    iconName: string;
    className?: string;
};

const IconListItem = memo(function IconListItem({ icon: Icon, iconName }: IconListItemProps) {
    const [isCopied, setIsCopied] = useState(false);

    const copyIconImportStatement = useCallback(async () => {
        const importStatement = getIconImportStatement(iconName);
        const result = await copyToClipboard(importStatement);

        setIsCopied(result);
        if (result) {
            setTimeout(() => setIsCopied(false), 1500);
        }
    }, [iconName]);

    return (
        <button
            type="button"
            className={clsx(
                'group relative flex flex-col items-center justify-center gap-1.5',
                'w-full h-28 min-w-0 p-3 rounded-lg border cursor-pointer',
                'transition-[border-color,background-color] duration-150 ease-out motion-reduce:transition-none',
                'focus-visible:outline-2 focus-visible:[outline-offset:-2px] focus-visible:outline-[var(--vapor-color-foreground-normal-200)]',
                isCopied
                    ? 'border-v-success bg-v-success-100'
                    : 'border-transparent bg-v-overlay-100 hover:border-v-normal',
            )}
            onClick={copyIconImportStatement}
            aria-label={`${iconName} 아이콘 import 문 복사`}
            aria-pressed={isCopied}
        >
            {/* 아이콘 */}
            <span
                aria-hidden="true"
                className={clsx(
                    'flex items-center justify-center transition-all duration-150 motion-reduce:transition-none',
                    isCopied
                        ? 'text-v-success-100 scale-105 motion-reduce:scale-100'
                        : 'text-v-secondary-200 group-hover:text-v-primary-100 group-hover:scale-105 motion-reduce:group-hover:scale-100',
                )}
            >
                <Icon size="32" />
            </span>

            {/* 아이콘 이름 */}
            <Text
                typography="body3"
                aria-hidden="true"
                className={clsx(
                    'w-full text-center transition-colors duration-150 motion-reduce:transition-none',
                    'line-clamp-2 break-all text-[11px] leading-tight',
                    isCopied
                        ? 'text-v-success-100'
                        : 'text-v-secondary-200 group-hover:text-v-primary-100',
                )}
            >
                {iconName}
            </Text>

            {/* 복사 인디케이터 */}
            <span
                aria-hidden="true"
                className={clsx(
                    'absolute top-1.5 right-1.5 flex items-center justify-center p-0.5 rounded',
                    'transition-all duration-150 motion-reduce:transition-none',
                    isCopied
                        ? 'opacity-100 bg-v-success-200 text-v-inverse'
                        : 'opacity-0 bg-v-secondary-100 text-v-secondary-200 group-hover:opacity-100',
                )}
            >
                {isCopied ? <CheckCircleIcon size="12" /> : <CopyOutlineIcon size="12" />}
            </span>

            {/* 복사됨 알림 (스크린 리더용 Live Region) */}
            <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
                {isCopied ? `${iconName} import 문이 클립보드에 복사되었습니다` : ''}
            </span>
        </button>
    );
});

export default IconListItem;
