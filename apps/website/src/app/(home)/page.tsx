'use client';

import { useState } from 'react';

import { Badge, Button, Text, useTheme } from '@vapor-ui/core';
import {
    AiSmartieIcon,
    ForwardPageOutlineIcon,
    RemoteIcon,
    SearchOutlineIcon,
    StarIcon,
} from '@vapor-ui/icons';
import Link from 'next/link';

import { ChromeWindow } from '~/components/chrome-window';
import {
    LocalTab,
    LocalTabs,
    LocalTabsContent,
    LocalTabsList,
} from '~/components/local-tabs/local-tabs';
import DefaultSearchDialog from '~/components/search/search';

export default function HomePage() {
    const { appearance, setTheme } = useTheme();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const handleTabChange = (value: string) => {
        switch (value) {
            case 'tab1': // Vapor theme
                setTheme({
                    primaryColor: '#3B82F6', // blue-500
                    radius: 'md',
                    scaling: 1.0, // 100%
                });
                break;
            case 'tab2': // Aurora theme
                setTheme({
                    primaryColor: '#8B5CF6', // violet-500
                    radius: 'lg',
                    scaling: 1.0, // 100%
                });
                break;
            case 'tab3': // Pop theme
                setTheme({
                    primaryColor: '#EC4899', // pink-500
                    radius: 'full',
                    scaling: 1.2, // 120%
                });
                break;
        }
    };

    return (
        <>
            <main className="relative -top-[64px]">
                <section
                    className="relative flex flex-col items-center gap-10 self-stretch justify-center text-center md:p-0 p-4 h-[720px]"
                    style={{
                        backgroundImage: `url(https://statics.goorm.io/gds/docs/main/vapor-index-background-image-${appearance}.png)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                >
                    <div
                        className="absolute bottom-0 left-0 w-full h-[162px]"
                        style={{
                            background:
                                appearance === 'light'
                                    ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, var(--color-background-normal, #FFF) 100%)'
                                    : 'linear-gradient(180deg, rgba(35, 39, 46, 0.00) 0%, var(--color-background-normal, #23272E) 100%)',
                        }}
                    />
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
                                className="max-w-[720px] w-full rounded-[var(--vapor-size-borderRadius-400)] flex flex-col items-center gap-4 bg-[rgba(0,0,0,0.16)] border border-[var(--vapor-color-border-normal)] shadow-[var(--vapor-shadow-100)] p-3 md:p-4"
                                onClick={() => setIsSearchOpen(true)}
                            >
                                <div className="flex items-center w-full px-6 h-12 justify-between rounded-[var(--vapor-size-borderRadius-300)] border border-[var(--vapor-color-border-normal)] bg-[var(--vapor-color-background-normal-lighter)]">
                                    <div className="flex items-center gap-[var(--vapor-size-space-100)]">
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
                                    <div className="flex items-center gap-[var(--vapor-size-space-100)]">
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
                <section className="min-h-[100vh] flex py-[var(--vapor-size-space-500)]  px-[var(--vapor-size-space-400)] max-[767px]:px-[var(--vapor-size-space-250)] flex-col items-center gap-[var(--vapor-size-space-300)] self-stretch bg-[var(--vapor-color-background-normal)]">
                    <div className="w-full justify-center flex flex-col items-center gap-[var(--vapor-size-space-200)] ">
                        <div className="flex flex-col items-center gap-[var(--vapor-size-space-100)] text-center">
                            <Text
                                typography="heading2"
                                foreground="normal"
                                asChild
                                className="max-[575px]:hidden"
                            >
                                <h2>Instantly customize your theme</h2>
                            </Text>
                            <Text
                                typography="heading3"
                                foreground="normal"
                                asChild
                                className="hidden max-[575px]:block"
                            >
                                <h3>Instantly customize your theme</h3>
                            </Text>
                            <Text typography="body1" foreground="normal">
                                샘플 테마를 통해 Vapor가 어떻게 변화하는지 확인하고,
                                <br />
                                나만의 테마를 완성해보세요
                            </Text>
                        </div>
                        <LocalTabs defaultValue="tab1" onValueChange={handleTabChange}>
                            <LocalTabsList>
                                <LocalTab value="tab1">
                                    <div className="flex gap-[var(--vapor-size-space-100)] justify-center items-center">
                                        <RemoteIcon />
                                        <Text typography="subtitle1" foreground="normal-lighter">
                                            Vapor
                                        </Text>
                                    </div>
                                </LocalTab>
                                <LocalTab value="tab2">
                                    <div className="flex gap-[var(--vapor-size-space-100)] justify-center items-center">
                                        <AiSmartieIcon />
                                        <Text typography="subtitle1" foreground="normal-lighter">
                                            Aurora
                                        </Text>
                                    </div>
                                </LocalTab>
                                <LocalTab value="tab3">
                                    <div className="flex gap-[var(--vapor-size-space-100)] justify-center items-center">
                                        <StarIcon />
                                        <Text typography="subtitle1" foreground="normal-lighter">
                                            Pop
                                        </Text>
                                    </div>
                                </LocalTab>
                            </LocalTabsList>
                            <LocalTabsContent value="tab1">
                                <div className="flex flex-col gap-[var(--vapor-size-space-150)] items-center">
                                    <Text foreground="normal" typography="subtitle1">
                                        Vapor 테마는 기본 속성값을 바탕으로 안정적이고 균형 잡힌
                                        디자인을 제공합니다
                                    </Text>
                                    <div className="flex items-center gap-[var(--vapor-size-space-100)]">
                                        <Badge color="hint">Primary: blue-500</Badge>
                                        <Badge color="hint">Border-radius: md</Badge>
                                        <Badge color="hint">Scaling: 100%</Badge>
                                    </div>
                                </div>
                            </LocalTabsContent>
                            <LocalTabsContent value="tab2">
                                <div className="flex flex-col gap-[var(--vapor-size-space-150)] items-center">
                                    <Text foreground="normal" typography="subtitle1">
                                        Aurora 테마는 신비롭고 미래적인 분위기로,혁신적이고 실험적인
                                        서비스에 적합합니다
                                    </Text>
                                    <div className="flex items-center gap-[var(--vapor-size-space-100)]">
                                        <Badge color="hint">Primary: violet-500</Badge>
                                        <Badge color="hint">Border-radius: lg</Badge>
                                        <Badge color="hint">Scaling: 100%</Badge>
                                    </div>
                                </div>
                            </LocalTabsContent>
                            <LocalTabsContent value="tab3">
                                <div className="flex flex-col gap-[var(--vapor-size-space-150)] items-center">
                                    <Text foreground="normal" typography="subtitle1">
                                        Pop 테마는 활기차고 생동감 있는 디자인으로, 창의적이고
                                        역동적인 서비스에 적합합니다
                                    </Text>
                                    <div className="flex items-center gap-[var(--vapor-size-space-100)]">
                                        <Badge color="hint">Primary: pink-500</Badge>
                                        <Badge color="hint">Border-radius: full</Badge>
                                        <Badge color="hint">Scaling: 120%</Badge>
                                    </div>
                                </div>
                            </LocalTabsContent>
                        </LocalTabs>
                    </div>
                    <main className="w-full">
                        <div className="min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
                            <ChromeWindow className="w-full" />
                        </div>
                    </main>
                </section>
            </main>
        </>
    );
}
