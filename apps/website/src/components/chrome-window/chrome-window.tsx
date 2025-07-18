'use client';

import React, { createContext, useContext, useState } from 'react';

import { Badge, Button, Card, Text, TextInput } from '@vapor-ui/core';
import {
    AchievementIcon,
    CloseOutlineIcon,
    PlusOutlineIcon,
    SearchOutlineIcon,
} from '@vapor-ui/icons';
import clsx from 'clsx';
import Image from 'next/image';

import BrowserControlsIcon from '~public/icons/browser-controls.svg';
import SecureIcon from '~public/icons/secure.svg';
import TabLeftCurvedIcon from '~public/icons/tab-left-curved.svg';
import TabRightCurvedIcon from '~public/icons/tab-right-curved.svg';

import { UserList } from './user-list';

type LocalTheme = 'light' | 'dark';

interface LocalThemeContextType {
    theme: LocalTheme;
    setTheme: (theme: LocalTheme) => void;
}

const LocalThemeContext = createContext<LocalThemeContextType | undefined>(undefined);

export const useLocalTheme = () => {
    const context = useContext(LocalThemeContext);
    if (!context) {
        throw new Error('useLocalTheme must be used within LocalThemeProvider');
    }
    return context;
};

interface ChromeWindowProps {
    className?: string;
}

