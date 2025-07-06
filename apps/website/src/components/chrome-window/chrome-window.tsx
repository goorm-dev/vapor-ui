'use client';

import React, { useState } from 'react';

import { Button, Card, Text, TextInput } from '@vapor-ui/core';
import { CloseOutlineIcon, PlusOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import BrowserControlsIcon from '~public/icons/browser-controls.svg';
import DividerIcon from '~public/icons/divider.svg';
import SecureIcon from '~public/icons/secure.svg';
import TabLeftCurvedIcon from '~public/icons/tab-left-curved.svg';
import TabRightCurvedIcon from '~public/icons/tab-right-curved.svg';

interface ChromeWindowProps {
    className?: string;
}

export function ChromeWindow({ className = '' }: ChromeWindowProps) {
    // 가격 입력 상태 및 계산
    const [count, setCount] = useState(100);
    const pricePerItem = 20;
    const totalPrice = count > 0 ? count * pricePerItem : 0;

    const handleCountChange = (value: string) => {
        const numeric = value.replace(/[^0-9]/g, '');
        setCount(numeric === '' ? 0 : parseInt(numeric, 10));
    };

    return (
        <div
            className={clsx(
                'bg-[var(--vapor-color-background-normal)] rounded-[var(--vapor-size-borderRadius-500)] shadow-lg overflow-hidden w-full border border-[var(--vapor-color-border-normal)]',
                className,
            )}
        >
            {/* Window Controls */}
            <div className="h-[42px] px-3  flex items-center justify-start bg-[var(--vapor-color-background-normal-lighter)] border-b border-[var(--vapor-color-border-normal)] gap-[7px]">
                <div className="flex items-center gap-2">
                    <BrowserControlsIcon />
                </div>
                <div className="relative bottom-[-4px]">
                    <span className="absolute left-[-6px] bottom-0">
                        <TabLeftCurvedIcon />
                    </span>
                    <div className="flex items-center gap-[9px] p-[var(--vapor-size-space-100)] pl-[var(--vapor-size-space-200)] min-w-0 flex-shrink-0 relative bg-[var(--vapor-color-background-secondary)] rounded-t-[var(--vapor-size-borderRadius-300)]">
                        <div className="flex gap-[9px]">
                            <Text typography="subtitle2" foreground="normal">
                                Vapor UI
                            </Text>
                            <CloseOutlineIcon size="18" />
                        </div>
                    </div>
                    <span className="absolute right-[-6px] bottom-0">
                        <TabRightCurvedIcon />
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex h-[38px] bg-[var(--vapor-color-background-secondary)] items-center px-3">
                <div className="h-[28px] rounded-[14px] bg-[var(--vapor-color-background-normal)] w-full">
                    <div className="flex items-center gap-2 px-3 py-1 h-full">
                        <SecureIcon color="var(--vapor-color-foreground-secondary)" />
                        <Text typography="subtitle2" foreground="secondary">
                            Vapor UI Playground
                        </Text>
                    </div>
                </div>
            </div>
            <div className="bg-[var(--vapor-color-background-normal)] flex items-center justify-center p-[var(--vapor-size-space-400)]">
                <div>
                    <Card.Root>
                        <Card.Header>
                            <Text typography="heading6" foreground="normal">
                                크레딧 구매
                            </Text>
                        </Card.Header>
                        <Card.Body>
                            <div className="flex items-center gap-2 flex-col">
                                <div className="w-full">
                                    <TextInput.Root
                                        placeholder="100"
                                        className="w-full"
                                        size="xl"
                                        value={count === 0 ? '' : String(count)}
                                        onValueChange={handleCountChange}
                                    >
                                        <TextInput.Field className="w-full" inputMode="numeric" />
                                    </TextInput.Root>
                                    <Button size="lg" color="secondary" stretch className="mt-2">
                                        <span className="flex items-center gap-[var(--vapor-size-space-100)]">
                                            <PlusOutlineIcon
                                                size="20"
                                                color="var(--vapor-color-foreground-secondary-darker)"
                                            />
                                            <Text
                                                typography="subtitle1"
                                                foreground="secondary-darker"
                                            >
                                                {count}개 추가
                                            </Text>
                                        </span>
                                    </Button>
                                </div>
                                <DividerIcon height="1" />
                                <div className="flex flex-col w-full items-center justify-between gap-[var(--vapor-size-space-050)]">
                                    <div className="flex items-center gap-2 w-full justify-between">
                                        <Text typography="heading5" foreground="normal">
                                            최종 가격
                                        </Text>
                                        <Text typography="heading6" foreground="primary">
                                            {totalPrice.toLocaleString()}원
                                        </Text>
                                    </div>
                                    <div className="flex items-center gap-2 w-full justify-between">
                                        <Text typography="subtitle2" foreground="secondary">
                                            1,000원부터 결제할 수 있습니다.
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card.Root>
                </div>
            </div>
        </div>
    );
}
