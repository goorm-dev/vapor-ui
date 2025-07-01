'use client';

import { createContext, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { DEV_FEATURES_MD, MINIMUM_MD, VAPOR_CORE_MD } from '../../constants/intro-md';
import CardDialog from './CardDialog';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Badge, Text } from '@vapor-ui/core';
import { BookIcon, ChevronDownOutlineIcon } from '@vapor-ui/icons';
import Image from 'next/image';

const DIALOGS = [
    {
        title: 'Vapor Core란?',
        description: (
            <div className="prose">
                <ReactMarkdown children={VAPOR_CORE_MD} />
            </div>
        ),
    },
    {
        title: '최소한의 기능과 형태',
        description: (
            <div className="prose">
                <ReactMarkdown children={MINIMUM_MD} />
            </div>
        ),
    },
    {
        title: '개발 특징',
        description: (
            <div className="prose">
                <ReactMarkdown children={DEV_FEATURES_MD} />
            </div>
        ),
    },
];

const DialogContext = createContext<{
    currentDialog: number | null;
    setCurrentDialog: (idx: number | null) => void;
}>({ currentDialog: null, setCurrentDialog: () => {} });

export default function IntroPackageListCollapsible() {
    const [open, setOpen] = useState(true);
    const [currentDialog, setCurrentDialog] = useState<number | null>(null);

    return (
        <DialogContext.Provider value={{ currentDialog, setCurrentDialog }}>
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
                        {DIALOGS.map((dialog, idx) => (
                            <div
                                key={dialog.title}
                                className="bg-white rounded-lg border border-gray-300 flex-1 min-w-0 flex flex-col overflow-hidden shadow-sm cursor-pointer focus:outline-none"
                                tabIndex={0}
                                role="button"
                                aria-label={`${dialog.title} 상세 보기`}
                                onClick={() => setCurrentDialog(idx)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') setCurrentDialog(idx);
                                }}
                            >
                                <div className="w-full h-[140px] relative overflow-hidden rounded-t-lg">
                                    <Image
                                        src={
                                            idx === 0
                                                ? 'https://statics.goorm.io/gds/docs/guides/introduction/core.svg'
                                                : idx === 1
                                                  ? 'https://statics.goorm.io/gds/docs/guides/introduction/minimum-functionality-and-form.svg'
                                                  : 'https://statics.goorm.io/gds/docs/guides/introduction/development-characteristics.svg'
                                        }
                                        alt={dialog.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        style={{ objectFit: 'cover' }}
                                        priority
                                        className="object-cover object-center"
                                    />
                                </div>
                                <div className="flex items-center gap-2 px-4 py-5">
                                    <Badge color="success" size="sm" shape="pill">
                                        {idx + 1}
                                    </Badge>
                                    <span className="font-medium text-base text-gray-900 leading-6">
                                        {dialog.title}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {DIALOGS.map((dialog, idx) => (
                        <CardDialog
                            key={dialog.title}
                            open={currentDialog === idx}
                            onOpenChange={(open) => setCurrentDialog(open ? idx : null)}
                            title={dialog.title}
                            description={dialog.description}
                            onPrev={idx > 0 ? () => setCurrentDialog(idx - 1) : undefined}
                            onNext={
                                idx < DIALOGS.length - 1
                                    ? () => setCurrentDialog(idx + 1)
                                    : undefined
                            }
                            prevTitle={idx > 0 ? DIALOGS[idx - 1].title : undefined}
                            nextTitle={
                                idx < DIALOGS.length - 1 ? DIALOGS[idx + 1].title : undefined
                            }
                        />
                    ))}
                </Collapsible.Content>
            </Collapsible.Root>
        </DialogContext.Provider>
    );
}
