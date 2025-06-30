'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

import CardDialog from './CardDialog';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Badge, Text } from '@vapor-ui/core';
import { BookIcon, ChevronDownOutlineIcon } from '@vapor-ui/icons';
import Image from 'next/image';

export default function IntroPackageListCollapsible() {
    const [open, setOpen] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <Collapsible.Root
            open={open}
            onOpenChange={setOpen}
            className="w-full rounded-[var(--vapor-size-borderRadius-300)] bg-[var(--vapor-color-background-normal-darker)] overflow-hidden"
            defaultOpen={true}
        >
            <Collapsible.Trigger asChild>
                <button
                    type="button"
                    className="flex items-center justify-between w-full bg-[var(--vapor-color-background-normal-darker)] border-none rounded-lg p-[var(--vapor-size-space-250)] cursor-pointer gap-[var(--vapor-size-space-100)]"
                >
                    <span className="flex items-center gap-[var(--vapor-size-space-075)]">
                        <Text
                            foreground="hint"
                            typography="subtitle1"
                            className="flex gap-[var(--vapor-size-space-100)] justify-center items-center"
                        >
                            <BookIcon />
                            주요 패키지에 대해 알아보아요.
                        </Text>
                        <Badge color="success" size="sm" shape="pill">
                            Onboarding
                        </Badge>
                    </span>
                    <span className="bg-transparent border-none p-0 flex items-center justify-center transition-transform">
                        <ChevronDownOutlineIcon
                            className={
                                open
                                    ? 'transition-transform transform rotate-180'
                                    : 'transition-transform'
                            }
                        />
                    </span>
                </button>
            </Collapsible.Trigger>
            <Collapsible.Content className="not-prose w-full px-[var(--vapor-size-space-250)] pb-[var(--vapor-size-space-250)] pt-0 rounded-[var(--vapor-size-borderRadius-300)] bg-[var(--vapor-color-background-normal-darker)]">
                <div className="flex gap-4 w-full">
                    <div
                        className="bg-white rounded-lg border border-gray-300 flex-1 min-w-0 flex flex-col overflow-hidden shadow-sm cursor-pointer focus:outline-none"
                        tabIndex={0}
                        role="button"
                        aria-label="Vapor Core란? 상세 보기"
                        onClick={() => setDialogOpen(true)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') setDialogOpen(true);
                        }}
                    >
                        <div className="w-full h-[140px] relative overflow-hidden rounded-t-lg">
                            <Image
                                src="https://statics.goorm.io/gds/docs/guides/introduction/core.svg"
                                alt="Vapor Core"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                style={{ objectFit: 'cover' }}
                                priority
                                className="object-cover object-center"
                            />
                        </div>
                        <div className="flex items-center gap-2 px-4 py-5">
                            <Badge color="success" size="sm" shape="pill">
                                1
                            </Badge>
                            <span className="font-medium text-base text-gray-900 leading-6">
                                Vapor Core란?
                            </span>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-300 flex-1 min-w-0 flex flex-col overflow-hidden shadow-sm">
                        <div className="w-full h-[140px] relative overflow-hidden rounded-t-lg">
                            <Image
                                src="https://statics.goorm.io/gds/docs/guides/introduction/minimum-functionality-and-form.svg"
                                alt="최소한의 기능과 형태"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                style={{ objectFit: 'cover' }}
                                priority
                                className="object-cover object-center"
                            />
                        </div>
                        <div className="flex items-center gap-2 px-4 py-5">
                            <Badge color="success" size="sm" shape="pill">
                                2
                            </Badge>
                            <span className="font-medium text-base text-gray-900 leading-6">
                                최소한의 기능과 형태
                            </span>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-300 flex-1 min-w-0 flex flex-col overflow-hidden shadow-sm">
                        <div className="w-full h-[140px] relative overflow-hidden rounded-t-lg">
                            <Image
                                src="https://statics.goorm.io/gds/docs/guides/introduction/development-characteristics.svg"
                                alt="개발 특징"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                style={{ objectFit: 'cover' }}
                                priority
                                className="object-cover object-center"
                            />
                        </div>
                        <div className="flex items-center gap-2 px-4 py-5">
                            <Badge color="success" size="sm" shape="pill">
                                3
                            </Badge>
                            <span className="font-medium text-base text-gray-900 leading-6">
                                개발 특징
                            </span>
                        </div>
                    </div>
                </div>
                <CardDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    title="Vapor Core란?"
                    description={
                        <div className="prose">
                            <ReactMarkdown>
                                {`
**높은 자유도**

- 최소한의 기능 제약과 최대한의 형태 커스텀 가능성을 제공합니다.
- 디자이너들이 제약 없이 설계할 수 있도록 높은 자유도를 제공합니다.

**컴포넌트 사용**

- Atom 단위의 컴포넌트를 정의하여 사용할 수 있습니다.
- 예시: Button, Input
- 단, 모든 Vapor Core 컴포넌트가 Vapor Components가 되는 것은 아닙니다. 예: DatePicker, Calendar

**조합형 컴포넌트 지향**

- 개별 컴포넌트는 여러 서브 컴포넌트로 구성될 수 있도록 설계합니다.
                                `}
                            </ReactMarkdown>
                        </div>
                    }
                />
            </Collapsible.Content>
        </Collapsible.Root>
    );
}
