'use client';

import { useState } from 'react';

import { Badge, Text } from '@vapor-ui/core';
import type { IconType } from '@vapor-ui/icons';
import { CheckCircleIcon, CopyIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import styles from './icon-list-item.module.scss';

export const getIconImportStatement = (iconName: string): string => {
    // 파일 경로와 확장자를 지정합니다.

    // import 문을 생성하여 문자열로 반환합니다.
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
    icon: IconType;
    iconName: string;
    className?: string;
};

const IconListItem = ({ icon: Icon, iconName }: IconListItemProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const copyIconImportStatement = async () => {
        const importStatement = getIconImportStatement(iconName);
        const result = await copyToClipboard(importStatement);

        setIsCopied(result);
        if (result) {
            setTimeout(() => setIsCopied(false), 600);
        }
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setIsCopied(false);
    };

    return (
        <div
            tabIndex={0}
            role="button"
            className={clsx(styles.iconListItem)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <span className={styles.iconContainer}>
                <Icon size="40" color="var(--vapor-color-foreground-normal)" />
            </span>
            <Text typography="body3" color="foreground-normal" className={styles.text}>
                {iconName}
            </Text>
            {isHovered && <div className={styles.dim}></div>}
            {isHovered && (
                <Badge
                    size="lg"
                    className={clsx(styles.badge, {
                        [styles[`badge_copied`]]: isCopied,
                    })}
                    asChild
                >
                    <button className={styles.button} onClick={copyIconImportStatement}>
                        {isCopied ? (
                            <CheckCircleIcon
                                size="16"
                                color="var(--vapor-color-foreground-success-on-transparent"
                            />
                        ) : (
                            <CopyIcon
                                size="16"
                                color="var(--vapor-color-foreground-hint-on-transparent"
                            />
                        )}
                        <Text
                            color={
                                isCopied
                                    ? 'foreground-success-on-transparent'
                                    : 'foreground-hint-on-transparent'
                            }
                            typography="subtitle1"
                        >
                            {isCopied ? '코드 복사됨' : '코드 복사'}
                        </Text>
                    </button>
                </Badge>
            )}
        </div>
    );
};

export default IconListItem;
