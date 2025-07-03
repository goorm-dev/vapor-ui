'use client';

import { useEffect, useState } from 'react';

import { Badge, Button, Text, useTheme } from '@vapor-ui/core';
import { ForwardPageOutlineIcon, SearchOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';

import DefaultSearchDialog from '~/components/search/search';

export default function HomePage() {
    const { setTheme } = useTheme();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        setTheme({ appearance: 'dark' });
    }, [setTheme]);

    return (
        <main
            className={clsx(
                'flex flex-col items-center gap-10 self-stretch flex-1 justify-center text-center md:p-0 p-4',
            )}
        >
            <DefaultSearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />

            <Image
                className="select-none absolute top-0 left-0 w-full h-full object-cover opacity-50 mix-blend-soft-light pointer-events-none"
                src="https://statics.goorm.io/gds/docs/main/vapor-index-banner.png" // TODO: 이미지 s3에 올려서 사용할 것
                alt="" // banner와 같이 단순 시각 효과를 위한 이미지는 대체 텍스트를 사용하지 않는다.
                width="1440"
                height="572"
                priority
            />

            <div className="flex flex-col items-center gap-4 self-stretch">
                <div className="flex flex-col items-center gap-10 self-stretch">
                    <div className="flex flex-col items-center gap-4 self-stretch">
                        <div className="flex flex-col items-center gap-[4px] self-stretch">
                            <Badge size="lg" color="hint" shape="pill">
                                구름 디자인 시스템 3.0
                            </Badge>

                            <Text
                                typography="display4"
                                foreground="normal"
                                asChild
                                className="hidden md:block"
                            >
                                <h1>
                                    Kickstart your project
                                    <br />
                                    with our UI Kit.
                                </h1>
                            </Text>
                            <Text
                                typography="heading2"
                                foreground="normal"
                                asChild
                                className="md:hidden"
                            >
                                <h1>
                                    Kickstart your project
                                    <br />
                                    with our UI Kit.
                                </h1>
                            </Text>
                        </div>

                        <Text typography="body1" foreground="normal" className="hidden md:block">
                            Vapor는 디자이너와 개발자가 함께 사용할 수 있는 통일된 디자인 언어와
                            구성 요소를 제공하여 <br />
                            생산성을 높이고 사용자 경험을 개선하는 것을 목표로 합니다.
                        </Text>
                        <Text typography="body2" foreground="normal" className="md:hidden">
                            Vapor는 디자이너와 개발자가 함께 사용할 수 있는 통일된 디자인 언어와
                            구성 요소를 제공하여 <br />
                            생산성을 높이고 사용자 경험을 개선하는 것을 목표로 합니다.
                        </Text>
                    </div>
                    <button
                        type="button"
                        className="flex flex-col items-center gap-4 bg-[var(--vapor-color-background-normal)] p-3 md:p-4"
                        onClick={() => setIsSearchOpen(true)}
                        style={{
                            maxWidth: '720px',
                            width: '100%',
                            borderRadius: '12px',
                            border: '1px solid var(--vapor-color-border-hint)',
                            background:
                                'linear-gradient(90deg, rgba(35, 115, 235, 0.08) 0%, rgba(208, 227, 254, 0.08) 100%), #23272E',
                            boxShadow: '0px 4px 48px 0px rgba(115, 143, 255, 0.32)',
                        }}
                    >
                        <div className="flex items-center w-full px-6 h-12 justify-between rounded-[var(--vapor-size-borderRadius-300)] border border-[var(--vapor-color-border-normal)] bg-[var(--vapor-color-background-normal-lighter)]">
                            <div className="flex items-center gap-2">
                                <SearchOutlineIcon
                                    size={24}
                                    color="var(--vapor-color-foreground-hint)"
                                />
                                <Text
                                    typography="body1"
                                    foreground="hint"
                                    className="hidden md:block"
                                >
                                    사용할 컴포넌트 이름으로 검색해 보세요
                                </Text>
                                <Text typography="body1" foreground="hint" className="md:hidden">
                                    컴포넌트 이름으로 검색
                                </Text>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge
                                    asChild
                                    color="hint"
                                    size="md"
                                    shape="square"
                                    className="text-lg"
                                >
                                    <kbd>⌘</kbd>
                                </Badge>
                                <Badge
                                    asChild
                                    color="hint"
                                    size="md"
                                    shape="square"
                                    className="h-[24px] w-[24px]"
                                >
                                    <kbd>K</kbd>
                                </Badge>
                            </div>
                        </div>
                    </button>
                </div>

                <Button size="lg" color="secondary" className={'w-full md:w-auto'} asChild>
                    <Link href="/docs">
                        Docs 보러 가기
                        <ForwardPageOutlineIcon
                            width="24"
                            height="24"
                            color="var(--vapor-color-foreground-secondary)"
                        />
                    </Link>
                </Button>
            </div>
        </main>
    );
}
