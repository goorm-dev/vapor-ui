'use client';

import { useEffect, useState } from 'react';

import { Badge, Button, LocalThemeProvider, Text, useTheme } from '@vapor-ui/core';
import { ForwardPageOutlineIcon, SearchOutlineIcon } from '@vapor-ui/icons';
import Image from 'next/image';
import Link from 'next/link';

import { ChromeWindow } from '~/components/chrome-window';
import DefaultSearchDialog from '~/components/search/search';
import { ThemeToggle } from '~/components/theme-toggle';

export default function HomePage() {
    const { setTheme } = useTheme();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [chromeTheme, setChromeTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        setTheme({ appearance: 'dark' });
    }, [setTheme]);

    return (
        <>
            <Image
                className="select-none absolute left-0 w-full h-full object-cover opacity-50 mix-blend-soft-light pointer-events-none -top-[64px]"
                src="https://statics.goorm.io/gds/docs/main/vapor-index-banner.png"
                alt=""
                width="1440"
                height="572"
                priority
            />
            <main className="relative -top-[calc(var(--fd-banner-height))]">
                <section className="relative flex flex-col items-center gap-10 self-stretch justify-center text-center md:p-0 p-4 mt-[90px] h-[720px]">
                    <DefaultSearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />

                    <div className="flex flex-col items-center gap-4 self-stretch">
                        <div className="flex flex-col items-center gap-10 self-stretch">
                            <div className="flex flex-col items-center gap-4 self-stretch">
                                <div className="flex flex-col items-center gap-[var(--vapor-size-space-050)] self-stretch">
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

                                <Text
                                    typography="body1"
                                    foreground="normal"
                                    className="hidden md:block"
                                >
                                    Vapor는 디자이너와 개발자가 함께 사용할 수 있는 통일된 디자인
                                    언어와 구성 요소를 제공하여 <br />
                                    생산성을 높이고 사용자 경험을 개선하는 것을 목표로 합니다.
                                </Text>
                                <Text typography="body2" foreground="normal" className="md:hidden">
                                    Vapor는 디자이너와 개발자가 함께 사용할 수 있는 통일된 디자인
                                    언어와 구성 요소를 제공하여 <br />
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
                                        <Text
                                            typography="body1"
                                            foreground="hint"
                                            className="md:hidden"
                                        >
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
                </section>
                <LocalThemeProvider config={{ appearance: chromeTheme }}>
                    <section 
                        className="min-h-[100vh] flex pt-[60px] pb-[60px] px-[var(--vapor-size-space-200)] max-[767px]:px-[var(--vapor-size-space-250)] flex-col items-center gap-[var(--vapor-size-space-500)] self-stretch"
                        style={{
                            background: 'linear-gradient(180deg, var(--vapor-color-gray-050) 0%, var(--vapor-color-background-normal) 100%)'
                        }}
                    >
                        <header className="flex justify-between items-center flex-col gap-[var(--vapor-size-space-200)]">
                            <Text foreground="normal" typography="heading6" asChild>
                                <h6>FOUNDATION</h6>
                            </Text>
                            <ThemeToggle onThemeChange={setChromeTheme} defaultTheme={chromeTheme} />
                        </header>
                        <main className="w-full">
                            <div className="min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
                                <ChromeWindow className="w-full" theme={chromeTheme} />
                            </div>
                        </main>
                    </section>
                </LocalThemeProvider>
            </main>
        </>
    );
}