export function ChromeWindow({ className = '' }: ChromeWindowProps) {
    // 가격 입력 상태 및 계산
    const [count, setCount] = useState(100);
    const pricePerItem = 20;
    const totalPrice = count > 0 ? count * pricePerItem : 0;

    // 사용자 검색 상태
    const [searchQuery, setSearchQuery] = useState('');

    const handleCountChange = (value: string) => {
        const numeric = value.replace(/[^0-9]/g, '');
        setCount(numeric === '' ? 0 : parseInt(numeric, 10));
    };

    // 컴포넌트 내에서 사용할 users 예시 데이터 추가
    const activeUsers = [
        { name: '박서현', badge: '나', online: true, avatarAlt: '박서현' },
        {
            name: '윤서진',
            badge: '강의자',
            online: true,
            avatarAlt: '윤서진',
        },
        { name: '최하은', online: true, avatarAlt: '최하은' },
        { name: '신도윤', online: true, avatarAlt: '신도윤' },
        { name: '윤하린', online: true, avatarAlt: '윤하린' },
    ];

    const unActiveUsers = [
        { name: '김서윤', lastActiveDaysAgo: 10, online: false, avatarAlt: '김서윤' },
        { name: '한유진', lastActiveDaysAgo: 5, online: false, avatarAlt: '한유진' },
    ];

    // 검색 필터링 로직
    const filterUsers = (users: typeof activeUsers) => {
        if (!searchQuery.trim()) return users;
        return users.filter((user) => user.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    };

    const filteredActiveUsers = filterUsers(activeUsers);
    const filteredUnActiveUsers = filterUsers(unActiveUsers);

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
                        <TabLeftCurvedIcon color="var(--vapor-color-background-secondary" />
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
                        <TabRightCurvedIcon color="var(--vapor-color-background-secondary)" />
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
                <div className="flex items-start gap-[var(--vapor-size-space-400)] w-full">
                    {/* 좌측 영역 - 기존 내용 */}
                    <div className="flex items-center flex-col gap-[var(--vapor-size-space-400)] flex-1">
                        <Card.Root className="w-full">
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
                                            <TextInput.Field
                                                className="w-full"
                                                inputMode="numeric"
                                            />
                                        </TextInput.Root>
                                        <Button
                                            size="lg"
                                            color="secondary"
                                            stretch
                                            className="mt-2"
                                        >
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
                                    <div className="w-full h-[1px] bg-[var(--vapor-color-border-normal)]"></div>
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
                        <Card.Root className="w-full">
                            <Card.Body className="flex flex-col items-start gap-[var(--vapor-size-space-250)] self-stretch">
                                <div className="flex items-center gap-[var(--vapor-size-space-200)] self-stretch">
                                    <Image
                                        src="https://statics.goorm.io/exp/v1/svgs/light/badge_success.svg"
                                        alt="Success badge"
                                        width={64}
                                        height={64}
                                    />

                                    <div className="flex flex-col justify-center items-start gap-[var(--vapor-size-space-100)]">
                                        <div className="flex flex-col items-start gap-[var(--vapor-size-space-025)] self-stretch">
                                            <Text typography="heading5" foreground="normal">
                                                출석체크
                                            </Text>
                                            <Text typography="body3" foreground="hint-darker">
                                                출석 체크하고 포인트를 획득하세요!
                                            </Text>
                                        </div>
                                        <div className="flex items-center gap-[var(--vapor-size-space-050)] self-stretch">
                                            <Text typography="subtitle1" foreground="secondary">
                                                4회
                                            </Text>
                                            <Text typography="subtitle1" foreground="hint">
                                                /
                                            </Text>
                                            <Text typography="subtitle1" foreground="hint">
                                                5회
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                                <Button size="lg" stretch>
                                    <AchievementIcon size="20" />
                                    <Text typography="subtitle1" foreground="accent">
                                        45 포인트 획득
                                    </Text>
                                </Button>
                            </Card.Body>
                        </Card.Root>
                        <Card.Root className="w-full">
                            <Card.Header>템플릿 리스트</Card.Header>
                            <Card.Body>
                                <ul className="flex flex-col w-full gap-[var(--vapor-size-space-200)]">
                                    {Array.from({ length: 4 }).map((_, index) => (
                                        <li
                                            key={index}
                                            className="flex pb-[var(--vapor-size-space-100)] items-center gap-[var(--vapor-size-space-100)] self-stretch border-b border-[var(--vapor-color-border-normal)]"
                                        >
                                            <Text typography="subtitle1" foreground="secondary">
                                                Template {index + 1}
                                            </Text>
                                            {index === 0 && (
                                                <Badge color="primary" size="sm">
                                                    <Text typography="subtitle2">기본</Text>
                                                </Badge>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </Card.Body>
                        </Card.Root>
                    </div>

                    {/* 우측 사이드 패널 */}
                    <div className="flex w-[371px] h-[848px] p-[var(--vapor-size-space-300)] flex-col items-end flex-shrink-0 bg-[var(--vapor-color-background-normal)] shadow-[0px_16px_32px_0px_rgba(0,0,0,0.20)]">
                        <div className="w-full flex flex-col gap-[var(--vapor-size-space-300)]">
                            <TextInput.Root
                                className="w-full relative"
                                size="lg"
                                placeholder="이름, 이메일로 검색"
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                            >
                                {/* Since the text input does not belong to any layer, remove !important once it is assigned to a layer. */}
                                <div className="absolute z-[1] h-full flex items-center justify-center ml-[var(--vapor-size-space-200)]">
                                    <SearchOutlineIcon
                                        size="20"
                                        color="var(--vapor-color-foreground-hint)"
                                    />
                                </div>
                                <TextInput.Field className="w-full !pl-[var(--vapor-size-space-500)]" />
                            </TextInput.Root>

                            <div className="w-full flex flex-col items-start gap-[var(--vapor-size-space-200)] self-stretch">
                                <div className="flex items-start gap-[var(--vapor-size-space-050)]">
                                    <Text typography="subtitle2" foreground="hint-darker">
                                        접속 중
                                    </Text>
                                    <Text typography="subtitle2" foreground="hint-darker">
                                        {filteredActiveUsers.filter((u) => u.online).length}
                                    </Text>
                                </div>
                                <UserList users={filteredActiveUsers} />
                            </div>
                            <div className="w-full flex flex-col items-start gap-[var(--vapor-size-space-200)] self-stretch">
                                <div className="w-full flex items-start gap-[var(--vapor-size-space-050)]">
                                    <Text typography="subtitle2" foreground="hint-darker">
                                        미접속
                                    </Text>
                                    <Text typography="subtitle2" foreground="hint-darker">
                                        {filteredUnActiveUsers.length}
                                    </Text>
                                </div>
                                <UserList users={filteredUnActiveUsers} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
