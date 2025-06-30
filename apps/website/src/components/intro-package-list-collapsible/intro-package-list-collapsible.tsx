'use client';

import { useState } from 'react';

import * as Collapsible from '@radix-ui/react-collapsible';
import { Badge, IconButton } from '@vapor-ui/core';
import { BookIcon, ChevronDownOutlineIcon } from '@vapor-ui/icons';

export default function IntroPackageListCollapsible() {
    const [open, setOpen] = useState(false);

    return (
        <Collapsible.Root
            open={open}
            onOpenChange={setOpen}
            className="w-full rounded-2xl bg-white shadow-md overflow-hidden"
        >
            <Collapsible.Trigger asChild>
                <button
                    type="button"
                    className="flex items-center justify-between w-full bg-gray-50 border-none rounded-lg p-5 cursor-pointer transition-colors gap-4"
                >
                    <span className="flex items-center gap-3">
                        <BookIcon className="w-6 h-6 text-gray-900" />
                        <span className="font-medium text-base text-gray-900 leading-6 mr-2">
                            주요 패키지에 대해 알아보아요.
                        </span>
                        <Badge color="success" size="sm" shape="pill">
                            Onboarding
                        </Badge>
                    </span>
                    <IconButton
                        size="sm"
                        color="secondary"
                        rounded={false}
                        className="bg-transparent border-none p-0 flex items-center justify-center transition-transform"
                    >
                        <ChevronDownOutlineIcon
                            className={
                                open
                                    ? 'transition-transform transform rotate-180'
                                    : 'transition-transform'
                            }
                        />
                    </IconButton>
                </button>
            </Collapsible.Trigger>
            <Collapsible.Content className="w-full bg-gray-50 px-5 pb-5 pt-0 rounded-b-2xl">
                <div className="flex gap-4 w-full mt-6">
                    <div className="bg-white rounded-lg border border-gray-300 flex-1 min-w-0 flex flex-col overflow-hidden shadow-sm">
                        <div className="w-full h-[140px] bg-gray-200 flex items-center justify-center" />
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
                        <div className="w-full h-[140px] bg-gray-200 flex items-center justify-center" />
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
                        <div className="w-full h-[140px] bg-gray-200 flex items-center justify-center" />
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
            </Collapsible.Content>
        </Collapsible.Root>
    );
}
